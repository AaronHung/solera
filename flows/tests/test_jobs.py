from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest
from easy_pi import DataPoint, PointQuality, TagSeries
from solera_api.storage import (
    AggregateRecord,
    Database,
    EvalCaseRecord,
    FeedbackRepository,
    FlowRepository,
    RetentionRepository,
    TraceRecord,
    TraceRepository,
)
from solera_flows import (
    run_nightly_aggregates,
    run_retention_cleanup,
    run_trace_to_eval,
)
from sqlalchemy import func, select


class FakeConnector:
    async def recorded(
        self,
        tag: str,
        *,
        start: datetime,
        end: datetime,
        max_points: int = 1000,
        boundary_type: int = 2,
    ) -> TagSeries:
        return TagSeries(
            tag=tag,
            points=[
                DataPoint(timestamp=start, value=10.0, quality=PointQuality.GOOD),
                DataPoint(timestamp=end, value=20.0, quality=PointQuality.GOOD),
            ],
        )


@pytest.mark.asyncio
async def test_nightly_aggregate_is_idempotent_for_same_window() -> None:
    database = Database("sqlite+aiosqlite:///:memory:")
    await database.initialize()
    repository = FlowRepository(database)
    now = datetime(2026, 7, 18, 3, tzinfo=UTC)
    try:
        first = await run_nightly_aggregates(
            repository=repository,
            connector=FakeConnector(),
            tenant_id="tenant-demo",
            tags=["CDT158", "CDT159"],
            now=now,
        )
        second = await run_nightly_aggregates(
            repository=repository,
            connector=FakeConnector(),
            tenant_id="tenant-demo",
            tags=["CDT158", "CDT159"],
            now=now,
        )
        async with database.sessions() as session:
            count = await session.scalar(select(func.count()).select_from(AggregateRecord))
    finally:
        await database.close()

    assert first["processed"] == 2
    assert second["processed"] == 2
    assert count == 2


@pytest.mark.asyncio
async def test_feedback_trace_becomes_eval_case_once() -> None:
    database = Database("sqlite+aiosqlite:///:memory:")
    await database.initialize()
    traces = TraceRepository(database)
    feedback = FeedbackRepository(database)
    flow = FlowRepository(database)
    try:
        await traces.start(
            trace_id="trace-1",
            tenant_id="tenant-demo",
            actor_id="user-1",
            question="Compare CDT158 and CDT159",
        )
        await traces.finish(
            trace_id="trace-1",
            status="completed",
            events=[{"type": "complete"}],
        )
        await feedback.add(
            feedback_id="feedback-1",
            tenant_id="tenant-demo",
            actor_id="user-1",
            trace_id="trace-1",
            rating="accepted",
            comment=None,
        )
        first = await run_trace_to_eval(repository=flow, tenant_id="tenant-demo")
        second = await run_trace_to_eval(repository=flow, tenant_id="tenant-demo")
        async with database.sessions() as session:
            count = await session.scalar(select(func.count()).select_from(EvalCaseRecord))
    finally:
        await database.close()

    assert first["createdEvalCases"] == 1
    assert second["createdEvalCases"] == 0
    assert count == 1


@pytest.mark.asyncio
async def test_retention_cleanup_removes_expired_trace() -> None:
    database = Database("sqlite+aiosqlite:///:memory:")
    await database.initialize()
    now = datetime(2026, 7, 18, tzinfo=UTC)
    try:
        async with database.sessions() as session:
            session.add(
                TraceRecord(
                    trace_id="trace-old",
                    tenant_id="tenant-demo",
                    actor_id="user-1",
                    question="old",
                    status="completed",
                    events=[],
                    created_at=now - timedelta(days=31),
                    completed_at=now - timedelta(days=31),
                )
            )
            await session.commit()
        result = await run_retention_cleanup(
            repository=RetentionRepository(database),
            tenant_id="tenant-demo",
            now=now,
            trace_days=30,
        )
    finally:
        await database.close()

    assert result["tracesDeleted"] == 1
