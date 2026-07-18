from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy import JSON, DateTime, String, Text, UniqueConstraint, delete, select, text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.pool import StaticPool

from .contracts import ViewSpec


class Base(DeclarativeBase):
    pass


class CanvasRecord(Base):
    __tablename__ = "canvases"
    __table_args__ = (UniqueConstraint("tenant_id", "view_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    view_id: Mapped[str] = mapped_column(String(128), index=True)
    title: Mapped[str] = mapped_column(String(256))
    spec: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class AuditRecord(Base):
    __tablename__ = "audit_events"

    event_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    actor_id: Mapped[str] = mapped_column(String(128))
    action: Mapped[str] = mapped_column(String(128), index=True)
    resource_type: Mapped[str | None] = mapped_column(String(128), nullable=True)
    resource_id: Mapped[str | None] = mapped_column(String(256), nullable=True)
    outcome: Mapped[str] = mapped_column(String(32))
    reason_code: Mapped[str | None] = mapped_column(String(128), nullable=True)
    trace_id: Mapped[str] = mapped_column(String(128), index=True)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class TraceRecord(Base):
    __tablename__ = "agent_traces"

    trace_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    actor_id: Mapped[str] = mapped_column(String(128))
    question: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(32))
    events: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class FeedbackRecord(Base):
    __tablename__ = "feedback"

    feedback_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    actor_id: Mapped[str] = mapped_column(String(128))
    trace_id: Mapped[str] = mapped_column(String(128), index=True)
    rating: Mapped[str] = mapped_column(String(32))
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class KillSwitchRecord(Base):
    __tablename__ = "kill_switches"
    __table_args__ = (UniqueConstraint("scope_type", "scope_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    scope_type: Mapped[str] = mapped_column(String(32), index=True)
    scope_id: Mapped[str] = mapped_column(String(256), index=True)
    enabled: Mapped[bool]
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class KnowledgeDocumentRecord(Base):
    __tablename__ = "knowledge_documents"
    __table_args__ = (UniqueConstraint("tenant_id", "document_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    document_id: Mapped[str] = mapped_column(String(128), index=True)
    title: Mapped[str] = mapped_column(String(512))
    uri: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class KnowledgeChunkRecord(Base):
    __tablename__ = "knowledge_chunks"

    chunk_id: Mapped[str] = mapped_column(String(160), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    document_id: Mapped[str] = mapped_column(String(128), index=True)
    title: Mapped[str] = mapped_column(String(512))
    uri: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    section: Mapped[str | None] = mapped_column(String(512), nullable=True)
    text: Mapped[str] = mapped_column(Text)
    tokens: Mapped[list[str]] = mapped_column(JSON)


class AggregateRecord(Base):
    __tablename__ = "timeseries_aggregates"
    __table_args__ = (
        UniqueConstraint("tenant_id", "tag", "window_start", "window_end", "version"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    tag: Mapped[str] = mapped_column(String(128), index=True)
    window_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    window_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    version: Mapped[str] = mapped_column(String(64))
    summary: Mapped[dict[str, Any]] = mapped_column(JSON)
    evidence: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class FlowRunRecord(Base):
    __tablename__ = "flow_runs"

    run_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    flow_type: Mapped[str] = mapped_column(String(64), index=True)
    status: Mapped[str] = mapped_column(String(32))
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    metrics: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    error_code: Mapped[str | None] = mapped_column(String(128), nullable=True)


class EvalCaseRecord(Base):
    __tablename__ = "eval_cases"
    __table_args__ = (UniqueConstraint("tenant_id", "trace_id"),)

    eval_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(128), index=True)
    trace_id: Mapped[str] = mapped_column(String(128), index=True)
    question: Mapped[str] = mapped_column(Text)
    rating: Mapped[str] = mapped_column(String(32))
    events: Mapped[list[dict[str, Any]]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class Database:
    def __init__(self, url: str) -> None:
        options: dict[str, Any] = {"pool_pre_ping": True}
        if url.endswith(":memory:"):
            options["poolclass"] = StaticPool
        self.engine: AsyncEngine = create_async_engine(url, **options)
        self.sessions = async_sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

    async def initialize(self) -> None:
        async with self.engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)

    async def close(self) -> None:
        await self.engine.dispose()

    async def ping(self) -> None:
        async with self.engine.connect() as connection:
            await connection.execute(text("SELECT 1"))


class CanvasRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    async def save(self, spec: ViewSpec) -> ViewSpec:
        now = datetime.now(UTC)
        async with self.database.sessions() as session:
            result = await session.execute(
                select(CanvasRecord).where(
                    CanvasRecord.tenant_id == spec.tenant_id,
                    CanvasRecord.view_id == spec.view_id,
                )
            )
            record = result.scalar_one_or_none()
            payload = spec.model_dump(by_alias=True, mode="json")
            if record is None:
                record = CanvasRecord(
                    tenant_id=spec.tenant_id,
                    view_id=spec.view_id,
                    title=spec.title,
                    spec=payload,
                    created_at=now,
                    updated_at=now,
                )
                session.add(record)
            else:
                record.title = spec.title
                record.spec = payload
                record.updated_at = now
            await session.commit()
        return spec

    async def get(self, tenant_id: str, view_id: str) -> ViewSpec | None:
        async with self.database.sessions() as session:
            result = await session.execute(
                select(CanvasRecord).where(
                    CanvasRecord.tenant_id == tenant_id,
                    CanvasRecord.view_id == view_id,
                )
            )
            record = result.scalar_one_or_none()
            return ViewSpec.model_validate(record.spec) if record else None

    async def list(self, tenant_id: str, limit: int = 50) -> list[ViewSpec]:
        async with self.database.sessions() as session:
            result = await session.execute(
                select(CanvasRecord)
                .where(CanvasRecord.tenant_id == tenant_id)
                .order_by(CanvasRecord.updated_at.desc())
                .limit(limit)
            )
            return [ViewSpec.model_validate(record.spec) for record in result.scalars()]


class AuditRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    async def record(
        self,
        *,
        event_id: str,
        tenant_id: str,
        actor_id: str,
        action: str,
        outcome: str,
        trace_id: str,
        resource_type: str | None = None,
        resource_id: str | None = None,
        reason_code: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        async with self.database.sessions() as session:
            session.add(
                AuditRecord(
                    event_id=event_id,
                    occurred_at=datetime.now(UTC),
                    tenant_id=tenant_id,
                    actor_id=actor_id,
                    action=action,
                    resource_type=resource_type,
                    resource_id=resource_id,
                    outcome=outcome,
                    reason_code=reason_code,
                    trace_id=trace_id,
                    metadata_json=metadata or {},
                )
            )
            await session.commit()

    async def list(self, tenant_id: str, limit: int = 100) -> list[dict[str, Any]]:
        async with self.database.sessions() as session:
            result = await session.execute(
                select(AuditRecord)
                .where(AuditRecord.tenant_id == tenant_id)
                .order_by(AuditRecord.occurred_at.desc())
                .limit(limit)
            )
            return [
                {
                    "eventId": item.event_id,
                    "occurredAt": item.occurred_at.isoformat(),
                    "tenantId": item.tenant_id,
                    "actorId": item.actor_id,
                    "action": item.action,
                    "resourceType": item.resource_type,
                    "resourceId": item.resource_id,
                    "outcome": item.outcome,
                    "reasonCode": item.reason_code,
                    "traceId": item.trace_id,
                    "metadata": item.metadata_json,
                }
                for item in result.scalars()
            ]


class TraceRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    async def start(
        self,
        *,
        trace_id: str,
        tenant_id: str,
        actor_id: str,
        question: str,
    ) -> None:
        async with self.database.sessions() as session:
            session.add(
                TraceRecord(
                    trace_id=trace_id,
                    tenant_id=tenant_id,
                    actor_id=actor_id,
                    question=question,
                    status="running",
                    events=[],
                    created_at=datetime.now(UTC),
                )
            )
            await session.commit()

    async def finish(
        self,
        *,
        trace_id: str,
        status: str,
        events: list[dict[str, Any]],
    ) -> None:
        async with self.database.sessions() as session:
            record = await session.get(TraceRecord, trace_id)
            if record is None:
                return
            record.status = status
            record.events = events
            record.completed_at = datetime.now(UTC)
            await session.commit()

    async def get(self, tenant_id: str, trace_id: str) -> dict[str, Any] | None:
        async with self.database.sessions() as session:
            result = await session.execute(
                select(TraceRecord).where(
                    TraceRecord.tenant_id == tenant_id,
                    TraceRecord.trace_id == trace_id,
                )
            )
            item = result.scalar_one_or_none()
            if item is None:
                return None
            return {
                "traceId": item.trace_id,
                "tenantId": item.tenant_id,
                "actorId": item.actor_id,
                "question": item.question,
                "status": item.status,
                "events": item.events,
                "createdAt": item.created_at.isoformat(),
                "completedAt": item.completed_at.isoformat() if item.completed_at else None,
            }


class FeedbackRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    async def add(
        self,
        *,
        feedback_id: str,
        tenant_id: str,
        actor_id: str,
        trace_id: str,
        rating: str,
        comment: str | None,
    ) -> None:
        async with self.database.sessions() as session:
            trace = await session.get(TraceRecord, trace_id)
            if trace is None or trace.tenant_id != tenant_id:
                raise ValueError("trace was not found for tenant")
            session.add(
                FeedbackRecord(
                    feedback_id=feedback_id,
                    tenant_id=tenant_id,
                    actor_id=actor_id,
                    trace_id=trace_id,
                    rating=rating,
                    comment=comment,
                    created_at=datetime.now(UTC),
                )
            )
            await session.commit()


class KillSwitchRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    async def set(self, scope_type: str, scope_id: str, enabled: bool) -> None:
        async with self.database.sessions() as session:
            result = await session.execute(
                select(KillSwitchRecord).where(
                    KillSwitchRecord.scope_type == scope_type,
                    KillSwitchRecord.scope_id == scope_id,
                )
            )
            record = result.scalar_one_or_none()
            if record is None:
                session.add(
                    KillSwitchRecord(
                        scope_type=scope_type,
                        scope_id=scope_id,
                        enabled=enabled,
                        updated_at=datetime.now(UTC),
                    )
                )
            else:
                record.enabled = enabled
                record.updated_at = datetime.now(UTC)
            await session.commit()

    async def enabled(self) -> list[tuple[str, str]]:
        async with self.database.sessions() as session:
            result = await session.execute(
                select(KillSwitchRecord).where(KillSwitchRecord.enabled.is_(True))
            )
            return [(item.scope_type, item.scope_id) for item in result.scalars()]


@dataclass(frozen=True)
class KnowledgeHit:
    document_id: str
    title: str
    section: str | None
    uri: str | None
    text: str
    score: float


TOKEN_PATTERN = re.compile(r"[A-Za-z0-9_.:-]+|[\u3400-\u9fff]")


def _tokens(value: str) -> set[str]:
    return {token.lower() for token in TOKEN_PATTERN.findall(value)}


def _chunks(value: str, size: int = 800, overlap: int = 100) -> list[str]:
    normalized = re.sub(r"\s+", " ", value).strip()
    if not normalized:
        return []
    chunks = []
    start = 0
    while start < len(normalized):
        chunks.append(normalized[start : start + size])
        if start + size >= len(normalized):
            break
        start += size - overlap
    return chunks


class KnowledgeRepository:
    """Tenant-scoped lexical retrieval seam.

    PostgreSQL/pgvector can replace scoring without changing the Agent result
    contract. v0.1 keeps deterministic lexical retrieval for SQLite tests.
    """

    def __init__(self, database: Database) -> None:
        self.database = database

    async def ingest(
        self,
        *,
        tenant_id: str,
        document_id: str,
        title: str,
        content: str,
        uri: str | None,
    ) -> int:
        now = datetime.now(UTC)
        texts = _chunks(content)
        async with self.database.sessions() as session:
            result = await session.execute(
                select(KnowledgeDocumentRecord).where(
                    KnowledgeDocumentRecord.tenant_id == tenant_id,
                    KnowledgeDocumentRecord.document_id == document_id,
                )
            )
            document = result.scalar_one_or_none()
            if document is None:
                document = KnowledgeDocumentRecord(
                    tenant_id=tenant_id,
                    document_id=document_id,
                    title=title,
                    uri=uri,
                    content=content,
                    created_at=now,
                    updated_at=now,
                )
                session.add(document)
            else:
                document.title = title
                document.uri = uri
                document.content = content
                document.updated_at = now
            await session.execute(
                delete(KnowledgeChunkRecord).where(
                    KnowledgeChunkRecord.tenant_id == tenant_id,
                    KnowledgeChunkRecord.document_id == document_id,
                )
            )
            for index, text in enumerate(texts):
                session.add(
                    KnowledgeChunkRecord(
                        chunk_id=f"{tenant_id}:{document_id}:{index}",
                        tenant_id=tenant_id,
                        document_id=document_id,
                        title=title,
                        uri=uri,
                        section=f"chunk-{index + 1}",
                        text=text,
                        tokens=sorted(_tokens(text)),
                    )
                )
            await session.commit()
        return len(texts)

    async def search(self, tenant_id: str, query: str, limit: int = 5) -> list[KnowledgeHit]:
        query_tokens = _tokens(query)
        if not query_tokens:
            return []
        async with self.database.sessions() as session:
            result = await session.execute(
                select(KnowledgeChunkRecord)
                .where(KnowledgeChunkRecord.tenant_id == tenant_id)
                .limit(5000)
            )
            scored = []
            for item in result.scalars():
                overlap = query_tokens.intersection(item.tokens)
                if not overlap:
                    continue
                score = len(overlap) / len(query_tokens)
                scored.append(
                    KnowledgeHit(
                        document_id=item.document_id,
                        title=item.title,
                        section=item.section,
                        uri=item.uri,
                        text=item.text,
                        score=score,
                    )
                )
            return sorted(scored, key=lambda item: (-item.score, item.document_id))[:limit]


class FlowRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    async def start(self, run_id: str, tenant_id: str, flow_type: str) -> None:
        async with self.database.sessions() as session:
            session.add(
                FlowRunRecord(
                    run_id=run_id,
                    tenant_id=tenant_id,
                    flow_type=flow_type,
                    status="running",
                    started_at=datetime.now(UTC),
                    metrics={},
                )
            )
            await session.commit()

    async def finish(
        self,
        run_id: str,
        *,
        status: str,
        metrics: dict[str, Any],
        error_code: str | None = None,
    ) -> None:
        async with self.database.sessions() as session:
            record = await session.get(FlowRunRecord, run_id)
            if record is None:
                return
            record.status = status
            record.metrics = metrics
            record.error_code = error_code
            record.completed_at = datetime.now(UTC)
            await session.commit()

    async def save_aggregate(
        self,
        *,
        tenant_id: str,
        tag: str,
        window_start: datetime,
        window_end: datetime,
        version: str,
        summary: dict[str, Any],
        evidence: dict[str, Any],
    ) -> None:
        async with self.database.sessions() as session:
            result = await session.execute(
                select(AggregateRecord).where(
                    AggregateRecord.tenant_id == tenant_id,
                    AggregateRecord.tag == tag,
                    AggregateRecord.window_start == window_start,
                    AggregateRecord.window_end == window_end,
                    AggregateRecord.version == version,
                )
            )
            if result.scalar_one_or_none() is None:
                session.add(
                    AggregateRecord(
                        tenant_id=tenant_id,
                        tag=tag,
                        window_start=window_start,
                        window_end=window_end,
                        version=version,
                        summary=summary,
                        evidence=evidence,
                        created_at=datetime.now(UTC),
                    )
                )
                await session.commit()

    async def export_feedback_to_evals(self, tenant_id: str) -> int:
        async with self.database.sessions() as session:
            result = await session.execute(
                select(FeedbackRecord, TraceRecord)
                .join(TraceRecord, FeedbackRecord.trace_id == TraceRecord.trace_id)
                .where(
                    FeedbackRecord.tenant_id == tenant_id,
                    TraceRecord.tenant_id == tenant_id,
                )
            )
            created = 0
            for feedback, trace in result.all():
                existing = await session.execute(
                    select(EvalCaseRecord).where(
                        EvalCaseRecord.tenant_id == tenant_id,
                        EvalCaseRecord.trace_id == trace.trace_id,
                    )
                )
                if existing.scalar_one_or_none() is not None:
                    continue
                session.add(
                    EvalCaseRecord(
                        eval_id=f"eval-{feedback.feedback_id}",
                        tenant_id=tenant_id,
                        trace_id=trace.trace_id,
                        question=trace.question,
                        rating=feedback.rating,
                        events=trace.events,
                        created_at=datetime.now(UTC),
                    )
                )
                created += 1
            await session.commit()
            return created


class RetentionRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    async def cleanup(
        self,
        *,
        tenant_id: str,
        now: datetime,
        trace_days: int,
        audit_days: int,
        aggregate_days: int,
    ) -> dict[str, int]:
        if now.tzinfo is None:
            raise ValueError("retention cleanup time must be timezone aware")
        trace_cutoff = now - timedelta(days=trace_days)
        audit_cutoff = now - timedelta(days=audit_days)
        aggregate_cutoff = now - timedelta(days=aggregate_days)
        async with self.database.sessions() as session:
            old_traces = await session.scalars(
                select(TraceRecord.trace_id).where(
                    TraceRecord.tenant_id == tenant_id,
                    TraceRecord.created_at < trace_cutoff,
                )
            )
            trace_ids = list(old_traces)
            feedback_deleted = 0
            evals_deleted = 0
            if trace_ids:
                feedback_result = await session.execute(
                    delete(FeedbackRecord).where(FeedbackRecord.trace_id.in_(trace_ids))
                )
                eval_result = await session.execute(
                    delete(EvalCaseRecord).where(EvalCaseRecord.trace_id.in_(trace_ids))
                )
                feedback_deleted = feedback_result.rowcount or 0
                evals_deleted = eval_result.rowcount or 0
            trace_result = await session.execute(
                delete(TraceRecord).where(
                    TraceRecord.tenant_id == tenant_id,
                    TraceRecord.created_at < trace_cutoff,
                )
            )
            audit_result = await session.execute(
                delete(AuditRecord).where(
                    AuditRecord.tenant_id == tenant_id,
                    AuditRecord.occurred_at < audit_cutoff,
                )
            )
            aggregate_result = await session.execute(
                delete(AggregateRecord).where(
                    AggregateRecord.tenant_id == tenant_id,
                    AggregateRecord.created_at < aggregate_cutoff,
                )
            )
            await session.commit()
            return {
                "tracesDeleted": trace_result.rowcount or 0,
                "feedbackDeleted": feedback_deleted,
                "evalCasesDeleted": evals_deleted,
                "auditDeleted": audit_result.rowcount or 0,
                "aggregatesDeleted": aggregate_result.rowcount or 0,
            }
