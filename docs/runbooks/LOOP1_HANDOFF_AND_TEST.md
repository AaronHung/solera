# LOOP-1 Demo Handoff 與測試清單

## 1. START HERE

今天上場依序使用：

1. `LOOP1_HANDOFF_AND_TEST.md`：安裝、preflight、驗收。
2. `LOOP1_CUSTOMER_DEMO_10MIN.md`：逐分鐘操作與 talk track。
3. `LOOP1_DATA_HUB_AGENT_FLOW.md`：Data Hub 功能與 Agent flow。
4. `LOOP1_VALUE_VALIDATION.md`：capability proof、customer KPI 與 follow-up。
5. `SOLERA_CUSTOMER_USE_CASES.md`：依產業、buyer 與成本選擇場景。
6. `LOOP1_DEMO_SOP.md`：完整技術操作與 troubleshooting。

## 2. Runtime prerequisites

- macOS
- Node.js 22+
- `uv`
- Brave、Google Chrome 或 Microsoft Edge
- local port `8000`
- 已 clone/unzip 的 Solera source

不需要：

- PI Server
- DWSIM
- Postgres
- external message broker
- OpenRouter key（LOOP-1 deterministic investigation 不依賴外部 LLM）

## 3. 安裝與 build

```bash
cd /Users/aaron/xk8/00_solera
uv sync --frozen
npm install
npm run build
```

確認 `.env` 使用 synthetic core：

```text
SOLERA_LOOP1_ENABLED=true
SOLERA_LOOP1_START_TICK=1
SOLERA_LOOP1_PI_MIRROR_ENABLED=false
SOLERA_LOOP1_DWSIM_OPCUA_ENABLED=false
SOLERA_LOOP1_MULTIMODAL_ENABLED=false
SOLERA_LOOP1_EXTERNAL_EVENT_BUS=in-process
```

不要把 `.env` 放進 handoff zip 或 Git。

## 4. Browser extension 安裝

### Brave

1. 開 `brave://extensions/`。
2. 開啟 **Developer mode**。
3. 點 **Load unpacked**。
4. 選：
   `/Users/aaron/xk8/00_solera/apps/sidecar-extension/dist`
5. Pin **Solera Sidecar**。
6. 開 approved host page。
7. 若剛 rebuild extension，先 reload extension，再 reload host tab 一次。

### Chrome

使用 `chrome://extensions/`，其餘步驟相同。

### Edge

使用 `edge://extensions/`，其餘步驟相同。

## 5. 啟動與 preflight

這裡有兩層操作，請不要把它們當成同一件事：

- `demo:loop1:preflight` 是技術健康檢查，不是客戶 Demo。
- `demo:loop1:normal` 是把 synthetic run 準備到乾淨的正常起點，不是
  Agent 的 case prompt。
- 客戶 Demo 真正從 browser Sidecar 的 **Open LOOP-1 Experience** 開始，
  再用 Experience 裡的 **Run Hero scenario**、**Investigate**、Timeline、
  Evidence 與 Action Rail 展示 investigation。

目前 LOOP-1 Agent Lab 是「scenario-driven investigation」：它先從已知且可重播
的工業事件建立 investigation context，再由 bounded Agent 執行分析。它不是
一般自由聊天視窗，也不是每個 prompt 都即時改變 process state。Sidecar 的
一般 Chat tab 是 page-context Agent；LOOP-1 Experience 則是 backend-bound
industrial case workspace。兩者共用 read-only、Evidence-first 與安全邊界，
但操作入口不同。

Terminal A：

```bash
cd /Users/aaron/xk8/00_solera
npm run dev:api
```

Terminal B：

```bash
cd /Users/aaron/xk8/00_solera
npm run demo:loop1:preflight
npm run demo:loop1:normal
```

Preflight 必須通過：

- `/health`、`/ready`
- catalog 10 Assets / 60 Tags
- snapshot run state
- Pulse health/quality
- 6 bounded Skills
- 4 optional productization gates 可見且未誤啟用

### 為什麼需要 `normal`

`normal` 會把 run replay 到 tick 60：

- 目前沒有 fault
- 沒有 alarm flood
- Pulse healthy
- Agent 應回 `no-abnormality`
- 不應產生 Action draft

它的作用是讓每次 Demo 都從同一個可預期的 baseline 開始。若你上次 Demo
停在 tick 220，直接打開 Experience，客戶會看到上一輪 fault state，Demo
就不再可控。

### 為什麼需要 `preflight`

`preflight` 會檢查：

- API 是否可連線
- database 是否 ready
- synthetic catalog 是否載入
- 10 Assets、60 Tags、6 Skills 是否存在
- Pulse、quality 與 synthetic clock 是否正常
- optional productization gates 是否誤啟用

它是 presenter 的「開演前檢查」，不是產品功能本身。

## 6. Sidecar settings

Read-only viewing：

```text
API URL: http://localhost:8000
Bearer token: dev:tenant-demo:demo-user:viewer
Tenant: tenant-demo
```

Approval request：

```text
Bearer token: dev:tenant-demo:demo-engineer:engineer
```

Approval decision：

```text
dev:tenant-demo:demo-operator:operator
```

`dev:` token 只用於 local demo。它不是 production credential，也不應在 internet-exposed API 使用。

## 7. 五個 acceptance tests

### AT-01 Normal state

```bash
npm run demo:loop1:normal
```

Expected：

- tick 60
- Pulse healthy
- investigation `no-abnormality`
- no Action draft

### AT-02 Hero fault

```bash
npm run demo:loop1:hero
```

Expected：

- tick 220
- 18 raw alarms
- one event cluster
- Top-1 valve stiction
- Top-3 includes feedback bias and cooling-header disturbance
- SOP-R101-04 Revision 4 retrieved
- draft-only Action available

## 8. 客戶真正看到的 Agent Case Flow

### Case：Reactor cooling deviation

客戶不需要先理解 terminal command。Presenter 先用 command 將 demo 準備好，
接著把螢幕交給 Experience：

1. **Unit**：展示正常設備、Tags、Pulse 與 synthetic/read-only disclosure。
2. **Run Hero scenario**：產生一個已知的 cooling-valve stiction abnormal case。
3. **Timeline**：展示 18 個 raw alarms，以及 command → position → flow →
   thermal 的因果順序。
4. **Investigate**：呼叫 LOOP-1 backend Agent。
5. **Investigation**：展示 Top-1、Top-3、supporting/counter Evidence 與
   bounded confidence。
6. **Evidence**：展示 SOP Revision 4、P&ID、MOC、maintenance history、
   shift log 與 similar cases。
7. **Request approval**：建立 draft-only inspection action，說明不會寫入
   CMMS、DCS、PLC 或任何 plant control system。

這個 flow 的 input 不是一段自由文字，而是：

- selected scenario/run
- replay tick
- injected fault
- current Asset/Tag/Alarm state
- Investigator 的 read-only tool calls

Agent 的 output 是：

- investigation status
- alarm clusters
- ranked hypotheses
- Evidence ledger
- procedure/document retrieval
- similar cases
- recommendations
- optional draft-only Action

### 這樣如何展現客戶價值

Presenter 不要只說「模型找到 valve stiction」。應把前後差異說清楚：

```text
沒有 Solera：
18 個 alarms
→ 多個畫面與文件
→ 人工找 earliest change
→ 人工確認 SOP revision
→ 人工搜尋相似案例
→ 口頭交班或另開 draft

使用 Solera：
18 個 raw alarms
→ 一條 causal timeline
→ Top-3 hypotheses + Evidence
→ 正確 SOP revision
→ linked maintenance/cases
→ human-approved draft
```

真正要在 Customer Pilot 量測的是：

- alarm onset 到第一個可 review hypothesis 的時間
- 找到正確 SOP/case 的時間
- reviewer 對 Top-3 的 agreement
- Evidence completeness
- bad-quality data 時的 safe-decline
- investigation labor、downtime 或 off-spec baseline

### Experience Case Console 與 Agent trace

LOOP-1 Experience 現在預設使用繁體中文內容，右上角可切換
`中文 / EN`。操作按鈕保留英文；Asset 與 Tag 採「繁中名稱 + 原始工程 ID」，
避免翻譯後無法對回 PI／Historian／SCADA 點位。

進入 **Investigation** 後可使用 Case Console：

1. 選擇 `正常製程基準`、`FV-101 冷卻閥卡滯` 或`資料不足安全拒答`。
2. 輸入調查目標；這段文字會寫入 trace 的 audit context。
3. 檢查固定的 Bounded Plan。
4. 點 **Start Investigation**，或用右側 **Run Hero scenario** 快速執行 Hero。
5. 觀察實際 NDJSON stream 依序顯示 context、plan、tool start/result、
   Evidence、hypothesis、safety 與 complete。
6. 完成後切換到 **Evidence** 檢查 source ID、lineage、文件與相似案例。

畫面顯示的是可稽核的 execution trace，不是模型私密 chain-of-thought。
Trace 由實際 `Loop1Investigator` tool 邊界發出，不是 frontend 假 timer；
完整事件同時保存於 `TraceRepository`，可用 `/v1/traces/{traceId}` 重播。

### 仍然保留的 v0.1 邊界

目前輸入框是「調查目標與 audit context」，不是任意自然語言 scenario
generator。Case Console 只提供已驗證且可重播的 bounded cases，不會讓 LLM
自由建立新 fault、修改 process truth 或自動選擇未評估的控制動作。

Sidecar 的一般 Chat tab 可以接受 page-context 問題，例如：

```text
這個 PI Vision 畫面在做什麼？
這個畫面的主要設備與訊號有哪些？
請摘要目前畫面中的異常與資料品質風險。
```

這些 page-context prompts 與 LOOP-1 bounded investigation 仍是兩條不同的
flow。下一階段才考慮 Asset/time-window 自由選擇、經 golden evaluation
驗證的新 fault templates，以及 policy-controlled skill routing。

Demo 應稱為「有 Case Console 與 live audit trace 的可重播 industrial
investigation workspace」，而不是自由式 autonomous Agent。

### AT-03 Reset

```bash
npm run demo:loop1:reset
```

Expected：

- tick 0
- run state reset/normal
- persisted observations/alarms for the current run removed
- Pulse temporarily `degraded` because the empty run has no current observations
- catalog/documents/cases remain

### AT-04 Offline scorecard

```bash
npm run eval:loop1 -- --output artifacts/loop1-scoreboard.json
```

Expected：

- 40/40 passed
- determinism `1.0`
- unsupported-claim rate `0.0`

### AT-05 Browser E2E

Brave：

```bash
SOLERA_CHROMIUM_EXECUTABLE="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
  SOLERA_BROWSER_HEADLESS=true \
  npx playwright test
```

Expected：

- Sidecar opens
- LOOP-1 overlay mounts
- four workspaces render
- boundary banner visible
- Escape cleanly unmounts

## 9. 建立 handoff package

先產生最新 scorecard：

```bash
npm run eval:loop1 -- --output artifacts/loop1-scoreboard.json
```

再 build extension 與 package：

```bash
npm run demo:loop1:package
```

輸出：

```text
artifacts/solera-loop1-demo-handoff-0.1.0.zip
artifacts/solera-loop1-demo-handoff-0.1.0.zip.sha256
```

Package 包含：

- runnable source（不含 `.env`、`.git`、`node_modules`、`.venv`）
- Sidecar MV3 zip 與 checksum
- 40-case scoreboard
- LOOP-1 contract 與 ADRs
- Demo、Data Hub、value 與 handoff 文件
- fixtures、tests、scripts 與 dependency lockfiles

接收者解壓後，以 package 內的 `START_HERE.md` 開始。

## 10. Demo-day checklist

### 前一晚

- `npm run verify` 通過。
- 重新產生 scoreboard。
- 重新產生 handoff zip 與 checksum。
- 確認 extension logo、version 與 host permissions。
- 準備 screenshot/recorded fallback。

### 會前 30 分鐘

- 關閉不相關 browser tabs 與 notifications。
- 接上電源。
- 啟動 API。
- 執行 `npm run demo:loop1:normal`。
- 打開 approved host 與 Sidecar。
- 測一次 **Open LOOP-1 Experience**。
- Reset/prepare 回 normal。
- 放大 browser 至 audience 可讀。

### 會前 5 分鐘

- 不再 rebuild。
- 保留 API logs 可見但不要搶主畫面。
- 確認 10 分鐘 timer。
- 確認 viewer/engineer tokens 可快速切換。

### Demo 後

- 保存客戶問題與 claims requested。
- 不把 synthetic KPI 誤寫成 customer result。
- 寄出 read-only scope、next-step worksheet 與 workshop proposal。

## 11. Demo 失敗時的處理

### API not ready

```bash
curl http://localhost:8000/health
curl http://localhost:8000/ready
```

檢查 `.env`、port 8000、Python import path。若 code 沒改，不需重 build extension。

### Receiving end does not exist

Reload extension，然後 reload host tab 一次。舊 tab 沒有最新 content script。

### Blank Experience

確認 approved domain、`/v1/loop1/snapshot`、DevTools extension errors 與 API URL。

### Pulse degraded

先執行：

```bash
npm run demo:loop1:normal
```

如果仍 degraded，查 quality counts；不要在現場刪除 database。

### Live UI 無法恢復

切到：

- `artifacts/loop1-scoreboard.json`
- `artifacts/experience-demo/solera-loop1-investigation.png`
- `LOOP1_CUSTOMER_DEMO_10MIN.md`

明確說這是 recorded walkthrough。

## 12. Handoff acceptance

交付完成必須同時滿足：

- recipient 可從 clean install build。
- preflight 正常。
- normal/hero/reset commands 可重播。
- scoreboard 與 browser E2E 通過。
- extension zip checksum 可驗證。
- handoff zip 不含 secrets。
- Demo script 與 permitted/forbidden claims 已 review。
- customer follow-up owner 與日期已填寫。

## 13. Owner checklist

Demo owner：

```text
Name:
Date/time:
Customer:
Approved host:
Technical backup:
Business owner:
```

Demo result：

```text
Live / Recorded:
Questions:
Requested integrations:
Requested claims:
Selected pilot use case:
Customer data owner:
Next workshop date:
Go / Hold / No-Go:
```
