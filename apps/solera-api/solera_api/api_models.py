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
