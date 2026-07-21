import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { execFileSync } from "node:child_process";

import { ZipArchive } from "archiver";

const root = process.cwd();
const artifacts = path.join(root, "artifacts");
const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8"),
);
const version = packageJson.version;
const archiveName = `solera-loop1-demo-handoff-${version}.zip`;
const outputPath = path.join(artifacts, archiveName);
const packageRoot = "solera-loop1-demo-handoff";

const requiredArtifacts = [
  "loop1-scoreboard.json",
  `solera-sidecar-${version}.zip`,
  `solera-sidecar-${version}.zip.sha256`,
  "extension-build-info.json",
];

for (const relativePath of requiredArtifacts) {
  if (!fs.existsSync(path.join(artifacts, relativePath))) {
    throw new Error(
      `Missing artifacts/${relativePath}; run the LOOP-1 evaluation and ` +
        "npm run package:extension first",
    );
  }
}

const rootFiles = [
  ".env.example",
  ".gitignore",
  "README.md",
  "package.json",
  "package-lock.json",
  "playwright.config.ts",
  "pyproject.toml",
  "tsconfig.base.json",
  "uv.lock",
];
const sourceRoots = [
  "apps/sidecar-extension",
  "apps/solera-api",
  "connectors",
  "docs",
  "fixtures",
  "flows",
  "packages",
  "scripts",
  "simulators",
];
const skippedDirectories = new Set([
  ".git",
  ".cursor",
  ".pytest_cache",
  ".venv",
  "__pycache__",
  "artifacts",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results",
]);

function shouldSkipFile(filePath) {
  const name = path.basename(filePath);
  return (
    name === ".env" ||
    name === ".DS_Store" ||
    name.endsWith(".db") ||
    name.endsWith(".sqlite") ||
    name.endsWith(".sqlite3") ||
    name.endsWith(".pyc")
  );
}

function collectFiles(relativeRoot) {
  const start = path.join(root, relativeRoot);
  if (!fs.existsSync(start)) {
    return [];
  }
  const files = [];
  const visit = (absolutePath) => {
    const stat = fs.lstatSync(absolutePath);
    if (stat.isSymbolicLink()) {
      return;
    }
    if (stat.isDirectory()) {
      if (skippedDirectories.has(path.basename(absolutePath))) {
        return;
      }
      for (const entry of fs.readdirSync(absolutePath).sort()) {
        visit(path.join(absolutePath, entry));
      }
      return;
    }
    if (stat.isFile() && !shouldSkipFile(absolutePath)) {
      files.push(absolutePath);
    }
  };
  visit(start);
  return files;
}

function gitOutput(args, fallback) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return fallback;
  }
}

const sourceFiles = [
  ...rootFiles
    .map((relativePath) => path.join(root, relativePath))
    .filter((filePath) => fs.existsSync(filePath)),
  ...sourceRoots.flatMap(collectFiles),
].sort();
const revision = gitOutput(["rev-parse", "--short", "HEAD"], "unavailable");
const sourceStatus = gitOutput(["status", "--porcelain"], "unknown");
const manifest = {
  product: "Solera LOOP-1 Synthetic Industrial Agent",
  version,
  generatedAt: new Date().toISOString(),
  revision,
  sourceState: sourceStatus === "" ? "clean" : "contains uncommitted changes",
  synthetic: true,
  readOnlyPlantBoundary: true,
  externalWrites: false,
  sourceFileCount: sourceFiles.length,
  artifacts: requiredArtifacts,
  startHere: "START_HERE.md",
};
const startHere = `# Solera LOOP-1 Demo Handoff

This package contains the runnable source, built Sidecar extension, evaluation
scoreboard, fixtures, tests, contracts, and customer demo documentation.

## Quick start

1. Extract this archive.
2. Open \`source/docs/runbooks/LOOP1_HANDOFF_AND_TEST.md\`.
3. Copy \`source/.env.example\` to \`source/.env\` and keep all optional
   productization gates disabled.
4. From \`source\`, run:

\`\`\`bash
uv sync --frozen
npm install
npm run build
npm run dev:api
\`\`\`

5. In a second terminal, run:

\`\`\`bash
npm run demo:loop1:normal
\`\`\`

6. Load \`source/apps/sidecar-extension/dist\` as an unpacked MV3 extension.

## Demo

- 10-minute script:
  \`source/docs/runbooks/LOOP1_CUSTOMER_DEMO_10MIN.md\`
- Full technical SOP:
  \`source/docs/runbooks/LOOP1_DEMO_SOP.md\`
- Data Hub and Agent flow:
  \`source/docs/architecture/LOOP1_DATA_HUB_AGENT_FLOW.md\`
- Value validation:
  \`source/docs/value/LOOP1_VALUE_VALIDATION.md\`
- Customer/industry scenario catalog:
  \`source/docs/pitch/SOLERA_CUSTOMER_USE_CASES.md\`
- Product, presales, and investor pitch:
  \`source/docs/pitch/SOLERA_PRODUCT_PITCH.md\`

## Boundary

All LOOP-1 data is synthetic. This is not a customer-plant Digital Twin or
safety system. It does not write to DCS, PLC, SIS, SCADA, PI, MES, CMMS, or ERP.
`;

fs.mkdirSync(artifacts, { recursive: true });
const output = fs.createWriteStream(outputPath);
const archive = new ZipArchive({ zlib: { level: 9 } });
const completion = pipeline(archive, output);

archive.append(startHere, {
  name: `${packageRoot}/START_HERE.md`,
  date: new Date(0),
  mode: 0o644,
});
archive.append(`${JSON.stringify(manifest, null, 2)}\n`, {
  name: `${packageRoot}/handoff-manifest.json`,
  date: new Date(0),
  mode: 0o644,
});

for (const filePath of sourceFiles) {
  archive.file(filePath, {
    name: `${packageRoot}/source/${path.relative(root, filePath)}`,
    date: new Date(0),
    mode: 0o644,
  });
}
for (const relativePath of requiredArtifacts) {
  archive.file(path.join(artifacts, relativePath), {
    name: `${packageRoot}/artifacts/${relativePath}`,
    date: new Date(0),
    mode: 0o644,
  });
}

const screenshot = path.join(
  artifacts,
  "experience-demo",
  "solera-loop1-investigation.png",
);
if (fs.existsSync(screenshot)) {
  archive.file(screenshot, {
    name: `${packageRoot}/artifacts/solera-loop1-investigation.png`,
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

console.log(`${outputPath}\nsha256 ${digest}`);
