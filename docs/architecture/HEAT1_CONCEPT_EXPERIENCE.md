# HEAT-1 Concept Experience

Last updated: 2026-07-22

Status: interactive deterministic concept on
`feature/heat1-concept-experience`

## Positioning

HEAT-1 is Solera's `Batch-to-Release Quality Agent` concept for precision
manufacturing heat treatment.

Its Hero scenario follows one synthetic carburizing batch:

- Part: `Transmission Gear G47`
- Material: `18CrNiMo7-6`
- Batch: `HT-BATCH-260722-17`
- Asset: `FUR-CARB-03`
- Quantity: 240 gears across six tray positions
- Release characteristics: effective case depth, surface/core hardness,
  distortion, and retained austenite

The business problem is not simply furnace monitoring. Heat-treatment quality
is often confirmed hours later through lab, metallography, hardness, and CMM
results. By then, production planning and containment decisions are already
delayed.

HEAT-1 demonstrates how Solera could connect specification, material, recipe,
load position, furnace journey, atmosphere, quench, model uncertainty, lab,
and disposition Evidence into one governed workflow.

## Why HEAT-1 is not another dashboard

The experience is a six-stage decision story:

1. establish the exact batch and quality contract;
2. understand position-dependent exposure before the run;
3. replay the complete thermal and atmosphere journey;
4. estimate where quality risk is concentrated;
5. build hypotheses and a focused verification plan;
6. reconcile official lab results and draft a position-aware disposition.

The Soft Sensor is useful because it can prioritize attention and sampling
before the official lab result. It is not presented as a substitute for the
lab or as automatic quality release.

## Visual identity

HEAT-1 uses a dedicated `hot copper / ember` visual system:

- Gallery card: `accent-copper`
- Experience shell: `heat-shell`
- Primary accent: `#f28d52`
- Warning accent: warm gold
- Hold / out-of-spec accent: red
- Release candidate accent: green

FASTEN-1 remains steel blue in the same Gallery. The colors deliberately
separate the two manufacturing stories before the presenter opens either
workflow.

## Six-screen storyboard

### 01 — Batch Passport

The Batch Context Agent links:

- customer part and drawing revision;
- material grade and material lot;
- work order and due time;
- approved recipe revision;
- furnace identity;
- control plan and quality release specifications.

The screen establishes data authority before any process interpretation.

Interaction: **Lock Batch Passport**

### 02 — Load & Recipe

The Recipe Intelligence Agent maps six trays across three furnace zones. Each
tray retains part count, physical position, and load thermocouple identity.

The approved journey includes Preheat, Heat-up, Carburize, Diffuse, Oil Quench,
and Temper. The deterministic validation highlights T6 at the Zone 3 edge as
the position with the narrowest process margin.

Interaction: **Validate Load & Recipe**

Human Gate A confirms the intended load and approved recipe context before
journey analysis. No recipe is written to a furnace.

### 03 — Furnace Journey

The Thermal Journey Agent replays:

- furnace temperature;
- independent load response at `TC-07`;
- approved recipe envelope;
- carbon-potential actual versus target;
- quench transfer and agitation context.

Three linked deviations are revealed:

1. Zone 3 edge thermal lag;
2. carbon-potential recovery delay;
3. extended quench transfer with lower `QF-02` agitation.

Interaction: **Replay Furnace Journey**

### 04 — Quality Soft Sensor

The Metallurgy Soft Sensor produces tray-level estimates with uncertainty for:

- effective case depth;
- surface hardness;
- distortion;
- at-risk quantity.

The concept localizes the highest risk to T6 and estimates 24 of 240 pieces as
a focused hold candidate. Model version, estimate time, confidence, and lab
ETA remain visible.

Interaction: **Estimate Quality Distribution**

Required interpretation:

> This is an early quality signal for sampling and containment. It is not an
> official lab result and cannot authorize release.

### 05 — Deviation Investigation

The Heat-treatment Investigator orders the Evidence by time and ranks three
bounded hypotheses:

1. Zone 3 edge load and quench-agitation interaction;
2. carbon-probe drift;
3. material hardenability variation.

Each hypothesis includes counter-evidence. The resulting plan limits the hold
to T6, selects focused coupons and gears, verifies `QF-02`, and compares center
and edge positions.

Interaction: **Build Evidence Investigation**

Human Gate B approves only the sampling and containment draft.

### 06 — Release Evidence

The Quality Release Agent reconciles four official synthetic coupon results
with the prior estimate.

The deterministic outcome is:

- T1–T5: 216 pieces become release candidates;
- T6: 24 pieces remain on focused hold;
- Quality reviews the lab/CMM package;
- Metallurgy owns reprocess or scrap disposition;
- Maintenance verifies the quench-flow and transfer mechanism.

Interaction: **Reconcile Official Lab**

Human Gate C is the actual release/disposition authority. HEAT-1 generates
draft reports and Evidence packages only.

## Deterministic interaction contract

Every stage follows the same presentation rhythm:

1. the next stage stays locked;
2. the presenter clicks the stage's primary action;
3. deterministic data, charts, Evidence, or recommendations appear;
4. the presenter advances through the explicit gate;
5. the completed stage remains available for replay.

The story therefore presents Agent work without claiming that an LLM or a
validated metallurgy model executed during the demo.

## Five-minute presentation route

1. Open **Precision Manufacturing** and point out FASTEN blue versus HEAT
   copper.
2. Open HEAT-1 and explain why delayed destructive testing creates decision
   latency.
3. Lock the Batch Passport and validate the load map.
4. Replay the Furnace Journey and identify the three linked deviations.
5. Run the Soft Sensor; emphasize uncertainty and the 20-hour lab lead.
6. Investigate T6; show hypotheses, counter-evidence, and focused sampling.
7. Reconcile the lab; finish on `216 release candidate / 24 hold`.

Recommended close:

> Solera does not replace metallurgy or authorize release. It turns fragmented
> process and quality context into an earlier, narrower, and auditable human
> decision.

## Required disclosure

HEAT-1 is:

- synthetic;
- deterministic;
- read-only with respect to furnace/PLC controls;
- a concept markup, not a validated Soft Sensor;
- not a safety system;
- not an automatic quality-release or reprocess system.

Do not claim measured quality improvement, production validation, autonomous
recipe changes, or automatic batch release.

## Productionization requirements

A real Pilot would require:

- customer drawing and control-plan authority;
- MES batch, tray, and genealogy identity;
- furnace, atmosphere, transfer, and quench time-series;
- calibration and SAT/TUS context;
- lab, hardness, metallography, and CMM results;
- a versioned feature pipeline and customer-specific validation set;
- uncertainty calibration, drift monitoring, and model approval;
- role-based Quality and Metallurgy approval;
- measurable acceptance criteria for lead time, sampling, false hold, false
  release, and traceability.

## Verification artifacts

Automated coverage includes all six stages, locked-stage progression, copper
Gallery routing, Soft Sensor disclosure, focused hold, official lab
reconciliation, and completion.

Browser screenshots:

```text
artifacts/experience-demo/solera-precision-gallery-1440x900.png
artifacts/experience-demo/solera-heat1-load-recipe-1440x900.png
artifacts/experience-demo/solera-heat1-furnace-journey-1440x900.png
artifacts/experience-demo/solera-heat1-soft-sensor-1440x900.png
artifacts/experience-demo/solera-heat1-investigation-1440x900.png
artifacts/experience-demo/solera-heat1-release-1440x900.png
```
