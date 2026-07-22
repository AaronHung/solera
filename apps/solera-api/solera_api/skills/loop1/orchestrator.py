from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator, Awaitable, Callable
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from .models import (
    Loop1ActionDraft,
    Loop1EvidenceFact,
    Loop1Hypothesis,
    Loop1InvestigationResult,
    Loop1SkillTrace,
    Loop1TraceEvent,
)
from .tools import Loop1ReadOnlyTools

CRITICAL_TAGS = [
    "cooling-valve-command",
    "cooling-valve-position",
    "cooling-water-flow",
    "reactor-temperature",
    "reactor-pressure",
    "separator-level",
    "product-quality-proxy",
]

TraceEmitter = Callable[[Loop1TraceEvent], Awaitable[None]]


class Loop1Investigator:
    """Bounded deterministic planner for the LOOP-1 Hero scenario."""

    def __init__(self, tools: Loop1ReadOnlyTools) -> None:
        self.tools = tools

    @staticmethod
    def _trace_event(
        trace_id: str,
        event_type: str,
        payload: dict[str, Any],
    ) -> Loop1TraceEvent:
        return Loop1TraceEvent(
            event_id=f"loop1-event-{uuid4()}",
            trace_id=trace_id,
            type=event_type,
            occurred_at=datetime.now(UTC),
            payload=payload,
        )

    @staticmethod
    async def _emit(
        emit: TraceEmitter | None,
        event: Loop1TraceEvent,
    ) -> None:
        if emit is not None:
            await emit(event)

    async def investigate_stream(
        self,
        *,
        tenant_id: str,
        run_id: str,
        trace_id: str,
        case_id: str,
        objective: str,
        locale: str,
    ) -> AsyncIterator[Loop1TraceEvent]:
        queue: asyncio.Queue[Loop1TraceEvent | None] = asyncio.Queue()

        async def emit(event: Loop1TraceEvent) -> None:
            await queue.put(event)

        async def run() -> None:
            try:
                result = await self.investigate(
                    tenant_id=tenant_id,
                    run_id=run_id,
                    trace_id=trace_id,
                    case_id=case_id,
                    objective=objective,
                    locale=locale,
                    emit=emit,
                )
                await queue.put(
                    self._trace_event(
                        trace_id,
                        "complete",
                        {
                            "caseId": case_id,
                            "objective": objective,
                            "result": result.model_dump(by_alias=True, mode="json"),
                        },
                    )
                )
            except Exception as error:
                await queue.put(
                    self._trace_event(
                        trace_id,
                        "error",
                        {
                            "code": "LOOP1_INVESTIGATION_FAILED",
                            "message": str(error),
                        },
                    )
                )
            finally:
                await queue.put(None)

        task = asyncio.create_task(run())
        while True:
            event = await queue.get()
            if event is None:
                break
            yield event
        await task

    async def investigate(
        self,
        *,
        tenant_id: str,
        run_id: str,
        trace_id: str | None = None,
        case_id: str = "current",
        objective: str = "Investigate the current LOOP-1 process state.",
        locale: str = "zh-TW",
        emit: TraceEmitter | None = None,
    ) -> Loop1InvestigationResult:
        resolved_trace_id = trace_id or f"trace-{uuid4()}"
        snapshot = await self.tools.data_hub.snapshot(tenant_id, run_id)
        if snapshot is None:
            raise KeyError(f"unknown LOOP-1 run: {run_id}")
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "context",
                {
                    "tenantId": tenant_id,
                    "runId": run_id,
                    "tick": snapshot["run"]["tick"],
                    "scenarioState": snapshot["run"]["state"],
                    "caseId": case_id,
                    "objective": objective,
                    "locale": locale,
                    "synthetic": True,
                },
            ),
        )
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "plan",
                {
                    "bounded": True,
                    "generatedBy": "loop1-deterministic-planner@0.1.0",
                    "stages": [
                        {
                            "id": "quality-gate",
                            "labelZhTw": "確認關鍵訊號品質與歷史完整性",
                            "labelEn": "Validate required signal quality and history",
                        },
                        {
                            "id": "alarm-triage",
                            "labelZhTw": "整理警報群組與最早變化",
                            "labelEn": "Cluster alarms and locate earliest change",
                        },
                        {
                            "id": "context-retrieval",
                            "labelZhTw": "取得 SOP、設備文件與歷史案例",
                            "labelEn": "Retrieve procedures, documents, and cases",
                        },
                        {
                            "id": "hypothesis-ranking",
                            "labelZhTw": "比較根因假設與反證",
                            "labelEn": "Rank hypotheses with counter-evidence",
                        },
                        {
                            "id": "safety-boundary",
                            "labelZhTw": "套用唯讀與人工核准邊界",
                            "labelEn": "Apply read-only and human-approval boundary",
                        },
                    ],
                },
            ),
        )
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "tool-start",
                {
                    "tool": "query_signals",
                    "skillId": "loop1-process-context",
                    "tagIds": CRITICAL_TAGS,
                },
            ),
        )
        histories = await self.tools.query_signals(
            tenant_id=tenant_id,
            run_id=run_id,
            tag_ids=CRITICAL_TAGS,
        )
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "tool-result",
                {
                    "tool": "query_signals",
                    "tagCount": len(histories),
                    "observationCounts": {
                        tag_id: len(points) for tag_id, points in histories.items()
                    },
                },
            ),
        )
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "tool-start",
                {
                    "tool": "cluster_alarms",
                    "skillId": "loop1-alarm-triage",
                },
            ),
        )
        clusters = await self.tools.cluster_alarms(
            tenant_id=tenant_id,
            run_id=run_id,
        )
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "tool-result",
                {
                    "tool": "cluster_alarms",
                    "clusterCount": len(clusters),
                    "rawAlarmCount": sum(
                        int(cluster["alarmCount"]) for cluster in clusters
                    ),
                },
            ),
        )
        current = {item["tagId"]: item for item in snapshot["observations"]}
        missing = self._missing_data(current, histories)
        investigation_id = f"inv-{run_id}-{snapshot['run']['tick']:06d}"

        quality_evidence = [
            Loop1EvidenceFact(
                evidence_id=f"evidence-quality-{tag_id}",
                kind="quality",
                source_id=tag_id,
                claim=reason,
                value=current.get(tag_id, {}).get("quality", "unavailable"),
                lineage={
                    "runId": run_id,
                    "synthetic": True,
                    "method": "required-signal-gate@0.1.0",
                },
            )
            for tag_id, reason in missing
        ]
        if missing:
            for item in quality_evidence:
                await self._emit(
                    emit,
                    self._trace_event(
                        resolved_trace_id,
                        "evidence",
                        {"evidence": item.model_dump(by_alias=True, mode="json")},
                    ),
                )
            await self._emit(
                emit,
                self._trace_event(
                    resolved_trace_id,
                    "safety",
                    {
                        "status": "safe-decline",
                        "reasonZhTw": "關鍵訊號缺失、品質不足或歷史資料少於 20 筆。",
                        "reasonEn": (
                            "Required signals are missing, unreliable, or have "
                            "fewer than 20 observations."
                        ),
                        "missingData": [reason for _, reason in missing],
                        "actionDraftAllowed": False,
                    },
                ),
            )
            return Loop1InvestigationResult(
                investigation_id=investigation_id,
                tenant_id=tenant_id,
                run_id=run_id,
                scenario_state=snapshot["run"]["state"],
                status="safe-decline",
                summary=(
                    "Solera cannot rank a process root cause because required signal "
                    "history or quality is insufficient."
                ),
                alarm_clusters=clusters,
                evidence=quality_evidence,
                recommendations=[
                    "Verify connector freshness and independent instrument quality.",
                    "Keep critical alarms visible and follow the approved plant procedure.",
                    "Repeat the investigation after the missing evidence is restored.",
                ],
                missing_data=[reason for _, reason in missing],
                skill_trace=[
                    Loop1SkillTrace(
                        skill_id="loop1-process-context",
                        status="declined",
                        summary="Required signal gate failed.",
                        tool_calls=["query_signals"],
                    ),
                    Loop1SkillTrace(
                        skill_id="loop1-procedure-safety",
                        status="completed",
                        summary="Applied read-only and safe-decline boundary.",
                        tool_calls=[],
                    ),
                ],
            )

        evidence = self._signal_evidence(current, run_id)
        for item in evidence:
            await self._emit(
                emit,
                self._trace_event(
                    resolved_trace_id,
                    "evidence",
                    {"evidence": item.model_dump(by_alias=True, mode="json")},
                ),
            )
        command = float(current["cooling-valve-command"]["value"])
        position = float(current["cooling-valve-position"]["value"])
        flow = float(current["cooling-water-flow"]["value"])
        temperature = float(current["reactor-temperature"]["value"])
        mismatch = command - position
        mismatch_evidence = Loop1EvidenceFact(
            evidence_id="evidence-command-position-mismatch",
            kind="calculation",
            source_id="command-minus-position",
            claim="Cooling-valve command exceeds independent position feedback.",
            value=round(mismatch, 6),
            unit="percentage points",
            occurred_at=current["cooling-valve-command"]["timestamp"],
            lineage={
                "inputs": [
                    current["cooling-valve-command"]["tagId"],
                    current["cooling-valve-position"]["tagId"],
                ],
                "formula": "command - position",
                "calculationVersion": "loop1-mismatch@0.1.0",
                "runId": run_id,
                "synthetic": True,
            },
        )
        evidence.append(mismatch_evidence)
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "evidence",
                {"evidence": mismatch_evidence.model_dump(by_alias=True, mode="json")},
            ),
        )

        if mismatch <= 2 and not clusters:
            await self._emit(
                emit,
                self._trace_event(
                    resolved_trace_id,
                    "safety",
                    {
                        "status": "no-abnormality",
                        "reasonZhTw": "目前沒有符合 LOOP-1 邊界條件的異常模式。",
                        "reasonEn": "No bounded LOOP-1 abnormal pattern is present.",
                        "actionDraftAllowed": False,
                    },
                ),
            )
            return Loop1InvestigationResult(
                investigation_id=investigation_id,
                tenant_id=tenant_id,
                run_id=run_id,
                scenario_state=snapshot["run"]["state"],
                status="no-abnormality",
                summary=(
                    "The current synthetic snapshot does not show the LOOP-1 "
                    "command-position-flow abnormal pattern."
                ),
                evidence=evidence,
                recommendations=[
                    "Continue read-only monitoring; no maintenance draft is proposed."
                ],
                skill_trace=[
                    Loop1SkillTrace(
                        skill_id="loop1-process-context",
                        status="completed",
                        summary="No bounded abnormal pattern detected.",
                        tool_calls=["query_signals"],
                    )
                ],
            )

        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "tool-start",
                {
                    "tool": "find_change_points",
                    "skillId": "loop1-alarm-triage",
                },
            ),
        )
        change_points = self.tools.find_change_points(histories)
        change_evidence = self._change_point_evidence(change_points, run_id)
        evidence.extend(change_evidence)
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "tool-result",
                {
                    "tool": "find_change_points",
                    "changePointCount": len(change_evidence),
                    "tagIds": [
                        tag_id
                        for tag_id, change in change_points.items()
                        if change is not None
                    ],
                },
            ),
        )
        for item in change_evidence:
            await self._emit(
                emit,
                self._trace_event(
                    resolved_trace_id,
                    "evidence",
                    {"evidence": item.model_dump(by_alias=True, mode="json")},
                ),
            )
        if clusters:
            alarm_evidence = Loop1EvidenceFact(
                evidence_id="evidence-alarm-cluster",
                kind="alarm",
                source_id=clusters[0]["clusterId"],
                claim=clusters[0]["summary"],
                value={
                    "rawAlarmCount": clusters[0]["alarmCount"],
                    "criticalAlarmIds": clusters[0]["criticalAlarmIds"],
                },
                occurred_at=clusters[0]["startedAt"],
                lineage={
                    "alarmIds": clusters[0]["alarmIds"],
                    "causeEventId": clusters[0]["causeEventId"],
                    "method": "cause-event-clustering@0.1.0",
                    "synthetic": True,
                },
            )
            evidence.append(alarm_evidence)
            await self._emit(
                emit,
                self._trace_event(
                    resolved_trace_id,
                    "evidence",
                    {"evidence": alarm_evidence.model_dump(by_alias=True, mode="json")},
                ),
            )

        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "tool-start",
                {
                    "tool": "get_document_revision",
                    "skillId": "loop1-procedure-safety",
                },
            ),
        )
        documents = await self.tools.get_document_revision(
            tenant_id=tenant_id,
            query="reactor cooling deviation valve position revision procedure",
        )
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "tool-result",
                {
                    "tool": "get_document_revision",
                    "documentCount": len(documents),
                    "documentIds": [
                        document["documentId"] for document in documents[:5]
                    ],
                },
            ),
        )
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "tool-start",
                {
                    "tool": "search_cases",
                    "skillId": "loop1-case-retrieval",
                },
            ),
        )
        cases = await self.tools.search_cases(
            tenant_id=tenant_id,
            asset_ids={"component-cooling-valve", "equipment-reactor"},
            tag_ids=set(CRITICAL_TAGS),
        )
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "tool-result",
                {
                    "tool": "search_cases",
                    "caseCount": len(cases),
                    "caseIds": [case["caseId"] for case in cases[:5]],
                },
            ),
        )
        retrieval_evidence = self._retrieval_evidence(documents, cases)
        evidence.extend(retrieval_evidence)
        for item in retrieval_evidence:
            await self._emit(
                emit,
                self._trace_event(
                    resolved_trace_id,
                    "evidence",
                    {"evidence": item.model_dump(by_alias=True, mode="json")},
                ),
            )
        hypotheses = self._rank_hypotheses(
            mismatch=mismatch,
            flow=flow,
            temperature=temperature,
            evidence=evidence,
        )
        for hypothesis in hypotheses:
            await self._emit(
                emit,
                self._trace_event(
                    resolved_trace_id,
                    "hypothesis",
                    {
                        "hypothesis": hypothesis.model_dump(
                            by_alias=True,
                            mode="json",
                        )
                    },
                ),
            )
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "tool-start",
                {
                    "tool": "calculate_kpi",
                    "skillId": "loop1-shift-handover",
                },
            ),
        )
        alarm_count = sum(cluster["alarmCount"] for cluster in clusters)
        kpi = self.tools.calculate_kpi(
            raw_alarm_count=alarm_count,
            cluster_count=len(clusters),
            off_spec_minutes=max(0, snapshot["run"]["tick"] - 170) / 60,
        )
        evidence.append(
            Loop1EvidenceFact(
                evidence_id="evidence-demo-kpi",
                kind="calculation",
                source_id="loop1-demo-kpi",
                claim="Synthetic demo KPI calculation with explicit assumptions.",
                value=kpi,
                lineage={
                    "formulaVersion": kpi["formulaVersion"],
                    "synthetic": True,
                    "notCustomerBenefit": True,
                },
            )
        )
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "tool-result",
                {
                    "tool": "calculate_kpi",
                    "formulaVersion": kpi["formulaVersion"],
                    "synthetic": True,
                    "notCustomerBenefit": True,
                },
            ),
        )
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "evidence",
                {"evidence": evidence[-1].model_dump(by_alias=True, mode="json")},
            ),
        )
        primary_refs = hypotheses[0].evidence_refs
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "tool-start",
                {
                    "tool": "draft_work_order",
                    "skillId": "loop1-shift-handover",
                },
            ),
        )
        action_draft = Loop1ActionDraft.model_validate(
            self.tools.draft_work_order(evidence_refs=primary_refs)
        )
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "tool-result",
                {
                    "tool": "draft_work_order",
                    "actionType": action_draft.action_type,
                    "assetId": action_draft.asset_id,
                    "draftOnly": True,
                },
            ),
        )
        await self._emit(
            emit,
            self._trace_event(
                resolved_trace_id,
                "safety",
                {
                    "status": "complete",
                    "reasonZhTw": (
                        "調查僅產生待人工核准的檢查草稿，不執行任何控制或外部寫入。"
                    ),
                    "reasonEn": (
                        "The investigation creates a human-approved inspection draft "
                        "only; no control or external write is executed."
                    ),
                    "actionDraftAllowed": True,
                    "safetyBoundary": action_draft.safety_boundary,
                },
            ),
        )
        return Loop1InvestigationResult(
            investigation_id=investigation_id,
            tenant_id=tenant_id,
            run_id=run_id,
            scenario_state=snapshot["run"]["state"],
            status="complete",
            summary=(
                "The earliest bounded pattern is a cooling-valve command versus "
                "position mismatch, followed by lower cooling flow and delayed "
                "reactor/downstream deviation. Valve stiction is the leading "
                "synthetic hypothesis, not a safety determination."
            ),
            alarm_clusters=clusters,
            hypotheses=hypotheses,
            evidence=evidence,
            documents=documents,
            similar_cases=cases,
            recommendations=[
                "Have an authorized operator verify alarm validity and current context.",
                "Use SOP-R101-04 Revision 4 and the approved field verification process.",
                (
                    "Ask a qualified technician to inspect command, independent "
                    "position, and flow evidence under the required permit and "
                    "isolation process."
                ),
                "Do not bypass interlocks or change a setpoint based on this investigation.",
            ],
            skill_trace=self._skill_trace(
                change_points=change_points,
                document_count=len(documents),
                case_count=len(cases),
            ),
            action_draft=action_draft,
        )

    @staticmethod
    def _missing_data(
        current: dict[str, dict[str, Any]],
        histories: dict[str, list[dict[str, Any]]],
    ) -> list[tuple[str, str]]:
        missing: list[tuple[str, str]] = []
        for tag_id in CRITICAL_TAGS:
            latest = current.get(tag_id)
            if latest is None:
                missing.append((tag_id, f"{tag_id}: current value is unavailable"))
            elif latest["quality"] != "good" or latest["value"] is None:
                missing.append((tag_id, f"{tag_id}: current quality is {latest['quality']}"))
            elif len(histories.get(tag_id, [])) < 20:
                missing.append((tag_id, f"{tag_id}: fewer than 20 replay observations"))
        return missing

    @staticmethod
    def _signal_evidence(
        current: dict[str, dict[str, Any]],
        run_id: str,
    ) -> list[Loop1EvidenceFact]:
        return [
            Loop1EvidenceFact(
                evidence_id=f"evidence-signal-{tag_id}",
                kind="signal",
                source_id=item["tagId"],
                claim=f"Current synthetic {item['name']}.",
                value=item["value"],
                unit=item["unit"],
                occurred_at=item["timestamp"],
                lineage={
                    "runId": run_id,
                    "quality": item["quality"],
                    "assetId": item["assetId"],
                    "synthetic": True,
                },
            )
            for tag_id, item in current.items()
            if tag_id in CRITICAL_TAGS
        ]

    @staticmethod
    def _change_point_evidence(
        change_points: dict[str, dict[str, Any] | None],
        run_id: str,
    ) -> list[Loop1EvidenceFact]:
        return [
            Loop1EvidenceFact(
                evidence_id=f"evidence-change-{tag_id}",
                kind="calculation",
                source_id=change["observationId"],
                claim=f"Bounded change point for {tag_id}.",
                value={
                    "value": change["value"],
                    "baseline": change["baseline"],
                    "threshold": change["threshold"],
                    "sequence": change["sequence"],
                },
                occurred_at=change["timestamp"],
                lineage={
                    "runId": run_id,
                    "method": change["method"],
                    "synthetic": True,
                },
            )
            for tag_id, change in change_points.items()
            if change is not None
        ]

    @staticmethod
    def _retrieval_evidence(
        documents: list[dict[str, Any]],
        cases: list[dict[str, Any]],
    ) -> list[Loop1EvidenceFact]:
        evidence: list[Loop1EvidenceFact] = []
        for document in documents[:3]:
            evidence.append(
                Loop1EvidenceFact(
                    evidence_id=f"evidence-document-{document['documentId']}",
                    kind="document",
                    source_id=document["documentId"],
                    claim=f"Retrieved {document['title']}.",
                    value={"section": document["section"], "score": document["score"]},
                    lineage={
                        "uri": document["uri"],
                        "retrievalVersion": document["retrievalVersion"],
                        "synthetic": True,
                    },
                )
            )
        for case in cases[:3]:
            evidence.append(
                Loop1EvidenceFact(
                    evidence_id=f"evidence-case-{case['caseId']}",
                    kind="case",
                    source_id=case["caseId"],
                    claim=f"Similar case: {case['title']}.",
                    value={"rootCause": case["rootCause"], "score": case["score"]},
                    occurred_at=case["occurredAt"],
                    lineage={"synthetic": True},
                )
            )
        return evidence

    @staticmethod
    def _rank_hypotheses(
        *,
        mismatch: float,
        flow: float,
        temperature: float,
        evidence: list[Loop1EvidenceFact],
    ) -> list[Loop1Hypothesis]:
        evidence_ids = {item.evidence_id for item in evidence}
        stiction_refs = [
            reference
            for reference in [
                "evidence-command-position-mismatch",
                "evidence-signal-cooling-water-flow",
                "evidence-signal-reactor-temperature",
                "evidence-change-cooling-valve-command",
                "evidence-change-cooling-valve-position",
                "evidence-alarm-cluster",
                "evidence-case-case-valve-stiction-001",
            ]
            if reference in evidence_ids
        ]
        process_response = flow < 90 or temperature > 128
        confidence = 0.94 if mismatch > 5 and process_response else 0.72
        return [
            Loop1Hypothesis(
                hypothesis_id="hypothesis-valve-stiction",
                rank=1,
                title="FV-101 cooling-water valve stiction",
                confidence=confidence,
                status="supported",
                evidence_refs=stiction_refs,
                reasoning_summary=(
                    "Command-position mismatch precedes lower cooling flow and "
                    "delayed thermal/process response."
                ),
            ),
            Loop1Hypothesis(
                hypothesis_id="hypothesis-position-bias",
                rank=2,
                title="Valve position feedback bias",
                confidence=0.34 if process_response else 0.58,
                status="possible",
                evidence_refs=[
                    "evidence-command-position-mismatch",
                    "evidence-case-case-position-bias-002",
                ],
                counter_evidence_refs=[
                    "evidence-signal-cooling-water-flow",
                    "evidence-signal-reactor-temperature",
                ],
                reasoning_summary=(
                    "Feedback bias can explain mismatch, but the linked flow and "
                    "temperature response makes it less complete."
                ),
            ),
            Loop1Hypothesis(
                hypothesis_id="hypothesis-header-disturbance",
                rank=3,
                title="Common cooling-water header disturbance",
                confidence=0.18,
                status="possible",
                evidence_refs=["evidence-signal-cooling-water-flow"],
                counter_evidence_refs=["evidence-command-position-mismatch"],
                reasoning_summary=(
                    "A utility disturbance can reduce flow but does not explain the "
                    "local command-position mismatch."
                ),
            ),
        ]

    @staticmethod
    def _skill_trace(
        *,
        change_points: dict[str, dict[str, Any] | None],
        document_count: int,
        case_count: int,
    ) -> list[Loop1SkillTrace]:
        return [
            Loop1SkillTrace(
                skill_id="loop1-alarm-triage",
                status="completed",
                summary="Grouped alarms by recorded cause while preserving critical alarms.",
                tool_calls=["cluster_alarms", "find_change_points"],
            ),
            Loop1SkillTrace(
                skill_id="loop1-process-context",
                status="completed",
                summary=(f"Compared {len(change_points)} linked signals and causal timing."),
                tool_calls=["query_signals", "find_change_points"],
            ),
            Loop1SkillTrace(
                skill_id="loop1-procedure-safety",
                status="completed",
                summary=f"Retrieved {document_count} revision-bearing document hits.",
                tool_calls=["get_document_revision"],
            ),
            Loop1SkillTrace(
                skill_id="loop1-case-retrieval",
                status="completed",
                summary=f"Retrieved {case_count} linked synthetic cases.",
                tool_calls=["search_cases"],
            ),
            Loop1SkillTrace(
                skill_id="loop1-asset-integrity",
                status="completed",
                summary="Ranked valve, instrument, and utility hypotheses.",
                tool_calls=["query_signals", "search_cases"],
            ),
            Loop1SkillTrace(
                skill_id="loop1-shift-handover",
                status="completed",
                summary="Prepared a draft-only action for human approval.",
                tool_calls=["calculate_kpi", "draft_work_order"],
            ),
        ]
