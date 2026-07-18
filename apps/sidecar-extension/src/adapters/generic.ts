import type { PageContext } from "@solera/contracts";

import { defaultTimeContext, safeVisibleText, sanitizeUrl, selectedText } from "./shared";
import type { AdapterInput, SiteAdapter } from "./types";

export class GenericAdapter implements SiteAdapter {
  readonly id = "generic";
  readonly version = "0.1.0";

  matches(): boolean {
    return true;
  }

  capture(input: AdapterInput): PageContext {
    const url = new URL(input.url);
    return {
      contextVersion: "0.1",
      tenantId: input.tenantId,
      tabSessionId: input.tabSessionId,
      capturedAt: input.now.toISOString(),
      page: {
        url: sanitizeUrl(input.url),
        urlPattern: `${url.origin}${url.pathname}`,
        systemType: "generic",
        viewType: "unknown",
        title: input.title,
        selectedText: selectedText(input.selectedText),
        visibleTextDigest: safeVisibleText(input.document),
        adapterId: this.id,
        adapterVersion: this.version,
      },
      candidateAssets: [],
      timeContext: defaultTimeContext(input.now, input.timezone),
      sensitivity: "internal",
      capture: {
        screenshotIncluded: false,
        redactionsApplied: ["form-fields", "sensitive-selectors", "url-query"],
      },
    };
  }
}
