import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { chromium, expect, test } from "@playwright/test";

const extensionPath = path.resolve("apps/sidecar-extension/dist");
const longevityMinutes = Number(
  process.env.SOLERA_EXPERIENCE_LONGEVITY_MINUTES ?? "0",
);

test("Chromium loads the Sidecar and Experience Demo", async ({}, testInfo) => {
  test.setTimeout(Math.max(30_000, longevityMinutes * 60_000 + 60_000));
  expect(fs.existsSync(path.join(extensionPath, "manifest.json"))).toBe(true);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "solera-browser-"));
  const context = await chromium.launchPersistentContext(profile, {
    executablePath: process.env.SOLERA_CHROMIUM_EXECUTABLE ?? chromium.executablePath(),
    headless: process.env.SOLERA_BROWSER_HEADLESS === "true",
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
  try {
    let serviceWorker = context.serviceWorkers()[0];
    serviceWorker ??= await context.waitForEvent("serviceworker");
    const extensionId = new URL(serviceWorker.url()).host;
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
    await page.waitForTimeout(250);
    expect(pageErrors).toEqual([]);
    await expect(page.getByText("Solera", { exact: true })).toBeVisible();
    await expect(page.getByText("What should we verify?")).toBeVisible();
    await page.getByRole("button", { name: "Canvas" }).click();
    await expect(
      page.getByRole("heading", { name: "Solera Agent Platform" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Open Agent Gallery/ }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Experience Demo" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Open full-screen Experience/ }),
    ).toBeVisible();
    const manifest = await page.evaluate(() => chrome.runtime.getManifest());
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.permissions).not.toContain("<all_urls>");
    expect(manifest.content_security_policy?.extension_pages).not.toContain(
      "'unsafe-eval'",
    );

    const hostPage = await context.newPage();
    const hostErrors: string[] = [];
    hostPage.on("pageerror", (error) => hostErrors.push(error.message));
    await hostPage.route("http://203.146.71.23/**", async (route) => {
      await route.fulfill({
        contentType: "text/html",
        body: "<!doctype html><html><body><main id='scada'>Approved SCADA host</main></body></html>",
      });
    });
    await hostPage.setViewportSize({ width: 1440, height: 900 });
    await hostPage.goto("http://203.146.71.23/demo");
    await hostPage.waitForTimeout(250);

    const launchResult = await page.evaluate(async () => {
      const tabs = await chrome.tabs.query({});
      const hostTab = tabs.find((tab) =>
        tab.url?.startsWith("http://203.146.71.23/"),
      );
      if (!hostTab?.id) {
        return { ok: false, error: "Approved host tab not found" };
      }
      return chrome.tabs.sendMessage(hostTab.id, {
        type: "SOLERA_MOUNT_EXPERIENCE",
        role: "reliability",
      });
    });
    expect(launchResult).toEqual({ ok: true });

    const experience = hostPage.locator("#solera-experience-root");
    await expect(experience).toHaveCount(1);
    await expect(
      experience.getByRole("heading", {
        name: "Maintenance readiness",
        exact: true,
      }),
    ).toBeVisible();
    await expect(experience.getByText("LIVE SIMULATION")).toBeVisible();
    await expect(experience.getByText("LIVE TELEMETRY")).toBeVisible();
    const gridFrequency = experience
      .locator(".exp-live-metric")
      .filter({ hasText: "Grid frequency" })
      .locator("strong")
      .first();
    const initialFrequency = await gridFrequency.textContent();
    await expect
      .poll(() => gridFrequency.textContent(), { timeout: 4_000 })
      .not.toBe(initialFrequency);
    await expect(
      experience.locator(".exp-live-metric.exp-tone-critical").first(),
    ).toBeVisible({ timeout: 5_000 });
    if (longevityMinutes > 0) {
      const updateTime = experience.locator(".exp-live-controls time");
      const startUpdate = await updateTime.textContent();
      for (let minute = 0; minute < longevityMinutes; minute += 1) {
        await hostPage.waitForTimeout(60_000);
        await expect(experience).toHaveCount(1);
        expect(hostErrors).toEqual([]);
      }
      expect(await updateTime.textContent()).not.toBe(startUpdate);
    }

    await experience
      .getByRole("button", { name: "Sites", exact: true })
      .click();
    await experience
      .getByRole("button", { name: "Open Clark Mountain Solar Plant" })
      .click();
    await expect(
      experience.getByRole("heading", { name: "Clark Mountain Solar Plant" }),
    ).toBeVisible();
    await experience
      .getByRole("button", { name: "Open Solar Block 1" })
      .click();
    await expect(
      experience.getByRole("heading", {
        name: "Solar Block 1",
        exact: true,
      }),
    ).toBeVisible();

    await experience.getByTitle("Create").click();
    await expect(
      experience.getByRole("heading", {
        name: "Compose a role-specific workspace",
      }),
    ).toBeVisible();
    await experience.getByRole("button", { name: "Add Gauge" }).click();
    await experience.getByRole("button", { name: "Preview" }).click();
    await expect(
      experience.getByText("Preview ready — this is a simulated workflow"),
    ).toBeVisible();

    const screenshotPath = path.resolve(
      "artifacts/experience-demo/solera-experience-1440x900.png",
    );
    fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
    await hostPage.screenshot({ path: screenshotPath });
    await testInfo.attach("Solera Experience 1440x900", {
      path: screenshotPath,
      contentType: "image/png",
    });

    await experience
      .getByRole("button", { name: "Home", exact: true })
      .click();
    await hostPage.setViewportSize({ width: 1920, height: 1080 });
    const homeScreenshotPath = path.resolve(
      "artifacts/experience-demo/solera-experience-home-1920x1080.png",
    );
    await hostPage.screenshot({ path: homeScreenshotPath });
    await testInfo.attach("Solera Experience Home 1920x1080", {
      path: homeScreenshotPath,
      contentType: "image/png",
    });

    for (const pageCheck of [
      {
        nav: "Map",
        heading: "Connected industrial portfolio",
        visual: ".exp-map-panel",
      },
      {
        nav: "Sites",
        heading: "Operations across the portfolio",
        visual: ".exp-site-grid",
      },
      {
        nav: "Maintenance",
        heading: "Maintenance readiness",
        visual: ".exp-concept-grid",
      },
      {
        nav: "Forecasting",
        heading: "Production forecasting",
        visual: ".exp-concept-grid",
      },
      {
        nav: "Revenue",
        heading: "Turn operating signal into value",
        visual: ".exp-donut-chart",
      },
      {
        nav: "Collaboration",
        heading: "Keep the shift in sync",
        visual: ".exp-spectrum-chart",
      },
      {
        nav: "HSE",
        heading: "Make safe work visible",
        visual: ".exp-radar-chart",
      },
      {
        nav: "Activities",
        heading: "See the system behind the signal",
        visual: ".exp-activity-visuals",
      },
    ]) {
      await experience
        .getByRole("button", { name: pageCheck.nav, exact: true })
        .click();
      await expect(
        experience.getByRole("heading", {
          name: pageCheck.heading,
          exact: true,
        }),
      ).toBeVisible();
      await expect(experience.locator(pageCheck.visual)).toBeVisible();
      await hostPage.screenshot({
        path: path.resolve(
          `artifacts/experience-demo/solera-experience-${pageCheck.nav.toLowerCase()}.png`,
        ),
      });
    }

    await experience
      .getByRole("button", { name: "Sites", exact: true })
      .click();
    await experience
      .getByRole("button", { name: "Open Clark Mountain Solar Plant" })
      .click();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-experience-site-operations.png",
      ),
    });
    await experience
      .getByRole("button", { name: "Open Solar Block 1" })
      .click();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-experience-asset-detail.png",
      ),
    });
    await experience
      .getByRole("button", { name: "Create workspace shortcut" })
      .click();
    await expect(
      experience.getByRole("heading", {
        name: "Compose a role-specific workspace",
        exact: true,
      }),
    ).toBeVisible();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-experience-create.png",
      ),
    });

    await experience.getByRole("button", { name: "Home", exact: true }).click();
    expect(
      await experience.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    await hostPage.setViewportSize({ width: 1024, height: 768 });
    expect(
      await experience.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    expect(hostErrors).toEqual([]);
    await hostPage.keyboard.press("Escape");
    await expect(hostPage.locator("#solera-experience-root")).toHaveCount(0);
    await hostPage.setViewportSize({ width: 1440, height: 900 });

    await context.route("http://localhost:8000/v1/loop1/**", async (route) => {
      const pathName = new URL(route.request().url()).pathname;
      if (pathName.endsWith("/investigate/stream")) {
        const traceEvents = [
          {
            eventId: "browser-context",
            traceId: "trace-browser",
            type: "context",
            occurredAt: "2026-01-01T00:00:20.000Z",
            payload: { caseId: "hero", synthetic: true },
          },
          {
            eventId: "browser-plan",
            traceId: "trace-browser",
            type: "plan",
            occurredAt: "2026-01-01T00:00:20.010Z",
            payload: { bounded: true },
          },
          {
            eventId: "browser-tool",
            traceId: "trace-browser",
            type: "tool-start",
            occurredAt: "2026-01-01T00:00:20.020Z",
            payload: { tool: "query_signals" },
          },
          {
            eventId: "browser-safety",
            traceId: "trace-browser",
            type: "safety",
            occurredAt: "2026-01-01T00:00:20.030Z",
            payload: { actionDraftAllowed: false },
          },
          {
            eventId: "browser-complete",
            traceId: "trace-browser",
            type: "complete",
            occurredAt: "2026-01-01T00:00:20.040Z",
            payload: {},
          },
        ];
        await route.fulfill({
          contentType: "application/x-ndjson",
          body: traceEvents.map((event) => JSON.stringify(event)).join("\n"),
        });
        return;
      }
      const payload = pathName.endsWith("/cases")
        ? [
            {
              caseId: "hero",
              title: {
                "zh-TW": "FV-101 冷卻閥卡滯",
                en: "FV-101 valve stiction",
              },
              description: {
                "zh-TW": "調查冷卻閥指令、位置與製程反應。",
                en: "Investigate valve command, position, and process response.",
              },
              targetTick: 220,
              expectedStatus: "complete",
            },
          ]
        : pathName.endsWith("/investigate")
        ? {
            investigationId: "inv-browser",
            runId: "run-browser",
            scenarioState: "normal",
            status: "safe-decline",
            summary: "Collecting sufficient synthetic signal history.",
            alarmClusters: [],
            hypotheses: [],
            evidence: [],
            documents: [],
            similarCases: [],
            recommendations: ["Continue read-only monitoring."],
            missingData: ["fewer than 20 replay observations"],
            skillTrace: [],
            actionDraft: null,
            safetyNotice: "Synthetic, read-only investigation.",
          }
        : {
            synthetic: true,
            run: {
              runId: "run-browser",
              scenarioId: "loop1-reactor-cooling",
              state: "normal",
              tick: 20,
              simulationTime: "2026-01-01T00:00:20Z",
              activeFaults: [],
            },
            observations: [],
            alarms: [],
            pulse: {
              connectorId: "synthetic-pi",
              status: "healthy",
              lagSeconds: 0,
              quality: { good: 60, bad: 0, questionable: 0, missing: 0 },
              details: {
                clockMode: "synthetic-replay",
                scenarioState: "normal",
                tick: 20,
                synthetic: true,
              },
            },
          };
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(payload),
      });
    });
    const loop1Launch = await page.evaluate(async () => {
      const tabs = await chrome.tabs.query({});
      const hostTab = tabs.find((tab) =>
        tab.url?.startsWith("http://203.146.71.23/"),
      );
      if (!hostTab?.id) {
        return { ok: false, error: "Approved host tab not found" };
      }
      return chrome.tabs.sendMessage(hostTab.id, {
        type: "SOLERA_MOUNT_EXPERIENCE",
        mode: "agent-platform",
        loop1: {
          apiBaseUrl: "http://localhost:8000",
          bearerToken: "dev:tenant-demo:browser:viewer",
        },
      });
    });
    expect(loop1Launch).toEqual({ ok: true });
    const loop1Experience = hostPage.locator("#solera-experience-root");
    await expect(
      loop1Experience.getByRole("heading", {
        name: "一個可信平台，快速建置多種工業 Agent",
      }),
    ).toBeVisible();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-agent-gallery-1440x900.png",
      ),
    });
    const loop2Card = loop1Experience.locator(".agent-card").filter({
      hasText: "LOOP-2",
    });
    await loop2Card.getByRole("button", { name: /Explore Concept/ }).click();
    await expect(
      loop1Experience.getByText("SYNTHETIC CONCEPT · NOT FOR OPERATIONS"),
    ).toBeVisible();
    await loop1Experience
      .getByRole("button", { name: "Run Afterburn Analysis" })
      .click();
    await expect(
      loop1Experience.getByText("後燃風險指標高於 synthetic dynamic envelope"),
    ).toBeVisible();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-loop2-afterburn-concept-1440x900.png",
      ),
    });
    await loop1Experience.getByRole("button", { name: "Back to Gallery" }).click();
    await loop1Experience
      .getByRole("button", { name: /Precision Manufacturing/ })
      .click();
    await expect(
      loop1Experience.getByRole("heading", {
        name: "從新品導入到熱處理品質，跨越多種製造決策",
      }),
    ).toBeVisible();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-precision-gallery-1440x900.png",
      ),
    });
    const fastenCard = loop1Experience.locator(".agent-card").filter({
      hasText: "FASTEN-1",
    });
    await expect(fastenCard).toHaveClass(/accent-steel/);
    await fastenCard.getByRole("button", { name: /^Open Workflow$/ }).click();
    await expect(
      loop1Experience.getByRole("heading", {
        name: "建立 RFQ、交付需求與文件版本基準",
      }),
    ).toBeVisible();
    await loop1Experience
      .getByRole("button", { name: "Accept RFQ & Start Workflow" })
      .click();
    await loop1Experience
      .getByRole("button", { name: /Open Drawing Intelligence/ })
      .click();
    await loop1Experience.getByRole("button", { name: "Analyze Drawing" }).click();
    await expect(loop1Experience.getByText("7 verified · 1 missing")).toBeVisible();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-fasten1-drawing-1440x900.png",
      ),
    });
    await loop1Experience
      .getByRole("button", { name: /Confirm Gate A/ })
      .click();
    await loop1Experience
      .getByRole("button", { name: "Search Similar Products" })
      .click();
    await expect(loop1Experience.getByText("P-008821 / Rev B")).toBeVisible();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-fasten1-cases-1440x900.png",
      ),
    });
    await loop1Experience
      .getByRole("button", { name: "Use Case P-008821" })
      .click();
    await loop1Experience
      .getByRole("button", { name: "Build Manufacturing Plan" })
      .click();
    await expect(loop1Experience.getByText("New DIE-2047 required")).toBeVisible();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-fasten1-planning-1440x900.png",
      ),
    });
    await loop1Experience
      .getByRole("button", { name: /Confirm Gate B/ })
      .click();
    await loop1Experience
      .getByRole("button", { name: "Run Synthetic Trial" })
      .click();
    await expect(
      loop1Experience.getByText("Second-station die radius / alignment"),
    ).toBeVisible();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-fasten1-trial-1440x900.png",
      ),
    });
    await loop1Experience
      .getByRole("button", { name: "Approve Inspection Order" })
      .click();
    await loop1Experience
      .getByRole("button", { name: "Generate First Article Package" })
      .click();
    await expect(loop1Experience.getByText("CONDITIONAL PASS")).toBeVisible();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-fasten1-quality-1440x900.png",
      ),
    });
    await loop1Experience
      .getByRole("button", { name: "Complete FASTEN-1 Workflow" })
      .click();
    await expect(
      loop1Experience.getByText("FASTEN-1 WORKFLOW COMPLETE"),
    ).toBeVisible();
    await loop1Experience
      .getByRole("button", { name: "Precision Gallery", exact: true })
      .click();
    const heatCard = loop1Experience.locator(".agent-card").filter({
      hasText: "HEAT-1",
    });
    await expect(heatCard).toHaveClass(/accent-copper/);
    await heatCard.getByRole("button", { name: /^Open Workflow$/ }).click();
    await expect(
      loop1Experience.getByRole("heading", {
        name: "建立批次識別、製程條件與品質規格基準",
      }),
    ).toBeVisible();
    await loop1Experience
      .getByRole("button", { name: "Lock Batch Passport" })
      .click();
    await loop1Experience
      .getByRole("button", { name: "Open Load & Recipe" })
      .click();
    await loop1Experience
      .getByRole("button", { name: "Validate Load & Recipe" })
      .click();
    await expect(loop1Experience.getByText("TC coverage checked")).toBeVisible();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-heat1-load-recipe-1440x900.png",
      ),
    });
    await loop1Experience
      .getByRole("button", { name: /Confirm Gate A & Replay Journey/ })
      .click();
    await loop1Experience
      .getByRole("button", { name: "Replay Furnace Journey" })
      .click();
    await expect(loop1Experience.getByText("3 deviations linked")).toBeVisible();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-heat1-furnace-journey-1440x900.png",
      ),
    });
    await loop1Experience
      .getByRole("button", { name: "Run Quality Soft Sensor" })
      .click();
    await loop1Experience
      .getByRole("button", { name: "Estimate Quality Distribution" })
      .click();
    await expect(
      loop1Experience.getByText("T6 edge tray classified as HOLD candidate"),
    ).toBeVisible();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-heat1-soft-sensor-1440x900.png",
      ),
    });
    await loop1Experience
      .getByRole("button", { name: "Investigate T6 Deviation" })
      .click();
    await loop1Experience
      .getByRole("button", { name: "Build Evidence Investigation" })
      .click();
    await expect(
      loop1Experience.getByText(
        "Zone 3 edge load + quench agitation interaction",
      ),
    ).toBeVisible();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-heat1-investigation-1440x900.png",
      ),
    });
    await loop1Experience
      .getByRole("button", { name: "Approve Sampling Plan" })
      .click();
    await loop1Experience
      .getByRole("button", { name: "Reconcile Official Lab" })
      .click();
    await expect(loop1Experience.getByText("PARTIAL HOLD")).toBeVisible();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-heat1-release-1440x900.png",
      ),
    });
    await loop1Experience
      .getByRole("button", { name: "Complete HEAT-1 Workflow" })
      .click();
    await expect(
      loop1Experience.getByText("HEAT-1 WORKFLOW COMPLETE"),
    ).toBeVisible();
    await loop1Experience
      .getByRole("button", { name: "Precision Gallery", exact: true })
      .click();
    await loop1Experience
      .getByRole("button", { name: /Chemical Process｜化學製程 Agent/ })
      .click();
    const loop1Card = loop1Experience.locator(".agent-card").filter({
      hasText: "LOOP-1",
    });
    await loop1Card.getByRole("button", { name: /Open Live Agent/ }).click();
    await expect(
      loop1Experience.getByRole("heading", { name: "即時單元總覽" }),
    ).toBeVisible();
    await expect(
      loop1Experience.getByText("合成資料 · 唯讀 · 非安全系統"),
    ).toBeVisible();
    await expect(
      loop1Experience.getByRole("button", { name: /Run Hero scenario/ }),
    ).toBeVisible();
    await loop1Experience
      .getByRole("button", { name: /Run Hero scenario/ })
      .click();
    await expect(
      loop1Experience.getByText("已確認 Case、run 與 synthetic context"),
    ).toBeVisible();
    await expect(
      loop1Experience.getByText("調查完成，結果與 Evidence 已封裝"),
    ).toBeVisible();
    await loop1Experience.getByRole("button", { name: "時間軸" }).click();
    await expect(
      loop1Experience.getByRole("heading", { name: "因果警報時間軸" }),
    ).toBeVisible();
    await loop1Experience.getByRole("button", { name: "調查" }).click();
    await expect(
      loop1Experience.getByText(
        "此為合成、唯讀的調查結果，不是設備控制指令或安全判定。",
      ),
    ).toBeVisible();
    await expect(loop1Experience.getByText("Case Console")).toBeVisible();
    await hostPage.screenshot({
      path: path.resolve(
        "artifacts/experience-demo/solera-loop1-investigation.png",
      ),
    });
    await hostPage.keyboard.press("Escape");
    await expect(hostPage.locator("#solera-experience-root")).toHaveCount(0);
    expect(hostErrors).toEqual([]);
    await expect(hostPage.locator("#scada")).toHaveText("Approved SCADA host");
  } finally {
    await context.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }
});

test("Chrome and Edge managed-package contract is compatible", () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(extensionPath, "manifest.json"), "utf8"),
  );
  expect(manifest.manifest_version).toBe(3);
  expect(manifest.side_panel.default_path).toBe("sidepanel.html");
  expect(manifest.background.type).toBe("module");
  expect(manifest.host_permissions).not.toContain("<all_urls>");
  expect(manifest.host_permissions).toContain("http://203.146.71.23/*");
  expect(manifest.content_scripts[0].matches).toContain("http://203.146.71.23/*");
  expect(manifest.permissions).toEqual(
    expect.arrayContaining(["activeTab", "sidePanel", "storage"]),
  );
  for (const iconPath of Object.values(manifest.icons)) {
    expect(fs.existsSync(path.join(extensionPath, String(iconPath)))).toBe(true);
  }
  for (const iconPath of Object.values(manifest.action.default_icon)) {
    expect(fs.existsSync(path.join(extensionPath, String(iconPath)))).toBe(true);
  }
});
