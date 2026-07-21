import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { Loop1Experience } from "./Loop1Experience";

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const snapshot = {
  synthetic: true,
  run: {
    runId: "run-loop1",
    scenarioId: "loop1-reactor-cooling",
    state: "alarm-flood",
    tick: 220,
    simulationTime: "2026-01-01T00:03:40Z",
    activeFaults: ["cooling-valve-stiction"],
  },
  observations: [
    ["cooling-valve-command", "component-cooling-valve", "Valve command", "%", 70],
    ["cooling-valve-position", "component-cooling-valve", "Valve position", "%", 55],
    ["cooling-water-flow", "component-reactor-jacket", "Cooling flow", "m3/h", 73],
    ["reactor-temperature", "equipment-reactor", "Reactor temperature", "degC", 132],
    ["reactor-pressure", "equipment-reactor", "Reactor pressure", "MPa", 3.1],
    ["reactor-level", "equipment-reactor", "Reactor level", "%", 62],
    ["separator-level", "equipment-separator", "Separator level", "%", 75],
    ["condenser-duty", "equipment-condenser", "Condenser duty", "MW", 6.5],
    ["compressor-load", "equipment-compressor", "Compressor load", "%", 89],
    ["product-quality-proxy", "equipment-stripper", "Quality proxy", "%", 92],
  ].map(([tagId, assetId, name, unit, value]) => ({
    tagId,
    assetId,
    name,
    unit,
    value,
    quality: "good",
    timestamp: "2026-01-01T00:03:40Z",
  })),
  alarms: [
    {
      alarmId: "alarm-1",
      assetId: "component-cooling-valve",
      tagId: "cooling-valve-position",
      occurredAt: "2026-01-01T00:03:00Z",
      priority: "critical",
      state: "active",
      message: "FV-101 position deviation",
      causeEventId: "fault-1",
    },
  ],
  pulse: {
    connectorId: "synthetic-pi",
    status: "healthy",
    lagSeconds: 0,
    quality: { good: 60, bad: 0, questionable: 0, missing: 0 },
    details: {
      clockMode: "synthetic-replay",
      scenarioState: "alarm-flood",
      tick: 220,
      synthetic: true,
    },
  },
};

const investigation = {
  investigationId: "inv-1",
  runId: "run-loop1",
  scenarioState: "alarm-flood",
  status: "complete",
  summary: "Valve mismatch precedes lower cooling flow and thermal deviation.",
  alarmClusters: [
    {
      clusterId: "cluster-1",
      startedAt: "2026-01-01T00:03:00Z",
      alarmCount: 18,
      criticalAlarmIds: ["alarm-1"],
      summary: "18 linked alarms",
    },
  ],
  hypotheses: [
    {
      hypothesisId: "hypothesis-valve-stiction",
      rank: 1,
      title: "FV-101 cooling-water valve stiction",
      confidence: 0.94,
      status: "supported",
      evidenceRefs: ["evidence-1"],
      counterEvidenceRefs: [],
      reasoningSummary: "Command-position mismatch is the earliest bounded change.",
    },
  ],
  evidence: [
    {
      evidenceId: "evidence-1",
      kind: "signal",
      sourceId: "cooling-valve-position",
      claim: "Current valve position",
      value: 55,
      unit: "%",
      occurredAt: "2026-01-01T00:03:40Z",
      lineage: { synthetic: true },
    },
  ],
  documents: [
    {
      documentId: "sop-r101-cooling-rev4",
      title: "SOP-R101-04 Revision 4",
      section: "chunk-1",
      uri: "solera://sop",
      score: 1,
    },
  ],
  similarCases: [
    {
      caseId: "case-1",
      title: "Valve stiction",
      rootCause: "Cooling valve stiction",
      outcome: "Inspected",
      score: 8,
    },
  ],
  recommendations: ["Verify under approved procedure."],
  missingData: [],
  skillTrace: [
    {
      skillId: "loop1-alarm-triage",
      status: "completed",
      summary: "Clustered alarms.",
      toolCalls: ["cluster_alarms"],
    },
  ],
  actionDraft: {
    actionType: "draft-inspection-work-order",
    title: "Inspect FV-101",
    assetId: "component-cooling-valve",
    priority: "priority",
    evidenceRefs: ["evidence-1"],
    verificationItems: ["Verify independent indications."],
    safetyBoundary: "Draft only.",
  },
  safetyNotice: "Synthetic, read-only investigation.",
};

describe("Loop1Experience", () => {
  it("renders one backend truth across Unit, Timeline, Investigation, and Evidence", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload = url.endsWith("/investigate") ? investigation : snapshot;
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    render(
      <Loop1Experience
        apiBaseUrl="http://localhost:8000"
        bearerToken="dev:tenant-demo:test:viewer"
      />,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Live Unit Overview" }),
      ).toBeTruthy(),
    );
    expect(screen.getByText("15.00 pp")).toBeTruthy();
    expect(screen.getByText("SYNTHETIC · READ-ONLY · NOT A SAFETY SYSTEM")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Timeline" }));
    expect(
      screen.getByRole("heading", { name: "Causal Alarm Timeline" }),
    ).toBeTruthy();
    expect(screen.getByText("FV-101 position deviation")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Investigation" }));
    expect(screen.getByText("FV-101 cooling-water valve stiction")).toBeTruthy();
    expect(screen.getByText("94%")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Evidence" }));
    expect(screen.getByText("SOP-R101-04 Revision 4")).toBeTruthy();
    expect(screen.getByText("loop1-alarm-triage")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Request approval/ })).toBeTruthy();
  });
});
