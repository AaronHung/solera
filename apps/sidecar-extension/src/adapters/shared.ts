import type { PageContext } from "@solera/contracts";

const SENSITIVE_SELECTORS = [
  "script",
  "style",
  "noscript",
  "input",
  "textarea",
  "select",
  "[data-sensitive]",
  "[data-solera-redact]",
  "[aria-hidden='true']",
];

export function safeVisibleText(document: Document, limit = 8000): string {
  const clone = document.body?.cloneNode(true);
  if (!(clone instanceof HTMLElement)) {
    return "";
  }
  for (const node of clone.querySelectorAll(SENSITIVE_SELECTORS.join(","))) {
    node.remove();
  }
  return (clone.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, limit);
}

export function sanitizeUrl(raw: string): string {
  const url = new URL(raw);
  url.username = "";
  url.password = "";
  url.search = "";
  return url.toString();
}

export function defaultTimeContext(
  now: Date,
  timezone: string,
  hours = 8,
): PageContext["timeContext"] {
  return {
    start: new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString(),
    end: now.toISOString(),
    timezone,
    source: "default",
    confirmed: false,
  };
}

export function selectedText(input: string | null): string | null {
  const value = input?.replace(/\s+/g, " ").trim().slice(0, 2000);
  return value || null;
}
