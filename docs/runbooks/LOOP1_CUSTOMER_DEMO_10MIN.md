# Solera LOOP-1 客戶 10 分鐘 Demo 腳本

Audience: 製造／操作主管、Process Safety、Maintenance/Reliability、Digital/IT
Demo objective: 證明 Solera 能把 synthetic 時序、警報、Asset、SOP、案例與人工核准串成可重播、可驗證、read-only 的 Agent investigation。

先用 `docs/runbooks/LOOP1_DEMO_PLAYBOOK.md` 決定是否加演 Safe-decline、
causal replay 或 technical proof；本文件只負責 10 分鐘 Core Hero Demo。

LOOP-1 是目前可 live demo 的 continuous-process scenario。若 audience 來自
Reliability、Batch Manufacturing、Discrete Manufacturing、Energy/Facilities
或 Operations Knowledge，先使用
`docs/pitch/SOLERA_CUSTOMER_USE_CASES.md` 將相同平台能力對映到其產業問題；
不要把尚未建立的 LOOP-2/3/4 template 說成已完成。

第一次擔任 presenter，請先完整走一次
`docs/runbooks/LOOP1_INVESTOR_DEMO_REHEARSAL.md`。該文件包含從 Terminal
啟動、browser 點擊、Investor pitch、keywords、Q&A、故障備案到演練評分；
本文件作為熟悉產品後的精簡客戶版 talk track。

## 一句話定位

> Solera 不是再做一個 dashboard；它把工業資料的 identity、freshness、
> alarm/event context、SOP 與案例組成 Evidence-first Agent 工作流，
> 並在資料不足時安全拒答。

## Demo 前固定狀態

在第一個 terminal 啟動 API：

```bash
cd /Users/aaron/xk8/00_solera
npm run dev:api
```

在第二個 terminal 做 preflight 並準備正常狀態：

```bash
cd /Users/aaron/xk8/00_solera
npm run demo:loop1:normal
```

確認 browser 已載入最新 `apps/sidecar-extension/dist`，並重新整理 approved host page。

Sidecar settings：

- API URL: `http://localhost:8000`
- Viewer token: `dev:tenant-demo:demo-user:viewer`
- Approval demo token: `dev:tenant-demo:demo-engineer:engineer`
- Tenant: `tenant-demo`

## 0:00–0:45｜問題與邊界

畫面：Sidecar 的 **Canvas → LOOP-1 Agent Lab**。

Talk track：

> 工廠資料通常分散在 Historian、SCADA、SOP、工單與交班紀錄。一般聊天模型能解釋文字，但很難證明每項工業結論從哪裡來。LOOP-1 用一個 synthetic reactor cooling scenario，展示 Solera 如何建立同一套 Data Hub truth、調查流程與 Evidence。今天展示的是 validation environment，不是真實 plant Digital Twin，也不會下控制命令。

必說邊界：

- 所有數據、文件、案例與 KPI assumptions 都是 synthetic。
- Solera 不寫入 DCS／PLC／SIS／SCADA／PI／MES／CMMS／ERP。
- Action Rail 只建立 draft，不 dispatch 外部工單。

## 0:45–2:00｜Data Hub 與正常狀態

操作：

1. 點 **Open LOOP-1 Experience**。
2. 留在 **Unit**。
3. 指向 Pulse、simulation time、tick 與 quality。
4. 指向 FV-101、R-101、E-101、V-101、K-101、T-101。

Talk track：

> API 啟動時，Solera Flow 會 idempotently seed 10 個 Assets、60 個 Tags、8 份文件、10 個歷史案例與 Thread relationships。Data Hub 是 system of record；Experience 只是 validated renderer，不會自己另造第二套真相。Pulse 顯示 connector health、freshness、lag 與 good／bad／questionable／missing quality。

客戶應看到：

- `合成資料 · 唯讀 · 非安全系統`
- Pulse `healthy`
- Asset／Tag 以繁體中文說明並保留原始工程 ID
- 正常 command-position mismatch 約在小範圍
- 目前沒有 alarm flood

## 2:00–3:00｜選擇 Case 與預覽 Plan

操作：

1. 打開 **Investigation**，指出 Case Console 與調查目標。
2. 選擇 `FV-101 冷卻閥卡滯`，說明五步 Bounded Plan。
3. 點右側 **Run Hero scenario**；它會重播至 tick 220 並立即顯示 live trace。

Talk track：

> 這不是預先錄好的動畫。Case Console 先顯示 bounded plan；啟動後，backend 依實際執行順序串流 context validation、tool start/result、Evidence、hypothesis ranking 與 safety boundary。Hero case 注入 cooling-water valve stiction：Controller command 先上升，但 independent valve position 沒有跟上；接著 cooling-water flow 降低，之後才出現 reactor 與下游偏移。

客戶應看到：

- `query_signals`、`cluster_alarms`、文件與案例查詢的實際 trace。
- 畫面顯示每個 trace event 的 timestamp 與 event type；完整 trace ID 與
  events 保存在 API trace／audit metadata。
- 這是 audit-friendly execution trace，不是私密 chain-of-thought。

不要說：

- 「模型預測閥門壞掉」。
- 「這是真實化工廠物理模型」。

應說：

- 「Agent 在已知 synthetic truth 上接受可重播評估」。
- 「數值與 timing 來自 deterministic scenario engine，不是 LLM 生成」。

## 3:00–4:00｜Alarm Timeline

操作：

1. 打開 **Timeline**。
2. 指向第一個 valve position deviation。
3. 指向 critical alarms 與 event cluster。

Talk track：

> 這裡有 18 個 raw alarms。Solera 不會隱藏 critical alarms；它把共享 causeEventId 的 dependent alarms 組成一個 investigation cluster，幫助操作人員先看 earliest change point，而不是把 18 個 alarms 當成 18 個獨立 root causes。

價值：

- 減少 alarm flood 的認知負擔。
- 保留每個 alarm 與 event time，仍可 audit。
- Agent summary 解釋 command → position → flow → thermal response 的先後
  順序；目前 Timeline 本身只直接顯示 raw alarms 與 clusters。

## 4:00–6:00｜Bounded Agent Investigation

操作：

1. 回到 **Investigation**。
2. 由上往下指出 Case、調查目標、Bounded Plan 與已完成的 live trace。
3. 展示 Top-3 hypotheses；需要時可改選 normal 或 safe-decline 再執行。

Talk track：

> Agent 不是自由猜測，也不是只顯示最後答案。畫面中的 Plan 與 execution trace 對應 backend 的實際 read-only tools。Alarm Triage、Process Context、Procedure & Safety、Case Retrieval、Asset Integrity、Shift Handover 六個 bounded Skills 取得結構化事實。Top-1 是 FV-101 valve stiction；position feedback bias 與 common cooling-water disturbance 仍保留為 alternatives。

指出：

- Top-1 confidence 是 bounded evaluation score，不是 safety probability。
- 每個 hypothesis 有 supporting Evidence 與 counter-Evidence。
- 數值計算在 deterministic analytics 完成，LLM 不作數值 authority。
- required Tag 缺值或 quality 不佳時，結果是 `safe-decline`，不建立 Action draft。

## 6:00–7:30｜Evidence、SOP、Case 與 Thread

操作：

1. 打開 **Evidence**。
2. 展示 signal/calculation Evidence。
3. 展示 `SOP-R101-04 Revision 4`。
4. 展示 similar case 與 Skill trace。

Talk track：

> Solera Thread 把 Tag、Asset、Alarm、Document、Case 與 Action 接到 stable identity。Experience 顯示 Evidence source ID、特定 document revision 與 retrieval score；完整 section、URI、quality、timestamp 與 calculation version 保存在 API payload。這也讓客戶未來能替換為自己的 PI aliases、CMMS equipment number、ERP material number 與 approved SOP。

價值：

- 從「回答」提升為可追查的 investigation package。
- 降低找 SOP、維修史與相似案例所需時間。
- 保留 lineage，方便事後 audit 與 case memory。

## 7:30–8:30｜Action Rail 與人機邊界

操作：

1. Core Demo 使用 viewer token，只指出 **Request approval**，不要點。
2. 說明 engineer 可以建立 pending draft。
3. 若要實際點擊，改用 Playbook 的 Approval appendix，並在 Demo 開始前就
   設定 engineer token；不要在 10 分鐘主流程中途切 token。

Talk track：

> Agent 只提出 inspection work-order draft，附 Evidence references、Asset 與 verification items。Engineer 可以 request；operator、supervisor 或 admin 才能 decide。即使 approved，這一版也不 dispatch 到 CMMS，更不會改 setpoint、開關閥或 bypass interlock。

核心訊息：

> Agent 的價值不是取代操作主管，而是縮短收集 context 的時間，並讓核准者看到相同 Evidence。

## 8:30–9:30｜可驗證價值

Talk track：

> 我們沒有用 synthetic demo 宣稱客戶已節省多少成本。現在能誠實驗證的是 system capability：40 個 golden cases 全部通過；deterministic replay、Top-3 truth、safe decline、SOP retrieval、Evidence completeness 都是 100%，unsupported-claim rate 是 0%。下一步會用客戶 baseline 校準 time-to-context、operator search time、MTTR、off-spec exposure 與 alarm load。

展示依據：

```bash
npm run eval:loop1 -- --output artifacts/loop1-scoreboard.json
```

這個 command 在 Demo 前執行；現場只展示已產生的 summary，不要中斷
10 分鐘主流程等待 evaluation。

目前 local result：

- 40/40 cases passed
- replay determinism: `1.0`
- Top-3 truth hit rate: `1.0`
- safe-decline accuracy: `1.0`
- document retrieval rate: `1.0`
- Evidence completeness: `1.0`
- unsupported-claim rate: `0.0`

## 9:30–10:00｜收斂與 Call to Action

Talk track：

> 今天證明的是：沒有客戶 PI 資料時，我們仍能先把 Agent 方法、Evidence、approval 與 Experience 驗證起來。下一步不是立刻寫進控制系統，而是做一個 read-only discovery：確認一個 process unit、20–50 個 Tags、Asset aliases、3–5 份 SOP、alarm rules 與過去案例，再用相同 golden evaluation 比較 synthetic 與 customer data。

向客戶提出三個 next actions：

1. 指定一個 process owner 與一個 reliability/IT owner。
2. 選一個 read-only use case 與可量測 baseline。
3. 安排 90 分鐘 data-readiness workshop。

## 客戶常見問題

### 這是不是 Digital Twin？

不是。LOOP-1 是 deterministic synthetic Agent validation environment。真實 Digital Twin claim 需要 customer data、domain validation 與 VVUQ。

### 為什麼不直接接 PI？

核心 demo 不依賴 PI，確保可離線重播。取得 isolated namespace、OMF/Point permissions、retention、cleanup 與 rollback proof 後，PI 才能作 optional mirror。

### Agent 是否會操作設備？

不會。Tool Registry 沒有 DCS／PLC／SIS control tools。Approval 也只保存 draft。

### 40/40 是否代表真實 root-cause accuracy 100%？

不代表。它只代表在 versioned synthetic golden dataset 上達標。真實 accuracy 要在 customer-labeled cases 上重新評估。

### Data Hub 與一般 Historian 有何不同？

Historian 保存時序；Solera Data Hub 另外管理 stable identity、aliases、quality、lineage、Alarm/Case/Document links、Agent Evidence 與 approval state。PI 可以是 source 或 mirror，但不是 LOOP-1 唯一 truth。

## 現場備援方案

若 browser extension 無法 mount：

1. 保留 API terminal。
2. 執行 `npm run demo:loop1:hero`。
3. 展示 preflight 輸出的 run state、18 alarms、Top-1 hypothesis、Evidence/SOP counts。
4. 打開 `artifacts/experience-demo/solera-loop1-investigation.png`。
5. 說明錄影／截圖是 backup，不宣稱 live browser integration。

若 API 無法啟動：

1. 使用已產生的 `artifacts/loop1-scoreboard.json`。
2. 展示 handoff package 內的 screenshot、contract 與 value validation。
3. 不假裝 live demo；明確切換為 recorded walkthrough。
