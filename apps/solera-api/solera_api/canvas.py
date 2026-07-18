from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from easy_pi import TagSeries

from .analytics import points_for_transport
from .contracts import AnalysisResult, PageContext, ViewSpec, WidgetSpec


def compose_analysis_view(
    *,
    analysis: AnalysisResult,
    series: list[TagSeries],
    context: PageContext,
) -> ViewSpec:
    evidence_refs = [item.evidence_id for item in analysis.evidence]
    series_config = [
        {
            "name": item.tag,
            "points": points_for_transport(item, max_points=500),
        }
        for item in series
    ]
    summary_rows = [
        [
            item.tag,
            item.count,
            item.min,
            item.max,
            item.average,
            item.std_dev,
            item.rate_of_change,
        ]
        for item in analysis.summaries
    ]
    first_summary = analysis.summaries[0] if analysis.summaries else None
    first_evidence = analysis.evidence[0] if analysis.evidence else None
    coverage = (
        min(item.data_quality.coverage for item in analysis.evidence) if analysis.evidence else 0
    )
    status = "Healthy data coverage" if coverage >= 0.8 else "Review data quality"
    tone = "healthy" if coverage >= 0.8 else "warning"
    widgets = [
        WidgetSpec(
            id="trend",
            type="timeseries",
            title="Time-series evidence",
            evidence_refs=evidence_refs,
            config={"series": series_config},
        ),
        WidgetSpec(
            id="primary-kpi",
            type="kpi",
            title=f"{first_summary.tag if first_summary else 'Series'} average",
            evidence_refs=[first_evidence.evidence_id] if first_evidence else [],
            config={
                "value": first_summary.average if first_summary else None,
                "unit": "",
                "detail": "Population summary from deterministic analytics",
            },
        ),
        WidgetSpec(
            id="quality",
            type="status",
            title="Data quality",
            evidence_refs=evidence_refs,
            config={
                "status": status,
                "tone": tone,
                "detail": f"Minimum coverage {coverage:.0%}",
            },
        ),
        WidgetSpec(
            id="summary-table",
            type="table",
            title="Deterministic summary",
            evidence_refs=evidence_refs,
            config={
                "columns": [
                    "Tag",
                    "Count",
                    "Min",
                    "Max",
                    "Average",
                    "Std dev",
                    "Rate/hour",
                ],
                "rows": summary_rows,
            },
        ),
        WidgetSpec(
            id="asset",
            type="asset",
            title="Page and asset context",
            evidence_refs=[],
            config={
                "assetId": _asset_value(context, "asset_id"),
                "label": _asset_value(context, "label") or context.page.title,
                "system": context.page.system_type,
                "confidence": _asset_value(context, "confidence"),
            },
        ),
        WidgetSpec(
            id="evidence",
            type="evidence",
            title="Sources and calculations",
            evidence_refs=evidence_refs,
            config={"analysisId": analysis.analysis_id},
        ),
    ]
    return ViewSpec(
        view_id=f"view-{uuid4()}",
        tenant_id=analysis.tenant_id,
        title=f"{context.page.title} · {', '.join(item.tag for item in analysis.summaries)}",
        layout="grid",
        widgets=widgets,
        evidence=analysis.evidence,
        created_at=datetime.now(UTC),
    )


def _asset_value(context: PageContext, field: str) -> object | None:
    candidate = next(
        (item for item in context.candidate_assets if item.confirmed),
        context.candidate_assets[0] if context.candidate_assets else None,
    )
    return getattr(candidate, field) if candidate else None
