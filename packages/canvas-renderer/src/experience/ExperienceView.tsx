import { useMemo, useState } from "react";

import {
  AssetCard,
  AssetGlyph,
  BarChart,
  Gauge,
  KpiCard,
  LineChart,
  LiveTelemetryRail,
  SiteCard,
  Sparkline,
  StatusPill,
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

const NAV_ITEMS: Array<{ id: ExperiencePage; label: string; glyph: string }> = [
  { id: "home", label: "Home", glyph: "⌂" },
  { id: "map", label: "Map", glyph: "⌖" },
  { id: "sites", label: "Sites", glyph: "◇" },
  { id: "maintenance", label: "Maintenance", glyph: "⚙" },
  { id: "forecasting", label: "Forecasting", glyph: "⌁" },
  { id: "revenue", label: "Revenue", glyph: "$" },
  { id: "collaboration", label: "Collaboration", glyph: "◎" },
  { id: "hse", label: "HSE", glyph: "△" },
  { id: "activities", label: "Activities", glyph: "≡" },
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
          <i>+</i>
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
          <div><span>Production</span><strong>{site.productionMwh.toFixed(0)} MWh</strong></div>
          <div><span>Health</span><strong>{site.health}%</strong></div>
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

function MapPage({ data, onSite }: { data: ExperienceDataset; onSite: (site: ExperienceSite) => void }) {
  return (
    <div className="exp-page">
      <header className="exp-page-title"><div><span>SPATIAL OVERVIEW</span><h1>Connected industrial portfolio</h1><p>Site context, technology and operating health in one spatial view.</p></div></header>
      <section className="exp-map-panel">
        <div className="exp-map-orbit" aria-hidden="true"><i /><i /><i /></div>
        {data.sites.map((site, index) => (
          <button type="button" className={`exp-map-site map-site-${index + 1}`} key={site.id} onClick={() => onSite(site)}>
            <AssetGlyph kind={site.kind} />
            <span>{site.shortName}</span>
            <strong>{site.productionMwh.toFixed(0)} MWh</strong>
            <StatusPill tone={site.tone}>{site.availability.toFixed(1)}%</StatusPill>
          </button>
        ))}
        <div className="exp-map-total"><span>CONNECTED OUTPUT</span><strong>{data.portfolio.productionMw.toFixed(1)} MW</strong></div>
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
  page: Exclude<
    ExperiencePage,
    "home" | "sites" | "site" | "map" | "asset" | "create"
  >;
  data: ExperienceDataset;
  tick: number;
  paused: boolean;
  previousTrend: ExperienceDataset["productionTrend"];
  trendRevision: number;
}) {
  const contentByPage: Record<typeof page, readonly [string, string, string]> = {
    maintenance: ["Maintenance readiness", "Plan work around asset risk and production opportunity.", "Predictive work queue"],
    forecasting: ["Production forecasting", "Compare expected output, constraints and confidence.", "Forecast vs actual"],
    revenue: ["Revenue performance", "Connect industrial performance to commercial outcomes.", "Production value"],
    collaboration: ["Shift collaboration", "Keep decisions, actions and context attached to the operation.", "Open actions"],
    hse: ["Health, safety and environment", "See leading indicators and compliance context across sites.", "HSE leading indicators"],
    activities: ["Data and operating activity", "Trace freshness, connector health and recent decisions.", "Recent activity"],
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
        <KpiCard eyebrow={content[2]} value={page === "revenue" ? `$${data.portfolio.revenueMillions.toFixed(1)}m` : "94.2"} unit={page === "revenue" ? "" : "%"} detail="Portfolio-wide simulated indicator" delta="+1.8%" tone="healthy" />
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
          unit={page === "revenue" ? "$k" : "%"}
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
        <button type="button" className={page === "home" ? "active" : ""} onClick={() => setPage("home")} title="Home" aria-label="Home shortcut">⌂</button>
        <button type="button" className={page === "sites" ? "active" : ""} onClick={() => setPage("sites")} title="Browse sites" aria-label="Browse sites">◇</button>
        <button type="button" className={page === "create" ? "active" : ""} onClick={() => setPage("create")} title="Create" aria-label="Create workspace shortcut">＋</button>
        <button type="button" className={page === "activities" ? "active" : ""} onClick={() => setPage("activities")} title="Activity" aria-label="Activity shortcut">◷</button>
        <span />
        <button type="button" title="Settings" aria-label="Settings">⚙</button>
      </aside>

      <main className="exp-main">
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
        {page === "map" && <MapPage data={data} onSite={openSite} />}
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
        {["maintenance", "forecasting", "revenue", "collaboration", "hse", "activities"].includes(page) && (
          <ConceptPage
            page={
              page as Exclude<
                ExperiencePage,
                "home" | "sites" | "site" | "map" | "asset" | "create"
              >
            }
            data={data}
            tick={tick}
            paused={paused}
            previousTrend={previousTrend}
            trendRevision={trendRevision}
          />
        )}
      </main>

      <nav className="exp-bottom-nav" aria-label="Experience navigation">
        {NAV_ITEMS.map((item) => (
          <button type="button" aria-label={item.label} className={page === item.id ? "active" : ""} key={item.id} onClick={() => {
            if (item.id === "sites" && page !== "sites") {
              setSelectedSiteId("clark-solar");
            }
            setPage(item.id);
          }}>
            <i>{item.glyph}</i><span>{item.label}</span>
          </button>
        ))}
      </nav>
    </section>
  );
}
