from __future__ import annotations

from typing import Any

from .models import (
    Loop1ActionDraft,
    Loop1EvidenceFact,
    Loop1Hypothesis,
    Loop1InvestigationResult,
    Loop1SkillTrace,
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


class Loop1Investigator:
    """Bounded deterministic planner for the LOOP-1 Hero scenario."""

    def __init__(self, tools: Loop1ReadOnlyTools) -> None:
        self.tools = tools

    async def investigate(
        self,
        *,
        tenant_id: str,
        run_id: str,
    ) -> Loop1InvestigationResult:
        snapshot = await self.tools.data_hub.snapshot(tenant_id, run_id)
        if snapshot is None:
            raise KeyError(f"unknown LOOP-1 run: {run_id}")
        histories = await self.tools.query_signals(
            tenant_id=tenant_id,
            run_id=run_id,
            tag_ids=CRITICAL_TAGS,
        )
        clusters = await self.tools.cluster_alarms(
            tenant_id=tenant_id,
            run_id=run_id,
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

        if mismatch <= 2 and not clusters:
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

        change_points = self.tools.find_change_points(histories)
        evidence.extend(self._change_point_evidence(change_points, run_id))
        if clusters:
            evidence.append(
                Loop1EvidenceFact(
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
            )

        documents = await self.tools.get_document_revision(
            tenant_id=tenant_id,
            query="reactor cooling deviation valve position revision procedure",
        )
        cases = await self.tools.search_cases(
            tenant_id=tenant_id,
            asset_ids={"component-cooling-valve", "equipment-reactor"},
            tag_ids=set(CRITICAL_TAGS),
        )
        evidence.extend(self._retrieval_evidence(documents, cases))
        hypotheses = self._rank_hypotheses(
            mismatch=mismatch,
            flow=flow,
            temperature=temperature,
            evidence=evidence,
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
        primary_refs = hypotheses[0].evidence_refs
        action_draft = Loop1ActionDraft.model_validate(
            self.tools.draft_work_order(evidence_refs=primary_refs)
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
