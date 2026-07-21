# Solera LOOP-1 Synthetic Industrial Agent Demo SOP

## Purpose and boundary

LOOP-1 is a deterministic synthetic reactor-cooling scenario. It demonstrates
Solera Data Hub, Pulse, Thread, Flow, bounded Skills, Evidence, Experience,
replay, and human-approved drafts without requiring PI.

Always state:

- all LOOP-1 data, documents, cases, alarms, and KPI assumptions are synthetic
- it is not a customer plant Digital Twin or a safety system
- Solera does not write to DCS, PLC, SIS, SCADA, PI, MES, CMMS, or ERP
- an approved Action Rail item remains a draft; no external work order is issued

For a customer-facing session, start with:

- `LOOP1_HANDOFF_AND_TEST.md` for installation and acceptance
- `LOOP1_CUSTOMER_DEMO_10MIN.md` for the timed talk track
- `LOOP1_DATA_HUB_AGENT_FLOW.md` for architecture and data operations
- `LOOP1_VALUE_VALIDATION.md` for evidence, KPIs, and follow-up

## 1. Local startup

From the repository root:

```bash
cd /Users/aaron/xk8/00_solera
uv sync --frozen
npm install
npm run dev:api
```

The API startup seeds 10 assets, 60 Tags, 8 synthetic documents, 10 historical
cases, identity edges, and an initial replay tick. It does not contact PI.

In a second terminal:

```bash
cd /Users/aaron/xk8/00_solera
npm run build
```

Reload `apps/sidecar-extension/dist` from the browser extension page, then
reload the approved host tab once.

For read-only viewing, the default local token is sufficient:

```text
dev:tenant-demo:demo-user:viewer
```

To demonstrate a draft approval request, use a non-production demo role:

```text
dev:tenant-demo:demo-engineer:engineer
```

To decide the request, use an operator, supervisor, or admin role. These tokens
are local development identities, not production authentication.

## 2. Health checks

```bash
curl http://localhost:8000/health
curl http://localhost:8000/ready
curl \
  -H "Authorization: Bearer dev:tenant-demo:demo-user:viewer" \
  http://localhost:8000/v1/loop1/snapshot
```

Expected:

- `synthetic: true`
- `run.state: normal`
- `pulse.status: healthy`
- `pulse.details.clockMode: synthetic-replay`
- all current values have explicit quality

Or run the automated checks:

```bash
npm run demo:loop1:preflight
npm run demo:loop1:normal
```

## 3. Open LOOP-1 Experience

1. Open an approved Easy PI, PI Vision, or SCADA host page.
2. Open Solera Sidecar.
3. Choose **Canvas**.
4. Under **LOOP-1 Agent Lab**, choose **Open LOOP-1 Experience**.
5. Confirm the top banner says
   `SYNTHETIC · READ-ONLY · NOT A SAFETY SYSTEM`.

The full-screen workspace uses Shadow DOM. Closing it removes the Solera root
and leaves the host page unchanged.

## 4. Recommended eight-minute demo

### A. Normal state

On **Unit**:

- show FV-101, R-101, E-101, V-101, K-101, and T-101
- explain that all telemetry comes from the backend scenario clock
- point out Pulse freshness, quality, replay tick, and simulation time
- explain that the browser is a renderer, not a second simulation truth

### B. Fault onset

Choose **Jump to fault**. This resets and replays to tick 120, where cooling
valve stiction begins.

Choose `10x`, then **Start replay**, or use **Run Hero scenario** to replay
directly to tick 220.

Expected causal order:

1. controller command increases
2. independent valve position does not follow
3. cooling-water flow decreases
4. reactor temperature and pressure move after a delay
5. separator/compressor/product-quality proxies move later
6. 18 dependent alarms appear

### C. Alarm timeline

Open **Timeline**:

- show raw alarms in event-time order
- show critical alarms remain individually visible
- show the alarms are grouped by a recorded synthetic cause event
- do not describe clustering as alarm suppression

### D. Investigation

Choose **Investigate**, then open **Investigation**:

- Top-1 should be FV-101 valve stiction
- position-feedback bias and cooling-header disturbance remain alternatives
- confidence is bounded and not a safety determination
- the summary must describe command → position → flow → thermal order

If a required Tag is missing, questionable, or has fewer than 20 observations,
the Agent returns `safe-decline` and creates no Action draft.

### E. Evidence and Thread

Open **Evidence**:

- verify signal and calculation Evidence IDs
- show SOP-R101-04 Revision 4
- show the P&ID, MOC, maintenance history, shift log, and similar cases
- explain that each document/case resolves to stable Asset and Tag identity
- show Skill trace for Alarm Triage, Process Context, Procedure & Safety,
  Case Retrieval, Asset Integrity, and Shift Handover

### F. Action Rail

Choose **Request approval** with an engineer/operator demo token.

The resulting record:

- is tenant-scoped and audited
- contains Evidence references
- remains `draft-only`
- does not issue, dispatch, isolate, notify, or control anything

Approval does not convert the draft into an external work order in this release.

## 5. Replay controls

- **Start/Pause** controls automatic synthetic ticks.
- **1x/5x/10x** means simulation ticks advanced per wall-clock second.
- **Jump to fault** resets and replays to tick 120.
- **Run Hero scenario** resets and replays to tick 220.
- **Reset** removes persisted observations/alarms for the current synthetic run
  and returns to tick 0.
- Escape or Close removes only the browser overlay; backend replay state remains.

There is no need to clear data after five or ten minutes. The bounded equations
enter recovery after tick 360 and converge toward the normal envelope by about
tick 440. Reset when the audience needs the scripted sequence from the start.

Restart the API only when:

- Python code or `.env` changed
- the process stopped
- `/ready` fails
- database schema changed during development

Reload the extension only when its build changed. Reload the host tab once after
reloading the extension so the new content script exists in that tab.

## 6. Offline evaluation

Run the 40-case golden suite:

```bash
npm run eval:loop1 -- --output artifacts/loop1-scoreboard.json
```

The `artifacts` directory must already exist. The suite checks:

- deterministic replay
- root-cause truth in Top-3
- safe decline under missing/questionable data
- SOP revision retrieval
- Evidence completeness
- unsupported control/safety claims

The scoreboard is synthetic capability evidence, not a customer business KPI.

## 7. Browser E2E

```bash
npm run test:browser
```

The browser test verifies:

- Sidecar exposes the LOOP-1 launcher
- the Shadow DOM overlay mounts on an approved host
- Unit, Timeline, Investigation, and Evidence navigation renders
- the synthetic/read-only disclosure is visible
- Escape removes the overlay without changing host content

## 8. Handoff package

Generate the latest scorecard, Sidecar build, source handoff, and checksums:

```bash
npm run demo:loop1:package
```

Outputs:

```text
artifacts/solera-loop1-demo-handoff-0.1.0.zip
artifacts/solera-loop1-demo-handoff-0.1.0.zip.sha256
```

The package excludes `.env`, `.git`, `node_modules`, `.venv`, local databases,
and browser test output.

## 9. Troubleshooting

### `LOOP1_DISABLED`

Set `SOLERA_LOOP1_ENABLED=true` and restart the API.

### `Receiving end does not exist`

Reload the extension, then reload the current host tab once. The content script
from the rebuilt extension must be injected into the tab.

### `AUTH_REQUIRED` or `ROLE_DENIED`

Confirm Sidecar API settings and token. A viewer can inspect the scenario but
cannot request or decide an approval.

### Pulse is degraded

Open Pulse and check quality counts. Missing or questionable values are an
expected golden test condition. Reset or replay the Hero scenario to restore
the canonical run.

### Experience is blank

Check `/ready`, `/v1/loop1/snapshot`, browser extension errors, and the approved
domain. Rebuild and reload the extension if TypeScript assets changed.

## 10. Permitted claims

- deterministic and replayable synthetic industrial scenario
- shared backend truth for telemetry, Agent, Evidence, and Experience
- bounded read-only Skills and safe decline
- traceable SOP/case/asset/Tag linkage
- explicit KPI formulas and assumptions

## 11. Forbidden claims

- validated customer-plant physics
- production Digital Twin
- safety-certified diagnosis or operating instruction
- autonomous control
- proven customer downtime, yield, energy, maintenance, or safety benefit
- production PdM/RUL accuracy
