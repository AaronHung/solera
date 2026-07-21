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

## 8. 建立 handoff package

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

## 9. Demo-day checklist

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

## 10. Demo 失敗時的處理

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

## 11. Handoff acceptance

交付完成必須同時滿足：

- recipient 可從 clean install build。
- preflight 正常。
- normal/hero/reset commands 可重播。
- scoreboard 與 browser E2E 通過。
- extension zip checksum 可驗證。
- handoff zip 不含 secrets。
- Demo script 與 permitted/forbidden claims 已 review。
- customer follow-up owner 與日期已填寫。

## 12. Owner checklist

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
