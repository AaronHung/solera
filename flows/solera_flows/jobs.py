from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Protocol
from uuid import uuid4

from easy_pi import TagSeries
from solera_api.analytics import CALCULATION_VERSION, summarize
from solera_api.data_hub import DataHubRepository
from solera_api.evidence import create_timeseries_evidence
from solera_api.industrial_contracts import IndustrialCaseRecord, ScenarioManifest
from solera_api.storage import FlowRepository, KnowledgeRepository, RetentionRepository


class RecordedConnector(Protocol):
    async def recorded(
        self,
        tag: str,
        *,
        start: datetime,
        end: datetime,
        max_points: int = 1000,
        boundary_type: int = 2,
    ) -> TagSeries: ...


async def run_nightly_aggregates(
    *,
    repository: FlowRepository,
    connector: RecordedConnector,
    tenant_id: str,
    tags: list[str],
    now: datetime | None = None,
    timezone: str = "Asia/Taipei",
) -> dict[str, object]:
    end = (now or datetime.now(UTC)).replace(minute=0, second=0, microsecond=0)
    if end.tzinfo is None:
        raise ValueError("nightly aggregate time must be timezone aware")
    start = end - timedelta(hours=24)
    run_id = f"flow-{uuid4()}"
    await repository.start(run_id, tenant_id, "nightly-aggregate")
    processed = 0
    failures: dict[str, str] = {}
    try:
        for tag in tags:
            try:
                series = await connector.recorded(
                    tag,
                    start=start,
                    end=end,
                    max_points=5000,
                )
                query_id = f"flow-query-{uuid4()}"
                evidence = create_timeseries_evidence(
                    tenant_id=tenant_id,
                    source_system="easy-pi",
                    series=series,
                    start=start,
                    end=end,
                    timezone=timezone,
                    query_id=query_id,
                    retrieved_at=end,
                    aggregation="24h-summary",
                )
                await repository.save_aggregate(
                    tenant_id=tenant_id,
                    tag=tag,
                    window_start=start,
                    window_end=end,
                    version=CALCULATION_VERSION,
                    summary=summarize(series).model_dump(by_alias=True, mode="json"),
                    evidence=evidence.model_dump(by_alias=True, mode="json"),
                )
                processed += 1
            except Exception as exc:
                failures[tag] = type(exc).__name__
        status = "completed" if not failures else "partial"
        metrics = {
            "requested": len(tags),
            "processed": processed,
            "failed": len(failures),
            "failures": failures,
            "windowStart": start.isoformat(),
            "windowEnd": end.isoformat(),
        }
        await repository.finish(run_id, status=status, metrics=metrics)
        return {"runId": run_id, "status": status, **metrics}
    except Exception:
        await repository.finish(
            run_id,
            status="failed",
            metrics={"requested": len(tags), "processed": processed},
            error_code="FLOW_INTERNAL_ERROR",
        )
        raise


async def run_trace_to_eval(
    *,
    repository: FlowRepository,
    tenant_id: str,
) -> dict[str, object]:
    run_id = f"flow-{uuid4()}"
    await repository.start(run_id, tenant_id, "trace-to-eval")
    try:
        created = await repository.export_feedback_to_evals(tenant_id)
        metrics = {"createdEvalCases": created}
        await repository.finish(run_id, status="completed", metrics=metrics)
        return {"runId": run_id, "status": "completed", **metrics}
    except Exception:
        await repository.finish(
            run_id,
            status="failed",
            metrics={},
            error_code="EVAL_EXPORT_ERROR",
        )
        raise


async def run_retention_cleanup(
    *,
    repository: RetentionRepository,
    tenant_id: str,
    now: datetime | None = None,
    trace_days: int = 30,
    audit_days: int = 365,
    aggregate_days: int = 90,
) -> dict[str, int]:
    return await repository.cleanup(
        tenant_id=tenant_id,
        now=now or datetime.now(UTC),
        trace_days=trace_days,
        audit_days=audit_days,
        aggregate_days=aggregate_days,
    )


LOOP1_FIXTURES = Path(__file__).resolve().parents[2] / "fixtures" / "loop1"


async def run_loop1_seed(
    *,
    repository: DataHubRepository,
    knowledge: KnowledgeRepository,
    manifest: ScenarioManifest,
    fixtures_path: Path = LOOP1_FIXTURES,
) -> dict[str, object]:
    documents_path = fixtures_path / "documents.json"
    cases_path = fixtures_path / "cases.json"
    documents = json.loads(documents_path.read_text())
    cases_payload = json.loads(cases_path.read_text())
    cases = [IndustrialCaseRecord.model_validate(payload) for payload in cases_payload]
    fixture_checksum = hashlib.sha256(
        documents_path.read_bytes() + cases_path.read_bytes()
    ).hexdigest()

    manifest_result = await repository.seed_manifest(manifest)
    chunks = 0
    for document in documents:
        chunks += await knowledge.ingest(
            tenant_id=manifest.tenant_id,
            document_id=document["documentId"],
            title=document["title"],
            content=document["content"],
            uri=document["uri"],
        )
    cases_created = await repository.save_cases(cases)

    links_created = 0
    for asset in manifest.assets:
        if asset.parent_id:
            links_created += int(
                await repository.link(
                    tenant_id=manifest.tenant_id,
                    source_kind="asset",
                    source_id=asset.asset_id,
                    relation="part-of",
                    target_kind="asset",
                    target_id=asset.parent_id,
                )
            )
    for tag in manifest.tags:
        links_created += int(
            await repository.link(
                tenant_id=manifest.tenant_id,
                source_kind="tag",
                source_id=tag.tag_id,
                relation="measures",
                target_kind="asset",
                target_id=tag.asset_id,
            )
        )
    for document in documents:
        for asset_id in document["assetIds"]:
            links_created += int(
                await repository.link(
                    tenant_id=manifest.tenant_id,
                    source_kind="document",
                    source_id=document["documentId"],
                    relation="describes",
                    target_kind="asset",
                    target_id=asset_id,
                )
            )
    for case in cases:
        for asset_id in case.asset_ids:
            links_created += int(
                await repository.link(
                    tenant_id=manifest.tenant_id,
                    source_kind="case",
                    source_id=case.case_id,
                    relation="involves",
                    target_kind="asset",
                    target_id=asset_id,
                )
            )
        for tag_id in case.tag_ids:
            links_created += int(
                await repository.link(
                    tenant_id=manifest.tenant_id,
                    source_kind="case",
                    source_id=case.case_id,
                    relation="uses-signal",
                    target_kind="tag",
                    target_id=tag_id,
                )
            )
        for document_id in case.document_ids:
            links_created += int(
                await repository.link(
                    tenant_id=manifest.tenant_id,
                    source_kind="case",
                    source_id=case.case_id,
                    relation="references",
                    target_kind="document",
                    target_id=document_id,
                )
            )

    metrics = {
        **manifest_result,
        "documentsIndexed": len(documents),
        "chunksIndexed": chunks,
        "casesCreated": cases_created,
        "linksCreated": links_created,
    }
    changed = await repository.complete_checkpoint(
        tenant_id=manifest.tenant_id,
        flow_key=f"loop1-seed:{manifest.scenario_id}:{manifest.manifest_version}",
        checksum=hashlib.sha256(
            f"{manifest_result['checksum']}:{fixture_checksum}".encode()
        ).hexdigest(),
        metrics=metrics,
    )
    return {"status": "completed", "changed": changed, **metrics}


async def run_loop1_replay(
    *,
    repository: DataHubRepository,
    engine,
    to_tick: int,
) -> dict[str, object]:
    if to_tick < 1:
        raise ValueError("LOOP-1 replay requires at least one tick")
    engine.reset()
    await repository.reset_run(
        engine.manifest.tenant_id,
        engine.run.run_id,
    )
    observations_created = 0
    alarms_created = 0
    for _ in range(to_tick):
        frame = engine.step()
        result = await repository.ingest_frame(frame)
        observations_created += result["observationsCreated"]
        alarms_created += result["alarmsCreated"]
    pulse = await repository.update_pulse(
        tenant_id=engine.manifest.tenant_id,
        connector_id="synthetic-pi",
        run_id=engine.run.run_id,
    )
    checksum = hashlib.sha256(engine.export_replay()).hexdigest()
    metrics = {
        "toTick": to_tick,
        "observationsCreated": observations_created,
        "alarmsCreated": alarms_created,
        "pulseStatus": pulse["status"],
    }
    changed = await repository.complete_checkpoint(
        tenant_id=engine.manifest.tenant_id,
        flow_key=f"loop1-replay:{engine.run.run_id}:{to_tick}",
        checksum=checksum,
        metrics=metrics,
    )
    return {
        "status": "completed",
        "changed": changed,
        "runId": engine.run.run_id,
        "pulse": pulse,
        **metrics,
    }
