from __future__ import annotations

import math
import statistics
from bisect import bisect_left
from dataclasses import dataclass
from datetime import datetime

from easy_pi import DataPoint, PointQuality, TagSeries

from .contracts import DataQuality, SeriesComparison, SeriesSummary

CALCULATION_VERSION = "timeseries-analytics@0.1.0"


@dataclass(frozen=True)
class NumericPoint:
    timestamp: datetime
    value: float


def numeric_points(series: TagSeries) -> list[NumericPoint]:
    """Return sorted, de-duplicated good numeric points.

    Duplicate timestamps are resolved by keeping the last upstream occurrence.
    Booleans are excluded even though Python represents them as integers.
    """

    deduplicated: dict[datetime, float] = {}
    for point in series.points:
        if point.quality != PointQuality.GOOD:
            continue
        if isinstance(point.value, bool) or not isinstance(point.value, int | float):
            continue
        value = float(point.value)
        if math.isfinite(value):
            deduplicated[point.timestamp] = value
    return [
        NumericPoint(timestamp=timestamp, value=value)
        for timestamp, value in sorted(deduplicated.items())
    ]


def data_quality(
    series: TagSeries,
    *,
    requested_start: datetime,
    requested_end: datetime,
    now: datetime,
) -> DataQuality:
    sample_count = len(series.points)
    valid = numeric_points(series)
    bad_count = sum(
        point.quality in {PointQuality.BAD, PointQuality.QUESTIONABLE} for point in series.points
    )
    missing_count = sum(point.quality == PointQuality.MISSING for point in series.points)

    requested_seconds = max((requested_end - requested_start).total_seconds(), 1)
    if len(valid) >= 2:
        observed_seconds = max((valid[-1].timestamp - valid[0].timestamp).total_seconds(), 0)
        temporal_coverage = min(observed_seconds / requested_seconds, 1)
    elif len(valid) == 1:
        temporal_coverage = min(1 / max(sample_count, 1), 1)
    else:
        temporal_coverage = 0
    value_coverage = len(valid) / max(sample_count, 1)
    coverage = round(temporal_coverage * value_coverage, 6)

    freshness_seconds: float | None = None
    if valid:
        freshness_seconds = max((now - valid[-1].timestamp).total_seconds(), 0)

    warnings: list[str] = []
    if not valid:
        warnings.append("No valid numeric points")
    if bad_count:
        warnings.append(f"{bad_count} bad or questionable points")
    if missing_count:
        warnings.append(f"{missing_count} missing points")
    if coverage < 0.8:
        warnings.append("Requested window has less than 80% temporal/value coverage")

    return DataQuality(
        sample_count=sample_count,
        valid_count=len(valid),
        bad_count=bad_count,
        missing_count=missing_count,
        coverage=coverage,
        freshness_seconds=freshness_seconds,
        warnings=warnings,
    )


def summarize(series: TagSeries) -> SeriesSummary:
    points = numeric_points(series)
    if not points:
        return SeriesSummary(tag=series.tag, count=0)

    values = [point.value for point in points]
    rate: float | None = None
    if len(points) >= 2:
        hours = (points[-1].timestamp - points[0].timestamp).total_seconds() / 3600
        if hours > 0:
            rate = (points[-1].value - points[0].value) / hours

    return SeriesSummary(
        tag=series.tag,
        count=len(values),
        min=min(values),
        max=max(values),
        average=statistics.fmean(values),
        std_dev=statistics.pstdev(values),
        rate_of_change=rate,
        rate_unit="value/hour" if rate is not None else None,
    )


def compare(
    left: TagSeries,
    right: TagSeries,
    *,
    tolerance_seconds: float = 300,
) -> SeriesComparison:
    """Compare nearest points without reusing a right-side point.

    Matching is deterministic and bounded by `tolerance_seconds`. The mean
    difference is left minus right.
    """

    left_points = numeric_points(left)
    right_points = numeric_points(right)
    right_times = [point.timestamp for point in right_points]
    used: set[int] = set()
    matches: list[tuple[datetime, float]] = []

    for point in left_points:
        insertion = bisect_left(right_times, point.timestamp)
        candidates = [
            index for index in (insertion - 1, insertion) if 0 <= index < len(right_points)
        ]
        candidates = [index for index in candidates if index not in used]
        if not candidates:
            continue
        nearest = min(
            candidates,
            key=lambda index: abs(
                (right_points[index].timestamp - point.timestamp).total_seconds()
            ),
        )
        gap = abs((right_points[nearest].timestamp - point.timestamp).total_seconds())
        if gap <= tolerance_seconds:
            used.add(nearest)
            matches.append((point.timestamp, point.value - right_points[nearest].value))

    if not matches:
        return SeriesComparison(left_tag=left.tag, right_tag=right.tag)

    maximum = max(matches, key=lambda item: abs(item[1]))
    return SeriesComparison(
        left_tag=left.tag,
        right_tag=right.tag,
        mean_difference=statistics.fmean(difference for _, difference in matches),
        max_absolute_difference=abs(maximum[1]),
        max_difference_at=maximum[0],
    )


def basic_anomaly_z_score(series: TagSeries) -> float | None:
    points = numeric_points(series)
    if len(points) < 5:
        return None
    baseline = [point.value for point in points[:-1]]
    std_dev = statistics.pstdev(baseline)
    if std_dev == 0:
        return 0 if points[-1].value == statistics.fmean(baseline) else math.inf
    return (points[-1].value - statistics.fmean(baseline)) / std_dev


def points_for_transport(
    series: TagSeries, *, max_points: int = 500
) -> list[dict[str, float | str]]:
    points = numeric_points(series)
    if len(points) <= max_points:
        selected = points
    else:
        step = (len(points) - 1) / (max_points - 1)
        indices = sorted({round(index * step) for index in range(max_points)})
        selected = [points[index] for index in indices]
    return [{"timestamp": point.timestamp.isoformat(), "value": point.value} for point in selected]


def series_from_points(tag: str, points: list[DataPoint]) -> TagSeries:
    return TagSeries(tag=tag, points=points)
