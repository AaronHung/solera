import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";

const here = path.dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(
  fs.readFileSync(path.resolve(here, "../schema/solera.schema.json"), "utf8"),
) as { $id: string };

const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv);
ajv.addSchema(schema);

function validator(definition: string) {
  return ajv.getSchema(`${schema.$id}#/$defs/${definition}`)!;
}

const evidence = {
  evidenceVersion: "0.1",
  evidenceId: "ev-1",
  tenantId: "tenant-demo",
  sourceSystem: "easy-pi-demo",
  sourceType: "industrial-api",
  assetId: null,
  tags: ["CDT158"],
  start: "2026-07-18T10:00:00+08:00",
  end: "2026-07-18T11:00:00+08:00",
  timezone: "Asia/Taipei",
  retrievalMode: "recorded",
  aggregation: null,
  calculationVersion: "timeseries@0.1.0",
  connectorVersion: "easy-pi@0.1.0",
  queryId: "query-1",
  retrievedAt: "2026-07-18T11:00:01+08:00",
  dataQuality: {
    sampleCount: 10,
    validCount: 10,
    badCount: 0,
    missingCount: 0,
    coverage: 1,
  },
};

describe("Solera contracts", () => {
  it("accepts the minimum PI Vision PageContext", () => {
    const valid = validator("PageContext")({
      contextVersion: "0.1",
      tenantId: "tenant-demo",
      tabSessionId: "tab-1",
      capturedAt: "2026-07-18T11:00:00+08:00",
      page: {
        url: "https://pivision.example/PIVision/#/Displays/29/Tank_Details",
        urlPattern: "*/PIVision/#/Displays/*",
        systemType: "pi-vision",
        viewType: "display",
        title: "Tank Details",
        adapterId: "pi-vision",
        adapterVersion: "0.1.0",
      },
      candidateAssets: [
        {
          assetId: "mixing-tank-1",
          label: "Mixing Tank 1",
          confidence: 0.9,
          source: "adapter",
        },
      ],
      timeContext: {
        start: "2026-07-18T03:00:00Z",
        end: "2026-07-18T11:00:00Z",
        timezone: "Asia/Taipei",
        source: "adapter",
      },
      sensitivity: "internal",
    });

    expect(validator("PageContext").errors).toBeNull();
    expect(valid).toBe(true);
  });

  it("accepts Evidence and a trusted ViewSpec", () => {
    expect(validator("Evidence")(evidence)).toBe(true);
    expect(
      validator("ViewSpec")({
        schemaVersion: "0.1",
        viewId: "view-1",
        tenantId: "tenant-demo",
        title: "CDT158 trend",
        layout: "grid",
        widgets: [
          {
            id: "trend",
            type: "timeseries",
            title: "CDT158",
            evidenceRefs: ["ev-1"],
            config: { analysisId: "analysis-1" },
          },
        ],
        evidence: [evidence],
        createdAt: "2026-07-18T11:00:02+08:00",
      }),
    ).toBe(true);
  });

  it("rejects mutating tools and executable widget keys", () => {
    expect(
      validator("ToolManifest")({
        toolVersion: "0.1",
        name: "write_tag",
        description: "Must never be accepted",
        readOnly: false,
        requiredRoles: ["engineer"],
        limits: { maxRangeSeconds: 60, maxPoints: 1, timeoutMs: 1000 },
        modelDataPolicy: "none",
      }),
    ).toBe(false);

    expect(
      validator("ViewSpec")({
        schemaVersion: "0.1",
        viewId: "bad-view",
        tenantId: "tenant-demo",
        title: "Unsafe",
        layout: "grid",
        widgets: [
          {
            id: "unsafe",
            type: "kpi",
            title: "Unsafe",
            evidenceRefs: [],
            config: { onClick: "javascript:alert(1)" },
          },
        ],
        createdAt: "2026-07-18T11:00:02+08:00",
      }),
    ).toBe(false);
  });
});
