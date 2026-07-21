from __future__ import annotations

from collections import defaultdict
from typing import Any

from ...data_hub import DataHubRepository
from ...storage import KnowledgeRepository


class Loop1ReadOnlyTools:
    """Typed, tenant-scoped tools used by the LOOP-1 bounded orchestrator."""

    def __init__(
        self,
        *,
        data_hub: DataHubRepository,
        knowledge: KnowledgeRepository,
    ) -> None:
        self.data_hub = data_hub
        self.knowledge = knowledge

    async def query_signals(
        self,
        *,
        tenant_id: str,
        run_id: str,
        tag_ids: list[str],
        limit_per_tag: int = 300,
    ) -> dict[str, list[dict[str, Any]]]:
        return await self.data_hub.signal_history(
            tenant_id=tenant_id,
            run_id=run_id,
            tag_ids=tag_ids,
            limit_per_tag=limit_per_tag,
        )

    async def cluster_alarms(
        self,
        *,
        tenant_id: str,
        run_id: str,
    ) -> list[dict[str, Any]]:
        alarms = await self.data_hub.list_alarms(
            tenant_id=tenant_id,
            run_id=run_id,
        )
        grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for alarm in alarms:
            grouped[alarm["causeEventId"] or alarm["alarmId"]].append(alarm)
        clusters = []
        for cause_id, items in grouped.items():
            priorities = {item["priority"] for item in items}
            clusters.append(
                {
                    "clusterId": f"cluster-{len(clusters) + 1}",
                    "causeEventId": cause_id,
                    "startedAt": min(item["occurredAt"] for item in items),
                    "alarmCount": len(items),
                    "criticalAlarmIds": [
                        item["alarmId"] for item in items if item["priority"] == "critical"
                    ],
                    "priorities": sorted(priorities),
                    "assetIds": sorted({item["assetId"] for item in items}),
                    "alarmIds": [item["alarmId"] for item in items],
                    "summary": (
                        f"{len(items)} linked alarms share one synthetic cause event; "
                        "critical alarms remain individually visible."
                    ),
                }
            )
        return clusters

    @staticmethod
    def find_change_points(
        series: dict[str, list[dict[str, Any]]],
    ) -> dict[str, dict[str, Any] | None]:
        change_points: dict[str, dict[str, Any] | None] = {}
        for tag_id, observations in series.items():
            valid = [
                item
                for item in observations
                if item["quality"] == "good" and isinstance(item["value"], int | float)
            ]
            if len(valid) < 20:
                change_points[tag_id] = None
                continue
            baseline_window = valid[: min(60, len(valid) // 2)]
            baseline = sum(float(item["value"]) for item in baseline_window) / len(baseline_window)
            deviations = [abs(float(item["value"]) - baseline) for item in baseline_window]
            noise_band = max(0.01, max(deviations, default=0) * 4)
            engineering_band = max(abs(baseline) * 0.025, noise_band)
            changed = next(
                (
                    item
                    for item in valid[len(baseline_window) :]
                    if abs(float(item["value"]) - baseline) > engineering_band
                ),
                None,
            )
            change_points[tag_id] = (
                {
                    "tagId": tag_id,
                    "observationId": changed["observationId"],
                    "timestamp": changed["timestamp"],
                    "sequence": changed["sequence"],
                    "value": changed["value"],
                    "baseline": round(baseline, 6),
                    "threshold": round(engineering_band, 6),
                    "method": "bounded-baseline-deviation@0.1.0",
                }
                if changed
                else None
            )
        return change_points

    async def get_asset_neighbors(
        self,
        *,
        tenant_id: str,
        asset_id: str,
    ) -> list[dict[str, Any]]:
        return await self.data_hub.thread(tenant_id, "asset", asset_id)

    async def get_document_revision(
        self,
        *,
        tenant_id: str,
        query: str,
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        hits = await self.knowledge.search(tenant_id, query, limit)
        return [
            {
                "documentId": hit.document_id,
                "title": hit.title,
                "section": hit.section,
                "uri": hit.uri,
                "snippet": hit.text[:800],
                "score": hit.score,
                "retrievalVersion": "lexical-retrieval@0.1.0",
            }
            for hit in hits
        ]

    async def search_cases(
        self,
        *,
        tenant_id: str,
        asset_ids: set[str],
        tag_ids: set[str],
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        return await self.data_hub.search_cases(
            tenant_id=tenant_id,
            asset_ids=asset_ids,
            tag_ids=tag_ids,
            limit=limit,
        )

    @staticmethod
    def calculate_kpi(
        *,
        raw_alarm_count: int,
        cluster_count: int,
        off_spec_minutes: float,
        throughput_per_minute: float = 1.6,
        unit_contribution_usd: float = 145,
    ) -> dict[str, Any]:
        return {
            "alarmCompressionRatio": (
                round(raw_alarm_count / cluster_count, 3) if cluster_count else None
            ),
            "syntheticOffSpecExposureUsd": round(
                off_spec_minutes * throughput_per_minute * unit_contribution_usd,
                2,
            ),
            "formulaVersion": "loop1-demo-kpi@0.1.0",
            "assumptions": {
                "offSpecMinutes": off_spec_minutes,
                "throughputPerMinute": throughput_per_minute,
                "unitContributionUsd": unit_contribution_usd,
            },
            "disclosure": "Synthetic estimate — not customer benefit.",
        }

    @staticmethod
    def draft_work_order(
        *,
        evidence_refs: list[str],
    ) -> dict[str, Any]:
        return {
            "actionType": "draft-inspection-work-order",
            "title": "Inspect FV-101 command-position-flow discrepancy",
            "assetId": "component-cooling-valve",
            "priority": "priority",
            "evidenceRefs": evidence_refs,
            "verificationItems": [
                "Authorized operator verifies active alarms and current operating context.",
                (
                    "Qualified technician compares independent command, position, "
                    "and flow indications."
                ),
                (
                    "Supervisor confirms the applicable SOP revision, permit, "
                    "isolation, and dispatch path."
                ),
            ],
            "safetyBoundary": (
                "Draft only. Solera does not issue work, isolate equipment, alter a "
                "setpoint, bypass an interlock, or control the plant."
            ),
        }
