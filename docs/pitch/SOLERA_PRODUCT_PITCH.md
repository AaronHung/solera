# Solera Product, Presales, and Investor Pitch

Status: Sales-enablement narrative aligned to the v0.1 and LOOP-1 contracts
Audience: Customers, partners, presales, executives, and investors

## 1. One-line positioning

> Solera is an Evidence-first Industrial Agent Platform that turns fragmented
> operational data into traceable, human-approved decisions without changing
> the customer's control systems.

Traditional Chinese：

> Solera 是 Evidence-first Industrial Agent Platform（證據優先的工業 Agent
> 平台），把分散的工業資料轉化成可追溯、可核准的決策，同時不改動客戶的控制系統。

## 2. Thirty-second pitch

Industrial companies do not lack data. They have Historian, SCADA, MES, ERP,
CMMS, alarms, SOPs, work orders, and shift logs. The problem is that, when an
abnormal event occurs, engineers still have to search across those systems and
manually reconstruct what happened.

Solera places a read-only Agent beside the systems customers already use. It
links telemetry, alarms, Assets, procedures, maintenance history, and past
cases into an Evidence-backed investigation. It identifies the earliest
change, compares bounded hypotheses, retrieves the correct procedure revision,
and creates a human-approved draft action.

Solera is not another dashboard and it is not ChatGPT connected directly to a
plant. It is the governed context, Evidence, and approval layer between
industrial data and human decisions.

## 3. Customer pitch

各位，今天的工廠其實不缺資料。

我們有 Historian、SCADA、MES、ERP、CMMS、SOP、警報紀錄和維修工單。真正的問題
是：當異常發生時，這些資料彼此分散，操作人員必須在不同畫面、文件和系統之間搜尋，
再依靠個人經驗拼湊真相。

這讓企業付出四種成本：

1. downtime、off-spec、scrap 與 energy loss
2. 工程師找資料、查 SOP、比對案例的時間
3. 資深人員經驗無法被保存的知識流失
4. 一般 AI 回答無法追溯、資料品質不明與產生不安全建議的風險

Solera 就是為了解決這個問題而生。

Solera 不是另一個 dashboard，也不是把 ChatGPT 直接接到工廠資料庫。Solera
是一套 Evidence-first Industrial Agent Platform。它把即時時序資料、警報、
Asset hierarchy、SOP、P&ID、維修歷史、工單與過往事件，組成可理解、可追溯、
可驗證的 industrial context。

當異常發生時，Solera 不只是告訴你「溫度升高了」。它會回答：

- 哪一個訊號最先發生變化？
- Controller command 與實際 equipment response 是否一致？
- 十八個 alarms 是十八個問題，還是同一個 causal event 的 downstream symptoms？
- 哪些 root-cause hypotheses 有 Evidence 支持？
- 哪些 Evidence 與目前判斷矛盾？
- 應該參考哪一版 SOP？
- 過去是否發生過類似案例？
- 下一步能準備什麼 inspection draft，並交由誰核准？

Solera 可以很聰明，但不會失去工業系統需要的邊界。它以 read-only tools 取得
context；數值由 deterministic analytics 計算；資料不足時 safe-decline；
Action 必須由人核准。它不改 setpoint、不控制 PLC/DCS/SIS，也不把模型回答當成
safety authority。

我們的目標不是取代 operator，而是讓 operator、engineer 和 manager 面對複雜
異常時，看見同一套事實、更快取得 context，並做出更有信心的決策。

## 4. What customers buy

Customers do not need to buy a different platform for each use case. They buy
one governed industrial intelligence foundation:

### Solera Data Hub

Stable Asset/Tag identity, aliases, units, event time, quality, lineage,
documents, cases, and approval records.

### Solera Pulse

Freshness, connector health, lag, and good/bad/questionable/missing quality.

### Solera Thread

Typed relationships between Assets, Tags, alarms, documents, cases, Evidence,
and actions.

### Bounded Skills

Alarm Triage, Process Context, Procedure & Safety, Case Retrieval, Asset
Integrity, and Shift Handover through governed read-only tools.

### Sidecar and Experience

Page-aware assistance and validated visual workspaces beside existing PI
Vision, SCADA, MES, ERP, and browser-based enterprise systems.

### Evidence and Action Rail

Traceable signal/calculation/document/case Evidence and human-approved,
draft-only actions.

## 5. Customer outcomes

Solera is designed to improve:

- time-to-context after an abnormal event
- alarm-triage and investigation workload
- SOP and historical-case retrieval
- cross-functional alignment between Operations, Engineering, Maintenance, QA,
  and IT
- safe-decline behavior under poor data quality
- retention and reuse of industrial knowledge
- auditability of AI-assisted decisions

Customer business outcomes such as downtime, yield, scrap, energy, maintenance,
and safety require a customer baseline and domain review. Synthetic results are
not customer ROI evidence.

## 6. Cost categories Solera can address

### Investigation labor

```text
incidents/year
× minutes saved/incident
÷ 60
× fully-loaded hourly cost
```

### Downtime exposure

```text
qualifying incidents/year
× hours identified earlier
× contribution margin/hour
× customer-approved confidence factor
```

### Scrap or off-spec exposure

```text
affected production volume
× scrap/off-spec unit cost
× attributable improvement
```

### Energy exposure

```text
load-normalized avoidable kWh
× approved tariff
+ verified demand-charge reduction
```

### Knowledge and compliance

Measured through search time, review time, revision errors, repeated
investigations, unresolved handovers, and audit findings before monetization.

Benefits must be de-duplicated before aggregation.

## 7. Initial Pilot value targets

These are proposed targets to agree with a customer, not achieved customer
results:

- reduce median time-to-context by 30%
- reduce SOP/case retrieval time by 50%
- achieve Top-3 expert agreement of at least 80%
- maintain Evidence completeness of at least 95%
- maintain unsafe/unsupported action rate of 0%
- achieve poor-quality-data safe-decline recall of at least 95%
- achieve operator usefulness rating of at least 4/5

## 8. Use-case portfolio

The same platform supports multiple workflows:

1. Continuous-process abnormal-situation investigation
2. Rotating-equipment reliability
3. Batch-quality deviation and genealogy
4. Machine/quality/scrap root-cause investigation
5. Utility energy and capacity investigation
6. Shift handover and industrial knowledge memory

See `docs/pitch/SOLERA_CUSTOMER_USE_CASES.md` for customer stories, data needs,
Agent flows, value metrics, and maturity.

Only LOOP-1 continuous-process investigation is currently implemented as a
live synthetic vertical slice. The other scenarios are Pilot templates, not
completed production applications.

## 9. Why now

Three changes make this category possible:

1. Industrial systems expose more usable read-only APIs and browser surfaces.
2. Foundation models can interpret mixed operational context, but need governed
   tools, Evidence, and data-quality controls.
3. Manufacturers need measurable AI outcomes without allowing autonomous plant
   control or replacing existing systems.

The opportunity is not to replace Historian, SCADA, MES, ERP, or CMMS. It is to
create the decision layer across them.

## 10. Competitive differentiation

### Versus dashboards

Dashboards show metrics. Solera assembles an investigation, compares
hypotheses, retrieves procedures/cases, and preserves Evidence.

### Versus generic copilots

Generic copilots can summarize text but usually lack stable industrial
identity, event-time semantics, quality gates, deterministic calculations,
procedure revisions, and safe Action boundaries.

### Versus point predictive-maintenance products

Solera is not limited to one equipment model. It provides a reusable
Data/Identity/Evidence/Skills layer across operations, reliability, quality,
energy, and knowledge workflows.

### Versus large Digital Twin programs

Solera can start with a bounded read-only workflow and 20–50 Tags. It does not
require the customer to model the entire plant before showing value.

## 11. Defensibility and product moat

The defensible asset is not a single prompt or model:

- governed industrial identity and alias graph
- versioned scenario and golden-case evaluation system
- Evidence lineage and human-approval records
- reusable bounded Skills and Tool Manifests
- customer-specific case memory
- cross-system context assembled under tenant and data policy
- deployment knowledge for browser Sidecar and future on-prem Bridge

As more reviewed cases are captured, Solera improves retrieval, evaluation,
workflow fit, and customer-specific context without treating unreviewed model
output as truth.

## 12. Go-to-market

### Land

Start with one read-only problem:

- one process unit or equipment family
- 20–50 Tags
- 3–5 governed documents
- 10–20 historical incidents
- one measurable operational decision

### Prove

Replay historical cases, compare with expert labels, and measure
time-to-context, retrieval, Top-k agreement, Evidence completeness, safe
decline, and operator usefulness.

### Expand

Add Assets, connectors, documents, Skills, user groups, and adjacent use cases
on the same Data Hub/Pulse/Thread foundation.

### Productize

Harden OIDC, tenancy, deployment, retention, observability, connector
permissions, model policy, and customer-specific acceptance gates.

## 13. Proposed commercial model

Commercial terms are not yet a committed product contract. A practical model
to validate is:

- paid discovery/data-readiness workshop
- fixed-scope read-only Pilot
- annual platform subscription by Site or operational scope
- connector and deployment package
- optional governed Skill/use-case modules
- enterprise support and private deployment

Pricing should be tested against measurable customer value and implementation
cost before publication.

## 14. Investor pitch

Industrial companies have invested billions in systems that store data, but
the last mile from data to trusted action is still manual. During an abnormal
event, experts switch between Historian, SCADA, MES, ERP, CMMS, documents, and
people to reconstruct context.

Solera is building the Evidence-first Agent layer for industrial operations.
Instead of replacing systems of record, Solera connects to them read-only,
normalizes Asset and Tag identity, verifies freshness and quality, assembles
causal context, retrieves governed knowledge, and produces human-approved
draft actions.

This creates a horizontal platform with vertical use-case modules. The same
Data Hub, Pulse, Thread, Evidence, policy, and approval foundation can support
abnormal-situation management, reliability, quality, energy, and shift
knowledge.

The initial wedge is a bounded read-only investigation where value can be
measured in time-to-context, engineering workload, off-spec exposure, and
repeat-event recognition. Expansion comes from additional Assets, data
sources, Skills, and reviewed case memory within the same customer.

The moat is the governed industrial context and evaluation layer, not access to
one foundation model. Solera can change models while preserving identity,
tools, Evidence, policies, approvals, and customer-specific case knowledge.

## 15. Current proof

LOOP-1 currently demonstrates:

- deterministic synthetic chemical-process replay
- 10 linked Assets and 60 Tags
- fault injection and causal alarm propagation
- 18-alarm Hero event
- Pulse freshness and quality
- six bounded read-only Skills
- Top-3 hypotheses with supporting/counter Evidence
- SOP, P&ID, MOC, maintenance, shift-log, and case retrieval
- draft-only human approval
- backend-driven Sidecar Experience
- 40 versioned golden cases

Verified local results:

- 40/40 golden cases passed
- replay determinism `1.0`
- Top-3 truth hit rate `1.0`
- safe-decline accuracy `1.0`
- document retrieval `1.0`
- Evidence completeness `1.0`
- unsupported-claim rate `0.0`
- 46 Python tests, 25 TypeScript tests, and Brave MV3 E2E passed

These are synthetic capability results, not proof of customer production
savings or real-plant diagnostic accuracy.

## 16. Claims boundary

Solera may claim:

- deterministic and replayable synthetic validation
- shared backend truth for telemetry, Agent, Evidence, and Experience
- bounded read-only Skills and safe decline
- traceable Asset/Tag/SOP/Case relationships
- human-approved draft actions
- explicit KPI formulas and assumptions

Solera may not yet claim:

- validated customer-plant physics
- certified Digital Twin or safety system
- autonomous control
- production root-cause, PdM, RUL, quality, or energy accuracy
- actual avoided incidents, downtime, scrap, emissions, or energy cost
- completed customer deployment without external acceptance evidence

## 17. Call to action

> Give us one recurring operational problem, one process owner, 20–50 Tags,
> 3–5 approved documents, and 10–20 reviewed historical cases. We will build a
> read-only golden evaluation and show, with your reviewers and your baseline,
> whether Solera reduces time-to-context without weakening your control or
> safety boundaries.

## 18. Closing line

> From fragmented industrial data to evidence-backed action.

Traditional Chinese：

> 把分散的工業資料，轉化成可驗證、可核准、可持續學習的行動智慧。
