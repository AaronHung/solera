import type { PageContext } from "@solera/contracts";

export interface AdapterInput {
  tenantId: string;
  tabSessionId: string;
  url: string;
  title: string;
  document: Document;
  selectedText: string | null;
  now: Date;
  timezone: string;
}

export interface SiteAdapter {
  readonly id: string;
  readonly version: string;
  matches(url: URL): boolean;
  capture(input: AdapterInput): PageContext;
}
