import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";

import { ZipArchive } from "archiver";

const root = process.cwd();
const dist = path.join(root, "apps/sidecar-extension/dist");
const artifacts = path.join(root, "artifacts");
const manifestPath = path.join(dist, "manifest.json");

if (!fs.existsSync(manifestPath)) {
  throw new Error("Extension build is missing; run npm run build first");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.manifest_version !== 3) {
  throw new Error("Managed package must use Manifest V3");
}
const allHosts = [
  ...(manifest.host_permissions ?? []),
  ...(manifest.content_scripts ?? []).flatMap((item) => item.matches ?? []),
];
if (allHosts.some((item) => item === "<all_urls>" || item.includes("*://*"))) {
  throw new Error("Managed package requests an unrestricted host permission");
}
if (!manifest.side_panel?.default_path || !manifest.background?.service_worker) {
  throw new Error("Managed package is missing Sidecar entry points");
}
if (manifest.content_security_policy?.extension_pages?.includes("'unsafe-eval'")) {
  throw new Error("Managed package enables unsafe-eval");
}

fs.mkdirSync(artifacts, { recursive: true });
const archiveName = `solera-sidecar-${manifest.version}.zip`;
const outputPath = path.join(artifacts, archiveName);
const output = fs.createWriteStream(outputPath);
const archive = new ZipArchive({ zlib: { level: 9 } });
const completion = pipeline(archive, output);
const files = fs
  .readdirSync(dist, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => path.join(entry.parentPath, entry.name))
  .sort();
for (const file of files) {
  archive.file(file, {
    name: path.relative(dist, file),
    date: new Date(0),
    mode: 0o644,
  });
}
await archive.finalize();
await completion;

const digest = crypto
  .createHash("sha256")
  .update(fs.readFileSync(outputPath))
  .digest("hex");
fs.writeFileSync(`${outputPath}.sha256`, `${digest}  ${archiveName}\n`);
fs.writeFileSync(
  path.join(artifacts, "extension-build-info.json"),
  `${JSON.stringify(
    {
      name: manifest.name,
      version: manifest.version,
      manifestVersion: manifest.manifest_version,
      archive: archiveName,
      sha256: digest,
      hostPermissions: manifest.host_permissions,
      compatibleBrowsers: ["Google Chrome", "Microsoft Edge"],
    },
    null,
    2,
  )}\n`,
);

console.log(`${outputPath}\nsha256 ${digest}`);
