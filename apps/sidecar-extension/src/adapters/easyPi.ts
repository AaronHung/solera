import type { PageContext } from "@solera/contracts";

import { defaultTimeContext, safeVisibleText, sanitizeUrl, selectedText } from "./shared";
import type { AdapterInput, SiteAdapter } from "./types";

const TAG_PATTERN = /\b(?:CDT158|CDT159|SINUSOID)\b/i;

export class EasyPiAdapter implements SiteAdapter {
  readonly id = "easy-pi";
  readonly version = "0.1.0";

  matches(url: URL): boolean {
    return url.hostname === "easypi.iiotfab.com";
  }

  capture(input: AdapterInput): PageContext {
    const url = new URL(input.url);
    const digest = safeVisibleText(input.document);
    const tag = `${input.selectedText ?? ""} ${digest}`.match(TAG_PATTERN)?.[0]?.toUpperCase();

    return {
      contextVersion: "0.1",
      tenantId: input.tenantId,
      tabSessionId: input.tabSessionId,
      capturedAt: input.now.toISOString(),
      page: {
        url: sanitizeUrl(input.url),
        urlPattern: `${url.origin}/*`,
        systemType: "easy-pi",
        viewType: url.pathname.includes("/swagger/") ? "api-explorer" : "easy-pi-page",
        title: input.title,
        selectedText: selectedText(input.selectedText),
        visibleTextDigest: digest,
        adapterId: this.id,
        adapterVersion: this.version,
      },
      candidateAssets: tag
        ? [
            {
              assetId: `pi-tag:${tag}`,
              label: tag,
              confidence: 0.72,
              source: input.selectedText?.toUpperCase().includes(tag) ? "user" : "dom",
              confirmed: false,
            },
          ]
        : [],
      timeContext: defaultTimeContext(input.now, input.timezone),
      sensitivity: "internal",
      capture: {
        screenshotIncluded: false,
        redactionsApplied: ["form-fields", "sensitive-selectors", "url-query"],
      },
    };
  }
}
