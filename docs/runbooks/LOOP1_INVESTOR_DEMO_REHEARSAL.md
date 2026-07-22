# Solera LOOP-1 Investor Demo 演練手順

Audience: Investor、策略夥伴、Design Partner、製造業決策者  
Duration: 10 分鐘 Demo + 5 分鐘 Q&A  
Presenter goal: 讓觀眾看懂「問題、產品、可信 Agent、商業價值、下一步」，
而不是展示最多技術細節。

先用 `docs/runbooks/LOOP1_DEMO_PLAYBOOK.md` 選擇 audience route 與 appendix；
本文件只負責 Investor 版 Core Hero Demo 與第一次演練。

如果要深入理解 tick、seed、Replay controls、三個 Cases、Bounded Plan、
LLM 邊界、alarms、Evidence、safe-decline 與未來 Data Hub／Thread 設計，
請配合閱讀
`docs/architecture/LOOP1_DEMO_MECHANICS_AND_PRODUCT_EVOLUTION.md`。

## 先記住一句話

> Solera 不是另一個 dashboard 或 chatbot；它是在既有工業系統之上，
> 把分散的時序、警報、設備、SOP 與歷史案例組成可追溯、
> 會安全拒答、由人核准的 Evidence-first Agent 工作流。

## 這次 Demo 真正要證明什麼

必須讓 Investor 看見五件事：

1. **接得上既有環境**：Sidecar 疊加在既有 browser-based 工業系統上。
2. **不是黑盒子**：有 Bounded Plan、真實 tool trace 與 timestamp。
3. **不是自由猜測**：每項判斷連回 Tag、Alarm、SOP、Case 與 Evidence。
4. **不越過安全邊界**：read-only、safe-decline、human approval。
5. **可以複製成 Pilot**：先用一個 unit 與一個高價值 case 落地，再擴充。

LOOP-1 使用 synthetic data。它證明的是 Solera 的產品能力與驗證方法，
不是客戶現場已節省的成本，也不是真實 Digital Twin。

---

## Part A：第一次演練，從現在開始一步一步做

### Step 1｜確認所在目錄

打開 Terminal A：

```bash
cd /Users/aaron/xk8/00_solera
git status --short --branch
```

Expected：目前所在 branch 與 remote tracking 正常，且沒有未預期的 modified
files。例如：

```text
## feature/loop1-agent-clarity...origin/feature/loop1-agent-clarity
```

不要求一定在 `main`。如果看到 modified files，先記錄，不要在 Demo 前臨時
改 code、切 branch 或 merge。

### Step 2｜Build extension

只需要在 code 有變更時執行；今天第一次演練請執行：

```bash
npm run build
```

這個 command 會自己結束。完成後 Terminal 可以繼續使用。

### Step 3｜啟動 API，整場不要關

在 Terminal A 執行：

```bash
npm run dev:api
```

看到下列訊息後保持 Terminal A 開著：

```text
Application startup complete.
```

重要：

- `npm run dev:api` 不會自己結束。
- 演練與正式 Demo 全程保持它運行。
- 不要再開第二個 API，否則會出現 `Address already in use`。
- 要結束時才按 `Control+C`。

### Step 4｜技術 preflight

另開 Terminal B：

```bash
cd /Users/aaron/xk8/00_solera
npm run demo:loop1:preflight
```

Expected 最後一行：

```text
LOOP-1 demo preflight PASS
```

`preflight` 只檢查 API、Data Hub、Pulse、Assets、Tags、Skills 與 gates，
不會改變目前 scenario。它執行完會自動回到 shell prompt。

若不是 `PASS`，先不要開始 Demo。

### Step 5｜準備乾淨正常起點

仍在 Terminal B：

```bash
npm run demo:loop1:normal
```

Expected：

- tick `60`
- state `normal`
- Pulse `healthy`
- investigation `no-abnormality`
- 沒有 Action draft

這個 command 執行完會自動回到 prompt。

每一次重新演練前都再執行一次 `npm run demo:loop1:normal`。

不要在上場前執行 `npm run demo:loop1:hero`，否則觀眾一打開就會看到 fault
結果，失去「正常 → 異常 → Agent 調查」的故事。

### Step 6｜Reload Brave extension

1. 開 `brave://extensions/`。
2. 找到 **Solera Sidecar**。
3. 點 **Reload**。
4. 回到 approved host page。
5. Reload host page 一次。
6. 打開 Solera Sidecar。

第一次安裝才需要 **Load unpacked**：

```text
/Users/aaron/xk8/00_solera/apps/sidecar-extension/dist
```

### Step 7｜確認 Sidecar connection settings

1. 點 Sidecar 右上角齒輪 **Connection settings**。
2. 確認：

```text
API URL: http://localhost:8000
Bearer token: dev:tenant-demo:demo-user:viewer
Tenant: tenant-demo
```

3. 點 **Save and reconnect**。

第一次演練使用 viewer token。不要點 **Request approval**；先把核心故事練順。

如果要另外演練 approval，開始 Demo 前就把 token 改為：

```text
dev:tenant-demo:demo-engineer:engineer
```

### Step 8｜確認入口畫面

1. Sidecar 點 **Canvas**。
2. 找到 **LOOP-1 工業 Agent 實驗室**。
3. 先不要點 **Open LOOP-1 Experience**。

這就是正式 Demo 的起始畫面。

---

## Part B：正式 10 分鐘逐步操作與逐句講稿

第一次演練請真的開一個 10 分鐘 timer。不要暫停 timer。

### 0:00–0:45｜先講問題，不要先點產品

你停在：

```text
Sidecar → Canvas → LOOP-1 工業 Agent 實驗室
```

你說：

> 工廠真正的問題不是沒有資料，而是資料與知識分散在 Historian、SCADA、
> SOP、工單和資深工程師腦中。傳統 dashboard 告訴我們發生什麼，
> 一般 AI 可以生成答案，但很難證明答案從哪裡來，也不適合直接碰控制系統。
> Solera 的角色，是把這些來源組成可追溯、read-only、由人核准的工業 Agent
> 工作流。

Investor 應該記住：

- 問題是「context fragmentation（情境碎片化）」與「trust gap（信任缺口）」。
- Solera 不是取代 Historian、SCADA 或 MES。
- Solera 是跨系統的 Agent 與 Evidence layer。

不要說：

- 「我們已經可以控制工廠。」
- 「我們已經證明節省多少百萬美元。」
- 「LOOP-1 是真實化工 Digital Twin。」

### 0:45–2:00｜打開 Experience，展示正常狀態

你點：

1. **Open LOOP-1 Experience**
2. 左側 **單元**

你指給觀眾看：

1. 頂部 `合成資料 · 唯讀 · 非安全系統`
2. 右上 `SOLERA PULSE：正常`
3. `Tick 60`
4. KPI 的「閥指令－位置差」
5. FV-101、R-101 等 Asset cards
6. 繁體中文名稱下方保留的原始 Tag ID

你說：

> 現在是乾淨的正常 baseline。Solera Data Hub 保存同一個 scenario truth；
> Experience 只是 renderer，不會自行編造第二套數字。Pulse 代表資料來源的
> freshness、lag 與 quality。中文讓主管能快速理解，原始 Tag ID 則讓工程師
> 可以對回 PI 或 Historian。

Investor 應該看見：

- Business user 與 engineer 共用同一個畫面。
- Data quality 是 Agent 能不能回答的前置條件。
- UI 數字來自 deterministic scenario engine，不是 LLM 生成。

關鍵字：

- **Data Hub**：Solera 的工業 context system of record。
- **Pulse**：資料連線、freshness、lag 與 quality 健康度。
- **Deterministic**：相同 seed 與 tick 會得到相同結果，可重播與測試。

### 2:00–3:15｜先展示 Case Console 與 Plan

你點：

1. 左側 **調查**
2. Case 保持 `FV-101 冷卻閥卡滯 · tick 220`

你指給觀眾看：

1. Case selector
2. 調查目標
3. Bounded Plan 五個步驟
4. 右側目前仍空白的 `Agent 執行軌跡`

你說：

> 這不是讓模型自由猜測。Case Console 先界定 scenario、調查目標與可執行的
> Bounded Plan。這個 objective 會進入 audit context；目前不會讓 LLM 任意
> 改寫 process truth 或注入未驗證的 fault。

五個 Plan 步驟，你用白話說：

1. 先確認資料夠不夠、品質能不能信。
2. 把警報整理成事件，找最早變化。
3. 查正確版本的 SOP、文件與歷史案例。
4. 比較主要根因與反證。
5. 套用 read-only 與人工核准邊界。

Investor 應該看見：

- Agent 有 scope、有 plan、有 policy。
- Prompt 不是直接變成控制動作。

### 3:15–4:30｜點 Run Hero，展示 Agent 不再是黑盒子

你點：

```text
右側 Run Hero scenario
```

等待 `Agent 執行軌跡` 出現 `調查完成`。

你不要逐行念。只指出這六類：

1. `context`：確認 tenant、run、tick、case 與 synthetic boundary。
2. `plan`：建立固定且可稽核的調查順序。
3. `tool-start / tool-result`：實際查 signals、alarms、documents、cases。
4. `evidence`：把 tool result 轉成有 source ID 與 lineage 的 Evidence。
5. `hypothesis`：排名主要根因與 alternatives。
6. `safety / complete`：套用安全邊界並封裝結果。

你說：

> 現在看到的不是假動畫，也不是把模型的私密 chain-of-thought 暴露出來。
> 這是 backend 真正執行的 operational trace。每次 tool call、Evidence、
> hypothesis 與 safety boundary 都有 timestamp，完整 trace 也可以重播。

接著說 fault sequence：

> 在 Hero case 中，Controller command 先上升，但 independent valve position
> 沒有跟上；接著 cooling-water flow 下降，最後才出現 reactor 與下游偏移。
> 這個先後順序是 root-cause investigation 的核心。

Investor 應該看見：

- Solera Agent 可解釋的不是文字理由，而是執行與 Evidence lineage。
- Agent orchestration 可以替換或加入不同模型，但數值 truth 不交給模型。

關鍵字：

- **Execution trace**：Agent 實際做過哪些工作。
- **Tool**：有權限與邊界的 read-only 查詢能力。
- **Evidence**：帶 source、time、quality、calculation 與 lineage 的事實物件。
- **Chain-of-thought**：不應向客戶展示的模型私密推理；Solera 顯示可稽核步驟。

### 4:30–5:30｜Alarm Timeline：把 18 個警報變成一個事件故事

你點：

```text
左側 時間軸
```

你指給觀眾看：

1. Raw alarms 數量
2. Event clusters 數量
3. 最早的 valve position deviation
4. critical alarm 仍完整保留

你說：

> 現場常見的問題是 alarm flood。Solera 不會隱藏 critical alarms，
> 而是利用 causeEventId 與時間順序，把 dependent alarms 整理成一個
> investigation cluster。工程師先看到 earliest change，不必把 18 個警報
> 當成 18 個獨立根因。

Investor value：

- 減少操作人員的認知負擔。
- 縮短從 alarm onset 到第一個可 review hypothesis 的時間。
- 所有原始警報仍然可 audit。

目前 Timeline 只直接顯示 raw alarms、時間與 cluster。完整的
command → position → flow → thermal signal lanes 尚未實作；因果順序來自
deterministic investigation summary。不要指著 Timeline 宣稱四條 curves
已在同一畫面可視化。

### 5:30–7:00｜Top-3 Hypotheses：答案不是單一猜測

你點：

```text
左側 調查
```

在中央內容區向下 scroll，找到 Top-3 hypotheses。

你指給觀眾看：

1. Top-1：FV-101 冷卻水控制閥卡滯
2. Top-2：閥位回授偏差
3. Top-3：共用冷卻水總管擾動
4. supporting Evidence
5. counter Evidence
6. confidence

你說：

> Agent 不只給一個看似肯定的答案。它保留 Top-3 alternatives，
> 同時顯示支持與反證。Top-1 confidence 是 bounded evaluation score，
> 不是 safety probability，也不是自動維修指令。

接著指出安全拒答：

> 如果必要 Tag 缺失、quality 不佳，或歷史少於 20 筆，Agent 會
> safe-decline，不排名根因，也不建立 Action。可信 AI 的價值不只是會回答，
> 還包括知道什麼時候不應該回答。

關鍵字：

- **Hypothesis ranking**：比較多個根因，不是假裝唯一確定。
- **Counter-Evidence**：主動保留與主要假設不一致的事實。
- **Safe-decline**：資料不足時安全拒答。

### 7:00–8:15｜Evidence、SOP 與歷史案例

你點：

```text
左側 證據
```

你指給觀眾看：

1. Evidence ledger
2. 每筆 Evidence 的 source ID
3. `SOP-R101-04 Revision 4`
4. Similar cases
5. Skill trace

你說：

> 這裡把回答變成 investigation package。Solera Thread 把 Tag、Asset、
> Alarm、Document、Case 與 Action 接到 stable identity。Agent 找到的是
> 特定 document revision 與 source ID，不只是搜尋到一段相似文字。

Investor 應該看見：

- 知識不只存在 chat history，而能累積成組織可重用的 case memory。
- 客戶可以替換成自己的 PI alias、CMMS equipment number、ERP material
  number 與 approved SOP。

目前 UI 顯示 Evidence claim、source ID、value、document／case summary 與
Skill trace；完整 timestamp、quality、formula inputs、section／URI 等
lineage details 保存在 API payload，尚未提供 clickable detail drawer。

關鍵字：

- **Lineage**：這個事實從哪個 source、哪個時間與哪個計算版本而來。
- **Thread**：Asset、Tag、Alarm、Document、Case、Action 的關係層。
- **Case memory**：經 review 的調查結果可成為下一次事件的組織知識。

### 8:15–9:00｜Human approval：指出按鈕，但第一輪不要點

你指向右下：

```text
Request approval
```

viewer token 的第一次演練不要點。

你說：

> Agent 最多只建立 inspection work-order draft。Engineer 可以提出 request，
> operator、supervisor 或 admin 才能決定。即使 approved，這個版本也不會
> dispatch 到 CMMS，更不會改 setpoint、開關閥或 bypass interlock。

Investor 核心訊息：

> Solera 的目標不是取代操作主管，而是縮短收集 context 的時間，
> 讓核准者與工程師看到同一組 Evidence。

### 9:00–9:40｜商業價值與 Go-to-Market

你說：

> 我們用 read-only Pilot 進入，不要求客戶先更換 Historian、SCADA 或 MES。
> 第一個 Pilot 只選一個 process unit、20–50 個 Tags、3–5 份 SOP 與一個
> 高價值 case。我們量測 time-to-context、SOP search time、alarm burden、
> investigation labor、MTTR 或 off-spec exposure，再決定如何擴到其他 unit
> 與 use cases。

Investor 應該理解的商業路徑：

1. Land：單一 read-only use case 與可量測 baseline。
2. Prove：用 customer-labeled cases 與 golden evaluation 驗證。
3. Expand：更多 Assets、connectors、Skills、Sites 與角色。
4. Compound：每次 review 過的 Evidence 與 Case 增加組織記憶。

不要宣稱：

- synthetic 40/40 等於客戶 root-cause accuracy 100%。
- 尚未量測的成本節省。
- 未完成的 connector、multimodal 或 autonomous control 已可交付。

### 9:40–10:00｜Investor closing

你說：

> 今天證明的是 Solera 的 wedge：在不改動控制系統的前提下，
> 把可信 Agent 帶進 brownfield 工業環境。核心資產不是單一模型，
> 而是 industrial identity、Evidence lineage、bounded Skills、
> evaluation 與可重播 case memory。下一步是與 Design Partner 完成
> read-only discovery，用真實 baseline 證明時間與營運價值，再擴展成平台。

你提出下一步：

1. 指定一位 process/reliability owner。
2. 選一個 read-only high-value case。
3. 安排 90 分鐘 data-readiness workshop。
4. 定義 Pilot baseline 與成功標準。

---

## Part C：Investor Pitch 的五句骨架

如果臨場忘詞，只要依序說這五句：

1. **Problem**  
   工業資料很多，但 context、SOP 與經驗分散，AI 的答案難以信任與稽核。

2. **Product**  
   Solera 用 Sidecar、Data Hub、Pulse、Thread 與 bounded Agent Skills，
   在既有系統之上建立 Evidence-first investigation。

3. **Why different**  
   數值 truth 不交給 LLM；每個 tool、Evidence、hypothesis 與 safety
   boundary 都可重播。

4. **Value**  
   目標是縮短 time-to-context、alarm investigation、SOP search 與
   engineering review，同時保留 human accountability。

5. **Go-to-market**  
   從單一 read-only Pilot 落地，以客戶 baseline 證明價值，再擴展 Assets、
   Sites、connectors 與 Skills。

---

## Part D：常見 Investor 問題與標準回答

### 這只是另一個 ChatGPT wrapper 嗎？

> 不是。模型可以替換；工業 identity、data quality、tool policy、
> deterministic analytics、Evidence lineage、approval 與 evaluation
> 才是產品核心。LOOP-1 root-cause flow 本身是 deterministic bounded
> orchestration，不依賴外部 LLM。

### 為什麼 LOOP-1 使用 synthetic data？

> 我們目前沒有客戶 Historian 的直接資料權限。Synthetic platform 讓我們先把
> contracts、fault injection、safe-decline、Evidence 與 golden evaluation
> 做成可重播測試。接上客戶資料後，所有 accuracy 與 ROI 都必須重新驗證。

### 這是不是 Digital Twin？

> 不是。它是 deterministic synthetic Agent validation environment。
> Digital Twin claim 需要 customer data、domain validation 與 VVUQ。

### Agent 會不會操作設備？

> 不會。現在沒有 DCS、PLC 或 SIS control tools。Action 只到人工核准的
> draft，沒有外部 dispatch。

### 你們如何產生 ROI？

> 我們先建立 customer baseline，再量 time-to-context、SOP search time、
> alarm burden、investigation labor、MTTR 與 off-spec exposure。
> Demo 證明 capability，不把 synthetic result 當成客戶 savings。

### 你們的 moat（護城河）是什麼？

> 不是某一個 LLM。Moat 來自 industrial identity graph、Evidence lineage、
> reviewed case memory、bounded Skill contracts、customer-specific evaluation
> 與跨系統 deployment know-how。資料與 review 越多，客戶的 Agent context
> 越難被通用 chatbot 取代。

### 為什麼大廠不直接做？

> Historian、MES、CMMS 與 ERP 廠商各自擅長自己的 system of record。
> Solera 的位置是跨系統、read-only 的 investigation 與 Evidence layer，
> 可以與既有大廠產品合作，而不是要求客戶全部替換。

### 40/40 是否代表真實準確率 100%？

> 不代表。它只證明 versioned synthetic golden dataset 全部達標。
> 真實準確率要用 customer-labeled cases 重新評估。

---

## Part E：現場故障時怎麼辦

### `Failed to fetch`

依序檢查：

1. Terminal A 的 API 是否仍在運行。
2. `curl http://localhost:8000/health`
3. Brave extension 是否已 Reload。
4. Host page 是否已 Reload。
5. Sidecar API URL 是否為 `http://localhost:8000`。

### `Receiving end does not exist`

1. Reload host page。
2. 關閉再打開 Sidecar。
3. 再點 **Open LOOP-1 Experience**。

### 畫面一打開已經是 fault

Terminal B：

```bash
npm run demo:loop1:normal
```

關閉 Experience（`Esc`）後重新打開。

### Run Hero 沒有 trace

1. 確認 API 是最新 code；必要時重啟 `npm run dev:api`。
2. 執行 `npm run build`。
3. Reload extension 與 host page。
4. 重新執行 `npm run demo:loop1:normal`。

### Browser Demo 無法恢復

誠實切換到 backup：

1. Terminal B 執行 `npm run demo:loop1:hero`。
2. 展示 terminal 的 18 alarms、Top-1、Evidence 與 SOP checks。
3. 打開：

```text
artifacts/experience-demo/solera-loop1-investigation.png
```

4. 明確說這是 backup screenshot，不是假裝 live browser。

---

## Part F：演練完成後的自我評分

每一項用 `0 / 1 / 2` 評分：

- `0`：未做到
- `1`：做到但卡頓或說不清楚
- `2`：流暢且觀眾能理解價值

### Technical

- API、preflight、normal 全部一次成功。
- 10 分鐘內沒有 `Failed to fetch`。
- Run Hero 顯示完整 trace。
- Timeline、Top-3、Evidence 都能在 10 秒內找到。
- 沒有誤點 viewer 無權限的 Request approval。

### Story

- 先講問題，再講功能。
- 清楚說明 synthetic、read-only、not a safety system。
- 能說明 Solera 為何不是 dashboard 或 ChatGPT wrapper。
- 能解釋 Evidence、safe-decline、counter-Evidence。
- 沒有把 synthetic score 說成客戶 ROI。

### Investor value

- 說清楚 land-and-expand Pilot 路徑。
- 說清楚 moat 不依賴單一 LLM。
- 說清楚會量測哪些 customer baseline。
- 結尾提出具體 next action。

滿分 36 分：

- `30–36`：可以對外 Demo。
- `24–29`：再演練一次並修正卡點。
- `<24`：先做內部 walkthrough，不對外。

演練後記錄：

```text
總時間：
卡住的畫面／按鈕：
說不清楚的 keyword：
Investor 可能追問：
需要調整的 UI：
需要調整的 talk track：
```

---

## 每次重新演練的最短 Reset

Terminal A 保持 API 運行。

Terminal B：

```bash
cd /Users/aaron/xk8/00_solera
npm run demo:loop1:normal
```

Browser：

1. 按 `Esc` 關閉 Experience。
2. 回 Sidecar **Canvas**。
3. 重新點 **Open LOOP-1 Experience**。
4. Timer 歸零。

不需要重新 `uv sync`、`npm install` 或 `npm run build`，除非 code 有變更。
