# FASTEN-1 Concept Experience

Status: interactive deterministic markup on
`feature/fasten1-concept-experience`

## Positioning

FASTEN-1 is not a quotation Bot and not a single anomaly dashboard.

It is an `RFQ-to-First-Good-Part` engineering workflow:

> 從一張客戶圖面，到第一顆合格螺絲，FASTEN-1 把散落在 Email、圖面、
> ERP、MES、QMS、老機台與老師傅經驗中的資訊，組成可執行、可追溯且由人
> 核准的工程決策流程。

The concept is based on the fastener-industry workshop blueprint for Kaohsiung
and Gangshan precision-manufacturing suppliers.

## Why it is a separate Gallery

LOOP-1～4 are process-industry Agents whose central visual language is
time-series condition, dynamic risk, investigation, Evidence, and a bounded
next step.

FASTEN-1 begins with a business/engineering document and crosses several time
scales:

- Email and commercial requirements
- engineering drawings and specifications
- historical product cases
- machine, tooling, schedule, and process capability
- second-level Edge signals during a trial
- first-article measurement and quality records

Therefore the Agent Platform has two Gallery routes:

1. Chemical Agents
2. Precision Manufacturing

FASTEN-1 uses a persistent workflow rail and six distinct screens instead of
the LOOP concept dashboard template.

## Six-screen storyboard

### 1. RFQ Inbox

Trigger:

- dedicated synthetic RFQ mailbox
- customer email
- PDF drawing
- customer surface specification
- annual-volume spreadsheet

The screen shows document quarantine, revision/hash context, customer quantity,
target SOP date, and the handoff between:

- RFQ Engineering Agent
- Master Technician Agent
- Quality Evidence Agent

Button:

```text
Accept RFQ & Start Workflow
```

### 2. Drawing Intelligence

The screen renders a synthetic M8 flange-bolt drawing with:

- `AB-102938 Rev C`
- `M8 × 1.25-6g`
- overall length `45.0 +0 / −0.3 mm`
- flange diameter `Ø18.0 ±0.15 mm`
- `SCM435`
- `HRC 32–39`
- Zn-Ni `8–12 μm / 720 h`

`Analyze Drawing` deterministically reveals:

- seven verified specification fields
- parser/source attribution
- confidence
- one missing friction/torque requirement
- Human Gate A

The drawing communicates the production principle:

> precise dimensions come from vector/CAD/parser output; multimodal LLM output
> is a cross-check, not the sole Source of Truth.

### 3. Similar Product Cases

`Search Similar Products` applies the concept sequence:

```text
hard filters
→ semantic retrieval
→ engineering-weighted ranking
```

It returns three traceable Product IDs with:

- match score
- similarities
- differences
- historical first-pass yield
- scrap
- teacher/engineering lesson

The selected case is `P-008821 / Rev B`, with a 91% bounded match.

### 4. Process, Machine, and Tooling Plan

`Build Manufacturing Plan` reveals:

- six linked process operations
- candidate machines `HDR-04` and `HDR-07`
- machine capability and availability
- new die `DIE-2047`
- tooling lead time
- hydrogen-embrittlement, delivery, and tolerance risks
- Human Gate B

The Agent can only recommend assets returned by deterministic capability,
schedule, maintenance, and tooling tools.

### 5. Trial Run and Master Technician

`Run Synthetic Trial` reveals:

- forming-load feature
- vibration feature
- historical case baseline
- anomaly at synthetic part 128
- a camera candidate for a flange-edge radial crack
- Top-3 inspection hypotheses
- supporting evidence and counter-check order

It does not stop the machine, change speed, or write the PLC.

### 6. First Article Quality Evidence

`Generate First Article Package` reveals:

- drawing-to-measurement comparison
- before/after review values
- six checked characteristics
- Product Thread from RFQ to inspection
- first-article report draft
- customer-clarification email draft
- new Product Case draft
- Human Gate C / final approval

QMS and measurement instruments remain the authority for exact quality
numbers. The Agent explains and packages the result.

## Human approval model

The concept demonstrates L1–L2 actions only:

- L1: read, explain, compare, and recommend
- L2: after approval, create a draft record or notification

Three explicit gates:

1. Gate A — drawing/specification confirmation
2. Gate B — process, machine, tooling, and risk confirmation
3. Gate C — quality package and external/customer response

Not implemented or claimed:

- PLC write/control
- automatic machine stop
- automatic price commitment
- automatic customer email
- official QMS record write
- production CAD parsing
- validated defect model

## Deterministic interaction contract

Each stage has two user actions:

1. run the deterministic concept tools
2. review the revealed result and continue

The workflow does not silently auto-play. Completed stages become navigable,
while future stages remain locked. The progress bar and workflow rail preserve
the current Case state.

## Five-minute presentation route

1. Open `Precision Manufacturing`.
2. Open FASTEN-1 and explain the RFQ trigger.
3. Analyze the drawing; point to verified sources and the missing requirement.
4. Find similar Products; compare the selected historical Case.
5. Build the manufacturing plan; point to `HDR-04`, `DIE-2047`, and Gate B.
6. Run the synthetic trial; show Edge evidence, camera candidate, and the
   teacher-oriented inspection order.
7. Generate the first-article package; show QMS measurements and Product Thread.
8. End on `FASTEN-1 STORY COMPLETE`.

## Required disclosure

```text
SYNTHETIC WORKFLOW · L1–L2 ONLY · NO PLC WRITE
```

Permitted pitch:

> FASTEN-1 is an interactive product blueprint showing how Solera can
> orchestrate RFQ, drawing, historical Case, machine Edge, and quality Evidence
> into a governed workflow.

Forbidden pitch:

> FASTEN-1 is already a production CAD parser, validated quality model, or
> proven factory deployment.

## Verification artifacts

The Browser E2E walks through all six screens and returns to LOOP-1 Live.

Ignored local screenshots:

```text
artifacts/experience-demo/solera-precision-gallery-1440x900.png
artifacts/experience-demo/solera-fasten1-drawing-1440x900.png
artifacts/experience-demo/solera-fasten1-cases-1440x900.png
artifacts/experience-demo/solera-fasten1-planning-1440x900.png
artifacts/experience-demo/solera-fasten1-trial-1440x900.png
artifacts/experience-demo/solera-fasten1-quality-1440x900.png
```
