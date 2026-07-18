from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from pydantic.alias_generators import to_camel

CONTRACT_VERSION = "0.1"


class ContractModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )


class CandidateAsset(ContractModel):
    asset_id: str
    label: str
    confidence: float = Field(ge=0, le=1)
    source: Literal["adapter", "url", "dom", "user", "catalog"]
    confirmed: bool = False


class PageDescriptor(ContractModel):
    url: str
    url_pattern: str
    system_type: Literal["easy-pi", "pi-vision", "generic"]
    view_type: str
    title: str
    selected_text: str | None = Field(default=None, max_length=2000)
    visible_text_digest: str | None = Field(default=None, max_length=8000)
    adapter_id: str | None = None
    adapter_version: str | None = None


class TimeContext(ContractModel):
    start: datetime
    end: datetime
    timezone: str
    source: Literal["adapter", "default", "user"]
    confirmed: bool = False

    @model_validator(mode="after")
    def check_range(self) -> TimeContext:
        if self.start.tzinfo is None or self.end.tzinfo is None:
            raise ValueError("time context requires timezone-aware datetimes")
        if self.end <= self.start:
            raise ValueError("time context end must be after start")
        return self


class CaptureDetails(ContractModel):
    screenshot_included: bool = False
    redactions_applied: list[str] = Field(default_factory=list)


class PageContext(ContractModel):
    context_version: Literal["0.1"] = "0.1"
    tenant_id: str
    tab_session_id: str
    captured_at: datetime
    page: PageDescriptor
    candidate_assets: list[CandidateAsset] = Field(default_factory=list, max_length=10)
    time_context: TimeContext
    sensitivity: Literal["public", "internal", "confidential", "restricted"]
    capture: CaptureDetails = Field(default_factory=CaptureDetails)

    @field_validator("captured_at")
    @classmethod
    def require_capture_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            raise ValueError("captured_at must be timezone aware")
        return value


class DataQuality(ContractModel):
    sample_count: int = Field(ge=0)
    valid_count: int = Field(ge=0)
    bad_count: int = Field(ge=0)
    missing_count: int = Field(ge=0)
    coverage: float = Field(ge=0, le=1)
    freshness_seconds: float | None = Field(default=None, ge=0)
    warnings: list[str] = Field(default_factory=list)


class Citation(ContractModel):
    document_id: str | None = None
    title: str | None = None
    section: str | None = None
    uri: str | None = None


class Evidence(ContractModel):
    evidence_version: Literal["0.1"] = "0.1"
    evidence_id: str
    tenant_id: str
    source_system: str
    source_type: Literal["industrial-api", "document", "page-context"]
    asset_id: str | None = None
    tags: list[str] = Field(default_factory=list)
    start: datetime
    end: datetime
    timezone: str
    retrieval_mode: Literal["current", "recorded", "interpolated", "document", "context"]
    aggregation: str | None = None
    calculation_version: str
    connector_version: str
    query_id: str
    retrieved_at: datetime
    data_quality: DataQuality
    citation: Citation | None = None


class SeriesSummary(ContractModel):
    tag: str
    count: int = Field(ge=0)
    min: float | None = None
    max: float | None = None
    average: float | None = None
    std_dev: float | None = None
    rate_of_change: float | None = None
    rate_unit: str | None = None


class SeriesComparison(ContractModel):
    left_tag: str
    right_tag: str
    mean_difference: float | None = None
    max_absolute_difference: float | None = None
    max_difference_at: datetime | None = None


class AnalysisResult(ContractModel):
    analysis_version: Literal["0.1"] = "0.1"
    analysis_id: str
    tenant_id: str
    kind: Literal["current", "summary", "comparison", "basic-anomaly"]
    summaries: list[SeriesSummary]
    comparison: SeriesComparison | None = None
    evidence: list[Evidence] = Field(min_length=1)
    warnings: list[str] = Field(default_factory=list)


WidgetType = Literal["timeseries", "kpi", "status", "table", "asset", "evidence"]
DANGEROUS_CONFIG_TOKENS = ("script", "javascript", "srcdoc", "html")


def _validate_config_tree(value: Any, *, path: str = "config") -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            normalized = str(key).lower()
            if normalized.startswith("on") or any(
                token in normalized for token in DANGEROUS_CONFIG_TOKENS
            ):
                raise ValueError(f"unsafe ViewSpec key at {path}.{key}")
            _validate_config_tree(child, path=f"{path}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            _validate_config_tree(child, path=f"{path}[{index}]")
    elif isinstance(value, str) and "javascript:" in value.lower():
        raise ValueError(f"unsafe ViewSpec value at {path}")


class WidgetSpec(ContractModel):
    id: str = Field(pattern=r"^[A-Za-z][A-Za-z0-9_-]{0,63}$")
    type: WidgetType
    title: str = Field(min_length=1, max_length=200)
    evidence_refs: list[str] = Field(default_factory=list)
    config: dict[str, Any]

    @field_validator("config")
    @classmethod
    def reject_executable_config(cls, value: dict[str, Any]) -> dict[str, Any]:
        _validate_config_tree(value)
        return value


class ViewSpec(ContractModel):
    schema_version: Literal["0.1"] = "0.1"
    view_id: str
    tenant_id: str
    title: str = Field(min_length=1, max_length=200)
    layout: Literal["grid", "stack"] = "grid"
    widgets: list[WidgetSpec] = Field(min_length=1, max_length=24)
    evidence: list[Evidence] = Field(default_factory=list)
    created_at: datetime

    @model_validator(mode="after")
    def validate_evidence_references(self) -> ViewSpec:
        evidence_ids = {item.evidence_id for item in self.evidence}
        numeric_types = {"timeseries", "kpi", "status", "table"}
        for widget in self.widgets:
            if widget.type in numeric_types and not widget.evidence_refs:
                raise ValueError(f"{widget.type} widget requires Evidence")
            missing = set(widget.evidence_refs) - evidence_ids
            if missing:
                raise ValueError(f"widget references unknown Evidence: {sorted(missing)}")
        return self


class ToolLimits(ContractModel):
    max_range_seconds: int = Field(gt=0)
    max_points: int = Field(gt=0)
    timeout_ms: int = Field(ge=100, le=120_000)


class ToolManifest(ContractModel):
    tool_version: Literal["0.1"] = "0.1"
    name: str = Field(pattern=r"^[a-z][a-z0-9_]{2,63}$")
    description: str
    read_only: Literal[True] = True
    required_roles: list[str] = Field(min_length=1)
    limits: ToolLimits
    model_data_policy: Literal["none", "summary-only", "sampled", "raw"]
    audit_policy: Literal["metadata", "inputs-redacted", "full-redacted"] = "inputs-redacted"


class AgentStreamEvent(ContractModel):
    event_version: Literal["0.1"] = "0.1"
    event_id: str
    trace_id: str
    type: Literal[
        "context",
        "tool-start",
        "tool-result",
        "evidence",
        "text-delta",
        "view-spec",
        "complete",
        "error",
    ]
    occurred_at: datetime
    payload: dict[str, Any]
