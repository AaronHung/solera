import { afterEach, describe, expect, it } from "vitest";

import { capturePageContext } from ".";

const now = new Date("2026-07-18T03:00:00Z");

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Site Adapters", () => {
  it("captures PI Vision display context without treating pixels as values", () => {
    document.body.innerHTML = `
      <header data-asset-name="Mixing Tank 1">Mixing Tank 1</header>
      <main>Tank Details <span data-sensitive>operator-secret</span></main>
      <input type="password" value="do-not-capture" />
    `;

    const context = capturePageContext({
      tenantId: "tenant-demo",
      tabSessionId: "tab-1",
      url: "https://pivision.iiotfab.com:8443/PIVision/#/Displays/29/Tank_Details",
      title: "Tank Details",
      document,
      selectedText: null,
      now,
      timezone: "Asia/Taipei",
    });

    expect(context.page.systemType).toBe("pi-vision");
    expect(context.page.viewType).toBe("display:29");
    expect(context.candidateAssets[0]).toMatchObject({
      assetId: "mixing-tank-1",
      confidence: 0.92,
      source: "adapter",
    });
    expect(context.page.visibleTextDigest).not.toContain("operator-secret");
    expect(context.capture?.screenshotIncluded).toBe(false);
  });

  it("uses selected known Tag as Easy PI context candidate", () => {
    document.body.innerHTML = "<main>PIBridgeAPI Swagger</main>";
    const context = capturePageContext({
      tenantId: "tenant-demo",
      tabSessionId: "tab-2",
      url: "https://easypi.iiotfab.com/swagger/ui/index?token=must-strip",
      title: "Swagger UI",
      document,
      selectedText: "CDT158",
      now,
      timezone: "Asia/Taipei",
    });

    expect(context.page.systemType).toBe("easy-pi");
    expect(context.page.url).not.toContain("token");
    expect(context.candidateAssets[0]).toMatchObject({
      assetId: "pi-tag:CDT158",
      source: "user",
    });
  });

  it("falls back to generic context without inventing an asset", () => {
    document.body.innerHTML = "<main>Unknown approved system</main>";
    const context = capturePageContext({
      tenantId: "tenant-demo",
      tabSessionId: "tab-3",
      url: "https://approved.example/screen",
      title: "Unknown",
      document,
      selectedText: null,
      now,
      timezone: "Asia/Taipei",
    });

    expect(context.page.systemType).toBe("generic");
    expect(context.candidateAssets).toEqual([]);
  });
});
