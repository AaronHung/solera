# ADR-0004: Composable Skills with Hybrid Routing

Status: **Proposed for post-v0.1 implementation**  
Date: **2026-07-18**  
Requirements: `SOL-V02-SK-001..033`  
Related documents:

- `docs/contracts/SOLERA_SKILL_SYSTEM_V0_2.md`
- `docs/backlog/V0_2_SKILL_BACKLOG.md`
- `docs/architecture/SOLERA_VS_GPT_SIDECAR.md`

## Context

The v0.1 Agent proves a secure, read-only industrial vertical slice, but one
broad page-context prompt cannot provide both GPT-style semantic usefulness and
industrial workflow discipline. A factory user may ask for page
understanding, tank capacity, historian trend, gauge reading, Web Research, or
a shift report. These tasks have different data sources, model capabilities,
Evidence rules, and risk boundaries.

Making every capability a separate autonomous Agent would multiply routing,
authorization, tracing, deployment, and evaluation paths. Keeping everything
inside one unstructured prompt would produce inconsistent answers and make
customer-specific workflows unsafe to manage.

## Decision

After v0.1 acceptance:

- Define typed, versioned `SkillManifest` contracts.
- Keep Skills in the modular monolith initially; do not create one microservice
  or autonomous Agent per Skill.
- Select Skills through a central policy-aware Registry.
- Support Auto, Manual, and Hybrid routing; use Hybrid as the default for
  ambiguous or elevated-scope cases.
- Keep Tool execution, deterministic analytics, Evidence, and ViewSpec
  validation outside the language model.
- Treat model capability selection as a policy-controlled dependency of a
  Skill, not as a Skill itself.
- Keep industrial Skills read-only by default.
- Make Web Research, camera/vision, PPT/report, and general planning explicit
  Skills with separate permissions and evaluation sets.
- Treat Data Services, the Site/Asset graph, Open Wiki, and Vector retrieval as
  governed shared substrates for Skills, not as unrestricted autonomous
  Agents. Data Services remains numerical authority; graph and Vector layers
  preserve tenant, provenance, and Evidence filters.
- Make customer Skills tenant-scoped, versioned, auditable, disableable, and
  rollbackable.

## Consequences

Positive:

- Solera can deliver GPT-quality purpose-first explanations without losing
  industrial provenance and safety.
- Factory-specific methods become productized, testable, and reusable.
- New Tools and models can be added without changing the user-facing Skill
  concept.
- Routing, activity, cost, and quality can be evaluated per Skill.
- A future Skill marketplace or customer authoring experience has a controlled
  contract to target.

Costs:

- The Registry, manifest, routing, and golden evaluation set add platform work.
- Auto-routing can be wrong and must decline or ask for clarification.
- Customer Skill lifecycle management requires ownership, approval, and
  version discipline.
- Camera and external Web Skills introduce additional privacy, egress, and
  model-provider decisions.

## Alternatives rejected

### One unrestricted general Agent

Rejected because it obscures permissions, makes industrial behavior difficult
to evaluate, and allows generic requests to accidentally reach sensitive
Tools.

### A separate autonomous Agent for every capability

Rejected for v0.2 because it multiplies deployment, tracing, and policy
surfaces before Pilot evidence proves that independent scaling or ownership is
needed.

### User-selected prompts only

Rejected because users should not need to understand internal capability names,
and manual selection alone cannot support a smooth Sidecar experience.

### Fully automatic routing only

Rejected because factories need an explicit confirmation path when intent,
asset, data scope, or model capability is ambiguous.

## Rollback and migration

The v0.1 single-orchestrator path remains the fallback. A Skill Router may
delegate to existing v0.1 flows, and disabling the Router must restore the
existing page-context and approved-Tag behavior. No v0.2 Skill may add a host
write/control Tool without a new security review, ADR, and contract change.
