import { describe, expect, it } from "vitest";

import { DEFAULT_MODEL, resolveSettings } from "./App";

describe("Sidecar model settings migration", () => {
  it("migrates an existing pre-revision model selection to Luna once", () => {
    const settings = resolveSettings({
      modelName: "nvidia/nemotron-3-ultra-550b-a55b:free",
    });

    expect(settings.modelName).toBe(DEFAULT_MODEL);
    expect(settings.settingsRevision).toBe(2);
  });

  it("preserves a supported model selected after the Luna migration", () => {
    const settings = resolveSettings({
      settingsRevision: 2,
      modelName: "nvidia/nemotron-3-ultra-550b-a55b:free",
    });

    expect(settings.modelName).toBe(
      "nvidia/nemotron-3-ultra-550b-a55b:free",
    );
  });

  it("falls back to Luna when a stored model is no longer supported", () => {
    const settings = resolveSettings({
      settingsRevision: 2,
      modelName: "removed/provider-model",
    });

    expect(settings.modelName).toBe(DEFAULT_MODEL);
  });
});
