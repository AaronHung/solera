import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { chromium, expect, test } from "@playwright/test";

const extensionPath = path.resolve("apps/sidecar-extension/dist");

test("Chromium loads the managed MV3 Sidecar", async () => {
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
    const manifest = await page.evaluate(() => chrome.runtime.getManifest());
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.permissions).not.toContain("<all_urls>");
    expect(manifest.content_security_policy?.extension_pages).not.toContain(
      "'unsafe-eval'",
    );
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
