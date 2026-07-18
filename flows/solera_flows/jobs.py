from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Protocol
from uuid import uuid4

from easy_pi import TagSeries
from solera_api.analytics import CALCULATION_VERSION, summarize
from solera_api.evidence import create_timeseries_evidence
from solera_api.storage import FlowRepository, RetentionRepository


class RecordedConnector(Protocol):
    async def recorded(
        self,
        tag: str,
        *,
        start: datetime,
        end: datetime,
        max_points: int = 1000,
        boundary_type: int = 2,
    ) -> TagSeries: ...


async def run_nightly_aggregates(
    *,
    repository: FlowRepository,
    connector: RecordedConnector,
    tenant_id: str,
    tags: list[str],
    now: datetime | None = None,
    timezone: str = "Asia/Taipei",
) -> dict[str, object]:
    end = (now or datetime.now(UTC)).replace(minute=0, second=0, microsecond=0)
    if end.tzinfo is None:
        raise ValueError("nightly aggregate time must be timezone aware")
    start = end - timedelta(hours=24)
    run_id = f"flow-{uuid4()}"
    await repository.start(run_id, tenant_id, "nightly-aggregate")
    processed = 0
    failures: dict[str, str] = {}
    try:
        for tag in tags:
            try:
                series = await connector.recorded(
                    tag,
                    start=start,
                    end=end,
                    max_points=5000,
                )
                query_id = f"flow-query-{uuid4()}"
                evidence = create_timeseries_evidence(
                    tenant_id=tenant_id,
                    source_system="easy-pi",
                    series=series,
                    start=start,
                    end=end,
                    timezone=timezone,
                    query_id=query_id,
                    retrieved_at=end,
                    aggregation="24h-summary",
                )
                await repository.save_aggregate(
                    tenant_id=tenant_id,
                    tag=tag,
                    window_start=start,
                    window_end=end,
                    version=CALCULATION_VERSION,
                    summary=summarize(series).model_dump(by_alias=True, mode="json"),
                    evidence=evidence.model_dump(by_alias=True, mode="json"),
                )
                processed += 1
            except Exception as exc:
                failures[tag] = type(exc).__name__
        status = "completed" if not failures else "partial"
        metrics = {
            "requested": len(tags),
            "processed": processed,
            "failed": len(failures),
            "failures": failures,
            "windowStart": start.isoformat(),
            "windowEnd": end.isoformat(),
        }
        await repository.finish(run_id, status=status, metrics=metrics)
        return {"runId": run_id, "status": status, **metrics}
    except Exception:
        await repository.finish(
            run_id,
            status="failed",
            metrics={"requested": len(tags), "processed": processed},
            error_code="FLOW_INTERNAL_ERROR",
        )
        raise


async def run_trace_to_eval(
    *,
    repository: FlowRepository,
    tenant_id: str,
) -> dict[str, object]:
    run_id = f"flow-{uuid4()}"
    await repository.start(run_id, tenant_id, "trace-to-eval")
    try:
        created = await repository.export_feedback_to_evals(tenant_id)
        metrics = {"createdEvalCases": created}
        await repository.finish(run_id, status="completed", metrics=metrics)
        return {"runId": run_id, "status": "completed", **metrics}
    except Exception:
        await repository.finish(
            run_id,
            status="failed",
            metrics={},
            error_code="EVAL_EXPORT_ERROR",
        )
        raise


async def run_retention_cleanup(
    *,
    repository: RetentionRepository,
    tenant_id: str,
    now: datetime | None = None,
    trace_days: int = 30,
    audit_days: int = 365,
    aggregate_days: int = 90,
) -> dict[str, int]:
    return await repository.cleanup(
        tenant_id=tenant_id,
        now=now or datetime.now(UTC),
        trace_days=trace_days,
        audit_days=audit_days,
        aggregate_days=aggregate_days,
    )
