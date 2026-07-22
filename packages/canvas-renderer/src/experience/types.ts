export type ExperienceRole =
  | "executive"
  | "shift-supervisor"
  | "operator"
  | "reliability"
  | "it-data";

export type ExperiencePage =
  | "home"
  | "map"
  | "sites"
  | "site"
  | "maintenance"
  | "forecasting"
  | "revenue"
  | "collaboration"
  | "hse"
  | "activities"
  | "asset"
  | "create";

export type ExperienceTone = "healthy" | "warning" | "critical" | "neutral";

export interface ExperienceMountOptions {
  document?: Document;
  initialRole?: ExperienceRole;
  mode?: "portfolio" | "loop1" | "agent-platform";
  loop1?: {
    apiBaseUrl: string;
    bearerToken: string;
  };
  onClose?: () => void;
}

export interface ExperienceHandle {
  readonly host: HTMLElement;
  readonly shadowRoot: ShadowRoot;
  readonly disposed: boolean;
  dispose(): void;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface ExperienceAsset {
  id: string;
  name: string;
  kind: "solar" | "wind" | "hydrogen" | "thermal" | "storage";
  siteId: string;
  capacityMw: number;
  outputMw: number;
  availability: number;
  efficiency: number;
  health: number;
  tone: ExperienceTone;
  lastService: string;
  nextService: string;
  trend: number[];
}

export interface ExperienceSite {
  id: string;
  name: string;
  shortName: string;
  location: string;
  country: string;
  kind: ExperienceAsset["kind"];
  capacityMw: number;
  productionMwh: number;
  availability: number;
  health: number;
  tone: ExperienceTone;
  assets: ExperienceAsset[];
}

export interface ExperienceAlert {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  site: string;
  age: string;
  owner: string;
}

export interface ExperienceLiveMetric {
  id:
    | "grid-frequency"
    | "net-output"
    | "inverter-temperature"
    | "hydrogen-pressure"
    | "forecast-deviation";
  label: string;
  value: number;
  unit: string;
  cadence: "1s" | "5s" | "15s";
  tone: ExperienceTone;
  status: string;
  history: number[];
}

export interface ExperienceDataset {
  generatedAt: string;
  portfolio: {
    productionMw: number;
    capacityMw: number;
    availability: number;
    renewableShare: number;
    avoidedCo2Tons: number;
    opexMillions: number;
    revenueMillions: number;
  };
  sites: ExperienceSite[];
  alerts: ExperienceAlert[];
  liveMetrics: ExperienceLiveMetric[];
  productionTrend: TrendPoint[];
  forecastTrend: TrendPoint[];
  hourlyProduction: TrendPoint[];
}

export interface ExperienceViewProps {
  initialRole?: ExperienceRole;
  onClose?: () => void;
}
