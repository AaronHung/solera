from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import delete, func, or_, select

from ..industrial_contracts import IndustrialCaseRecord, ScenarioManifest
from ..storage import Database
from .models import (
    FlowCheckpointRecord,
    IndustrialAlarmRecord,
    IndustrialApprovalRecordDb,
    IndustrialAssetRecord,
    IndustrialCaseRecordDb,
    IndustrialObservationRecord,
    IndustrialScenarioRunRecord,
    IndustrialTagRecord,
    PulseConnectorRecord,
    ScenarioManifestRecord,
    ThreadEdgeRecord,
)


class DataHubRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    async def seed_manifest(self, manifest: ScenarioManifest) -> dict[str, int | str]:
        payload = manifest.model_dump(by_alias=True, mode="json")
        checksum = hashlib.sha256(
            json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
        ).hexdigest()
        now = datetime.now(UTC)
        assets_created = 0
        tags_created = 0
        async with self.database.sessions() as session:
            result = await session.execute(
                select(ScenarioManifestRecord).where(
                    ScenarioManifestRecord.tenant_id == manifest.tenant_id,
                    ScenarioManifestRecord.scenario_id == manifest.scenario_id,
                    ScenarioManifestRecord.version == manifest.manifest_version,
                )
            )
            scenario = result.scalar_one_or_none()
            if scenario is None:
                session.add(
                    ScenarioManifestRecord(
                        tenant_id=manifest.tenant_id,
                        scenario_id=manifest.scenario_id,
                        version=manifest.manifest_version,
                        payload=payload,
                        checksum=checksum,
                        updated_at=now,
                    )
                )
            else:
                scenario.payload = payload
                scenario.checksum = checksum
                scenario.updated_at = now

            for asset in manifest.assets:
                existing = await session.scalar(
                    select(IndustrialAssetRecord).where(
                        IndustrialAssetRecord.tenant_id == asset.tenant_id,
                        IndustrialAssetRecord.asset_id == asset.asset_id,
                    )
                )
                asset_payload = asset.model_dump(by_alias=True, mode="json")
                if existing is None:
                    session.add(
                        IndustrialAssetRecord(
                            tenant_id=asset.tenant_id,
                            asset_id=asset.asset_id,
                            kind=asset.kind,
                            name=asset.name,
                            parent_id=asset.parent_id,
                            aliases=asset_payload["aliases"],
                            attributes=asset.attributes,
                        )
                    )
                    assets_created += 1
                else:
                    existing.kind = asset.kind
                    existing.name = asset.name
                    existing.parent_id = asset.parent_id
                    existing.aliases = asset_payload["aliases"]
                    existing.attributes = asset.attributes

            for tag in manifest.tags:
                existing = await session.scalar(
                    select(IndustrialTagRecord).where(
                        IndustrialTagRecord.tenant_id == tag.tenant_id,
                        IndustrialTagRecord.tag_id == tag.tag_id,
                    )
                )
                tag_payload = tag.model_dump(by_alias=True, mode="json")
                limits = tag.limits.model_dump(by_alias=True) if tag.limits else None
                if existing is None:
                    session.add(
                        IndustrialTagRecord(
                            tenant_id=tag.tenant_id,
                            tag_id=tag.tag_id,
                            asset_id=tag.asset_id,
                            name=tag.name,
                            unit=tag.unit,
                            data_type=tag.data_type,
                            cadence_seconds=tag.cadence_seconds,
                            limits=limits,
                            aliases=tag_payload["aliases"],
                        )
                    )
                    tags_created += 1
                else:
                    existing.asset_id = tag.asset_id
                    existing.name = tag.name
                    existing.unit = tag.unit
                    existing.data_type = tag.data_type
                    existing.cadence_seconds = tag.cadence_seconds
                    existing.limits = limits
                    existing.aliases = tag_payload["aliases"]
            await session.commit()
        return {
            "checksum": checksum,
            "assetsCreated": assets_created,
            "tagsCreated": tags_created,
        }

    async def ingest_frame(self, frame: Any) -> dict[str, int]:
        now = datetime.now(UTC)
        observations_created = 0
        alarms_created = 0
        async with self.database.sessions() as session:
            run = await session.get(IndustrialScenarioRunRecord, frame.run.run_id)
            if run is None:
                run = IndustrialScenarioRunRecord(
                    run_id=frame.run.run_id,
                    tenant_id=frame.run.tenant_id,
                    scenario_id=frame.run.scenario_id,
                    seed=frame.run.seed,
                    state=frame.run.state,
                    started_at=frame.run.started_at,
                    simulation_time=frame.run.simulation_time,
                    tick=frame.run.tick,
                    active_faults=frame.run.active_faults,
                    updated_at=now,
                )
                session.add(run)
            else:
                run.state = frame.run.state
                run.simulation_time = frame.run.simulation_time
                run.tick = frame.run.tick
                run.active_faults = frame.run.active_faults
                run.updated_at = now

            for observation in frame.observations:
                if (
                    await session.get(
                        IndustrialObservationRecord,
                        observation.observation_id,
                    )
                    is not None
                ):
                    continue
                session.add(
                    IndustrialObservationRecord(
                        observation_id=observation.observation_id,
                        tenant_id=observation.tenant_id,
                        run_id=observation.run_id,
                        tag_id=observation.tag_id,
                        timestamp=observation.timestamp,
                        value=observation.value,
                        quality=observation.quality,
                        sequence=observation.sequence,
                        synthetic=observation.synthetic,
                        ingested_at=now,
                    )
                )
                observations_created += 1

            for alarm in frame.alarms:
                if await session.get(IndustrialAlarmRecord, alarm.alarm_id) is not None:
                    continue
                session.add(
                    IndustrialAlarmRecord(
                        alarm_id=alarm.alarm_id,
                        tenant_id=alarm.tenant_id,
                        run_id=alarm.run_id,
                        asset_id=alarm.asset_id,
                        tag_id=alarm.tag_id,
                        occurred_at=alarm.occurred_at,
                        priority=alarm.priority,
                        state=alarm.state,
                        message=alarm.message,
                        cause_event_id=alarm.cause_event_id,
                        synthetic=alarm.synthetic,
                    )
                )
                alarms_created += 1
            await session.commit()
        return {
            "observationsCreated": observations_created,
            "alarmsCreated": alarms_created,
        }

    async def reset_run(self, tenant_id: str, run_id: str) -> None:
        async with self.database.sessions() as session:
            await session.execute(
                delete(IndustrialObservationRecord).where(
                    IndustrialObservationRecord.tenant_id == tenant_id,
                    IndustrialObservationRecord.run_id == run_id,
                )
            )
            await session.execute(
                delete(IndustrialAlarmRecord).where(
                    IndustrialAlarmRecord.tenant_id == tenant_id,
                    IndustrialAlarmRecord.run_id == run_id,
                )
            )
            await session.execute(
                delete(IndustrialScenarioRunRecord).where(
                    IndustrialScenarioRunRecord.tenant_id == tenant_id,
                    IndustrialScenarioRunRecord.run_id == run_id,
                )
            )
            await session.commit()

    async def save_cases(self, cases: list[IndustrialCaseRecord]) -> int:
        created = 0
        async with self.database.sessions() as session:
            for case in cases:
                existing = await session.scalar(
                    select(IndustrialCaseRecordDb).where(
                        IndustrialCaseRecordDb.tenant_id == case.tenant_id,
                        IndustrialCaseRecordDb.case_id == case.case_id,
                    )
                )
                if existing is None:
                    session.add(
                        IndustrialCaseRecordDb(
                            tenant_id=case.tenant_id,
                            case_id=case.case_id,
                            title=case.title,
                            summary=case.summary,
                            asset_ids=case.asset_ids,
                            tag_ids=case.tag_ids,
                            document_ids=case.document_ids,
                            root_cause=case.root_cause,
                            outcome=case.outcome,
                            occurred_at=case.occurred_at,
                            synthetic=case.synthetic,
                        )
                    )
                    created += 1
                else:
                    existing.title = case.title
                    existing.summary = case.summary
                    existing.asset_ids = case.asset_ids
                    existing.tag_ids = case.tag_ids
                    existing.document_ids = case.document_ids
                    existing.root_cause = case.root_cause
                    existing.outcome = case.outcome
            await session.commit()
        return created

    async def link(
        self,
        *,
        tenant_id: str,
        source_kind: str,
        source_id: str,
        relation: str,
        target_kind: str,
        target_id: str,
        source: str = "loop1-fixture",
        confidence: float = 1.0,
        confirmed: bool = True,
    ) -> bool:
        async with self.database.sessions() as session:
            existing = await session.scalar(
                select(ThreadEdgeRecord).where(
                    ThreadEdgeRecord.tenant_id == tenant_id,
                    ThreadEdgeRecord.source_kind == source_kind,
                    ThreadEdgeRecord.source_id == source_id,
                    ThreadEdgeRecord.relation == relation,
                    ThreadEdgeRecord.target_kind == target_kind,
                    ThreadEdgeRecord.target_id == target_id,
                )
            )
            if existing is not None:
                return False
            session.add(
                ThreadEdgeRecord(
                    tenant_id=tenant_id,
                    source_kind=source_kind,
                    source_id=source_id,
                    relation=relation,
                    target_kind=target_kind,
                    target_id=target_id,
                    source=source,
                    confidence=confidence,
                    confirmed=confirmed,
                    effective_at=datetime.now(UTC),
                )
            )
            await session.commit()
            return True

    async def thread(
        self,
        tenant_id: str,
        entity_kind: str,
        entity_id: str,
    ) -> list[dict[str, Any]]:
        async with self.database.sessions() as session:
            result = await session.execute(
                select(ThreadEdgeRecord).where(
                    ThreadEdgeRecord.tenant_id == tenant_id,
                    or_(
                        (
                            ThreadEdgeRecord.source_kind == entity_kind
                        )
                        & (ThreadEdgeRecord.source_id == entity_id),
                        (
                            ThreadEdgeRecord.target_kind == entity_kind
                        )
                        & (ThreadEdgeRecord.target_id == entity_id),
                    ),
                )
            )
            return [
                {
                    "sourceKind": edge.source_kind,
                    "sourceId": edge.source_id,
                    "relation": edge.relation,
                    "targetKind": edge.target_kind,
                    "targetId": edge.target_id,
                    "source": edge.source,
                    "confidence": edge.confidence,
                    "confirmed": edge.confirmed,
                }
                for edge in result.scalars()
            ]

    async def snapshot(self, tenant_id: str, run_id: str) -> dict[str, Any] | None:
        async with self.database.sessions() as session:
            run = await session.get(IndustrialScenarioRunRecord, run_id)
            if run is None or run.tenant_id != tenant_id:
                return None
            latest_sequence = await session.scalar(
                select(func.max(IndustrialObservationRecord.sequence)).where(
                    IndustrialObservationRecord.tenant_id == tenant_id,
                    IndustrialObservationRecord.run_id == run_id,
                )
            )
            observations = []
            if latest_sequence is not None:
                result = await session.execute(
                    select(IndustrialObservationRecord, IndustrialTagRecord)
                    .join(
                        IndustrialTagRecord,
                        (
                            IndustrialTagRecord.tenant_id
                            == IndustrialObservationRecord.tenant_id
                        )
                        & (
                            IndustrialTagRecord.tag_id
                            == IndustrialObservationRecord.tag_id
                        ),
                    )
                    .where(
                        IndustrialObservationRecord.tenant_id == tenant_id,
                        IndustrialObservationRecord.run_id == run_id,
                        IndustrialObservationRecord.sequence == latest_sequence,
                    )
                )
                observations = [
                    {
                        "tagId": observation.tag_id,
                        "assetId": tag.asset_id,
                        "name": tag.name,
                        "unit": tag.unit,
                        "value": observation.value,
                        "quality": observation.quality,
                        "timestamp": observation.timestamp.isoformat(),
                    }
                    for observation, tag in result.all()
                ]
            alarm_result = await session.execute(
                select(IndustrialAlarmRecord)
                .where(
                    IndustrialAlarmRecord.tenant_id == tenant_id,
                    IndustrialAlarmRecord.run_id == run_id,
                )
                .order_by(IndustrialAlarmRecord.occurred_at)
            )
            return {
                "synthetic": True,
                "run": {
                    "runId": run.run_id,
                    "scenarioId": run.scenario_id,
                    "state": run.state,
                    "tick": run.tick,
                    "simulationTime": run.simulation_time.isoformat(),
                    "activeFaults": run.active_faults,
                },
                "observations": observations,
                "alarms": [
                    {
                        "alarmId": alarm.alarm_id,
                        "assetId": alarm.asset_id,
                        "tagId": alarm.tag_id,
                        "occurredAt": alarm.occurred_at.isoformat(),
                        "priority": alarm.priority,
                        "state": alarm.state,
                        "message": alarm.message,
                        "causeEventId": alarm.cause_event_id,
                    }
                    for alarm in alarm_result.scalars()
                ],
            }

    async def signal_history(
        self,
        *,
        tenant_id: str,
        run_id: str,
        tag_ids: list[str],
        limit_per_tag: int = 300,
    ) -> dict[str, list[dict[str, Any]]]:
        result_by_tag: dict[str, list[dict[str, Any]]] = {}
        async with self.database.sessions() as session:
            for tag_id in tag_ids:
                result = await session.execute(
                    select(IndustrialObservationRecord)
                    .where(
                        IndustrialObservationRecord.tenant_id == tenant_id,
                        IndustrialObservationRecord.run_id == run_id,
                        IndustrialObservationRecord.tag_id == tag_id,
                    )
                    .order_by(IndustrialObservationRecord.sequence.desc())
                    .limit(limit_per_tag)
                )
                observations = list(reversed(list(result.scalars())))
                result_by_tag[tag_id] = [
                    {
                        "observationId": observation.observation_id,
                        "tagId": observation.tag_id,
                        "timestamp": observation.timestamp.isoformat(),
                        "value": observation.value,
                        "quality": observation.quality,
                        "sequence": observation.sequence,
                        "synthetic": observation.synthetic,
                    }
                    for observation in observations
                ]
        return result_by_tag

    async def list_alarms(
        self,
        *,
        tenant_id: str,
        run_id: str,
    ) -> list[dict[str, Any]]:
        async with self.database.sessions() as session:
            result = await session.execute(
                select(IndustrialAlarmRecord)
                .where(
                    IndustrialAlarmRecord.tenant_id == tenant_id,
                    IndustrialAlarmRecord.run_id == run_id,
                )
                .order_by(IndustrialAlarmRecord.occurred_at)
            )
            return [
                {
                    "alarmId": alarm.alarm_id,
                    "assetId": alarm.asset_id,
                    "tagId": alarm.tag_id,
                    "occurredAt": alarm.occurred_at.isoformat(),
                    "priority": alarm.priority,
                    "state": alarm.state,
                    "message": alarm.message,
                    "causeEventId": alarm.cause_event_id,
                    "synthetic": alarm.synthetic,
                }
                for alarm in result.scalars()
            ]

    async def search_cases(
        self,
        *,
        tenant_id: str,
        asset_ids: set[str],
        tag_ids: set[str],
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        async with self.database.sessions() as session:
            result = await session.execute(
                select(IndustrialCaseRecordDb).where(
                    IndustrialCaseRecordDb.tenant_id == tenant_id
                )
            )
            scored: list[tuple[float, IndustrialCaseRecordDb]] = []
            for case in result.scalars():
                asset_overlap = len(asset_ids.intersection(case.asset_ids))
                tag_overlap = len(tag_ids.intersection(case.tag_ids))
                score = asset_overlap * 2 + tag_overlap
                if score:
                    scored.append((float(score), case))
            scored.sort(key=lambda item: (-item[0], item[1].case_id))
            return [
                {
                    "caseId": case.case_id,
                    "title": case.title,
                    "summary": case.summary,
                    "assetIds": case.asset_ids,
                    "tagIds": case.tag_ids,
                    "documentIds": case.document_ids,
                    "rootCause": case.root_cause,
                    "outcome": case.outcome,
                    "occurredAt": case.occurred_at.isoformat(),
                    "score": score,
                    "synthetic": case.synthetic,
                }
                for score, case in scored[:limit]
            ]

    async def request_approval(
        self,
        *,
        approval_id: str,
        tenant_id: str,
        run_id: str,
        action_type: str,
        requested_by: str,
        draft: dict[str, Any],
    ) -> dict[str, Any]:
        now = datetime.now(UTC)
        async with self.database.sessions() as session:
            existing = await session.get(IndustrialApprovalRecordDb, approval_id)
            if existing is None:
                existing = IndustrialApprovalRecordDb(
                    approval_id=approval_id,
                    tenant_id=tenant_id,
                    run_id=run_id,
                    action_type=action_type,
                    status="requested",
                    requested_at=now,
                    requested_by=requested_by,
                    draft=draft,
                    decided_at=None,
                    decided_by=None,
                    rationale=None,
                )
                session.add(existing)
                await session.commit()
            elif existing.tenant_id != tenant_id:
                raise KeyError("approval not found")
            return self._approval_payload(existing)

    async def decide_approval(
        self,
        *,
        approval_id: str,
        tenant_id: str,
        decided_by: str,
        decision: str,
        rationale: str | None,
    ) -> dict[str, Any]:
        if decision not in {"approved", "rejected"}:
            raise ValueError("approval decision must be approved or rejected")
        async with self.database.sessions() as session:
            record = await session.get(IndustrialApprovalRecordDb, approval_id)
            if record is None or record.tenant_id != tenant_id:
                raise KeyError("approval not found")
            if record.status != "requested":
                raise ValueError("approval has already been decided")
            record.status = decision
            record.decided_at = datetime.now(UTC)
            record.decided_by = decided_by
            record.rationale = rationale
            await session.commit()
            return self._approval_payload(record)

    @staticmethod
    def _approval_payload(record: IndustrialApprovalRecordDb) -> dict[str, Any]:
        return {
            "contractVersion": "0.1",
            "approvalId": record.approval_id,
            "tenantId": record.tenant_id,
            "runId": record.run_id,
            "actionType": record.action_type,
            "status": record.status,
            "requestedAt": record.requested_at.isoformat(),
            "requestedBy": record.requested_by,
            "draft": record.draft,
            "decidedAt": record.decided_at.isoformat() if record.decided_at else None,
            "decidedBy": record.decided_by,
            "rationale": record.rationale,
            "execution": "draft-only; no external write or plant control",
        }

    async def update_pulse(
        self,
        *,
        tenant_id: str,
        connector_id: str,
        run_id: str,
    ) -> dict[str, Any]:
        now = datetime.now(UTC)
        async with self.database.sessions() as session:
            run = await session.get(IndustrialScenarioRunRecord, run_id)
            if run is None or run.tenant_id != tenant_id:
                raise KeyError(f"unknown scenario run: {run_id}")
            latest_sequence = await session.scalar(
                select(func.max(IndustrialObservationRecord.sequence)).where(
                    IndustrialObservationRecord.tenant_id == tenant_id,
                    IndustrialObservationRecord.run_id == run_id,
                )
            )
            quality = {"good": 0, "bad": 0, "questionable": 0, "missing": 0}
            last_event_at = None
            if latest_sequence is not None:
                result = await session.execute(
                    select(IndustrialObservationRecord).where(
                        IndustrialObservationRecord.tenant_id == tenant_id,
                        IndustrialObservationRecord.run_id == run_id,
                        IndustrialObservationRecord.sequence == latest_sequence,
                    )
                )
                latest = list(result.scalars())
                for observation in latest:
                    quality[observation.quality] += 1
                if latest:
                    last_event_at = max(item.timestamp for item in latest)
            lag_seconds = (
                max(0.0, (run.simulation_time - last_event_at).total_seconds())
                if last_event_at
                else float("inf")
            )
            status = "healthy" if lag_seconds <= 5 and quality["bad"] == 0 else "degraded"
            existing = await session.scalar(
                select(PulseConnectorRecord).where(
                    PulseConnectorRecord.tenant_id == tenant_id,
                    PulseConnectorRecord.connector_id == connector_id,
                )
            )
            details = {
                "clockMode": "synthetic-replay",
                "runId": run_id,
                "scenarioState": run.state,
                "tick": run.tick,
                "synthetic": True,
            }
            if existing is None:
                existing = PulseConnectorRecord(
                    tenant_id=tenant_id,
                    connector_id=connector_id,
                    status=status,
                    last_event_at=last_event_at,
                    observed_at=now,
                    lag_seconds=lag_seconds,
                    quality=quality,
                    details=details,
                )
                session.add(existing)
            else:
                existing.status = status
                existing.last_event_at = last_event_at
                existing.observed_at = now
                existing.lag_seconds = lag_seconds
                existing.quality = quality
                existing.details = details
            await session.commit()
            return {
                "connectorId": connector_id,
                "status": status,
                "lastEventAt": last_event_at.isoformat() if last_event_at else None,
                "observedAt": now.isoformat(),
                "lagSeconds": lag_seconds,
                "quality": quality,
                "details": details,
            }

    async def complete_checkpoint(
        self,
        *,
        tenant_id: str,
        flow_key: str,
        checksum: str,
        metrics: dict[str, Any],
    ) -> bool:
        async with self.database.sessions() as session:
            existing = await session.scalar(
                select(FlowCheckpointRecord).where(
                    FlowCheckpointRecord.tenant_id == tenant_id,
                    FlowCheckpointRecord.flow_key == flow_key,
                )
            )
            if existing is not None and existing.checksum == checksum:
                return False
            if existing is None:
                existing = FlowCheckpointRecord(
                    tenant_id=tenant_id,
                    flow_key=flow_key,
                    checksum=checksum,
                    status="completed",
                    metrics=metrics,
                    completed_at=datetime.now(UTC),
                )
                session.add(existing)
            else:
                existing.checksum = checksum
                existing.status = "completed"
                existing.metrics = metrics
                existing.completed_at = datetime.now(UTC)
            await session.commit()
            return True
