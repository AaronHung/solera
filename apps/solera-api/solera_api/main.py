from __future__ import annotations

import logging
from asyncio import CancelledError
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from easy_pi import ConnectorError, ConnectorLimits, EasyPiConnector
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from loop1_simulator import Loop1ScenarioEngine
from solera_flows import run_loop1_replay, run_loop1_seed
from synthetic_pi import SyntheticPiConnector

from .agent import AgentInputError, ChatRequest, SoleraOrchestrator
from .api_models import (
    FeedbackRequest,
    KillSwitchRequest,
    KnowledgeDocumentRequest,
    Loop1ApprovalDecisionRequest,
    Loop1ControlRequest,
)
from .auth import PrincipalDependency
from .config import Settings, get_settings
from .contracts import AgentStreamEvent, PageContext, ViewSpec
from .data_hub import DataHubRepository
from .model_gateway import ModelGateway, create_model_gateway
from .observability import MetricsRegistry
from .oidc import OidcVerifier
from .policy import PolicyDenied, PolicyEngine
from .productization import (
    enforce_productization_gates,
    evaluate_productization_gates,
)
from .rate_limit import SlidingWindowRateLimiter
from .skills.loop1 import LOOP1_SKILLS, Loop1Investigator, Loop1ReadOnlyTools
from .storage import (
    AuditRepository,
    CanvasRepository,
    Database,
    FeedbackRepository,
    FlowRepository,
    KillSwitchRepository,
    KnowledgeRepository,
    TraceRepository,
)

logger = logging.getLogger("solera.api")


def _error_event(trace_id: str, code: str, message: str) -> AgentStreamEvent:
    return AgentStreamEvent(
        event_id=f"evt-{uuid4()}",
        trace_id=trace_id,
        type="error",
        occurred_at=datetime.now(UTC),
        payload={"code": code, "message": message},
    )


def _trace_safe_event(event: AgentStreamEvent) -> dict[str, Any]:
    payload = dict(event.payload)
    if event.type == "tool-result":
        payload.pop("series", None)
    return {
        **event.model_dump(by_alias=True, mode="json"),
        "payload": payload,
    }


def _require_role(roles: frozenset[str], allowed: set[str]) -> None:
    if not roles.intersection(allowed):
        raise PolicyDenied("ROLE_DENIED", "User role cannot access this operation")


def _cors_origins(settings: Settings) -> list[str]:
    origins = {
        "http://localhost",
        "http://localhost:5173",
        "http://127.0.0.1",
    }
    for domain in settings.allowed_domains:
        if domain == "easypi.iiotfab.com":
            origins.add("https://easypi.iiotfab.com")
        elif domain == "pivision.iiotfab.com":
            origins.update(
                {
                    "https://pivision.iiotfab.com",
                    "https://pivision.iiotfab.com:8443",
                }
            )
        elif domain == "203.146.71.23":
            origins.update(
                {
                    "http://203.146.71.23",
                    "http://203.146.71.23:8080",
                }
            )
    return sorted(origins)


def create_app(
    *,
    settings: Settings | None = None,
    connector: Any | None = None,
    model_gateway: ModelGateway | None = None,
    database: Database | None = None,
    oidc_verifier: OidcVerifier | None = None,
) -> FastAPI:
    resolved_settings = settings or get_settings()
    productization_gates = evaluate_productization_gates(resolved_settings)
    enforce_productization_gates(productization_gates)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        runtime_connector = connector or EasyPiConnector(
            base_url=resolved_settings.easy_pi_base_url,
            setting_name=resolved_settings.easy_pi_setting_name,
            timezone=resolved_settings.easy_pi_timezone,
            limits=ConnectorLimits(
                max_range_seconds=resolved_settings.max_range_seconds,
                max_points=resolved_settings.max_points,
                timeout_ms=resolved_settings.easy_pi_timeout_ms,
            ),
        )
        runtime_model = model_gateway or create_model_gateway(resolved_settings)
        runtime_oidc = oidc_verifier or OidcVerifier(resolved_settings)
        runtime_database = database or Database(resolved_settings.database_url)
        await runtime_database.initialize()
        policy = PolicyEngine(resolved_settings)
        metrics = MetricsRegistry()
        kill_switches = KillSwitchRepository(runtime_database)
        for scope_type, scope_id in await kill_switches.enabled():
            policy.set_switch(scope_type, scope_id, True)
        app.state.settings = resolved_settings
        app.state.connector = runtime_connector
        app.state.model_gateway = runtime_model
        app.state.oidc_verifier = runtime_oidc
        app.state.database = runtime_database
        app.state.canvases = CanvasRepository(runtime_database)
        app.state.audit = AuditRepository(runtime_database)
        app.state.traces = TraceRepository(runtime_database)
        app.state.feedback = FeedbackRepository(runtime_database)
        app.state.kill_switches = kill_switches
        app.state.knowledge = KnowledgeRepository(runtime_database)
        app.state.flows = FlowRepository(runtime_database)
        app.state.data_hub = DataHubRepository(runtime_database)
        app.state.loop1_productization_gates = productization_gates
        app.state.loop1_investigator = Loop1Investigator(
            Loop1ReadOnlyTools(
                data_hub=app.state.data_hub,
                knowledge=app.state.knowledge,
            )
        )
        app.state.loop1_engine = None
        app.state.loop1_connector = None
        if resolved_settings.loop1_enabled:
            app.state.loop1_engine = Loop1ScenarioEngine()
            app.state.loop1_connector = SyntheticPiConnector(
                engine=app.state.loop1_engine
            )
            await run_loop1_seed(
                repository=app.state.data_hub,
                knowledge=app.state.knowledge,
                manifest=app.state.loop1_engine.manifest,
            )
            await run_loop1_replay(
                repository=app.state.data_hub,
                engine=app.state.loop1_engine,
                to_tick=resolved_settings.loop1_start_tick,
            )
        app.state.metrics = metrics
        app.state.rate_limiter = SlidingWindowRateLimiter(
            resolved_settings.tenant_requests_per_minute
        )
        app.state.policy = policy
        app.state.orchestrator = SoleraOrchestrator(
            settings=resolved_settings,
            connector=runtime_connector,
            policy=policy,
            model_gateway=runtime_model,
            knowledge=app.state.knowledge,
            metrics=metrics,
        )
        yield
        close_model = getattr(runtime_model, "close", None)
        if close_model:
            await close_model()
        await runtime_oidc.close()
        close_connector = getattr(runtime_connector, "close", None)
        if close_connector:
            await close_connector()
        await runtime_database.close()

    app = FastAPI(
        title="Solera API",
        version="0.1.0",
        description="Read-only industrial Agent control plane",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_cors_origins(resolved_settings),
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Solera-Trace-Id"],
    )

    @app.exception_handler(PolicyDenied)
    async def policy_denied_handler(
        _request: Request,
        exc: PolicyDenied,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=403,
            content={"detail": {"code": exc.code, "message": exc.message}},
        )

    @app.get("/health")
    async def health() -> dict[str, object]:
        return {
            "status": "ok",
            "version": "0.1.0",
            "contractVersion": "0.1",
            "writeTools": 0,
        }

    @app.get("/ready")
    async def ready() -> dict[str, object]:
        await app.state.database.ping()
        return {"status": "ready", "database": "ok"}

    @app.get(f"{resolved_settings.api_prefix}/capabilities")
    async def capabilities(
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        return {
            "tenantId": principal.tenant_id,
            "tools": app.state.policy.capability_snapshot(),
            "connector": app.state.connector.capabilities.model_dump(),
        }

    @app.post(f"{resolved_settings.api_prefix}/context/validate")
    async def validate_context(
        context: PageContext,
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        app.state.policy.validate_page_context(principal, context)
        needs_confirmation = any(
            candidate.confidence < 0.85 and not candidate.confirmed
            for candidate in context.candidate_assets
        )
        return {
            "valid": True,
            "tenantId": principal.tenant_id,
            "needsAssetConfirmation": needs_confirmation,
        }

    @app.post(f"{resolved_settings.api_prefix}/agent/chat")
    async def chat(
        request: ChatRequest,
        principal: PrincipalDependency,
    ) -> StreamingResponse:
        trace_id = f"trace-{uuid4()}"
        allowed, retry_after = app.state.rate_limiter.allow(principal.tenant_id)
        if not allowed:
            raise HTTPException(
                status_code=429,
                detail={
                    "code": "TENANT_RATE_LIMIT",
                    "message": "Tenant Agent request limit was reached",
                },
                headers={"Retry-After": str(retry_after)},
            )
        await app.state.traces.start(
            trace_id=trace_id,
            tenant_id=principal.tenant_id,
            actor_id=principal.actor_id,
            question=request.question,
        )

        async def stream_events() -> AsyncIterator[bytes]:
            trace_events: list[dict[str, Any]] = []
            trace_status = "completed"
            try:
                async for event in app.state.orchestrator.stream(
                    principal=principal,
                    request=request,
                    trace_id=trace_id,
                ):
                    trace_events.append(_trace_safe_event(event))
                    if event.type == "tool-start":
                        await app.state.audit.record(
                            event_id=f"audit-{uuid4()}",
                            tenant_id=principal.tenant_id,
                            actor_id=principal.actor_id,
                            action=f"tool.{event.payload.get('tool', 'unknown')}",
                            outcome="allowed",
                            trace_id=trace_id,
                            resource_type="query",
                            resource_id=str(event.payload.get("queryId", "")),
                            metadata={"tag": str(event.payload.get("tag", ""))},
                        )
                    yield (event.model_dump_json(by_alias=True) + "\n").encode()
            except (AgentInputError, PolicyDenied) as exc:
                trace_status = "denied"
                event = _error_event(trace_id, exc.code, exc.message)
                trace_events.append(_trace_safe_event(event))
                await app.state.audit.record(
                    event_id=f"audit-{uuid4()}",
                    tenant_id=principal.tenant_id,
                    actor_id=principal.actor_id,
                    action="agent.chat",
                    outcome="denied",
                    reason_code=exc.code,
                    trace_id=trace_id,
                )
                yield (event.model_dump_json(by_alias=True) + "\n").encode()
            except ConnectorError as exc:
                trace_status = "failed"
                event = _error_event(trace_id, "CONNECTOR_ERROR", str(exc))
                trace_events.append(_trace_safe_event(event))
                await app.state.audit.record(
                    event_id=f"audit-{uuid4()}",
                    tenant_id=principal.tenant_id,
                    actor_id=principal.actor_id,
                    action="connector.easy-pi",
                    outcome="failed",
                    reason_code="CONNECTOR_ERROR",
                    trace_id=trace_id,
                )
                yield (event.model_dump_json(by_alias=True) + "\n").encode()
            except CancelledError:
                trace_status = "cancelled"
                raise
            except Exception:
                trace_status = "failed"
                logger.exception("Unhandled Agent error", extra={"traceId": trace_id})
                event = _error_event(
                    trace_id,
                    "INTERNAL_ERROR",
                    "The analysis could not be completed safely",
                )
                trace_events.append(_trace_safe_event(event))
                yield (event.model_dump_json(by_alias=True) + "\n").encode()
            finally:
                await app.state.traces.finish(
                    trace_id=trace_id,
                    status=trace_status,
                    events=trace_events,
                )

        return StreamingResponse(
            stream_events(),
            media_type="application/x-ndjson",
            headers={
                "Cache-Control": "no-store",
                "X-Content-Type-Options": "nosniff",
                "X-Solera-Trace-Id": trace_id,
            },
        )

    @app.post(f"{resolved_settings.api_prefix}/canvases")
    async def save_canvas(
        spec: ViewSpec,
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        if spec.tenant_id != principal.tenant_id:
            raise PolicyDenied("TENANT_MISMATCH", "Canvas belongs to another tenant")
        app.state.policy.authorize_tool(
            principal=principal,
            tool_name="create_viewspec",
            points=len(spec.widgets),
        )
        saved = await app.state.canvases.save(spec)
        return saved.model_dump(by_alias=True, mode="json")

    @app.get(f"{resolved_settings.api_prefix}/canvases")
    async def list_canvases(
        principal: PrincipalDependency,
    ) -> list[dict[str, object]]:
        items = await app.state.canvases.list(principal.tenant_id)
        return [item.model_dump(by_alias=True, mode="json") for item in items]

    @app.get(f"{resolved_settings.api_prefix}/canvases/{{view_id}}")
    async def get_canvas(
        view_id: str,
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        item = await app.state.canvases.get(principal.tenant_id, view_id)
        if item is None:
            raise HTTPException(
                status_code=404,
                detail={"code": "CANVAS_NOT_FOUND", "message": "Canvas was not found"},
            )
        return item.model_dump(by_alias=True, mode="json")

    @app.get(f"{resolved_settings.api_prefix}/traces/{{trace_id}}")
    async def get_trace(
        trace_id: str,
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        item = await app.state.traces.get(principal.tenant_id, trace_id)
        if item is None:
            raise HTTPException(
                status_code=404,
                detail={"code": "TRACE_NOT_FOUND", "message": "Trace was not found"},
            )
        return item

    @app.get(f"{resolved_settings.api_prefix}/audit")
    async def list_audit(
        principal: PrincipalDependency,
        limit: int = Query(default=100, ge=1, le=500),
    ) -> list[dict[str, object]]:
        _require_role(principal.roles, {"admin", "auditor"})
        return await app.state.audit.list(principal.tenant_id, limit)

    @app.get(f"{resolved_settings.api_prefix}/operations/metrics")
    async def operations_metrics(
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        _require_role(principal.roles, {"admin", "auditor"})
        return {
            "tenantId": principal.tenant_id,
            "processScope": True,
            **app.state.metrics.snapshot(),
        }

    @app.post(f"{resolved_settings.api_prefix}/feedback")
    async def add_feedback(
        request: FeedbackRequest,
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        feedback_id = f"feedback-{uuid4()}"
        try:
            await app.state.feedback.add(
                feedback_id=feedback_id,
                tenant_id=principal.tenant_id,
                actor_id=principal.actor_id,
                trace_id=request.trace_id,
                rating=request.rating,
                comment=request.comment,
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=404,
                detail={"code": "TRACE_NOT_FOUND", "message": str(exc)},
            ) from exc
        return {"feedbackId": feedback_id, "accepted": True}

    @app.put(f"{resolved_settings.api_prefix}/admin/kill-switches/{{scope_type}}/{{scope_id}}")
    async def set_kill_switch(
        scope_type: str,
        scope_id: str,
        request: KillSwitchRequest,
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        _require_role(principal.roles, {"admin"})
        try:
            app.state.policy.set_switch(scope_type, scope_id, request.enabled)
        except ValueError as exc:
            raise HTTPException(
                status_code=422,
                detail={"code": "INVALID_SWITCH_SCOPE", "message": str(exc)},
            ) from exc
        await app.state.kill_switches.set(scope_type, scope_id, request.enabled)
        await app.state.audit.record(
            event_id=f"audit-{uuid4()}",
            tenant_id=principal.tenant_id,
            actor_id=principal.actor_id,
            action="kill-switch.set",
            outcome="allowed",
            trace_id=f"admin-{uuid4()}",
            resource_type=scope_type,
            resource_id=scope_id,
            metadata={"enabled": request.enabled},
        )
        return {
            "scopeType": scope_type,
            "scopeId": scope_id,
            "enabled": request.enabled,
        }

    @app.get(f"{resolved_settings.api_prefix}/admin/kill-switches")
    async def list_kill_switches(
        principal: PrincipalDependency,
    ) -> list[dict[str, object]]:
        _require_role(principal.roles, {"admin", "auditor"})
        return [
            {"scopeType": scope_type, "scopeId": scope_id, "enabled": True}
            for scope_type, scope_id in await app.state.kill_switches.enabled()
        ]

    @app.post(f"{resolved_settings.api_prefix}/admin/knowledge/documents")
    async def ingest_knowledge_document(
        request: KnowledgeDocumentRequest,
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        _require_role(principal.roles, {"admin", "knowledge-admin"})
        chunks = await app.state.knowledge.ingest(
            tenant_id=principal.tenant_id,
            document_id=request.document_id,
            title=request.title,
            content=request.content,
            uri=request.uri,
        )
        return {"documentId": request.document_id, "chunks": chunks}

    @app.get(f"{resolved_settings.api_prefix}/knowledge/search")
    async def search_knowledge(
        principal: PrincipalDependency,
        q: str = Query(min_length=2, max_length=500),
        limit: int = Query(default=5, ge=1, le=10),
    ) -> list[dict[str, object]]:
        app.state.policy.authorize_tool(
            principal=principal,
            tool_name="search_asset_knowledge",
            points=limit,
        )
        hits = await app.state.knowledge.search(principal.tenant_id, q, limit)
        return [
            {
                "documentId": item.document_id,
                "title": item.title,
                "section": item.section,
                "uri": item.uri,
                "snippet": item.text[:600],
                "score": item.score,
                "retrievalVersion": "lexical-retrieval@0.1.0",
            }
            for item in hits
        ]

    @app.get(f"{resolved_settings.api_prefix}/loop1/catalog")
    async def loop1_catalog(
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        engine = app.state.loop1_engine
        if engine is None:
            raise HTTPException(status_code=404, detail={"code": "LOOP1_DISABLED"})
        if principal.tenant_id != engine.manifest.tenant_id:
            raise HTTPException(status_code=404, detail={"code": "LOOP1_NOT_FOUND"})
        return {
            "synthetic": True,
            "manifest": engine.manifest.model_dump(by_alias=True, mode="json"),
            "truthDisclosure": {
                "claim": "Synthetic Agent validation environment",
                "notA": "customer plant Digital Twin or safety system",
            },
        }

    @app.get(f"{resolved_settings.api_prefix}/loop1/productization-gates")
    async def loop1_productization_gate_report(
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        if app.state.loop1_engine is None or principal.tenant_id != "tenant-demo":
            raise HTTPException(status_code=404, detail={"code": "LOOP1_NOT_FOUND"})
        return app.state.loop1_productization_gates.model_dump(
            by_alias=True,
            mode="json",
        )

    @app.get(f"{resolved_settings.api_prefix}/loop1/snapshot")
    async def loop1_snapshot(
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        engine = app.state.loop1_engine
        if engine is None or principal.tenant_id != "tenant-demo":
            raise HTTPException(status_code=404, detail={"code": "LOOP1_NOT_FOUND"})
        snapshot = await app.state.data_hub.snapshot(
            principal.tenant_id,
            engine.run.run_id,
        )
        if snapshot is None:
            raise HTTPException(status_code=404, detail={"code": "LOOP1_RUN_NOT_FOUND"})
        snapshot["pulse"] = await app.state.data_hub.update_pulse(
            tenant_id=principal.tenant_id,
            connector_id="synthetic-pi",
            run_id=engine.run.run_id,
        )
        return snapshot

    @app.post(f"{resolved_settings.api_prefix}/loop1/control")
    async def loop1_control(
        control: Loop1ControlRequest,
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        engine = app.state.loop1_engine
        if engine is None or principal.tenant_id != "tenant-demo":
            raise HTTPException(status_code=404, detail={"code": "LOOP1_NOT_FOUND"})
        _require_role(principal.roles, {"admin", "engineer", "operator", "viewer"})
        if control.action == "pause":
            engine.pause()
            await app.state.data_hub.ingest_frame(engine.step(0))
        elif control.action == "resume":
            engine.resume()
            await app.state.data_hub.ingest_frame(engine.step(0))
        elif control.action == "reset":
            await app.state.data_hub.reset_run(
                principal.tenant_id,
                engine.run.run_id,
            )
            await app.state.data_hub.ingest_frame(engine.reset())
        elif control.action in {"jump-to-fault", "replay"}:
            to_tick = control.to_tick
            if control.action == "jump-to-fault":
                to_tick = min(fault.inject_at_tick for fault in engine.manifest.faults)
            if to_tick is None:
                raise HTTPException(
                    status_code=422,
                    detail={"code": "LOOP1_REPLAY_TICK_REQUIRED"},
                )
            await run_loop1_replay(
                repository=app.state.data_hub,
                engine=engine,
                to_tick=to_tick,
            )
        else:
            for _ in range(control.count):
                await app.state.data_hub.ingest_frame(engine.step())
        snapshot = await app.state.data_hub.snapshot(
            principal.tenant_id,
            engine.run.run_id,
        )
        return snapshot or {
            "synthetic": True,
            "run": engine.run.model_dump(by_alias=True, mode="json"),
            "observations": [],
            "alarms": [],
        }

    @app.get(f"{resolved_settings.api_prefix}/loop1/skills")
    async def loop1_skills(
        principal: PrincipalDependency,
    ) -> list[dict[str, object]]:
        if app.state.loop1_engine is None or principal.tenant_id != "tenant-demo":
            raise HTTPException(status_code=404, detail={"code": "LOOP1_NOT_FOUND"})
        return [
            skill.model_dump(by_alias=True, mode="json") for skill in LOOP1_SKILLS
        ]

    @app.post(f"{resolved_settings.api_prefix}/loop1/investigate")
    async def loop1_investigate(
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        engine = app.state.loop1_engine
        if engine is None or principal.tenant_id != "tenant-demo":
            raise HTTPException(status_code=404, detail={"code": "LOOP1_NOT_FOUND"})
        result = await app.state.loop1_investigator.investigate(
            tenant_id=principal.tenant_id,
            run_id=engine.run.run_id,
        )
        return result.model_dump(by_alias=True, mode="json")

    @app.post(f"{resolved_settings.api_prefix}/loop1/approvals")
    async def loop1_request_approval(
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        engine = app.state.loop1_engine
        if engine is None or principal.tenant_id != "tenant-demo":
            raise HTTPException(status_code=404, detail={"code": "LOOP1_NOT_FOUND"})
        _require_role(principal.roles, {"admin", "engineer", "operator", "supervisor"})
        investigation = await app.state.loop1_investigator.investigate(
            tenant_id=principal.tenant_id,
            run_id=engine.run.run_id,
        )
        if investigation.action_draft is None:
            raise HTTPException(
                status_code=409,
                detail={"code": "LOOP1_ACTION_NOT_SUPPORTED"},
            )
        approval_id = f"approval-{investigation.investigation_id}"
        approval = await app.state.data_hub.request_approval(
            approval_id=approval_id,
            tenant_id=principal.tenant_id,
            run_id=engine.run.run_id,
            action_type=investigation.action_draft.action_type,
            requested_by=principal.actor_id,
            draft=investigation.action_draft.model_dump(
                by_alias=True,
                mode="json",
            ),
        )
        await app.state.audit.record(
            event_id=f"audit-{uuid4()}",
            tenant_id=principal.tenant_id,
            actor_id=principal.actor_id,
            action="loop1.approval.request",
            outcome="requested",
            trace_id=investigation.investigation_id,
            resource_type="approval",
            resource_id=approval_id,
            metadata={"synthetic": True, "execution": "draft-only"},
        )
        return approval

    @app.post(
        f"{resolved_settings.api_prefix}/loop1/approvals/{{approval_id}}/decision"
    )
    async def loop1_decide_approval(
        approval_id: str,
        decision: Loop1ApprovalDecisionRequest,
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        if app.state.loop1_engine is None or principal.tenant_id != "tenant-demo":
            raise HTTPException(status_code=404, detail={"code": "LOOP1_NOT_FOUND"})
        _require_role(principal.roles, {"admin", "operator", "supervisor"})
        try:
            approval = await app.state.data_hub.decide_approval(
                approval_id=approval_id,
                tenant_id=principal.tenant_id,
                decided_by=principal.actor_id,
                decision=decision.decision,
                rationale=decision.rationale,
            )
        except KeyError as error:
            raise HTTPException(
                status_code=404,
                detail={"code": "LOOP1_APPROVAL_NOT_FOUND"},
            ) from error
        except ValueError as error:
            raise HTTPException(
                status_code=409,
                detail={"code": "LOOP1_APPROVAL_ALREADY_DECIDED"},
            ) from error
        await app.state.audit.record(
            event_id=f"audit-{uuid4()}",
            tenant_id=principal.tenant_id,
            actor_id=principal.actor_id,
            action="loop1.approval.decision",
            outcome=decision.decision,
            trace_id=approval_id,
            resource_type="approval",
            resource_id=approval_id,
            metadata={
                "synthetic": True,
                "execution": "draft-only",
                "externalWrite": False,
            },
        )
        return approval

    @app.get(f"{resolved_settings.api_prefix}/loop1/pulse")
    async def loop1_pulse(
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        engine = app.state.loop1_engine
        if engine is None or principal.tenant_id != "tenant-demo":
            raise HTTPException(status_code=404, detail={"code": "LOOP1_NOT_FOUND"})
        return await app.state.data_hub.update_pulse(
            tenant_id=principal.tenant_id,
            connector_id="synthetic-pi",
            run_id=engine.run.run_id,
        )

    @app.get(
        f"{resolved_settings.api_prefix}/loop1/thread/{{entity_kind}}/{{entity_id}}"
    )
    async def loop1_thread(
        entity_kind: str,
        entity_id: str,
        principal: PrincipalDependency,
    ) -> dict[str, object]:
        if app.state.loop1_engine is None or principal.tenant_id != "tenant-demo":
            raise HTTPException(status_code=404, detail={"code": "LOOP1_NOT_FOUND"})
        if entity_kind not in {"asset", "tag", "document", "case", "alarm"}:
            raise HTTPException(status_code=422, detail={"code": "INVALID_ENTITY_KIND"})
        edges = await app.state.data_hub.thread(
            principal.tenant_id,
            entity_kind,
            entity_id,
        )
        return {
            "synthetic": True,
            "entity": {"kind": entity_kind, "id": entity_id},
            "edges": edges,
        }

    return app


app = create_app()
