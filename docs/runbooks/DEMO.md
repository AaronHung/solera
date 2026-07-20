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

## Solera Experience Demo — five-minute concept flow

The Experience Demo is implemented only on `experiment/canvas-experience`.
It is a trusted visualization concept, not production Evidence and not a
replacement for the v0.1 Canvas.

1. Open an approved Easy PI, PI Vision, or SCADA page and open the Sidecar.
2. Choose **Canvas** in the Sidecar navigation.
3. In **Experience Demo**, select a starting role:
   Executive, Shift Supervisor, Operator, Reliability Engineer, or IT / Data.
4. Choose **Open full-screen Experience**. The Experience appears in an
   isolated full-viewport Shadow DOM overlay on the current host page.
5. On **Home**, explain that role selection changes KPI priority and alert
   density. Point out `LIVE SIMULATION`: one-second process telemetry,
   five-second trend snapshots, and fifteen-second health indicators.
   Previous trend snapshots remain dashed while the current snapshot is solid.
6. Open **Sites**, choose **Clark Mountain Solar Plant**, then open
   **Solar Block 1** to move from portfolio to site operations and asset
   reliability context.
7. Open **Map** and **Sites**. Site production today accumulates gradually;
   availability and health move on the slower operating cadence and may show
   explicit amber/critical states when a bounded threshold is crossed.
8. Open **Revenue**, **Collaboration**, **HSE**, and **Activities**. Each page
   has its own operational panels: value mix, shift handover, safety controls,
   and connector/activity health.
9. Use **Pause** and **Resume** to demonstrate controlled deterministic
   updates. No host or historian value is changed.
10. Open **Create workspace**. Click or drag a KPI, Gauge, Line/Column chart,
   Status, Asset, or Process Flow component into the grid. Use **Preview** and
   **Save demo** to show the future composition workflow.
11. Navigate briefly through Forecasting to show the remaining concept-page
    shell.
12. Press Escape or use the upper-right Close button. Verify that the host
    page is unchanged and `#solera-experience-root` no longer exists.

Recommended demo viewports are 1440×900 and 1920×1080; 1024px is the minimum
supported width. The Brave E2E test writes visual-review images to the ignored
local directory `artifacts/experience-demo/`.

### Experience Demo data and behavior boundaries

- Every number, alert, Site, Asset, trend, and forecast is deterministic mock
  data. It must never be represented as live customer or PI data.
- Fast telemetry updates every second, trend snapshots every five seconds, and
  health/availability every fifteen seconds within bounded declared ranges.
  Pause, resume, and reset affect only the in-memory demo simulator.
- Selected telemetry crosses deterministic warning/critical thresholds so the
  UI demonstrates amber/red states with explicit status text, not color alone.
- **Save demo** is session-only feedback. It does not persist a workspace,
  modify the host page, write to PI/SCADA/MES/ERP, or create production
  Evidence.
- The Create palette uses only bundle-owned trusted React/CSS/SVG components.
  Messages accept an allowlisted role preset, never arbitrary HTML, JavaScript,
  or executable configuration.
- Canvas and Experience are mutually exclusive overlays. The original v0.1
  Canvas save/open contract remains unchanged.

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
