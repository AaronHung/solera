import type { CandidateAsset, PageContext } from "@solera/contracts";

import { defaultTimeContext, safeVisibleText, sanitizeUrl, selectedText } from "./shared";
import type { AdapterInput, SiteAdapter } from "./types";

const DISPLAY_PATTERN = /\/Displays\/(\d+)\/?([^/?#]*)/i;
const ASSET_SELECTORS = [
  "[data-solera-asset]",
  "[data-asset-name]",
  ".asset-name",
  "[aria-label^='Asset:']",
];

function cleanLabel(raw: string): string {
  return raw.replace(/^Asset:\s*/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function assetId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveCandidate(document: Document, displaySlug: string): CandidateAsset[] {
  for (const selector of ASSET_SELECTORS) {
    const element = document.querySelector<HTMLElement>(selector);
    const raw =
      element?.dataset.soleraAsset ??
      element?.dataset.assetName ??
      element?.getAttribute("aria-label") ??
      element?.textContent;
    const label = raw ? cleanLabel(raw) : "";
    if (label) {
      return [
        {
          assetId: assetId(label),
          label,
          confidence: selector.startsWith("[data-") ? 0.92 : 0.8,
          source: "adapter",
          confirmed: false,
        },
      ];
    }
  }

  const label = cleanLabel(displaySlug);
  return label
    ? [
        {
          assetId: `display:${assetId(label)}`,
          label,
          confidence: 0.45,
          source: "url",
          confirmed: false,
        },
      ]
    : [];
}

function resolveTimeContext(
  input: AdapterInput,
): PageContext["timeContext"] {
  const element = input.document.querySelector<HTMLElement>("[data-solera-time-start]");
  const start = element?.dataset.soleraTimeStart;
  const end = element?.dataset.soleraTimeEnd;
  if (start && end) {
    const parsedStart = new Date(start);
    const parsedEnd = new Date(end);
    if (
      Number.isFinite(parsedStart.getTime()) &&
      Number.isFinite(parsedEnd.getTime()) &&
      parsedEnd > parsedStart
    ) {
      return {
        start: parsedStart.toISOString(),
        end: parsedEnd.toISOString(),
        timezone: input.timezone,
        source: "adapter",
        confirmed: false,
      };
    }
  }
  return defaultTimeContext(input.now, input.timezone);
}

export class PiVisionAdapter implements SiteAdapter {
  readonly id = "pi-vision";
  readonly version = "0.1.0";

  matches(url: URL): boolean {
    return /(^|\.)pivision\.iiotfab\.com$/i.test(url.hostname) || url.pathname.includes("/PIVision/");
  }

  capture(input: AdapterInput): PageContext {
    const url = new URL(input.url);
    const match = url.hash.match(DISPLAY_PATTERN) ?? url.pathname.match(DISPLAY_PATTERN);
    const displayId = match?.[1] ?? "unknown";
    const displaySlug = decodeURIComponent(match?.[2] ?? input.title);

    return {
      contextVersion: "0.1",
      tenantId: input.tenantId,
      tabSessionId: input.tabSessionId,
      capturedAt: input.now.toISOString(),
      page: {
        url: sanitizeUrl(input.url),
        urlPattern: `${url.origin}/PIVision/#/Displays/*`,
        systemType: "pi-vision",
        viewType: `display:${displayId}`,
        title: cleanLabel(displaySlug) || input.title,
        selectedText: selectedText(input.selectedText),
        visibleTextDigest: safeVisibleText(input.document),
        adapterId: this.id,
        adapterVersion: this.version,
      },
      candidateAssets: resolveCandidate(input.document, displaySlug),
      timeContext: resolveTimeContext(input),
      sensitivity: "internal",
      capture: {
        screenshotIncluded: false,
        redactionsApplied: ["form-fields", "sensitive-selectors", "url-query"],
      },
    };
  }
}
