import type {
  ExperienceAsset,
  ExperienceDataset,
  ExperienceRole,
  ExperienceSite,
  TrendPoint,
} from "./types";

export const ROLE_OPTIONS: Array<{
  id: ExperienceRole;
  label: string;
  shortLabel: string;
  focus: string;
}> = [
  {
    id: "executive",
    label: "Executive",
    shortLabel: "Executive",
    focus: "Portfolio performance, risk and value",
  },
  {
    id: "shift-supervisor",
    label: "Shift Supervisor",
    shortLabel: "Supervisor",
    focus: "Production, deviations and active work",
  },
  {
    id: "operator",
    label: "Operator",
    shortLabel: "Operator",
    focus: "Current conditions and operating limits",
  },
  {
    id: "reliability",
    label: "Reliability Engineer",
    shortLabel: "Reliability",
    focus: "Asset health, anomalies and maintenance",
  },
  {
    id: "it-data",
    label: "IT / Data",
    shortLabel: "IT / Data",
    focus: "Connectivity, data quality and lineage",
  },
];

function wave(count: number, base: number, amplitude: number, phase = 0): number[] {
  return Array.from({ length: count }, (_, index) => {
    const primary = Math.sin((index + phase) * 0.62) * amplitude;
    const secondary = Math.cos((index + phase) * 1.47) * amplitude * 0.28;
    return Number((base + primary + secondary).toFixed(2));
  });
}

function trend(
  count: number,
  base: number,
  amplitude: number,
  labelPrefix: string,
  phase = 0,
): TrendPoint[] {
  return wave(count, base, amplitude, phase).map((value, index) => ({
    label: `${String(index).padStart(2, "0")}${labelPrefix}`,
    value,
  }));
}

function asset(
  input: Omit<ExperienceAsset, "trend"> & { phase: number },
): ExperienceAsset {
  const { phase, ...rest } = input;
  return {
    ...rest,
    trend: wave(18, input.outputMw, Math.max(input.outputMw * 0.12, 1), phase),
  };
}

function siteAssets(
  siteId: string,
  kind: ExperienceAsset["kind"],
  label: string,
  siteCapacityMw: number,
  phase: number,
): ExperienceAsset[] {
  return Array.from({ length: 4 }, (_, index) => {
    const capacityMw = siteCapacityMw / 4;
    const watch = index === 2 && (kind === "hydrogen" || siteId === "baltic-nuclear");
    return asset({
      id: `${siteId}-unit-${index + 1}`,
      name: `${label} ${index + 1}`,
      kind,
      siteId,
      capacityMw,
      outputMw: Number((capacityMw * (0.76 + index * 0.035)).toFixed(1)),
      availability: watch ? 89.6 : Number((96.8 - index * 0.5).toFixed(1)),
      efficiency: watch ? 84.7 : Number((93.8 - index * 0.8).toFixed(1)),
      health: watch ? 75 : 94 - index * 2,
      tone: watch ? "warning" : "healthy",
      lastService: `2026-0${Math.min(index + 3, 7)}-${12 + index}`,
      nextService: `2026-0${Math.min(index + 7, 9)}-${18 + index}`,
      phase: phase + index * 2,
    });
  });
}

const sites: ExperienceSite[] = [
  {
    id: "clark-solar",
    name: "Clark Mountain Solar Plant",
    shortName: "Clark Mountain",
    location: "Nevada",
    country: "USA",
    kind: "solar",
    capacityMw: 100,
    productionMwh: 1842,
    availability: 96.8,
    health: 93,
    tone: "healthy",
    assets: [
      asset({
        id: "solar-block-1",
        name: "Solar Block 1",
        kind: "solar",
        siteId: "clark-solar",
        capacityMw: 25,
        outputMw: 23.4,
        availability: 98.1,
        efficiency: 94.2,
        health: 96,
        tone: "healthy",
        lastService: "2026-06-18",
        nextService: "2026-08-12",
        phase: 1,
      }),
      asset({
        id: "solar-block-2",
        name: "Solar Block 2",
        kind: "solar",
        siteId: "clark-solar",
        capacityMw: 25,
        outputMw: 22.8,
        availability: 96.9,
        efficiency: 92.7,
        health: 91,
        tone: "healthy",
        lastService: "2026-06-03",
        nextService: "2026-07-28",
        phase: 4,
      }),
      asset({
        id: "solar-block-3",
        name: "Solar Block 3",
        kind: "solar",
        siteId: "clark-solar",
        capacityMw: 25,
        outputMw: 20.6,
        availability: 93.2,
        efficiency: 88.9,
        health: 78,
        tone: "warning",
        lastService: "2026-05-12",
        nextService: "2026-07-22",
        phase: 7,
      }),
      asset({
        id: "solar-block-4",
        name: "Solar Block 4",
        kind: "solar",
        siteId: "clark-solar",
        capacityMw: 25,
        outputMw: 21.7,
        availability: 95.1,
        efficiency: 90.4,
        health: 87,
        tone: "healthy",
        lastService: "2026-06-24",
        nextService: "2026-08-20",
        phase: 10,
      }),
    ],
  },
  {
    id: "yorkshire-wind",
    name: "Yorkshire Wind Farm",
    shortName: "Yorkshire Wind",
    location: "Yorkshire",
    country: "United Kingdom",
    kind: "wind",
    capacityMw: 140,
    productionMwh: 2264,
    availability: 94.1,
    health: 88,
    tone: "healthy",
    assets: siteAssets(
      "yorkshire-wind",
      "wind",
      "Turbine Cluster",
      140,
      3,
    ),
  },
  {
    id: "eemshaven-hydrogen",
    name: "Eemshaven Hydrogen Plant",
    shortName: "Eemshaven H₂",
    location: "Groningen",
    country: "Netherlands",
    kind: "hydrogen",
    capacityMw: 50,
    productionMwh: 1176,
    availability: 91.7,
    health: 82,
    tone: "warning",
    assets: siteAssets(
      "eemshaven-hydrogen",
      "hydrogen",
      "Electrolyzer Train",
      50,
      5,
    ),
  },
  {
    id: "omaali-thermal",
    name: "OMAALI10 Combined Cycle",
    shortName: "OMAALI10",
    location: "Abu Dhabi",
    country: "UAE",
    kind: "thermal",
    capacityMw: 320,
    productionMwh: 5748,
    availability: 93.8,
    health: 85,
    tone: "healthy",
    assets: siteAssets(
      "omaali-thermal",
      "thermal",
      "Generation Train",
      320,
      7,
    ),
  },
  {
    id: "rhine-storage",
    name: "Rhine Grid Storage",
    shortName: "Rhine BESS",
    location: "North Rhine",
    country: "Germany",
    kind: "storage",
    capacityMw: 80,
    productionMwh: 892,
    availability: 98.6,
    health: 95,
    tone: "healthy",
    assets: siteAssets(
      "rhine-storage",
      "storage",
      "Battery Block",
      80,
      9,
    ),
  },
  {
    id: "baltic-nuclear",
    name: "Baltic Nuclear Plant",
    shortName: "Baltic Nuclear",
    location: "Pomerania",
    country: "Poland",
    kind: "thermal",
    capacityMw: 420,
    productionMwh: 7425,
    availability: 89.4,
    health: 76,
    tone: "warning",
    assets: siteAssets(
      "baltic-nuclear",
      "thermal",
      "Support Train",
      420,
      11,
    ),
  },
];

export const EXPERIENCE_DATASET: ExperienceDataset = {
  generatedAt: "2026-07-20T03:00:00.000Z",
  portfolio: {
    productionMw: 842.6,
    capacityMw: 1110,
    availability: 94.2,
    renewableShare: 68,
    avoidedCo2Tons: 12840,
    opexMillions: 160.1,
    revenueMillions: 240.3,
  },
  sites,
  alerts: [
    {
      id: "alert-001",
      severity: "high",
      title: "Inverter temperature deviation",
      site: "Clark Mountain · Block 3",
      age: "7 min",
      owner: "Reliability",
    },
    {
      id: "alert-002",
      severity: "medium",
      title: "Electrolyzer efficiency below plan",
      site: "Eemshaven Hydrogen",
      age: "18 min",
      owner: "Shift B",
    },
    {
      id: "alert-003",
      severity: "low",
      title: "Historian latency above baseline",
      site: "OMAALI10",
      age: "26 min",
      owner: "IT / Data",
    },
  ],
  liveMetrics: [
    {
      id: "grid-frequency",
      label: "Grid frequency",
      value: 50.04,
      unit: "Hz",
      cadence: "1s",
      tone: "healthy",
      status: "Stable",
      history: wave(16, 50.04, 0.06, 2),
    },
    {
      id: "net-output",
      label: "Net output",
      value: 842.6,
      unit: "MW",
      cadence: "1s",
      tone: "healthy",
      status: "Tracking plan",
      history: wave(16, 842.6, 6.5, 3),
    },
    {
      id: "inverter-temperature",
      label: "Inverter temperature",
      value: 78.2,
      unit: "°C",
      cadence: "1s",
      tone: "healthy",
      status: "Normal",
      history: wave(16, 78.2, 3.1, 5),
    },
    {
      id: "hydrogen-pressure",
      label: "Hydrogen pressure",
      value: 33.4,
      unit: "bar",
      cadence: "1s",
      tone: "healthy",
      status: "Normal",
      history: wave(16, 33.4, 2.2, 7),
    },
    {
      id: "forecast-deviation",
      label: "Forecast deviation",
      value: 2.2,
      unit: "%",
      cadence: "5s",
      tone: "healthy",
      status: "Inside plan",
      history: wave(16, 2.2, 1.7, 9),
    },
  ],
  productionTrend: trend(24, 792, 74, ":00", 2),
  forecastTrend: trend(24, 808, 58, ":00", 3),
  hourlyProduction: trend(24, 38, 13, "h", 1),
};
