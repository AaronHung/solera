import type { ReactNode } from "react";

import type {
  ExperienceAsset,
  ExperienceLiveMetric,
  ExperienceSite,
  ExperienceTone,
  TrendPoint,
} from "./types";

function scalePoints(
  values: number[],
  width: number,
  height: number,
  padding = 8,
  bounds?: { min: number; max: number },
): string {
  if (values.length === 0) {
    return "";
  }
  const min = bounds?.min ?? Math.min(...values);
  const max = bounds?.max ?? Math.max(...values);
  const range = Math.max(max - min, 1);
  return values
    .map((value, index) => {
      const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function LiveTelemetryRail({
  metrics,
  tick,
  paused,
}: {
  metrics: ExperienceLiveMetric[];
  tick: number;
  paused: boolean;
}) {
  return (
    <section className="exp-live-rail" aria-label="Live simulated telemetry">
      <header>
        <span className={paused ? "paused" : ""}>
          <i />
          {paused ? "STREAM PAUSED" : "LIVE TELEMETRY"}
        </span>
        <small>1s process · 5s trends · 15s health</small>
      </header>
      <div>
        {metrics.map((metric) => (
          <article
            className={`exp-live-metric exp-tone-${metric.tone}`}
            key={metric.id}
          >
            <header>
              <span>{metric.label}</span>
              <b>{metric.cadence}</b>
            </header>
            <div>
              <strong key={`${metric.id}-${tick}`}>
                {metric.value.toFixed(metric.id === "grid-frequency" ? 2 : 1)}
                <small>{metric.unit}</small>
              </strong>
              <Sparkline
                values={metric.history}
                tone={metric.tone}
                label={`${metric.label} live history`}
              />
            </div>
            <p>
              <i />
              {metric.status}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: ExperienceTone;
  children: ReactNode;
}) {
  return (
    <span className={`exp-status exp-status-${tone}`}>
      <i />
      {children}
    </span>
  );
}

export function KpiCard({
  eyebrow,
  value,
  unit,
  detail,
  delta,
  tone = "neutral",
}: {
  eyebrow: string;
  value: string | number;
  unit?: string;
  detail: string;
  delta?: string;
  tone?: ExperienceTone;
}) {
  return (
    <article className={`exp-kpi-card exp-tone-${tone}`}>
      <header>
        <span>{eyebrow}</span>
        {delta && <b>{delta}</b>}
      </header>
      <div className="exp-kpi-value">
        <strong>{value}</strong>
        {unit && <small>{unit}</small>}
      </div>
      <p>{detail}</p>
    </article>
  );
}

export function Gauge({
  value,
  label,
  unit = "%",
  tone = "healthy",
}: {
  value: number;
  label: string;
  unit?: string;
  tone?: ExperienceTone;
}) {
  const normalized = Math.min(100, Math.max(0, value));
  return (
    <div className={`exp-gauge exp-gauge-${tone}`}>
      <svg viewBox="0 0 120 72" role="img" aria-label={`${label}: ${value}${unit}`}>
        <path d="M15 62 A45 45 0 0 1 105 62" className="exp-gauge-track" />
        <path
          d="M15 62 A45 45 0 0 1 105 62"
          className="exp-gauge-value"
          pathLength="100"
          strokeDasharray={`${normalized} 100`}
        />
      </svg>
      <strong>
        {value.toFixed(value < 10 ? 1 : 0)}
        <small>{unit}</small>
      </strong>
      <span>{label}</span>
    </div>
  );
}

export function Sparkline({
  values,
  tone = "healthy",
  label,
}: {
  values: number[];
  tone?: ExperienceTone;
  label: string;
}) {
  const points = scalePoints(values, 160, 52, 4);
  return (
    <svg
      className={`exp-sparkline exp-sparkline-${tone}`}
      viewBox="0 0 160 52"
      role="img"
      aria-label={label}
    >
      <polyline points={points} fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function LineChart({
  title,
  primary,
  previous,
  secondary,
  unit,
  revision = 0,
}: {
  title: string;
  primary: TrendPoint[];
  previous?: TrendPoint[];
  secondary?: TrendPoint[];
  unit: string;
  revision?: number;
}) {
  const values = [...primary, ...(previous ?? []), ...(secondary ?? [])].map(
    (point) => point.value,
  );
  const min = Math.min(...values);
  const max = Math.max(...values);
  const bounds = { min, max };
  const primaryPoints = scalePoints(
    primary.map((point) => point.value),
    900,
    260,
    30,
    bounds,
  );
  const previousPoints = previous
    ? scalePoints(
        previous.map((point) => point.value),
        900,
        260,
        30,
        bounds,
      )
    : "";
  const secondaryPoints = secondary
    ? scalePoints(
        secondary.map((point) => point.value),
        900,
        260,
        30,
        bounds,
      )
    : "";
  return (
    <article className="exp-panel exp-chart-panel">
      <header className="exp-panel-header">
        <div>
          <span>LIVE TREND</span>
          <h3>{title}</h3>
        </div>
        <div className="exp-chart-legend">
          <span><i className="primary" />Current snapshot</span>
          {previous && <span><i className="previous" />Previous snapshot</span>}
          {secondary && <span><i className="secondary" />Forecast</span>}
        </div>
      </header>
      <div className="exp-line-chart">
        <svg viewBox="0 0 900 260" role="img" aria-label={title}>
          {[30, 80, 130, 180, 230].map((y) => (
            <line key={y} x1="30" x2="870" y1={y} y2={y} className="grid" />
          ))}
          {previousPoints && (
            <polyline points={previousPoints} className="previous-line" />
          )}
          <polyline
            key={`current-${revision}`}
            points={primaryPoints}
            className="primary-line"
            pathLength="1"
          />
          {secondaryPoints && <polyline points={secondaryPoints} className="secondary-line" />}
          <text x="30" y="20">{max.toFixed(0)} {unit}</text>
          <text x="30" y="252">{min.toFixed(0)} {unit}</text>
          <text x="870" y="252" textAnchor="end">24 hours</text>
        </svg>
      </div>
    </article>
  );
}

export function BarChart({
  title,
  points,
  unit,
}: {
  title: string;
  points: TrendPoint[];
  unit: string;
}) {
  const max = Math.max(...points.map((point) => point.value), 1);
  return (
    <article className="exp-panel exp-bar-panel">
      <header className="exp-panel-header">
        <div>
          <span>PRODUCTION PROFILE</span>
          <h3>{title}</h3>
        </div>
        <small>{unit}</small>
      </header>
      <div className="exp-bars" aria-label={title}>
        {points.map((point, index) => (
          <div className="exp-bar-column" key={`${point.label}-${index}`}>
            <i style={{ height: `${Math.max(6, (point.value / max) * 100)}%` }} />
            {index % 4 === 0 && <span>{point.label}</span>}
          </div>
        ))}
      </div>
    </article>
  );
}

export function AssetGlyph({ kind }: { kind: ExperienceAsset["kind"] }) {
  return (
    <div className={`exp-asset-glyph exp-asset-${kind}`} aria-hidden="true">
      <span />
      <i />
      <b />
    </div>
  );
}

export function AssetCard({
  asset,
  onOpen,
}: {
  asset: ExperienceAsset;
  onOpen?: () => void;
}) {
  return (
    <article
      className={`exp-asset-card exp-tone-${asset.tone}`}
      aria-label={onOpen ? `Open ${asset.name}` : asset.name}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (onOpen && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onOpen();
        }
      }}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
    >
      <header>
        <div>
          <span>ASSET</span>
          <h3>{asset.name}</h3>
        </div>
        <StatusPill tone={asset.tone}>
          {asset.tone === "warning" ? "Watch" : "Online"}
        </StatusPill>
      </header>
      <div className="exp-asset-visual">
        <AssetGlyph kind={asset.kind} />
        <Sparkline values={asset.trend} tone={asset.tone} label={`${asset.name} trend`} />
      </div>
      <div className="exp-asset-metrics">
        <Gauge value={asset.availability} label="Availability" tone={asset.tone} />
        <dl>
          <dt>DC output</dt>
          <dd>{asset.outputMw.toFixed(1)} MW</dd>
          <dt>Efficiency</dt>
          <dd>{asset.efficiency.toFixed(1)}%</dd>
          <dt>Health</dt>
          <dd>{asset.health}%</dd>
        </dl>
      </div>
    </article>
  );
}

export function SiteCard({
  site,
  onOpen,
}: {
  site: ExperienceSite;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Open ${site.name}`}
      className={`exp-site-card exp-tone-${site.tone}`}
      onClick={onOpen}
    >
      <header>
        <div>
          <span>{site.country}</span>
          <h3>{site.shortName}</h3>
        </div>
        <StatusPill tone={site.tone}>
          {site.tone === "warning" ? "Attention" : "Normal"}
        </StatusPill>
      </header>
      <div className="exp-site-visual">
        <AssetGlyph kind={site.kind} />
        <Gauge value={site.availability} label="Availability" tone={site.tone} />
      </div>
      <dl>
        <div><dt>Capacity</dt><dd>{site.capacityMw} MW</dd></div>
        <div><dt>Production</dt><dd>{site.productionMwh.toFixed(0)} MWh</dd></div>
        <div><dt>Health</dt><dd>{site.health}%</dd></div>
      </dl>
    </button>
  );
}
