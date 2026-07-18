import {
  validateViewSpec,
  type AgentStreamEvent,
  type PageContext,
  type ViewSpec,
} from "@solera/contracts";

export interface SoleraConnection {
  apiBaseUrl: string;
  bearerToken: string;
}

export interface ChatInput {
  question: string;
  pageContext: PageContext;
  tags?: string[];
  maxPoints?: number;
  addToCanvas?: boolean;
}

export class SoleraApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "SoleraApiError";
  }
}

export async function streamChat(
  connection: SoleraConnection,
  input: ChatInput,
  onEvent: (event: AgentStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${connection.apiBaseUrl.replace(/\/$/, "")}/v1/agent/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${connection.bearerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    signal: signal ?? null,
  });
  if (!response.ok || !response.body) {
    throw new SoleraApiError(
      `Solera API returned HTTP ${response.status}`,
      response.status,
    );
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
      if (!line.trim()) {
        continue;
      }
      onEvent(JSON.parse(line) as AgentStreamEvent);
    }
    if (done) {
      break;
    }
  }
  if (buffer.trim()) {
    onEvent(JSON.parse(buffer) as AgentStreamEvent);
  }
}

export async function saveCanvas(
  connection: SoleraConnection,
  spec: ViewSpec,
): Promise<ViewSpec> {
  const response = await fetch(`${connection.apiBaseUrl.replace(/\/$/, "")}/v1/canvases`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${connection.bearerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validateViewSpec(spec)),
  });
  if (!response.ok) {
    throw new SoleraApiError(`Canvas save returned HTTP ${response.status}`, response.status);
  }
  return validateViewSpec(await response.json());
}

export async function listCanvases(
  connection: SoleraConnection,
): Promise<ViewSpec[]> {
  const response = await fetch(`${connection.apiBaseUrl.replace(/\/$/, "")}/v1/canvases`, {
    headers: { Authorization: `Bearer ${connection.bearerToken}` },
  });
  if (!response.ok) {
    throw new SoleraApiError(`Canvas list returned HTTP ${response.status}`, response.status);
  }
  const items = (await response.json()) as unknown[];
  return items.map((item) => validateViewSpec(item));
}
