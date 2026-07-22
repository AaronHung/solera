# LOOP-1 Data Hub 與 Agent Flow 操作說明

## 1. 系統定位

LOOP-1 使用一套 backend-owned deterministic truth：

```text
Scenario Engine
  → Synthetic PI Connector
  → Data Hub / Pulse / Thread
  → Read-only Tool Fabric
  → Bounded Skills
  → Evidence / Approval
  → Sidecar / Experience
```

Experience 不產生 process truth；browser-local portfolio simulation 也不會混入 LOOP-1。PI 不可用時，完整 Hero scenario 仍可執行、reset 與 replay。

### Current Demo status

- Experience 目前視覺化 Unit、Pulse、alarms、Investigation 與 Evidence summary。
- Catalog、raw Pulse、Thread edges、approval decision 與 productization gates
  目前透過 API／Terminal 證明。
- 尚未完成 Data Hub configuration UI、Asset tree editor、Thread graph explorer
  或 Approval Inbox。
- 現場操作順序與 `curl` examples 請使用
  `docs/runbooks/LOOP1_DEMO_PLAYBOOK.md` 的 Data Hub module。

## 2. Data Hub 已完成的功能

### Scenario Catalog

- 保存 versioned Scenario Manifest、seed、startsAt、tick cadence 與 checksum。
- 保存 fault definitions、KPI definitions、Asset hierarchy 與 Tag dictionary。
- 同一 manifest、seed 與 command sequence 可 deterministic replay。

### Asset 與 Tag Registry

- ISA-95／OPC UA 可對映 hierarchy：
  `Tenant → Site → Area → ProcessUnit → Equipment → Component → Tag`。
- LOOP-1 fixture 包含 1 Site、1 Process Unit、10 Assets、60 Tags。
- 每個 Asset/Tag 使用 stable Solera ID。
- Tag 可保存 PI/DCS/ERP/CMMS/P&ID/document aliases 與 effective dates。
- Tag 保存 unit、data type、cadence、alarm/engineering limits。

### Time-series 與 Alarm Store

- Observation 保存 event time、sequence、value、quality、synthetic flag 與 ingest time。
- Alarm 保存 asset/tag、priority、state、message、occurredAt 與 causeEventId。
- 同一 run/tag/sequence 使用 unique contract，重跑不重複累積。
- Reset 只清除指定 synthetic run，不影響 v0.1 Easy PI data path。

### Solera Pulse

- 顯示 connector status、last event、observed time 與 lag。
- 統計 good、bad、questionable、missing quality。
- 顯示 scenario state、tick、run ID 與 `synthetic-replay` clock mode。
- Agent 在 required signal 不新鮮或 quality 不可靠時 safe decline。

### Solera Thread

目前使用 typed relational edges，而不是先導入獨立 Graph DB。

已建立的 links：

- Asset `part-of` parent Asset
- Tag `measures` Asset
- Document `describes` Asset
- Case `involves` Asset
- Case `uses-signal` Tag
- Case `references` Document

每條 edge 保存 tenant、source、confidence、confirmed 與 effective time。

### Document 與 Case Intake

- 8 份 synthetic documents：
  SOP、P&ID index、valve manual、MOC、ePTW、shift log、alarm philosophy、maintenance history。
- 10 個 synthetic historical cases：
  valve stiction、position bias、header disturbance、instrument dropout、normal feed step、condenser fouling、compressor vibration、separator oscillation、stripper quality 與 ingest delay。
- Document 由 tenant-scoped lexical retrieval seam index；未來可替換 pgvector，不改 Agent result contract。

### Approval Store

- 保存 approval ID、run ID、action type、requested/decided identity、rationale 與 draft payload。
- Engineer/operator/supervisor/admin role boundary由 API 檢查。
- Approval result 固定標示：
  `draft-only; no external write or plant control`。

### Idempotent Solera Flow

`run_loop1_seed`：

1. upsert Scenario Manifest
2. upsert Assets/Tags
3. index documents
4. upsert cases
5. create Thread edges
6. write checksum checkpoint

`run_loop1_replay`：

1. reset target run
2. replay deterministic ticks
3. ingest observations/alarms
4. update Pulse
5. write replay checksum checkpoint

相同 fixture/checksum 重跑後，final state 相同且不製造 duplicate identities。

## 3. Agent 執行流程

### Step 1 — Resolve tenant and run

API 先用 bearer token 取得 tenant、actor、roles、asset scopes。LOOP-1 demo 只允許 `tenant-demo`。

### Step 2 — Query required signals

`query_signals` 讀取：

- cooling-valve-command
- cooling-valve-position
- cooling-water-flow
- reactor-temperature
- reactor-pressure
- separator-level
- product-quality-proxy

每個 Tag 至少需要 20 個 replay observations 且 current quality 必須為 good。

### Step 3 — Quality gate

任一 required Tag missing、questionable、bad 或歷史不足：

- investigation status = `safe-decline`
- 明確列出 missing data
- 不排名 root cause
- 不產生 Action draft

### Step 4 — Alarm Triage

`cluster_alarms` 使用 recorded `causeEventId` 組群：

- critical alarms 仍逐筆可見
- cluster 不等於 suppression
- raw alarm count 與 cluster count 都保留

### Step 5 — Change-point 與 deterministic calculations

`find_change_points` 使用 bounded baseline deviation：

- 計算 baseline、threshold、sequence 與 timestamp
- command-position mismatch = command − independent position
- calculation version 與 inputs 放入 Evidence lineage

### Step 6 — Procedure 與 Case retrieval

`get_document_revision` 與 `search_cases` 回傳：

- document/case stable ID
- title、section、URI
- retrieval version/score
- linked Assets、Tags 與 root cause/outcome

### Step 7 — Hypothesis ranking

LOOP-1 固定比較：

1. FV-101 valve stiction
2. position feedback bias
3. common cooling-water header disturbance

Agent 同時列 supporting Evidence 與 counter-Evidence。Confidence 是 bounded evaluation score，不是 safety probability。

### Step 8 — KPI calculation

`calculate_kpi` 在 deterministic code 中計算：

- alarm compression ratio
- synthetic off-spec exposure
- explicit assumptions 與 formula version

LLM 不作 numerical authority。

### Step 9 — Draft 與 approval

`draft_work_order` 只產生：

- title、Asset、priority
- Evidence references
- verification items
- safety boundary

API 保存 approval record，但不呼叫 CMMS/ERP/DCS/SCADA。

## 4. API 操作

### Read-only endpoints

```text
GET  /health
GET  /ready
GET  /v1/loop1/catalog
GET  /v1/loop1/snapshot
GET  /v1/loop1/pulse
GET  /v1/loop1/skills
GET  /v1/loop1/thread/{entity_kind}/{entity_id}
GET  /v1/loop1/productization-gates
```

### Synthetic replay endpoints

```text
POST /v1/loop1/control
POST /v1/loop1/investigate
```

Control payload examples：

```json
{"action":"replay","toTick":60}
```

```json
{"action":"jump-to-fault"}
```

```json
{"action":"step","count":10}
```

```json
{"action":"reset"}
```

這些操作只改 synthetic scenario state。

### Approval endpoints

```text
POST /v1/loop1/approvals
POST /v1/loop1/approvals/{approval_id}/decision
```

Decision payload：

```json
{"decision":"approved","rationale":"Proceed through normal permit workflow."}
```

`approved` 仍不代表外部工單已建立。

## 5. 資料建置與重置 SOP

### 第一次建置

```bash
cd /Users/aaron/xk8/00_solera
uv sync --frozen
npm install
npm run build
```

只有 `.env` 不存在時才執行：

```bash
cp .env.example .env
```

不要覆蓋現有 `.env`。確認設定：

```text
SOLERA_LOOP1_ENABLED=true
SOLERA_LOOP1_START_TICK=1
SOLERA_LOOP1_PI_MIRROR_ENABLED=false
SOLERA_LOOP1_DWSIM_OPCUA_ENABLED=false
SOLERA_LOOP1_MULTIMODAL_ENABLED=false
SOLERA_LOOP1_EXTERNAL_EVENT_BUS=in-process
```

啟動：

```bash
npm run dev:api
```

Startup lifespan 會自動執行 manifest/document/case/Thread seed。

### 確認 seed

```bash
npm run demo:loop1:preflight
```

Expected：

- 10 Assets
- 60 Tags
- 8 Documents
- 10 Cases
- Pulse healthy
- optional productization Gates deferred/core-ready

### 準備正常 demo

```bash
npm run demo:loop1:normal
```

這會 replay 到 tick 60。Agent 應回 `no-abnormality`。

### 準備 Hero demo

```bash
npm run demo:loop1:hero
```

這會 replay 到 tick 220 並驗證：

- 18 raw alarms
- 1 event cluster
- Top-1 valve stiction
- SOP Revision 4 retrieval
- Action draft available

### 清除當前 run

```bash
npm run demo:loop1:reset
```

Reset 到 tick 0；它不是刪除 fixture/catalog，也不會清除其他 tenant data。

### 重新建立 local database

只有 schema 開發或 local DB 損壞時才做。先停止 API，備份 `.db`，再依團隊 migration/cleanup procedure 操作。不要在客戶 demo 前臨時刪除 production-like database。

## 6. 目前的 storage 邊界

- Local demo 預設 SQLite。
- Pilot/production target 是 Postgres。
- Time-series 先用 time-indexed relational tables。
- pgvector、TimescaleDB、Graph DB 不是 core demo 前提。
- PI OMF mirror、DWSIM/OPC UA、multimodal 與 external broker 都 fail-closed。

## 7. 如何驗證「不是假 Agent」

這一節是 technical acceptance，不是主 10 分鐘 Demo。UI 可顯示 summary；
完整 calculation／document lineage、Thread edges 與 approval payload 應由 API
驗證。

每次 investigation 檢查：

1. run ID、seed、tick 與 simulation time 是否存在
2. raw signal Evidence 是否含 Tag/Asset/quality/time
3. calculation Evidence 是否含 inputs、formula 與 version
4. earliest change point 是否先於 downstream response
5. hypothesis refs 是否能解析到 Evidence ledger
6. SOP 是否包含 document ID/revision/section/URI
7. safe-decline case 是否沒有 Action draft
8. approval 是否固定為 draft-only
9. 相同 replay 是否 checksum 一致
10. host page close 後是否恢復且無 Solera residue

完整 automated proof：

```bash
npm run eval:loop1 -- --output artifacts/loop1-scoreboard.json
SOLERA_CHROMIUM_EXECUTABLE="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
  SOLERA_BROWSER_HEADLESS=true \
  npx playwright test
```
