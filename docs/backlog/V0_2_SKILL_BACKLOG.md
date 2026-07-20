# Solera v0.2 Skill System Backlog

Status: **Proposed; implementation gated on v0.1 Pilot acceptance**  
Parent proposal: `docs/contracts/SOLERA_SKILL_SYSTEM_V0_2.md`  
Comparison: `docs/architecture/SOLERA_VS_GPT_SIDECAR.md`

Each item has a stable ID. A completed item requires implementation, tests,
updated evaluation evidence, and an update to `docs/PROJECT_STATE.md`.

## Gate 0 — v0.1 handoff

- **SOL-V02-BL-000** Record v0.1 Pilot acceptance, open gaps, and the
  decision to begin Skill System implementation.
  - Depends on: v0.1 external Pilot evidence.
  - Done when: named Pilot users, supported displays, golden results, and
    unresolved limitations are recorded.

## Gate 0A — Approved Site onboarding and domain policy

The v0.1 SCADA test exception
`http://203.146.71.23/*` is intentionally static and local to the Pilot.
Future customers need governed onboarding instead of manual manifest edits.

- **SOL-V02-BL-005** Define a tenant-scoped `ApprovedSite` contract for
  origins, schemes, ports, host patterns, adapter, data policy, owner,
  expiry, and enabled/disabled state.
  - Requirement: `SOL-V02-SITE-001`.
  - Done when: the same approved-site record can drive extension injection,
    backend domain policy, adapter selection, and audit metadata.

- **SOL-V02-BL-006** Implement Approved Site onboarding and configuration
  distribution.
  - Requirement: `SOL-V02-SITE-002`.
  - Done when: an authorized tenant administrator can approve a SCADA, MES,
    ERP, or PI site without hand-editing source code, while production
    defaults remain deny-by-default and HTTP exceptions require explicit
    approval.

- **SOL-V02-BL-007** Add a content-script handshake and recovery flow for
  approved sites.
  - Requirement: `SOL-V02-SITE-003`.
  - Done when: Sidecar distinguishes “site not approved”, “content script not
    injected”, and “page receiver unavailable”, then offers a safe,
    auditable recovery path without unrestricted all-site injection.

- **SOL-V02-BL-008** Validate generic industrial PageContext on the first
  approved SCADA site.
  - Requirement: `SOL-V02-SITE-004`.
  - Done when: the site captures bounded visible context, excludes passwords
    and secrets, passes backend tenant/domain policy, and has golden tests for
    login, refresh, SPA navigation, and stale-tab recovery.

## Gate 1 — Skill contracts and registry

- **SOL-V02-BL-001** Define `SkillManifest` JSON Schema and TypeScript/Python
  contract fixtures.
  - Requirement: `SOL-V02-SK-001`.
  - Done when: schema validation, versioning, owner, policy, Tool, model, and
    output fields have cross-language fixtures.

- **SOL-V02-BL-002** Implement an in-process Skill Registry with enable/disable,
  tenant scope, version selection, and audit metadata.
  - Requirement: `SOL-V02-SK-002`.
  - Done when: a killed or disabled Skill cannot be selected or executed.

- **SOL-V02-BL-003** Add Skill policy checks for domain, role, asset, time
  range, data egress, model capability, and read-only guarantees.
  - Requirement: `SOL-V02-SK-003`.
  - Done when: policy denial is fail-closed and covered by security tests.

- **SOL-V02-BL-004** Extend Agent lifecycle events with selected Skill,
  plan summary, Tool steps, Evidence state, duration, cancellation, and safe
  error categories.
  - Requirement: `SOL-V02-SK-004`.
  - Done when: the Sidecar shows concise operational activity without exposing
    hidden chain-of-thought.

## Gate 2 — Routing and Sidecar UX

- **SOL-V02-BL-010** Implement manual Skill selection in the Sidecar.
  - Requirement: `SOL-V02-SK-005`.
  - Done when: the user can select an eligible Skill and see its scope before
    sending a question.

- **SOL-V02-BL-011** Implement hybrid Skill suggestions with confirmation for
  ambiguous intent, elevated data scope, or multiple valid workflows.
  - Requirement: `SOL-V02-SK-006`.
  - Done when: ambiguous cases ask a clarification rather than silently
    selecting a high-risk workflow.

- **SOL-V02-BL-012** Implement auto-routing from question, PageContext, asset,
  available Tools, tenant policy, and Skill registry.
  - Requirement: `SOL-V02-SK-007`.
  - Done when: routing meets the agreed golden-set threshold and declines
    unsupported intent safely.

- **SOL-V02-BL-013** Improve purpose-first page answers and intent-specific
  answer structures for Traditional Chinese and English.
  - Requirement: `SOL-V02-SK-008`.
  - Done when: page-purpose, capacity, trend, abnormality, and data-quality
    golden questions each produce the expected structure and caveats.

## Gate 3 — First industrial Skills

- **SOL-V02-BL-020** Extract Page Understanding as a reusable Skill.
  - Requirement: `SOL-V02-SK-010`.
  - Done when: it explains system, view purpose, relevant observations, and
    access/freshness caveats without becoming a DOM inventory.

- **SOL-V02-BL-021** Implement PI Vision Industrial Display Analysis.
  - Requirement: `SOL-V02-SK-011`.
  - Done when: identity, asset, measurements, forecast, trend, limits,
    overlays, and data freshness are separated and Evidence-linked.

- **SOL-V02-BL-022** Implement Tank Capacity Analysis.
  - Requirement: `SOL-V02-SK-012`.
  - Done when: geometry, current level, percentage, explicit calculations,
    forecast, operating limits, data quality, and uncertainty are separated.

- **SOL-V02-BL-023** Implement PI Trend and Data Quality Skill.
  - Requirement: `SOL-V02-SK-013`.
  - Done when: approved series, rate-of-change, gaps, bad values, limits, and
    Canvas output are reproducible from Evidence.

- **SOL-V02-BL-024** Add industrial Skill Canvas templates.
  - Requirement: `SOL-V02-SK-014`.
  - Done when: each first Skill emits only schema-valid trusted Widgets and
    never changes host application state.

## Gate 4 — Extensible capabilities

- **SOL-V02-BL-030** Define a model capability registry for language, vision,
  OCR, embedding, and report models.
  - Requirement: `SOL-V02-SK-020`.
  - Done when: model selection is policy-controlled and model credentials
    remain server-side.

- **SOL-V02-BL-031** Prototype Gauge Meter Reader as a read-only vision Skill.
  - Requirement: `SOL-V02-SK-021`.
  - Done when: image provenance, timestamp, unit, confidence, calibration,
    uncertainty, and PI cross-check are represented.

- **SOL-V02-BL-032** Add Web Research with explicit outbound permission and
  source citations.
  - Requirement: `SOL-V02-SK-022`.
  - Done when: external sources are visible, tenant policy is enforced, and
    web content cannot expand industrial Tool scope.

- **SOL-V02-BL-033** Add report/PPT generation from approved Evidence.
  - Requirement: `SOL-V02-SK-023`.
  - Done when: generated artifacts cannot introduce unsupported industrial
    facts and are linked to source Evidence.

- **SOL-V02-BL-034** Define tenant Customer Skill packaging, sandboxing,
  approval, rollback, and deprecation.
  - Requirement: `SOL-V02-SK-024`.
  - Done when: one customer Skill can be deployed and disabled without
    rebuilding the extension or affecting another tenant.

## Gate 5 — Data Flywheel and industrial knowledge

- **SOL-V02-BL-050** Define the canonical Site / Area / Line / Unit / Asset /
  Tag hierarchy and cross-system identity mapping.
  - Requirement: `SOL-V02-DATA-001`.
  - Done when: stable IDs, aliases, provenance, effective dates, confidence,
    and tenant ownership are represented in contract fixtures.

- **SOL-V02-BL-051** Extend the connector contract for bounded historical
  windows, including multi-day and monthly queries, downsampling, quality,
  timezone, and cost limits.
  - Requirement: `SOL-V02-DATA-002`.
  - Done when: a read-only PI historian query can retrieve a policy-approved
    range with complete Evidence and cancellation behavior.

- **SOL-V02-BL-052** Implement PI Vision Historical Analysis Skill.
  - Requirement: `SOL-V02-DATA-003`.
  - Done when: a question such as “the three days before and after this
    timestamp” resolves a Tag, queries the bounded window, and calculates
    average/min/max/rate with explicit units and data quality.

- **SOL-V02-BL-053** Build Data Services for normalized observations,
  aggregates, lineage, Evidence references, and retention.
  - Requirement: `SOL-V02-DATA-004`.
  - Done when: Skills can consume a stable provider-neutral read contract
    without copying an unrestricted PI archive.

- **SOL-V02-BL-054** Implement the first idempotent Data Flywheel:
  ingest → normalize → quality → aggregate → link → index → evaluate.
  - Requirement: `SOL-V02-DATA-005`.
  - Done when: a replayable monthly fixture produces the same versioned
    aggregates, relationships, and evaluation artifacts.

- **SOL-V02-BL-055** Add a typed Asset / Site relationship graph.
  - Requirement: `SOL-V02-DATA-006`.
  - Done when: Site, equipment, Asset, Tag, document, event, and analysis
    edges are queryable with tenant and provenance filters.

- **SOL-V02-BL-056** Add tenant-filtered Vector DB retrieval for documents and
  approved observation summaries.
  - Requirement: `SOL-V02-DATA-007`.
  - Done when: vector recall cannot bypass graph, Evidence, sensitivity,
    retention, or tenant policy.

- **SOL-V02-BL-057** Add Open Wiki data services for versioned definitions,
  SOPs, operator notes, and citations.
  - Requirement: `SOL-V02-DATA-008`.
  - Done when: every retrieved knowledge claim has owner, version, source,
    effective date, and Evidence/citation metadata.

## Gate 6 — Spatial industrial experience

- **SOL-V02-BL-060** Define spatial Site/Asset ViewSpec extensions for maps,
  equipment topology, 2.5D overlays, and linked trends.
  - Requirement: `SOL-V02-SPATIAL-001`.
  - Done when: a trusted Canvas can render a Site or Asset view without
    arbitrary model-generated code.

- **SOL-V02-BL-061** Build a 2.5D industrial Canvas prototype driven by Site,
  Asset, time-series, and Evidence contracts.
  - Requirement: `SOL-V02-SPATIAL-002`.
  - Done when: selecting an Asset opens its related trends, documents,
    status, and Evidence without changing host-system state.

- **SOL-V02-BL-062** Define Scene-ready contracts for future 3D geometry,
  coordinate systems, object identity, and lifecycle cleanup.
  - Requirement: `SOL-V02-SPATIAL-003`.
  - Done when: a future 3D renderer can consume the same validated identity
    and Evidence model; 3D rendering itself remains a later milestone.

## Cross-cutting evaluation and operations

- **SOL-V02-BL-040** Create a Skill golden set covering routing, ambiguity,
  purpose-first answers, industrial semantics, calculations, Evidence,
  injection, and read-only policy.
  - Requirement: `SOL-V02-SK-030`.

- **SOL-V02-BL-041** Add Skill-level traces, latency, cost, outcome feedback,
  and replay fixtures.
  - Requirement: `SOL-V02-SK-031`.

- **SOL-V02-BL-042** Run a comparative evaluation against GPT-style Sidecar
  behavior without treating GPT output as ground truth.
  - Requirement: `SOL-V02-SK-032`.

- **SOL-V02-BL-043** Document model/provider, retention, image handling,
  outbound, and customer data residency decisions before production use.
  - Requirement: `SOL-V02-SK-033`.

## Ordering rule

Do not begin camera, Web Research, PPT, or general-agent work before the
registry, policy, routing, activity trace, first industrial Skills, and golden
evaluation gates pass. The first implementation slice is:

```text
SkillManifest → Registry → Hybrid selection → Page Understanding
→ PI Vision Industrial Analysis → Tank Capacity → Historical Analysis
→ Data Flywheel fixture → Asset graph → Skill golden set
```
