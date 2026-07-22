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
      page.getByRole("heading", { name: "LOOP-1 工業 Agent 實驗室" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Open LOOP-1 Experience/ }),
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
        mode: "loop1",
        loop1: {
          apiBaseUrl: "http://localhost:8000",
          bearerToken: "dev:tenant-demo:browser:viewer",
        },
      });
    });
    expect(loop1Launch).toEqual({ ok: true });
    const loop1Experience = hostPage.locator("#solera-experience-root");
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
