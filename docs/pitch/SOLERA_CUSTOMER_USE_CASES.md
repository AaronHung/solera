# Solera Customer Use Case Catalog

## 1. Solera 到底在賣什麼

Solera 不只賣「AI 問答」，也不只賣一個 chemical-process demo。

Solera 賣的是一套可重複套用到不同工業情境的
Evidence-first Investigation Workflow：

```text
異常或問題
  → 取得即時／歷史資料
  → 確認 freshness 與 quality
  → 建立 Asset、Tag、Alarm、Document、Case context
  → 比較 bounded hypotheses
  → 產生可追溯 Evidence
  → 提出 human-approved draft action
  → 保存結果成為下一次可重用的 Case
```

共用產品能力：

- **Data Hub**：統一 Asset、Tag、alias、quality、time、document、case。
- **Pulse**：監測 freshness、lag、missing/questionable data。
- **Thread**：連接 Asset、Alarm、Document、Case、Evidence、Action。
- **Skills**：執行 Alarm Triage、Process Context、Procedure、Case Retrieval。
- **Experience**：把調查結果呈現在現有 SCADA、PI Vision、MES、ERP 旁。
- **Action Rail**：產生 inspection、handover、deviation 或 work-order draft。
- **Safety boundary**：read-only、safe-decline、human approval、無 plant control。

## 2. 成熟度定義

### Live now

目前 repository 已有可操作 UI、backend scenario、Agent、Evidence、evaluation
與 Browser E2E。

### Pilot template

產品 workflow 與 contracts 可沿用，但仍需建立對應 scenario manifest、
synthetic fixtures、customer aliases、Skills 與 golden cases。

### Productization

需要 customer connector、security、domain validation、baseline 與正式 acceptance。
不得把 template 說成已完成的 production solution。

---

## UC-01｜連續製程異常調查

**適合客戶**：Chemical、Petrochemical、Oil & Gas、Refinery、Specialty Chemical
**主要買方**：Operations Manager、Process Engineer、Reliability、Control Room
**成熟度**：Live now — LOOP-1

### 客戶現場故事

下午 6:42，reactor temperature 開始緩慢上升。幾分鐘內，control room
出現 18 個 alarms：

- cooling-water flow low
- valve position deviation
- reactor temperature high
- reactor pressure high
- separator level deviation
- compressor load deviation
- product-quality proxy deviation

Operator 看見很多 alarms，但不知道哪一個是 initiator、哪些只是 downstream
symptoms。Process Engineer 必須打開趨勢、P&ID、SOP、維修史、MOC 與交班紀錄。

### Solera 如何處理

1. Pulse 確認 required Tags freshness 與 quality。
2. Timeline 保留 18 個 raw alarms，依 cause event 組成 investigation cluster。
3. Agent 找出 controller command 最先上升。
4. Independent valve position 沒有跟隨。
5. Cooling-water flow 隨後下降。
6. Temperature、pressure 與 downstream process 再延遲偏移。
7. Agent 比較三個 hypotheses：
   - FV-101 valve stiction
   - valve position feedback bias
   - common cooling-water header disturbance
8. Thread 找到 SOP Revision 4、P&ID、MOC、維修史、shift log 與 similar cases。
9. Action Rail 建立 field inspection draft，等待 human approval。

### 客戶看到的畫面

- Unit：設備、關鍵 Tags、Pulse、scenario state。
- Timeline：alarm onset 與 causal order。
- Investigation：Top-3、supporting/counter Evidence。
- Evidence：signal、calculation、document、case lineage。
- Action Rail：read-only inspection draft。

### 能降低的成本

- alarm flood 的 operator cognitive load
- Process Engineer 收集 context 的工時
- 找錯 SOP revision 的風險
- 異常持續造成的 off-spec exposure
- 重複調查過去已發生問題的時間

### Pilot KPI

- alarm onset → first reviewable hypothesis
- 找到 current SOP revision 的時間
- Top-3 與 expert label agreement
- Evidence completeness
- alarm cluster compression ratio
- safe-decline accuracy
- off-spec exposure minutes

### 一句話 Pitch

> Solera 把 18 個 alarms 從一個令人混亂的清單，轉成一條有 Evidence 的 causal investigation。

---

## UC-02｜Rotating Equipment Reliability Copilot

**適合客戶**：Oil & Gas、Power、Chemical、Mining、Water、Cement
**主要買方**：Reliability Manager、Maintenance Manager、Condition Monitoring
**成熟度**：Pilot template — 建議下一個 LOOP-2

### 客戶現場故事

P-204 cooling-water pump 的 vibration 在高負載時逐步升高，但不是持續超標。
同一週發生三次 suction pressure fluctuation，maintenance system 裡有一張
兩個月前尚未關閉的 alignment notification。

團隊需要判斷：

- bearing degradation
- cavitation
- coupling misalignment
- process-load effect
- vibration sensor bias

如果太早 overhaul，會產生不必要 maintenance cost；如果太晚處理，可能造成
unplanned outage。

### 所需資料

- vibration RMS／spectrum bands
- bearing temperature
- motor current
- suction/discharge pressure
- flow、speed、operating state
- lubrication observations
- CMMS work orders 與 inspection notes
- equipment manual 與 maintenance strategy

### Solera 如何處理

1. Pulse 檢查 vibration sensor quality 與 sampling coverage。
2. Agent 只比較相同 operating regime，避免把 load change 當 degradation。
3. 找出 vibration、temperature、pressure 的 change-point order。
4. Thread 取得 P-204 hierarchy、bearing model、recent WO 與 similar failures。
5. Agent 比較 bearing wear、cavitation、misalignment、sensor bias。
6. Evidence 顯示每個 hypothesis 的支持與反證。
7. Action Rail 建立 vibration route／alignment inspection draft。
8. 不直接宣稱 RUL，也不自動建立或 dispatch maintenance order。

### 能降低的成本

- 不必要 preventive maintenance
- 重複 troubleshooting 工時
- unplanned downtime exposure
- spare-parts expedite cost
- condition-monitoring data 與 CMMS 分離造成的盲點

### Pilot KPI

- analyst review time
- false-positive maintenance recommendation rate
- Top-3 failure-mode agreement
- repeat event retrieval time
- planned vs unplanned maintenance ratio
- lead time before confirmed failure

### 一句話 Pitch

> Solera 不只告訴你 vibration 變高，而是解釋它在什麼 operating condition 下變高、與哪些訊號同步，以及過去哪一次維修最相關。

---

## UC-03｜Batch Quality Deviation Investigation

**適合客戶**：Food & Beverage、Pharmaceutical、Biotech、Specialty Chemical
**主要買方**：Quality Manager、Production Manager、Process Development、QA
**成熟度**：Pilot template — 建議 LOOP-3

### 客戶現場故事

Batch B-2026-0718 在 heating/holding 階段出現 2.5°C temperature excursion。
Final quality test 尚未完成，但 production、QA 與 engineering 必須迅速回答：

- 哪個階段開始偏移？
- jacket temperature、agitator、flow 或 sensor 哪個先改變？
- 哪些原料 lot、equipment state 與 operator actions 與此 batch 有關？
- SOP 與 master recipe 使用的是哪個 revision？
- 是否有類似 deviation 與已核准 disposition？

### 所需資料

- MES batch genealogy
- Historian temperature、pressure、flow、agitator Tags
- recipe phase transitions
- LIMS sample/result
- raw-material lot
- equipment cleaning/calibration records
- SOP、batch record、deviation/CAPA cases

### Solera 如何處理

1. Thread 建立 Batch → Material Lot → Equipment → Tag → Sample 關係。
2. Timeline 對齊 process time、phase time、operator event 與 lab sample time。
3. Pulse 標示 sensor calibration、missing samples 與 late-arriving LIMS data。
4. Agent 比較 heat-transfer restriction、agitator issue、recipe timing、
   sensor bias 與 raw-material variability。
5. 找出 current SOP/master recipe revision。
6. 取得 similar deviations、approved CAPA 與 disposition history。
7. 建立 deviation investigation draft。
8. 不替 QA 做 batch release/reject decision。

### 能降低的成本

- batch record review 工時
- QA/Engineering 跨系統蒐證時間
- product hold duration
- 重複 deviation investigation
- 使用過期 SOP/recipe 的合規風險

### Pilot KPI

- deviation open → evidence package ready
- batch genealogy completeness
- current-revision retrieval accuracy
- similar deviation retrieval precision
- product hold hours
- reviewer edit/override rate

### 一句話 Pitch

> Solera 把一個 temperature excursion，轉成包含 batch genealogy、process phase、SOP revision 與 similar CAPA 的 review-ready deviation package。

---

## UC-04｜Machine、Quality 與 Scrap Root-cause

**適合客戶**：Automotive、Electronics、Semiconductor Packaging、Machining
**主要買方**：Plant Manager、Manufacturing Engineer、Quality、OEE Team
**成熟度**：Pilot template

### 客戶現場故事

Line 4 的 defect rate 從 1.2% 上升到 4.8%。MES 顯示問題集中在兩個 part
numbers，但 machine alarms 並不明顯。Quality、Maintenance 與 Production
分別查看不同系統：

- Quality 看 defect codes 與 inspection images。
- Production 看 cycle time 與 changeover。
- Maintenance 看 spindle、tool、coolant 與 machine alarms。

大家有資料，但沒有共同 investigation thread。

### 所需資料

- MES order、part、routing、cycle
- defect code 與 measurement
- machine mode、program、tool ID
- spindle load／temperature／vibration
- coolant pressure／temperature
- maintenance/tool-change history
- setup instruction 與 control plan

### Solera 如何處理

1. Thread 連接 Product → Work Order → Machine → Tool → Measurement。
2. Agent 比較 good vs bad production windows。
3. 找出 defect rate 上升前的 tool life、spindle load 或 coolant change。
4. 排除單純 product-mix 與 inspection-station bias。
5. 找到 current setup sheet、control plan 與 similar scrap events。
6. 建立 tool inspection、measurement verification 或 controlled trial draft。
7. 不自動改 machine recipe 或 process parameters。

### 能降低的成本

- scrap 與 rework
- line stop 與 engineering troubleshooting
- 不必要 tool replacement
- MES、quality、machine data 手動 join 的時間
- 重複發生但未形成 case memory 的損失

### Pilot KPI

- defect detection → bounded hypothesis
- scrap/rework units
- engineering hours per event
- repeat defect recurrence
- correct tool/machine/lot linkage rate
- accepted vs rejected Agent hypotheses

### 一句話 Pitch

> Solera 把「哪台機器出問題」提升成「哪個產品、工具、製程窗口與設備訊號共同導致 defect」。

---

## UC-05｜Utility Energy 與 Capacity Investigation

**適合客戶**：Data Center、Semiconductor、Commercial Campus、Chemical、Food
**主要買方**：Energy Manager、Facilities、Utilities、Sustainability、Finance
**成熟度**：Pilot template

### 客戶現場故事

Chilled-water plant 的 kW/ton 在兩週內增加 12%，但 cooling demand 沒有同比例
增加。Facilities team 不確定原因是：

- chiller fouling
- low delta-T syndrome
- pump staging
- cooling-tower approach
- sensor drift
- weather/load mix

單純 energy dashboard 只能顯示「變差」，無法形成可執行 investigation。

### 所需資料

- chiller power、load、supply/return temperature
- flow、pump speed、valve position
- condenser-water temperature
- cooling-tower fan state
- ambient wet-bulb
- equipment availability
- utility tariff
- maintenance/cleaning history

### Solera 如何處理

1. Deterministic analytics 計算 kW/ton、delta-T、approach 與 load-normalized baseline。
2. Pulse 檢查 meter/unit/time alignment。
3. Agent 把 weather、load mix 與 equipment availability 納入 context。
4. 比較 fouling、hydraulic imbalance、staging、sensor bias。
5. Thread 找到 maintenance history 與 cleaning procedure。
6. 建立 inspection/measurement verification draft。
7. 不直接更改 chiller、pump 或 BMS controls。

### 能降低的成本

- electricity demand/consumption
- capacity shortfall
- facilities troubleshooting 工時
- 不必要 cleaning/maintenance
- 錯誤 meter 或 unit 導致的假節能

### Pilot KPI

- load-normalized energy intensity
- deviation detection → accepted cause
- avoidable kWh 與 demand charge
- investigation labor
- meter-quality incidents
- verified savings，依 IPMVP/customer method 審核

### 一句話 Pitch

> Dashboard 告訴你能源變貴了；Solera 告訴你是在什麼負載、天氣與設備組合下變差，以及下一步應驗證哪一項 Evidence。

---

## UC-06｜Shift Handover 與 Industrial Knowledge Memory

**適合客戶**：所有 24/7 manufacturing、Utilities、Mining、Oil & Gas
**主要買方**：Operations、Plant Manager、Training、Digital Transformation
**成熟度**：部分能力 Live now；customer deployment 為 Pilot template

### 客戶現場故事

夜班發現 FV-101 偶發 position hesitation，但尚未形成 alarm。Operator 在 shift
log 留下一段文字，maintenance notification 仍在 planned。三天後相同現象造成
更明顯的 process deviation，但接班人員不知道前次事件。

### 所需資料

- shift logs
- operator rounds
- alarm/events
- work notifications
- historian trends
- SOP與 standing instructions
- equipment/Tag aliases

### Solera 如何處理

1. Agent 將自然語言設備名稱解析成 stable Asset identity。
2. Thread 連接 shift note、notification、Tags 與後續 alarm。
3. 自動建立未完成、重複出現與需要 follow-up 的 handover context。
4. 產生 evidence-backed shift summary。
5. 將 confirmed outcome 保存為 Case，供下一班與下一次事件 retrieval。
6. 不把 AI summary 當成正式 operating authorization。

### 能降低的成本

- shift-to-shift information loss
- 重複 troubleshooting
- 未追蹤 notification
- senior workforce retirement 的 knowledge loss
- 新進 operator 找資料與學習時間

### Pilot KPI

- handover preparation/review time
- unresolved item carry-over rate
- repeat event recognition
- Asset/Tag resolution accuracy
- operator correction rate
- retrieved case usefulness score

### 一句話 Pitch

> Solera 把交班紀錄從一段孤立文字，轉成與設備、趨勢、工單和後續事件相連的工業記憶。

---

## 3. 依客戶角色選擇第一個場景

### 對 Plant Manager

先講 UC-01 或 UC-04：

> 我們縮短的是異常發生到團隊取得共同 Evidence 的時間，目標是降低停機、scrap 與跨部門 troubleshooting。

### 對 Maintenance/Reliability

先講 UC-02：

> 我們把 condition data、operating context 與 work history 放進同一個 investigation，減少 false alarms 與不必要維修。

### 對 Quality/QA

先講 UC-03：

> 我們讓每個 deviation 都能追到 batch、equipment、process phase、sample、SOP revision 與 similar CAPA。

### 對 Energy/Facilities

先講 UC-05：

> 我們不只監控 energy KPI，而是建立 load-normalized root-cause 與可驗證 savings workflow。

### 對 Operations/Training

先講 UC-06：

> 我們把 shift logs、事件與資深人員經驗，轉成下一班能立即使用的 Evidence-linked memory。

### 對 CIO／Digital／IT

講共用平台：

> 六個 use cases 不需要六套資料平台。Data Hub、Pulse、Thread、identity、policy、Evidence 與 approval 是共用底座；替換的是 scenario、Skills 與 customer connectors。

## 4. 如何計算客戶價值

### Investigation labor

```text
事件數/年 × 每次節省分鐘 ÷ 60 × fully-loaded hourly cost
```

### Downtime exposure

```text
符合條件事件數 × 提前識別小時 × contribution margin/hour
× customer-approved confidence factor
```

### Scrap/off-spec exposure

```text
受影響產量 × scrap/off-spec unit cost × 可歸因改善比例
```

### Energy

```text
load-normalized avoidable kWh × tariff
+ verified demand-charge reduction
```

### Knowledge/Compliance

以 review time、search time、revision error、repeat investigation 與 audit finding
量測，不先虛構 monetary saving。

## 5. 建議的產品 Scenario Roadmap

### 現在：LOOP-1

連續製程 valve stiction、alarm flood、Evidence、SOP、Case、Action draft。

### 下一個：LOOP-2 Reliability

Pump/compressor degradation。這是跨 Chemical、Power、Mining、Water 最容易共用的
場景，建議優先。

### 第三個：LOOP-3 Batch Quality

Batch temperature deviation、genealogy、LIMS、SOP revision、deviation draft。

### 第四個：LOOP-4 Energy

Chilled-water plant energy/capacity investigation，適合 facilities 與 ESG buyer。

## 6. 每個新 Scenario 的標準交付

每套 scenario 都必須包含：

1. versioned Scenario Manifest
2. Asset hierarchy 與 20–60 個 Tags
3. normal、Hero、alternative、missing-data runs
4. 5–20 個 alarms/events
5. 3–8 份 SOP/manual/work-history documents
6. 5–10 個 historical cases
7. 3 個 bounded hypotheses
8. deterministic calculations
9. safe-decline rules
10. draft-only Action
11. 30–50 個 golden evaluation cases
12. customer 10-minute demo script

## 7. Sales discovery：只問客戶七個問題

1. 哪一類事件最常讓多個部門同時找資料？
2. 每次事件從發生到得到第一個可信 hypothesis 要多久？
3. 目前要切換哪些 systems/screens/documents？
4. 哪些資料品質問題最常讓團隊做錯判斷？
5. 哪個 decision 必須由人核准？
6. 過去案例是否能被搜尋與重用？
7. 成功要用時間、scrap、downtime、energy 還是 compliance 衡量？

回答完後，選一個 Use Case、20–50 個 Tags、3–5 份文件與 10–20 個
historical cases，建立第一個 read-only Pilot。
