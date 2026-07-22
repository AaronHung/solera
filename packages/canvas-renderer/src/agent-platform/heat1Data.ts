import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  ChartSpline,
  FileCheck2,
  Flame,
  Gauge,
  Search,
} from "lucide-react";

export type HeatStageId =
  | "passport"
  | "load"
  | "journey"
  | "soft-sensor"
  | "investigation"
  | "release";

export interface HeatStage {
  id: HeatStageId;
  index: number;
  shortLabel: string;
  label: string;
  agent: string;
  icon: LucideIcon;
}

export const HEAT_STAGES: HeatStage[] = [
  {
    id: "passport",
    index: 1,
    shortLabel: "Batch",
    label: "Batch Passport",
    agent: "Batch Context Agent",
    icon: Boxes,
  },
  {
    id: "load",
    index: 2,
    shortLabel: "Load",
    label: "Load & Recipe",
    agent: "Recipe Intelligence Agent",
    icon: Flame,
  },
  {
    id: "journey",
    index: 3,
    shortLabel: "Journey",
    label: "Furnace Journey",
    agent: "Thermal Journey Agent",
    icon: ChartSpline,
  },
  {
    id: "soft-sensor",
    index: 4,
    shortLabel: "Predict",
    label: "Quality Soft Sensor",
    agent: "Metallurgy Soft Sensor",
    icon: Gauge,
  },
  {
    id: "investigation",
    index: 5,
    shortLabel: "Explain",
    label: "Deviation Investigation",
    agent: "Heat-treatment Investigator",
    icon: Search,
  },
  {
    id: "release",
    index: 6,
    shortLabel: "Release",
    label: "Release Evidence",
    agent: "Quality Release Agent",
    icon: FileCheck2,
  },
];

export const HEAT_BATCH = {
  id: "HT-BATCH-260722-17",
  workOrder: "WO-GEAR-2026-4418",
  part: "Transmission Gear G47",
  partNumber: "TG-47-8821 · Rev D",
  material: "18CrNiMo7-6",
  materialLot: "MAT-18CNM-260718-04",
  quantity: 240,
  furnace: "FUR-CARB-03",
  recipe: "CARB-930-CP115-DIF45 · v7",
  customer: "Northstar e-Drive",
  due: "2026-07-24 16:00",
  spec: {
    effectiveCaseDepth: "0.80–1.20 mm",
    surfaceHardness: "58–62 HRC",
    coreHardness: "33–45 HRC",
    distortion: "≤ 0.08 mm TIR",
    retainedAustenite: "≤ 20%",
  },
};

export const HEAT_DOCUMENTS = [
  { type: "Drawing", id: "TG-47-8821 Rev D", state: "revision locked" },
  { type: "Material cert", id: "MAT-18CNM-260718-04", state: "chemistry pass" },
  { type: "Recipe", id: "CARB-930-CP115-DIF45 v7", state: "approved" },
  { type: "Control plan", id: "CP-HT-G47 Rev 5", state: "sample map loaded" },
  { type: "Furnace", id: "FUR-CARB-03", state: "SAT/TUS valid" },
] as const;

export const HEAT_TRAYS = [
  { id: "T1", zone: "Z1 / center", count: 40, tc: "TC-01", risk: 18, caseDepth: 0.94, hardness: 59.8, distortion: 0.041 },
  { id: "T2", zone: "Z1 / edge", count: 40, tc: "TC-03", risk: 31, caseDepth: 0.89, hardness: 59.1, distortion: 0.052 },
  { id: "T3", zone: "Z2 / center", count: 40, tc: "TC-04", risk: 22, caseDepth: 0.92, hardness: 59.6, distortion: 0.047 },
  { id: "T4", zone: "Z2 / edge", count: 40, tc: "TC-05", risk: 39, caseDepth: 0.86, hardness: 58.7, distortion: 0.063 },
  { id: "T5", zone: "Z3 / center", count: 56, tc: "TC-06", risk: 44, caseDepth: 0.84, hardness: 58.4, distortion: 0.071 },
  { id: "T6", zone: "Z3 / edge", count: 24, tc: "TC-07", risk: 82, caseDepth: 0.76, hardness: 57.4, distortion: 0.093 },
] as const;

export const HEAT_RECIPE_PHASES = [
  { sequence: 10, label: "Preheat", target: "650°C", duration: "55 min", purpose: "thermal equalization" },
  { sequence: 20, label: "Heat-up", target: "930°C", duration: "72 min", purpose: "load recovery" },
  { sequence: 30, label: "Carburize", target: "CP 1.15%", duration: "168 min", purpose: "carbon boost" },
  { sequence: 40, label: "Diffuse", target: "CP 0.85%", duration: "45 min", purpose: "case profile" },
  { sequence: 50, label: "Oil Quench", target: "65°C", duration: "18 min", purpose: "martensite formation" },
  { sequence: 60, label: "Temper", target: "180°C", duration: "120 min", purpose: "stress relief" },
] as const;

export const HEAT_JOURNEY = {
  temperature: [24, 180, 420, 650, 760, 880, 928, 931, 929, 925, 845, 520, 190, 182],
  loadTemperature: [24, 145, 365, 604, 718, 842, 910, 918, 916, 912, 780, 430, 178, 180],
  carbonPotential: [0.2, 0.2, 0.25, 0.35, 0.72, 1.08, 1.14, 1.13, 1.07, 0.82, 0.4, 0.2, 0.2, 0.2],
  envelope: [40, 190, 430, 660, 770, 890, 935, 935, 935, 930, 860, 540, 200, 188],
  events: [
    { time: "10:42", type: "quality", title: "TC-07 thermal lag", detail: "Zone 3 edge load remains 13–17°C below center trays." },
    { time: "12:18", type: "process", title: "Carbon-potential recovery delay", detail: "CP undershoot −0.06% for 22 minutes after enrichment pulse." },
    { time: "14:37", type: "quench", title: "Quench transfer 18.4 s", detail: "Approved target ≤ 12 s; agitation QF-02 is 14% below baseline." },
  ],
};

export const HEAT_SOFT_SENSOR = {
  model: "heat-quality-soft-sensor@concept-0.1",
  estimateTime: "2026-07-22 15:06",
  labEta: "2026-07-23 11:30",
  confidence: 81,
  topRisk: "T6 · Zone 3 edge",
  batchMetrics: [
    { label: "Predicted case depth", value: "0.76 ± 0.07 mm", state: "below-spec" },
    { label: "Surface hardness", value: "57.4 ± 1.1 HRC", state: "warning" },
    { label: "Distortion", value: "0.093 ± 0.018 mm", state: "above-spec" },
    { label: "At-risk quantity", value: "24 / 240 pcs", state: "warning" },
  ],
};

export const HEAT_HYPOTHESES = [
  {
    rank: 1,
    confidence: 88,
    title: "Zone 3 edge load + quench agitation interaction",
    detail: "TC-07 lag、CP recovery delay 與 QF-02 agitation drop 均集中在 T6 exposure window。",
    counter: "Center tray T5 is near lower boundary but does not show the same distortion estimate.",
  },
  {
    rank: 2,
    confidence: 57,
    title: "Carbon probe drift",
    detail: "Probe A/B disagreement reaches 0.04% CP during late carburize.",
    counter: "Reference foil and center coupons do not support a furnace-wide bias.",
  },
  {
    rank: 3,
    confidence: 34,
    title: "Material hardenability variation",
    detail: "Material chemistry is within cert range; Jominy result is near historical lower quartile.",
    counter: "Same material lot in prior batch met case hardness at center and edge positions.",
  },
] as const;

export const HEAT_EVIDENCE = [
  { kind: "spec", source: "TG-47-8821 Rev D", claim: "ECD 0.80–1.20 mm; 58–62 HRC; TIR ≤ 0.08 mm." },
  { kind: "recipe", source: "CARB-930-CP115-DIF45 v7", claim: "Approved thermal, atmosphere, transfer, and quench limits." },
  { kind: "signal", source: "TC-07 / CP-A/B / QF-02", claim: "Zone 3 edge lag, CP recovery delay, and lower agitation." },
  { kind: "case", source: "HT-CASE-2025-031", claim: "Similar edge-tray low-hardness pattern after quench-flow degradation." },
  { kind: "model", source: "heat-quality-soft-sensor@concept-0.1", claim: "Versioned inputs, uncertainty, and tray-level estimates." },
] as const;

export const HEAT_LAB_RESULTS = [
  { sample: "Coupon C1", position: "T1 center", caseDepth: 0.95, hardness: 59.9, distortion: 0.039, result: "PASS" },
  { sample: "Coupon C2", position: "T4 edge", caseDepth: 0.85, hardness: 58.8, distortion: 0.061, result: "PASS" },
  { sample: "Coupon C3", position: "T5 center", caseDepth: 0.82, hardness: 58.3, distortion: 0.073, result: "PASS" },
  { sample: "Coupon C4", position: "T6 edge", caseDepth: 0.78, hardness: 57.8, distortion: 0.091, result: "HOLD" },
] as const;
