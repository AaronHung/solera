import type { ViewSpec } from "@solera/contracts";
import { validateViewSpec } from "@solera/contracts";
import { createRoot, type Root } from "react-dom/client";

import { CanvasView } from "./CanvasView";
import { CANVAS_STYLES } from "./styles";

export const SOLERA_CANVAS_ROOT_ID = "solera-canvas-root";

export interface CanvasMountOptions {
  spec: ViewSpec;
  document?: Document;
  onClose?: () => void;
}

export interface CanvasHandle {
  readonly host: HTMLElement;
  readonly shadowRoot: ShadowRoot;
  readonly disposed: boolean;
  dispose(): void;
}

export function mountCanvasOverlay(options: CanvasMountOptions): CanvasHandle {
  const ownerDocument = options.document ?? document;
  if (ownerDocument.getElementById(SOLERA_CANVAS_ROOT_ID)) {
    throw new Error("A Solera Canvas overlay is already mounted");
  }
  const spec = validateViewSpec(options.spec);
  const host = ownerDocument.createElement("div");
  host.id = SOLERA_CANVAS_ROOT_ID;
  host.dataset.soleraOwned = "canvas";
  host.style.setProperty("all", "initial");
  const shadowRoot = host.attachShadow({ mode: "open" });
  const style = ownerDocument.createElement("style");
  style.dataset.soleraOwned = "canvas-style";
  style.textContent = CANVAS_STYLES;
  const container = ownerDocument.createElement("div");
  container.dataset.soleraOwned = "canvas-container";
  shadowRoot.append(style, container);
  ownerDocument.documentElement.append(host);

  let root: Root | null = createRoot(container);
  let disposed = false;
  const dispose = () => {
    if (disposed) {
      return;
    }
    disposed = true;
    ownerDocument.defaultView?.removeEventListener("keydown", onKeyDown);
    root?.unmount();
    root = null;
    host.remove();
  };
  const close = () => {
    dispose();
    options.onClose?.();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      close();
    }
  };
  ownerDocument.defaultView?.addEventListener("keydown", onKeyDown);
  root.render(<CanvasView spec={spec} onClose={close} />);

  return {
    host,
    shadowRoot,
    get disposed() {
      return disposed;
    },
    dispose,
  };
}
