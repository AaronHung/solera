import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ChartSpline,
  CircleDollarSign,
  Factory,
  House,
  MapPinned,
  Plus,
  Settings,
  ShieldCheck,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  AssetCard,
  AssetGlyph,
  BarChart,
  DonutChart,
  Gauge,
  KpiCard,
  LineChart,
  LiveTelemetryRail,
  RadarChart,
  SiteCard,
  Sparkline,
  StatusPill,
  SpectrumChart,
} from "./components";
import { CreateStudio } from "./CreateStudio";
import { ROLE_OPTIONS } from "./mockData";
import type {
  ExperienceAsset,
  ExperienceDataset,
  ExperiencePage,
  ExperienceRole,
  ExperienceSite,
  ExperienceViewProps,
} from "./types";
import { useExperienceSimulation } from "./useExperienceSimulation";

const NAV_ITEMS: Array<{
  id: ExperiencePage;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "home", label: "Home", icon: House },
  { id: "map", label: "Map", icon: MapPinned },
  { id: "sites", label: "Sites", icon: Factory },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "forecasting", label: "Forecasting", icon: ChartSpline },
  { id: "revenue", label: "Revenue", icon: CircleDollarSign },
  { id: "collaboration", label: "Collaboration", icon: UsersRound },
  { id: "hse", label: "HSE", icon: ShieldCheck },
  { id: "activities", label: "Activities", icon: Activity },
];

const COLLABORATION_ACTIVITY_SPECTRUM = [
  44, 31, 28, 52, 67, 36, 24, 42, 58, 73, 62, 47,
  35, 49, 64, 78, 71, 55, 39, 46, 68, 59, 41, 30,
];

const INGESTION_ACTIVITY_SPECTRUM = [
  58, 63, 82, 41, 69, 77, 65, 36, 52, 72, 86, 68, 61, 39,
  55, 75, 64, 48, 79, 88, 70, 43, 57, 73, 62, 34, 51, 67,
];

const ROLE_HEADLINES: Record<
  ExperienceRole,
  { eyebrow: string; title: string; description: string }
> = {
  executive: {
    eyebrow: "PORTFOLIO COMMAND",
    title: "Energy operations, distilled",
    description: "A governed view of value, availability, risk and decarbonization.",
  },
  "shift-supervisor": {
    eyebrow: "SHIFT OVERVIEW",
    title: "Keep production on plan",
    description: "Prioritize deviations, handover actions and constrained assets.",
  },
  operator: {
    eyebrow: "OPERATING VIEW",
    title: "Current conditions at a glance",
    description: "See live operating state, limits and the next safe action.",
  },
  reliability: {
    eyebrow: "RELIABILITY VIEW",
    title: "Find risk before it becomes downtime",
    description: "Focus on health, degradation, anomalies and maintenance readiness.",
  },
  "it-data": {
    eyebrow: "DATA OPERATIONS",
    title: "Trusted context behind every signal",
    description: "Monitor connectivity, freshness, quality and lineage across sites.",
  },
};

const ROLE_DEFAULT_PAGE: Record<ExperienceRole, ExperiencePage> = {
  executive: "home",
  "shift-supervisor": "site",
  operator: "site",
  reliability: "maintenance",
  "it-data": "activities",
};

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

function PortfolioHome({
  data,
  role,
  tick,
  paused,
  onSite,
  onPage,
}: {
  data: ExperienceDataset;
  role: ExperienceRole;
  tick: number;
  paused: boolean;
  onSite: (site: ExperienceSite) => void;
  onPage: (page: ExperiencePage) => void;
}) {
  const headline = ROLE_HEADLINES[role];
  const outputMetric = data.liveMetrics.find(
    (metric) => metric.id === "net-output",
  );
  const siteKinds = [
    { kind: "wind" as const, label: "Wind", share: 27, amount: "8 TWh", tone: "healthy" as const },
    { kind: "solar" as const, label: "Solar", share: 17, amount: "5 TWh", tone: "healthy" as const },
    { kind: "hydrogen" as const, label: "Hydrogen", share: 23, amount: "7 TWh", tone: "warning" as const },
    { kind: "thermal" as const, label: "Thermal", share: 16, amount: "5 TWh", tone: "healthy" as const },
    { kind: "storage" as const, label: "Storage", share: 17, amount: "5 TWh", tone: "healthy" as const },
  ];

  return (
    <div className="exp-page exp-home-page">
      <section className="exp-hero">
        <div>
          <span>{headline.eyebrow}</span>
          <h1>{headline.title}</h1>
          <p>{headline.description}</p>
        </div>
        <button
          type="button"
          aria-label="Create workspace"
          onClick={() => onPage("create")}
        >
          <i><Plus aria-hidden="true" /></i>
          Create workspace
        </button>
      </section>

      <section className="exp-kpi-row">
        <KpiCard
          eyebrow="Current production"
          value={outputMetric?.value ?? data.portfolio.productionMw}
          unit="MW"
          detail={`${data.portfolio.capacityMw.toLocaleString()} MW installed capacity`}
          delta={outputMetric?.status ?? "+2.4%"}
          tone={outputMetric?.tone ?? "healthy"}
        />
        <KpiCard
          eyebrow="Availability"
          value={data.portfolio.availability}
          unit="%"
          detail="All facilities · weighted average"
          delta="+0.6%"
          tone="healthy"
        />
        <KpiCard
          eyebrow={role === "it-data" ? "Data quality" : "Renewable share"}
          value={role === "it-data" ? "98.7" : data.portfolio.renewableShare}
          unit="%"
          detail={role === "it-data" ? "Signals inside freshness SLA" : "Wind, solar, hydrogen and storage"}
          delta={role === "it-data" ? "12 ms" : "+4.1%"}
          tone="healthy"
        />
        <KpiCard
          eyebrow={role === "reliability" ? "Assets at risk" : "Avoided CO₂"}
          value={role === "reliability" ? "3" : data.portfolio.avoidedCo2Tons.toLocaleString()}
          unit={role === "reliability" ? "" : "t"}
          detail={role === "reliability" ? "1 high · 2 medium priority" : "Estimated today"}
          delta={role === "reliability" ? "Review" : "+8.6%"}
          tone={role === "reliability" ? "warning" : "healthy"}
        />
      </section>

      <LiveTelemetryRail
        metrics={data.liveMetrics}
        tick={tick}
        paused={paused}
      />

      <section className="exp-home-grid">
        <article className="exp-panel exp-network-panel">
          <header className="exp-panel-header">
            <div><span>ENERGY NETWORK</span><h3>Portfolio mix and flow</h3></div>
            <StatusPill tone="healthy">Live simulation</StatusPill>
          </header>
          <div className="exp-energy-network">
            <div className="exp-network-lines" aria-hidden="true">
              {siteKinds.map((item) => <i key={item.kind} />)}
            </div>
            <div className="exp-network-center">
              <span>TOTAL</span>
              <strong>32<small>TWh</small></strong>
              <i />
            </div>
            {siteKinds.map((item, index) => (
              <button
                type="button"
                className={`exp-network-node node-${index + 1}`}
                key={item.kind}
                onClick={() => {
                  const matchingSite = data.sites.find((site) => site.kind === item.kind);
                  if (matchingSite) {
                    onSite(matchingSite);
                  }
                }}
              >
                <AssetGlyph kind={item.kind} />
                <span>{item.label}</span>
                <strong>{item.share}%</strong>
                <small>{item.amount}</small>
              </button>
            ))}
          </div>
        </article>

        <article className="exp-panel exp-alert-panel">
          <header className="exp-panel-header">
            <div><span>ATTENTION</span><h3>Priority signals</h3></div>
            <b>{data.alerts.length}</b>
          </header>
          <div className="exp-alert-list">
            {data.alerts.map((alert) => (
              <button
                type="button"
                key={alert.id}
                onClick={() => onPage(alert.owner === "IT / Data" ? "activities" : "maintenance")}
              >
                <i className={`severity-${alert.severity}`} />
                <span><strong>{alert.title}</strong><small>{alert.site}</small></span>
                <time>{alert.age}</time>
              </button>
            ))}
          </div>
          <div className="exp-mini-performance">
            <div><span>OPEX</span><strong>${data.portfolio.opexMillions.toFixed(1)}m</strong></div>
            <div><span>REVENUE</span><strong>${data.portfolio.revenueMillions.toFixed(1)}m</strong></div>
          </div>
        </article>
      </section>
    </div>
  );
}

function SitesPage({
  data,
  onSite,
}: {
  data: ExperienceDataset;
  onSite: (site: ExperienceSite) => void;
}) {
  return (
    <div className="exp-page">
      <header className="exp-page-title">
        <div><span>SITE FLEET</span><h1>Operations across the portfolio</h1><p>Compare capacity, production and health across technologies.</p></div>
        <div className="exp-page-summary"><strong>{data.sites.length}</strong><span>operating sites</span></div>
      </header>
      <section className="exp-site-grid">
        {data.sites.map((site) => <SiteCard key={site.id} site={site} onOpen={() => onSite(site)} />)}
        <button type="button" className="exp-site-card exp-site-construction">
          <i>+</i><strong>Sites under construction</strong><span>5 projects · Hydrogen, wind and storage</span>
        </button>
      </section>
    </div>
  );
}

function SiteOperations({
  data,
  site,
  tick,
  paused,
  previousTrend,
  trendRevision,
  onAsset,
}: {
  data: ExperienceDataset;
  site: ExperienceSite;
  tick: number;
  paused: boolean;
  previousTrend: ExperienceDataset["productionTrend"];
  trendRevision: number;
  onAsset: (asset: ExperienceAsset) => void;
}) {
  const assets = site.assets.length > 0 ? site.assets : data.sites[0]?.assets ?? [];
  return (
    <div className="exp-page">
      <header className="exp-page-title exp-site-title">
        <div>
          <span>{site.country} · {site.location}</span>
          <h1>{site.name}</h1>
          <p>{site.kind.toUpperCase()} · {site.capacityMw} MW installed</p>
        </div>
        <div className="exp-site-title-metrics">
          <Gauge value={site.availability} label="Availability" tone={site.tone} />
          <div><span>Production today</span><strong>{site.productionMwh.toFixed(1)} MWh</strong></div>
          <div><span>Health index</span><strong>{site.health.toFixed(1)}%</strong></div>
        </div>
      </header>
      <LiveTelemetryRail
        metrics={data.liveMetrics}
        tick={tick}
        paused={paused}
      />
      <section className="exp-operation-grid">
        <LineChart
          title="Power generation and forecast"
          primary={data.productionTrend}
          previous={previousTrend}
          secondary={data.forecastTrend}
          unit="MW"
          revision={trendRevision}
        />
        <BarChart title="Hourly production" points={data.hourlyProduction} unit="MWh" />
      </section>
      <section className="exp-section-header"><div><span>ASSET FLEET</span><h2>Blocks and equipment</h2></div><StatusPill tone={site.tone}>{site.tone === "warning" ? "1 watch item" : "All online"}</StatusPill></section>
      <section className="exp-asset-grid">
        {assets.map((asset) => <AssetCard key={asset.id} asset={asset} onOpen={() => onAsset(asset)} />)}
      </section>
    </div>
  );
}

function AssetDetail({
  asset,
  data,
  tick,
  paused,
  previousTrend,
  trendRevision,
}: {
  asset: ExperienceAsset;
  data: ExperienceDataset;
  tick: number;
  paused: boolean;
  previousTrend: ExperienceDataset["productionTrend"];
  trendRevision: number;
}) {
  return (
    <div className="exp-page">
      <header className="exp-page-title">
        <div><span>ASSET DETAIL · {asset.siteId}</span><h1>{asset.name}</h1><p>Operating state, reliability context and trusted trends.</p></div>
        <StatusPill tone={asset.tone}>{asset.tone === "warning" ? "Needs attention" : "Normal operation"}</StatusPill>
      </header>
      <LiveTelemetryRail
        metrics={data.liveMetrics}
        tick={tick}
        paused={paused}
      />
      <section className="exp-asset-detail-grid">
        <article className="exp-panel exp-asset-hero-card">
          <AssetGlyph kind={asset.kind} />
          <div><span>CURRENT OUTPUT</span><strong>{asset.outputMw.toFixed(1)}<small>MW</small></strong><p>{((asset.outputMw / asset.capacityMw) * 100).toFixed(1)}% of nameplate</p></div>
          <Gauge value={asset.health} label="Health index" tone={asset.tone} />
        </article>
        <article className="exp-panel exp-status-matrix">
          <header className="exp-panel-header"><div><span>STATUS</span><h3>Subsystem condition</h3></div></header>
          {[
            ["Inverters total", "98.312", "healthy"],
            ["Utilisation", "87.553", asset.tone],
            ["Production today", "99.415", "healthy"],
            ["Panels online", "97.788", "healthy"],
            ["Panels offline", "59.191", "warning"],
          ].map(([label, value, tone]) => (
            <div key={label}>
              <i className={`tone-${tone}`} />
              <span>{label}</span>
              <strong>{value}</strong>
              <Sparkline values={asset.trend} tone={tone as ExperienceAsset["tone"]} label={`${label} trend`} />
            </div>
          ))}
        </article>
        <article className="exp-panel exp-maintenance-card">
          <header className="exp-panel-header"><div><span>MAINTENANCE</span><h3>Service readiness</h3></div></header>
          <dl>
            <div><dt>Last service</dt><dd>{asset.lastService}</dd></div>
            <div><dt>Next planned</dt><dd>{asset.nextService}</dd></div>
            <div><dt>Open work orders</dt><dd>{asset.tone === "warning" ? "2" : "0"}</dd></div>
            <div><dt>Data confidence</dt><dd>98.7%</dd></div>
          </dl>
        </article>
        <LineChart
          title={`${asset.name} output`}
          primary={data.productionTrend}
          previous={previousTrend}
          unit="MW"
          revision={trendRevision}
        />
      </section>
    </div>
  );
}

function MapPage({
  data,
  tick,
  paused,
  onSite,
}: {
  data: ExperienceDataset;
  tick: number;
  paused: boolean;
  onSite: (site: ExperienceSite) => void;
}) {
  return (
    <div className="exp-page">
      <header className="exp-page-title"><div><span>SPATIAL OVERVIEW</span><h1>Connected industrial portfolio</h1><p>Site context, technology and operating health in one spatial view.</p></div></header>
      <LiveTelemetryRail metrics={data.liveMetrics} tick={tick} paused={paused} />
      <section className="exp-map-panel">
        <div className="exp-map-orbit" aria-hidden="true"><i /><i /><i /></div>
        {data.sites.map((site, index) => (
          <button type="button" className={`exp-map-site map-site-${index + 1}`} key={site.id} onClick={() => onSite(site)}>
            <AssetGlyph kind={site.kind} />
            <span>{site.shortName}</span>
            <strong>{site.productionMwh.toFixed(1)} MWh</strong>
            <StatusPill tone={site.tone}>
              {site.availability.toFixed(1)}% · {site.health.toFixed(1)}% health
            </StatusPill>
          </button>
        ))}
        <div className="exp-map-total"><span>CONNECTED OUTPUT</span><strong>{data.portfolio.productionMw.toFixed(1)} MW</strong></div>
      </section>
    </div>
  );
}

function RevenuePage({
  data,
  tick,
  paused,
  previousTrend,
  trendRevision,
}: {
  data: ExperienceDataset;
  tick: number;
  paused: boolean;
  previousTrend: ExperienceDataset["productionTrend"];
  trendRevision: number;
}) {
  const marketPrice = 72.4 + Math.sin(tick * 0.11) * 4.8;
  const captureRate = 91.2 + Math.sin(tick * 0.07) * 1.8;
  const forecastConfidence = 94.6 + Math.cos(tick * 0.05) * 1.2;
  const valueToday = data.portfolio.revenueMillions + Math.sin(tick * 0.08) * 1.6;
  return (
    <div className="exp-page">
      <header className="exp-page-title">
        <div>
          <span>COMMERCIAL OPERATIONS</span>
          <h1>Turn operating signal into value</h1>
          <p>Revenue realization, market exposure and forecast confidence across the portfolio.</p>
        </div>
        <span className="exp-concept-badge">Live commercial view</span>
      </header>
      <LiveTelemetryRail metrics={data.liveMetrics} tick={tick} paused={paused} />
      <section className="exp-kpi-row">
        <KpiCard eyebrow="Revenue today" value={`$${valueToday.toFixed(1)}m`} detail="Portfolio realized value" delta="+3.8%" tone="healthy" />
        <KpiCard eyebrow="Market price" value={`$${marketPrice.toFixed(1)}`} unit="/ MWh" detail="Blended reference price" delta={marketPrice > 75 ? "Above plan" : "Inside plan"} tone={marketPrice > 78 ? "warning" : "healthy"} />
        <KpiCard eyebrow="Capture rate" value={captureRate.toFixed(1)} unit="%" detail="Realized price / reference price" delta="+1.4%" tone="healthy" />
        <KpiCard eyebrow="Forecast confidence" value={forecastConfidence.toFixed(1)} unit="%" detail="Next 24 hours · weighted" delta="Stable" tone="healthy" />
      </section>
      <section className="exp-revenue-grid">
        <LineChart
          title="Revenue realization and forecast"
          primary={data.productionTrend}
          previous={previousTrend}
          secondary={data.forecastTrend}
          unit="$k"
          revision={trendRevision}
        />
        <article className="exp-panel exp-revenue-mix">
          <header className="exp-panel-header">
            <div><span>VALUE MIX</span><h3>Where value comes from</h3></div>
            <span>Today</span>
          </header>
          <div className="exp-revenue-mix-visual">
            <DonutChart
              label="Revenue value mix"
              centerValue="$240m"
              centerLabel="portfolio"
              segments={[
                { label: "PPA", value: 64, color: "#55d6dc" },
                { label: "Merchant", value: 23, color: "#e6a84c" },
                { label: "Ancillary", value: 13, color: "#df6bd5" },
              ]}
            />
            <div className="exp-revenue-mix-table">
              {[
                ["PPA contracted", 64, "$154.2m", "healthy"],
                ["Merchant market", 23, "$55.3m", "warning"],
                ["Ancillary services", 13, "$30.8m", "healthy"],
              ].map(([label, share, amount, tone]) => (
                <div className="exp-revenue-mix-row" key={label}>
                  <span><i className={`tone-${tone}`} /><strong>{label}</strong></span>
                  <div><b style={{ width: `${share}%` }} /><small>{share}%</small></div>
                  <em>{amount}</em>
                </div>
              ))}
            </div>
          </div>
          <footer><span>Exposure watch</span><strong>Merchant share +2.1%</strong></footer>
        </article>
      </section>
      <section className="exp-revenue-lower">
        <article className="exp-panel exp-commercial-strip">
          <header className="exp-panel-header"><div><span>MARKET SIGNALS</span><h3>Commercial watchpoints</h3></div></header>
          {[
            ["North Region", "PPA floor protected", "99.2%", "healthy"],
            ["Eemshaven H₂", "Certificate premium", "+$4.8/MWh", "warning"],
            ["Rhine BESS", "Ancillary dispatch", "14 events", "healthy"],
          ].map(([site, label, value, tone]) => (
            <div key={site}><i className={`tone-${tone}`} /><span><strong>{site}</strong><small>{label}</small></span><b>{value}</b></div>
          ))}
        </article>
        <article className="exp-panel exp-deal-feed">
          <header className="exp-panel-header"><div><span>RECENT ACTIVITY</span><h3>Value events</h3></div><StatusPill tone="healthy">Updating</StatusPill></header>
          {[
            ["10:42", "Forecast uplift confirmed", "Clark Mountain · +$8.2k"],
            ["10:35", "Battery dispatch cleared", "Rhine BESS · 2.4 MWh"],
            ["10:21", "Hydrogen premium marked", "Eemshaven · Review"],
          ].map(([time, title, detail]) => (
            <div key={time}><time>{time}</time><span><strong>{title}</strong><small>{detail}</small></span><b>›</b></div>
          ))}
        </article>
      </section>
    </div>
  );
}

function CollaborationPage({
  data,
  tick,
  paused,
}: {
  data: ExperienceDataset;
  tick: number;
  paused: boolean;
}) {
  const openActions = 6 + (tick % 3);
  const handoverReadiness = 88 + (tick % 5);
  return (
    <div className="exp-page">
      <header className="exp-page-title">
        <div>
          <span>OPERATIONS COLLABORATION</span>
          <h1>Keep the shift in sync</h1>
          <p>Decisions, handover context and actions stay attached to the operation.</p>
        </div>
        <button type="button" className="exp-action-button"><i><Plus aria-hidden="true" /></i> New handover</button>
      </header>
      <LiveTelemetryRail metrics={data.liveMetrics} tick={tick} paused={paused} />
      <section className="exp-kpi-row">
        <KpiCard eyebrow="Open actions" value={openActions} detail="Across active shifts" delta="2 due soon" tone="warning" />
        <KpiCard eyebrow="Handover readiness" value={handoverReadiness} unit="%" detail="Evidence attached to decisions" delta="+4.2%" tone="healthy" />
        <KpiCard eyebrow="Decisions today" value={14 + (tick % 4)} detail="Operator and reliability review" delta="+3 vs yesterday" tone="healthy" />
        <KpiCard eyebrow="Team coverage" value="5 / 5" detail="Roles connected to current shift" delta="All online" tone="healthy" />
      </section>
      <section className="exp-collaboration-grid">
        <article className="exp-panel exp-shift-board">
          <header className="exp-panel-header"><div><span>SHIFT BOARD</span><h3>Operational handover</h3></div><StatusPill tone="healthy">Shift B · Live</StatusPill></header>
          <div className="exp-shift-columns">
            {[
              { title: "Now", tone: "critical", items: [["Inverter temperature deviation", "Clark Mountain · Reliability"], ["Confirm hydrogen efficiency", "Eemshaven · Shift B"]] },
              { title: "Next", tone: "warning", items: [["Review forecast variance", "Portfolio · Supervisor"], ["Validate historian latency", "OMAALI10 · IT / Data"]] },
              { title: "Done", tone: "healthy", items: [["Battery dispatch cleared", "Rhine BESS · 10:35"], ["PPA forecast shared", "North Region · 10:12"]] },
            ].map((column) => (
              <div key={column.title} className={`exp-shift-column column-${column.tone}`}>
                <header><span>{column.title}</span><b>{column.items.length}</b></header>
                {column.items.map(([title, detail]) => <button type="button" key={title}><i /><span><strong>{title}</strong><small>{detail}</small></span><b>›</b></button>)}
              </div>
            ))}
          </div>
        </article>
        <article className="exp-panel exp-collab-feed">
          <header className="exp-panel-header"><div><span>TEAM ACTIVITY</span><h3>Recent decisions</h3></div></header>
          {[
            ["Now", "Maya Chen", "marked Block 3 temperature as watch", "Reliability"],
            ["8m", "Omar Silva", "attached a shift note to Eemshaven", "Operator"],
            ["21m", "Nadia Wong", "approved forecast review action", "Supervisor"],
            ["34m", "Solera Agent", "refreshed portfolio evidence", "System"],
          ].map(([time, person, action, role]) => (
            <div key={`${time}-${person}`}><time>{time}</time><span><strong>{person}</strong><small>{action}</small></span><b>{role}</b></div>
          ))}
          <button type="button" className="exp-text-button">Open activity stream <span>↗</span></button>
        </article>
        <article className="exp-panel exp-collab-spectrum">
          <header className="exp-panel-header"><div><span>TEAM SIGNAL</span><h3>Activity frequency</h3></div><span>24h</span></header>
          <SpectrumChart
            title="Collaboration activity frequency"
            values={COLLABORATION_ACTIVITY_SPECTRUM}
            labels={["00", "06", "12", "18", "24"]}
            tone="magenta"
          />
          <DonutChart
            label="Collaboration action distribution"
            centerValue={`${openActions}`}
            centerLabel="open actions"
            segments={[
              { label: "Now", value: 2, color: "#ff6b70" },
              { label: "Next", value: 3, color: "#e6a84c" },
              { label: "Done", value: 8, color: "#62d79b" },
            ]}
          />
        </article>
      </section>
    </div>
  );
}

function HsePage({
  data,
  tick,
  paused,
  previousTrend,
  trendRevision,
}: {
  data: ExperienceDataset;
  tick: number;
  paused: boolean;
  previousTrend: ExperienceDataset["productionTrend"];
  trendRevision: number;
}) {
  const safeWork = 96.2 + Math.sin(tick * 0.06) * 0.6;
  const permitCompliance = 98.1 + Math.cos(tick * 0.05) * 0.4;
  const nearMisses = 2 + (tick % 2);
  return (
    <div className="exp-page">
      <header className="exp-page-title">
        <div>
          <span>HEALTH · SAFETY · ENVIRONMENT</span>
          <h1>Make safe work visible</h1>
          <p>Leading indicators, permit readiness and environmental performance across the fleet.</p>
        </div>
        <StatusPill tone={nearMisses > 2 ? "warning" : "healthy"}>{nearMisses > 2 ? "Review signals" : "Within target"}</StatusPill>
      </header>
      <LiveTelemetryRail metrics={data.liveMetrics} tick={tick} paused={paused} />
      <section className="exp-kpi-row">
        <KpiCard eyebrow="Safe work index" value={safeWork.toFixed(1)} unit="%" detail="Leading indicator composite" delta="+0.8%" tone="healthy" />
        <KpiCard eyebrow="Permit compliance" value={permitCompliance.toFixed(1)} unit="%" detail="Active permit-to-work checks" delta="Target 98%" tone={permitCompliance < 98 ? "warning" : "healthy"} />
        <KpiCard eyebrow="Near misses" value={nearMisses} detail="Last 24 hours · review required" delta="2 open" tone="warning" />
        <KpiCard eyebrow="CO₂ avoided" value={data.portfolio.avoidedCo2Tons.toLocaleString()} unit="t" detail="Estimated portfolio impact" delta="+8.6%" tone="healthy" />
      </section>
      <section className="exp-hse-grid">
        <article className="exp-panel exp-hse-controls">
          <header className="exp-panel-header"><div><span>LEADING INDICATORS</span><h3>Control effectiveness</h3></div><Gauge value={safeWork} label="Safe work" tone="healthy" /></header>
          {[
            ["Lockout / tagout", 98.4, "healthy"],
            ["Working at height", 94.8, "healthy"],
            ["Electrical isolation", 91.6, "warning"],
            ["Confined space", 99.1, "healthy"],
            ["PPE observation", 96.7, "healthy"],
          ].map(([label, value, tone]) => (
            <div key={label}><span>{label}</span><div><i className={`bar-${tone}`} style={{ width: `${value}%` }} /></div><strong>{value}%</strong></div>
          ))}
        </article>
        <article className="exp-panel exp-hse-events">
          <header className="exp-panel-header"><div><span>FIELD SIGNALS</span><h3>Safety events</h3></div><b>{nearMisses}</b></header>
          {[
            ["High", "Inverter access permit nearing expiry", "Clark Mountain · 7m", "critical"],
            ["Medium", "Hydrogen PPE observation logged", "Eemshaven · 18m", "warning"],
            ["Low", "Routine environmental sample complete", "OMAALI10 · 32m", "healthy"],
          ].map(([level, title, detail, tone]) => (
            <div key={title}><i className={`severity-${tone}`} /><span><strong>{title}</strong><small>{detail}</small></span><b>{level}</b></div>
          ))}
          <button type="button" className="exp-text-button">Open HSE register <span>↗</span></button>
        </article>
        <article className="exp-panel exp-hse-radar">
          <header className="exp-panel-header"><div><span>RISK PROFILE</span><h3>Control coverage radar</h3></div><StatusPill tone="healthy">Target view</StatusPill></header>
          <RadarChart
            title="HSE control coverage"
            axes={[
              { label: "Permit", value: 96 },
              { label: "Training", value: 84 },
              { label: "Isolation", value: 72 },
              { label: "PPE", value: 91 },
              { label: "Environment", value: 79 },
            ]}
          />
          <div className="exp-hse-risk-strip"><span><i className="tone-healthy" />Safe zone</span><span><i className="tone-warning" />Review band</span><span><i className="tone-critical" />Action required</span></div>
        </article>
      </section>
    </div>
  );
}

function ActivitiesPage({
  data,
  tick,
  paused,
  previousTrend,
  trendRevision,
}: {
  data: ExperienceDataset;
  tick: number;
  paused: boolean;
  previousTrend: ExperienceDataset["productionTrend"];
  trendRevision: number;
}) {
  const latency = 120 + Math.round((Math.sin(tick * 0.18) + 1) * 32);
  const events = [
    ["Now", "Telemetry snapshot received", "PI Vision · 428 signals", "healthy"],
    ["4s", "SCADA context refreshed", "203.146.71.23 · approved", "healthy"],
    ["12s", "Data quality check completed", "99.1% valid observations", "healthy"],
    ["28s", "Historian latency increased", `OMAALI10 · ${latency} ms`, "warning"],
    ["1m", "Agent trace archived", "Read-only · tenant-demo", "neutral"],
  ];
  return (
    <div className="exp-page">
      <header className="exp-page-title">
        <div>
          <span>DATA OPERATIONS</span>
          <h1>See the system behind the signal</h1>
          <p>Connector health, freshness, quality and recent operating activity.</p>
        </div>
        <StatusPill tone={latency > 170 ? "warning" : "healthy"}>{latency > 170 ? "Latency watch" : "All systems nominal"}</StatusPill>
      </header>
      <LiveTelemetryRail metrics={data.liveMetrics} tick={tick} paused={paused} />
      <section className="exp-kpi-row">
        <KpiCard eyebrow="Data quality" value="98.7" unit="%" detail="Signals inside freshness SLA" delta="+0.4%" tone="healthy" />
        <KpiCard eyebrow="Current latency" value={latency} unit="ms" detail="Cross-connector median" delta={latency > 170 ? "Watch" : "Normal"} tone={latency > 170 ? "warning" : "healthy"} />
        <KpiCard eyebrow="Active connectors" value="4 / 4" detail="Easy PI · PI Vision · SCADA · historian" delta="Connected" tone="healthy" />
        <KpiCard eyebrow="Events today" value={28 + (tick % 5)} detail="Audit-ready activity records" delta="+6%" tone="healthy" />
      </section>
      <section className="exp-activities-grid">
        <article className="exp-panel exp-connector-panel">
          <header className="exp-panel-header"><div><span>CONNECTOR HEALTH</span><h3>Freshness by source</h3></div><StatusPill tone="healthy">Read-only</StatusPill></header>
          {[
            ["Easy PI", "CDT158 · CDT159", 98.9, 84, "healthy"],
            ["PI Vision", "Tank Details context", 97.4, 132, "healthy"],
            ["SCADA", "Approved test origin", 99.1, 96, "healthy"],
            ["Historian", "OMAALI10 stream", 94.8, latency, latency > 170 ? "warning" : "healthy"],
          ].map(([source, detail, quality, sourceLatency, tone]) => (
            <div key={source}><i className={`tone-${tone}`} /><span><strong>{source}</strong><small>{detail}</small></span><b>{quality}%</b><em>{sourceLatency} ms</em></div>
          ))}
        </article>
        <article className="exp-panel exp-activity-stream">
          <header className="exp-panel-header"><div><span>ACTIVITY STREAM</span><h3>What just happened</h3></div><span className="exp-stream-live">● LIVE</span></header>
          {events.map(([time, title, detail, tone]) => (
            <div key={`${time}-${title}`}><time>{time}</time><i className={`tone-${tone}`} /><span><strong>{title}</strong><small>{detail}</small></span></div>
          ))}
          <button type="button" className="exp-text-button">Open audit trail <span>↗</span></button>
        </article>
        <article className="exp-panel exp-activity-visuals">
          <header className="exp-panel-header"><div><span>INGESTION PROFILE</span><h3>Observation frequency</h3></div><span>24h snapshot</span></header>
          <SpectrumChart
            title="Observation ingestion spectrum"
            values={INGESTION_ACTIVITY_SPECTRUM}
            labels={["00", "04", "08", "12", "16", "20", "24"]}
            tone="cyan"
          />
          <DonutChart
            label="Observation source distribution"
            centerValue="428"
            centerLabel="signals"
            segments={[
              { label: "PI Vision", value: 42, color: "#55d6dc" },
              { label: "Easy PI", value: 27, color: "#e6a84c" },
              { label: "SCADA", value: 19, color: "#62d79b" },
              { label: "Other", value: 12, color: "#df6bd5" },
            ]}
          />
        </article>
      </section>
    </div>
  );
}

function ConceptPage({
  page,
  data,
  tick,
  paused,
  previousTrend,
  trendRevision,
}: {
  page: "maintenance" | "forecasting";
  data: ExperienceDataset;
  tick: number;
  paused: boolean;
  previousTrend: ExperienceDataset["productionTrend"];
  trendRevision: number;
}) {
  const contentByPage: Record<typeof page, readonly [string, string, string]> = {
    maintenance: ["Maintenance readiness", "Plan work around asset risk and production opportunity.", "Predictive work queue"],
    forecasting: ["Production forecasting", "Compare expected output, constraints and confidence.", "Forecast vs actual"],
  };
  const content = contentByPage[page];
  return (
    <div className="exp-page">
      <header className="exp-page-title"><div><span>CONCEPT EXPERIENCE</span><h1>{content[0]}</h1><p>{content[1]}</p></div><span className="exp-concept-badge">Interactive concept</span></header>
      <LiveTelemetryRail
        metrics={data.liveMetrics}
        tick={tick}
        paused={paused}
      />
      <section className="exp-kpi-row exp-kpi-row-compact">
        <KpiCard
          eyebrow={content[2]}
          value={page === "forecasting" ? data.portfolio.productionMw : "7"}
          unit={page === "forecasting" ? "MW" : ""}
          detail="Portfolio-wide simulated indicator"
          delta="+1.8%"
          tone="healthy"
        />
        <KpiCard eyebrow="Attention required" value={page === "maintenance" ? "7" : "3"} detail="Prioritized by operational impact" delta="-2 today" tone="warning" />
        <KpiCard eyebrow="On plan" value="18 / 21" detail="Sites and workstreams in target band" delta="86%" tone="healthy" />
      </section>
      <section className="exp-concept-grid">
        <LineChart
          title={`${content[0]} trend`}
          primary={data.productionTrend}
          previous={previousTrend}
          {...(page === "forecasting"
            ? { secondary: data.forecastTrend }
            : {})}
          unit={page === "forecasting" ? "MW" : "%"}
          revision={trendRevision}
        />
        <article className="exp-panel exp-concept-list"><header className="exp-panel-header"><div><span>NEXT ACTIONS</span><h3>Operational priorities</h3></div></header>{data.alerts.map((alert) => <div key={alert.id}><i className={`severity-${alert.severity}`} /><span><strong>{alert.title}</strong><small>{alert.site} · {alert.owner}</small></span><b>Review</b></div>)}</article>
      </section>
    </div>
  );
}

export function ExperienceView({
  initialRole = "executive",
  onClose,
}: ExperienceViewProps) {
  const [role, setRole] = useState<ExperienceRole>(initialRole);
  const [page, setPage] = useState<ExperiencePage>(
    ROLE_DEFAULT_PAGE[initialRole],
  );
  const [selectedSiteId, setSelectedSiteId] = useState("clark-solar");
  const [selectedAssetId, setSelectedAssetId] = useState("solar-block-1");
  const mainRef = useRef<HTMLElement>(null);
  const {
    data,
    previousTrend,
    tick,
    trendRevision,
    paused,
    setPaused,
    reset,
  } = useExperienceSimulation();

  const selectedSite =
    data.sites.find((site) => site.id === selectedSiteId) ?? data.sites[0]!;
  const selectedAsset = useMemo(
    () =>
      data.sites
        .flatMap((site) => site.assets)
        .find((asset) => asset.id === selectedAssetId) ??
      data.sites[0]?.assets[0],
    [data.sites, selectedAssetId],
  );

  const openSite = (site: ExperienceSite) => {
    setSelectedSiteId(site.id);
    setPage("site");
  };
  const openAsset = (asset: ExperienceAsset) => {
    setSelectedAssetId(asset.id);
    setPage("asset");
  };

  useEffect(() => {
    mainRef.current?.scrollTo?.({ top: 0 });
  }, [page]);

  return (
    <section className="solera-experience" aria-label="Solera Experience Demo">
      <header className="exp-topbar">
        <button type="button" className="exp-brand" onClick={() => setPage("home")}>
          <i>S</i>
          <span><strong>SOLERA</strong><small>EXPERIENCE</small></span>
        </button>
        <div className="exp-context">
          <span>Portfolio</span><b>›</b><strong>{selectedSite.shortName}</strong>
        </div>
        <div className="exp-live-controls">
          <span className="exp-demo-badge">
            {paused ? "SIMULATION PAUSED" : "LIVE SIMULATION"}
          </span>
          <time>Updated {formatTime(data.generatedAt)}</time>
          <button type="button" onClick={() => setPaused(!paused)}>{paused ? "Resume" : "Pause"}</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
        <label className="exp-role-select">
          <span>View as</span>
          <select
            value={role}
            onChange={(event) => {
              const nextRole = event.target.value as ExperienceRole;
              setRole(nextRole);
              setPage(ROLE_DEFAULT_PAGE[nextRole]);
            }}
          >
            {ROLE_OPTIONS.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}
          </select>
        </label>
        {onClose && <button type="button" className="exp-close" onClick={onClose} aria-label="Close Solera Experience">×</button>}
      </header>

      <aside className="exp-rail">
        <button type="button" className={page === "home" ? "active" : ""} onClick={() => setPage("home")} title="Home" aria-label="Home shortcut"><House aria-hidden="true" /></button>
        <button type="button" className={page === "sites" ? "active" : ""} onClick={() => setPage("sites")} title="Browse sites" aria-label="Browse sites"><Factory aria-hidden="true" /></button>
        <button type="button" className={page === "create" ? "active" : ""} onClick={() => setPage("create")} title="Create" aria-label="Create workspace shortcut"><Plus aria-hidden="true" /></button>
        <button type="button" className={page === "activities" ? "active" : ""} onClick={() => setPage("activities")} title="Activity" aria-label="Activity shortcut"><Activity aria-hidden="true" /></button>
        <span />
        <button type="button" title="Settings" aria-label="Settings"><Settings aria-hidden="true" /></button>
      </aside>

      <main className="exp-main" ref={mainRef}>
        {page === "home" && (
          <PortfolioHome
            data={data}
            role={role}
            tick={tick}
            paused={paused}
            onSite={openSite}
            onPage={setPage}
          />
        )}
        {page === "map" && (
          <MapPage
            data={data}
            tick={tick}
            paused={paused}
            onSite={openSite}
          />
        )}
        {page === "site" && (
          <SiteOperations
            data={data}
            site={selectedSite}
            tick={tick}
            paused={paused}
            previousTrend={previousTrend}
            trendRevision={trendRevision}
            onAsset={openAsset}
          />
        )}
        {page === "sites" && <SitesPage data={data} onSite={openSite} />}
        {page === "asset" && selectedAsset && (
          <AssetDetail
            asset={selectedAsset}
            data={data}
            tick={tick}
            paused={paused}
            previousTrend={previousTrend}
            trendRevision={trendRevision}
          />
        )}
        {page === "create" && <CreateStudio />}
        {["maintenance", "forecasting"].includes(page) && (
          <ConceptPage
            page={page as "maintenance" | "forecasting"}
            data={data}
            tick={tick}
            paused={paused}
            previousTrend={previousTrend}
            trendRevision={trendRevision}
          />
        )}
        {page === "revenue" && (
          <RevenuePage
            data={data}
            tick={tick}
            paused={paused}
            previousTrend={previousTrend}
            trendRevision={trendRevision}
          />
        )}
        {page === "collaboration" && (
          <CollaborationPage data={data} tick={tick} paused={paused} />
        )}
        {page === "hse" && (
          <HsePage
            data={data}
            tick={tick}
            paused={paused}
            previousTrend={previousTrend}
            trendRevision={trendRevision}
          />
        )}
        {page === "activities" && (
          <ActivitiesPage
            data={data}
            tick={tick}
            paused={paused}
            previousTrend={previousTrend}
            trendRevision={trendRevision}
          />
        )}
      </main>

      <nav className="exp-bottom-nav" aria-label="Experience navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button type="button" aria-label={item.label} className={page === item.id ? "active" : ""} key={item.id} onClick={() => {
              if (item.id === "sites" && page !== "sites") {
                setSelectedSiteId("clark-solar");
              }
              setPage(item.id);
            }}>
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </section>
  );
}
