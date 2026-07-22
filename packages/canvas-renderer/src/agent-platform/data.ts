export type AgentId =
  | "loop1"
  | "loop2"
  | "loop3"
  | "loop4"
  | "fasten1"
  | "heat1";
export type AgentPortfolio = "chemical" | "precision";
export type AgentAccent =
  | "cyan"
  | "amber"
  | "violet"
  | "green"
  | "steel"
  | "copper";
export type AgentMaturity = "live" | "concept";

export interface ConceptMetric {
  label: string;
  value: string;
  detail: string;
  tone: "neutral" | "warning" | "critical" | "positive";
}

export interface ConceptTraceStep {
  type: string;
  title: string;
  detail: string;
}

export interface ConceptEvidence {
  kind: string;
  source: string;
  claim: string;
}

export interface ConceptScenario {
  scenarioLabel: string;
  scenarioDescription: string;
  runLabel: string;
  verdict: string;
  summary: string;
  confidenceLabel: string;
  confidence: number;
  metrics: ConceptMetric[];
  factors: Array<{ label: string; value: number; direction: "up" | "down" }>;
  traces: ConceptTraceStep[];
  evidence: ConceptEvidence[];
  actionTitle: string;
  actionBody: string;
  chart: {
    primaryLabel: string;
    secondaryLabel: string;
    limitLabel: string;
    primary: number[];
    secondary: number[];
    limit: number[];
    unit: string;
  };
}

export interface AgentDefinition {
  id: AgentId;
  portfolio: AgentPortfolio;
  code: string;
  title: string;
  shortTitle: string;
  domain: string;
  archetype: string;
  maturity: AgentMaturity;
  accent: AgentAccent;
  description: string;
  outcome: string;
  sharedCapabilities: string[];
  preview: number[];
  scenario?: ConceptScenario;
}

export const AGENTS: AgentDefinition[] = [
  {
    id: "loop1",
    portfolio: "chemical",
    code: "LOOP-1",
    title: "反應器冷卻偏差調查",
    shortTitle: "Causal Investigation",
    domain: "Chemical · Continuous Process",
    archetype: "Evidence-first Root Cause Agent",
    maturity: "live",
    accent: "cyan",
    description:
      "把 valve command、independent position、cooling flow、alarms、SOP 與歷史案例組成可重播調查。",
    outcome: "18 個 alarms → 一個可 review 的 Evidence package",
    sharedCapabilities: ["Pulse", "Thread", "Read-only Tools", "Evidence", "Approval"],
    preview: [42, 43, 41, 45, 49, 58, 67, 76, 79, 82],
  },
  {
    id: "loop2",
    portfolio: "chemical",
    code: "LOOP-2",
    title: "FCC 再生器後燃風險 Agent",
    shortTitle: "Regenerator Afterburn Guard",
    domain: "Refining · FCC Regeneration",
    archetype: "Dynamic Risk Soft Sensor",
    maturity: "concept",
    accent: "amber",
    description:
      "融合 dense/dilute phase 溫度、O₂、CO/CO₂、air distribution 與 catalyst circulation，動態估算 afterburn risk。",
    outcome: "固定高溫警報 → 會隨製程條件移動的風險邊界",
    sharedCapabilities: ["Pulse", "Soft Sensor", "Dynamic Envelope", "Evidence", "Policy"],
    preview: [28, 31, 34, 40, 48, 59, 72, 85, 91, 88],
    scenario: {
      scenarioLabel: "Dilute-phase afterburn onset",
      scenarioDescription:
        "Spent catalyst coke load 上升後，稀相 CO oxidation 加速；dense bed 尚未越過固定限制，但 cyclone temperature 已偏離動態 envelope。",
      runLabel: "Run Afterburn Analysis",
      verdict: "後燃風險正在形成",
      summary:
        "稀相與 dense bed 的溫差持續擴大，CO 降低但 CO₂ 與 cyclone temperature 同步上升。最符合稀相持續氧化，不宜只用單一 700°C 門檻判定。",
      confidenceLabel: "Bounded risk score",
      confidence: 82,
      metrics: [
        {
          label: "Afterburn risk",
          value: "82%",
          detail: "未來 12 分鐘",
          tone: "critical",
        },
        {
          label: "Dilute–dense ΔT",
          value: "+74°C",
          detail: "動態差值持續擴大",
          tone: "warning",
        },
        {
          label: "CO oxidation index",
          value: "1.46",
          detail: "高於 synthetic baseline",
          tone: "warning",
        },
      ],
      factors: [
        { label: "稀相溫升速率", value: 92, direction: "up" },
        { label: "CO → CO₂ shift", value: 81, direction: "up" },
        { label: "Air distribution imbalance", value: 64, direction: "up" },
        { label: "Catalyst circulation", value: 38, direction: "down" },
      ],
      traces: [
        {
          type: "context",
          title: "鎖定再生器與 15 分鐘時間窗",
          detail: "確認 synthetic scenario、Asset scope 與非安全系統邊界。",
        },
        {
          type: "quality",
          title: "驗證 flue-gas 與 thermal signals",
          detail: "檢查 O₂、CO、CO₂、dense/dilute/cyclone temperature freshness。",
        },
        {
          type: "model",
          title: "計算 dynamic operating envelope",
          detail: "依 coke load、air rate 與 catalyst circulation 正規化溫度風險。",
        },
        {
          type: "evidence",
          title: "比較 afterburn 與 sensor-bias evidence",
          detail: "保留 thermocouple bias 與 air maldistribution alternatives。",
        },
        {
          type: "forecast",
          title: "預估 12 分鐘風險軌跡",
          detail: "輸出 bounded risk score 與 uncertainty，不宣稱 safety probability。",
        },
        {
          type: "policy",
          title: "建立人工 review 草稿",
          detail: "不自動改 air flow、slide valve 或 catalyst circulation。",
        },
      ],
      evidence: [
        {
          kind: "signal",
          source: "RG-TI-DILUTE-04",
          claim: "稀相溫度變化率先於 cyclone high alarm。",
        },
        {
          kind: "calculation",
          source: "afterburn-envelope@concept-0.1",
          claim: "Dynamic envelope 已納入 coke load 與 air-rate normalization。",
        },
        {
          kind: "analyzer",
          source: "RG-AI-CO-02 / CO2-02",
          claim: "CO 降低與 CO₂ 上升支持 secondary oxidation。",
        },
        {
          kind: "procedure",
          source: "SOP-FCC-RG-07 Rev C",
          claim: "取得 approved afterburn review checklist。",
        },
      ],
      actionTitle: "Review regenerator air distribution",
      actionBody:
        "建立 inspection/review 草稿：交叉確認 cyclone thermocouples、flue-gas analyzers 與 air-grid distribution；不產生控制命令。",
      chart: {
        primaryLabel: "Dilute phase",
        secondaryLabel: "Dense bed",
        limitLabel: "Dynamic envelope",
        primary: [664, 668, 674, 683, 698, 717, 738, 752, 761, 768],
        secondary: [662, 664, 666, 669, 673, 677, 681, 686, 690, 694],
        limit: [711, 712, 713, 715, 717, 720, 722, 724, 726, 728],
        unit: "°C",
      },
    },
  },
  {
    id: "loop3",
    portfolio: "chemical",
    code: "LOOP-3",
    title: "觸媒活性與 Run-length Agent",
    shortTitle: "Catalyst Activity & Run-length",
    domain: "Refining · Hydroprocessing",
    archetype: "Predictive Lifecycle Agent",
    maturity: "concept",
    accent: "violet",
    description:
      "正規化 feed severity、H₂ partial pressure、LHSV、WABT、ΔP 與 product lab，追蹤 catalyst deactivation。",
    outcome: "零散 trend → 可解釋的 activity index 與 run-length range",
    sharedCapabilities: ["Lab Fusion", "Lifecycle Model", "Scenario Compare", "Evidence", "Planning"],
    preview: [96, 94, 91, 89, 86, 83, 80, 77, 74, 71],
    scenario: {
      scenarioLabel: "High-severity feed campaign",
      scenarioDescription:
        "Feed sulfur 與 nitrogen 上升，WABT compensation 增加；Agent 必須區分正常 severity adjustment、catalyst deactivation 與 analyzer bias。",
      runLabel: "Estimate Catalyst Activity",
      verdict: "觸媒活性下降快於 feed-normalized baseline",
      summary:
        "排除 feed sulfur、LHSV 與 H₂ partial pressure 後，normalized activity slope 仍持續下降；reactor ΔP 同步緩升，較符合 deactivation/fouling，而非單一 product analyzer bias。",
      confidenceLabel: "Model confidence",
      confidence: 76,
      metrics: [
        {
          label: "Activity index",
          value: "71%",
          detail: "Feed-normalized",
          tone: "warning",
        },
        {
          label: "Deactivation slope",
          value: "−0.18%/day",
          detail: "28-day bounded fit",
          tone: "warning",
        },
        {
          label: "Projected run length",
          value: "82–106 days",
          detail: "依目前 severity range",
          tone: "neutral",
        },
      ],
      factors: [
        { label: "Normalized WABT demand", value: 87, direction: "up" },
        { label: "Reactor ΔP growth", value: 71, direction: "up" },
        { label: "Feed sulfur severity", value: 63, direction: "up" },
        { label: "H₂ partial pressure support", value: 42, direction: "down" },
      ],
      traces: [
        {
          type: "context",
          title: "建立 catalyst campaign context",
          detail: "連結 catalyst lot、startup date、feed campaign 與 product target。",
        },
        {
          type: "quality",
          title: "對齊 Historian 與 delayed lab results",
          detail: "檢查 product sulfur lab、analyzer bias 與 sample timestamps。",
        },
        {
          type: "normalize",
          title: "正規化 feed 與 operating severity",
          detail: "納入 sulfur、nitrogen、LHSV、H₂ partial pressure 與 target spec。",
        },
        {
          type: "model",
          title: "估算 activity 與 deactivation slope",
          detail: "使用 versioned synthetic lifecycle model 與 bounded fit window。",
        },
        {
          type: "scenario",
          title: "比較 run-length scenarios",
          detail: "比較 current、reduced severity 與 planned turnaround windows。",
        },
        {
          type: "policy",
          title: "建立 planning draft",
          detail: "不自動提高 reactor temperature 或改變 feed rate。",
        },
      ],
      evidence: [
        {
          kind: "historian",
          source: "HDT-WABT / RX-ΔP",
          claim: "WABT demand 與 pressure-drop slope 同步上升。",
        },
        {
          kind: "lab",
          source: "LIMS-PRODUCT-S-28D",
          claim: "Product sulfur lab 已按 sample time 對齊。",
        },
        {
          kind: "calculation",
          source: "catalyst-activity@concept-0.1",
          claim: "Feed/H₂/LHSV normalization inputs 與版本已保存。",
        },
        {
          kind: "case",
          source: "CASE-HDT-2025-11",
          claim: "取得相似 ΔP growth campaign 與 confirmed outcome。",
        },
      ],
      actionTitle: "Prepare catalyst run-length review",
      actionBody:
        "建立 planning 草稿：確認 analyzer calibration、review ΔP trend，並比較 severity/turnaround scenarios；不直接變更 operating target。",
      chart: {
        primaryLabel: "Activity index",
        secondaryLabel: "Feed-normalized baseline",
        limitLabel: "Planning floor",
        primary: [96, 94, 92, 89, 87, 84, 81, 78, 74, 71],
        secondary: [96, 95, 93, 92, 90, 88, 86, 84, 82, 80],
        limit: [68, 68, 68, 68, 68, 68, 68, 68, 68, 68],
        unit: "%",
      },
    },
  },
  {
    id: "loop4",
    portfolio: "chemical",
    code: "LOOP-4",
    title: "水質 Soft Sensor 與合規風險 Agent",
    shortTitle: "Water Quality Soft Sensor",
    domain: "Chemical · Wastewater",
    archetype: "Quality & Compliance Agent",
    maturity: "concept",
    accent: "green",
    description:
      "融合 pH、ORP、DO、UV254、turbidity、flow、dosing 與 delayed lab results，估算即時 effluent quality。",
    outcome: "數小時後的 lab result → 即時估算、uncertainty 與採樣優先序",
    sharedCapabilities: ["Sensor Fusion", "Lab Reconciliation", "Drift Monitor", "Evidence", "Compliance"],
    preview: [38, 40, 42, 45, 51, 58, 66, 74, 79, 83],
    scenario: {
      scenarioLabel: "Ammonia/COD breakthrough risk",
      scenarioDescription:
        "Upstream sour-water load 上升，ORP 與 DO response 落後；official lab 尚需數小時，Agent 先產生有 uncertainty 的 quality estimate。",
      runLabel: "Run Water Quality Estimate",
      verdict: "Effluent excursion risk 高於 synthetic site envelope",
      summary:
        "UV254、conductivity 與 upstream load 同步上升，DO recovery 變慢。Soft Sensor 預估 COD 接近 synthetic site limit；需優先採樣確認，不能把估算值當成 official lab result。",
      confidenceLabel: "Estimate confidence",
      confidence: 79,
      metrics: [
        {
          label: "Predicted COD",
          value: "118 ± 14 mg/L",
          detail: "Soft Sensor estimate",
          tone: "warning",
        },
        {
          label: "Excursion risk",
          value: "68%",
          detail: "未來 90 分鐘",
          tone: "warning",
        },
        {
          label: "Official lab ETA",
          value: "3h 20m",
          detail: "尚未回傳",
          tone: "neutral",
        },
      ],
      factors: [
        { label: "UV254 response", value: 86, direction: "up" },
        { label: "Upstream sour-water load", value: 78, direction: "up" },
        { label: "DO recovery delay", value: 69, direction: "up" },
        { label: "Aeration reserve", value: 45, direction: "down" },
      ],
      traces: [
        {
          type: "context",
          title: "建立 wastewater train context",
          detail: "連結 upstream units、treatment stages、sampling plan 與 site limits。",
        },
        {
          type: "quality",
          title: "檢查 sensors、drift 與 lab latency",
          detail: "驗證 pH、ORP、DO、UV254、turbidity、flow 與 sample time。",
        },
        {
          type: "fusion",
          title: "執行 multi-rate sensor fusion",
          detail: "對齊秒級 sensors、分鐘級 process state 與延遲 lab labels。",
        },
        {
          type: "model",
          title: "估算 quality 與 uncertainty",
          detail: "輸出 Soft Sensor estimate，不覆寫 official lab authority。",
        },
        {
          type: "trace",
          title: "追查 upstream contributors",
          detail: "比較 sour-water load、aeration、dosing 與 instrument drift。",
        },
        {
          type: "policy",
          title: "建立 sampling priority 草稿",
          detail: "不自動改 dosing 或宣告法規 compliance。",
        },
      ],
      evidence: [
        {
          kind: "sensor",
          source: "WW-UV254 / ORP / DO",
          claim: "三組 independent signals 支持 organic-load increase。",
        },
        {
          kind: "context",
          source: "SOUR-WATER-FLOW-07",
          claim: "Upstream load 變化先於 effluent response。",
        },
        {
          kind: "calculation",
          source: "water-soft-sensor@concept-0.1",
          claim: "Estimate、uncertainty、feature window 與 model version 已保存。",
        },
        {
          kind: "lab",
          source: "LIMS-COD-PENDING-442",
          claim: "Official sample pending；Agent estimate 未取代 lab result。",
        },
      ],
      actionTitle: "Prioritize confirmatory sampling",
      actionBody:
        "建立採樣與 process review 草稿：優先確認 COD/NH₃-N、檢查 aeration reserve 與 upstream load；不自動改加藥。",
      chart: {
        primaryLabel: "Predicted COD",
        secondaryLabel: "Last lab-aligned trend",
        limitLabel: "Synthetic site limit",
        primary: [62, 64, 67, 72, 79, 88, 97, 106, 113, 118],
        secondary: [61, 62, 64, 67, 71, 76, 82, 88, 93, 97],
        limit: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
        unit: "mg/L",
      },
    },
  },
  {
    id: "fasten1",
    portfolio: "precision",
    code: "FASTEN-1",
    title: "從客戶詢價圖面到首件良品",
    shortTitle: "RFQ-to-First-Good-Part",
    domain: "Precision Manufacturing / 精密加工 · Fasteners",
    archetype: "Engineering Workflow Agent",
    maturity: "concept",
    accent: "steel",
    description:
      "串起 Email、工程圖、歷史產品、ERP、機台能力、模具、Edge signals 與首件量測，協助工程師判斷能不能做、怎麼做與風險在哪裡。",
    outcome: "一張新圖面 → 一條有來源、有人核准的首件良品路徑",
    sharedCapabilities: [
      "Document Intake",
      "Drawing Parser",
      "Product Thread",
      "Machine Edge",
      "Quality Evidence",
      "Human Gates",
    ],
    preview: [18, 25, 34, 42, 56, 63, 71, 78, 89, 96],
  },
  {
    id: "heat1",
    portfolio: "precision",
    code: "HEAT-1",
    title: "從熱處理批次到可核准放行",
    shortTitle: "Batch-to-Release Quality",
    domain: "Metals / 金屬熱處理 · Batch Quality",
    archetype: "Quality Soft Sensor Workflow",
    maturity: "concept",
    accent: "copper",
    description:
      "連結零件規格、材料批次、裝載位置、爐程、碳勢、淬火、延遲 lab 與量測結果，提前估算 case depth、hardness 與 distortion risk。",
    outcome: "延遲／破壞性檢驗 → 提前分層風險、精準採樣與放行草稿",
    sharedCapabilities: [
      "Batch Passport",
      "Recipe Context",
      "Furnace Journey",
      "Quality Soft Sensor",
      "Deviation Evidence",
      "Release Gate",
    ],
    preview: [34, 38, 45, 57, 68, 76, 81, 74, 62, 55],
  },
];

export function getAgent(agentId: AgentId): AgentDefinition {
  const agent = AGENTS.find((item) => item.id === agentId);
  if (!agent) {
    throw new Error(`Unknown Agent definition: ${agentId}`);
  }
  return agent;
}
