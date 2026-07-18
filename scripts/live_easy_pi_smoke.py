from __future__ import annotations

import asyncio
import json
from datetime import UTC, datetime, timedelta
from time import perf_counter

from easy_pi import ConnectorLimits, EasyPiConnector
from solera_api.analytics import CALCULATION_VERSION, summarize
from solera_api.config import Settings
from solera_api.evidence import create_timeseries_evidence


async def run() -> dict[str, object]:
    settings = Settings()
    connector = EasyPiConnector(
        base_url=settings.easy_pi_base_url,
        setting_name=settings.easy_pi_setting_name,
        timezone=settings.easy_pi_timezone,
        limits=ConnectorLimits(
            max_range_seconds=settings.max_range_seconds,
            max_points=settings.max_points,
            timeout_ms=settings.easy_pi_timeout_ms,
        ),
    )
    end = datetime.now(UTC)
    start = end - timedelta(hours=1)
    started = perf_counter()
    try:
        healthy = await connector.health()
        current = await connector.current("CDT158")
        series = await connector.recorded(
            "CDT158",
            start=start,
            end=end,
            max_points=1000,
        )
    finally:
        await connector.close()
    retrieved_at = datetime.now(UTC)
    evidence = create_timeseries_evidence(
        tenant_id="live-smoke",
        source_system="easy-pi",
        series=series,
        start=start,
        end=end,
        timezone=settings.easy_pi_timezone,
        query_id="live-smoke",
        retrieved_at=retrieved_at,
    )
    return {
        "healthy": healthy,
        "tag": current.tag,
        "currentTimestamp": current.point.timestamp.isoformat(),
        "recordedPoints": len(series.points),
        "summary": summarize(series).model_dump(by_alias=True, mode="json"),
        "coverage": evidence.data_quality.coverage,
        "calculationVersion": CALCULATION_VERSION,
        "latencyMs": round((perf_counter() - started) * 1000, 2),
    }


if __name__ == "__main__":
    print(json.dumps(asyncio.run(run()), ensure_ascii=False))
