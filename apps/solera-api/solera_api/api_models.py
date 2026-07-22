from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ApiModel(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class KillSwitchRequest(ApiModel):
    enabled: bool


class FeedbackRequest(ApiModel):
    trace_id: str = Field(alias="traceId", min_length=1)
    rating: Literal["accepted", "rejected", "partially-useful"]
    comment: str | None = Field(default=None, max_length=2000)


class KnowledgeDocumentRequest(ApiModel):
    document_id: str = Field(alias="documentId", min_length=1, max_length=128)
    title: str = Field(min_length=1, max_length=512)
    content: str = Field(min_length=1, max_length=1_000_000)
    uri: str | None = Field(default=None, max_length=2048)


class Loop1ControlRequest(ApiModel):
    action: Literal[
        "step",
        "pause",
        "resume",
        "reset",
        "jump-to-fault",
        "replay",
    ]
    count: int = Field(default=1, ge=1, le=600)
    to_tick: int | None = Field(default=None, alias="toTick", ge=1, le=3_600)


class Loop1InvestigationRequest(ApiModel):
    case_id: Literal["current", "normal", "hero", "safe-decline"] = Field(
        default="current",
        alias="caseId",
    )
    objective: str = Field(
        default="調查目前製程狀態、主要異常、根因假設與可追溯 Evidence。",
        min_length=1,
        max_length=1000,
    )
    locale: Literal["zh-TW", "en"] = "zh-TW"


class Loop1ApprovalDecisionRequest(ApiModel):
    decision: Literal["approved", "rejected"]
    rationale: str | None = Field(default=None, max_length=2000)
