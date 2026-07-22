import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  Check,
  ChevronRight,
  CircleDot,
  Cpu,
  Database,
  Factory,
  FileCheck2,
  FileText,
  Gauge,
  GitCompare,
  Mail,
  Paperclip,
  Play,
  Route,
  ScanLine,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Wrench,
  X,
} from "lucide-react";

import {
  FASTEN_CASES,
  FASTEN_HYPOTHESES,
  FASTEN_MACHINES,
  FASTEN_MEASUREMENTS,
  FASTEN_RFQ,
  FASTEN_ROUTE,
  FASTEN_SPECS,
  FASTEN_STAGES,
  FASTEN_TRIAL_SIGNALS,
  type FastenStageId,
} from "./fasten1Data";

export interface Fasten1ExperienceProps {
  onBack: () => void;
  onClose?: () => void;
}

interface StageViewProps {
  revealed: boolean;
}

function linePoints(values: number[]): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  return values
    .map((value, index) => {
      const x = 8 + (index / Math.max(1, values.length - 1)) * 484;
      const y = 154 - ((value - min) / range) * 118;
      return `${x},${y}`;
    })
    .join(" ");
}

function IntakeStage() {
  return (
    <section className="fasten-stage-page fasten-intake-page">
      <header className="fasten-stage-hero">
        <div>
          <span>STAGE 01 · CUSTOMER INTAKE</span>
          <h1>一封詢價信，啟動跨系統 Engineering Workflow</h1>
          <p>
            不讓 LLM 直接「看信後猜報價」。Email Connector、Document Intake
            與版本控制先建立可追蹤的 RFQ context。
          </p>
        </div>
        <aside>
          <small>WORKFLOW CASE</small>
          <strong>{FASTEN_RFQ.id}</strong>
          <span>Due {FASTEN_RFQ.quoteDue}</span>
        </aside>
      </header>

      <div className="fasten-intake-grid">
        <article className="fasten-email-card">
          <header>
            <span><Mail /></span>
            <div>
              <small>RFQ INBOX / NEW</small>
              <strong>{FASTEN_RFQ.subject}</strong>
            </div>
            <time>{FASTEN_RFQ.received}</time>
          </header>
          <dl>
            <dt>From</dt>
            <dd>{FASTEN_RFQ.sender} · {FASTEN_RFQ.email}</dd>
            <dt>Customer</dt>
            <dd>{FASTEN_RFQ.customer}</dd>
          </dl>
          <p>{FASTEN_RFQ.message}</p>
          <div className="fasten-commercial-strip">
            <span><small>Annual volume</small><strong>{FASTEN_RFQ.quantity}</strong></span>
            <span><small>Lot size</small><strong>{FASTEN_RFQ.lotSize}</strong></span>
            <span><small>Target SOP</small><strong>{FASTEN_RFQ.sop}</strong></span>
          </div>
        </article>

        <article className="fasten-attachment-card">
          <header>
            <Paperclip />
            <div>
              <small>DOCUMENT INTAKE</small>
              <h2>3 attachments quarantined</h2>
            </div>
            <span>SCAN PASS</span>
          </header>
          <div>
            {FASTEN_RFQ.attachments.map((attachment, index) => (
              <article key={attachment.name}>
                <span>{index + 1}</span>
                <div>
                  <strong>{attachment.name}</strong>
                  <small>{attachment.type} · {attachment.size}</small>
                </div>
                <FileText />
              </article>
            ))}
          </div>
          <footer>
            <ShieldCheck />
            Files remain in synthetic tenant storage; hashes and revision metadata are recorded.
          </footer>
        </article>
      </div>

      <section className="fasten-agent-handoff">
        {[
          ["RFQ Engineering Agent", "理解需求、圖面與缺漏", Mail],
          ["Master Technician Agent", "連結機台、模具與試車", Wrench],
          ["Quality Evidence Agent", "比對規格並封裝首件證據", FileCheck2],
        ].map(([title, detail, Icon]) => {
          const StageIcon = Icon as typeof Mail;
          return (
            <article key={String(title)}>
              <StageIcon />
              <div><strong>{String(title)}</strong><span>{String(detail)}</span></div>
              <ChevronRight />
            </article>
          );
        })}
      </section>
    </section>
  );
}

function BoltDrawing({ revealed }: { revealed: boolean }) {
  return (
    <article className={`fasten-drawing-board ${revealed ? "is-scanned" : ""}`}>
      <header>
        <div>
          <small>ENGINEERING DRAWING / PAGE 1 OF 1</small>
          <strong>AB-102938 · HEX FLANGE BOLT · REV C</strong>
        </div>
        <span>PDF VECTOR + OCR + VISION</span>
      </header>
      <svg viewBox="0 0 760 450" role="img" aria-label="Synthetic M8 flange bolt engineering drawing">
        <defs>
          <pattern id="fasten-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" />
          </pattern>
          <marker id="fasten-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" />
          </marker>
        </defs>
        <rect className="drawing-grid" x="0" y="0" width="760" height="450" />
        <g className="drawing-object">
          <path d="M110 170 L150 144 L226 144 L250 164 L250 256 L226 276 L150 276 L110 250 Z" />
          <rect x="250" y="181" width="326" height="58" />
          <path d="M576 181 L630 181 L650 194 L650 226 L630 239 L576 239 Z" />
          {Array.from({ length: 13 }, (_, index) => (
            <path key={index} d={`M${396 + index * 14} 181 l14 58`} />
          ))}
          <line x1="76" y1="210" x2="682" y2="210" className="center-line" />
          <circle cx="156" cy="365" r="56" />
          <circle cx="156" cy="365" r="28" />
          <line x1="88" y1="365" x2="224" y2="365" className="center-line" />
          <line x1="156" y1="297" x2="156" y2="433" className="center-line" />
        </g>
        <g className="drawing-dimensions">
          <line x1="250" y1="116" x2="650" y2="116" markerStart="url(#fasten-arrow)" markerEnd="url(#fasten-arrow)" />
          <line x1="250" y1="126" x2="250" y2="168" />
          <line x1="650" y1="126" x2="650" y2="180" />
          <text x="425" y="104">45.0 +0 / −0.3</text>
          <line x1="270" y1="288" x2="630" y2="288" markerStart="url(#fasten-arrow)" markerEnd="url(#fasten-arrow)" />
          <text x="410" y="314">THREAD LENGTH 28.0</text>
          <line x1="680" y1="181" x2="680" y2="239" markerStart="url(#fasten-arrow)" markerEnd="url(#fasten-arrow)" />
          <text x="694" y="215">M8 × 1.25-6g</text>
          <line x1="76" y1="144" x2="76" y2="276" markerStart="url(#fasten-arrow)" markerEnd="url(#fasten-arrow)" />
          <text x="42" y="218" transform="rotate(-90 42 218)">Ø18.0 ±0.15</text>
          <text x="250" y="350">DETAIL B · FLANGE SERRATION</text>
        </g>
        <g className="drawing-notes">
          <rect x="476" y="328" width="268" height="106" />
          <line x1="476" y1="354" x2="744" y2="354" />
          <line x1="610" y1="328" x2="610" y2="434" />
          <text x="486" y="346">PART NO. AB-102938</text>
          <text x="620" y="346">REV C</text>
          <text x="486" y="376">MATERIAL: SCM435</text>
          <text x="486" y="397">HRC 32–39 / Q&T</text>
          <text x="486" y="418">Zn-Ni 8–12 μm / 720 h</text>
        </g>
        {revealed && (
          <g className="drawing-callouts">
            <circle cx="448" cy="116" r="12" /><text x="444" y="121">1</text>
            <circle cx="680" cy="210" r="12" /><text x="676" y="215">2</text>
            <circle cx="76" cy="210" r="12" /><text x="72" y="215">3</text>
            <circle cx="590" cy="397" r="12" /><text x="586" y="402">4</text>
          </g>
        )}
      </svg>
      <footer>
        <span>Source of Truth: vector dimensions / parser output</span>
        <span>Vision result: cross-check only</span>
      </footer>
    </article>
  );
}

function DrawingStage({ revealed }: StageViewProps) {
  return (
    <section className="fasten-stage-page">
      <header className="fasten-stage-hero compact">
        <div>
          <span>STAGE 02 · DRAWING INTELLIGENCE</span>
          <h1>圖面不是交給 LLM 猜，而是多路解析後交叉驗證</h1>
          <p>Vector parser、OCR、區域切割與 multimodal understanding 共同產生 Canonical Product Specification。</p>
        </div>
        <aside><small>PARSER STATUS</small><strong>{revealed ? "8 fields mapped" : "Ready to scan"}</strong><span>Revision C locked</span></aside>
      </header>
      <div className="fasten-drawing-grid">
        <BoltDrawing revealed={revealed} />
        <article className={`fasten-spec-panel ${revealed ? "is-revealed" : ""}`}>
          <header>
            <ScanLine />
            <div><small>CANONICAL SPECIFICATION</small><h2>{revealed ? "7 verified · 1 missing" : "Awaiting analysis"}</h2></div>
          </header>
          <div className="fasten-spec-list">
            {FASTEN_SPECS.map((spec) => (
              <article key={spec.label} className={`spec-${spec.status}`}>
                <div><small>{spec.label}</small><strong>{revealed ? spec.value : "—"}</strong></div>
                <span>{revealed ? `${spec.confidence}% · ${spec.source}` : "pending"}</span>
              </article>
            ))}
          </div>
          {revealed && (
            <div className="fasten-missing-alert">
              <TriangleAlert />
              <div>
                <strong>Human Gate A · specification conflict</strong>
                <p>Zn-Ni 已指定，但 friction coefficient / torque-tension requirement 缺漏；正式報價前必須向客戶澄清。</p>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

function CasesStage({ revealed }: StageViewProps) {
  return (
    <section className="fasten-stage-page">
      <header className="fasten-stage-hero compact">
        <div>
          <span>STAGE 03 · PRODUCT CASE STORE</span>
          <h1>不是只找「長得像」，而是解釋哪裡相同、哪裡不同</h1>
          <p>Hard filters → semantic retrieval → engineering-weighted ranking；每個 Product ID 與品質結果都可追查。</p>
        </div>
        <aside><small>SEARCH SCOPE</small><strong>{revealed ? "142 products" : "Case store ready"}</strong><span>Fastener family · 5 years</span></aside>
      </header>
      <section className="fasten-search-query">
        <Search />
        <div><small>ENGINEERING QUERY</small><strong>M8 × 1.25 · SCM435 · Zn-Ni · HRC32–39 · 720h · Automotive PPAP</strong></div>
        <span>{revealed ? "3 ranked cases" : "Not executed"}</span>
      </section>
      <div className={`fasten-case-grid ${revealed ? "is-revealed" : ""}`}>
        {FASTEN_CASES.map((item, index) => (
          <article key={item.id} className={index === 0 ? "is-selected" : ""}>
            <header>
              <span>#{index + 1}</span>
              <div><small>{revealed ? item.id : "CASE —"}</small><h2>{revealed ? item.title : "Awaiting case retrieval"}</h2><p>{revealed ? item.subtitle : "Search must complete before display."}</p></div>
              <strong>{revealed ? `${item.score}%` : "—"}<small>match</small></strong>
            </header>
            <div className="fasten-case-compare">
              <section><small>SIMILAR</small>{item.similarities.map((text) => <span key={text}><Check />{revealed ? text : "—"}</span>)}</section>
              <section><small>DIFFERENT</small>{item.differences.map((text) => <span key={text}><GitCompare />{revealed ? text : "—"}</span>)}</section>
            </div>
            <dl><dt>Historical FPY</dt><dd>{revealed ? item.fpy : "—"}</dd><dt>Scrap</dt><dd>{revealed ? item.scrap : "—"}</dd></dl>
            <footer><Sparkles /><span>{revealed ? item.lesson : "Case lesson appears after verified retrieval."}</span></footer>
          </article>
        ))}
      </div>
    </section>
  );
}

function PlanningStage({ revealed }: StageViewProps) {
  return (
    <section className="fasten-stage-page">
      <header className="fasten-stage-hero compact">
        <div>
          <span>STAGE 04 · MANUFACTURABILITY</span>
          <h1>把圖面與舊案，轉成可 review 的製程、機台與模具計畫</h1>
          <p>Agent 只能從 capability registry、schedule 與 tooling database 回傳的候選項目中選擇。</p>
        </div>
        <aside><small>HUMAN GATE B</small><strong>{revealed ? "Engineering review" : "Plan not built"}</strong><span>No ERP write-back</span></aside>
      </header>
      <article className={`fasten-route-panel ${revealed ? "is-revealed" : ""}`}>
        <header><Route /><div><small>RECOMMENDED PROCESS ROUTE</small><h2>SCM435 Automotive Flange Bolt</h2></div><span>{revealed ? "6 linked operations" : "Awaiting plan"}</span></header>
        <div>
          {FASTEN_ROUTE.map((step) => (
            <article key={step.sequence}>
              <span>{step.sequence}</span><strong>{revealed ? step.label : "—"}</strong><small>{revealed ? step.owner : "pending"}</small><p>{revealed ? step.basis : "Basis not evaluated."}</p>
            </article>
          ))}
        </div>
      </article>
      <div className="fasten-planning-grid">
        <section className={`fasten-machine-panel ${revealed ? "is-revealed" : ""}`}>
          <header><Factory /><div><small>MACHINE CAPABILITY + AVAILABILITY</small><h2>Candidate assets</h2></div></header>
          {FASTEN_MACHINES.map((machine) => (
            <article key={machine.id} className={machine.recommended ? "is-recommended" : ""}>
              <span><Cpu /></span>
              <div><small>{machine.id}</small><strong>{machine.name}</strong><p>{revealed ? `${machine.available} · ${machine.history}` : "Awaiting capability query"}</p></div>
              <aside><strong>{revealed ? `${machine.match}%` : "—"}</strong><small>capability</small></aside>
              <footer>{revealed ? machine.tooling : "Tooling not checked"}</footer>
            </article>
          ))}
        </section>
        <section className={`fasten-risk-panel ${revealed ? "is-revealed" : ""}`}>
          <header><TriangleAlert /><div><small>QUALITY / DELIVERY RISKS</small><h2>Evidence-backed review</h2></div></header>
          {[
            ["HIGH", "Hydrogen embrittlement", "SCM435 HRC32–39 + electroplated Zn-Ni", "Confirm baking + torque spec"],
            ["HIGH", "New tooling lead time", "DIE-2047 · estimated 21 days", "Tooling charge / timing approval"],
            ["MED", "Flange tolerance", "Historical HDR-07 Cpk 1.31", "Prefer HDR-04 + first-piece check"],
          ].map(([level, title, evidence, action]) => (
            <article key={title}>
              <span>{revealed ? level : "—"}</span>
              <div><strong>{revealed ? title : "Awaiting risk analysis"}</strong><p>{revealed ? evidence : "—"}</p><small>{revealed ? action : "—"}</small></div>
            </article>
          ))}
        </section>
      </div>
    </section>
  );
}

function TrialStage({ revealed }: StageViewProps) {
  return (
    <section className="fasten-stage-page">
      <header className="fasten-stage-hero compact">
        <div>
          <span>STAGE 05 · MASTER TECHNICIAN AGENT</span>
          <h1>試車出現異常時，把機台訊號、影像與老師傅案例放在一起</h1>
          <p>Machine Sidecar 在 Edge 聚合 load、vibration 與 camera event；Agent 提出檢查順序，不直接停機或改 PLC。</p>
        </div>
        <aside><small>TRIAL LOT</small><strong>TRIAL-AB102938-01</strong><span>HDR-04 · DIE-2047</span></aside>
      </header>
      <div className="fasten-trial-grid">
        <article className={`fasten-signal-panel ${revealed ? "has-anomaly" : ""}`}>
          <header><Gauge /><div><small>EDGE FEATURE STREAM</small><h2>Cold heading signature</h2></div><span>{revealed ? "ANOMALY AT PART 128" : "READY"}</span></header>
          <svg viewBox="0 0 500 170" preserveAspectRatio="none">
            <line x1="8" x2="492" y1="36" y2="36" /><line x1="8" x2="492" y1="94" y2="94" /><line x1="8" x2="492" y1="154" y2="154" />
            <polyline className="signal-baseline" points={linePoints(FASTEN_TRIAL_SIGNALS.baseline)} />
            <polyline className="signal-load" points={linePoints(revealed ? FASTEN_TRIAL_SIGNALS.load : FASTEN_TRIAL_SIGNALS.baseline)} />
            <polyline className="signal-vibration" points={linePoints(revealed ? FASTEN_TRIAL_SIGNALS.vibration : FASTEN_TRIAL_SIGNALS.baseline.map((value) => value - 24))} />
          </svg>
          <footer><span className="legend-load">Forming load</span><span className="legend-vibration">Vibration feature</span><span className="legend-baseline">Case baseline</span></footer>
          <div className="fasten-live-metrics">
            <span><small>Speed</small><strong>112 ppm</strong></span>
            <span><small>Load deviation</small><strong>{revealed ? "+18.4%" : "+1.2%"}</strong></span>
            <span><small>Vibration score</small><strong>{revealed ? "2.7σ" : "0.4σ"}</strong></span>
          </div>
        </article>
        <article className={`fasten-vision-panel ${revealed ? "has-defect" : ""}`}>
          <header><ScanLine /><div><small>FIRST-PIECE CAMERA</small><h2>Flange edge inspection</h2></div></header>
          <div className="fasten-part-image">
            <svg viewBox="0 0 300 230">
              <circle cx="150" cy="115" r="82" /><circle cx="150" cy="115" r="39" />
              {Array.from({ length: 12 }, (_, index) => {
                const angle = (index / 12) * Math.PI * 2;
                return <line key={index} x1={150 + Math.cos(angle) * 45} y1={115 + Math.sin(angle) * 45} x2={150 + Math.cos(angle) * 76} y2={115 + Math.sin(angle) * 76} />;
              })}
              {revealed && <path className="defect-path" d="M207 54 C201 67 210 76 199 89 C194 96 201 103 192 114" />}
            </svg>
            {revealed && <span>RADIAL CRACK CANDIDATE · 0.42 mm</span>}
          </div>
          <footer>{revealed ? "Camera candidate requires quality confirmation" : "Synthetic image stream armed"}</footer>
        </article>
      </div>
      <section className={`fasten-hypotheses ${revealed ? "is-revealed" : ""}`}>
        <header><GitCompare /><div><small>BOUNDED INSPECTION ORDER</small><h2>Top hypotheses with counter-checks</h2></div></header>
        <div>
          {FASTEN_HYPOTHESES.map((item) => (
            <article key={item.rank}>
              <span>{item.rank}</span><div><strong>{revealed ? item.title : "Awaiting trial evidence"}</strong><p>{revealed ? item.detail : "—"}</p></div><aside>{revealed ? `${item.confidence}%` : "—"}<small>support</small></aside>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function QualityStage({ revealed }: StageViewProps) {
  return (
    <section className="fasten-stage-page">
      <header className="fasten-stage-hero compact">
        <div>
          <span>STAGE 06 · QUALITY EVIDENCE AGENT</span>
          <h1>首件合格不是一句話，而是一包能回到圖面與製程的 Evidence</h1>
          <p>量測值由 QMS／instrument 提供；Agent 負責對照、解釋、組成 review package 與新 Case draft。</p>
        </div>
        <aside className={revealed ? "is-pass" : ""}><small>FIRST ARTICLE STATUS</small><strong>{revealed ? "CONDITIONAL PASS" : "Pending inspection"}</strong><span>{revealed ? "Human approval required" : "6 checks waiting"}</span></aside>
      </header>
      <div className="fasten-quality-grid">
        <article className={`fasten-measurement-panel ${revealed ? "is-revealed" : ""}`}>
          <header><BadgeCheck /><div><small>FIRST ARTICLE INSPECTION</small><h2>Drawing-to-measurement comparison</h2></div><span>{revealed ? "6 / 6 reviewed" : "Awaiting package"}</span></header>
          <table>
            <thead><tr><th>Feature</th><th>Drawing spec</th><th>Before adjustment</th><th>After review</th><th>Result</th></tr></thead>
            <tbody>
              {FASTEN_MEASUREMENTS.map((item) => (
                <tr key={item.feature}>
                  <td>{item.feature}</td><td>{item.spec} {item.unit}</td><td>{revealed ? item.before : "—"}</td><td>{revealed ? item.after : "—"}</td><td><span>{revealed ? "PASS" : "PENDING"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
        <section className={`fasten-evidence-thread ${revealed ? "is-revealed" : ""}`}>
          <header><Database /><div><small>PRODUCT THREAD</small><h2>One traceable manufacturing case</h2></div></header>
          {[
            ["RFQ", FASTEN_RFQ.id, "Email + 3 attachments"],
            ["Drawing", "AB-102938 Rev C", "8 specification fields"],
            ["Material", "MAT-SCM435-260722-03", "Mill cert + hardness sample"],
            ["Tooling", "DIE-2047", "Inspection after Gate B"],
            ["Machine", "HDR-04", "Edge feature window 128"],
            ["Inspection", "FAI-2026-00882", "6 reviewed characteristics"],
          ].map(([kind, id, detail]) => (
            <article key={kind}><span><CircleDot /></span><div><small>{kind}</small><strong>{revealed ? id : "—"}</strong><p>{revealed ? detail : "Pending"}</p></div></article>
          ))}
        </section>
      </div>
      <section className={`fasten-closeout ${revealed ? "is-revealed" : ""}`}>
        <article><FileCheck2 /><div><small>QUALITY PACKAGE</small><strong>{revealed ? "First Article Inspection draft" : "Not generated"}</strong><span>Drawing sources · measurements · instrument IDs</span></div><button disabled={!revealed}>Open Draft</button></article>
        <article><Mail /><div><small>CUSTOMER CLARIFICATION</small><strong>{revealed ? "Friction / torque requirement email" : "Not generated"}</strong><span>Draft only · business approval required</span></div><button disabled={!revealed}>Review Email</button></article>
        <article><Sparkles /><div><small>NEW PRODUCT CASE</small><strong>{revealed ? "FASTEN-CASE-2026-0182" : "Not generated"}</strong><span>Teacher feedback pending before publish</span></div><button disabled={!revealed}>Request Approval</button></article>
      </section>
    </section>
  );
}

function StageContent({ stageId, revealed }: { stageId: FastenStageId; revealed: boolean }) {
  switch (stageId) {
    case "intake":
      return <IntakeStage />;
    case "drawing":
      return <DrawingStage revealed={revealed} />;
    case "cases":
      return <CasesStage revealed={revealed} />;
    case "planning":
      return <PlanningStage revealed={revealed} />;
    case "trial":
      return <TrialStage revealed={revealed} />;
    case "quality":
      return <QualityStage revealed={revealed} />;
  }
}

const STAGE_ACTIONS: Record<
  FastenStageId,
  { run: string; next: string; completed: string }
> = {
  intake: {
    run: "Accept RFQ & Start Workflow",
    next: "Open Drawing Intelligence",
    completed: "RFQ context locked",
  },
  drawing: {
    run: "Analyze Drawing",
    next: "Confirm Gate A & Find Similar Cases",
    completed: "Specification mapped",
  },
  cases: {
    run: "Search Similar Products",
    next: "Use Case P-008821",
    completed: "Three cases ranked",
  },
  planning: {
    run: "Build Manufacturing Plan",
    next: "Confirm Gate B & Start Trial",
    completed: "Route and assets checked",
  },
  trial: {
    run: "Run Synthetic Trial",
    next: "Approve Inspection Order",
    completed: "Anomaly evidence packaged",
  },
  quality: {
    run: "Generate First Article Package",
    next: "Complete FASTEN-1 Story",
    completed: "Quality Evidence ready",
  },
};

export function Fasten1Experience({ onBack, onClose }: Fasten1ExperienceProps) {
  const mainRef = useRef<HTMLElement>(null);
  const runTimerRef = useRef<number | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [maxUnlocked, setMaxUnlocked] = useState(0);
  const [revealedStages, setRevealedStages] = useState<Set<FastenStageId>>(new Set());
  const [completedStages, setCompletedStages] = useState<Set<FastenStageId>>(new Set());
  const [running, setRunning] = useState(false);
  const [storyComplete, setStoryComplete] = useState(false);
  const stage = FASTEN_STAGES[stageIndex] ?? FASTEN_STAGES[0]!;
  const revealed = stage.id === "intake" || revealedStages.has(stage.id);
  const action = STAGE_ACTIONS[stage.id];
  const progress = useMemo(
    () => Math.round((completedStages.size / FASTEN_STAGES.length) * 100),
    [completedStages],
  );

  useEffect(
    () => () => {
      if (runTimerRef.current !== null) {
        window.clearTimeout(runTimerRef.current);
      }
    },
    [],
  );

  const runStage = () => {
    if (stage.id === "intake") {
      setRevealedStages((current) => new Set(current).add(stage.id));
      return;
    }
    setRunning(true);
    runTimerRef.current = window.setTimeout(() => {
      setRevealedStages((current) => new Set(current).add(stage.id));
      setRunning(false);
      runTimerRef.current = null;
    }, 720);
  };

  const nextStage = () => {
    setCompletedStages((current) => new Set(current).add(stage.id));
    if (stageIndex === FASTEN_STAGES.length - 1) {
      setStoryComplete(true);
      return;
    }
    const nextIndex = stageIndex + 1;
    setMaxUnlocked((current) => Math.max(current, nextIndex));
    setStageIndex(nextIndex);
    if (typeof mainRef.current?.scrollTo === "function") {
      mainRef.current.scrollTo({ top: 0 });
    } else if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  };

  const isStageRevealed = stage.id === "intake"
    ? revealedStages.has("intake")
    : revealed;

  return (
    <div className="fasten-shell">
      <header className="fasten-topbar">
        <button className="fasten-back" onClick={onBack}><ArrowLeft /> Precision Gallery</button>
        <div className="fasten-brand"><span>F1</span><div><strong>FASTEN-1</strong><small>RFQ-to-First-Good-Part Agent</small></div></div>
        <div className="fasten-boundary"><ShieldCheck /> SYNTHETIC WORKFLOW · L1–L2 ONLY · NO PLC WRITE</div>
        <div className="fasten-progress"><span><i style={{ width: `${progress}%` }} /></span><strong>{progress}%</strong></div>
        <button className="fasten-close" aria-label="Close FASTEN-1" onClick={onClose}><X /></button>
      </header>

      <nav className="fasten-stage-rail" aria-label="FASTEN-1 workflow stages">
        {FASTEN_STAGES.map((item, index) => {
          const Icon = item.icon;
          const complete = completedStages.has(item.id);
          const active = index === stageIndex;
          const unlocked = index <= maxUnlocked;
          return (
            <button
              key={item.id}
              className={`${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}
              disabled={!unlocked}
              onClick={() => unlocked && setStageIndex(index)}
            >
              <span>{complete ? <Check /> : <Icon />}</span>
              <div><small>0{item.index} · {item.shortLabel}</small><strong>{item.label}</strong><em>{item.agent}</em></div>
              {index < FASTEN_STAGES.length - 1 && <i />}
            </button>
          );
        })}
      </nav>

      <main ref={mainRef} className="fasten-main">
        <section className="fasten-context-bar">
          <div><small>RFQ</small><strong>{FASTEN_RFQ.id}</strong></div>
          <div><small>Part</small><strong>AB-102938 · Rev C</strong></div>
          <div><small>Product</small><strong>M8 SCM435 Flange Bolt</strong></div>
          <div><small>Sources</small><strong>Email · Drawing · ERP · MES · QMS · Edge</strong></div>
          <span><CircleDot /> CONCEPT DATA</span>
        </section>

        {storyComplete ? (
          <section className="fasten-story-complete">
            <span><BadgeCheck /></span>
            <small>FASTEN-1 STORY COMPLETE</small>
            <h1>從一張客戶圖面，到一包可核准的首件良品 Evidence</h1>
            <p>
              這個 deterministic concept 展示 workflow、tools、Human Gates 與資料
              lineage；不代表 production CAD parser、quality model 或工廠實測 KPI。
            </p>
            <div>
              <button onClick={() => {
                setStoryComplete(false);
                setStageIndex(0);
                setMaxUnlocked(0);
                setRevealedStages(new Set());
                setCompletedStages(new Set());
              }}><Play /> Replay Story</button>
              <button onClick={onBack}><Boxes /> Back to Precision Gallery</button>
            </div>
          </section>
        ) : (
          <>
            <StageContent stageId={stage.id} revealed={revealed} />
            <footer className="fasten-stage-actions">
              <div>
                <small>{stage.agent}</small>
                <strong>{isStageRevealed ? action.completed : "Ready for deterministic execution"}</strong>
                <span>Structured outputs · linked sources · Human Gate</span>
              </div>
              {!isStageRevealed ? (
                <button className="fasten-primary-action" onClick={runStage} disabled={running}>
                  {running ? <CircleDot /> : <Play />} {running ? "Running deterministic tools…" : action.run}
                </button>
              ) : (
                <button className="fasten-primary-action" onClick={nextStage}>
                  {action.next} <ChevronRight />
                </button>
              )}
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
