# Solera v0.1 本機啟動 SOP

> 本文件讓你在 **不依賴 AI 工具** 的情況下，完整啟動 Solera Sidecar 進行 Demo 或測試。
> 預計操作時間：首次約 15 分鐘，之後每次約 2 分鐘。

---

## 前置條件（只需確認一次）

| 工具 | 確認方式 | 若未安裝 |
|------|---------|---------|
| Node.js ≥ 22 | `node -v` | `brew install node` |
| uv（Python 套件管理） | `uv --version` | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| Brave / Chrome / Edge | 已安裝 | 下載即可 |
| 終端機 | iTerm2 / WezTerm / Terminal.app | 任一皆可 |

---

## Part 1：首次設定（只做一次）

### 1-A  複製 repo

```bash
git clone git@github.com:AaronHung/solera.git
cd solera
```

### 1-B  安裝所有套件

在 `solera` 資料夾下，打開終端機執行：

```bash
# Node.js 套件（前端 extension + contracts + canvas）
npm install

# Python 套件（後端 API）
uv sync --group dev
```

> 預期輸出：`npm warn ...` 幾行是正常的；最後看到 `added N packages` 即可。

### 1-C  確認 .env 存在

```bash
ls .env
```

若看到 `.env` 存在就跳過。若沒有：

```bash
cp .env.example .env
# 然後用任何文字編輯器打開 .env，確認下列欄位已填入真實值：
# SOLERA_MODEL_API_KEY=sk-or-v1-...
```

> `.env` **永遠不 commit**，是你本機私有的設定檔。

### 1-D  Build extension

```bash
npm run build
```

> 最後看到 `✓ built in Nms` 即成功。  
> 輸出目錄：`apps/sidecar-extension/dist/`

---

## Part 2：每次 Demo 前的啟動流程

### 步驟 1：啟動後端 API（開一個終端機，維持開著）

在 `solera` 根目錄執行（**推薦**，一行搞定）：

```bash
npm run dev:api
```

或者手動完整版（等效）：

```bash
PYTHONPATH=apps/solera-api:connectors/easy-pi:connectors/synthetic-pi:flows:simulators/loop1 uv run uvicorn solera_api.main:app --reload --app-dir apps/solera-api
```

> **為什麼要加 `PYTHONPATH`？**
> `easy_pi` 模組在 `connectors/easy-pi/` 資料夾，
> uvicorn 本身不知道這個路徑，必須手動告訴 Python 去哪裡找。
> `npm run dev:api` 已經幫你把這個路徑設好了。

**成功的標誌：**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

> 這個終端機要**保持開著**，整個 Demo 期間都不能關。  
> API 在 `http://localhost:8000`，Sidecar 就是打這個。

---

### 步驟 2：在 Brave / Chrome / Edge 載入 Sidecar Extension

**Brave：**
1. 網址列輸入 `brave://extensions`，按 Enter
2. 右上角開啟 **Developer mode**（切換開關）
3. 點 **Load unpacked**
4. 選擇資料夾：`/Users/aaron/xk8/00_solera/apps/sidecar-extension/dist`
5. 看到「Solera Sidecar」出現在列表 ✅

**Chrome：**
- 步驟完全相同，只是網址改成 `chrome://extensions`

**Edge：**
- 網址改成 `edge://extensions`，其餘相同

**目前已核准的 SCADA 測試站點：**
- `http://203.146.71.23/*`
- 這是明文 HTTP 的開發／測試站點，只限於本機 Pilot；不要將此例外直接延伸到 production。
- 更新 manifest 後必須重新執行 `npm run build`，在 extensions 頁重新載入 Solera，
  再重新整理 SCADA 分頁，content script 才會注入。

> 只需要載入一次。之後每次打開瀏覽器，extension 都會自動出現。  
> 更新了程式碼後，重新 `npm run build`，在 extensions 頁按刷新圖示，
> **再重新載入目前的 Easy PI／PI Vision 分頁**。Content script 不會自動
> 注入到 extension 更新前已經開啟的頁面。

---

### 步驟 3：登入 PI Vision（手動，一次即可）

1. 在 Brave/Chrome 打開新分頁
2. 前往：`https://pivision.iiotfab.com:8443/PIVision`
3. 帳號：`administrator`，密碼：`iiotfab@1qaz@WSX`
4. 登入後，前往目標 Display：  
   `https://pivision.iiotfab.com:8443/PIVision/#/Displays/29/Tank_Details`

---

### 步驟 4：啟動 Sidecar 進行 Demo

1. 確認你在 Easy PI、PI Vision 或已核准的 SCADA 頁面上
2. 點右上角工具列的 **Solera S logo**
3. 點 Sidecar 右上角的 ⚙ **Connection settings**
4. 填入：
   - API URL：`http://localhost:8000`
   - Bearer token：`dev:tenant-demo:demo-user:viewer`
   - Tenant：`tenant-demo`
5. 點 **Save and reconnect**
6. Sidecar 側欄彈出，自動偵測當前頁面 Context
7. 在 **Chat** 欄輸入問題，例如：
   - `CDT158 過去 1 小時的最大值是多少？`
   - `比較 CDT158 和 CDT159 過去 24 小時的趨勢`
   - 在 PI Vision 頁面，請改用該頁面實際對應的 PI Tag；不要直接套用
     Easy PI 範例中的 CDT158/CDT159。
8. Agent 回傳帶 Evidence 的答案
9. 點「**Add to Canvas**」→ 彈出趨勢圖 overlay
10. 按 **Esc** 或 X 關閉 Canvas，畫面完全復原
11. 在 textarea 按 **Control+Enter**，等同點擊 **Send**

> 這個 `dev:` token 只適用於本機 `.env` 的 development mode，
> 不要拿到 production 或客戶環境使用。正式環境會改用 OIDC bearer token。

---

## Part 2-A：Experience Demo 操作 SOP

Experience Demo 位於 **Canvas → Experience Demo**，已合併到 `main`。它是
portfolio visualization concept，使用 bundle 內固定的 mock industrial
data；不會讀取或修改 PI、SCADA、MES、ERP 資料，也不會把 mock data 當成
production Evidence。

同一頁另有 **Solera Agent Platform**：LOOP-1 使用 backend deterministic
scenario、Data Hub、Pulse、Thread 與 Evidence；LOOP-2～4 是明確標示的
interactive synthetic concept markup。`Precision Manufacturing` Gallery
中的 FASTEN-1 是六階段 RFQ-to-First-Good-Part deterministic workflow。
完整操作請依
`docs/runbooks/LOOP1_DEMO_SOP.md`；Concept Agent 不可說成已完成 runtime，
兩者也不可混稱為 customer live data。

### 開啟 Experience

1. 在 Sidecar 點 **Canvas**。
2. 在 **Experience Demo** 選擇角色：
   - `Executive`
   - `Shift Supervisor`
   - `Operator`
   - `Reliability Engineer`
   - `IT / Data`
3. 點 **Open full-screen Experience**。
4. Experience 會在目前 browser tab 上方開啟 full-viewport overlay。
5. 點右上角 **Home**、**Sites**、**Maintenance** 等頁籤，或由
   Portfolio 的 Site card 進入 Site Operations / Asset Detail。

Experience 是 read-only overlay。關閉後，原本的 Easy PI、PI Vision 或
SCADA 頁面應完整恢復；它不會改寫 host page 的 HTML、資料或操作狀態。

### `1 秒`、`5 秒`、`15 秒`分別是什麼？

畫面上的 `LIVE SIMULATION` 是一個 multi-rate mock simulator：

- **每 1 秒**：更新快速 process telemetry，例如 grid frequency、net
  output、inverter temperature、hydrogen pressure，以及相關即時
  sparklines。
- **每 5 秒**：建立新的 trend snapshot。曲線保留上一版虛線，最新一版
  以實線重新繪製，讓使用者看得出資料正在刷新。
- **每 15 秒**：更新 availability、health、hourly/financial 等較慢變的
  operational indicator，避免所有數字一起快速跳動。
- 數值由固定 dataset 加上 deterministic sine/drift 計算，不是隨機亂跳，
  也不是呼叫 Easy PI 或 PI Vision。
- simulation 不會改寫原始 mock fixture；每一個時間點都可重現。
- 數值在宣告的合理範圍內 bounded，不會因為開很久而無限增加。
- Grid frequency、temperature、pressure、forecast deviation 等訊號依
  threshold 變成綠色、黃色或紅色，並同時顯示 `Stable`、`Watch band`、
  `Frequency excursion` 等文字，不能只靠顏色判斷。
- `Pause` 會停止所有 cadence；`Resume` 會從目前狀態繼續。
- `Reset` 會將 fast tick、trend snapshot 和慢變指標全部回到初始狀態。

因此，這些更新週期不是：

- API 每 1/5/15 秒查詢一次；
- PI historian 的 real-time subscription；
- 生產環境的 alarm polling；
- 真實設備或製程的控制週期。

這些 production data binding 和 historian streaming 尚未屬於本 Demo。

### `10 秒`或`10 分鐘`是什麼？

目前產品沒有獨立的「每 10 秒」機制。計畫與驗收中提到的是
**連續運作 10 分鐘**，不是 10 秒：

```bash
SOLERA_CHROMIUM_EXECUTABLE="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
SOLERA_BROWSER_HEADLESS=true \
SOLERA_EXPERIENCE_LONGEVITY_MINUTES=10 \
npx playwright test --grep "Chromium loads"
```

這是開發者用來驗證 overlay longevity 的測試命令。它會在 10 分鐘內確認：

- Experience root 還存在；
- 1 秒 telemetry、5 秒 trends 和 15 秒 health 仍然更新；
- 沒有 browser page error；
- overlay 沒有自行消失或失效。

一般 Demo 不需要執行這個 10 分鐘測試。一般使用者只要在 Experience 中
停留 5 分鐘或 10 分鐘，畫面仍會依 1/5/15 秒 cadence 更新；不會因為
到達 5 或 10 分鐘而自動重啟、清除或切換頁面。

### 停留 5 分鐘、10 分鐘會發生什麼？

- **5 分鐘**：約 300 次 fast telemetry updates、60 個 trend snapshots、
  20 次 slow health updates。頁面、角色、目前選取的 Site/Asset 不會
  自動重置。
- **10 分鐘**：約 600 次 fast updates、120 個 trend snapshots、40 次
  slow updates。數值仍由固定 fixture 計算並受 bounds 限制，不會無限漂移。
- **Pause 後停留 5/10 分鐘**：數值維持不變，因為 interval 已停止。
- **關閉後重新開啟**：新的 simulator session 從 tick 0 開始；這是預期
  行為，因為目前沒有正式 persistence。
- **重新整理 host page 或重新載入 extension**：目前 overlay 會消失，
  需要重新整理頁面並從 Sidecar 再開啟 Experience。

### 什麼是 clear？

在本 Demo 中，`clear` 不是清除 PI、SCADA、browser database 或客戶資料。
它通常指以下其中一種安全的本機操作：

1. **關閉 Experience overlay**：按 `Esc` 或右上角 `×`。這會移除
   `#solera-experience-root`、React root、keyboard listener 和 simulator
   interval。
2. **Reset simulator**：按 Experience 上方的 `Reset`。這只把 in-memory
   mock tick 回到 0，不刪除檔案，也不影響 host page。
3. **重新整理 host page**：當 content script 狀態異常時，按
   `Cmd+R`／`Ctrl+R`。這會清掉目前 tab 的 overlay DOM，重新注入
   content script。
4. **重新載入 extension**：在 `brave://extensions`、`chrome://extensions`
   或 `edge://extensions` 對 Solera 按 reload。這會重新載入 extension
   bundle；之後也要重新整理已經開啟的 host page。

目前 Experience 沒有把 mock data 寫入 `localStorage`、`chrome.storage`、
資料庫或 backend，所以通常不需要手動刪除任何 mock data。

### 不 clear 會怎樣？

正常情況下，按 `Esc` 或 `×` 已經會自動 cleanup，不需要額外 clear。
如果只是停留在頁面而沒有關閉：

- overlay 會繼續存在；
- simulator 會繼續依 1/5/15 秒 cadence 更新；
- mock data 只存在記憶體，不會累積到磁碟或 PI；
- host page 不會被修改。

若發生異常而 overlay 沒有被正常關閉，可能留下畫面上的
`#solera-experience-root` 或持續中的 timer。這時請依序：

1. 按 `Esc`；
2. 若無效，重新整理 host page；
3. 若仍無效，從 browser extensions 頁 reload Solera，再重新整理 host page；
4. 最後才重啟 API；Experience mock simulator 本身不依賴 API。

### 什麼時候需要重啟？

**不需要重啟的情況：**

- 只是停留 5 分鐘或 10 分鐘；
- 想讓 mock 數值回到初始狀態：按 `Reset` 即可；
- 只想停止 mock 更新：按 `Pause` 即可；
- 只關閉 Experience：按 `Esc` 或 `×` 即可；
- 只切換 Site、Asset 或角色：直接操作頁面即可。

**需要重啟或 reload 的情況：**

- 修改了 Python API、`.env`、`apps/solera-api` 或 connector：
  回到 API 終端機按 `Ctrl+C`，再執行 `npm run dev:api`。
- 修改了 TypeScript、React、CSS、content script 或 Experience：
  執行 `npm run build`，在 extensions 頁 reload Solera，再重新整理 host
  page。只 reload extension 而不 reload 已開啟的頁面，可能會看到
  `Receiving end does not exist`。
- Sidecar 顯示 API connection error：先確認 API 終端機仍在執行；必要時
  重啟 API，然後在 Sidecar 點 **Save and reconnect**。
- Experience overlay 卡住、Esc 沒有反應或畫面與 bundle 不一致：
  reload extension + reload host page。
- 看到 Python traceback、`ModuleNotFoundError` 或 settings parsing error：
  停止 API、修正 `.env`/依賴/命令，再重新執行 `npm run dev:api`。

重啟 API 不會重啟 Experience 的 mock simulator；兩者是不同程序。只有
重新開啟 Experience 或重新整理 host page，才會建立新的 simulator session。

---

## Part 3：關機流程

1. 回到啟動 API 的終端機
2. 按 `Ctrl+C` 停止 uvicorn

> Extension 保持在瀏覽器中不需要移除，下次直接從步驟 1 開始。

---

## Part 4：常見問題

### Q1：Sidecar 打開是白畫面或「連線錯誤」
**原因：** 後端 API 沒有啟動  
**解法：** 開終端機執行步驟 1 的 uvicorn 指令，再重新整理側欄

### Q2：畫面出現「Configure an authenticated Solera bearer token first」
**原因：** Sidecar 的設定面板尚未填入本機 development token。  
**解法：** 點右上角 ⚙，填入：
```
API URL: http://localhost:8000
Bearer token: dev:tenant-demo:demo-user:viewer
Tenant: tenant-demo
```
按 **Save and reconnect** 後再送出問題。

### Q3：Agent 說「analysis complete」但沒有 LLM 說明文字
**原因：** `.env` 中 `SOLERA_MODEL_PROVIDER=disabled` 或 API key 錯誤  
**解法：** 確認 `.env` 中：
```
SOLERA_MODEL_PROVIDER=openai-chat
SOLERA_MODEL_API_KEY=sk-or-v1-...（真實 key）
```

### Q4：PI Vision 頁面 Sidecar 顯示「未知頁面」
**原因：** 可能是 URL 不在 allowlist  
**解法：** 確認 URL 包含 `pivision.iiotfab.com:8443`，extension 的 content script 只注入這個 domain

### Q5：PI Vision 頁面顯示候選 Asset，但信心只有 45% 或 80%
**原因：** PI Vision 的 display URL／DOM 只能提供候選 context，Solera 不會從圖形
目測或猜測設備數值。  
**解法：** 如果只是問「這個畫面在做什麼」，不需要先確認 Asset；
page-first Agent 可以直接使用頁面 context。只有要執行 asset-scoped
connector 數值分析時，才打開 **Context** 分頁確認候選 Asset，再輸入
該 display 對應的已核准 PI Tag。PI Vision 提供 display context，Easy PI/API
才是 v0.1 的數值權威來源。

### Q6：更新了程式碼但 extension 沒變
**解法：**
```bash
npm run build
# 然後去 brave://extensions，點 Solera Sidecar 的刷新圖示
# 再回到 Easy PI / PI Vision 分頁按 Cmd+R 或 Control+R
```

### Q7：Easy PI 資料查不到
**原因：** Tag 不在 allowlist，或時間範圍太大  
**確認：** `.env` 中 `SOLERA_ALLOWED_TAGS=CDT158,CDT159,SINUSOID`

### Q6：Brave 顯示「這個 extension 可能損壞」
**原因：** Brave 有時對 unpacked extension 顯示此警告，不影響功能  
**解法：** 直接點 Enable，忽略警告

---

## Part 5：Demo 劇本（3 分鐘）

```
1. [展示 Easy PI 頁面]
   「這是我們的工業資料入口 Easy PI，有設備測點資料」
   
2. [點 Solera logo 開啟 Sidecar]
   「Solera Sidecar 在瀏覽器側邊彈出，偵測到當前頁面是 Easy PI」
   
3. [輸入問題] CDT158 過去 24 小時最大值是多少？
   「Agent 直接查詢 PI 資料，用確定性算法計算，
    所有數字都附帶 Evidence — 資料來源、時間戳、品質」
   
4. [點 Add to Canvas]
   「這是 Canvas，趨勢圖用 SVG 渲染，覆蓋在原頁面上」
   
5. [按 Esc 關閉 Canvas]
   「關閉後完全消失，原頁面完全不被修改」

6. [切換到 PI Vision 頁面]
   「Sidecar 自動偵測到 PI Vision 畫面，
    辨識出設備名稱和時間 context，
    讓你直接問這個 display 上的資料問題」
```

---

## 附錄：端點資訊

| 系統 | URL | 認證 |
|------|-----|------|
| Easy PI Swagger | https://easypi.iiotfab.com/swagger/ui/index | 無需帳號 |
| PI Vision | https://pivision.iiotfab.com:8443/PIVision | administrator / iiotfab@1qaz@WSX |
| PI Vision Tank Display | https://pivision.iiotfab.com:8443/PIVision/#/Displays/29/Tank_Details | 同上登入後 |
| SCADA 測試站點 | http://203.146.71.23:8080/CloudSCADA/ | 使用站點既有登入 |
| Solera API（本機）| http://localhost:8000 | Dev token（自動） |
| Solera API docs | http://localhost:8000/docs | 同上 |
| OpenRouter | https://openrouter.ai | 已在 .env 設定 |
