import type { ViewSpec } from "@solera/contracts";
import { validateViewSpec } from "@solera/contracts";
import { createRoot, type Root } from "react-dom/client";

import { AgentPlatformExperience } from "./agent-platform/AgentPlatformExperience";
import { agentPlatformStyles } from "./agent-platform/styles";
import { fasten1Styles } from "./agent-platform/fasten1Styles";
import { heat1Styles } from "./agent-platform/heat1Styles";
import { CanvasView } from "./CanvasView";
import { ExperienceView } from "./experience/ExperienceView";
import { experienceStyles } from "./experience/styles";
import type {
  ExperienceHandle,
  ExperienceMountOptions,
} from "./experience/types";
import { Loop1Experience } from "./loop1/Loop1Experience";
import { loop1Styles } from "./loop1/styles";
import { CANVAS_STYLES } from "./styles";

export const SOLERA_CANVAS_ROOT_ID = "solera-canvas-root";
export const SOLERA_EXPERIENCE_ROOT_ID = "solera-experience-root";

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
  if (ownerDocument.getElementById(SOLERA_EXPERIENCE_ROOT_ID)) {
    throw new Error("Close Solera Experience before opening Canvas");
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

export function mountExperienceOverlay(
  options: ExperienceMountOptions = {},
): ExperienceHandle {
  const ownerDocument = options.document ?? document;
  if (ownerDocument.getElementById(SOLERA_EXPERIENCE_ROOT_ID)) {
    throw new Error("A Solera Experience overlay is already mounted");
  }
  if (ownerDocument.getElementById(SOLERA_CANVAS_ROOT_ID)) {
    throw new Error("Close Solera Canvas before opening Experience");
  }

  const host = ownerDocument.createElement("div");
  host.id = SOLERA_EXPERIENCE_ROOT_ID;
  host.dataset.soleraOwned = "experience";
  host.style.setProperty("all", "initial");
  host.style.setProperty("position", "fixed");
  host.style.setProperty("inset", "0");
  host.style.setProperty("z-index", "2147483646");
  const shadowRoot = host.attachShadow({ mode: "open" });
  const style = ownerDocument.createElement("style");
  style.dataset.soleraOwned = "experience-style";
  style.textContent =
    options.mode === "agent-platform"
      ? `${agentPlatformStyles}\n${fasten1Styles}\n${heat1Styles}\n${loop1Styles}`
      : options.mode === "loop1"
        ? loop1Styles
        : experienceStyles;
  const container = ownerDocument.createElement("div");
  container.dataset.soleraOwned = "experience-container";
  container.style.setProperty("width", "100%");
  container.style.setProperty("height", "100%");
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
  if (options.mode === "loop1" || options.mode === "agent-platform") {
    if (!options.loop1) {
      dispose();
      throw new Error("Agent Platform requires LOOP-1 API configuration");
    }
    root.render(
      options.mode === "agent-platform" ? (
        <AgentPlatformExperience {...options.loop1} onClose={close} />
      ) : (
        <Loop1Experience {...options.loop1} onClose={close} />
      ),
    );
  } else {
    root.render(
      <ExperienceView
        {...(options.initialRole ? { initialRole: options.initialRole } : {})}
        onClose={close}
      />,
    );
  }

  return {
    host,
    shadowRoot,
    get disposed() {
      return disposed;
    },
    dispose,
  };
}
