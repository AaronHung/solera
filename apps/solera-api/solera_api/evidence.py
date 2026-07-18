from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from easy_pi import CurrentValue, TagSeries

from .analytics import CALCULATION_VERSION, data_quality, series_from_points
from .contracts import Citation, DataQuality, Evidence

CONNECTOR_VERSION = "easy-pi@0.1.0"


def create_timeseries_evidence(
    *,
    tenant_id: str,
    source_system: str,
    series: TagSeries,
    start: datetime,
    end: datetime,
    timezone: str,
    query_id: str,
    retrieved_at: datetime,
    aggregation: str | None = None,
    asset_id: str | None = None,
) -> Evidence:
    return Evidence(
        evidence_id=f"ev-{uuid4()}",
        tenant_id=tenant_id,
        source_system=source_system,
        source_type="industrial-api",
        asset_id=asset_id,
        tags=[series.tag],
        start=start,
        end=end,
        timezone=timezone,
        retrieval_mode="recorded",
        aggregation=aggregation,
        calculation_version=CALCULATION_VERSION,
        connector_version=CONNECTOR_VERSION,
        query_id=query_id,
        retrieved_at=retrieved_at,
        data_quality=data_quality(
            series,
            requested_start=start,
            requested_end=end,
            now=retrieved_at,
        ),
    )


def create_current_evidence(
    *,
    tenant_id: str,
    source_system: str,
    current: CurrentValue,
    timezone: str,
    query_id: str,
    retrieved_at: datetime,
    asset_id: str | None = None,
) -> Evidence:
    is_valid = isinstance(current.point.value, int | float) and not isinstance(
        current.point.value, bool
    )
    quality = DataQuality(
        sample_count=1,
        valid_count=1 if is_valid else 0,
        bad_count=1 if current.point.quality in {"bad", "questionable"} else 0,
        missing_count=1 if current.point.value is None else 0,
        coverage=1 if is_valid else 0,
        freshness_seconds=max((retrieved_at - current.point.timestamp).total_seconds(), 0),
        warnings=[] if is_valid else ["Current value is not a valid numeric point"],
    )
    return Evidence(
        evidence_id=f"ev-{uuid4()}",
        tenant_id=tenant_id,
        source_system=source_system,
        source_type="industrial-api",
        asset_id=asset_id,
        tags=[current.tag],
        start=current.point.timestamp,
        end=current.point.timestamp,
        timezone=timezone,
        retrieval_mode="current",
        aggregation=None,
        calculation_version=CALCULATION_VERSION,
        connector_version=CONNECTOR_VERSION,
        query_id=query_id,
        retrieved_at=retrieved_at,
        data_quality=quality,
    )


def current_as_series(current: CurrentValue) -> TagSeries:
    return series_from_points(current.tag, [current.point])


def create_document_evidence(
    *,
    tenant_id: str,
    document_id: str,
    title: str,
    section: str | None,
    uri: str | None,
    query_id: str,
    retrieved_at: datetime,
) -> Evidence:
    return Evidence(
        evidence_id=f"ev-{uuid4()}",
        tenant_id=tenant_id,
        source_system="solera-knowledge",
        source_type="document",
        asset_id=None,
        tags=[],
        start=retrieved_at,
        end=retrieved_at,
        timezone="UTC",
        retrieval_mode="document",
        aggregation=None,
        calculation_version="lexical-retrieval@0.1.0",
        connector_version="solera-knowledge@0.1.0",
        query_id=query_id,
        retrieved_at=retrieved_at,
        data_quality=DataQuality(
            sample_count=1,
            valid_count=1,
            bad_count=0,
            missing_count=0,
            coverage=1,
            warnings=[],
        ),
        citation=Citation(
            document_id=document_id,
            title=title,
            section=section,
            uri=uri,
        ),
    )
