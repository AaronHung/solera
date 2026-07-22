import type {
  Loop1Evidence,
  Loop1Investigation,
  Loop1Locale,
  Loop1TraceEvent,
} from "./types";

const UI = {
  "zh-TW": {
    lab: "合成工業 Agent 實驗室",
    disclosure: "合成資料 · 唯讀 · 非安全系統",
    connecting: "正在連接 LOOP-1 合成製程…",
    unit: "單元",
    timeline: "時間軸",
    investigation: "調查",
    evidence: "證據",
    unitTitle: "即時單元總覽",
    timelineTitle: "因果警報時間軸",
    investigationTitle: "Evidence-first 調查主控台",
    evidenceTitle: "Evidence 與案例關聯",
    heroEyebrow: "LOOP-1 / 反應器冷卻迴路",
    heroDescription:
      "同一個 backend scenario clock 驅動遙測、警報、Agent Evidence、重播與 Experience。",
    checking: "檢查中",
    lag: "秒延遲",
    replayMode: "重播模式",
    running: "執行中",
    paused: "已暫停",
    commandPosition: "閥指令－位置差",
    mismatchDetected: "偵測到不一致",
    tracking: "正常追蹤",
    reactorTemperature: "反應器溫度",
    deterministicSignal: "Deterministic 訊號",
    rawAlarms: "原始警報",
    criticalVisible: "個 critical 警報仍完整保留",
    eventClusters: "事件群組",
    causeGrouping: "依共同原因事件分組",
    noAlarms: "此重播時間窗沒有警報",
    runHeroHint: "請執行 Hero case，或將重播推進至 tick 180 之後。",
    compressedInto: "整理為",
    linkedCause: "保留共同原因關聯",
    noInvestigation: "尚未執行調查",
    updatingEvidence: "正在更新 Evidence…",
    supportingEvidence: "筆支持 Evidence",
    counterEvidence: "筆反證 Evidence",
    draftOnlyAction: "僅限草稿的 Action",
    noEvidence: "尚未建立 Evidence package",
    evidenceLedger: "Evidence ledger",
    records: "筆紀錄",
    documents: "文件",
    similarCases: "相似案例",
    skillTrace: "Skill 執行軌跡",
    score: "分數",
    locale: "中文 / EN",
    caseConsole: "Case Console",
    chooseCase: "選擇可重播案例",
    objective: "調查目標",
    objectivePlaceholder: "請描述要讓 Agent 驗證的問題與決策需求。",
    boundedPlan: "Bounded Plan",
    startInvestigation: "Start Investigation",
    executionTrace: "Agent 執行軌跡",
    waitingTrace: "選擇案例並啟動調查後，這裡會顯示實際 tool 與 Evidence 事件。",
    traceDisclaimer:
      "顯示的是可稽核工作步驟，不是模型私密 chain-of-thought。",
    planQuality: "確認關鍵訊號品質與歷史完整性",
    planAlarm: "整理警報群組與最早變化",
    planContext: "取得 SOP、設備文件與歷史案例",
    planHypothesis: "比較根因假設與反證",
    planSafety: "套用唯讀與人工核准邊界",
    approvedDraft: "草稿已送交人工核准。",
    approvalFailed: "核准申請失敗",
    investigationFailed: "LOOP-1 調查失敗",
    loadFailed: "LOOP-1 載入失敗",
    controlFailed: "LOOP-1 控制失敗",
  },
  en: {
    lab: "Synthetic Industrial Agent Lab",
    disclosure: "SYNTHETIC · READ-ONLY · NOT A SAFETY SYSTEM",
    connecting: "Connecting to LOOP-1 synthetic plant…",
    unit: "Unit",
    timeline: "Timeline",
    investigation: "Investigation",
    evidence: "Evidence",
    unitTitle: "Live Unit Overview",
    timelineTitle: "Causal Alarm Timeline",
    investigationTitle: "Evidence-first Investigation Console",
    evidenceTitle: "Evidence & Case Thread",
    heroEyebrow: "LOOP-1 / REACTOR COOLING LOOP",
    heroDescription:
      "One backend scenario clock drives telemetry, alarms, Agent Evidence, replay, and this Experience.",
    checking: "checking",
    lag: "s lag",
    replayMode: "REPLAY MODE",
    running: "running",
    paused: "Paused",
    commandPosition: "COMMAND–POSITION",
    mismatchDetected: "Mismatch detected",
    tracking: "Tracking",
    reactorTemperature: "REACTOR TEMPERATURE",
    deterministicSignal: "Deterministic signal",
    rawAlarms: "RAW ALARMS",
    criticalVisible: "critical remain visible",
    eventClusters: "EVENT CLUSTERS",
    causeGrouping: "Cause-event grouping",
    noAlarms: "No alarms in this replay window",
    runHeroHint: "Run the Hero case or continue past tick 180.",
    compressedInto: "compressed into",
    linkedCause: "linked cause retained",
    noInvestigation: "No investigation yet",
    updatingEvidence: "Updating Evidence…",
    supportingEvidence: "supporting Evidence",
    counterEvidence: "counter Evidence",
    draftOnlyAction: "DRAFT-ONLY ACTION",
    noEvidence: "No Evidence package yet",
    evidenceLedger: "Evidence ledger",
    records: "records",
    documents: "Documents",
    similarCases: "Similar cases",
    skillTrace: "Skill trace",
    score: "score",
    locale: "中文 / EN",
    caseConsole: "Case Console",
    chooseCase: "Choose a replayable case",
    objective: "Investigation objective",
    objectivePlaceholder: "Describe the question and decision the Agent should verify.",
    boundedPlan: "Bounded Plan",
    startInvestigation: "Start Investigation",
    executionTrace: "Agent execution trace",
    waitingTrace:
      "Start a case to display actual tool, Evidence, hypothesis, and safety events.",
    traceDisclaimer:
      "This shows auditable operational steps, not private model chain-of-thought.",
    planQuality: "Validate required signal quality and history",
    planAlarm: "Cluster alarms and locate earliest change",
    planContext: "Retrieve procedures, documents, and cases",
    planHypothesis: "Rank hypotheses with counter-evidence",
    planSafety: "Apply read-only and human-approval boundary",
    approvedDraft: "Draft sent for human approval.",
    approvalFailed: "Approval request failed",
    investigationFailed: "LOOP-1 investigation failed",
    loadFailed: "LOOP-1 failed to load",
    controlFailed: "LOOP-1 control failed",
  },
} as const;

export type Loop1UiKey = keyof (typeof UI)["zh-TW"];

export function t(locale: Loop1Locale, key: Loop1UiKey): string {
  return UI[locale][key];
}

const ASSETS: Record<string, { "zh-TW": string; en: string }> = {
  "component-cooling-valve": { "zh-TW": "冷卻水控制閥", en: "Cooling valve" },
  "equipment-reactor": { "zh-TW": "反應器", en: "Reactor" },
  "equipment-condenser": { "zh-TW": "冷凝器", en: "Condenser" },
  "equipment-separator": { "zh-TW": "分離槽", en: "Separator" },
  "equipment-compressor": { "zh-TW": "循環壓縮機", en: "Recycle compressor" },
  "equipment-stripper": { "zh-TW": "汽提塔", en: "Stripper" },
};

const TAGS: Record<string, { "zh-TW": string; en: string }> = {
  "cooling-valve-command": { "zh-TW": "冷卻閥指令", en: "Cooling-valve command" },
  "cooling-valve-position": { "zh-TW": "冷卻閥實際位置", en: "Cooling-valve position" },
  "cooling-water-flow": { "zh-TW": "冷卻水流量", en: "Cooling-water flow" },
  "reactor-temperature": { "zh-TW": "反應器溫度", en: "Reactor temperature" },
  "reactor-pressure": { "zh-TW": "反應器壓力", en: "Reactor pressure" },
  "reactor-level": { "zh-TW": "反應器液位", en: "Reactor level" },
  "condenser-duty": { "zh-TW": "冷凝器負荷", en: "Condenser duty" },
  "condenser-outlet-temp": { "zh-TW": "冷凝器出口溫度", en: "Condenser outlet temperature" },
  "separator-level": { "zh-TW": "分離槽液位", en: "Separator level" },
  "separator-pressure": { "zh-TW": "分離槽壓力", en: "Separator pressure" },
  "compressor-load": { "zh-TW": "壓縮機負載", en: "Compressor load" },
  "compressor-vibration-de": { "zh-TW": "壓縮機驅動端振動", en: "Compressor DE vibration" },
  "product-quality-proxy": { "zh-TW": "產品品質代理指標", en: "Product-quality proxy" },
  "stripper-temperature-top": { "zh-TW": "汽提塔頂溫度", en: "Stripper top temperature" },
};

const STATES: Record<string, { "zh-TW": string; en: string }> = {
  normal: { "zh-TW": "正常", en: "normal" },
  degrading: { "zh-TW": "劣化中", en: "degrading" },
  "alarm-flood": { "zh-TW": "警報洪峰", en: "alarm flood" },
  recovery: { "zh-TW": "恢復中", en: "recovery" },
  offline: { "zh-TW": "離線", en: "offline" },
  unknown: { "zh-TW": "未知", en: "unknown" },
  complete: { "zh-TW": "調查完成", en: "complete" },
  "safe-decline": { "zh-TW": "安全拒答", en: "safe decline" },
  "no-abnormality": { "zh-TW": "未發現異常", en: "no abnormality" },
  supported: { "zh-TW": "已支持", en: "supported" },
  possible: { "zh-TW": "可能", en: "possible" },
  "insufficient-data": { "zh-TW": "資料不足", en: "insufficient data" },
  critical: { "zh-TW": "關鍵", en: "critical" },
  high: { "zh-TW": "高", en: "high" },
  medium: { "zh-TW": "中", en: "medium" },
  low: { "zh-TW": "低", en: "low" },
};

const HYPOTHESES: Record<
  string,
  { title: { "zh-TW": string; en: string }; reasoning: { "zh-TW": string; en: string } }
> = {
  "hypothesis-valve-stiction": {
    title: { "zh-TW": "FV-101 冷卻水控制閥卡滯", en: "FV-101 cooling-water valve stiction" },
    reasoning: {
      "zh-TW": "閥指令與位置的落差先出現，之後才發生冷卻流量下降與延遲的熱反應。",
      en: "Command-position mismatch precedes lower cooling flow and delayed response.",
    },
  },
  "hypothesis-position-bias": {
    title: { "zh-TW": "閥位回授偏差", en: "Valve position feedback bias" },
    reasoning: {
      "zh-TW": "回授偏差可解釋指令與位置落差，但無法完整解釋流量及溫度的連動。",
      en: "Feedback bias explains mismatch but not the full linked process response.",
    },
  },
  "hypothesis-header-disturbance": {
    title: { "zh-TW": "共用冷卻水總管擾動", en: "Common cooling-water header disturbance" },
    reasoning: {
      "zh-TW": "公用系統擾動可降低流量，但無法解釋本地閥指令與位置的落差。",
      en: "A utility disturbance can reduce flow but not explain local valve mismatch.",
    },
  },
};

const DOCUMENTS: Record<string, string> = {
  "sop-r101-cooling-rev4": "SOP-R101-04 反應器冷卻偏差程序（Revision 4）",
  "pid-loop1-area-12-rev7": "LOOP-1 Area 12 P&ID（Revision 7）",
  "manual-fv101-rev2": "FV-101 控制閥維修手冊（Revision 2）",
  "moc-loop1-2025-014": "MOC-2025-014 FV-101 閥位回授升級",
  "eptw-loop1-2025-221": "LOOP-1 電子工作許可證 EPTW-2025-221",
  "shift-log-loop1-2025-12-31": "LOOP-1 夜班交班紀錄",
  "alarm-philosophy-rev5": "LOOP-1 警報管理原則（Revision 5）",
  "work-history-fv101-2025": "FV-101 2025 維修歷史",
};

const TOOLS: Record<string, { "zh-TW": string; en: string }> = {
  query_signals: { "zh-TW": "查詢關鍵訊號", en: "Query critical signals" },
  cluster_alarms: { "zh-TW": "整理警報群組", en: "Cluster alarms" },
  find_change_points: { "zh-TW": "尋找最早變化點", en: "Find change points" },
  get_document_revision: { "zh-TW": "取得正確文件版本", en: "Retrieve document revision" },
  search_cases: { "zh-TW": "搜尋相似案例", en: "Search similar cases" },
  calculate_kpi: { "zh-TW": "計算合成 KPI", en: "Calculate synthetic KPI" },
  draft_work_order: { "zh-TW": "建立檢查草稿", en: "Draft inspection work order" },
};

export function assetLabel(id: string, locale: Loop1Locale): string {
  return ASSETS[id]?.[locale] ?? id;
}

export function tagLabel(id: string, locale: Loop1Locale): string {
  return TAGS[id]?.[locale] ?? id;
}

export function stateLabel(id: string, locale: Loop1Locale): string {
  return STATES[id]?.[locale] ?? id;
}

export function hypothesisTitle(
  hypothesis: Loop1Investigation["hypotheses"][number],
  locale: Loop1Locale,
): string {
  return HYPOTHESES[hypothesis.hypothesisId]?.title[locale] ?? hypothesis.title;
}

export function hypothesisReasoning(
  hypothesis: Loop1Investigation["hypotheses"][number],
  locale: Loop1Locale,
): string {
  return HYPOTHESES[hypothesis.hypothesisId]?.reasoning[locale] ?? hypothesis.reasoningSummary;
}

export function investigationSummary(
  result: Loop1Investigation,
  locale: Loop1Locale,
): string {
  if (locale === "en") return result.summary;
  if (result.status === "safe-decline") {
    return "關鍵訊號的歷史或品質不足，Solera 安全拒絕進行根因排名。";
  }
  if (result.status === "no-abnormality") {
    return "目前合成製程沒有出現 LOOP-1 定義的閥指令－位置－流量異常模式。";
  }
  return "最早的異常模式是冷卻閥指令與實際位置不一致，之後才出現流量下降與延遲的反應器／下游偏移；閥門卡滯是主要合成假設，不是安全判定。";
}

export function safetyNotice(result: Loop1Investigation, locale: Loop1Locale): string {
  return locale === "zh-TW"
    ? "此為合成、唯讀的調查結果，不是設備控制指令或安全判定。"
    : result.safetyNotice;
}

export function evidenceClaim(item: Loop1Evidence, locale: Loop1Locale): string {
  if (locale === "en") return item.claim;
  if (item.evidenceId === "evidence-command-position-mismatch") {
    return "冷卻閥指令高於獨立閥位回授。";
  }
  if (item.evidenceId === "evidence-alarm-cluster") {
    return "多個下游警報連結至同一個已記錄原因事件。";
  }
  if (item.evidenceId === "evidence-demo-kpi") {
    return "依明確假設計算的合成 Demo KPI；不是客戶效益證明。";
  }
  if (item.evidenceId.startsWith("evidence-signal-")) {
    return `目前合成訊號：${tagLabel(item.sourceId, locale)}。`;
  }
  if (item.evidenceId.startsWith("evidence-change-")) {
    return `${tagLabel(item.evidenceId.replace("evidence-change-", ""), locale)}的 bounded change point。`;
  }
  if (item.kind === "document") return `已取得受版本管理的文件：${item.sourceId}。`;
  if (item.kind === "case") return `已取得相似歷史案例：${item.sourceId}。`;
  if (item.kind === "quality") return `資料品質檢查未通過：${item.sourceId}。`;
  return item.claim;
}

export function documentTitle(
  document: Loop1Investigation["documents"][number],
  locale: Loop1Locale,
): string {
  return locale === "zh-TW" ? DOCUMENTS[document.documentId] ?? document.title : document.title;
}

export function similarCaseTitle(
  caseItem: Loop1Investigation["similarCases"][number],
  locale: Loop1Locale,
): string {
  if (locale === "en") return caseItem.title;
  if (caseItem.caseId.includes("stiction")) return "FV-101 冷卻閥卡滯歷史案例";
  if (caseItem.caseId.includes("position-bias")) return "閥位回授偏差歷史案例";
  if (caseItem.caseId.includes("header")) return "冷卻水總管擾動歷史案例";
  if (caseItem.caseId.includes("flow-dropout")) return "流量訊號中斷歷史案例";
  if (caseItem.caseId.includes("feed-step")) return "計畫性進料負荷調升案例";
  if (caseItem.caseId.includes("condenser")) return "冷凝器積垢歷史案例";
  if (caseItem.caseId.includes("compressor")) return "壓縮機振動劣化歷史案例";
  if (caseItem.caseId.includes("separator")) return "分離槽液位控制歷史案例";
  if (caseItem.caseId.includes("stripper")) return "汽提塔品質偏差歷史案例";
  if (caseItem.caseId.includes("stale-data")) return "Connector 資料延遲歷史案例";
  return `合成歷史案例（${caseItem.caseId}）`;
}

export function rootCauseLabel(rootCause: string, locale: Loop1Locale): string {
  if (locale === "en") return rootCause;
  const normalized = rootCause.toLowerCase();
  if (normalized.includes("stiction")) return "根因：控制閥卡滯";
  if (normalized.includes("position") || normalized.includes("bias")) {
    return "根因：閥位回授偏差";
  }
  if (normalized.includes("header")) return "根因：冷卻水總管擾動";
  if (normalized.includes("dropout")) return "根因：流量變送器訊號中斷";
  if (normalized.includes("throughput")) return "根因：計畫性產量調升";
  if (normalized.includes("condenser")) return "根因：冷凝器積垢";
  if (normalized.includes("bearing")) return "根因：驅動端軸承劣化";
  if (normalized.includes("level-loop")) return "根因：液位控制迴路調校";
  if (normalized.includes("reboiler")) return "根因：再沸器負荷擾動";
  if (normalized.includes("ingest delay")) return "根因：Connector 資料寫入延遲";
  return "根因：請參照案例 Evidence";
}

export function skillSummary(
  skillId: string,
  original: string,
  locale: Loop1Locale,
): string {
  if (locale === "en") return original;
  const summaries: Record<string, string> = {
    "loop1-alarm-triage": "依原因事件整理警報，同時保留 critical 警報。",
    "loop1-process-context": "比較關聯訊號、變化點與因果時間順序。",
    "loop1-procedure-safety": "取得受版本管理的程序文件並套用安全邊界。",
    "loop1-case-retrieval": "取得與資產及 Tag 關聯的合成歷史案例。",
    "loop1-asset-integrity": "比較控制閥、儀表與公用系統根因假設。",
    "loop1-shift-handover": "建立待人工核准、不可自動執行的檢查草稿。",
  };
  return summaries[skillId] ?? original;
}

export function evidenceKindLabel(kind: string, locale: Loop1Locale): string {
  if (locale === "en") return kind;
  const labels: Record<string, string> = {
    signal: "訊號",
    alarm: "警報",
    document: "文件",
    case: "案例",
    calculation: "計算",
    quality: "品質",
  };
  return labels[kind] ?? kind;
}

export function alarmMessage(
  alarm: { tagId: string | null; message: string },
  locale: Loop1Locale,
): string {
  if (locale === "en") return alarm.message;
  return alarm.tagId ? `${tagLabel(alarm.tagId, locale)}異常警報` : "製程事件警報";
}

export function traceEventLabel(event: Loop1TraceEvent, locale: Loop1Locale): string {
  if (event.type === "context") {
    return locale === "zh-TW" ? "已確認 Case、run 與 synthetic context" : "Case and run context validated";
  }
  if (event.type === "plan") {
    return locale === "zh-TW" ? "Bounded Agent Plan 已建立" : "Bounded Agent plan created";
  }
  if (event.type === "tool-start" || event.type === "tool-result") {
    const tool = String(event.payload.tool ?? "tool");
    const label = TOOLS[tool]?.[locale] ?? tool;
    return event.type === "tool-start"
      ? locale === "zh-TW" ? `開始：${label}` : `Started: ${label}`
      : locale === "zh-TW" ? `完成：${label}` : `Completed: ${label}`;
  }
  if (event.type === "evidence") {
    return locale === "zh-TW" ? "新增可追溯 Evidence" : "Traceable Evidence added";
  }
  if (event.type === "hypothesis") {
    const payload = event.payload.hypothesis as { hypothesisId?: string } | undefined;
    const id = payload?.hypothesisId ?? "";
    return locale === "zh-TW"
      ? `已排名根因假設：${HYPOTHESES[id]?.title["zh-TW"] ?? id}`
      : `Hypothesis ranked: ${HYPOTHESES[id]?.title.en ?? id}`;
  }
  if (event.type === "safety") {
    return locale === "zh-TW" ? "已套用安全與人工核准邊界" : "Safety and approval boundary applied";
  }
  if (event.type === "complete") {
    return locale === "zh-TW" ? "調查完成，結果與 Evidence 已封裝" : "Investigation and Evidence package complete";
  }
  return locale === "zh-TW" ? "調查發生錯誤" : "Investigation error";
}
