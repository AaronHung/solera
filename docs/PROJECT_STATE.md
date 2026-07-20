# Solera Project State

Last updated: 2026-07-20
Contract: `docs/contracts/SOLERA_V0_1.md` v0.1.0  
Current gate: v0.1 stable on `main`; Experience Demo implemented on the
`experiment/canvas-experience` branch; external Pilot acceptance pending

## Verified

- Contract, architecture, ADRs, threat model, backlog, golden questions,
  retention policy, deployment, demo, and Pilot runbooks are versionable.
- Easy PI Swagger and live `PI-PRD` were inspected. The upstream API exposes
  writes, while Solera implements only explicit GET methods.
- Live integrated smoke on 2026-07-20: Easy PI healthy, CDT158 current and 17
  one-hour points retrieved, coverage 1.0, summary latency 2840.35 ms. This is
  one sample, not a p95 claim.
- JSON Schema source contracts and static CSP-safe browser validators exist for
  PageContext, ToolManifest, Evidence, AnalysisResult, ViewSpec, AuditEvent,
  ConnectorCapabilities, and Agent events.
- Sidecar captures bounded/redacted Easy PI, PI Vision, or generic PageContext,
  requires low-confidence asset confirmation, and streams safe Agent events.
- The v0.1 local allowlist now includes the first SCADA test origin
  `http://203.146.71.23/*`; this is a static Pilot exception and still needs
  live browser verification.
- Deterministic summary/comparison/quality/anomaly/downsampling and complete
  Evidence are implemented outside the model.
- Page-first PI Vision explanations prioritize the display's industrial purpose
  and treat authentication overlays as secondary freshness caveats; a
  regression test covers this behavior.
- Tool Registry contains zero write/control tools; policy enforces tenant,
  role, asset, domain, range, points, rate, and kill switches.
- Canvas has six trusted Widgets, tenant save/open, static ViewSpec validation,
  and tested Shadow DOM mount/unmount with host body unchanged.
- The experimental Solera Experience Demo adds a separate trusted
  full-viewport Shadow DOM surface with role-oriented Portfolio, Sites, Site
  Operations, Asset Detail, concept pages, and a Create workspace prototype.
  It uses an internal typed spec and never changes the v0.1 ViewSpec schema.
- Experience mock Site/Asset hierarchy, trends, alerts, financial/HSE
  indicators, and multi-rate updates are deterministic and visibly labeled
  `LIVE SIMULATION`: one-second process telemetry, five-second trend snapshots,
  and fifteen-second health/availability. Previous trends remain dashed,
  current trends redraw solid, and bounded amber/red threshold states include
  explicit status text. Pause/resume/reset and unmount timer cleanup are tested.
- Sidecar messages accept only an allowlisted Experience role. Canvas and
  Experience are mutually exclusive singletons; both preserve the host body
  and reject arbitrary HTML or executable configuration.
- OIDC RS256, development-token production guard, audit/trace replay, model
  gateway, latency/cost counters, knowledge citations, feedback/eval, nightly
  aggregate, and retention Flow seams are implemented.
- Final local verification on the Experience branch: 28 Python tests and 19
  TypeScript tests pass; TypeScript builds/typechecks, Ruff, and IDE lints
  pass. The Brave MV3 E2E and managed-package contract both pass, including
  Experience launch, role/page/Create interactions, Escape cleanup, host
  restoration, 1024px horizontal-overflow assertion, and retained local
  screenshots at 1440×900 and 1920×1080 under ignored `artifacts/`.
  The default Playwright Chromium executable is not installed.
- The opt-in Brave longevity check ran for 10.1 real minutes on 2026-07-20.
  The Experience root remained mounted, simulated updates continued, no page
  error occurred, and the test completed navigation, Create, responsive, and
  Escape cleanup assertions.
- The MV3 manifest includes Easy PI, PI Vision, and the first approved SCADA
  test origin. Strict-CSP and managed-package checks remain covered by the
  browser/package test suite.
- Managed zip generated as `solera-sidecar-0.1.0.zip`, SHA-256
  `041fb42dc1278cd7371dda5abccd41ad53b9d86fd54d69710a703c87973b0333`;
  JavaScript SBOM and Python dependency inventory were generated locally.
- Docker Compose configuration validates.

## In progress

- v0.1 completion cleanup is in progress: approved-site SCADA support is
  configured locally, while live SCADA, PI Vision, browser, deployment, and
  Pilot acceptance evidence are still being closed.
- External environment onboarding and the 5–10 user Pilot remain product
  acceptance work, not code that can be truthfully simulated locally.

## Recorded post-v0.1 direction

- A proposed Skill System is documented in
  `docs/contracts/SOLERA_SKILL_SYSTEM_V0_2.md`.
- The product comparison and current quality gaps are recorded in
  `docs/architecture/SOLERA_VS_GPT_SIDECAR.md`.
- The implementation work is decomposed into
  `docs/backlog/V0_2_SKILL_BACKLOG.md`, with stable `SOL-V02-*` IDs.
- The v0.1 completion evidence and remaining Pilot gates are tracked in
  `docs/runbooks/V0_1_COMPLETION_CHECKLIST.md`.
- The v0.2 direction now explicitly includes bounded historical/monthly
  analysis, Site/Asset Management, the Data Flywheel, Data Services, Open
  Wiki, relationship Graph, tenant-filtered Vector retrieval, and
  2.5D/Scene-ready Canvas contracts.
- ADR-0004 proposes composable Skills with Auto, Manual, and Hybrid routing,
  while preserving the v0.1 single-orchestrator and read-only boundaries.
- No v0.2 Skill System runtime implementation has started. The Experience
  branch is an isolated visualization concept using mock data, not the Skill
  Registry or production Data Flywheel. The v0.1 Pilot acceptance gate remains
  the prerequisite for beginning the Skill Registry slice.

## Not yet verified

- Authenticated production Easy PI limits, bad/questionable value shapes,
  certificate/credential rotation, and private-network Bridge.
- Live authenticated PI Vision DOM/context against the target display.
- Live SCADA PageContext capture against `http://203.146.71.23:8080/` and
  recovery after browser restart, extension reload, and SPA navigation.
- Branded Microsoft Edge runtime; Edge was not installed on this machine.
- Branded Chrome/Edge managed distribution and update policy.
- Customer OIDC claims, model provider/region/ZDR/price, secret provider, and
  retention/legal approval.
- Container image runtime: Compose parses, but the local Docker daemon was not
  running, so the image build was not executed.
- First-text and full-analysis p95 under Pilot load; one live request is not a
  percentile.
- Context resolution at least 95% and 5–10 user adoption/outcome metrics.
- Production Experience data binding, workspace persistence, permissions,
  multi-user collaboration, and customer-approved dashboard templates. The
  current Create/Save/Preview flow is intentionally session-only mock behavior.

## Current decisions

- ADR-0001: cloud control plane with a future outbound-only Bridge seam.
- ADR-0002: read-only tools, Evidence-first answers, trusted rendering.
- ADR-0003: modular monolith with one Agent orchestrator.
- ADR-0004: proposed post-v0.1 composable Skills with hybrid routing.

## Blockers

Local code is not blocked. External acceptance requires PI Vision access,
enterprise OIDC/model policy, managed Chrome/Edge environments, a running
container platform, and named Pilot users.

## Next safe step

First close the local completion checklist: verify the approved SCADA page,
install the missing Playwright Chromium executable or record the supported
browser exception, and run the Easy PI, PI Vision, Canvas, and failure-path
checks. Then run Pilot onboarding from `docs/runbooks/PILOT.md`: configure
customer OIDC and secrets, install the managed extension in branded Chrome and
Edge, validate the live PI Vision adapter, run the golden set and load test,
then begin the 5–10 user instrumented Pilot. After acceptance is recorded,
start the first slice in `docs/backlog/V0_2_SKILL_BACKLOG.md`:
SkillManifest → Registry → Hybrid selection → Page Understanding → PI Vision
Industrial Analysis → Tank Capacity → Historical Analysis → Data Flywheel
fixture → Asset graph. Do not start Bridge/Portal/Scene runtime work before
these v0.1 acceptance results are recorded.

## Session handoff checklist

1. Read `README.md`, the product contract, ADRs, and this file.
2. Run the repository verification command documented in `README.md`.
3. Inspect `git status`; do not discard unrelated work.
4. Continue the first incomplete backlog item whose dependencies are verified.
5. Update this file with evidence, not intention, before handing off.
