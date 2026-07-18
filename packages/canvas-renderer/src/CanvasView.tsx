import type { Evidence, ViewSpec, WidgetSpec } from "@solera/contracts";
import { validateViewSpec } from "@solera/contracts";
import { useMemo } from "react";

interface CanvasViewProps {
  spec: ViewSpec;
  onClose?: () => void;
}

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function text(value: unknown, fallback = "—"): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback;
}

function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function evidenceFor(widget: WidgetSpec, evidence: Evidence[]): Evidence[] {
  const refs = new Set(widget.evidenceRefs);
  return evidence.filter((item) => refs.has(item.evidenceId));
}

function WidgetFrame({
  widget,
  children,
}: {
  widget: WidgetSpec;
  children: React.ReactNode;
}) {
  return (
    <article className={`solera-widget solera-widget-${widget.type}`} data-widget-id={widget.id}>
      <header>
        <span>{widget.type}</span>
        <h3>{widget.title}</h3>
      </header>
      <div className="solera-widget-body">{children}</div>
    </article>
  );
}

function TimeseriesWidget({ widget }: { widget: WidgetSpec }) {
  const rawSeries = Array.isArray(widget.config.series) ? widget.config.series : [];
  const series = rawSeries.slice(0, 8).map((item, index) => {
    const source = record(item);
    const rawPoints = Array.isArray(source.points) ? source.points : [];
    const points = rawPoints
      .slice(0, 1000)
      .map((point) => {
        const candidate = record(point);
        const timestamp = text(candidate.timestamp, "");
        const value = number(candidate.value);
        const instant = Date.parse(timestamp);
        return Number.isFinite(instant) && value !== null ? { instant, value } : null;
      })
      .filter((point): point is { instant: number; value: number } => point !== null);
    return {
      name: text(source.name, "Series"),
      color: ["#f0a451", "#5fcbb4", "#87a8ff", "#e27c76"][index % 4]!,
      points,
    };
  });
  const allPoints = series.flatMap((item) => item.points);
  const minTime = Math.min(...allPoints.map((point) => point.instant));
  const maxTime = Math.max(...allPoints.map((point) => point.instant));
  const minValue = Math.min(...allPoints.map((point) => point.value));
  const maxValue = Math.max(...allPoints.map((point) => point.value));
  const xRange = Math.max(maxTime - minTime, 1);
  const yRange = Math.max(maxValue - minValue, 1);
  const chartSeries = series.map((item) => ({
    ...item,
    polyline: item.points
      .map((point) => {
        const x = 48 + ((point.instant - minTime) / xRange) * 724;
        const y = 194 - ((point.value - minValue) / yRange) * 158;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" "),
  }));

  return (
    <WidgetFrame widget={widget}>
      {allPoints.length > 0 ? (
        <div className="solera-chart">
          <div className="solera-chart-legend">
            {chartSeries.map((item) => (
              <span key={item.name}>
                <i style={{ background: item.color }} />
                {item.name}
              </span>
            ))}
          </div>
          <svg
            viewBox="0 0 800 220"
            role="img"
            aria-label={`${widget.title} time-series chart`}
          >
            {[36, 76, 116, 156, 194].map((y) => (
              <line key={y} x1="48" y1={y} x2="772" y2={y} className="gridline" />
            ))}
            <line x1="48" y1="20" x2="48" y2="194" className="axis" />
            <line x1="48" y1="194" x2="772" y2="194" className="axis" />
            <text x="4" y="28">{maxValue.toPrecision(4)}</text>
            <text x="4" y="198">{minValue.toPrecision(4)}</text>
            <text x="48" y="216">{new Date(minTime).toLocaleString()}</text>
            <text x="772" y="216" textAnchor="end">
              {new Date(maxTime).toLocaleString()}
            </text>
            {chartSeries.map((item) => (
              <polyline
                key={item.name}
                points={item.polyline}
                fill="none"
                stroke={item.color}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        </div>
      ) : (
        <p className="solera-empty">No bounded series data in this ViewSpec.</p>
      )}
    </WidgetFrame>
  );
}

function KpiWidget({ widget }: { widget: WidgetSpec }) {
  const value = text(widget.config.value);
  const unit = text(widget.config.unit, "");
  const detail = text(widget.config.detail, "");
  return (
    <WidgetFrame widget={widget}>
      <div className="solera-kpi">
        <strong>{value}</strong>
        <span>{unit}</span>
      </div>
      {detail && <p>{detail}</p>}
    </WidgetFrame>
  );
}

function StatusWidget({ widget }: { widget: WidgetSpec }) {
  const status = text(widget.config.status, "Unknown");
  const tone = ["healthy", "warning", "critical"].includes(text(widget.config.tone, ""))
    ? text(widget.config.tone)
    : "neutral";
  return (
    <WidgetFrame widget={widget}>
      <div className={`solera-status solera-status-${tone}`}>
        <span />
        <strong>{status}</strong>
      </div>
      <p>{text(widget.config.detail, "No status detail supplied.")}</p>
    </WidgetFrame>
  );
}

function TableWidget({ widget }: { widget: WidgetSpec }) {
  const columns = (Array.isArray(widget.config.columns) ? widget.config.columns : [])
    .slice(0, 12)
    .map((item) => text(item));
  const rows = (Array.isArray(widget.config.rows) ? widget.config.rows : []).slice(0, 100);
  return (
    <WidgetFrame widget={widget}>
      <div className="solera-table-wrap">
        <table>
          <thead>
            <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const values = Array.isArray(row) ? row : Object.values(record(row));
              return (
                <tr key={`row-${rowIndex}`}>
                  {columns.map((column, columnIndex) => (
                    <td key={`${column}-${columnIndex}`}>{text(values[columnIndex])}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </WidgetFrame>
  );
}

function AssetWidget({ widget }: { widget: WidgetSpec }) {
  return (
    <WidgetFrame widget={widget}>
      <dl className="solera-asset">
        <dt>Asset</dt>
        <dd>{text(widget.config.label)}</dd>
        <dt>ID</dt>
        <dd>{text(widget.config.assetId)}</dd>
        <dt>System</dt>
        <dd>{text(widget.config.system)}</dd>
        <dt>Confidence</dt>
        <dd>
          {number(widget.config.confidence) === null
            ? "—"
            : `${Math.round((number(widget.config.confidence) ?? 0) * 100)}%`}
        </dd>
      </dl>
    </WidgetFrame>
  );
}

function EvidenceWidget({
  widget,
  evidence,
}: {
  widget: WidgetSpec;
  evidence: Evidence[];
}) {
  const items = evidenceFor(widget, evidence);
  return (
    <WidgetFrame widget={widget}>
      <div className="solera-evidence-list">
        {items.map((item) => (
          <section key={item.evidenceId}>
            <strong>{item.tags.join(", ") || item.sourceSystem}</strong>
            <span>{item.retrievalMode} · {Math.round(item.dataQuality.coverage * 100)}% coverage</span>
            <code>{item.queryId}</code>
            <small>{item.calculationVersion}</small>
          </section>
        ))}
      </div>
    </WidgetFrame>
  );
}

function renderWidget(widget: WidgetSpec, evidence: Evidence[]) {
  switch (widget.type) {
    case "timeseries":
      return <TimeseriesWidget key={widget.id} widget={widget} />;
    case "kpi":
      return <KpiWidget key={widget.id} widget={widget} />;
    case "status":
      return <StatusWidget key={widget.id} widget={widget} />;
    case "table":
      return <TableWidget key={widget.id} widget={widget} />;
    case "asset":
      return <AssetWidget key={widget.id} widget={widget} />;
    case "evidence":
      return (
        <EvidenceWidget key={widget.id} widget={widget} evidence={evidence} />
      );
  }
}

export function CanvasView({ spec, onClose }: CanvasViewProps) {
  const validated = useMemo(() => validateViewSpec(spec), [spec]);
  const evidence = validated.evidence ?? [];
  return (
    <section className="solera-canvas" aria-label={validated.title}>
      <header className="solera-canvas-header">
        <div>
          <span>PROJECT SOLERA · CANVAS</span>
          <h2>{validated.title}</h2>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close Solera Canvas">
            Close
          </button>
        )}
      </header>
      <div className={`solera-canvas-layout solera-layout-${validated.layout}`}>
        {validated.widgets.map((widget) => renderWidget(widget, evidence))}
      </div>
    </section>
  );
}
