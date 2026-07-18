from __future__ import annotations

import re
from collections.abc import AsyncIterator
from datetime import UTC, datetime
from time import perf_counter
from typing import Protocol
from uuid import uuid4

from easy_pi import CurrentValue, TagSeries
from pydantic import Field

from .analytics import compare, points_for_transport, summarize
from .auth import Principal
from .canvas import compose_analysis_view
from .config import Settings
from .contracts import (
    AgentStreamEvent,
    AnalysisResult,
    ContractModel,
    PageContext,
)
from .evidence import (
    create_current_evidence,
    create_document_evidence,
    create_timeseries_evidence,
    current_as_series,
)
from .model_gateway import ModelGateway, ModelGatewayError
from .observability import MetricsRegistry
from .policy import PolicyEngine
from .storage import KnowledgeHit


class AgentInputError(RuntimeError):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


class IndustrialConnector(Protocol):
    async def current(self, tag: str) -> CurrentValue: ...

    async def recorded(
        self,
        tag: str,
        *,
        start: datetime,
        end: datetime,
        max_points: int = 1000,
        boundary_type: int = 2,
    ) -> TagSeries: ...


class KnowledgeSearch(Protocol):
    async def search(
        self,
        tenant_id: str,
        query: str,
        limit: int = 5,
    ) -> list[KnowledgeHit]: ...


class ChatRequest(ContractModel):
    question: str = Field(min_length=1, max_length=2000)
    page_context: PageContext
    tags: list[str] = Field(default_factory=list, max_length=4)
    max_points: int = Field(default=1000, ge=1)
    add_to_canvas: bool = False


def _event(trace_id: str, event_type: str, payload: dict[str, object]) -> AgentStreamEvent:
    return AgentStreamEvent(
        event_id=f"evt-{uuid4()}",
        trace_id=trace_id,
        type=event_type,  # type: ignore[arg-type]
        occurred_at=datetime.now(UTC),
        payload=payload,
    )


def _contains_cjk(value: str) -> bool:
    return bool(re.search(r"[\u3400-\u9fff]", value))


class SoleraOrchestrator:
    def __init__(
        self,
        *,
        settings: Settings,
        connector: IndustrialConnector,
        policy: PolicyEngine,
        model_gateway: ModelGateway,
        knowledge: KnowledgeSearch | None = None,
        metrics: MetricsRegistry | None = None,
    ) -> None:
        self.settings = settings
        self.connector = connector
        self.policy = policy
        self.model_gateway = model_gateway
        self.knowledge = knowledge
        self.metrics = metrics or MetricsRegistry()

    async def stream(
        self,
        *,
        principal: Principal,
        request: ChatRequest,
        trace_id: str | None = None,
    ) -> AsyncIterator[AgentStreamEvent]:
        trace_id = trace_id or f"trace-{uuid4()}"
        self.policy.validate_page_context(principal, request.page_context)
        yield _event(
            trace_id,
            "context",
            {
                "page": request.page_context.page.model_dump(by_alias=True, mode="json"),
                "candidateAssets": [
                    candidate.model_dump(by_alias=True)
                    for candidate in request.page_context.candidate_assets
                ],
                "timeContext": request.page_context.time_context.model_dump(
                    by_alias=True, mode="json"
                ),
            },
        )

        tags = self._resolve_tags(request)
        current_intent = self._is_current_intent(request.question) and len(tags) == 1
        series: list[TagSeries] = []
        evidence = []
        retrieved_at = datetime.now(UTC)

        for tag in tags:
            query_id = f"qry-{uuid4()}"
            connector_started = perf_counter()
            try:
                if current_intent:
                    manifest = self.policy.authorize_tool(
                        principal=principal,
                        tool_name="query_current_value",
                        points=1,
                    )
                    yield _event(
                        trace_id,
                        "tool-start",
                        {"tool": manifest.name, "queryId": query_id, "tag": tag},
                    )
                    current = await self.connector.current(tag)
                    tag_series = current_as_series(current)
                    item_evidence = create_current_evidence(
                        tenant_id=principal.tenant_id,
                        source_system="easy-pi",
                        current=current,
                        timezone=self.settings.easy_pi_timezone,
                        query_id=query_id,
                        retrieved_at=retrieved_at,
                        asset_id=self._confirmed_asset_id(request.page_context),
                    )
                else:
                    time_context = request.page_context.time_context
                    manifest = self.policy.authorize_tool(
                        principal=principal,
                        tool_name="query_timeseries",
                        range_start=time_context.start,
                        range_end=time_context.end,
                        points=request.max_points,
                    )
                    yield _event(
                        trace_id,
                        "tool-start",
                        {
                            "tool": manifest.name,
                            "queryId": query_id,
                            "tag": tag,
                            "start": time_context.start.isoformat(),
                            "end": time_context.end.isoformat(),
                        },
                    )
                    tag_series = await self.connector.recorded(
                        tag,
                        start=time_context.start,
                        end=time_context.end,
                        max_points=request.max_points,
                    )
                    item_evidence = create_timeseries_evidence(
                        tenant_id=principal.tenant_id,
                        source_system="easy-pi",
                        series=tag_series,
                        start=time_context.start,
                        end=time_context.end,
                        timezone=time_context.timezone,
                        query_id=query_id,
                        retrieved_at=retrieved_at,
                        asset_id=self._confirmed_asset_id(request.page_context),
                    )
            finally:
                connector_duration_ms = (perf_counter() - connector_started) * 1000
                self.metrics.record_latency("connector.easy-pi", connector_duration_ms)
            series.append(tag_series)
            evidence.append(item_evidence)
            yield _event(
                trace_id,
                "tool-result",
                {
                    "tool": manifest.name,
                    "queryId": query_id,
                    "tag": tag,
                    "summary": summarize(tag_series).model_dump(by_alias=True, mode="json"),
                    "series": points_for_transport(tag_series),
                    "durationMs": round(connector_duration_ms, 2),
                },
            )
            yield _event(
                trace_id,
                "evidence",
                {"evidence": item_evidence.model_dump(by_alias=True, mode="json")},
            )

        if self.knowledge and self._is_knowledge_intent(request.question):
            knowledge_manifest = self.policy.authorize_tool(
                principal=principal,
                tool_name="search_asset_knowledge",
                points=5,
            )
            knowledge_query_id = f"qry-{uuid4()}"
            yield _event(
                trace_id,
                "tool-start",
                {
                    "tool": knowledge_manifest.name,
                    "queryId": knowledge_query_id,
                },
            )
            hits = await self.knowledge.search(
                principal.tenant_id,
                request.question,
                limit=5,
            )
            citations = []
            for hit in hits:
                item_evidence = create_document_evidence(
                    tenant_id=principal.tenant_id,
                    document_id=hit.document_id,
                    title=hit.title,
                    section=hit.section,
                    uri=hit.uri,
                    query_id=knowledge_query_id,
                    retrieved_at=retrieved_at,
                )
                evidence.append(item_evidence)
                citations.append(
                    {
                        "documentId": hit.document_id,
                        "title": hit.title,
                        "section": hit.section,
                        "uri": hit.uri,
                        "score": hit.score,
                    }
                )
                yield _event(
                    trace_id,
                    "evidence",
                    {"evidence": item_evidence.model_dump(by_alias=True, mode="json")},
                )
            yield _event(
                trace_id,
                "tool-result",
                {
                    "tool": knowledge_manifest.name,
                    "queryId": knowledge_query_id,
                    "citations": citations,
                },
            )

        analytics_started = perf_counter()
        analysis = self._build_analysis(principal, series, evidence)
        self.metrics.record_latency(
            "analytics",
            (perf_counter() - analytics_started) * 1000,
        )
        explanation = await self._explain(request.question, analysis)
        yield _event(trace_id, "text-delta", {"text": explanation})
        view_spec = compose_analysis_view(
            analysis=analysis,
            series=series,
            context=request.page_context,
        )
        yield _event(
            trace_id,
            "view-spec",
            {"viewSpec": view_spec.model_dump(by_alias=True, mode="json")},
        )
        yield _event(
            trace_id,
            "complete",
            {
                "analysis": analysis.model_dump(by_alias=True, mode="json"),
                "canvasAvailable": True,
                "requestedCanvas": request.add_to_canvas,
                "viewId": view_spec.view_id,
            },
        )

    def _resolve_tags(self, request: ChatRequest) -> list[str]:
        allowed = {tag.upper() for tag in self.settings.allowed_tags}
        explicit = [tag.upper() for tag in request.tags if tag.upper() in allowed]
        from_question = [
            tag
            for tag in allowed
            if re.search(
                rf"(?<![A-Za-z0-9_.:-]){re.escape(tag)}(?![A-Za-z0-9_.:-])", request.question, re.I
            )
        ]
        from_context = [
            candidate.asset_id.removeprefix("pi-tag:").upper()
            for candidate in request.page_context.candidate_assets
            if candidate.asset_id.startswith("pi-tag:")
            and candidate.asset_id.removeprefix("pi-tag:").upper() in allowed
        ]
        resolved = list(dict.fromkeys([*explicit, *from_question, *from_context]))
        if not resolved:
            raise AgentInputError(
                "TAG_REQUIRED",
                "Select or name an approved PI Tag before running an analysis",
            )
        return resolved[:4]

    @staticmethod
    def _is_current_intent(question: str) -> bool:
        return bool(re.search(r"\b(current|latest|now)\b|現在|目前|當前|最新", question, re.I))

    @staticmethod
    def _is_knowledge_intent(question: str) -> bool:
        return bool(
            re.search(
                r"\b(manual|sop|failure|maintenance|document)\b|手冊|故障|維修|文件|程序",
                question,
                re.I,
            )
        )

    @staticmethod
    def _confirmed_asset_id(context: PageContext) -> str | None:
        confirmed = next((asset for asset in context.candidate_assets if asset.confirmed), None)
        return confirmed.asset_id if confirmed else None

    def _build_analysis(
        self,
        principal: Principal,
        series: list[TagSeries],
        evidence: list,
    ) -> AnalysisResult:
        summaries = [summarize(item) for item in series]
        comparison = None
        kind = "summary"
        if len(series) >= 2:
            self.policy.authorize_tool(
                principal=principal,
                tool_name="compare_series",
                points=sum(len(item.points) for item in series),
            )
            comparison = compare(series[0], series[1])
            kind = "comparison"
        elif len(series) == 1 and len(series[0].points) == 1:
            kind = "current"
        warnings = [warning for item in evidence for warning in item.data_quality.warnings]
        return AnalysisResult(
            analysis_id=f"analysis-{uuid4()}",
            tenant_id=principal.tenant_id,
            kind=kind,
            summaries=summaries,
            comparison=comparison,
            evidence=evidence,
            warnings=list(dict.fromkeys(warnings)),
        )

    async def _explain(self, question: str, analysis: AnalysisResult) -> str:
        payload = analysis.model_dump(by_alias=True, mode="json")
        if not self.policy.model_allowed(self.settings.model_name):
            return self._deterministic_explanation(question, analysis)
        model_started = perf_counter()
        try:
            generated = await self.model_gateway.explain(
                question=question,
                analysis_payload=payload,
            )
        except ModelGatewayError:
            generated = None
        finally:
            self.metrics.record_latency("model", (perf_counter() - model_started) * 1000)
        if generated:
            self.metrics.record_model_usage(
                input_tokens=generated.input_tokens,
                output_tokens=generated.output_tokens,
                estimated_cost_usd=generated.estimated_cost_usd,
            )
            return generated.text
        return self._deterministic_explanation(question, analysis)

    @staticmethod
    def _deterministic_explanation(question: str, analysis: AnalysisResult) -> str:
        chinese = _contains_cjk(question)
        if chinese:
            lines = ["結論（deterministic analytics）："]
            for summary in analysis.summaries:
                if summary.count == 0:
                    lines.append(f"- {summary.tag}：沒有有效數值。")
                else:
                    lines.append(
                        f"- {summary.tag}：{summary.count} 點，平均 {summary.average:.4g}，"
                        f"最小 {summary.min:.4g}，最大 {summary.max:.4g}。"
                    )
            if analysis.comparison and analysis.comparison.mean_difference is not None:
                lines.append(
                    f"- 平均差（{analysis.comparison.left_tag} − "
                    f"{analysis.comparison.right_tag}）為 "
                    f"{analysis.comparison.mean_difference:.4g}。"
                )
            if analysis.warnings:
                lines.append("資料品質：" + "；".join(analysis.warnings))
            citations = [
                item.citation.title
                for item in analysis.evidence
                if item.citation and item.citation.title
            ]
            if citations:
                lines.append("文件來源：" + "、".join(dict.fromkeys(citations)))
            lines.append("來源與查詢條件請見 Evidence；以上數字並非由模型估算。")
            return "\n".join(lines)

        lines = ["Deterministic analysis:"]
        for summary in analysis.summaries:
            if summary.count == 0:
                lines.append(f"- {summary.tag}: no valid numeric values.")
            else:
                lines.append(
                    f"- {summary.tag}: {summary.count} points, average {summary.average:.4g}, "
                    f"minimum {summary.min:.4g}, maximum {summary.max:.4g}."
                )
        if analysis.comparison and analysis.comparison.mean_difference is not None:
            lines.append(
                f"- Mean difference ({analysis.comparison.left_tag} − "
                f"{analysis.comparison.right_tag}): "
                f"{analysis.comparison.mean_difference:.4g}."
            )
        if analysis.warnings:
            lines.append("Data quality: " + "; ".join(analysis.warnings))
        citations = [
            item.citation.title
            for item in analysis.evidence
            if item.citation and item.citation.title
        ]
        if citations:
            lines.append("Document sources: " + ", ".join(dict.fromkeys(citations)))
        lines.append(
            "See Evidence for source and query details; the model did not calculate these values."
        )
        return "\n".join(lines)
