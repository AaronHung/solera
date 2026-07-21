export const INDUSTRIAL_CONTRACT_VERSION = "0.1" as const;

export type IndustrialAssetKind =
  | "site"
  | "area"
  | "process-unit"
  | "equipment"
  | "component";

export interface IndustrialAlias {
  system: "solera" | "pi" | "dcs" | "erp" | "cmms" | "pid" | "document";
  value: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface IndustrialAsset {
  contractVersion: typeof INDUSTRIAL_CONTRACT_VERSION;
  assetId: string;
  tenantId: string;
  kind: IndustrialAssetKind;
  name: string;
  parentId: string | null;
  aliases: IndustrialAlias[];
  attributes: Record<string, string | number | boolean | null>;
}

export interface SignalLimits {
  loLo?: number | null;
  lo?: number | null;
  hi?: number | null;
  hiHi?: number | null;
}

export interface SignalTag {
  contractVersion: typeof INDUSTRIAL_CONTRACT_VERSION;
  tagId: string;
  tenantId: string;
  assetId: string;
  name: string;
  unit: string;
  dataType: "number" | "string" | "boolean";
  cadenceSeconds: number;
  limits?: SignalLimits;
  aliases: IndustrialAlias[];
}

export interface IndustrialObservation {
  contractVersion: typeof INDUSTRIAL_CONTRACT_VERSION;
  observationId: string;
  tenantId: string;
  runId: string;
  tagId: string;
  timestamp: string;
  value: number | string | boolean | null;
  quality: "good" | "bad" | "questionable" | "missing";
  sequence: number;
  synthetic: true;
}

export interface AlarmEvent {
  contractVersion: typeof INDUSTRIAL_CONTRACT_VERSION;
  alarmId: string;
  tenantId: string;
  runId: string;
  assetId: string;
  tagId: string | null;
  occurredAt: string;
  priority: "low" | "medium" | "high" | "critical";
  state: "active" | "acknowledged" | "cleared";
  message: string;
  causeEventId: string | null;
  synthetic: true;
}

export interface FaultDefinition {
  faultId: string;
  kind: "valve-stiction" | "sensor-bias" | "ingest-delay" | "missing-data";
  injectAtTick: number;
  assetId: string;
  parameters: Record<string, string | number | boolean>;
}

export interface KpiDefinition {
  kpiId: string;
  name: string;
  unit: string;
  formulaVersion: string;
  assumptions: Record<string, string | number | boolean>;
}

export interface ScenarioManifest {
  manifestVersion: typeof INDUSTRIAL_CONTRACT_VERSION;
  scenarioId: string;
  tenantId: string;
  name: string;
  seed: number;
  timezone: string;
  tickSeconds: number;
  startsAt: string;
  assets: IndustrialAsset[];
  tags: SignalTag[];
  faults: FaultDefinition[];
  kpis: KpiDefinition[];
}

export type ScenarioState =
  | "normal"
  | "degrading"
  | "alarm-flood"
  | "investigation"
  | "approval"
  | "recovery"
  | "paused";

export interface ScenarioRun {
  contractVersion: typeof INDUSTRIAL_CONTRACT_VERSION;
  runId: string;
  scenarioId: string;
  tenantId: string;
  seed: number;
  state: ScenarioState;
  startedAt: string;
  simulationTime: string;
  tick: number;
  activeFaults: string[];
  synthetic: true;
}

export interface IndustrialCaseRecord {
  contractVersion: typeof INDUSTRIAL_CONTRACT_VERSION;
  caseId: string;
  tenantId: string;
  title: string;
  summary: string;
  assetIds: string[];
  tagIds: string[];
  documentIds: string[];
  rootCause: string;
  outcome: string;
  occurredAt: string;
  synthetic: true;
}

export interface ApprovalRecord {
  contractVersion: typeof INDUSTRIAL_CONTRACT_VERSION;
  approvalId: string;
  tenantId: string;
  runId: string;
  actionType:
    | "draft-inspection-work-order"
    | "draft-shift-handover"
    | "save-case";
  status: "requested" | "approved" | "rejected";
  requestedAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
  rationale: string | null;
}
