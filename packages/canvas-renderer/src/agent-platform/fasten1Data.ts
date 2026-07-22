import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  ClipboardCheck,
  FileSearch,
  Mail,
  Route,
  ScanLine,
} from "lucide-react";

export type FastenStageId =
  | "intake"
  | "drawing"
  | "cases"
  | "planning"
  | "trial"
  | "quality";

export interface FastenStage {
  id: FastenStageId;
  index: number;
  shortLabel: string;
  label: string;
  agent: string;
  icon: LucideIcon;
}

export const FASTEN_STAGES: FastenStage[] = [
  {
    id: "intake",
    index: 1,
    shortLabel: "RFQ",
    label: "Customer Intake",
    agent: "RFQ Engineering Agent",
    icon: Mail,
  },
  {
    id: "drawing",
    index: 2,
    shortLabel: "Drawing",
    label: "Drawing Intelligence",
    agent: "Drawing Intelligence Skill",
    icon: ScanLine,
  },
  {
    id: "cases",
    index: 3,
    shortLabel: "Cases",
    label: "Similar Product Cases",
    agent: "Product Case Retrieval",
    icon: FileSearch,
  },
  {
    id: "planning",
    index: 4,
    shortLabel: "Plan",
    label: "Process, Machine & Tooling",
    agent: "Manufacturability Agent",
    icon: Route,
  },
  {
    id: "trial",
    index: 5,
    shortLabel: "Trial",
    label: "Trial Run & Adjustment",
    agent: "Master Technician Agent",
    icon: Boxes,
  },
  {
    id: "quality",
    index: 6,
    shortLabel: "Quality",
    label: "First Article Evidence",
    agent: "Quality Evidence Agent",
    icon: ClipboardCheck,
  },
];

export const FASTEN_RFQ = {
  id: "RFQ-2026-00182",
  customer: "Apex Mobility Systems",
  sender: "John Smith · Sourcing Engineer",
  email: "john.smith@apex-mobility.example",
  subject: "RFQ – M8 Special Flange Bolt / Rev C",
  received: "2026-07-19 09:32",
  quantity: "500,000 pcs / year",
  lotSize: "50,000 pcs",
  sop: "2027-01-15",
  quoteDue: "2026-07-28",
  message:
    "Please review manufacturability and quote tooling separately. Automotive PPAP Level 3 and full lot traceability are required.",
  attachments: [
    { name: "M8_flange_bolt_revC.pdf", type: "PDF Drawing", size: "2.4 MB" },
    { name: "Apex_Surface_Spec_720h.pdf", type: "Customer Spec", size: "1.1 MB" },
    { name: "Annual_Volume.xlsx", type: "Commercial", size: "84 KB" },
  ],
};

export const FASTEN_SPECS = [
  {
    label: "Part / Revision",
    value: "AB-102938 · Rev C",
    source: "Title Block",
    confidence: 99,
    status: "verified",
  },
  {
    label: "Thread",
    value: "M8 × 1.25 · class 6g",
    source: "CAD dimension + OCR",
    confidence: 99,
    status: "verified",
  },
  {
    label: "Overall length",
    value: "45.0 +0 / −0.3 mm",
    source: "Vector dimension",
    confidence: 98,
    status: "verified",
  },
  {
    label: "Flange diameter",
    value: "Ø18.0 ± 0.15 mm",
    source: "Detail B",
    confidence: 97,
    status: "verified",
  },
  {
    label: "Material",
    value: "JIS SCM435",
    source: "General Note 2",
    confidence: 99,
    status: "verified",
  },
  {
    label: "Heat treatment",
    value: "Quench & Temper · HRC 32–39",
    source: "General Note 4",
    confidence: 96,
    status: "verified",
  },
  {
    label: "Surface",
    value: "Zn-Ni · 8–12 μm · 720 h",
    source: "Customer Spec §5.2",
    confidence: 94,
    status: "verified",
  },
  {
    label: "Friction coefficient",
    value: "Not specified",
    source: "Completeness Rule RFQ-AUTO-17",
    confidence: 100,
    status: "missing",
  },
] as const;

export const FASTEN_CASES = [
  {
    id: "P-008821 / Rev B",
    score: 91,
    title: "M8 SCM435 Hex Flange Bolt",
    subtitle: "Automotive · Zn-Ni · 720 h",
    similarities: ["M8 × 1.25", "SCM435", "HRC 32–39", "Zn-Ni coating"],
    differences: ["42 mm → 45 mm", "較嚴格 flange tolerance", "新增 PPAP L3"],
    fpy: "97.2%",
    scrap: "1.8%",
    lesson: "Supplier B torque-tension 較穩定；電鍍前需明確定義 hydrogen relief baking。",
  },
  {
    id: "P-006418 / Rev D",
    score: 84,
    title: "M8 Serrated Flange Screw",
    subtitle: "Automotive · SCM435",
    similarities: ["相同材料", "相同 cold heading family", "相同 heat treatment"],
    differences: ["Thread length 24 mm", "Zinc flake coating", "無 720 h requirement"],
    fpy: "95.8%",
    scrap: "2.7%",
    lesson: "Second-station die radius wear 曾造成 flange-edge radial crack。",
  },
  {
    id: "P-010224 / Rev A",
    score: 76,
    title: "M10 High-strength Flange Bolt",
    subtitle: "Industrial · Q&T · Zn-Ni",
    similarities: ["高強度 alloy steel", "Zn-Ni", "full traceability"],
    differences: ["M10 × 1.5", "60 mm", "不同 heading tonnage"],
    fpy: "98.1%",
    scrap: "1.1%",
    lesson: "Material spheroidization lot 對 forming load 與 head-fill quality 影響顯著。",
  },
] as const;

export const FASTEN_ROUTE = [
  { sequence: 10, label: "Wire Preparation", owner: "In-house", basis: "SCM435 route rule" },
  { sequence: 20, label: "4-station Cold Heading", owner: "HDR-04", basis: "Geometry + capability" },
  { sequence: 30, label: "Thread Rolling", owner: "TR-12", basis: "M8 × 1.25 case history" },
  { sequence: 40, label: "Quench & Temper", owner: "Partner HT-02", basis: "HRC 32–39" },
  { sequence: 50, label: "Zn-Ni + H₂ Relief", owner: "Partner PL-03", basis: "Customer spec" },
  { sequence: 60, label: "Optical + Final Inspection", owner: "VISION-02", basis: "PPAP Level 3" },
] as const;

export const FASTEN_MACHINES = [
  {
    id: "HDR-04",
    name: "4-station Cold Header",
    match: 96,
    available: "Jul 23 · 08:00",
    tooling: "New DIE-2047 required",
    history: "P-008821 FPY 97.2%",
    recommended: true,
  },
  {
    id: "HDR-07",
    name: "5-station Cold Header",
    match: 89,
    available: "Jul 29 · 08:00",
    tooling: "DIE-1832 adaptable",
    history: "Flange Cpk 1.31",
    recommended: false,
  },
] as const;

export const FASTEN_TRIAL_SIGNALS = {
  load: [58, 60, 62, 61, 64, 67, 69, 76, 84, 88, 91, 89],
  vibration: [22, 24, 23, 25, 26, 27, 31, 37, 45, 52, 57, 55],
  baseline: [57, 59, 61, 61, 63, 65, 67, 69, 71, 72, 73, 74],
};

export const FASTEN_HYPOTHESES = [
  {
    rank: 1,
    confidence: 86,
    title: "Second-station die radius / alignment",
    detail: "Load signature 與 CASE P-006418 相似，camera defect 位於 flange edge。",
  },
  {
    rank: 2,
    confidence: 63,
    title: "Material spheroidization variation",
    detail: "MAT-SCM435-260722-03 hardness 在允收範圍上緣，仍需抽樣確認。",
  },
  {
    rank: 3,
    confidence: 31,
    title: "Machine speed transition",
    detail: "Speed ramp 與 anomaly 同時發生，但 baseline comparison 支持度較低。",
  },
] as const;

export const FASTEN_MEASUREMENTS = [
  { feature: "Overall length", spec: "44.70–45.00", before: "44.86", after: "44.88", unit: "mm" },
  { feature: "Flange Ø", spec: "17.85–18.15", before: "18.13", after: "18.04", unit: "mm" },
  { feature: "Head height", spec: "7.20–7.50", before: "7.47", after: "7.38", unit: "mm" },
  { feature: "Thread GO / NO-GO", spec: "GO / NO-GO", before: "PASS", after: "PASS", unit: "" },
  { feature: "Flange edge crack", spec: "None", before: "1 / 20", after: "0 / 30", unit: "samples" },
  { feature: "Hardness", spec: "32–39", before: "36.2", after: "36.1", unit: "HRC" },
] as const;
