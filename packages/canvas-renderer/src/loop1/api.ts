import type {
  Loop1ApiOptions,
  Loop1CaseSummary,
  Loop1Investigation,
  Loop1Locale,
  Loop1Snapshot,
  Loop1TraceEvent,
} from "./types";

function endpoint(options: Loop1ApiOptions, path: string): string {
  return `${options.apiBaseUrl.replace(/\/$/, "")}/v1/loop1${path}`;
}

async function request<T>(
  options: Loop1ApiOptions,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(endpoint(options, path), {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${options.bearerToken}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { detail?: { code?: string; message?: string } }
      | null;
    throw new Error(
      payload?.detail?.message ??
        payload?.detail?.code ??
        `LOOP-1 API failed (${response.status})`,
    );
  }
  return (await response.json()) as T;
}

export function fetchLoop1Snapshot(
  options: Loop1ApiOptions,
): Promise<Loop1Snapshot> {
  return request(options, "/snapshot");
}

export function investigateLoop1(
  options: Loop1ApiOptions,
): Promise<Loop1Investigation> {
  return request(options, "/investigate", { method: "POST" });
}

export function fetchLoop1Cases(
  options: Loop1ApiOptions,
): Promise<Loop1CaseSummary[]> {
  return request(options, "/cases");
}

export async function investigateLoop1Stream(
  options: Loop1ApiOptions,
  input: {
    caseId: "current" | Loop1CaseSummary["caseId"];
    objective: string;
    locale: Loop1Locale;
  },
  onEvent: (event: Loop1TraceEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(endpoint(options, "/investigate/stream"), {
    method: "POST",
    headers: {
      Accept: "application/x-ndjson",
      Authorization: `Bearer ${options.bearerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    signal: signal ?? null,
  });
  if (!response.ok || !response.body) {
    throw new Error(`LOOP-1 investigation stream failed (${response.status})`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim()) {
        onEvent(JSON.parse(line) as Loop1TraceEvent);
      }
    }
    if (done) {
      break;
    }
  }
  if (buffer.trim()) {
    onEvent(JSON.parse(buffer) as Loop1TraceEvent);
  }
}

export function controlLoop1(
  options: Loop1ApiOptions,
  control:
    | { action: "step"; count: number }
    | { action: "pause" | "resume" | "reset" | "jump-to-fault" }
    | { action: "replay"; toTick: number },
): Promise<Loop1Snapshot> {
  return request(options, "/control", {
    method: "POST",
    body: JSON.stringify(control),
  });
}

export function requestLoop1Approval(
  options: Loop1ApiOptions,
): Promise<Record<string, unknown>> {
  return request(options, "/approvals", { method: "POST" });
}
