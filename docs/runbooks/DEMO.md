# Solera v0.1 Demo Runbook

## Preconditions

- Easy PI `PI-PRD` reports connected.
- `CDT158` and `CDT159` have fresh values; record SINUSOID freshness separately.
- The API and extension were built from the same contract version.
- The extension is loaded only on the approved Easy PI and PI Vision hosts.
- A development bearer token is used only in a non-production environment.

## Start locally

```bash
cp .env.example .env
uv sync --frozen
npm install
PYTHONPATH=apps/solera-api:connectors/easy-pi:flows \
  uv run uvicorn solera_api.main:app --reload
```

Build the extension:

```bash
npm run build
```

Load `apps/sidecar-extension/dist` as an unpacked extension in Chrome or Edge.
Open Sidecar settings and enter:

- API URL: `http://localhost:8000`
- Bearer token: `dev:tenant-demo:demo-engineer:engineer`
- Tenant: `tenant-demo`

## Scripted vertical slice

1. Open Easy PI Swagger and select `CDT158`.
2. Open Solera; verify Context says Easy PI and never displays URL query secrets.
3. Ask: `比較 CDT158 與 CDT159`.
4. Open Evidence and verify Tag, range, timezone, query ID, calculation version,
   valid/sample count, and coverage.
5. Choose Open Canvas; verify Trend, KPI, Status, Table, Asset, and Evidence.
6. Press Escape. Verify the host page remains functional and no
   `#solera-canvas-root` remains.
7. Save Canvas, reopen it from the Canvas tab, and verify tenant ownership.
8. Open the supported PI Vision Tank Details display.
9. Refresh Context, confirm the candidate asset if confidence is below policy,
   and repeat the comparison. Explain that PI Vision is context while Easy PI
   is numerical authority.
10. Ask `CDT158 failure manual` after ingesting the Pilot document; show the
    separate document citation.

## Failure demonstrations

- Remove the bearer token: API call does not run.
- Open an unapproved domain: context/tool policy fails closed.
- Enable `capability/query_timeseries` kill switch: Agent returns a safe denial
  before the connector executes.
- Query stale SINUSOID: freshness/quality warning remains visible.
- Stop the API during a request: Sidecar shows a bounded error and preserves the
  host page.

## Claims that are allowed

- Read-only analysis and visual augmentation.
- Reproducible deterministic time-series summaries.
- Context-aware navigation from approved industrial browser systems.
- Evidence-backed Canvas and document citations.

## Claims that are forbidden

- “Works on every website.”
- “Cannot affect the page.”
- Predictive-maintenance/HPI accuracy from synthetic PI Tags.
- Production OT security based only on the public test endpoint.
- Scene/3D, autonomous multi-Agent, or write/control capability.
