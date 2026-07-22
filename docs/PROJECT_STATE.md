# Solera Project State

Last updated: 2026-07-22
Contracts: `docs/contracts/SOLERA_V0_1.md` v0.1.0 and
`docs/contracts/SOLERA_LOOP1_V0_1.md` v0.1.0-preview
Current gate: v0.1, Experience Demo, and the LOOP-1 synthetic Agent core are
implemented on `main` and tagged `v0.1.0-loop1-stable.1`; external Pilot and
optional productization acceptance remain pending. Phase 1 Agent Gallery markup
is on `feature/agent-gallery-concept-demos`; the FASTEN-1 multi-screen extension
is on `feature/fasten1-concept-experience`; HEAT-1 is isolated on
`feature/heat1-concept-experience` pending visual review.

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
- The Solera Experience Demo on `main` adds a separate trusted
  full-viewport Shadow DOM surface with role-oriented Portfolio, Sites, Site
  Operations, Asset Detail, concept pages, and a Create workspace prototype.
  It uses an internal typed spec and never changes the v0.1 ViewSpec schema.
- Experience mock Site/Asset hierarchy, trends, alerts, financial/HSE
  indicators, and multi-rate updates are deterministic and visibly labeled
  `LIVE SIMULATION`: one-second process telemetry, five-second trend snapshots,
  and fifteen-second health/availability. Previous trends remain dashed,
  current trends redraw solid, and bounded amber/red threshold states include
  explicit status text. Pause/resume/reset and unmount timer cleanup are tested.
- Map and Sites now show bounded live operational movement: production-today
  accumulates gradually while availability, health, and site status move on
  the slow cadence. Revenue, Collaboration, HSE, and Activities each have
  distinct role-oriented panels instead of a shared static concept screen.
- Sidecar messages accept only an allowlisted Experience role. Canvas and
  Experience are mutually exclusive singletons; both preserve the host body
  and reject arbitrary HTML or executable configuration.
- OIDC RS256, development-token production guard, audit/trace replay, model
  gateway, latency/cost counters, knowledge citations, feedback/eval, nightly
  aggregate, and retention Flow seams are implemented.
- LOOP-1 adds an independent industrial JSON Schema plus TypeScript and Python
  contracts for Asset, Tag, Observation, Alarm, Scenario, Case, and Approval.
- The deterministic backend Scenario Engine provides 10 linked Assets, 60 Tags,
  valve-stiction fault injection, causal delay, 18 alarms, replay, recovery,
  explicit data-quality faults, invariant tests, and a read-only Synthetic PI
  Connector.
- Data Hub persists scenario manifests, telemetry, alarms, identity, Cases,
  approvals, and typed Thread edges. Pulse reports replay-clock freshness and
  quality. Idempotent Flow seeds 8 documents and 10 cases and can reset/replay
  a run without PI.
- Six bounded LOOP-1 Skills implement Alarm Triage, Process Context, Procedure
  & Safety, Case Retrieval, Asset Integrity, and Shift Handover. Numerical
  claims use deterministic Evidence; missing/questionable data safe-declines.
  Action Rail approvals remain audited drafts and never execute an external
  write or plant-control action.
- LOOP-1 Experience consumes the backend snapshot and investigation contracts
  for Unit, Timeline, Investigation, Evidence, replay controls, Pulse, and
  Action Rail. The existing browser-local portfolio Experience remains a
  separate concept.
- LOOP-1 defaults to Traditional Chinese with an English toggle, keeps original
  engineering IDs, and includes three bounded replay cases. A real NDJSON stream
  exposes context, deterministic plan, tool boundaries, Evidence, hypotheses,
  safety boundary, and completion events; traces are persisted for replay.
  The objective input is audit context, not a free-form scenario generator,
  and the UI does not expose private model chain-of-thought.
- Phase 1 Agent Gallery adds one shared Solera Agent Platform entry point.
  LOOP-1 routes to the existing live backend Experience. LOOP-2 afterburn risk,
  LOOP-3 catalyst activity/run-length, and LOOP-4 water-quality Soft Sensor are
  deterministic interactive frontend concepts with distinct charts, structured
  trace, result, Evidence, and draft-only next step. Every concept is labeled
  `SYNTHETIC CONCEPT · NOT FOR OPERATIONS`; it does not call a domain backend or
  claim a validated production model.
- FASTEN-1 adds a separate Precision Manufacturing Gallery and a six-screen
  `RFQ-to-First-Good-Part` concept: RFQ Inbox, Drawing Intelligence, Similar
  Product Cases, Process/Machine/Tooling, Trial Run, and First Article Evidence.
  The deterministic flow preserves locked stages, three Human Gates, drawing
  source attribution, Product Thread, and `L1–L2 ONLY · NO PLC WRITE`
  disclosure. It is not a production CAD parser, validated quality model, or
  factory deployment.
- HEAT-1 adds a distinct copper six-screen `Batch-to-Release Quality` concept:
  Batch Passport, Load/Recipe, Furnace Journey, tray-level Quality Soft Sensor,
  Deviation Investigation, and Release Evidence. The deterministic result
  reconciles official synthetic lab data into 216 release candidates and a
  focused 24-piece hold. It does not claim a validated metallurgy model,
  replace official inspection, write a furnace recipe, or authorize release.
- The versioned golden dataset contains 40 cases. The full offline run passed
  40/40: replay determinism 1.0, Top-3 truth 1.0, safe-decline accuracy 1.0,
  document retrieval 1.0, Evidence completeness 1.0, unsupported-claim rate
  0.0. The ignored local output is `artifacts/loop1-scoreboard.json`.
- The customer-demo handoff includes a timed 10-minute talk track, Data Hub and
  Agent Flow operations, value-validation method, acceptance checklist, live
  normal/Hero/reset preflight commands, and a secret-excluding source/extension
  package with SHA-256 checksum.
- Final local verification: 51 Python tests and 35 TypeScript tests pass;
  TypeScript builds/typechecks and Ruff pass. The Brave MV3 E2E and
  managed-package contract both pass, including
  Experience launch, role/page/Create interactions, Escape cleanup, host
  restoration, LOOP-1 Unit/Timeline/Investigation navigation, synthetic
  disclosure, Chemical／Precision Gallery switching, all six FASTEN-1 and
  HEAT-1 screens, steel-blue／copper color identity, HEAT Soft Sensor and lab
  reconciliation,
  Agent Gallery → LOOP-2 result → LOOP-1 live routing, 1024px
  horizontal-overflow assertion, and retained local screenshots under ignored
  `artifacts/`. The latest browser flow passed with Playwright Chromium and the
  MV3 package remains compatible with local Brave.
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

- v0.1 and LOOP-1 local implementation are complete. Approved-site SCADA
  support is configured locally, while live SCADA, PI Vision, deployment,
  visual stakeholder review, and Pilot acceptance evidence are still being
  closed.
- The zh-TW Case Console/live trace feature branch has passed local unit,
  integration, build, typecheck, Ruff, and Brave MV3 E2E checks; visual
  stakeholder acceptance and merge to `main` remain pending.
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
- LOOP-1 implements a bounded domain package with six fixed Skills, but not the
  full customer-authorable v0.2 Skill Registry, marketplace, or generic Hybrid
  Router. The portfolio Experience remains browser-local mock data; LOOP-1 is
  the first backend-bound Experience and Data Hub/Flow vertical slice.

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
- PI OMF mirror permissions, isolated namespace, retention, cleanup, duplicate
  replay, and rollback.
- Domain-reviewed DWSIM/OPC UA model and VVUQ, multimodal privacy/confidence
  evaluation, and external NATS/Redpanda load/durability operations. All are
  deferred and fail-closed by ADR-0006.

## Current decisions

- ADR-0001: cloud control plane with a future outbound-only Bridge seam.
- ADR-0002: read-only tools, Evidence-first answers, trusted rendering.
- ADR-0003: modular monolith with one Agent orchestrator.
- ADR-0004: proposed post-v0.1 composable Skills with hybrid routing.
- ADR-0005: Data Hub and server-side Scenario Engine are LOOP-1 truth; PI is an
  optional mirror and Experience is a renderer.
- ADR-0006: optional PI, DWSIM/OPC UA, multimodal, and external event-bus
  productization is disabled until explicit evidence Gates pass.

## Blockers

Local code is not blocked. External acceptance requires PI Vision access,
enterprise OIDC/model policy, managed Chrome/Edge environments, a running
container platform, and named Pilot users.

## Next safe step

Run `docs/runbooks/LOOP1_HANDOFF_AND_TEST.md`, rehearse the timed customer flow
in `docs/runbooks/LOOP1_CUSTOMER_DEMO_10MIN.md`, and record customer/stakeholder
feedback against the 40-case baseline. In parallel, close the v0.1 Pilot
checklist: verify live SCADA and PI Vision, configure customer OIDC/secrets,
install managed Chrome/Edge, and measure load/p95. Enable no optional PI,
DWSIM/OPC UA, multimodal, or external-broker capability until the machine Gate
report and ADR-0006 evidence requirements pass.

## Session handoff checklist

1. Read `README.md`, the product contract, ADRs, and this file.
2. Run the repository verification command documented in `README.md`.
3. Inspect `git status`; do not discard unrelated work.
4. Continue the first incomplete backlog item whose dependencies are verified.
5. Update this file with evidence, not intention, before handing off.
