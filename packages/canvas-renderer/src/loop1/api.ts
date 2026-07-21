import type {
  Loop1ApiOptions,
  Loop1Investigation,
  Loop1Snapshot,
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
