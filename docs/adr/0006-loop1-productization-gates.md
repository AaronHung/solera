# ADR-0006: LOOP-1 Optional Productization Gates

Status: **Accepted**
Date: **2026-07-21**
Requirements: `SOL-L1-FR-014`, `SOL-L1-SR-002..010`
Related documents:

- `docs/contracts/SOLERA_LOOP1_V0_1.md`
- `docs/adr/0005-loop1-synthetic-data-authority.md`
- `docs/runbooks/LOOP1_DEMO_SOP.md`

## Context

The LOOP-1 core can run offline with deterministic telemetry, Data Hub, Pulse,
Thread, bounded Agent Skills, Evidence, Experience, and replay. The optional
roadmap names PI OMF mirroring, DWSIM/OPC UA calibration, multimodal intake,
and an external event bus. None is required to prove the Hero Agent workflow.

Enabling these options merely because adapters are technically possible would
introduce external write permission, simulation-validity, data-retention,
model-egress, deployment, and operational-ownership risks.

## Decision

- Ship the self-contained core with `SOLERA_LOOP1_ENABLED=true`.
- Keep PI mirroring disabled by default. It remains blocked until an isolated
  namespace, formal permissions, retention, cleanup, rollback, and duplicate
  replay tests pass.
- Defer DWSIM/OPC UA until a versioned model, reviewed namespace/security
  design, and VVUQ comparison are accepted.
- Defer multimodal intake until image/document sensitivity, retention,
  confidence, unit/time extraction, human confirmation, and deletion gates
  pass.
- Use the bounded in-process `EventBus` seam for the modular monolith. Do not
  operate NATS JetStream or Redpanda until measured throughput, durability,
  consumer replay, poison-message handling, tenant isolation, and ownership
  justify it.
- Expose a machine-readable productization Gate report. If a blocked
  capability is requested in configuration, startup fails closed.

Current decision:

| Capability | Decision |
| --- | --- |
| Core LOOP-1 | Ready |
| In-process EventBus | Core-ready |
| PI OMF mirror | Deferred |
| DWSIM / OPC UA | Deferred |
| Multimodal intake | Deferred |
| NATS / Redpanda | Deferred |

## Consequences

Positive:

- External systems cannot silently become a critical dependency.
- The demo remains offline, resettable, and repeatable.
- Optional investments require explicit customer or load evidence.
- Configuration, API, and audit surfaces disclose what is and is not enabled.

Costs:

- The current synthetic equations are reduced-order rather than simulator
  calibrated.
- PI interoperability is demonstrated through a read-compatible Synthetic PI
  Connector, not by writing to the company demo PI.
- Images, reports, video, and external-broker durability are not in the core
  demo.

## Enablement requirements

Changing any optional Gate to enabled requires:

1. a contract/ADR revision
2. threat and data-policy review
3. tenant and namespace isolation tests
4. failure, retry, duplicate, cleanup, and rollback tests
5. an updated operator SOP
6. golden evaluation cases for the new capability

PI enablement additionally requires explicit written authorization for every
server, AF database, Data Archive, Point/container, identity, and retention
operation.

## Rollback

All optional flags default to false or `in-process`. Disabling them returns the
system to the self-contained LOOP-1 core. PI remains a mirror and can be
removed without changing Data Hub truth or replay.
