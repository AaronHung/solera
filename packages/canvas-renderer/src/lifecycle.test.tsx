import type { ViewSpec } from "@solera/contracts";
import { act } from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { mountCanvasOverlay, SOLERA_CANVAS_ROOT_ID } from "./lifecycle";

const spec: ViewSpec = {
  schemaVersion: "0.1",
  viewId: "view-1",
  tenantId: "tenant-demo",
  title: "Mixing Tank 1",
  layout: "grid",
  widgets: [
    {
      id: "asset",
      type: "asset",
      title: "Asset",
      evidenceRefs: [],
      config: {
        assetId: "mixing-tank-1",
        label: "Mixing Tank 1",
        system: "PI Vision",
        confidence: 0.92,
      },
    },
  ],
  evidence: [],
  createdAt: "2026-07-18T03:00:00Z",
};

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  document.getElementById(SOLERA_CANVAS_ROOT_ID)?.remove();
  document.body.innerHTML = "";
});

describe("Canvas overlay lifecycle", () => {
  it("mounts one isolated Shadow DOM root and fully disposes it", () => {
    document.body.innerHTML = '<main id="host-app" data-state="unchanged">Host</main>';
    const before = document.body.innerHTML;
    let handle: ReturnType<typeof mountCanvasOverlay>;
    act(() => {
      handle = mountCanvasOverlay({ spec, document });
    });

    expect(document.body.innerHTML).toBe(before);
    expect(handle!.host.id).toBe(SOLERA_CANVAS_ROOT_ID);
    expect(handle!.shadowRoot.querySelector(".solera-canvas")).not.toBeNull();
    expect(handle!.shadowRoot.querySelector("script")).toBeNull();

    act(() => handle!.dispose());
    expect(handle!.disposed).toBe(true);
    expect(document.getElementById(SOLERA_CANVAS_ROOT_ID)).toBeNull();
    expect(document.body.innerHTML).toBe(before);
  });

  it("Escape closes the overlay and removes its listener path", () => {
    let closed = 0;
    let handle: ReturnType<typeof mountCanvasOverlay>;
    act(() => {
      handle = mountCanvasOverlay({
        spec,
        document,
        onClose: () => {
          closed += 1;
        },
      });
    });
    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(closed).toBe(1);
    expect(handle!.disposed).toBe(true);

    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(closed).toBe(1);
  });

  it("rejects duplicate mounts and executable config before DOM mutation", () => {
    let handle: ReturnType<typeof mountCanvasOverlay>;
    act(() => {
      handle = mountCanvasOverlay({ spec, document });
    });
    expect(() => mountCanvasOverlay({ spec, document })).toThrow(/already mounted/);
    act(() => handle!.dispose());

    const unsafe = structuredClone(spec);
    unsafe.widgets[0]!.config = { onClick: "javascript:alert(1)" };
    expect(() => mountCanvasOverlay({ spec: unsafe, document })).toThrow(/Invalid|Unsafe/);
    expect(document.getElementById(SOLERA_CANVAS_ROOT_ID)).toBeNull();
  });
});
