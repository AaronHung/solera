import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Solera Sidecar",
  version: "0.1.0",
  minimum_chrome_version: "114",
  description: "Read-only industrial AI Agent Sidecar for Easy PI and PI Vision.",
  icons: {
    16: "icons/icon16.png",
    48: "icons/icon48.png",
    128: "icons/icon128.png",
  },
  permissions: ["activeTab", "sidePanel", "storage"],
  host_permissions: [
    "https://easypi.iiotfab.com/*",
    "https://pivision.iiotfab.com:8443/*",
    "http://localhost/*",
    "http://127.0.0.1/*",
  ],
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  action: {
    default_title: "Open Solera Sidecar",
    default_icon: {
      16: "icons/icon16.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png",
    },
  },
  side_panel: {
    default_path: "sidepanel.html",
  },
  content_scripts: [
    {
      matches: [
        "https://easypi.iiotfab.com/*",
        "https://pivision.iiotfab.com:8443/*",
      ],
      js: ["src/content/index.tsx"],
      run_at: "document_idle",
    },
  ],
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'self'",
  },
});
