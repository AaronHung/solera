import type { ViewSpec } from "@solera/contracts";
import {
  mountCanvasOverlay,
  type CanvasHandle,
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

type SoleraMessage = CaptureMessage | MountCanvasMessage | CloseCanvasMessage;

function isSoleraMessage(message: unknown): message is SoleraMessage {
  if (!message || typeof message !== "object") {
    return false;
  }
  return [
    "SOLERA_CAPTURE_CONTEXT",
    "SOLERA_MOUNT_CANVAS",
    "SOLERA_CLOSE_CANVAS",
  ].includes((message as { type?: string }).type ?? "");
}

let canvasHandle: CanvasHandle | null = null;

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
      canvasHandle?.dispose();
      canvasHandle = mountCanvasOverlay({
        spec: message.viewSpec,
        document,
        onClose: () => {
          canvasHandle = null;
        },
      });
      sendResponse({ ok: true });
    } else {
      canvasHandle?.dispose();
      canvasHandle = null;
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
