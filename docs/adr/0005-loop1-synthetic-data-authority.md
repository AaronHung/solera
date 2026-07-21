# ADR-0005: LOOP-1 Synthetic Data Authority

Status: **Accepted**
Date: **2026-07-21**
Requirements: `SOL-L1-FR-001..014`, `SOL-L1-SR-001..010`
Related documents:

- `docs/contracts/SOLERA_LOOP1_V0_1.md`
- `docs/architecture/SYSTEM.md`
- `docs/contracts/SOLERA_SKILL_SYSTEM_V0_2.md`

## Context

Solera needs a repeatable chemical-industry Agent demo before a customer can
provide DCS, historian, MES, CMMS, P&ID, procedure, or incident data. The
existing Experience simulation is deterministic but browser-local. It cannot
produce backend Evidence, serve Agent tools, preserve a cross-system data
thread, or act as a shared replay clock.

The company PI demo may eventually receive synthetic Tags and AF elements, but
PI permissions and OMF availability are not guaranteed. Making PI the first
source of truth would place the critical path outside Solera and make offline
replay difficult.

## Decision

- Solera Data Hub is the authoritative source for LOOP-1 scenario state,
  observations, events, identity, relationships, documents, outcomes, and KPI
  results.
- A deterministic server-side Scenario Engine owns the simulation clock, seed,
  state transitions, fault injection, replay, and truth labels.
- A Synthetic PI Connector implements the existing read contract so the Agent,
  analytics, and Evidence path does not need a demo-only bypass.
- Experience and Canvas consume validated backend scenario contracts. They are
  renderers, not a second truth source.
- Postgres stores bounded scenario data. Relational typed edges provide the
  initial context graph; pgvector remains an optional retrieval index.
- Flow jobs seed, normalize, quality-check, link, index, aggregate, evaluate,
  and clean up fixtures idempotently.
- PI is an optional mirror. OMF is preferred when AF/Point creation is allowed;
  Stream update is permitted only for pre-provisioned isolated demo Points.
- The modular monolith remains the deployment unit. An EventBus protocol may
  later use an external broker without changing scenario or Agent contracts.

## Consequences

Positive:

- The demo is self-contained, deterministic, offline-capable, and testable.
- Agent, Evidence, Experience, KPI, and replay share one clock and truth set.
- PI integration demonstrates interoperability without controlling delivery.
- The same connector and contract seams can later bind customer systems.

Costs:

- Solera must add scenario, observation, event, asset, relationship, document,
  and approval persistence.
- Synthetic causal equations require explicit validation and must not be
  represented as customer-plant physics.
- Browser-local Experience mock data must be retained only as fallback or
  migrated to backend contracts.

## Alternatives rejected

### PI-first synthetic truth

Rejected as the primary path because write permissions, OMF services, AF
namespace design, retention, and cleanup are external dependencies.

### Browser-only simulation

Rejected because it cannot produce authoritative Evidence, Agent queries,
cross-system lineage, or deterministic multi-client replay.

### High-fidelity Digital Twin first

Rejected because DWSIM/OPC UA integration and domain validation would delay the
Hero workflow and still would not prove equivalence to a customer plant.

### Kafka-first microservices

Rejected for the core demo because the existing modular monolith and an
in-process EventBus can meet bounded throughput and replay requirements with
lower operational risk.

## Rollback and migration

- `SOLERA_LOOP1_ENABLED=false` disables all LOOP-1 routes, tools, jobs, and UI
  entry points without changing v0.1 Easy PI behavior.
- Disabling the Synthetic PI Connector restores the existing connector path.
- PI egress is independently disabled and never required for replay.
- Industrial schemas remain separate from v0.1 contracts so LOOP-1 can be
  removed without migrating saved v0.1 Canvas records.
