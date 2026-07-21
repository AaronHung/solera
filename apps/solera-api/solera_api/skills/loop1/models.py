from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import Field

from ...contracts import ContractModel


class Loop1SkillManifest(ContractModel):
    skill_version: Literal["0.1"] = "0.1"
    skill_id: str
    name: str
    purpose: str
    tools: list[str]
    read_only: Literal[True] = True
    requires_approval: bool = False


class Loop1EvidenceFact(ContractModel):
    evidence_id: str
    kind: Literal["signal", "alarm", "document", "case", "calculation", "quality"]
    source_id: str
    claim: str
    value: Any = None
    unit: str | None = None
    occurred_at: datetime | None = None
    lineage: dict[str, Any] = Field(default_factory=dict)


class Loop1Hypothesis(ContractModel):
    hypothesis_id: str
    rank: int = Field(ge=1)
    title: str
    confidence: float = Field(ge=0, le=1)
    status: Literal["supported", "possible", "insufficient-data"]
    evidence_refs: list[str] = Field(default_factory=list)
    counter_evidence_refs: list[str] = Field(default_factory=list)
    reasoning_summary: str


class Loop1SkillTrace(ContractModel):
    skill_id: str
    status: Literal["completed", "declined", "skipped"]
    summary: str
    tool_calls: list[str] = Field(default_factory=list)


class Loop1ActionDraft(ContractModel):
    action_type: Literal["draft-inspection-work-order", "draft-shift-handover"]
    title: str
    asset_id: str
    priority: Literal["routine", "priority", "urgent"]
    evidence_refs: list[str]
    verification_items: list[str]
    safety_boundary: str = (
        "Draft only. An authorized human must apply the approved plant procedure, "
        "permit, isolation, and dispatch process."
    )


class Loop1InvestigationResult(ContractModel):
    investigation_version: Literal["0.1"] = "0.1"
    investigation_id: str
    tenant_id: str
    run_id: str
    scenario_state: str
    status: Literal["complete", "safe-decline", "no-abnormality"]
    synthetic: Literal[True] = True
    summary: str
    alarm_clusters: list[dict[str, Any]] = Field(default_factory=list)
    hypotheses: list[Loop1Hypothesis] = Field(default_factory=list)
    evidence: list[Loop1EvidenceFact] = Field(default_factory=list)
    documents: list[dict[str, Any]] = Field(default_factory=list)
    similar_cases: list[dict[str, Any]] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    missing_data: list[str] = Field(default_factory=list)
    skill_trace: list[Loop1SkillTrace] = Field(default_factory=list)
    action_draft: Loop1ActionDraft | None = None
    safety_notice: str = (
        "Synthetic, read-only investigation. Not a plant-control instruction or "
        "safety determination."
    )
