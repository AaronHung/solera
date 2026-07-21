import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";

const here = path.dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(
  fs.readFileSync(path.resolve(here, "../schema/industrial.schema.json"), "utf8"),
) as { $id: string };

const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv);
ajv.addSchema(schema);

function validator(definition: string) {
  return ajv.getSchema(`${schema.$id}#/$defs/${definition}`)!;
}

describe("industrial contracts", () => {
  it("accepts a linked synthetic scenario manifest", () => {
    const valid = validator("ScenarioManifest")({
      manifestVersion: "0.1",
      scenarioId: "loop1-reactor-cooling",
      tenantId: "tenant-demo",
      name: "LOOP-1 Reactor Cooling",
      seed: 1701,
      timezone: "UTC",
      tickSeconds: 1,
      startsAt: "2026-01-01T00:00:00Z",
      assets: [
        {
          contractVersion: "0.1",
          assetId: "site-loop1",
          tenantId: "tenant-demo",
          kind: "site",
          name: "LOOP-1 Synthetic Site",
          parentId: null,
          aliases: [],
          attributes: { synthetic: true },
        },
      ],
      tags: [
        {
          contractVersion: "0.1",
          tagId: "reactor-temperature",
          tenantId: "tenant-demo",
          assetId: "site-loop1",
          name: "Reactor temperature",
          unit: "degC",
          dataType: "number",
          cadenceSeconds: 1,
          limits: { hi: 128, hiHi: 132 },
          aliases: [{ system: "pi", value: "LOOP1.REACTOR.TEMP" }],
        },
      ],
      faults: [
        {
          faultId: "cooling-valve-stiction",
          kind: "valve-stiction",
          injectAtTick: 120,
          assetId: "site-loop1",
          parameters: { severity: 0.7 },
        },
      ],
      kpis: [],
    });

    expect(validator("ScenarioManifest").errors).toBeNull();
    expect(valid).toBe(true);
  });

  it("rejects non-synthetic observations and unapproved actions", () => {
    expect(
      validator("Observation")({
        contractVersion: "0.1",
        observationId: "obs-1",
        tenantId: "tenant-demo",
        runId: "run-1",
        tagId: "reactor-temperature",
        timestamp: "2026-01-01T00:00:00Z",
        value: 125,
        quality: "good",
        sequence: 0,
        synthetic: false,
      }),
    ).toBe(false);

    expect(
      validator("ApprovalRecord")({
        contractVersion: "0.1",
        approvalId: "approval-1",
        tenantId: "tenant-demo",
        runId: "run-1",
        actionType: "change-dcs-setpoint",
        status: "approved",
        requestedAt: "2026-01-01T00:00:00Z",
        decidedAt: "2026-01-01T00:01:00Z",
        decidedBy: "operator-1",
        rationale: "unsafe",
      }),
    ).toBe(false);
  });
});
