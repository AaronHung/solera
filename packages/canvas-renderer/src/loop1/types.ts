export interface Loop1ApiOptions {
  apiBaseUrl: string;
  bearerToken: string;
}

export type Loop1Locale = "zh-TW" | "en";

export interface Loop1CaseSummary {
  caseId: "normal" | "hero" | "safe-decline";
  title: Record<Loop1Locale, string>;
  description: Record<Loop1Locale, string>;
  targetTick: number;
  expectedStatus: Loop1Investigation["status"];
}

export interface Loop1TraceEvent {
  eventId: string;
  traceId: string;
  type:
    | "context"
    | "plan"
    | "tool-start"
    | "tool-result"
    | "evidence"
    | "hypothesis"
    | "safety"
    | "complete"
    | "error";
  occurredAt: string;
  payload: Record<string, unknown>;
}

export interface Loop1Snapshot {
  synthetic: true;
  run: {
    runId: string;
    scenarioId: string;
    state: string;
    tick: number;
    simulationTime: string;
    activeFaults: string[];
  };
  observations: Array<{
    tagId: string;
    assetId: string;
    name: string;
    unit: string;
    value: number | string | boolean | null;
    quality: "good" | "bad" | "questionable" | "missing";
    timestamp: string;
  }>;
  alarms: Array<{
    alarmId: string;
    assetId: string;
    tagId: string | null;
    occurredAt: string;
    priority: "low" | "medium" | "high" | "critical";
    state: string;
    message: string;
    causeEventId: string | null;
  }>;
  pulse?: {
    connectorId: string;
    status: string;
    lagSeconds: number;
    quality: Record<string, number>;
    details: {
      clockMode: string;
      scenarioState: string;
      tick: number;
      synthetic: true;
    };
  };
}

export interface Loop1Evidence {
  evidenceId: string;
  kind: "signal" | "alarm" | "document" | "case" | "calculation" | "quality";
  sourceId: string;
  claim: string;
  value: unknown;
  unit: string | null;
  occurredAt: string | null;
  lineage: Record<string, unknown>;
}

export interface Loop1Investigation {
  investigationId: string;
  runId: string;
  scenarioState: string;
  status: "complete" | "safe-decline" | "no-abnormality";
  summary: string;
  alarmClusters: Array<{
    clusterId: string;
    startedAt: string;
    alarmCount: number;
    criticalAlarmIds: string[];
    summary: string;
  }>;
  hypotheses: Array<{
    hypothesisId: string;
    rank: number;
    title: string;
    confidence: number;
    status: string;
    evidenceRefs: string[];
    counterEvidenceRefs: string[];
    reasoningSummary: string;
  }>;
  evidence: Loop1Evidence[];
  documents: Array<{
    documentId: string;
    title: string;
    section: string | null;
    uri: string | null;
    score: number;
  }>;
  similarCases: Array<{
    caseId: string;
    title: string;
    rootCause: string;
    outcome: string;
    score: number;
  }>;
  recommendations: string[];
  missingData: string[];
  skillTrace: Array<{
    skillId: string;
    status: string;
    summary: string;
    toolCalls: string[];
  }>;
  actionDraft: {
    actionType: string;
    title: string;
    assetId: string;
    priority: string;
    evidenceRefs: string[];
    verificationItems: string[];
    safetyBoundary: string;
  } | null;
  safetyNotice: string;
}

export type Loop1Page = "unit" | "timeline" | "investigation" | "evidence";

export interface Loop1ExperienceProps extends Loop1ApiOptions {
  locale?: Loop1Locale;
  onBack?: () => void;
  onClose?: () => void;
}
