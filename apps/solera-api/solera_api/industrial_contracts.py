from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import Field, field_validator, model_validator

from .contracts import ContractModel

INDUSTRIAL_CONTRACT_VERSION = "0.1"


class IndustrialAlias(ContractModel):
    system: Literal["solera", "pi", "dcs", "erp", "cmms", "pid", "document"]
    value: str = Field(min_length=1, max_length=256)
    effective_from: datetime | None = None
    effective_to: datetime | None = None


class IndustrialAsset(ContractModel):
    contract_version: Literal["0.1"] = "0.1"
    asset_id: str = Field(pattern=r"^[a-z][a-z0-9-]{2,127}$")
    tenant_id: str
    kind: Literal["site", "area", "process-unit", "equipment", "component"]
    name: str = Field(min_length=1, max_length=256)
    parent_id: str | None
    aliases: list[IndustrialAlias] = Field(default_factory=list, max_length=32)
    attributes: dict[str, str | int | float | bool | None] = Field(default_factory=dict)


class SignalLimits(ContractModel):
    lo_lo: float | None = None
    lo: float | None = None
    hi: float | None = None
    hi_hi: float | None = None

    @model_validator(mode="after")
    def ordered_limits(self) -> SignalLimits:
        values = [
            value for value in (self.lo_lo, self.lo, self.hi, self.hi_hi) if value is not None
        ]
        if values != sorted(values):
            raise ValueError("signal limits must be ordered loLo <= lo <= hi <= hiHi")
        return self


class SignalTag(ContractModel):
    contract_version: Literal["0.1"] = "0.1"
    tag_id: str = Field(pattern=r"^[a-z][a-z0-9-]{2,127}$")
    tenant_id: str
    asset_id: str
    name: str = Field(min_length=1, max_length=256)
    unit: str = Field(max_length=32)
    data_type: Literal["number", "string", "boolean"]
    cadence_seconds: float = Field(gt=0)
    limits: SignalLimits | None = None
    aliases: list[IndustrialAlias] = Field(default_factory=list, max_length=32)


class IndustrialObservation(ContractModel):
    contract_version: Literal["0.1"] = "0.1"
    observation_id: str
    tenant_id: str
    run_id: str
    tag_id: str
    timestamp: datetime
    value: float | str | bool | None
    quality: Literal["good", "bad", "questionable", "missing"]
    sequence: int = Field(ge=0)
    synthetic: Literal[True] = True

    @field_validator("timestamp")
    @classmethod
    def require_timestamp_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            raise ValueError("observation timestamp must be timezone aware")
        return value


class AlarmEvent(ContractModel):
    contract_version: Literal["0.1"] = "0.1"
    alarm_id: str
    tenant_id: str
    run_id: str
    asset_id: str
    tag_id: str | None
    occurred_at: datetime
    priority: Literal["low", "medium", "high", "critical"]
    state: Literal["active", "acknowledged", "cleared"]
    message: str = Field(min_length=1, max_length=1000)
    cause_event_id: str | None
    synthetic: Literal[True] = True


class FaultDefinition(ContractModel):
    fault_id: str
    kind: Literal["valve-stiction", "sensor-bias", "ingest-delay", "missing-data"]
    inject_at_tick: int = Field(ge=0)
    asset_id: str
    parameters: dict[str, str | int | float | bool] = Field(default_factory=dict)


class KpiDefinition(ContractModel):
    kpi_id: str
    name: str
    unit: str
    formula_version: str
    assumptions: dict[str, str | int | float | bool] = Field(default_factory=dict)


class ScenarioManifest(ContractModel):
    manifest_version: Literal["0.1"] = "0.1"
    scenario_id: str = Field(pattern=r"^[a-z][a-z0-9-]{2,127}$")
    tenant_id: str
    name: str
    seed: int = Field(ge=0)
    timezone: str
    tick_seconds: float = Field(gt=0)
    starts_at: datetime
    assets: list[IndustrialAsset] = Field(min_length=1)
    tags: list[SignalTag] = Field(min_length=1)
    faults: list[FaultDefinition] = Field(default_factory=list)
    kpis: list[KpiDefinition] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_references(self) -> ScenarioManifest:
        if self.starts_at.tzinfo is None:
            raise ValueError("scenario startsAt must be timezone aware")
        asset_ids = {asset.asset_id for asset in self.assets}
        if len(asset_ids) != len(self.assets):
            raise ValueError("scenario asset IDs must be unique")
        tag_ids = {tag.tag_id for tag in self.tags}
        if len(tag_ids) != len(self.tags):
            raise ValueError("scenario tag IDs must be unique")
        missing_tag_assets = {tag.asset_id for tag in self.tags} - asset_ids
        if missing_tag_assets:
            raise ValueError(f"tags reference unknown assets: {sorted(missing_tag_assets)}")
        missing_fault_assets = {fault.asset_id for fault in self.faults} - asset_ids
        if missing_fault_assets:
            raise ValueError(f"faults reference unknown assets: {sorted(missing_fault_assets)}")
        return self


ScenarioState = Literal[
    "normal",
    "degrading",
    "alarm-flood",
    "investigation",
    "approval",
    "recovery",
    "paused",
]


class ScenarioRun(ContractModel):
    contract_version: Literal["0.1"] = "0.1"
    run_id: str
    scenario_id: str
    tenant_id: str
    seed: int = Field(ge=0)
    state: ScenarioState
    started_at: datetime
    simulation_time: datetime
    tick: int = Field(ge=0)
    active_faults: list[str] = Field(default_factory=list)
    synthetic: Literal[True] = True


class IndustrialCaseRecord(ContractModel):
    contract_version: Literal["0.1"] = "0.1"
    case_id: str
    tenant_id: str
    title: str
    summary: str
    asset_ids: list[str] = Field(default_factory=list)
    tag_ids: list[str] = Field(default_factory=list)
    document_ids: list[str] = Field(default_factory=list)
    root_cause: str
    outcome: str
    occurred_at: datetime
    synthetic: Literal[True] = True


class ApprovalRecord(ContractModel):
    contract_version: Literal["0.1"] = "0.1"
    approval_id: str
    tenant_id: str
    run_id: str
    action_type: Literal[
        "draft-inspection-work-order",
        "draft-shift-handover",
        "save-case",
    ]
    status: Literal["requested", "approved", "rejected"]
    requested_at: datetime
    decided_at: datetime | None
    decided_by: str | None
    rationale: str | None = Field(default=None, max_length=2000)
