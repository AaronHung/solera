# Solera v0.1 Backlog

Each item references the product contract. “Done” requires tests and an update
to `docs/PROJECT_STATE.md`.

## Gate A — Contract and source

- **SOL-BL-001** [FR-001..013] Establish contract, ADRs, architecture, threat
  model, project state, and persistent Cursor rule.
- **SOL-BL-002** [FR-004] Record Easy PI endpoint/auth/timezone/limit behavior
  and create redacted fixtures.
- **SOL-BL-003** [FR-001, FR-002] Prove Easy PI and PI Vision PageContext on
  supported page fixtures.
- **SOL-BL-004** [FR-001, FR-003, FR-006, FR-009] Freeze JSON Schemas and
  cross-language contract fixtures.
- **SOL-BL-005** [SR-001..008] Automate the read-only threat-model invariants.

## Gate B — Walking skeleton

- **SOL-BL-010** [FR-001, FR-011] Build MV3 side panel, service worker, content
  message bus, and domain policy.
- **SOL-BL-011** [FR-004] Implement the provider-neutral connector protocol and
  Easy PI read-only connector.
- **SOL-BL-012** [FR-003, FR-007, FR-008] Implement identity context, policy,
  model gateway, and bounded single-Agent orchestrator.
- **SOL-BL-013** [FR-011] Stream Agent lifecycle events and safe errors.
- **SOL-BL-014** [FR-006] Display Evidence with source, query, time, method,
  version, and quality.

## Gate C — Trusted analysis

- **SOL-BL-020** [FR-005] Implement deterministic normalize, summarize,
  compare, rate-of-change, coverage, and basic anomaly functions.
- **SOL-BL-021** [FR-002] Implement candidate asset resolution and confirmation.
- **SOL-BL-022** [FR-003, SR-002, SR-007] Enforce tool scope and model data
  egress policy.
- **SOL-BL-023** [FR-010, SR-006] Persist tenant-scoped trace and audit replay
  metadata.
- **SOL-BL-024** [UJ-001..003] Run golden numerical, context, failure, and
  injection evaluations.

## Gate D — Canvas

- **SOL-BL-030** [FR-009] Validate ViewSpec using JSON Schema and tenant policy.
- **SOL-BL-031** [FR-009] Build Timeseries, KPI, Status, Table, Asset, and
  Evidence Widgets.
- **SOL-BL-032** [FR-010] Save/open Canvas under tenant ownership.
- **SOL-BL-033** [UJ-004, SR-005] Mount/unmount one isolated overlay root and
  prove complete cleanup.

## Platform and Flow slice

- **SOL-BL-040** [FR-003, FR-010] Implement OIDC-ready auth boundary, RBAC, and
  tenant isolation.
- **SOL-BL-041** [FR-013] Implement tenant/domain/adapter/model/capability kill
  switches.
- **SOL-BL-042** [FR-012] Run idempotent nightly aggregate jobs.
- **SOL-BL-043** [FR-012] Ingest a small document set and return citations.
- **SOL-BL-044** [FR-012] Convert traces and explicit feedback into eval cases.

## Pilot hardening

- **SOL-BL-050** Verify Chrome/Edge supported workflow matrix.
- **SOL-BL-051** Verify timeout, limit, empty, bad-value, cancellation, and
  reconnect behavior.
- **SOL-BL-052** Measure latency/cost and expose component timing.
- **SOL-BL-053** Produce managed extension artifacts, SBOM, environment
  configuration, and secret/retention guidance.
- **SOL-BL-054** Complete demo and Pilot runbooks.
- **SOL-BL-055** Run final contract, security, integration, and browser tests.
