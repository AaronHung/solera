import { afterEach, describe, expect, it, vi } from "vitest";

import { streamChat } from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Solera API client", () => {
  it("parses split NDJSON Agent events without executing content", async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            '{"eventVersion":"0.1","eventId":"1","traceId":"t","type":"text-delta",',
          ),
        );
        controller.enqueue(
          encoder.encode(
            '"occurredAt":"2026-07-18T03:00:00Z","payload":{"text":"<script>plain text</script>"}}\n',
          ),
        );
        controller.enqueue(
          encoder.encode(
            '{"eventVersion":"0.1","eventId":"2","traceId":"t","type":"complete","occurredAt":"2026-07-18T03:00:01Z","payload":{}}\n',
          ),
        );
        controller.close();
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(body, {
          status: 200,
          headers: { "Content-Type": "application/x-ndjson" },
        }),
      ),
    );
    const events: string[] = [];

    await streamChat(
      { apiBaseUrl: "http://localhost:8000", bearerToken: "test" },
      {
        question: "CDT158",
        pageContext: {
          contextVersion: "0.1",
          tenantId: "tenant-demo",
          tabSessionId: "tab-1",
          capturedAt: "2026-07-18T03:00:00Z",
          page: {
            url: "https://easypi.iiotfab.com/swagger/ui/index",
            urlPattern: "https://easypi.iiotfab.com/*",
            systemType: "easy-pi",
            viewType: "api-explorer",
            title: "Easy PI",
          },
          candidateAssets: [],
          timeContext: {
            start: "2026-07-18T02:00:00Z",
            end: "2026-07-18T03:00:00Z",
            timezone: "Asia/Taipei",
            source: "user",
          },
          sensitivity: "internal",
        },
      },
      (event) => events.push(event.type),
    );

    expect(events).toEqual(["text-delta", "complete"]);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/v1/agent/chat",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
