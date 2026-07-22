# LOOP-1 Demo 機制、工廠對應與產品演進

Purpose: 清楚區分目前已實作的 deterministic Demo、Demo shortcuts、
真實工廠流程，以及下一階段 dynamic Agent 的產品方向。

## 1. 先說結論

目前 LOOP-1 是：

- deterministic synthetic process replay
- 三個已驗證的 bounded demo cases
- read-only tools
- 固定的 `Loop1Investigator` pipeline
- 可稽核的 execution trace
- Evidence、Top-3 hypotheses、safe-decline 與 draft approval backend

目前 LOOP-1 不是：

- 使用 LLM 自由規劃 root-cause investigation
- 任意自然語言 fault generator
- 真實化工 Digital Twin
- 自動產生官方 plant alarms
- 自動控制 DCS／PLC／SIS
- 已驗證所有工業故障的通用 root-cause system

Sidecar 的一般 page-context Chat 可以使用 OpenRouter model；LOOP-1
root-cause flow 本身目前不使用任何 LLM。

## 2. Tick 到底是什麼

`tick` 是 synthetic scenario 的離散時間步。

目前 manifest 設定：

```text
tick_seconds = 1
starts_at = 2026-01-01T00:00:00Z
seed = 1701
```

因此：

- tick 0 = 模擬開始，尚無 observations
- tick 10 = 模擬時間 00:00:10，只有 10 筆 history
- tick 60 = 模擬時間 00:01:00，正常且有足夠 history
- tick 120 = 模擬時間 00:02:00，valve-stiction fault 開始
- tick 145 = thermal response 開始明顯形成
- tick 170 = downstream response 開始形成
- tick 180 = 第一筆 synthetic alarm 產生
- tick 180–197 = 18 筆 alarms 依序產生
- tick 220 = 模擬時間 00:03:40，Hero investigation 的完整展示點
- tick 360 之後 = recovery ramp 開始

tick 不是實際工廠必須採用的時間單位，也不是「到這一秒一定故障」的產品規則。
它只是 LOOP-1 replay clock。真實系統使用 source timestamps、event windows
與 Historian time range。

## 3. 為什麼 normal 選 tick 60

tick 60 不是特殊事件，而是刻意選擇的 clean baseline：

- fault 尚未在 tick 120 注入
- 每個 Tag 已有 60 筆 observation
- 超過 Agent quality gate 所需的 20 筆 history
- Pulse healthy
- 沒有 alarm flood
- Agent 應回 `no-abnormality`
- 不應建立 Action draft

它的用途是讓每次 Demo 都從相同、可預期的正常狀態開始。

## 4. Reset 與 normal 不一樣

### Reset

Experience 的 **Reset**：

- 回到 tick 0
- 清除目前 run 的 observations 與 alarms
- Pulse 暫時 degraded
- 因為沒有 history，立即 Investigate 會 safe-decline

### `npm run demo:loop1:normal`

`normal`：

- 先 reset
- 再 deterministic replay 到 tick 60
- 建立 60 筆／Tag 的正常 history
- Pulse healthy
- 執行正常狀態 acceptance checks

因此 Reset 不能取代 `normal`。

若不想回 Terminal，可以在 Case Console 選 **正常製程基準**，
再按 **Start Investigation**；它會 replay 到 tick 60 並調查。但正式 Demo
前仍建議用 `npm run demo:loop1:normal`，因為它同時做 acceptance checks。

`feature/loop1-agent-clarity` 新增 **Normal baseline**，可直接 replay 到
tick 60；它方便演練，但不包含 Terminal script 的 acceptance checks。

## 5. 1x、5x、10x、Play 與 Pause

這些 controls 操作的是 synthetic replay，不是 plant control。

- 1x：每 1 秒 wall-clock 推進 1 tick，也就是 1 秒 synthetic time
- 5x：每 1 秒推進 5 ticks
- 10x：每 1 秒推進 10 ticks
- Play：frontend 每秒送出 step request
- Pause：停止 frontend 自動送 step request

目前 Play/Pause 沒有操作真實設備，也不代表工廠 process 被暫停。
UI 應改用更清楚的名稱，例如 **Replay Play / Replay Pause**。

適合使用 1x／5x／10x 的情境：

- 工程師 deep-dive，需要觀察 fault 如何逐步傳到下游
- 想在 tick 120 後停下，逐段看 command、position、flow、temperature
- 想解釋 alarm 從 tick 180 開始形成

10 分鐘 Investor Demo 不需要使用；直接用 **Run Hero scenario** 比較穩定。

## 6. Jump to fault、Run Hero、Investigate 與 Start Investigation

### Jump to fault

**Jump to fault**：

- reset current run
- replay 到第一個 fault injection tick，也就是 tick 120
- 這時 fault 剛開始，下游 response 與 alarms 尚未完整形成
- 接著可選 1x／5x／10x 並 Play，觀察 propagation

適用：

- Process engineer deep-dive
- 解釋因果先後順序

不適用：

- 主要 10 分鐘 Investor Demo；步驟較多且容易超時

### Run Hero scenario

**Run Hero scenario** 是 presenter shortcut：

- 強制選 Hero case
- deterministic replay 到 tick 220
- 執行 investigation stream
- 顯示 plan、tools、Evidence、hypotheses、safety 與 complete trace

它不是實際工廠會出現的按鈕語意。

真實工廠對應是：

- process 持續運行
- DCS／SCADA／Historian 產生 observations 與 alarms
- event trigger、operator request 或 schedule 建立 investigation window
- Agent 對該 live/historical window 執行調查

因此 Demo 時應說：

> Run Hero 是把一段已知且可重播的 incident window 快速載入，
> 讓我們不用在會議中等待真實故障發生。

### Investigate

右側 **Investigate**：

- 不改變 tick
- 不 replay 到預設 case
- 直接調查目前 snapshot 與 history

適用：

- 手動 Play 到某個時間點後，檢查「現在 Agent 看見什麼」
- 工程 deep-dive

主要 Demo 已用 Run Hero 時，不需要再點。

### Start Investigation

Case Console 的 **Start Investigation**：

- 讀取目前選擇的 Case
- 使用輸入的 objective 作 audit context
- replay 到該 Case 的 target tick
- 執行同一條 investigation stream

如果 selector 是 Hero，Start Investigation 與 Run Hero 的核心結果相同。

差異：

- Run Hero：固定 Hero 的快速按鈕
- Start Investigation：依 Case selector 與 objective 執行
- Investigate：只調查目前 tick，不改 process state

## 7. 沒有按 Run Hero 會怎樣

Run Hero 不是 fault 存在的必要條件。

如果從 tick 60 按 Play：

- 到 tick 120 時 fault 仍會開始
- 到 tick 180 後 alarms 仍會出現
- 到 tick 220 時仍可按 Investigate 得到 Hero 結果

Run Hero 只是一次完成「replay 到 220 + investigate」的 Demo shortcut。

如果一直停在 tick 60：

- 沒有 fault
- 沒有 alarm flood
- 沒有 Top-3 abnormal hypotheses
- 沒有 Action draft
- Agent 應回 no-abnormality

## 8. Seed 與 deterministic replay

目前 default seed 是：

```text
1701
```

它定義在：

```text
simulators/loop1/loop1_simulator/manifest.py
build_manifest(seed=1701)
```

相同 manifest、seed 與 tick 會產生相同的：

- observations
- deterministic noise
- alarm order
- Evidence
- hypotheses

目前沒有 UI 或 `.env` 可以改 seed。要改 seed 必須建立不同的
`ScenarioManifest`。正式 Investor Demo 不應更改 seed，否則 golden
evaluation 與畫面預期會失去可比性。

未來 Scenario Manager 可以允許具權限的測試人員選 seed，但必須把
manifest version、seed 與 evaluation result 一起保存。

## 9. 為什麼 Case selector 只有三個

目前三個 selectable cases 是驗證三種重要行為，不是完整產品 use-case catalog。

### 正常製程基準，tick 60

驗證：

- Agent 不應虛構異常
- no-abnormality
- 不建立 Action

### FV-101 冷卻閥卡滯，tick 220

驗證：

- fault propagation
- alarm clustering
- Top-3 hypotheses
- SOP／Case retrieval
- Evidence package
- draft-only Action

### 資料不足安全拒答，tick 10

驗證：

- history 少於 20 筆時 safe-decline
- 不排名 root cause
- 不建立 Action

目前沒有 tick 100 的 Case。normal 是 tick 60。

Repo 另有 10 個 historical retrieval cases 與 40 個 golden evaluation cases，
但它們不是 10 個 live selectable process scenarios。

因此目前能誠實宣稱：

> LOOP-1 已驗證正常、Hero abnormal 與 insufficient-data 三個 runtime paths，
> 並有 40 個 offline golden evaluations。

不能宣稱：

> 系統已能動態處理任意工廠故障。

## 10. 未來 Case 應如何對應真實工廠

真實系統的 Case 不應只是固定 tick。它應由下列 context 組成：

- Site／Unit／Asset scope
- live incident 或 historical time window
- source alarms／events
- operator question
- required Tags 與 quality
- applicable SOP／permit／maintenance history
- allowed Skills 與 tools
- approval policy

Case 可以由以下方式建立：

1. Alarm／event trigger 自動建立候選 Case。
2. Operator 從目前畫面點 **Investigate current context**。
3. User 輸入 objective，選 Asset 與 time window。
4. Scheduler 建立 shift／daily review。
5. Reviewed historical incident 轉成 reusable template。

Agent 可以動態提出「建議調查 Case」，但不能自己改寫 authoritative process
data，也不能把未發生的 fault 當成現場事實。

## 11. Objective 現在與未來的差異

目前 objective：

- 會保存到 TraceRepository
- 是 audit context
- 不會改變 fixed deterministic algorithm
- 不會改變 process values 或 fault

所以目前不能說：

> 輸入任何目標，Agent 都會動態重規劃。

目前應說：

> Objective 記錄使用者要驗證的問題；Agent 在已核准的 bounded workflow
> 中執行，結果可回溯到該 objective。

未來 objective 應影響：

- Asset／time-window resolution
- Skill selection
- retrieval query
- Evidence requirements
- output role／depth
- clarification questions

但不能影響：

- source truth
- tool permissions
- tenant boundaries
- quality gates
- approval rules

## 12. Bounded Plan 是什麼

`bounded` 的意思不是「永遠寫死五步」，而是 Agent 的行動空間有明確邊界。

目前五步是固定的：

1. required signal quality gate
2. alarm triage 與 change points
3. SOP／documents／cases retrieval
4. hypothesis ranking 與 counter-Evidence
5. read-only／human-approval boundary

固定的目的：

- 先建立可重播 baseline
- 可以做 golden evaluation
- 避免 Demo 把 LLM 的隨機文字誤當 root-cause logic
- 驗證安全邊界與 Evidence completeness

未來 dynamic planner 可以：

- 依 objective 選擇 Skills
- 重新排列非安全步驟
- 加入 clarification
- 決定要查哪些 approved tools
- 依 evidence gap 再查一次

但仍必須遵守固定 constraints：

- allowlisted tools
- read-only policy
- tenant／Asset／time-range scope
- required quality gates
- numerical authority
- Evidence schema
- approval requirement
- budget／latency limits

因此未來是「dynamic plan inside fixed safety boundaries」，不是 unrestricted
agent autonomy。

## 13. Agent 真正使用哪個 LLM

### LOOP-1 Experience root-cause flow

目前不使用 LLM。

它使用：

```text
Loop1Investigator
→ read-only tools
→ deterministic calculations
→ fixed hypothesis templates
→ structured Evidence
```

同一 Case 每次會得到相同結果與 summary。

### Sidecar general Chat

Sidecar page-context Chat 使用 OpenRouter model selector。Current default 應為：

```text
openai/gpt-5.6-luna
```

模型負責 narrative／page understanding；authoritative numeric analysis 與
Evidence 仍應由 tools 提供。

### 未來 hybrid Agent

LLM 可以負責：

- intent understanding
- clarification
- plan proposal
- Skill routing
- narrative synthesis
- role-specific explanation

Deterministic services 保留：

- numerical calculations
- data quality
- source timestamps
- alarm state
- Evidence lineage
- policy／approval

每次 trace 應保存 model ID、prompt version、Skill version 與 tool results。

## 14. 為什麼不應顯示 raw chain-of-thought

目前 LOOP-1 沒有 LLM chain-of-thought 可以顯示。

未來即使使用 LLM，也不建議顯示 raw chain-of-thought：

- 可能包含不穩定或錯誤的內部推理
- 可能洩漏 prompt、policy 或敏感 context
- 不等於可驗證 Evidence
- 會讓使用者把流暢文字誤認為事實

建議的 UI 是可 collapse 的 **Agent Rationale / Decision Log**，不是
`chain-of-thought`。內容包含：

- Goal：這次要驗證什麼
- Plan：選了哪些 Skills，為什麼
- Observations：取得哪些 bounded facts
- Hypotheses：哪些被支持、哪些被反證
- Data gaps：缺少什麼
- Policy gates：哪些動作被限制
- Decision summary：為什麼提出這個下一步

灰色、可展開／收合的 visual design 是好想法；資料必須來自 structured
trace fields，而不是要求模型輸出私密思考全文。

權限可以限制：

- trace depth
- raw source visibility
- Evidence payload
- prompt／model metadata
- approval audit

但不應把 raw chain-of-thought 當成 privileged product feature。

## 15. Hero root-cause 的人話版本

技術版：

> 冷卻閥指令與實際位置不一致，之後才出現流量下降與延遲的反應器／下游偏移。

人話版：

> 系統叫冷卻閥多開一點，但現場回授顯示閥門沒有跟上，所以冷卻水變少，
> 反應器之後才變熱。最像是閥門卡住，但仍要由現場人員確認。

更短的 Investor 版：

> 控制器有下命令，閥門沒跟上；冷卻不足後，製程才開始偏移。

## 16. Timeline 現在顯示什麼

目前 Timeline 顯示的是 synthetic source alarms：

- alarms 由 Scenario Engine 產生
- 不是 Agent 生成
- Agent 使用 `cluster_alarms` 將相同 causeEventId 的 alarms 組成 cluster
- Agent 使用 signal history 找 change points

目前 UI 缺口：

- Timeline 只畫 alarms
- 沒有同時畫 command、position、flow、temperature 的 signal lanes
- 因此畫面不能完整支持「command → position → flow → thermal」講解

這個缺口應修正為 **Causal Signal Timeline**：

1. Command lane
2. Position lane
3. Flow lane
4. Reactor temperature lane
5. Alarm lane
6. Fault／change-point markers

這樣 presenter 才能在同一畫面指出先後順序。

## 17. 真實工廠的 alarms 由誰產生

真實 official alarms 應來自：

- DCS
- SCADA
- PLC／SIS event logs
- Historian／alarm server

Agent 不應偽造或修改 official alarms。

Agent 可以另外建立：

- derived anomaly
- advisory event
- correlated incident
- suspected cause

但必須明確標示為 Agent-derived，與 source alarm 分開。

如果現場沒有 alarm，Agent 仍可以由 approved anomaly detector 或 operator
question 啟動 investigation；它不能把 anomaly 假裝成官方 alarm。

## 18. Investigation summary 是不是 LLM 產生

目前不是。

Hero summary、Top-3 titles、reasoning summaries 與 confidence rules 都由
deterministic code 產生。同一 seed／tick／Evidence 會得到相同結果。

它的價值是：

- Demo 可重播
- golden test 可驗證
- 不會因 model temperature 改變 root cause

它的限制是：

- 只能處理已實作的 pattern
- 不能代表通用 root-cause intelligence

未來 LLM 可以把 structured result 轉為不同角色的說明，但不能改寫
deterministic evidence truth。

## 19. 「不是安全判定」的人話

人話版：

> Agent 認為最像閥門卡住，但這句話不能直接拿來開關閥、改 setpoint，
> 也不能取代操作員、SOP、permit 或 safety system。

`not a safety determination` 的意思：

- 不是 SIS decision
- 不是 HAZOP／LOPA conclusion
- 不是 permit approval
- 不是設備 isolation instruction
- 不是「目前安全，可以操作」的保證

root-cause hypothesis 與 safety authority 是兩件不同的事。

## 20. 如何讓工程師看見 Tag、Alarm、SOP、Case 與 Evidence

目前可以這樣走：

1. **單元**
   看中文 Tag name、原始 Tag ID、value、unit。

2. **時間軸**
   看 alarm timestamp、priority、asset ID、tag ID 與 cause link。

3. **調查**
   看 Top-3、supporting Evidence count、counter-Evidence count。

4. **證據**
   看 Evidence claim、source ID、value、SOP revision、similar cases、
   Skill trace。

目前缺口：

- hypothesis 的 Evidence count 不能直接 click
- Evidence card 沒有完整展開 lineage
- Asset／Tag／Alarm／Document／Case 關係沒有 graph／thread explorer
- 工程師無法在一個畫面完成「結論 → source」drill-down

下一版應支援：

- click hypothesis → highlight evidence refs
- click Evidence → 顯示 source timestamp、quality、formula、inputs
- click Tag → 開 signal trend
- click SOP → 顯示 revision／section／URI
- click Case → 顯示 similarity reason 與 outcome

## 21. read-only、safe-decline、human approval 如何實作

### Read-only

目前：

- LOOP-1 tools 只 query／calculate／retrieve／draft
- 沒有 DCS／PLC／SIS control tools
- 不寫 PI、MES、CMMS 或 ERP
- Action 只是一份 draft

### Safe-decline

目前 quality gate 檢查七個 critical Tags：

- current value 是否存在
- quality 是否 good
- history 是否至少 20 筆

任何必要條件失敗：

- status = `safe-decline`
- hypotheses = empty
- actionDraft = null
- trace 顯示 safety boundary

### Human approval

目前 backend：

- engineer／operator／supervisor／admin 才能 request
- operator／supervisor／admin 才能 decide
- approval 保存於 Data Hub
- audit event 保存 actor、outcome、trace、resource
- approved 後仍不 dispatch 外部 work order

目前 UI 缺口：

- 只有 Request approval button
- 沒有 approval inbox／decision screen
- 沒有清楚展示 role、status 與 audit history

因此可以宣稱 backend 有 human-approval contract 與 audit；不能讓觀眾誤以為
完整 CMMS approval workflow 已完成。

## 22. 是否應新增 Data Hub／Data Service／Thread 畫面

應該，而且會讓產品故事更完整。但不建議做一個假的「可設定」畫面，
讓觀眾誤以為寫入與 governance 已完成。

建議新增 backend-bound **Data Hub & Thread Explorer**：

### Data Sources

- Synthetic PI connector
- freshness／lag／quality
- source disclosure
- optional connectors 與 gate status

### Asset Hierarchy

- Site → Area → Unit → Equipment → Component
- 10 Assets
- aliases 與 equipment class

### Tag Catalog

- 60 Tags
- original ID
- PI alias
- unit／cadence／limits
- latest quality

### Thread Explorer

選 FV-101 後顯示：

- linked Tags
- alarms
- SOP／manual／MOC
- historical Cases
- current Evidence
- Action draft／approval state

### Configuration Provenance

- manifest version
- seed
- scenario ID
- synthetic disclosure
- created／updated source

第一版應 read-only，標示：

> LOOP-1 data foundation configured from versioned synthetic manifest.

未來經權限控制才加入：

- alias mapping editor
- connector onboarding
- data-quality rules
- document linking
- case-template authoring
- review／publish workflow

## 23. 建議的 clarity 開發順序

### Priority 1：Demo truth clarity

- Luna 一次性 settings migration
- Replay controls 說明與 tooltips
- Reset 與 Prepare Normal 分開
- Run Hero 標示為 Demo replay shortcut
- Current tick 對應 simulation time 說明

Status: 已在 `feature/loop1-agent-clarity` 實作。

### Priority 2：Causal explanation

- Causal Signal Timeline
- change-point markers
- alarm overlay
- command／position mismatch annotation

### Priority 3：Evidence drill-down

- Hypothesis → Evidence refs
- Evidence lineage drawer
- source／quality／formula／inputs

### Priority 4：Agent Rationale

- collapsible Goal／Plan／Observations／Hypotheses／Gaps／Policy
- role-controlled detail
- model／prompt／Skill version metadata
- 不顯示 raw chain-of-thought

### Priority 5：Data Hub & Thread Explorer

- Asset tree
- Tag catalog
- source health
- linked alarms／documents／cases／Evidence／Action

### Priority 6：Approval Experience

- request status
- role boundary
- approve／reject
- rationale
- audit timeline
- external dispatch 仍保持 disabled

## 24. 10 分鐘 Demo 建議使用哪些 controls

主流程：

1. `npm run demo:loop1:normal`
2. Open LOOP-1 Experience
3. 看正常 Unit
4. 打開 Investigation／Case Console
5. 點 Run Hero scenario
6. 看 execution trace
7. 看 Timeline
8. 回 Investigation 看 Top-3
9. 看 Evidence
10. 指出 Request approval，但 viewer flow 不點

主流程不要使用：

- Reset
- Play／Pause
- 1x／5x／10x
- Jump to fault
- Investigate
- normal／safe-decline Start Investigation

可選 appendix：

- safe-decline：最能證明 trust boundary
- Jump to fault + 5x：給 process engineer 看 propagation
- approval：使用 engineer token 的第二輪 Demo

## 25. 最安全的對外說法

可以說：

> 現在已完成可重播的 synthetic industrial Agent validation loop；
> 三個 runtime paths 與 40 個 offline golden cases 可驗證。

不應說：

> 現在已經是能動態處理所有工廠故障的 autonomous Agent。

可以說：

> 下一階段會把固定 pipeline 演進成 policy-bounded dynamic planning，
> 同時保留 deterministic numerical authority、Evidence 與 approval。

不應說：

> LLM 已經自行規劃並證明這次 root cause。
