# Solera v0.1 Browser Matrix

Last run: 2026-07-18

## Contract

- Manifest V3.
- Minimum Chromium version 114 because `chrome.sidePanel` begins at Chrome 114.
- Chrome and Edge use `sidePanel`, `activeTab`, and `storage`.
- Static host permissions are limited to Pilot Easy PI, PI Vision, and local
  development API hosts.
- No `<all_urls>`, `unsafe-eval`, or arbitrary remote script.

Official compatibility references:

- Chrome: https://developer.chrome.com/docs/extensions/reference/api/sidePanel
- Edge: https://learn.microsoft.com/en-us/microsoft-edge/extensions/developer-guide/sidebar
- Edge supported APIs:
  https://learn.microsoft.com/en-us/microsoft-edge/extensions/developer-guide/api-support

Microsoft documents `sidePanel` as an MV3 API on Windows, Linux, and Mac.

## Automated matrix

- Playwright Chromium 149: unpacked MV3 load, service worker, Sidecar UI,
  CSP/manifest — **Pass**.
- Chrome managed package: MV3/Side Panel/permissions/CSP/package SHA contract —
  **Pass**.
- Edge managed package: same Chromium MV3 package contract and officially
  supported API — **Pass**.
- Canvas lifecycle: Shadow DOM mount, duplicate prevention, Escape/explicit
  dispose, host body unchanged — **Pass**.

Branded Google Chrome no longer honors command-line `--load-extension`, so the
runtime automation uses Chrome for Testing/Playwright Chromium. Branded Chrome
and Edge acceptance must install the generated zip/unpacked directory through
their normal managed-extension path.

## Pilot acceptance matrix

Run on the exact enterprise versions:

1. Managed install and update.
2. Action icon opens Sidecar.
3. Easy PI and PI Vision content scripts capture context.
4. OIDC sign-in/token refresh.
5. Streaming text, stop/cancel, and reconnect.
6. Context confirmation.
7. Evidence display.
8. Canvas open/save/reopen/close.
9. Host navigation while Sidecar remains open.
10. Browser restart and extension policy update.

The current development machine had Google Chrome installed and no Microsoft
Edge installation. Therefore branded Edge runtime remains a Pilot environment
acceptance item; it is not represented as locally executed.
