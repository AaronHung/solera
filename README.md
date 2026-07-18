# Project Solera

Solera is a read-only Agent Intelligence Layer for approved browser-based
industrial systems. The v0.1 Pilot attaches a Chrome/Edge Sidecar to Easy PI
and PI Vision, produces reproducible time-series analysis, and renders
validated Canvas views without changing the host system's business data.

`Solera` is a working name pending trademark clearance.

## Start here

Read these files in order before changing code:

1. [v0.1 Product Contract](docs/contracts/SOLERA_V0_1.md)
2. [Current Project State](docs/PROJECT_STATE.md)
3. [System Architecture](docs/architecture/SYSTEM.md)
4. [Architecture Decisions](docs/adr/)
5. [v0.1 Backlog](docs/backlog/V0_1_BACKLOG.md)
6. [Golden Evaluation Set](docs/evals/GOLDEN_QUESTIONS.md)
7. [Threat Model](docs/security/THREAT_MODEL.md)

The contract is authoritative. Scope changes require an ADR and a contract
changelog entry. Every implementation change must reference a requirement or
backlog ID and update project state when it changes verified behavior.

## Product invariants

- The host system remains authoritative.
- v0.1 has no write or control tools.
- Industrial numbers come from versioned deterministic calculations.
- Every numerical conclusion carries reproducible Evidence.
- Page content is untrusted context, never authorization.
- Models produce validated specifications, never executable HTML/JavaScript.
- Closing Solera removes its overlay and leaves the host application intact.

## Planned workspace

```text
apps/
  sidecar-extension/   Chrome/Edge MV3 Sidecar and Site Adapters
  solera-api/          FastAPI control plane and single Agent orchestrator
packages/
  contracts/           Versioned JSON Schema contracts
  canvas-renderer/     Trusted React Canvas renderer
connectors/
  easy-pi/             Read-only Easy PI connector library
flows/                 Idempotent aggregate, knowledge, and eval jobs
docs/                  Product, architecture, security, evals, and runbooks
```

## Local quickstart

```bash
cp .env.example .env
uv sync --frozen
npm install
PYTHONPATH=apps/solera-api:connectors/easy-pi:flows \
  uv run uvicorn solera_api.main:app --reload
```

In another terminal:

```bash
npm run build
```

Load `apps/sidecar-extension/dist` as an unpacked Chromium extension. For local
development only, configure bearer token
`dev:tenant-demo:pilot-user:engineer` in Sidecar settings.

## Verification

```bash
npx playwright install chromium
npm run verify
POSTGRES_PASSWORD=solera-test docker compose config --quiet
npm run package:extension
```

The browser smoke uses Playwright Chromium because current branded Chrome
blocks command-line unpacked extension loading. The same managed-package
contract is checked for Chrome and Edge; final branded-browser acceptance runs
through enterprise extension management.

Operational and demo procedures:

- [Demo runbook](docs/runbooks/DEMO.md)
- [Pilot runbook](docs/runbooks/PILOT.md)
- [Deployment](docs/runbooks/DEPLOYMENT.md)
- [Data retention](docs/security/DATA_RETENTION.md)

## Development status

The v0.1 vertical slice is implemented and locally verified. Live PI Vision,
enterprise OIDC/model policy, managed Chrome/Edge distribution, and multi-user
Pilot metrics remain environment acceptance work. See
[PROJECT_STATE.md](docs/PROJECT_STATE.md) for exact evidence and limitations.
