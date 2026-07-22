# Solera LOOP-1 Demo Playbook

Purpose: 這是所有 LOOP-1 Demo 的單一入口。先依 audience 選路線，再打開對應
runbook。不要把 Handoff、technical acceptance、Value Validation 與客戶講稿
混成一場 Demo。

## 1. 今天第一次 Demo，只做這三件事

1. 依 `LOOP1_INVESTOR_DEMO_REHEARSAL.md` 完成啟動與第一次演練。
2. 正式展示使用 10 分鐘 Core Hero Demo。
3. 只準備一個 appendix：Investor 選 Scoreboard，工廠客戶選 Safe-decline。

不要第一次就同時展示 Data Hub API、Approval API、Browser E2E 與所有
acceptance tests。它們是 technical proof，不是主故事。

## 2. 文件地圖

### 第一次上場

- `LOOP1_DEMO_PLAYBOOK.md`：選 audience、時間與 Demo modules。
- `LOOP1_INVESTOR_DEMO_REHEARSAL.md`：從 Terminal 到逐句 Investor 講稿。

### 正式講稿

- `LOOP1_CUSTOMER_DEMO_10MIN.md`：製造／操作／維修／IT 客戶版。
- `LOOP1_INVESTOR_DEMO_REHEARSAL.md`：Investor／策略夥伴版。

兩份文件使用同一個 Core Hero runtime flow，不是兩套不同產品 Demo。

### 技術準備與驗收

- `LOOP1_HANDOFF_AND_TEST.md`：安裝、build、preflight、acceptance、handoff。
- `LOOP1_DEMO_SOP.md`：工程師版 replay、API、E2E、troubleshooting。

### 架構與可信度

- `../architecture/LOOP1_DEMO_MECHANICS_AND_PRODUCT_EVOLUTION.md`：
  tick、seed、controls、Cases、Agent／LLM 邊界與產品演進。
- `../architecture/LOOP1_DATA_HUB_AGENT_FLOW.md`：
  Data Hub、Pulse、Thread、Flow、Agent pipeline 與 API。
- `../value/LOOP1_VALUE_VALIDATION.md`：
  capability proof、golden evaluation、Pilot KPI、ROI 與 Workshop。

## 3. Demo 能力狀態

### Live UI

可完全在 Experience 中展示：

- Normal baseline
- Hero Case Console 與 live execution trace
- raw alarm Timeline 與 event clustering
- Top-3 hypotheses 與 Evidence counts
- Evidence summary、documents、similar cases、Skill trace
- Safe-decline
- Request approval
- Shadow DOM close／isolation

### UI + API

UI 有摘要，但完整證明需看 API：

- Evidence calculation inputs、formula version、quality、timestamp
- Document section、URI、retrieval version
- Thread edges
- approval decision 與 audit payload
- trace replay metadata

### Terminal／API proof

目前沒有獨立視覺 workspace：

- Data Hub catalog／Asset／Tag registry
- Pulse raw payload
- Thread Explorer
- productization gates
- 40-case golden scoreboard
- deterministic replay checksum
- Browser E2E

### 尚未完成

- Causal Signal Timeline 的 command／position／flow／temperature lanes
- clickable hypothesis → Evidence drill-down
- Data Hub & Thread Explorer UI
- Approval Inbox／Decision UI
- policy-bounded dynamic LLM planning
- arbitrary fault／scenario generation

## 4. Audience 路線

### Investor／策略夥伴：12–15 分鐘

1. Core Hero Demo：10 分鐘。
2. Scoreboard proof：2 分鐘。
3. Safe-decline：有時間才加 2–3 分鐘。

主訊息：

- brownfield read-only wedge
- Evidence-first trust
- repeatable evaluation
- Pilot land-and-expand

不要展示：

- 大段 API JSON
- Play／Pause／Jump controls
- Approval decision API

### 工廠主管／操作／Reliability：15–18 分鐘

1. Core Hero Demo：10 分鐘。
2. Safe-decline：3 分鐘。
3. Browser isolation：1 分鐘。
4. Q&A：剩餘時間。

主訊息：

- alarm burden
- time-to-context
- SOP／case retrieval
- human accountability

### Process／Controls Engineer：18–22 分鐘

1. Core Hero 摘要：8 分鐘。
2. Causal replay：5 分鐘。
3. Evidence API lineage：4 分鐘。
4. Q&A：剩餘時間。

主訊息：

- deterministic signal order
- raw alarms 保留
- calculations versioned
- hypothesis 不是 safety determination

### IT／Data／AI Governance：25–30 分鐘

1. Core Hero 摘要：8 分鐘。
2. Data Hub／Pulse／Thread API：6 分鐘。
3. Safe-decline 與 role boundary：4 分鐘。
4. 40-case evaluation：3 分鐘。
5. Browser isolation／deployment boundary：2 分鐘。
6. Q&A：剩餘時間。

## 5. 每次 Demo 的固定準備

Terminal A：

```bash
cd /Users/aaron/xk8/00_solera
npm run dev:api
```

Terminal A 全程保持運行。

Terminal B：

```bash
cd /Users/aaron/xk8/00_solera
npm run demo:loop1:preflight
npm run demo:loop1:normal
```

兩個 commands 都會自動結束。

只有 extension code 或 Canvas code 改變時才需要：

```bash
npm run build
```

Build 後 Reload browser extension，再 Reload host page。

## 6. Module A — Core Hero Demo

- Duration: 10 分鐘
- Status: Live UI
- Primary guide: `LOOP1_CUSTOMER_DEMO_10MIN.md` 或
`LOOP1_INVESTOR_DEMO_REHEARSAL.md`

流程：

1. Unit normal baseline
2. Investigation／Case Console
3. Run Hero scenario
4. live execution trace
5. Timeline
6. Top-3 hypotheses
7. Evidence
8. approval boundary
9. capability proof
10. next action

`Run Hero scenario` 是 Demo shortcut：replay 到 tick 220 再執行調查。
它不是實際工廠操作。

## 7. Module B — Safe-decline

- Duration: 2–3 分鐘
- Status: Live UI

1. Investigation 選 `資料不足安全拒答 · tick 10`。
2. 保留或輸入調查目標。
3. 點 **Start Investigation**。
4. 指出 required history 不足。
5. 指出沒有 ranked hypotheses。
6. 指出沒有 Action draft。

Talk track：

> Solera 不只要證明會回答，也要證明資料不足時不猜測、不建立 Action。

## 8. Module C — Engineering causal replay

- Duration: 5 分鐘
- Status: Live controls；signal sequence 仍主要由 deterministic summary 解釋

1. 點 **Normal baseline**。
2. 點 **Jump to fault**，到 tick 120。
3. 選 5x。
4. Play 到 tick 180–220。
5. Pause。
6. 點 **Investigate**。

目前 Timeline 顯示 raw alarms 與 clusters，不會同圖呈現完整的
command／position／flow／temperature curves。不要把 current Timeline
說成已完成的 Causal Signal Timeline。

## 9. Module D — Golden evaluation

- Duration: 2–3 分鐘
- Status: Terminal proof

Demo 前先執行：

```bash
npm run eval:loop1 -- --output artifacts/loop1-scoreboard.json
```

現場展示 summary：

- 40/40 synthetic cases passed
- replay determinism `1.0`
- Top-3 truth hit `1.0`
- safe-decline accuracy `1.0`
- Evidence completeness `1.0`
- unsupported-claim rate `0.0`

必須補充：

> 這是 versioned synthetic capability evidence，不是客戶 plant accuracy
> 或已實現 ROI。

## 10. Module E — Data Hub／Pulse／Thread

- Duration: 5–7 分鐘
- Status: Terminal／API proof；尚無 Data Hub UI

先執行：

```bash
npm run demo:loop1:preflight
```

展示：

- 10 Assets
- 60 Tags
- 8 Documents
- 10 historical Cases
- Pulse healthy
- versioned manifest、seed 與 synthetic disclosure

必要時再展示：

```bash
curl -s \
  -H "Authorization: Bearer dev:tenant-demo:demo-user:viewer" \
  http://localhost:8000/v1/loop1/pulse | python -m json.tool
```

```bash
curl -s \
  -H "Authorization: Bearer dev:tenant-demo:demo-user:viewer" \
  http://localhost:8000/v1/loop1/thread/asset/component-cooling-valve \
  | python -m json.tool
```

不要宣稱已經有 Data Hub configuration UI 或 graph explorer。

## 11. Module F — Evidence lineage

- Duration: 3–4 分鐘
- Status: UI summary + API detail

UI 展示：

- Evidence claim
- source ID
- value／unit
- Documents
- Similar Cases
- Skill trace

完整 lineage 目前要從 investigation API／trace payload 查看：

- timestamp／quality
- calculation inputs
- formula version
- document section／URI
- retrieval version

不要在 UI 上假裝可以 click 展開尚未實作的 details。

## 12. Module G — Approval boundary

- Duration: 3–5 分鐘
- Status: Request 可用 UI；decision 需 API

Core Demo 使用 viewer token，只指出按鈕與 boundary。

要加演 request，Demo 前改用：

```text
dev:tenant-demo:demo-engineer:engineer
```

Hero 完成後點 **Request approval**。目前 Experience 會建立 pending
draft；沒有 Approval Inbox。

Decision 只由 operator／supervisor／admin API 執行。即使 approved：

- 不 dispatch CMMS
- 不操作 DCS／PLC／SIS
- 不改 setpoint
- 不 bypass interlock

## 13. Module H — Browser isolation

- Duration: 1 分鐘
- Status: Live UI

1. 在 approved host page 開 Experience。
2. 指出它是 Sidecar overlay。
3. 按 Esc 關閉。
4. 確認 host page 與 controls 未改變。

這是 read-only brownfield integration 的直接視覺證明。

## 14. 不是現場 Demo 的項目

以下屬於 Workshop、Pilot design 或交付程序：

- 90 分鐘 Data-readiness Workshop
- customer baseline 與 KPI agreement
- ROI calculation
- Go／No-Go
- handoff package
- 4–12 週 Pilot follow-up

客戶對核心 Demo 有興趣後，再安排 Workshop；不要在第一次 10 分鐘 Demo
中混入。

## 15. Presenter 最終檢查

會前 30 分鐘：

- API 保持運行
- preflight PASS
- normal tick 60
- extension 已 Reload
- host page 已 Reload
- Sidecar 使用正確 token
- Core Hero 已完整演練一次
- Scoreboard 或 Safe-decline appendix 已選好
- backup screenshot 可用

正式開始時，畫面停在：

```text
Sidecar → Canvas → LOOP-1 工業 Agent 實驗室
```

不要預先執行 Hero。
