from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, Float, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from ..storage import Base


class ScenarioManifestRecord(Base):
    __tablename__ = "industrial_scenario_manifests"
    __table_args__ = (UniqueConstraint("tenant_id", "scenario_id", "version"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    scenario_id: Mapped[str] = mapped_column(String(128), index=True)
    version: Mapped[str] = mapped_column(String(32))
    payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    checksum: Mapped[str] = mapped_column(String(64))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class IndustrialAssetRecord(Base):
    __tablename__ = "industrial_assets"
    __table_args__ = (UniqueConstraint("tenant_id", "asset_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    asset_id: Mapped[str] = mapped_column(String(128), index=True)
    kind: Mapped[str] = mapped_column(String(32), index=True)
    name: Mapped[str] = mapped_column(String(256))
    parent_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    aliases: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    attributes: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class IndustrialTagRecord(Base):
    __tablename__ = "industrial_tags"
    __table_args__ = (UniqueConstraint("tenant_id", "tag_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    tag_id: Mapped[str] = mapped_column(String(128), index=True)
    asset_id: Mapped[str] = mapped_column(String(128), index=True)
    name: Mapped[str] = mapped_column(String(256))
    unit: Mapped[str] = mapped_column(String(32))
    data_type: Mapped[str] = mapped_column(String(16))
    cadence_seconds: Mapped[float] = mapped_column(Float)
    limits: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    aliases: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)


class IndustrialScenarioRunRecord(Base):
    __tablename__ = "industrial_scenario_runs"

    run_id: Mapped[str] = mapped_column(String(160), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    scenario_id: Mapped[str] = mapped_column(String(128), index=True)
    seed: Mapped[int] = mapped_column(Integer)
    state: Mapped[str] = mapped_column(String(32), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    simulation_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    tick: Mapped[int] = mapped_column(Integer)
    active_faults: Mapped[list[str]] = mapped_column(JSON, default=list)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class IndustrialObservationRecord(Base):
    __tablename__ = "industrial_observations"
    __table_args__ = (UniqueConstraint("tenant_id", "run_id", "tag_id", "sequence"),)

    observation_id: Mapped[str] = mapped_column(String(256), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    run_id: Mapped[str] = mapped_column(String(160), index=True)
    tag_id: Mapped[str] = mapped_column(String(128), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    value: Mapped[Any] = mapped_column(JSON, nullable=True)
    quality: Mapped[str] = mapped_column(String(32), index=True)
    sequence: Mapped[int] = mapped_column(Integer)
    synthetic: Mapped[bool]
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class IndustrialAlarmRecord(Base):
    __tablename__ = "industrial_alarms"

    alarm_id: Mapped[str] = mapped_column(String(256), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    run_id: Mapped[str] = mapped_column(String(160), index=True)
    asset_id: Mapped[str] = mapped_column(String(128), index=True)
    tag_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    priority: Mapped[str] = mapped_column(String(16), index=True)
    state: Mapped[str] = mapped_column(String(32), index=True)
    message: Mapped[str] = mapped_column(Text)
    cause_event_id: Mapped[str | None] = mapped_column(String(256), nullable=True)
    synthetic: Mapped[bool]


class IndustrialCaseRecordDb(Base):
    __tablename__ = "industrial_cases"
    __table_args__ = (UniqueConstraint("tenant_id", "case_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    case_id: Mapped[str] = mapped_column(String(128), index=True)
    title: Mapped[str] = mapped_column(String(256))
    summary: Mapped[str] = mapped_column(Text)
    asset_ids: Mapped[list[str]] = mapped_column(JSON, default=list)
    tag_ids: Mapped[list[str]] = mapped_column(JSON, default=list)
    document_ids: Mapped[list[str]] = mapped_column(JSON, default=list)
    root_cause: Mapped[str] = mapped_column(Text)
    outcome: Mapped[str] = mapped_column(Text)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    synthetic: Mapped[bool]


class IndustrialApprovalRecordDb(Base):
    __tablename__ = "industrial_approvals"

    approval_id: Mapped[str] = mapped_column(String(160), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    run_id: Mapped[str] = mapped_column(String(160), index=True)
    action_type: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(32), index=True)
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    requested_by: Mapped[str] = mapped_column(String(128))
    draft: Mapped[dict[str, Any]] = mapped_column(JSON)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    decided_by: Mapped[str | None] = mapped_column(String(128), nullable=True)
    rationale: Mapped[str | None] = mapped_column(Text, nullable=True)


class ThreadEdgeRecord(Base):
    __tablename__ = "industrial_thread_edges"
    __table_args__ = (
        UniqueConstraint(
            "tenant_id",
            "source_kind",
            "source_id",
            "relation",
            "target_kind",
            "target_id",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    source_kind: Mapped[str] = mapped_column(String(32), index=True)
    source_id: Mapped[str] = mapped_column(String(160), index=True)
    relation: Mapped[str] = mapped_column(String(64), index=True)
    target_kind: Mapped[str] = mapped_column(String(32), index=True)
    target_id: Mapped[str] = mapped_column(String(160), index=True)
    source: Mapped[str] = mapped_column(String(64))
    confidence: Mapped[float] = mapped_column(Float)
    confirmed: Mapped[bool]
    effective_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class PulseConnectorRecord(Base):
    __tablename__ = "industrial_pulse_connectors"
    __table_args__ = (UniqueConstraint("tenant_id", "connector_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    connector_id: Mapped[str] = mapped_column(String(128), index=True)
    status: Mapped[str] = mapped_column(String(32))
    last_event_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    lag_seconds: Mapped[float] = mapped_column(Float)
    quality: Mapped[dict[str, int]] = mapped_column(JSON, default=dict)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class FlowCheckpointRecord(Base):
    __tablename__ = "industrial_flow_checkpoints"
    __table_args__ = (UniqueConstraint("tenant_id", "flow_key"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    flow_key: Mapped[str] = mapped_column(String(256), index=True)
    checksum: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(32))
    metrics: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
