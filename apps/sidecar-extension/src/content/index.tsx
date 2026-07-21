import type { ViewSpec } from "@solera/contracts";
import {
  mountCanvasOverlay,
  mountExperienceOverlay,
  type CanvasHandle,
  type ExperienceHandle,
  type ExperienceRole,
} from "@solera/canvas-renderer";

import { capturePageContext } from "../adapters";

interface CaptureMessage {
  type: "SOLERA_CAPTURE_CONTEXT";
  tenantId: string;
  tabSessionId: string;
  timezone: string;
}

interface MountCanvasMessage {
  type: "SOLERA_MOUNT_CANVAS";
  viewSpec: ViewSpec;
}

interface CloseCanvasMessage {
  type: "SOLERA_CLOSE_CANVAS";
}

interface MountExperienceMessage {
  type: "SOLERA_MOUNT_EXPERIENCE";
  role?: ExperienceRole;
  mode?: "portfolio" | "loop1";
  loop1?: {
    apiBaseUrl: string;
    bearerToken: string;
  };
}

interface CloseExperienceMessage {
  type: "SOLERA_CLOSE_EXPERIENCE";
}

type SoleraMessage =
  | CaptureMessage
  | MountCanvasMessage
  | CloseCanvasMessage
  | MountExperienceMessage
  | CloseExperienceMessage;

const EXPERIENCE_ROLES = new Set<ExperienceRole>([
  "executive",
  "shift-supervisor",
  "operator",
  "reliability",
  "it-data",
]);

function isSoleraMessage(message: unknown): message is SoleraMessage {
  if (!message || typeof message !== "object") {
    return false;
  }
  return [
    "SOLERA_CAPTURE_CONTEXT",
    "SOLERA_MOUNT_CANVAS",
    "SOLERA_CLOSE_CANVAS",
    "SOLERA_MOUNT_EXPERIENCE",
    "SOLERA_CLOSE_EXPERIENCE",
  ].includes((message as { type?: string }).type ?? "");
}

let canvasHandle: CanvasHandle | null = null;
let experienceHandle: ExperienceHandle | null = null;

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!isSoleraMessage(message)) {
    return false;
  }
  try {
    if (message.type === "SOLERA_CAPTURE_CONTEXT") {
      const context = capturePageContext({
        tenantId: message.tenantId,
        tabSessionId: message.tabSessionId,
        url: window.location.href,
        title: document.title,
        document,
        selectedText: window.getSelection()?.toString() ?? null,
        now: new Date(),
        timezone: message.timezone,
      });
      sendResponse({ ok: true, context });
    } else if (message.type === "SOLERA_MOUNT_CANVAS") {
      experienceHandle?.dispose();
      experienceHandle = null;
      canvasHandle?.dispose();
      canvasHandle = mountCanvasOverlay({
        spec: message.viewSpec,
        document,
        onClose: () => {
          canvasHandle = null;
        },
      });
      sendResponse({ ok: true });
    } else if (message.type === "SOLERA_CLOSE_CANVAS") {
      canvasHandle?.dispose();
      canvasHandle = null;
      sendResponse({ ok: true });
    } else if (message.type === "SOLERA_MOUNT_EXPERIENCE") {
      if (message.role && !EXPERIENCE_ROLES.has(message.role)) {
        throw new Error("Unsupported Experience role");
      }
      if (message.mode === "loop1" && !message.loop1) {
        throw new Error("LOOP-1 API settings are required");
      }
      canvasHandle?.dispose();
      canvasHandle = null;
      experienceHandle?.dispose();
      experienceHandle = mountExperienceOverlay({
        document,
        ...(message.role ? { initialRole: message.role } : {}),
        ...(message.mode ? { mode: message.mode } : {}),
        ...(message.loop1 ? { loop1: message.loop1 } : {}),
        onClose: () => {
          experienceHandle = null;
        },
      });
      sendResponse({ ok: true });
    } else {
      experienceHandle?.dispose();
      experienceHandle = null;
      sendResponse({ ok: true });
    }
  } catch (error) {
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : "Context capture failed",
    });
  }
  return false;
});
