# Solera Agent Gallery — Phase 1 Concept Experiences

Status: interactive markup on `feature/agent-gallery-concept-demos`

## Purpose

Agent Gallery 展示 Solera 不只是一個 LOOP-1 root-cause application，而是可以
共用 industrial data、Evidence、policy 與 evaluation primitives，承載多種
Agent archetypes 的平台。

Phase 1 包含：

- LOOP-1：Live backend Agent
- LOOP-2：Interactive synthetic concept
- LOOP-3：Interactive synthetic concept
- LOOP-4：Interactive synthetic concept

## Shared platform story

每張 Agent 卡共同使用六個 platform layers：

1. Data Hub：identity、time-series、quality
2. Pulse：freshness、drift、health
3. Thread：Asset、Tag、SOP、Case
4. Skills：tools、models、calculations
5. Evidence：lineage、version、audit
6. Policy：read-only、safe-decline、approval

這些 layers 是平台敘事；LOOP-2～4 目前沒有各自的 backend services。

## LOOP-1 — Live Causal Investigation

LOOP-1 保留現有 API、Data Hub、Scenario Engine、NDJSON execution trace、
Evidence、Case Console 與 approval request。

Gallery 的 **Open Live Agent** 進入原本的 LOOP-1 Experience；使用
**Back to Agent Gallery** 返回 portfolio。

## LOOP-2 — Regenerator Afterburn Guard

Agent archetype: Dynamic Risk Soft Sensor

Concept 展示：

- FCC regenerator dilute/dense thermal profile
- dynamic operating envelope
- afterburn risk forecast
- CO → CO₂ shift 與 air-distribution factors
- 六步 structured trace
- Evidence package
- draft-only human review

Markup 不包含：

- validated FCC process model
- safety probability
- real plant operating limits
- air/slide-valve/catalyst-circulation control

## LOOP-3 — Catalyst Activity & Run-length

Agent archetype: Predictive Lifecycle Agent

Concept 展示：

- feed-normalized catalyst activity
- deactivation slope
- projected run-length range
- WABT、reactor ΔP、feed sulfur、H₂ context
- Historian／LIMS Evidence
- planning draft

Markup 不包含：

- validated catalyst kinetics
- actual remaining-life guarantee
- customer feed/catalyst calibration
- automatic severity or reactor-temperature changes

## LOOP-4 — Water Quality Soft Sensor

Agent archetype: Quality & Compliance Agent

Concept 展示：

- multi-rate sensor fusion
- predicted COD with uncertainty
- delayed official lab reconciliation
- upstream contributor ranking
- excursion risk horizon
- confirmatory-sampling draft

Markup 不包含：

- regulatory compliance determination
- official lab result replacement
- validated customer model
- automatic chemical dosing

## Interaction flow

```text
Sidecar Canvas
→ Open Agent Gallery
→ choose Agent
→ Run Concept
→ structured trace
→ result and metrics
→ contributing factors
→ Evidence
→ draft-only next step
→ Back to Gallery
```

Concept runs are deterministic frontend state transitions. They do not call the
LOOP-1 investigation API and do not create external records.

## Required disclosure

Gallery：

```text
LOOP-1 LIVE · LOOP-2–4 SYNTHETIC CONCEPTS
```

Concept Agent：

```text
SYNTHETIC CONCEPT · NOT FOR OPERATIONS
```

Permitted pitch：

> LOOP-1 是目前 live validated Agent；LOOP-2～4 是可互動產品藍圖，用來展示
> 同一平台如何承載 risk、lifecycle 與 Soft Sensor Agent。

Forbidden pitch：

> LOOP-2～4 已經是 production models、已在客戶工廠驗證，或可以提供操作／
> safety／compliance 決策。

## Phase 2

使用相同 Agent Gallery contract 增加：

- FASTEN-1：precision machining／tool wear／dimension drift／scrap
- HEAT-1：heat-treatment quality／hardness／case depth／distortion

Phase 2 不應複製 Gallery shell；只新增 Agent definitions、concept datasets、
domain-specific visualizations 與 tests。

## Verification

Automated checks cover：

- Gallery 顯示 1 Live + 3 Concept Agents
- LOOP-2 Run 依序完成 trace、result、Evidence 與 draft
- Back to Gallery
- Gallery → LOOP-1 live backend routing
- Brave／Chromium MV3 Shadow DOM mount
- Escape cleanly removes overlay

Browser screenshots：

```text
artifacts/experience-demo/solera-agent-gallery-1440x900.png
artifacts/experience-demo/solera-loop2-afterburn-concept-1440x900.png
```
