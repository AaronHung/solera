# Solera Project State

Last updated: 2026-07-18  
Contract: `docs/contracts/SOLERA_V0_1.md` v0.1.0  
Current gate: Local implementation complete — external Pilot acceptance pending

## Verified

- Contract, architecture, ADRs, threat model, backlog, golden questions,
  retention policy, deployment, demo, and Pilot runbooks are versionable.
- Easy PI Swagger and live `PI-PRD` were inspected. The upstream API exposes
  writes, while Solera implements only explicit GET methods.
- Live integrated smoke on 2026-07-18: Easy PI healthy, CDT158 current and 14
  one-hour points retrieved, coverage 1.0, connector plus analytics 896.84 ms.
  This is one sample, not a p95 claim.
- JSON Schema source contracts and static CSP-safe browser validators exist for
  PageContext, ToolManifest, Evidence, AnalysisResult, ViewSpec, AuditEvent,
  ConnectorCapabilities, and Agent events.
- Sidecar captures bounded/redacted Easy PI, PI Vision, or generic PageContext,
  requires low-confidence asset confirmation, and streams safe Agent events.
- Deterministic summary/comparison/quality/anomaly/downsampling and complete
  Evidence are implemented outside the model.
- Tool Registry contains zero write/control tools; policy enforces tenant,
  role, asset, domain, range, points, rate, and kill switches.
- Canvas has six trusted Widgets, tenant save/open, static ViewSpec validation,
  and tested Shadow DOM mount/unmount with host body unchanged.
- OIDC RS256, development-token production guard, audit/trace replay, model
  gateway, latency/cost counters, knowledge citations, feedback/eval, nightly
  aggregate, and retention Flow seams are implemented.
- Final local verification: 25 Python tests, 10 TypeScript tests, two Playwright
  browser/package tests, TypeScript builds/typechecks, Ruff, and IDE lints pass.
- Chromium MV3 runtime starts the service worker and renders Sidecar under the
  strict CSP. Chrome/Edge managed-package contract passes.
- Managed zip generated as `solera-sidecar-0.1.0.zip`, SHA-256
  `041fb42dc1278cd7371dda5abccd41ad53b9d86fd54d69710a703c87973b0333`;
  JavaScript SBOM and Python dependency inventory were generated locally.
- Docker Compose configuration validates.

## In progress

- No local implementation backlog item is in progress.
- External environment onboarding and the 5–10 user Pilot remain product
  acceptance work, not code that can be truthfully simulated locally.

## Not yet verified

- Authenticated production Easy PI limits, bad/questionable value shapes,
  certificate/credential rotation, and private-network Bridge.
- Live authenticated PI Vision DOM/context against the target display.
- Branded Microsoft Edge runtime; Edge was not installed on this machine.
- Branded Chrome/Edge managed distribution and update policy.
- Customer OIDC claims, model provider/region/ZDR/price, secret provider, and
  retention/legal approval.
- Container image runtime: Compose parses, but the local Docker daemon was not
  running, so the image build was not executed.
- First-text and full-analysis p95 under Pilot load; one live request is not a
  percentile.
- Context resolution at least 95% and 5–10 user adoption/outcome metrics.

## Current decisions

- ADR-0001: cloud control plane with a future outbound-only Bridge seam.
- ADR-0002: read-only tools, Evidence-first answers, trusted rendering.
- ADR-0003: modular monolith with one Agent orchestrator.

## Blockers

Local code is not blocked. External acceptance requires PI Vision access,
enterprise OIDC/model policy, managed Chrome/Edge environments, a running
container platform, and named Pilot users.

## Next safe step

Run Pilot onboarding from `docs/runbooks/PILOT.md`: configure customer OIDC and
secrets, install the managed extension in branded Chrome and Edge, validate the
live PI Vision adapter, run the golden set and load test, then begin the 5–10
user instrumented Pilot. Do not start v0.2 Bridge/Portal/Scene work before these
v0.1 acceptance results are recorded.

## Session handoff checklist

1. Read `README.md`, the product contract, ADRs, and this file.
2. Run the repository verification command documented in `README.md`.
3. Inspect `git status`; do not discard unrelated work.
4. Continue the first incomplete backlog item whose dependencies are verified.
5. Update this file with evidence, not intention, before handing off.
