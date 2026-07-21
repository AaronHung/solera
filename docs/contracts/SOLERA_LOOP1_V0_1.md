# Solera LOOP-1 Synthetic Industrial Agent Contract

Status: **Accepted for implementation**
Contract version: **0.1.0-preview**
Target: **12-week synthetic industrial Agent vertical slice**
Optional hardening: **4 weeks after the core acceptance gate**

## 1. Product claim

LOOP-1 is a deterministic synthetic chemical-plant testbed for demonstrating
how Solera links process telemetry, alarms, asset identity, procedures, cases,
work records, Evidence, and human approval into a repeatable investigation.

The supported claim is:

> Solera can replay a governed synthetic abnormal situation, assemble
> traceable IT/OT context, rank bounded hypotheses, retrieve the applicable
> procedure, and draft human-approved follow-up actions.

LOOP-1 is not a customer plant model, certified Digital Twin, DCS optimizer,
SIS replacement, or proof of production savings.

## 2. Hero scenario

The first scenario models a continuous reactor cooling loop inspired by the
public Tennessee Eastman Process benchmark.

1. The reactor, condenser, separator, recycle compressor, and stripper operate
   inside a stable synthetic envelope.
2. A cooling-water control valve begins to stick.
3. Controller command increases while valve position and cooling-water flow do
   not follow.
4. Reactor temperature and pressure drift, followed by downstream load and
   product-quality proxy deviations.
5. Fifteen to twenty-five derived alarms appear over a bounded interval.
6. LOOP-1 clusters the alarms, locates the earliest change, retrieves the
   relevant P&ID region, SOP revision, maintenance history, MOC/ePTW context,
   shift notes, and similar cases.
7. The Agent provides evidence-backed hypotheses and a safe inspection path.
8. A human may approve a draft inspection work order and handover note.
9. The scenario enters recovery and stores the approved outcome for evaluation.

The golden root cause is cooling-water valve stiction. Variation runs may
introduce missing data, delayed ingestion, sensor bias, or an alternative
cooling-water disturbance, but may not silently change the golden truth.

## 3. Required data thread

The canonical hierarchy is:

```text
Tenant
  → Site
    → Area
      → Process Unit
        → Equipment
          → Component
            → Signal / Tag
```

Every scenario entity uses a stable Solera ID and may have time-bounded aliases
for PI, DCS, ERP, CMMS, P&ID, and document identifiers.

The minimum linked thread is:

```text
Scenario Run
  → Observation / Alarm
  → Tag
  → Component / Equipment
  → P&ID / Procedure
  → Case / Work Order / Shift Log
  → Hypothesis / Evidence
  → Human Decision / Outcome
  → KPI Result
```

All synthetic records carry `synthetic=true`, scenario version, seed,
simulation time, event time, ingest time, quality, source, and lineage.

## 4. Functional requirements

- **SOL-L1-FR-001 Scenario contract:** validate a versioned scenario manifest,
  deterministic seed, clock, state machine, asset hierarchy, Tag catalog,
  alarms, documents, cases, truth labels, and KPI definitions.
- **SOL-L1-FR-002 Deterministic replay:** the same manifest, seed, and command
  sequence produce identical observations, state transitions, events, and
  truth labels.
- **SOL-L1-FR-003 Fault injection:** inject only allowlisted scenario faults;
  record initiator, timestamp, parameters, and expected effects.
- **SOL-L1-FR-004 Synthetic connector:** expose current and recorded TagSeries
  through the provider-neutral read contract used by the existing Agent.
- **SOL-L1-FR-005 Data Hub:** persist bounded observations, events, identities,
  aliases, relationships, documents, cases, decisions, and KPI results.
- **SOL-L1-FR-006 Pulse:** report source freshness, ingest lag, missing/bad
  values, scenario clock, connector health, and replay state.
- **SOL-L1-FR-007 Thread:** resolve every Tag, Alarm, Document, Case, and Action
  to stable tenant-scoped entities and typed relationships.
- **SOL-L1-FR-008 Flow:** provide idempotent seed, normalize, quality, link,
  aggregate, index, evaluate, and cleanup jobs.
- **SOL-L1-FR-009 Skills:** support bounded Alarm Triage, Process Context,
  Procedure & Safety, Case Retrieval, Asset Integrity, and Shift Handover
  methods under one policy-aware orchestrator.
- **SOL-L1-FR-010 Evidence:** every industrial number, alarm cluster,
  calculation, document claim, and recommended action carries reproducible
  Evidence or is explicitly identified as a model hypothesis.
- **SOL-L1-FR-011 Approval:** permit draft work-order and handover transitions
  only after an authenticated human approval; never execute a plant-control
  action.
- **SOL-L1-FR-012 Experience:** render Unit Overview, Alarm Timeline,
  Investigation Canvas, Evidence, Cases, Pulse, KPI comparison, and Action Rail
  from validated backend contracts.
- **SOL-L1-FR-013 Replay controls:** support pause, resume, reset, jump to fault,
  and 1x/5x/10x replay without changing golden truth.
- **SOL-L1-FR-014 Optional PI mirror:** mirror synthetic data only after PI
  permissions, cleanup, retention, namespace, and rollback gates pass.

## 5. Safety requirements

- **SOL-L1-SR-001 Read-only plant boundary:** LOOP-1 has zero DCS, PLC, SIS,
  SCADA, historian-control, or field-device control tools.
- **SOL-L1-SR-002 Synthetic disclosure:** every LOOP-1 screen, Evidence record,
  export, and KPI clearly identifies synthetic data and assumptions.
- **SOL-L1-SR-003 No control language:** the Agent may recommend who should
  verify which procedure or instrument; it may not instruct users to bypass
  interlocks, open/close valves, change setpoints, or declare equipment safe.
- **SOL-L1-SR-004 Human approval:** L2 actions create drafts only. Formal issue,
  dispatch, plant change, isolation, and external notification remain outside
  the demo.
- **SOL-L1-SR-005 Numerical authority:** deterministic analytics and approved
  data services calculate numerical values. The language model explains but
  does not invent or recalculate plant truth.
- **SOL-L1-SR-006 Procedure revision:** procedure retrieval must include
  document ID, revision, effective date, section, and source.
- **SOL-L1-SR-007 Missing data:** stale, missing, conflicting, or bad values
  reduce confidence and may force a safe decline.
- **SOL-L1-SR-008 Tenant isolation:** assets, documents, vectors, traces, and
  scenario runs remain tenant-scoped.
- **SOL-L1-SR-009 Model egress:** sensitivity and model-data policy apply before
  any page, document, time-series, image, or case data leaves the Data Hub.
- **SOL-L1-SR-010 Optional vision:** image/gauge outputs are observations with
  confidence and require cross-checking; they are never authoritative safety
  values.

## 6. Claims and non-goals

### LOOP-1 may demonstrate

- deterministic synthetic telemetry and alarm propagation
- alarm clustering and causal timeline assembly
- Top-3 hypothesis ranking against known synthetic truth
- correct SOP revision and case retrieval
- complete Evidence and lineage
- human-approved draft actions
- reproducible KPI formulas and assumed business-value calculations
- operation without PI connectivity

### LOOP-1 may not claim

- validated customer-plant physics or functional equivalence
- certified process-safety recommendations
- actual avoided incidents, downtime, scrap, emissions, or energy cost
- production PdM, RUL, catalyst, or quality-model accuracy
- autonomous control or closed-loop optimization
- support for arbitrary plants, Tags, documents, or video sources

## 7. KPI contract

### Directly measured demo KPIs

- replay determinism: `100%` for golden runs
- alarm compression: raw alarm count versus event-cluster count
- time to context: scenario trigger to complete context package
- time to first safe recommendation
- root-cause Top-3 hit rate against truth labels
- SOP retrieval precision and revision correctness
- Evidence completeness and citation validity
- unsupported-claim rate
- work-order and handover draft completeness
- safe-decline rate for missing/conflicting data cases

### Simulated business KPIs

The demo may calculate:

```text
off_spec_exposure =
  affected_throughput_per_minute × exposure_minutes × unit_contribution

downtime_exposure =
  downtime_minutes × contribution_margin_per_minute

investigation_labor =
  participants × minutes × loaded_labor_rate
```

Every result must display formula version, baseline, currency, units,
assumptions, and `synthetic estimate — not customer benefit`.

### Pilot-only KPIs

Actual downtime, MTTR, yield, scrap, energy intensity, operator workload, alarm
performance, and safety outcomes require customer baselines and domain review.

## 8. Acceptance gates

1. **Gate A — Contract and truth:** manifests, schemas, invariants, causal
   truth, alarms, documents, cases, and KPI formulas are versioned and reviewed.
2. **Gate B — Deterministic plant:** normal, Hero fault, missing-data, and
   alternative-fault runs replay identically under the same seed.
3. **Gate C — Data thread:** every Tag, Alarm, Document, Case, and Action
   resolves to stable identity and lineage.
4. **Gate D — Agent trust:** golden tests meet agreed Top-3, procedure,
   citation, Evidence, safe-decline, and unsupported-claim thresholds.
5. **Gate E — Unified Experience:** UI and Agent consume one backend scenario
   truth; reset and offline replay complete without PI.
6. **Gate F — Optional mirror:** PI egress is disabled by default and enabled
   only after permission, namespace, cleanup, retention, and rollback tests.

## 9. Optional productization

After Gates A–E:

- PI Web API OMF or pre-provisioned Stream mirror
- DWSIM/OPC UA calibration
- multimodal P&ID, lab-report, and field-image intake
- external event-bus and edge adapters
- load, security, retention, and deployment hardening

These options must not become prerequisites for the 12-week core demo.

## 10. Change control

- New requirements use stable `SOL-L1-*` IDs.
- Changes to claims, safety boundaries, numerical authority, write capability,
  or synthetic disclosure require an ADR and security review.
- The existing v0.1 `PageContext`, `Evidence`, and `ViewSpec` remain compatible.
- LOOP-1 industrial contracts are added separately and versioned independently.
