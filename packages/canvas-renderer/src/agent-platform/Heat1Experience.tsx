import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  Check,
  ChevronRight,
  CircleDot,
  Database,
  FileCheck2,
  Flame,
  Gauge,
  Layers3,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Thermometer,
  TriangleAlert,
  X,
} from "lucide-react";

import {
  HEAT_BATCH,
  HEAT_DOCUMENTS,
  HEAT_EVIDENCE,
  HEAT_HYPOTHESES,
  HEAT_JOURNEY,
  HEAT_LAB_RESULTS,
  HEAT_RECIPE_PHASES,
  HEAT_SOFT_SENSOR,
  HEAT_STAGES,
  HEAT_TRAYS,
  type HeatStageId,
} from "./heat1Data";

export interface Heat1ExperienceProps {
  onBack: () => void;
  onClose?: () => void;
}

interface StageViewProps {
  revealed: boolean;
}

function scaledPoints(values: readonly number[], min: number, max: number): string {
  const range = Math.max(1, max - min);
  return values
    .map((value, index) => {
      const x = 8 + (index / Math.max(1, values.length - 1)) * 484;
      const y = 174 - ((value - min) / range) * 142;
      return `${x},${y}`;
    })
    .join(" ");
}

function GearGlyph() {
  return (
    <svg className="heat-gear-glyph" viewBox="0 0 320 300" role="img" aria-label="Synthetic transmission gear">
      <defs>
        <radialGradient id="heat-gear-fill">
          <stop offset="0" stopColor="#20282c" />
          <stop offset=".7" stopColor="#121a1e" />
          <stop offset="1" stopColor="#080c0e" />
        </radialGradient>
      </defs>
      <circle cx="160" cy="150" r="104" />
      {Array.from({ length: 20 }, (_, index) => {
        const angle = (index / 20) * Math.PI * 2;
        const x1 = 160 + Math.cos(angle) * 101;
        const y1 = 150 + Math.sin(angle) * 101;
        const x2 = 160 + Math.cos(angle) * 126;
        const y2 = 150 + Math.sin(angle) * 126;
        return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
      <circle cx="160" cy="150" r="64" />
      <circle cx="160" cy="150" r="30" />
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <circle
            key={index}
            cx={160 + Math.cos(angle) * 47}
            cy={150 + Math.sin(angle) * 47}
            r="8"
          />
        );
      })}
      <path className="heat-case-layer" d="M81 88 A104 104 0 0 1 238 87" />
      <text x="160" y="286" textAnchor="middle">CASE-HARDENED GEAR · TG-47</text>
    </svg>
  );
}

function PassportStage() {
  return (
    <section className="heat-stage-page">
      <header className="heat-stage-hero">
        <div>
          <span>STAGE 01 · BATCH PASSPORT</span>
          <h1>在爐門關上之前，先知道這一批「是誰、要變成什麼」</h1>
          <p>
            Batch Context Agent 把 drawing、material lot、recipe、furnace、
            control plan 與 customer requirement 綁成不可混淆的 Heat Thread。
          </p>
        </div>
        <aside>
          <small>HEAT TREATMENT BATCH</small>
          <strong>{HEAT_BATCH.id}</strong>
          <span>{HEAT_BATCH.quantity} gears · Due {HEAT_BATCH.due}</span>
        </aside>
      </header>

      <div className="heat-passport-grid">
        <article className="heat-part-card">
          <header>
            <span><Layers3 /></span>
            <div><small>PART + METALLURGY CONTEXT</small><h2>{HEAT_BATCH.part}</h2><p>{HEAT_BATCH.partNumber}</p></div>
          </header>
          <div className="heat-part-visual"><GearGlyph /></div>
          <dl>
            <dt>Material</dt><dd>{HEAT_BATCH.material}</dd>
            <dt>Material lot</dt><dd>{HEAT_BATCH.materialLot}</dd>
            <dt>Customer</dt><dd>{HEAT_BATCH.customer}</dd>
            <dt>Work order</dt><dd>{HEAT_BATCH.workOrder}</dd>
          </dl>
        </article>

        <article className="heat-spec-card">
          <header><Thermometer /><div><small>QUALITY CONTRACT</small><h2>Release characteristics</h2></div><span>REV D</span></header>
          <div className="heat-spec-stack">
            {[
              ["Effective case depth", HEAT_BATCH.spec.effectiveCaseDepth, "ECD"],
              ["Surface hardness", HEAT_BATCH.spec.surfaceHardness, "HRC"],
              ["Core hardness", HEAT_BATCH.spec.coreHardness, "CORE"],
              ["Distortion", HEAT_BATCH.spec.distortion, "TIR"],
              ["Retained austenite", HEAT_BATCH.spec.retainedAustenite, "RA"],
            ].map(([label, value, code]) => (
              <article key={label}><span>{code}</span><div><small>{label}</small><strong>{value}</strong></div><Check /></article>
            ))}
          </div>
          <footer>
            <ShieldCheck />
            Exact specifications come from the locked drawing and control plan.
          </footer>
        </article>

        <article className="heat-document-thread">
          <header><Database /><div><small>INPUT AUTHORITY</small><h2>Five linked records</h2></div></header>
          <div>
            {HEAT_DOCUMENTS.map((document) => (
              <article key={document.id}>
                <span><CircleDot /></span>
                <div><small>{document.type}</small><strong>{document.id}</strong></div>
                <em>{document.state}</em>
              </article>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function LoadStage({ revealed }: StageViewProps) {
  return (
    <section className="heat-stage-page">
      <header className="heat-stage-hero compact">
        <div>
          <span>STAGE 02 · LOAD & RECIPE INTELLIGENCE</span>
          <h1>同一爐、同一 recipe，不代表每個裝載位置經歷相同</h1>
          <p>把 tray position、load thermocouple、part count 與 recipe phases 放進同一個可追蹤 load map。</p>
        </div>
        <aside><small>RECIPE</small><strong>{HEAT_BATCH.recipe}</strong><span>{HEAT_BATCH.furnace} · approved v7</span></aside>
      </header>

      <div className="heat-load-grid">
        <article className={`heat-furnace-map ${revealed ? "is-revealed" : ""}`}>
          <header><Flame /><div><small>FURNACE LOAD MAP</small><h2>Three zones · six trays · 240 gears</h2></div><span>{revealed ? "TC coverage checked" : "Awaiting validation"}</span></header>
          <div className="heat-chamber">
            <aside><strong>FUR-CARB-03</strong><small>Charge door</small><i /></aside>
            <section>
              {HEAT_TRAYS.map((tray) => (
                <article key={tray.id} className={tray.risk >= 70 ? "is-risk" : ""}>
                  <header><span>{tray.id}</span><small>{tray.zone}</small></header>
                  <strong>{tray.count} pcs</strong>
                  <p>{tray.tc}</p>
                  <footer><i><b style={{ width: revealed ? `${tray.risk}%` : "0%" }} /></i><span>{revealed ? `${tray.risk} risk` : "pending"}</span></footer>
                </article>
              ))}
            </section>
            <aside><small>Circulation</small><strong>Zone 3</strong><i /></aside>
          </div>
          {revealed && (
            <footer className="heat-load-alert">
              <TriangleAlert />
              <div><strong>T6 / Zone 3 edge requires focused monitoring</strong><p>TC-07 has valid calibration, but edge exposure and quench path have the narrowest process margin.</p></div>
            </footer>
          )}
        </article>

        <article className={`heat-recipe-panel ${revealed ? "is-revealed" : ""}`}>
          <header><Thermometer /><div><small>APPROVED RECIPE JOURNEY</small><h2>Six bounded phases</h2></div></header>
          <ol>
            {HEAT_RECIPE_PHASES.map((phase) => (
              <li key={phase.sequence}>
                <span>{phase.sequence}</span>
                <div><strong>{revealed ? phase.label : "—"}</strong><p>{revealed ? phase.purpose : "Awaiting recipe validation"}</p></div>
                <aside><strong>{revealed ? phase.target : "—"}</strong><small>{revealed ? phase.duration : "pending"}</small></aside>
              </li>
            ))}
          </ol>
        </article>
      </div>
    </section>
  );
}

function JourneyStage({ revealed }: StageViewProps) {
  const temperatureValues = revealed ? HEAT_JOURNEY.temperature : HEAT_JOURNEY.envelope;
  return (
    <section className="heat-stage-page">
      <header className="heat-stage-hero compact">
        <div>
          <span>STAGE 03 · FURNACE JOURNEY</span>
          <h1>不是看現在幾度，而是重播整個材料轉變路徑</h1>
          <p>Thermal、atmosphere、transfer 與 quench context 共同形成品質 Evidence；單點 alarm 無法取代 journey。</p>
        </div>
        <aside><small>REPLAY WINDOW</small><strong>7h 18m</strong><span>Charge → carburize → quench → temper</span></aside>
      </header>

      <div className="heat-journey-grid">
        <article className={`heat-journey-chart ${revealed ? "is-revealed" : ""}`}>
          <header><Thermometer /><div><small>THERMAL JOURNEY</small><h2>Furnace vs. load response</h2></div><span>{revealed ? "3 deviations linked" : "Canonical replay ready"}</span></header>
          <svg viewBox="0 0 500 190" preserveAspectRatio="none">
            <line x1="8" x2="492" y1="32" y2="32" /><line x1="8" x2="492" y1="80" y2="80" /><line x1="8" x2="492" y1="128" y2="128" /><line x1="8" x2="492" y1="174" y2="174" />
            <polyline className="heat-envelope-line" points={scaledPoints(HEAT_JOURNEY.envelope, 0, 960)} />
            <polyline className="heat-furnace-line" points={scaledPoints(temperatureValues, 0, 960)} />
            <polyline className="heat-load-line" points={scaledPoints(revealed ? HEAT_JOURNEY.loadTemperature : HEAT_JOURNEY.envelope, 0, 960)} />
          </svg>
          <footer><span className="legend-furnace">Furnace PV</span><span className="legend-load">TC-07 load</span><span className="legend-envelope">Recipe envelope</span></footer>
          <div className="heat-phase-band">
            {HEAT_RECIPE_PHASES.map((phase) => <span key={phase.sequence}>{phase.label}</span>)}
          </div>
        </article>
        <article className={`heat-atmosphere-chart ${revealed ? "is-revealed" : ""}`}>
          <header><Gauge /><div><small>ATMOSPHERE JOURNEY</small><h2>Carbon potential</h2></div></header>
          <svg viewBox="0 0 500 190" preserveAspectRatio="none">
            <line x1="8" x2="492" y1="32" y2="32" /><line x1="8" x2="492" y1="103" y2="103" /><line x1="8" x2="492" y1="174" y2="174" />
            <polyline className="heat-cp-target" points={scaledPoints([.2,.2,.3,.4,.8,1.15,1.15,1.15,1.1,.85,.4,.2,.2,.2], 0, 1.25)} />
            <polyline className="heat-cp-line" points={scaledPoints(revealed ? HEAT_JOURNEY.carbonPotential : [.2,.2,.3,.4,.8,1.15,1.15,1.15,1.1,.85,.4,.2,.2,.2], 0, 1.25)} />
          </svg>
          <footer><span>CP actual</span><span>Approved target</span></footer>
        </article>
      </div>

      <section className={`heat-event-strip ${revealed ? "is-revealed" : ""}`}>
        {HEAT_JOURNEY.events.map((event, index) => (
          <article key={event.time}>
            <span>{index + 1}</span><time>{revealed ? event.time : "—"}</time>
            <div><small>{event.type}</small><strong>{revealed ? event.title : "Awaiting replay"}</strong><p>{revealed ? event.detail : "—"}</p></div>
          </article>
        ))}
      </section>
    </section>
  );
}

function SoftSensorStage({ revealed }: StageViewProps) {
  return (
    <section className="heat-stage-page">
      <header className="heat-stage-hero compact">
        <div>
          <span>STAGE 04 · QUALITY SOFT SENSOR</span>
          <h1>Lab 還沒回來，Agent 先告訴你「哪裡最值得懷疑與採樣」</h1>
          <p>估算值包含 uncertainty，不能取代 hardness、metallography 或 CMM 的 official result。</p>
        </div>
        <aside><small>OFFICIAL LAB ETA</small><strong>{revealed ? "20h 24m" : "Pending estimate"}</strong><span>{HEAT_SOFT_SENSOR.labEta}</span></aside>
      </header>

      <div className="heat-soft-grid">
        <article className={`heat-risk-map ${revealed ? "is-revealed" : ""}`}>
          <header><Gauge /><div><small>TRAY-LEVEL QUALITY ESTIMATE</small><h2>Case depth / hardness / distortion</h2></div><span>{revealed ? `${HEAT_SOFT_SENSOR.confidence}% model confidence` : "Model not run"}</span></header>
          <div>
            {HEAT_TRAYS.map((tray) => (
              <article key={tray.id} className={tray.risk >= 70 ? "is-critical" : tray.risk >= 40 ? "is-warning" : ""}>
                <header><strong>{tray.id}</strong><span>{tray.zone}</span></header>
                <div className="heat-risk-score"><i><b style={{ height: revealed ? `${tray.risk}%` : "0%" }} /></i><strong>{revealed ? tray.risk : 0}</strong><small>risk</small></div>
                <dl>
                  <dt>ECD</dt><dd>{revealed ? tray.caseDepth.toFixed(2) : "—"} mm</dd>
                  <dt>Hardness</dt><dd>{revealed ? tray.hardness.toFixed(1) : "—"} HRC</dd>
                  <dt>TIR</dt><dd>{revealed ? tray.distortion.toFixed(3) : "—"} mm</dd>
                </dl>
              </article>
            ))}
          </div>
        </article>

        <section className={`heat-soft-summary ${revealed ? "is-revealed" : ""}`}>
          <article className="heat-soft-verdict">
            <span><TriangleAlert /></span>
            <div><small>EARLY QUALITY SIGNAL</small><h2>{revealed ? "T6 edge tray requires HOLD candidate" : "Awaiting Soft Sensor"}</h2><p>{revealed ? "Predicted ECD and surface hardness cross the lower specification boundary while distortion exceeds the TIR limit." : "Run the versioned model after the furnace journey is complete."}</p></div>
          </article>
          <div className="heat-soft-metrics">
            {HEAT_SOFT_SENSOR.batchMetrics.map((metric) => (
              <article key={metric.label} className={`state-${metric.state}`}><small>{metric.label}</small><strong>{revealed ? metric.value : "—"}</strong></article>
            ))}
          </div>
          <article className="heat-model-card">
            <Database /><div><small>MODEL LINEAGE</small><strong>{revealed ? HEAT_SOFT_SENSOR.model : "Model not executed"}</strong><span>Inputs · feature window · uncertainty · tray position</span></div>
          </article>
        </section>
      </div>
    </section>
  );
}

function InvestigationStage({ revealed }: StageViewProps) {
  return (
    <section className="heat-stage-page">
      <header className="heat-stage-hero compact">
        <div>
          <span>STAGE 05 · DEVIATION INVESTIGATION</span>
          <h1>把「可能不合格」拆成能讓 metallurgist 驗證的假設</h1>
          <p>Agent 排序 Evidence、counter-evidence 與 sampling plan；不直接改 recipe、不重工、不放行。</p>
        </div>
        <aside><small>INVESTIGATION SCOPE</small><strong>{revealed ? "T6 · 24 pcs" : "Awaiting analysis"}</strong><span>Zone 3 edge · focused hold</span></aside>
      </header>

      <div className="heat-investigation-grid">
        <article className={`heat-causal-thread ${revealed ? "is-revealed" : ""}`}>
          <header><Flame /><div><small>CAUSAL EVIDENCE THREAD</small><h2>What changed first?</h2></div></header>
          <ol>
            {[
              ["10:42", "TC-07 thermal lag", "Load response separates from center trays.", "TC-07"],
              ["12:18", "CP recovery delay", "Atmosphere returns slowly after enrichment.", "CP-A/B"],
              ["14:37", "Quench transfer + agitation", "18.4 s transfer; QF-02 below baseline.", "QF-02"],
              ["15:06", "Soft Sensor estimate", "ECD/hardness/TIR risk localizes to T6.", "model v0.1"],
            ].map(([time, title, detail, source], index) => (
              <li key={time}><span>{index + 1}</span><time>{revealed ? time : "—"}</time><div><strong>{revealed ? title : "Awaiting Evidence"}</strong><p>{revealed ? detail : "—"}</p><small>{revealed ? source : "pending"}</small></div></li>
            ))}
          </ol>
        </article>
        <section className={`heat-hypothesis-panel ${revealed ? "is-revealed" : ""}`}>
          <header><Search /><div><small>BOUNDED HYPOTHESES</small><h2>Ranked for human verification</h2></div></header>
          {HEAT_HYPOTHESES.map((hypothesis) => (
            <article key={hypothesis.rank}>
              <span>{hypothesis.rank}</span>
              <div><strong>{revealed ? hypothesis.title : "Awaiting investigation"}</strong><p>{revealed ? hypothesis.detail : "—"}</p><small>{revealed ? `Counter-check: ${hypothesis.counter}` : "—"}</small></div>
              <aside>{revealed ? `${hypothesis.confidence}%` : "—"}<small>support</small></aside>
            </article>
          ))}
        </section>
      </div>

      <section className={`heat-sampling-plan ${revealed ? "is-revealed" : ""}`}>
        <header><ShieldCheck /><div><small>HUMAN GATE B · CONTAINMENT DRAFT</small><h2>Targeted verification, not batch-wide guesswork</h2></div></header>
        <div>
          {[
            ["Hold", "Segregate T6 · 24 pcs", "No release until lab/CMM confirmation"],
            ["Sample", "Coupon C4 + 5 T6 gears", "ECD profile · surface/core HRC · TIR"],
            ["Verify", "QF-02 flow and transfer log", "Independent maintenance indication"],
            ["Compare", "T1 / T4 / T5 coupons", "Confirm location-specific pattern"],
          ].map(([kind, title, detail]) => (
            <article key={kind}><span>{revealed ? kind : "—"}</span><div><strong>{revealed ? title : "Awaiting plan"}</strong><p>{revealed ? detail : "—"}</p></div></article>
          ))}
        </div>
      </section>
    </section>
  );
}

function ReleaseStage({ revealed }: StageViewProps) {
  return (
    <section className="heat-stage-page">
      <header className="heat-stage-hero compact">
        <div>
          <span>STAGE 06 · RELEASE EVIDENCE</span>
          <h1>Soft Sensor 提前縮小風險；official lab 決定最後的 disposition</h1>
          <p>預測與 lab reconciliation 被保存為 Evidence，Agent 只建立 release／hold 草稿，最終由 Quality 核准。</p>
        </div>
        <aside className={revealed ? "is-hold" : ""}><small>BATCH DISPOSITION</small><strong>{revealed ? "PARTIAL HOLD" : "Pending lab"}</strong><span>{revealed ? "216 candidate release · 24 hold" : "No release decision"}</span></aside>
      </header>

      <div className="heat-release-grid">
        <article className={`heat-lab-panel ${revealed ? "is-revealed" : ""}`}>
          <header><BadgeCheck /><div><small>LAB + METROLOGY RECONCILIATION</small><h2>Official results by coupon position</h2></div><span>{revealed ? "4 / 4 received" : "Awaiting lab"}</span></header>
          <table>
            <thead><tr><th>Sample</th><th>Position</th><th>ECD</th><th>Surface HRC</th><th>TIR</th><th>Result</th></tr></thead>
            <tbody>
              {HEAT_LAB_RESULTS.map((result) => (
                <tr key={result.sample} className={result.result === "HOLD" ? "is-hold" : ""}>
                  <td>{result.sample}</td><td>{result.position}</td><td>{revealed ? `${result.caseDepth.toFixed(2)} mm` : "—"}</td><td>{revealed ? result.hardness.toFixed(1) : "—"}</td><td>{revealed ? `${result.distortion.toFixed(3)} mm` : "—"}</td><td><span>{revealed ? result.result : "PENDING"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <footer><Sparkles /><span>{revealed ? "T6 prediction vs. lab: ECD −0.02 mm · HRC +0.4 · TIR +0.002 mm" : "Model reconciliation pending official measurements."}</span></footer>
        </article>

        <article className={`heat-disposition-card ${revealed ? "is-revealed" : ""}`}>
          <header><FileCheck2 /><div><small>QUALITY RELEASE DRAFT</small><h2>Position-aware disposition</h2></div></header>
          <div className="heat-disposition-counts">
            <span><small>Release candidate</small><strong>{revealed ? "216" : "—"}</strong><em>pcs · T1–T5</em></span>
            <span><small>Focused hold</small><strong>{revealed ? "24" : "—"}</strong><em>pcs · T6</em></span>
          </div>
          <ol>
            {[
              "Verify physical segregation and tray genealogy.",
              "Quality Engineer reviews C1–C4 lab results.",
              "Metallurgist approves T6 reprocess / scrap disposition.",
              "Maintenance verifies QF-02 and transfer mechanism.",
            ].map((item) => <li key={item}><Check />{revealed ? item : "Pending Evidence"}</li>)}
          </ol>
          <footer><ShieldCheck /> Draft only · no automatic release or reprocess</footer>
        </article>
      </div>

      <section className={`heat-release-package ${revealed ? "is-revealed" : ""}`}>
        {[
          ["Batch report", "HTR-260722-17", "Furnace journey + alarms + recipe version"],
          ["Quality Evidence", "QEV-G47-4418", "Lab, CMM, uncertainty, sample lineage"],
          ["Deviation Case", "HT-CASE-2026-044", "Hypotheses, confirmation, final outcome"],
          ["CAPA draft", "CAPA-DRAFT-882", "QF-02 verification + edge-load review"],
        ].map(([kind, id, detail]) => (
          <article key={kind}><FileCheck2 /><div><small>{kind}</small><strong>{revealed ? id : "—"}</strong><span>{revealed ? detail : "Not generated"}</span></div><button disabled={!revealed}>Open Draft</button></article>
        ))}
      </section>
    </section>
  );
}

function StageContent({ stageId, revealed }: { stageId: HeatStageId; revealed: boolean }) {
  switch (stageId) {
    case "passport":
      return <PassportStage />;
    case "load":
      return <LoadStage revealed={revealed} />;
    case "journey":
      return <JourneyStage revealed={revealed} />;
    case "soft-sensor":
      return <SoftSensorStage revealed={revealed} />;
    case "investigation":
      return <InvestigationStage revealed={revealed} />;
    case "release":
      return <ReleaseStage revealed={revealed} />;
  }
}

const STAGE_ACTIONS: Record<HeatStageId, { run: string; next: string; completed: string }> = {
  passport: {
    run: "Lock Batch Passport",
    next: "Open Load & Recipe",
    completed: "Batch identity and release contract locked",
  },
  load: {
    run: "Validate Load & Recipe",
    next: "Confirm Gate A & Replay Journey",
    completed: "Load position and approved recipe mapped",
  },
  journey: {
    run: "Replay Furnace Journey",
    next: "Run Quality Soft Sensor",
    completed: "Three journey deviations linked",
  },
  "soft-sensor": {
    run: "Estimate Quality Distribution",
    next: "Investigate T6 Deviation",
    completed: "Tray-level quality risk estimated",
  },
  investigation: {
    run: "Build Evidence Investigation",
    next: "Approve Sampling Plan",
    completed: "Hypotheses and focused hold plan ready",
  },
  release: {
    run: "Reconcile Official Lab",
    next: "Complete HEAT-1 Story",
    completed: "Release and hold Evidence packaged",
  },
};

export function Heat1Experience({ onBack, onClose }: Heat1ExperienceProps) {
  const mainRef = useRef<HTMLElement>(null);
  const runTimerRef = useRef<number | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [maxUnlocked, setMaxUnlocked] = useState(0);
  const [revealedStages, setRevealedStages] = useState<Set<HeatStageId>>(new Set());
  const [completedStages, setCompletedStages] = useState<Set<HeatStageId>>(new Set());
  const [running, setRunning] = useState(false);
  const [storyComplete, setStoryComplete] = useState(false);
  const stage = HEAT_STAGES[stageIndex] ?? HEAT_STAGES[0]!;
  const revealed = stage.id === "passport" || revealedStages.has(stage.id);
  const action = STAGE_ACTIONS[stage.id];
  const progress = useMemo(
    () => Math.round((completedStages.size / HEAT_STAGES.length) * 100),
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
    if (stage.id === "passport") {
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
    if (stageIndex === HEAT_STAGES.length - 1) {
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

  const isStageRevealed = stage.id === "passport"
    ? revealedStages.has("passport")
    : revealed;

  return (
    <div className="heat-shell">
      <header className="heat-topbar">
        <button className="heat-back" onClick={onBack}><ArrowLeft /> Precision Gallery</button>
        <div className="heat-brand"><span><Flame /></span><div><strong>HEAT-1</strong><small>Batch-to-Release Quality Agent</small></div></div>
        <div className="heat-boundary"><ShieldCheck /> SYNTHETIC WORKFLOW · SOFT SENSOR ≠ LAB · NO FURNACE WRITE</div>
        <div className="heat-progress"><span><i style={{ width: `${progress}%` }} /></span><strong>{progress}%</strong></div>
        <button className="heat-close" aria-label="Close HEAT-1" onClick={onClose}><X /></button>
      </header>

      <nav className="heat-stage-rail" aria-label="HEAT-1 workflow stages">
        {HEAT_STAGES.map((item, index) => {
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
              {index < HEAT_STAGES.length - 1 && <i />}
            </button>
          );
        })}
      </nav>

      <main ref={mainRef} className="heat-main">
        <section className="heat-context-bar">
          <div><small>Batch</small><strong>{HEAT_BATCH.id}</strong></div>
          <div><small>Part</small><strong>{HEAT_BATCH.partNumber}</strong></div>
          <div><small>Material</small><strong>{HEAT_BATCH.material} · {HEAT_BATCH.materialLot}</strong></div>
          <div><small>Asset / Recipe</small><strong>{HEAT_BATCH.furnace} · {HEAT_BATCH.recipe}</strong></div>
          <span><CircleDot /> CONCEPT DATA</span>
        </section>

        {storyComplete ? (
          <section className="heat-story-complete">
            <span><BadgeCheck /></span>
            <small>HEAT-1 STORY COMPLETE</small>
            <h1>提前 20 小時看見風險，最後仍由 official lab 與 Quality 決定放行</h1>
            <p>
              216 件成為 release candidate，T6 的 24 件 focused hold。這是
              deterministic concept，不代表 validated metallurgy model 或工廠實測效益。
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
            <footer className="heat-stage-actions">
              <div>
                <small>{stage.agent}</small>
                <strong>{isStageRevealed ? action.completed : "Ready for deterministic execution"}</strong>
                <span>Versioned inputs · uncertainty · official lab authority · Human Gate</span>
              </div>
              {!isStageRevealed ? (
                <button className="heat-primary-action" onClick={runStage} disabled={running}>
                  {running ? <CircleDot /> : <Play />} {running ? "Running deterministic tools…" : action.run}
                </button>
              ) : (
                <button className="heat-primary-action" onClick={nextStage}>
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
