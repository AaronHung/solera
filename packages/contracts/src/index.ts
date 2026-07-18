export const CONTRACT_VERSION = "0.1" as const;

export type SystemType = "easy-pi" | "pi-vision" | "generic";
export type Sensitivity = "public" | "internal" | "confidential" | "restricted";
export type DataQualityFlag = "good" | "bad" | "questionable" | "missing";

export interface CandidateAsset {
  assetId: string;
  label: string;
  confidence: number;
  source: "adapter" | "url" | "dom" | "user" | "catalog";
  confirmed?: boolean;
}

export interface PageContext {
  contextVersion: typeof CONTRACT_VERSION;
  tenantId: string;
  tabSessionId: string;
  capturedAt: string;
  page: {
    url: string;
    urlPattern: string;
    systemType: SystemType;
    viewType: string;
    title: string;
    selectedText?: string | null;
    visibleTextDigest?: string | null;
    adapterId?: string;
    adapterVersion?: string;
  };
  candidateAssets: CandidateAsset[];
  timeContext: {
    start: string;
    end: string;
    timezone: string;
    source: "adapter" | "default" | "user";
    confirmed?: boolean;
  };
  sensitivity: Sensitivity;
  capture?: {
    screenshotIncluded?: boolean;
    redactionsApplied?: string[];
  };
}

export interface DataQuality {
  sampleCount: number;
  validCount: number;
  badCount: number;
  missingCount: number;
  coverage: number;
  freshnessSeconds?: number | null;
  warnings?: string[];
}

export interface Evidence {
  evidenceVersion: typeof CONTRACT_VERSION;
  evidenceId: string;
  tenantId: string;
  sourceSystem: string;
  sourceType: "industrial-api" | "document" | "page-context";
  assetId?: string | null;
  tags: string[];
  start: string;
  end: string;
  timezone: string;
  retrievalMode: "current" | "recorded" | "interpolated" | "document" | "context";
  aggregation: string | null;
  calculationVersion: string;
  connectorVersion: string;
  queryId: string;
  retrievedAt: string;
  dataQuality: DataQuality;
  citation?: {
    documentId?: string;
    title?: string;
    section?: string | null;
    uri?: string | null;
  } | null;
}

export type WidgetType =
  | "timeseries"
  | "kpi"
  | "status"
  | "table"
  | "asset"
  | "evidence";

export interface WidgetSpec {
  id: string;
  type: WidgetType;
  title: string;
  evidenceRefs: string[];
  config: Record<string, unknown>;
}

export interface ViewSpec {
  schemaVersion: typeof CONTRACT_VERSION;
  viewId: string;
  tenantId: string;
  title: string;
  layout: "grid" | "stack";
  widgets: WidgetSpec[];
  evidence?: Evidence[];
  createdAt: string;
}

export interface ToolManifest {
  toolVersion: typeof CONTRACT_VERSION;
  name: string;
  description: string;
  readOnly: true;
  requiredRoles: string[];
  limits: {
    maxRangeSeconds: number;
    maxPoints: number;
    timeoutMs: number;
  };
  modelDataPolicy: "none" | "summary-only" | "sampled" | "raw";
  auditPolicy?: "metadata" | "inputs-redacted" | "full-redacted";
}

export interface ConnectorCapabilities {
  protocolVersion: typeof CONTRACT_VERSION;
  connectorId: string;
  connectorVersion: string;
  readOnly: true;
  operations: Array<
    | "health"
    | "list-tags"
    | "current"
    | "recorded"
    | "interpolated"
    | "list-assets"
    | "resolve-asset"
  >;
  limits: {
    maxRangeSeconds: number;
    maxPoints: number;
    timeoutMs: number;
  };
}

export type AgentEventType =
  | "context"
  | "tool-start"
  | "tool-result"
  | "evidence"
  | "text-delta"
  | "view-spec"
  | "complete"
  | "error";

export interface AgentStreamEvent {
  eventVersion: typeof CONTRACT_VERSION;
  eventId: string;
  traceId: string;
  type: AgentEventType;
  occurredAt: string;
  payload: Record<string, unknown>;
}

export {
  ContractValidationError,
  validatePageContext,
  validateViewSpec,
} from "./validation";
