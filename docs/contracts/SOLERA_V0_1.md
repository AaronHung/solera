# Solera v0.1 Pilot Product Contract

Status: **Accepted for implementation**  
Contract version: **0.1.0**  
Working name: **Project Solera**  
Target: **12-week Pilot vertical slice**

## 1. Product claim

Solera augments approved browser-based industrial systems with a secure,
read-only Agent layer. It understands the confirmed page and asset context,
queries authoritative industrial APIs, performs deterministic analysis, and
turns evidence-backed answers into temporary or saved Canvas views.

The v0.1 claim is deliberately narrower than “works on any website”:

> Augment approved browser-based industrial systems through secure, read-only
> adapters.

## 2. Primary user and outcome

The primary persona is an equipment or process engineer.

The Pilot succeeds when the user can open Solera beside Easy PI or PI Vision,
confirm the current asset/time context, ask a time-series question, inspect
reproducible Evidence, and add the result to Canvas without changing the host
system's business data or state.

## 3. Product boundaries

### Must have

- Chrome and Edge Manifest V3 Sidecar using the native side panel.
- Tenant-approved domain allowlist and explicit context capture.
- Easy PI read-only connector for current, recorded, and aggregated data.
- Easy PI and PI Vision Site Adapters; PI Vision is context, not numerical truth.
- Streaming Agent responses backed by a single controlled orchestrator.
- Deterministic current/min/max/average/std-dev/rate-of-change/comparison.
- Explicit handling of timezone, bad values, gaps, empty data, and limits.
- Evidence attached to every industrial number.
- Six trusted Canvas Widgets: Timeseries, KPI, Status, Table, Asset, Evidence.
- Chat → validated ViewSpec → Canvas → save/open.
- OIDC-ready identity boundary, tenant/RBAC enforcement, audit, trace, kill switch.
- Golden evaluations, policy tests, and overlay mount/unmount end-to-end tests.

### Should have after all release gates pass

- Pins and saved questions.
- A small asset/Tag catalog.
- Idempotent nightly aggregates.
- Limited document retrieval with citations.
- Answer feedback captured into an evaluation dataset.
- Latency, usage, and model cost summaries.

### Explicitly not in v0.1

- Any PLC, SCADA, MES, historian, or work-order write/control operation.
- SCADA/MES-specific adapters beyond generic L0 page context.
- Arbitrary model-generated HTML, JavaScript, CSS handlers, or remote code.
- PdM/HPI effectiveness claims based on CDT158, CDT159, or SINUSOID.
- A complete Knowledge Graph, autonomous multi-Agent system, or Agent society.
- Scene, 3D rendering, or a full CONNECT-style Portal.
- A production on-prem, customer-VPC, or air-gapped distribution.
- Support for every browser or every website.

## 4. Required user journeys

### SOL-V01-UJ-001 — Compare two PI series

From an approved Easy PI or PI Vision page, compare CDT158 and CDT159 over a
confirmed time range. Return differences, min/max/average/std-dev and coverage.
Every number must originate from the versioned analytics library.

### SOL-V01-UJ-002 — Explain one PI trend

Show SINUSOID over the last 24 hours with source, timezone, sampling, data
quality, min/max/average, and a chart. Empty, bad-value, timeout, and
downsampling behavior must be understandable.

### SOL-V01-UJ-003 — Resolve page context

On the supported PI Vision page, identify candidate view, asset, and time
context. Low-confidence candidates require user confirmation. Rendered pixels
must never be treated as authoritative numerical values.

### SOL-V01-UJ-004 — Create and remove Canvas

“Add to Canvas” produces at least four validated Widgets and Evidence. Closing
Solera removes its root, styles, listeners, observers, and timers. The host
business state remains unchanged.

## 5. Functional requirements

- **SOL-V01-FR-001 Context:** produce a versioned `PageContext` from only the
  minimum approved page data.
- **SOL-V01-FR-002 Asset resolution:** resolve candidates with confidence and
  provenance; require confirmation below the tenant policy threshold.
- **SOL-V01-FR-003 Tool policy:** register only read-only tools with tenant,
  role, asset, time-range, point-count, timeout, and data-egress limits.
- **SOL-V01-FR-004 Connector:** expose current/recorded/interpolated/summary
  operations through a provider-neutral connector interface.
- **SOL-V01-FR-005 Analytics:** calculate numerical results outside the model in
  a versioned deterministic library.
- **SOL-V01-FR-006 Evidence:** attach source system, Tag, asset, time range,
  timezone, retrieval mode, aggregation, query ID, calculation version,
  retrieval timestamp, and data quality.
- **SOL-V01-FR-007 Agent:** use one orchestrator to understand context, plan
  tools, validate results, explain findings, and request a ViewSpec.
- **SOL-V01-FR-008 Model gateway:** keep provider credentials server-side and
  preserve model choice, region, retention, and redaction policy seams.
- **SOL-V01-FR-009 Canvas:** accept only schema-valid, policy-valid ViewSpecs
  using trusted Widgets.
- **SOL-V01-FR-010 Persistence:** save Canvas, Evidence references, feedback,
  audit events, and trace metadata under a tenant boundary.
- **SOL-V01-FR-011 Streaming:** return lifecycle events for context, tool
  execution, evidence, text, Canvas, completion, and safe errors.
- **SOL-V01-FR-012 Flow:** run idempotent aggregate, document indexing, and
  trace-to-evaluation jobs with recorded inputs, outputs, and versions.
- **SOL-V01-FR-013 Kill switch:** disable a tenant, domain, adapter, connector,
  model, or capability without redeploying the browser extension.

## 6. Safety requirements

- **SOL-V01-SR-001 Read-only:** the v0.1 Tool Registry contains zero write or
  control tools.
- **SOL-V01-SR-002 Untrusted page:** DOM, screenshot, selection, URL, and page
  text are untrusted inputs and cannot grant capability or change policy.
- **SOL-V01-SR-003 Least privilege:** the extension runs only on approved
  domains and never reads password fields, cookies, local-storage tokens, or
  host request traffic.
- **SOL-V01-SR-004 Credential isolation:** PI and model credentials never enter
  the extension or Canvas.
- **SOL-V01-SR-005 Trusted rendering:** remote/model output cannot execute code;
  all ViewSpecs are schema and policy validated.
- **SOL-V01-SR-006 Reproducibility:** audit records include contract, prompt,
  tool, calculation, connector, model, query, and answer versions.
- **SOL-V01-SR-007 Data minimization:** raw page or time-series data is sent to
  a model only when tenant policy permits it; deterministic summaries are the
  default.
- **SOL-V01-SR-008 Emergency control:** policy denial is fail-closed and a
  remote kill switch takes effect before the next tool execution.

## 7. Release acceptance

- Golden deterministic calculations match fixtures/API baselines exactly.
- 100% of answers containing industrial numbers include complete Evidence.
- Supported-page asset/view resolution is at least 95%; low confidence always
  asks for confirmation.
- The release Tool Registry reports zero write/control capabilities.
- Prompt-injection tests cannot expand tool or data scope.
- Unmount tests find no Solera root, style, listener, observer, or timer leak.
- First streamed text p95 is under 3 seconds in the Pilot environment.
- Normal time-series analysis p95 is under 10 seconds, with latency split by
  connector, analytics, and model.
- Chrome and Edge pass the supported workflow matrix.
- Every Pilot analysis is traceable by query ID and replayable from recorded
  tool inputs or a redacted fixture.

## 8. Delivery gates

1. **Gate A — Contract and source:** one supported page maps to a confirmed Tag
   and an Easy PI query can be reproduced.
2. **Gate B — Walking skeleton:** the same Tag asked from Easy PI and PI Vision
   produces consistent results and Evidence.
3. **Gate C — Trusted analysis:** CDT158/CDT159 golden results and policy tests
   pass.
4. **Gate D — Canvas:** natural language produces a validated Canvas and
   unmount leaves no residue.
5. **Pilot Gate:** identity, tenant isolation, audit replay, failure handling,
   managed builds, runbook, and instrumentation are verified.

## 9. Change control

- Contract statements use stable Requirement IDs.
- Scope or invariant changes require an ADR in `docs/adr/`.
- The ADR must name affected Requirement IDs, migration impact, tests, and
  rollback.
- Accepted changes update this file's version and changelog.
- Backlog ordering may change without a contract revision if requirements and
  gates remain unchanged.

## 10. Changelog

- **0.1.0 — 2026-07-18:** Initial independent v0.1 Pilot contract accepted for
  implementation.
