# Solera and GPT-style Sidecar

Status: **Product analysis and roadmap input**  
Date: **2026-07-18**  
Related proposal: `docs/contracts/SOLERA_SKILL_SYSTEM_V0_2.md`

This document records the current product distinction. It is not a claim that
one system is universally better. GPT-style Sidecar is a useful benchmark for
conversation quality and broad page interpretation; Solera must win on
industrial trust, repeatability, and plant-specific workflows.

## 1. Shared experience

Both products should:

- sit beside the user's current browser page
- preserve the user's question and conversation history
- explain the page in natural language
- show concise work/activity status and elapsed time
- render readable Markdown and structured results
- allow follow-up questions without losing context

These are baseline Sidecar quality expectations, not Solera's unique moat.

## 2. GPT-style Sidecar strengths

The benchmark behavior observed during the Pilot comparison is strong at:

- leading with the semantic purpose of a page
- grouping information into a useful operational narrative
- deciding what matters for the user's question
- separating current values, trends, forecasts, limits, and caveats
- making simple calculations when the inputs are visible
- providing a short planning summary before the answer
- maintaining a polished conversational flow

This is why a generic answer can feel more intelligent even when it has no
industrial connector or formal Evidence model.

## 3. Solera strengths

Solera's current and intended advantages are different:

- approved-domain and tenant policy
- read-only industrial Tool Registry
- PI Vision context separated from Easy PI numerical truth
- deterministic analytics outside the model
- Evidence, query IDs, timezone, data quality, and replay
- asset confirmation and low-confidence handling
- validated Canvas ViewSpecs and safe overlay cleanup
- model/data-egress policy seams
- future factory-specific Skills and customer workflows

These properties are necessary for an industrial product, but they can make
the answer feel overly cautious or mechanical if the explanation layer is not
well designed.

## 4. Current Solera gaps

The v0.1 implementation should be strengthened in the following order:

### A. Semantic page understanding

The answer should start with the page's operational purpose, not with every
visible toolbar, dialog, or DOM label. Overlays should be a secondary
freshness/access caveat unless they genuinely prevent the requested analysis.

### B. Intent-specific reasoning

“What does this screen do?”, “analyze tank capacity”, “show a trend”, and
“what is abnormal?” need different answer structures. A single broad
page-context prompt is not sufficient.

### C. Skill selection

The Agent should select or suggest a Page Understanding, PI Vision Industrial,
Tank Capacity, Trend/Data Quality, or later Gauge Reader Skill. The selection
must be visible, auditable, and policy constrained.

### D. Industrial narrative quality

The model should connect page observations to industrial meaning:

- fixed geometry versus current state
- level versus capacity percentage
- forecast versus forecast horizon
- trend versus rate-of-change
- physical limits versus approved operating limits
- visible values versus authoritative historian values
- data-quality anomalies versus process anomalies

It must label calculations and avoid inventing alarm limits.

### E. Model and Tool separation

The model should not be treated as the source of industrial truth. The model
plans and explains; Tools retrieve; deterministic analytics calculate;
Evidence proves; Canvas renders.

### F. Factory-specific workflows

The product needs a controlled way to add plant-specific SOPs, operating
envelopes, camera gauges, shift reports, and MES/ERP context without turning
customer instructions into global behavior.

## 5. Product positioning

The intended distinction is:

> GPT-style Sidecar is a broad semantic assistant for whatever is on the page.  
> Solera is a governed industrial intelligence layer that understands the
> page, chooses an appropriate industrial Skill, retrieves approved data,
> explains the result, and leaves a replayable trail.

Solera should match the benchmark on:

- purpose-first answers
- concise planning summaries
- readable structure
- follow-up context
- useful calculations

Solera should exceed it on:

- industrial source provenance
- deterministic and reproducible calculations
- factory-specific analysis methods
- read-only and tenant safety
- asset/time/context resolution
- Canvas and operational artifacts
- customer-owned Skills

## 6. What should not be combined into the default Agent

Web Search, PPT generation, data-science analysis, camera vision, and general
high-intelligence planning are all reasonable capabilities. They should not be
implicitly activated by every page question.

Each should be a Skill with:

- explicit data and outbound permissions
- source or image provenance
- model capability declaration
- output contract
- evaluation cases
- tenant and role policy

A general planner may coordinate them, but it must not become an unrestricted
super-tool.

## 7. Evaluation dimensions

Future comparisons should score both systems on:

1. page-purpose accuracy
2. relevant-field selection
3. industrial interpretation
4. calculation correctness
5. uncertainty and limitation honesty
6. source/provenance completeness
7. answer readability and Traditional Chinese quality
8. follow-up consistency
9. latency and cost
10. safety and policy compliance

The goal is not to copy GPT's wording. The goal is to copy its semantic
discipline while adding Solera's industrial guarantees.
