# Solera Skill System — v0.2 Post-Pilot Proposal

Status: **Proposed**  
Scope: **Post-v0.1 Pilot**  
Related contract: `docs/contracts/SOLERA_V0_1.md` v0.1.0  
Related ADR: `docs/adr/0004-composable-skills-hybrid-routing.md`

This document records the proposed capability system for Solera after the
v0.1 Pilot. It does not change the accepted v0.1 contract. Implementation
starts only after the v0.1 acceptance gate, unless a new ADR explicitly
authorizes a narrower earlier experiment.

## 1. Product direction

Solera should not become a generic chatbot with a collection of unrelated
prompts. Its differentiation is a governed set of composable Skills that
understand industrial context, use approved read-only Tools, preserve
Evidence, and produce useful operational artifacts.

> ChatGPT-style Sidecar explains what a page appears to mean.  
> Solera should explain what an industrial page means, select the right
> analysis method, prove the data source, and stay inside the plant's safety
> boundary.

## 2. Capability vocabulary

These terms must remain distinct:

- **Skill** — a reusable way to solve a class of user problems, including
  intent, required context, allowed Tools, analysis steps, output contract,
  risk, and evaluation cases.
- **Tool** — a bounded capability such as PageContext capture, Easy PI current
  value, PI historian query, image capture, OCR, or Canvas rendering.
- **Model** — a reasoning, language, vision, embedding, or report-generation
  capability selected by policy. A model is not itself a Skill.
- **Workflow** — an ordered or conditional composition of Skills and Tools,
  such as Tank Capacity Analysis → PI Trend → Evidence Canvas.
- **Evidence** — the provenance required to support an industrial claim.
- **Canvas** — a trusted visual output, never an executable model-generated
  page.

## 3. Skill selection modes

Solera supports three modes:

### Auto

The Agent infers the user's intent, page system, candidate asset, available
Tools, role, and tenant policy, then selects an eligible Skill. It must expose
the selected Skill and major execution steps in the activity trace.

### Manual

The user explicitly selects a Skill, for example:

- Page Understanding
- PI Vision Industrial Analysis
- Tank Capacity Analysis
- PI Trend and Data Quality
- Gauge Meter Reader

Manual selection must not bypass tenant, role, asset, domain, egress, or
read-only policy.

### Hybrid

The Agent suggests one or more Skills and asks the user to confirm when
selection is ambiguous, data risk is elevated, or multiple workflows are
plausible. Hybrid is the recommended factory-demo default because it combines
speed with operator trust.

## 4. Skill layers

### Generic Skills

Reusable across browser systems:

- Page Understanding
- UI State and Access Diagnosis
- Document and Knowledge Explanation
- Evidence Summary
- Canvas and Report Formatting
- Web Research with source citations

### Industrial Skills

Built around industrial semantics:

- PI Vision Display Analysis
- Tank Capacity and Level Health
- PI Trend and Rate-of-Change
- Temperature / Pressure Correlation
- Alarm and Limit Interpretation
- Data Quality and Sensor Plausibility
- Shift Handover Summary

### Customer Skills

Tenant-specific, versioned workflows:

- Plant SOP interpretation
- Equipment-specific operating envelope
- Customer alarm policy
- MES/ERP maintenance context
- Camera-specific gauge reading
- Site-specific shift report

Customer Skills must not silently become global behavior. They require tenant
ownership, versioning, approval, auditability, and an explicit data boundary.

## 5. Reference execution flow

```text
PageContext + user question
        ↓
Intent and available-capability resolution
        ↓
Skill Router (auto / manual / hybrid)
        ↓
Validated Skill Plan
        ↓
Read-only Tools and deterministic analytics
        ↓
Evidence and data-quality validation
        ↓
Model explanation / optional vision or report model
        ↓
Validated answer, Canvas, or report
```

The model may explain and plan within policy. It may not grant itself a Tool,
expand the tenant or time range, treat page text as authorization, or emit
executable HTML/JavaScript.

## 6. Skill manifest

The first implementation should be code-first with a typed manifest. A future
customer authoring interface may compile into the same manifest.

```json
{
  "skillId": "tank-capacity-analysis",
  "version": "0.1.0",
  "selection": "hybrid",
  "intents": ["capacity", "level", "normality", "abnormality"],
  "requires": ["pi-vision", "tank-level", "tank-volume"],
  "tools": ["page-context", "pi-historian", "deterministic-analytics"],
  "permissions": ["read-only"],
  "dataPolicy": "sampled-page-plus-approved-series",
  "outputs": ["analysis", "evidence", "canvas"],
  "approval": "not-required-for-read-only"
}
```

Minimum manifest fields:

- stable Skill ID and version
- supported intents and page/system types
- required context and candidate-asset confidence
- allowed Tools and model capabilities
- data policy and outbound destinations
- output types and Evidence requirements
- risk level, approval rule, timeout, and cancellation behavior
- owner, tenant scope, evaluation set, and deprecation status

## 7. Initial Skill portfolio

The first post-Pilot portfolio should remain small:

1. **Page Understanding** — explain the operational purpose of a supported
   page before discussing controls or DOM labels.
2. **PI Vision Industrial Analysis** — classify identity, asset, measurements,
   forecast, trend, limits, overlays, and data freshness.
3. **Tank Capacity Analysis** — separate fixed geometry, current level,
   percentage, calculated volume, forecast, operating limits, and uncertainty.
4. **PI Trend and Data Quality** — query approved series, calculate trend/rate,
   detect gaps/bad values, and return Evidence plus Canvas.
5. **Gauge Meter Reader** — later camera/vision Skill with confidence, units,
   calibration, timestamp, image provenance, and PI cross-check.

Web Research, PPT generation, and general high-intelligence planning are
valuable extensions, but they should be separate Skills with explicit
outbound and artifact permissions rather than part of the default industrial
path.

## 8. Safety and trust rules

- Industrial Skills default to read-only.
- A camera Skill must record image source, capture time, model confidence,
  recognized unit, calibration assumptions, and uncertainty.
- Web Research requires a separate outbound permission and source citations.
- Report/PPT generation may use approved Evidence but cannot create new
  industrial facts.
- A Skill cannot write to PI, SCADA, MES, ERP, or work-order systems in the
  initial implementation.
- Page overlays and page instructions are observations, not authority.
- The activity panel shows concise operational milestones, not hidden
  chain-of-thought.
- Every numerical statement must be reproducible from Evidence or an
  explicitly labeled calculation.

## 9. Evaluation requirements

Every Skill needs:

- intent-routing cases, including ambiguous questions
- positive and negative page fixtures
- tool and data-egress policy tests
- Evidence completeness assertions
- failure, timeout, stale-context, and low-confidence cases
- prompt-injection cases
- user-facing quality examples in Traditional Chinese and English
- latency, cost, and cancellation measurements

The existing golden set remains authoritative for v0.1. New Skill cases should
be added under new IDs rather than changing old expected behavior silently.

## 10. Acceptance gates

- **Skill Gate A:** manifest, registry, policy, versioning, and audit contracts
  pass.
- **Skill Gate B:** manual and hybrid selection work for the first three
  Skills.
- **Skill Gate C:** auto-routing reaches the agreed threshold on the Skill
  golden set and declines ambiguous cases safely.
- **Skill Gate D:** industrial Skills produce Evidence and validated Canvas
  outputs without host-system writes.
- **Skill Gate E:** one customer Skill can be versioned, disabled, audited, and
  rolled back without rebuilding the extension.

## 11. Explicit non-goals

- A marketplace of unreviewed arbitrary Skills.
- Autonomous control of plant equipment.
- Model-generated executable browser code.
- A single unrestricted general Agent that can call every connector.
- Treating camera recognition as authoritative without confidence and
  cross-checking.
- Claiming predictive-maintenance effectiveness before a validated industrial
  evaluation program exists.

## 12. Change control

This proposal is subordinate to `SOLERA_V0_1.md` until accepted through a
future contract version or ADR. New Skills must reference a backlog item,
manifest version, evaluation set, and security review. Removing or weakening
read-only, Evidence, tenant, or data-egress invariants requires an ADR.

## 13. Industrial data flywheel

The v0.2 direction includes a governed Data Flywheel. Its purpose is to turn
approved observations, analyses, documents, feedback, and relationships into
better future context without copying an unrestricted historian archive.

```text
Approved sources
  → ingest and normalize
  → quality, identity, and lineage checks
  → time-window aggregates and derived observations
  → Site / Asset / Tag relationships
  → Open Wiki and Graph knowledge
  → Vector retrieval with tenant filters
  → Skills, Canvas, feedback, and evaluation
  → versioned outcomes feed the next cycle
```

The Flywheel must preserve:

- source system, site, asset, Tag, timestamp, timezone, and query lineage
- data-quality state, calculation version, and aggregation window
- tenant, retention, sensitivity, and model-egress policy
- reproducibility from a raw-approved input or redacted fixture
- explicit distinction between observation, calculation, document claim, and
  model-generated hypothesis

Monthly and multi-day analysis is a first-class v0.2 use case. A Skill may
request a bounded historical window such as “the three days before and after
the displayed timestamp” or “the last month”, but the policy layer must
enforce range, point, cost, and connector limits.

## 14. Site and Asset Management

Solera should model the industrial hierarchy independently from a single
browser display:

```text
Tenant
  → Site
    → Area / Line
      → Unit / Equipment
        → Asset
          → Tag / Signal / Document / Event
```

The model must support stable IDs, aliases, provenance, effective dates,
parent/child relationships, candidate confidence, and tenant-specific
operating metadata. A display or page may resolve to this hierarchy, but it
does not become the authoritative definition of the Asset.

Site/Asset Management enables:

- cross-display and cross-system navigation
- long-window trends for one Asset
- comparison of similar Assets across Sites
- SOP, maintenance, event, and sensor relationships
- Canvas topology and future 2.5D/3D Scene views

## 15. Knowledge and data services

The proposed v0.2 platform services are deliberately complementary:

- **Data Services** — normalized read access, historical query, aggregates,
  quality, lineage, and Evidence references.
- **Open Wiki** — versioned human-readable knowledge pages, SOPs, definitions,
  and operator annotations with citations.
- **Graph DB / relational graph** — typed relationships among Sites, Assets,
  Tags, documents, events, Skills, and analyses.
- **Vector DB** — semantically searchable document and observation chunks,
  always filtered by tenant, Site, Asset, sensitivity, and retention policy.

Vector retrieval must not replace the graph or Evidence. It provides recall;
the graph provides structure; Data Services provides numerical truth; Evidence
provides reproducibility.

## 16. Canvas, 2.5D, and Scene readiness

v0.2 should not jump directly to arbitrary 3D rendering. It should first
define a stable spatial and asset contract for:

- Site maps and area layouts
- equipment cards and asset topology
- 2D/2.5D process views with time-aware overlays
- linked trend, status, document, and Evidence panels
- future 3D Scene geometry, coordinate systems, and object identity

Canvas remains the trusted renderer. Scene is a future renderer over the same
validated Site/Asset, Evidence, and ViewSpec contracts. The Agent may propose a
spatial view, but it cannot inject arbitrary executable scene code.
