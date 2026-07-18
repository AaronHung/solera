from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class PointQuality(StrEnum):
    GOOD = "good"
    BAD = "bad"
    QUESTIONABLE = "questionable"
    MISSING = "missing"


class DataPoint(BaseModel):
    model_config = ConfigDict(extra="forbid")

    timestamp: datetime
    value: float | str | bool | None
    quality: PointQuality = PointQuality.GOOD


class TagSeries(BaseModel):
    model_config = ConfigDict(extra="forbid")

    tag: str
    descriptor: str | None = None
    value_type: str | None = None
    points: list[DataPoint]
    upstream_metadata: dict[str, Any] = Field(default_factory=dict)


class CurrentValue(BaseModel):
    model_config = ConfigDict(extra="forbid")

    tag: str
    descriptor: str | None = None
    value_type: str | None = None
    point: DataPoint


class TagDefinition(BaseModel):
    model_config = ConfigDict(extra="forbid")

    tag: str
    descriptor: str | None = None
    value_type: str | None = None


class ConnectorLimits(BaseModel):
    model_config = ConfigDict(extra="forbid")

    max_range_seconds: int = 7 * 24 * 60 * 60
    max_points: int = 5000
    timeout_ms: int = 10_000


class ConnectorCapabilities(BaseModel):
    model_config = ConfigDict(extra="forbid")

    protocolVersion: str = "0.1"
    connectorId: str = "easy-pi"
    connectorVersion: str = "0.1.0"
    readOnly: bool = True
    operations: list[str] = Field(
        default_factory=lambda: ["health", "list-tags", "current", "recorded"]
    )
    limits: dict[str, int]
