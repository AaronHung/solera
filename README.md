# Project Solera

Solera is a read-only Agent Intelligence Layer for approved browser-based
industrial systems. The v0.1 Pilot attaches a Chrome/Edge Sidecar to Easy PI
and PI Vision, produces reproducible time-series analysis, and renders
validated Canvas views without changing the host system's business data.

`Solera` is a working name pending trademark clearance.

## Start here

Before changing code, read:

1. [v0.1 Product Contract](docs/contracts/SOLERA_V0_1.md)
2. [LOOP-1 Synthetic Contract](docs/contracts/SOLERA_LOOP1_V0_1.md)
3. [Current Project State](docs/PROJECT_STATE.md)
4. [v0.1 Completion Checklist](docs/runbooks/V0_1_COMPLETION_CHECKLIST.md)
5. [System Architecture](docs/architecture/SYSTEM.md)
6. [Architecture Decisions](docs/adr/)
7. [v0.1 Backlog](docs/backlog/V0_1_BACKLOG.md)
8. [Golden Evaluation Set](docs/evals/GOLDEN_QUESTIONS.md)
9. [Threat Model](docs/security/THREAT_MODEL.md)

For a LOOP-1 Demo, start here:

1. [LOOP-1 Demo Playbook](docs/runbooks/LOOP1_DEMO_PLAYBOOK.md)
2. [Agent Gallery Phase 1](docs/architecture/SOLERA_AGENT_GALLERY_PHASE1.md)
3. [FASTEN-1 Concept Experience](docs/architecture/FASTEN1_CONCEPT_EXPERIENCE.md)
4. [HEAT-1 Concept Experience](docs/architecture/HEAT1_CONCEPT_EXPERIENCE.md)
5. [LOOP-1 Investor Demo Rehearsal](docs/runbooks/LOOP1_INVESTOR_DEMO_REHEARSAL.md)
6. [LOOP-1 Handoff and Test](docs/runbooks/LOOP1_HANDOFF_AND_TEST.md)
7. [LOOP-1 Customer Demo — 10 minutes](docs/runbooks/LOOP1_CUSTOMER_DEMO_10MIN.md)
8. [LOOP-1 Demo SOP](docs/runbooks/LOOP1_DEMO_SOP.md)
9. [LOOP-1 Demo Mechanics and Product Evolution](docs/architecture/LOOP1_DEMO_MECHANICS_AND_PRODUCT_EVOLUTION.md)
9. [LOOP-1 Data Hub and Agent Flow](docs/architecture/LOOP1_DATA_HUB_AGENT_FLOW.md)
10. [LOOP-1 Value Validation](docs/value/LOOP1_VALUE_VALIDATION.md)

Product and post-v0.1 direction:

- [Customer Use Case Catalog](docs/pitch/SOLERA_CUSTOMER_USE_CASES.md)
- [Product, Presales, and Investor Pitch](docs/pitch/SOLERA_PRODUCT_PITCH.md)
- [Post-v0.1 Skill System Proposal](docs/contracts/SOLERA_SKILL_SYSTEM_V0_2.md)
- [Solera vs GPT-style Sidecar](docs/architecture/SOLERA_VS_GPT_SIDECAR.md)
- [v0.2 Skill Backlog](docs/backlog/V0_2_SKILL_BACKLOG.md)

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
  synthetic-pi/        Read-only LOOP-1 PI-shaped connector
simulators/
  loop1/               Deterministic synthetic chemical scenario engine
fixtures/
  loop1/               Synthetic documents, cases, and 40 golden evaluations
flows/                 Idempotent aggregate, knowledge, and eval jobs
docs/                  Product, architecture, security, evals, and runbooks
```

## Local quickstart

```bash
cp .env.example .env
uv sync --frozen
npm install
PYTHONPATH=apps/solera-api:connectors/easy-pi:connectors/synthetic-pi:flows:simulators/loop1 \
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
npm run eval:loop1 -- --output artifacts/loop1-scoreboard.json
npm run demo:loop1:preflight
npm run demo:loop1:package
POSTGRES_PASSWORD=solera-test docker compose config --quiet
npm run package:extension
```

The browser smoke can use Playwright Chromium or the installed Brave executable;
the same managed-package contract is checked for Chrome and Edge. Final
branded-browser acceptance runs through enterprise extension management.

Operational and demo procedures:

- [Demo runbook](docs/runbooks/DEMO.md)
- [LOOP-1 Demo Playbook](docs/runbooks/LOOP1_DEMO_PLAYBOOK.md)
- [Agent Gallery Phase 1](docs/architecture/SOLERA_AGENT_GALLERY_PHASE1.md)
- [FASTEN-1 Concept Experience](docs/architecture/FASTEN1_CONCEPT_EXPERIENCE.md)
- [HEAT-1 Concept Experience](docs/architecture/HEAT1_CONCEPT_EXPERIENCE.md)
- [LOOP-1 Investor Demo Rehearsal](docs/runbooks/LOOP1_INVESTOR_DEMO_REHEARSAL.md)
- [LOOP-1 Handoff and Test](docs/runbooks/LOOP1_HANDOFF_AND_TEST.md)
- [LOOP-1 Customer Demo — 10 minutes](docs/runbooks/LOOP1_CUSTOMER_DEMO_10MIN.md)
- [LOOP-1 Demo Mechanics and Product Evolution](docs/architecture/LOOP1_DEMO_MECHANICS_AND_PRODUCT_EVOLUTION.md)
- [LOOP-1 Demo SOP](docs/runbooks/LOOP1_DEMO_SOP.md)
- [LOOP-1 Data Hub and Agent Flow](docs/architecture/LOOP1_DATA_HUB_AGENT_FLOW.md)
- [LOOP-1 Value Validation](docs/value/LOOP1_VALUE_VALIDATION.md)
- [Customer Use Case Catalog](docs/pitch/SOLERA_CUSTOMER_USE_CASES.md)
- [Product, Presales, and Investor Pitch](docs/pitch/SOLERA_PRODUCT_PITCH.md)
- [Pilot runbook](docs/runbooks/PILOT.md)
- [Deployment](docs/runbooks/DEPLOYMENT.md)
- [v0.1 Completion Checklist](docs/runbooks/V0_1_COMPLETION_CHECKLIST.md)
- [Data retention](docs/security/DATA_RETENTION.md)

Post-v0.1 product direction:

- [Skill System Contract](docs/contracts/SOLERA_SKILL_SYSTEM_V0_2.md)
- [Skill Routing ADR](docs/adr/0004-composable-skills-hybrid-routing.md)
- [Solera vs GPT-style Sidecar](docs/architecture/SOLERA_VS_GPT_SIDECAR.md)
- [v0.2 Skill Backlog](docs/backlog/V0_2_SKILL_BACKLOG.md)

## Development status

The v0.1 vertical slice and LOOP-1 synthetic Agent core are implemented and
locally verified. LOOP-1 passed 40/40 golden cases and Brave MV3 E2E. Live PI
Vision, enterprise OIDC/model policy, managed Chrome/Edge distribution, and
multi-user Pilot metrics remain environment acceptance work. See
[PROJECT_STATE.md](docs/PROJECT_STATE.md) for exact evidence and limitations.
