from __future__ import annotations

import math
from datetime import datetime

import pytest
from easy_pi import DataPoint, PointQuality, TagSeries
from solera_api.analytics import (
    basic_anomaly_z_score,
    compare,
    data_quality,
    numeric_points,
    points_for_transport,
    summarize,
)


def point(
    timestamp: str, value: float | None, quality: PointQuality = PointQuality.GOOD
) -> DataPoint:
    return DataPoint(
        timestamp=datetime.fromisoformat(timestamp),
        value=value,
        quality=quality,
    )


def test_summary_is_deterministic_and_deduplicates_last_value() -> None:
    series = TagSeries(
        tag="CDT158",
        points=[
            point("2026-07-18T10:00:00+08:00", 10),
            point("2026-07-18T10:30:00+08:00", 20),
            point("2026-07-18T10:30:00+08:00", 22),
            point("2026-07-18T11:00:00+08:00", 30),
            point("2026-07-18T11:05:00+08:00", None, PointQuality.MISSING),
        ],
    )

    result = summarize(series)
    assert result.count == 3
    assert result.min == 10
    assert result.max == 30
    assert result.average == pytest.approx((10 + 22 + 30) / 3)
    assert result.std_dev == pytest.approx(8.219218670625303)
    assert result.rate_of_change == pytest.approx(20)


def test_quality_combines_temporal_and_value_coverage() -> None:
    series = TagSeries(
        tag="CDT158",
        points=[
            point("2026-07-18T10:00:00+08:00", 10),
            point("2026-07-18T10:30:00+08:00", None, PointQuality.BAD),
            point("2026-07-18T11:00:00+08:00", 30),
        ],
    )
    quality = data_quality(
        series,
        requested_start=datetime.fromisoformat("2026-07-18T10:00:00+08:00"),
        requested_end=datetime.fromisoformat("2026-07-18T11:00:00+08:00"),
        now=datetime.fromisoformat("2026-07-18T11:01:00+08:00"),
    )
    assert quality.sample_count == 3
    assert quality.valid_count == 2
    assert quality.bad_count == 1
    assert quality.coverage == pytest.approx(2 / 3, rel=1e-5)
    assert quality.freshness_seconds == 60


def test_compare_matches_nearest_points_within_tolerance() -> None:
    left = TagSeries(
        tag="CDT158",
        points=[
            point("2026-07-18T10:00:00+08:00", 10),
            point("2026-07-18T10:10:00+08:00", 20),
        ],
    )
    right = TagSeries(
        tag="CDT159",
        points=[
            point("2026-07-18T10:01:00+08:00", 7),
            point("2026-07-18T10:09:00+08:00", 25),
        ],
    )
    result = compare(left, right, tolerance_seconds=120)
    assert result.mean_difference == pytest.approx(-1)
    assert result.max_absolute_difference == 5
    assert result.max_difference_at == datetime.fromisoformat("2026-07-18T10:10:00+08:00")


def test_anomaly_and_downsampling_are_bounded() -> None:
    series = TagSeries(
        tag="SINUSOID",
        points=[
            point(f"2026-07-18T10:0{index}:00+08:00", value)
            for index, value in enumerate([10, 10, 10, 10, 20])
        ],
    )
    assert math.isinf(basic_anomaly_z_score(series) or 0)
    transported = points_for_transport(series, max_points=3)
    assert len(transported) == 3
    assert transported[0]["value"] == 10
    assert transported[-1]["value"] == 20


def test_non_numeric_values_are_not_summarized() -> None:
    series = TagSeries(
        tag="STATE",
        points=[
            DataPoint(
                timestamp=datetime.fromisoformat("2026-07-18T10:00:00+08:00"),
                value="Running",
                quality=PointQuality.GOOD,
            )
        ],
    )
    assert numeric_points(series) == []
    assert summarize(series).count == 0
