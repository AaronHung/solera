import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Beaker,
  Check,
  ChevronRight,
  CircleDot,
  Database,
  Droplets,
  FileCheck2,
  Factory,
  Flame,
  FlaskConical,
  Gauge,
  Layers3,
  Link2,
  Mail,
  Play,
  RotateCcw,
  Route,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

import { Loop1Experience } from "../loop1/Loop1Experience";
import type { Loop1ApiOptions } from "../loop1/types";
import { Fasten1Experience } from "./Fasten1Experience";
import { Heat1Experience } from "./Heat1Experience";
import {
  AGENTS,
  getAgent,
  type AgentDefinition,
  type AgentId,
  type AgentPortfolio,
  type ConceptScenario,
} from "./data";

export interface AgentPlatformExperienceProps extends Loop1ApiOptions {
  onClose?: () => void;
}

const AGENT_ICONS: Record<AgentId, LucideIcon> = {
  loop1: FlaskConical,
  loop2: Activity,
  loop3: Gauge,
  loop4: Droplets,
  fasten1: Wrench,
  heat1: Flame,
};

const CHEMICAL_LAYERS = [
  { icon: Database, label: "Data Hub", detail: "Identity · time-series · quality" },
  { icon: Activity, label: "Pulse", detail: "Freshness · drift · health" },
  { icon: Link2, label: "Thread", detail: "Asset · Tag · SOP · Case" },
  { icon: Layers3, label: "Skills", detail: "Tools · models · calculations" },
  { icon: FileCheck2, label: "Evidence", detail: "Lineage · version · audit" },
  { icon: ShieldCheck, label: "Policy", detail: "Read-only · decline · approval" },
];

const PRECISION_LAYERS = [
  { icon: Mail, label: "Document Intake", detail: "Email · PDF · revision · hash" },
  { icon: ScanLine, label: "Drawing Intelligence", detail: "Parser · OCR · validation" },
  { icon: Link2, label: "Product Thread", detail: "Part · material · tool · lot" },
  { icon: Factory, label: "Machine Edge", detail: "Capability · state · signals" },
  { icon: FileCheck2, label: "Quality Evidence", detail: "Drawing · QMS · first article" },
  { icon: ShieldCheck, label: "Human Gates", detail: "Engineering · quality · business" },
];

function Sparkline({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * 100;
      const y = 34 - ((value - min) / range) * 28;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg className="agent-card-spark" viewBox="0 0 100 38" preserveAspectRatio="none">
      <polyline points={points} />
    </svg>
  );
}

function AgentCard({
  agent,
  onOpen,
}: {
  agent: AgentDefinition;
  onOpen: (agentId: AgentId) => void;
}) {
  const Icon = AGENT_ICONS[agent.id];
  return (
    <article className={`agent-card accent-${agent.accent}`}>
      <header>
        <span className="agent-card-icon"><Icon /></span>
        <div>
          <small>{agent.code}</small>
          <strong>{agent.shortTitle}</strong>
        </div>
        <span className={`agent-maturity maturity-${agent.maturity}`}>
          <CircleDot /> {agent.maturity === "live" ? "LIVE" : "CONCEPT"}
        </span>
      </header>
      <div className="agent-card-copy">
        <span>{agent.domain}</span>
        <h2>{agent.title}</h2>
        <p>{agent.description}</p>
      </div>
      <Sparkline values={agent.preview} />
      <div className="agent-card-outcome">
        <small>DECISION OUTCOME</small>
        <strong>{agent.outcome}</strong>
      </div>
      <footer>
        <span>{agent.archetype}</span>
        <button onClick={() => onOpen(agent.id)}>
          {agent.id === "fasten1" || agent.id === "heat1"
            ? "Open Workflow Story"
            : agent.maturity === "live"
              ? "Open Live Agent"
              : "Explore Concept"}
          <ChevronRight />
        </button>
      </footer>
    </article>
  );
}

function AgentGallery({
  portfolio,
  onPortfolioChange,
  onOpen,
  onClose,
}: {
  portfolio: AgentPortfolio;
  onPortfolioChange: (portfolio: AgentPortfolio) => void;
  onOpen: (agentId: AgentId) => void;
  onClose?: () => void;
}) {
  const precision = portfolio === "precision";
  const agents = AGENTS.filter((agent) => agent.portfolio === portfolio);
  const layers = precision ? PRECISION_LAYERS : CHEMICAL_LAYERS;
  return (
    <div className={`agent-platform-shell ${precision ? "portfolio-precision-shell" : ""}`}>
      <header className="agent-platform-topbar">
        <div className="agent-platform-brand">
          <span><Sparkles /></span>
          <div>
            <strong>Solera Agent Platform</strong>
            <small>Industrial Agent Gallery</small>
          </div>
        </div>
        <div className="agent-platform-boundary">
          <ShieldCheck />
          {precision
            ? "FASTEN-1 + HEAT-1 SYNTHETIC WORKFLOW CONCEPTS"
            : "LOOP-1 LIVE · LOOP-2–4 SYNTHETIC CONCEPTS"}
        </div>
        <button className="agent-platform-close" aria-label="Close Agent Platform" onClick={onClose}>
          <X />
        </button>
      </header>

      <main className="agent-gallery-main">
        <section className="agent-gallery-hero">
          <div>
            <span>
              {precision
                ? "SOLERA AGENT FOUNDRY / PRECISION MANUFACTURING"
                : "SOLERA AGENT FOUNDRY / CHEMICAL PORTFOLIO"}
            </span>
            <h1>
              {precision
                ? "從新品導入到熱處理品質，跨越兩種製造決策"
                : "一個可信平台，長出多種工業 Agent"}
            </h1>
            <p>
              {precision
                ? "FASTEN-1 串起 RFQ-to-First-Good-Part；HEAT-1 串起 Batch-to-Release Quality。兩者共用 Product Thread、Evidence 與 Human Gates，但保留完全不同的工程故事。"
                : "LOOP-1 證明 Evidence-first investigation；LOOP-2～4 展示同一套 Data Hub、Thread、policy 與 evaluation 如何承載 dynamic risk、lifecycle prediction 與 Soft Sensor。"}
            </p>
          </div>
          <aside>
            {precision ? (
              <>
                <strong>2 WORKFLOWS</strong>
                <span>distinct Agent stories</span>
                <strong>12 STAGES</strong>
                <span>engineering → quality</span>
              </>
            ) : (
              <>
                <strong>1 LIVE</strong>
                <span>validated Agent</span>
                <strong>3 CONCEPTS</strong>
                <span>interactive blueprints</span>
              </>
            )}
          </aside>
        </section>

        <nav className="agent-portfolio-tabs" aria-label="Industrial Agent galleries">
          <button
            className={!precision ? "is-active" : ""}
            onClick={() => onPortfolioChange("chemical")}
          >
            <FlaskConical />
            <span><small>GALLERY 01</small><strong>Chemical Agents</strong></span>
            <em>LOOP-1–4</em>
          </button>
          <button
            className={precision ? "is-active" : ""}
            onClick={() => onPortfolioChange("precision")}
          >
            <Wrench />
            <span><small>GALLERY 02</small><strong>Precision Manufacturing</strong></span>
            <em>FASTEN-1 · HEAT-1</em>
          </button>
        </nav>

        <section className="agent-platform-layers" aria-label="Shared Agent platform capabilities">
          {layers.map(({ icon: Icon, label, detail }) => (
            <article key={label}>
              <Icon />
              <div>
                <strong>{label}</strong>
                <small>{detail}</small>
              </div>
            </article>
          ))}
        </section>

        <section className={`agent-gallery-grid ${precision ? "portfolio-precision" : ""}`}>
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onOpen={onOpen} />
          ))}
          {precision && (
            <article className="precision-journey-preview">
              <header>
                <Route />
                <div>
                  <small>AGENTIC WORKFLOW PORTFOLIO</small>
                  <h2>兩種製造決策：新品導入與熱處理品質放行</h2>
                </div>
              </header>
              <div className="precision-workflow-tracks">
                {[
                  {
                    code: "FASTEN-1",
                    tone: "fasten",
                    label: "RFQ-to-First-Good-Part",
                    stages: ["RFQ", "Drawing", "Cases", "Plan", "Trial", "Quality"],
                  },
                  {
                    code: "HEAT-1",
                    tone: "heat",
                    label: "Batch-to-Release Quality",
                    stages: ["Batch", "Load", "Journey", "Predict", "Explain", "Release"],
                  },
                ].map((workflow) => (
                  <section key={workflow.code} className={`track-${workflow.tone}`}>
                    <header><strong>{workflow.code}</strong><span>{workflow.label}</span></header>
                    <ol>
                      {workflow.stages.map((workflowStage, index) => (
                        <li key={workflowStage}>
                          <span>0{index + 1}</span>
                          <strong>{workflowStage}</strong>
                          {index < workflow.stages.length - 1 && <ChevronRight />}
                        </li>
                      ))}
                    </ol>
                  </section>
                ))}
              </div>
              <footer>
                <ShieldCheck />
                Blue: engineering workflow · Copper: thermal quality workflow · human-approved decisions
              </footer>
            </article>
          )}
        </section>

        <footer className="agent-gallery-footer">
          <div>
            <span>AGENT PACK CONTRACT</span>
            <strong>
              {precision
                ? "Trigger → Documents → Product Thread → Tools → Human Gates → Evidence"
                : "Manifest → Assets/Tags → Skills/Models → Evidence → Policy → Evaluation"}
            </strong>
          </div>
          <p>
            Concept Experiences 是 deterministic markup，不代表已完成 production
            model、customer validation 或 operating authority。
          </p>
        </footer>
      </main>
    </div>
  );
}

function chartPoints(values: number[], min: number, max: number): string {
  const range = Math.max(1, max - min);
  return values
    .map((value, index) => {
      const x = 8 + (index / Math.max(1, values.length - 1)) * 484;
      const y = 178 - ((value - min) / range) * 142;
      return `${x},${y}`;
    })
    .join(" ");
}

function ConceptChart({ scenario }: { scenario: ConceptScenario }) {
  const allValues = [
    ...scenario.chart.primary,
    ...scenario.chart.secondary,
    ...scenario.chart.limit,
  ];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  return (
    <article className="concept-chart-panel">
      <header>
        <div>
          <small>DETERMINISTIC CONCEPT SIGNALS</small>
          <h2>{scenario.scenarioLabel}</h2>
        </div>
        <div className="concept-chart-legend">
          <span className="legend-primary">{scenario.chart.primaryLabel}</span>
          <span className="legend-secondary">{scenario.chart.secondaryLabel}</span>
          <span className="legend-limit">{scenario.chart.limitLabel}</span>
        </div>
      </header>
      <div className="concept-chart">
        <span className="chart-max">{max.toFixed(0)} {scenario.chart.unit}</span>
        <span className="chart-min">{min.toFixed(0)} {scenario.chart.unit}</span>
        <svg viewBox="0 0 500 190" preserveAspectRatio="none">
          <line x1="8" x2="492" y1="36" y2="36" />
          <line x1="8" x2="492" y1="82" y2="82" />
          <line x1="8" x2="492" y1="130" y2="130" />
          <line x1="8" x2="492" y1="178" y2="178" />
          <polyline
            className="chart-line-limit"
            points={chartPoints(scenario.chart.limit, min, max)}
          />
          <polyline
            className="chart-line-secondary"
            points={chartPoints(scenario.chart.secondary, min, max)}
          />
          <polyline
            className="chart-line-primary"
            points={chartPoints(scenario.chart.primary, min, max)}
          />
        </svg>
      </div>
      <footer>
        <span>t − 15m</span>
        <span>now</span>
      </footer>
    </article>
  );
}

function ConceptTrace({
  scenario,
  visibleSteps,
  running,
}: {
  scenario: ConceptScenario;
  visibleSteps: number;
  running: boolean;
}) {
  return (
    <article className="concept-trace-panel">
      <header>
        <div>
          <Activity />
          <div>
            <small>AGENT EXECUTION</small>
            <h2>可稽核 Decision Flow</h2>
          </div>
        </div>
        <span>{running ? "RUNNING" : visibleSteps ? "COMPLETE" : "READY"}</span>
      </header>
      <ol>
        {scenario.traces.map((step, index) => {
          const visible = index < visibleSteps;
          return (
            <li key={`${step.type}-${step.title}`} className={visible ? "visible" : ""}>
              <span>{visible ? <Check /> : index + 1}</span>
              <div>
                <small>{step.type}</small>
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <footer>
        <ShieldCheck />
        Structured rationale · not private chain-of-thought
      </footer>
    </article>
  );
}

function ResultWorkspace({
  agent,
  complete,
}: {
  agent: AgentDefinition;
  complete: boolean;
}) {
  const scenario = agent.scenario;
  if (!scenario) return null;
  return (
    <section className={`concept-results ${complete ? "is-complete" : ""}`}>
      <article className="concept-verdict">
        <header>
          <span><Check /></span>
          <div>
            <small>AGENT RESULT</small>
            <h2>{complete ? scenario.verdict : "等待執行 Concept Agent"}</h2>
          </div>
          {complete && (
            <strong>{scenario.confidence}%<small>{scenario.confidenceLabel}</small></strong>
          )}
        </header>
        <p>
          {complete
            ? scenario.summary
            : "按 Run Concept 後，畫面會依序顯示 bounded trace、結果、Evidence 與 Action draft。"}
        </p>
      </article>

      <div className="concept-metrics">
        {scenario.metrics.map((metric) => (
          <article key={metric.label} className={`metric-${metric.tone}`}>
            <small>{metric.label}</small>
            <strong>{complete ? metric.value : "—"}</strong>
            <span>{metric.detail}</span>
          </article>
        ))}
      </div>

      <article className="concept-factors">
        <header>
          <small>CONTRIBUTING FACTORS</small>
          <strong>Evidence-weighted signals</strong>
        </header>
        {scenario.factors.map((factor) => (
          <div key={factor.label}>
            <span>{factor.label}</span>
            <i><b style={{ width: complete ? `${factor.value}%` : "0%" }} /></i>
            <strong>{complete ? factor.value : 0}</strong>
          </div>
        ))}
      </article>
    </section>
  );
}

function ConceptAgentExperience({
  agent,
  onBack,
  onClose,
}: {
  agent: AgentDefinition;
  onBack: () => void;
  onClose?: () => void;
}) {
  const scenario = agent.scenario;
  if (!scenario) {
    throw new Error(`${agent.code} has no concept scenario`);
  }
  const [running, setRunning] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (visibleSteps >= scenario.traces.length) {
      setRunning(false);
      setComplete(true);
      return;
    }
    const timeout = window.setTimeout(
      () => setVisibleSteps((value) => value + 1),
      340,
    );
    return () => window.clearTimeout(timeout);
  }, [running, scenario.traces.length, visibleSteps]);

  const run = () => {
    setVisibleSteps(0);
    setComplete(false);
    setRunning(true);
  };
  const reset = () => {
    setRunning(false);
    setVisibleSteps(0);
    setComplete(false);
  };

  return (
    <div className={`agent-concept-shell accent-${agent.accent}`}>
      <header className="concept-topbar">
        <button className="concept-back" onClick={onBack}>
          <ArrowLeft /> Back to Gallery
        </button>
        <div className="concept-brand">
          <span>{agent.code}</span>
          <div>
            <strong>{agent.shortTitle}</strong>
            <small>{agent.domain}</small>
          </div>
        </div>
        <div className="concept-boundary">
          <Beaker /> SYNTHETIC CONCEPT · NOT FOR OPERATIONS
        </div>
        <button className="concept-close" aria-label="Close Agent Platform" onClick={onClose}>
          <X />
        </button>
      </header>

      <main className="concept-main">
        <section className="concept-hero">
          <div>
            <span>{agent.archetype}</span>
            <h1>{agent.title}</h1>
            <p>{scenario.scenarioDescription}</p>
          </div>
          <aside>
            <label>
              Scenario
              <strong>{scenario.scenarioLabel}</strong>
            </label>
            <div>
              <button className="concept-run" onClick={run} disabled={running}>
                <Play /> {running ? "Running…" : scenario.runLabel}
              </button>
              <button className="concept-reset" onClick={reset} disabled={running}>
                <RotateCcw /> Reset
              </button>
            </div>
          </aside>
        </section>

        <section className="concept-workspace">
          <ConceptChart scenario={scenario} />
          <ConceptTrace
            scenario={scenario}
            visibleSteps={visibleSteps}
            running={running}
          />
          <ResultWorkspace agent={agent} complete={complete} />
        </section>

        <section className={`concept-evidence ${complete ? "is-complete" : ""}`}>
          <header>
            <div>
              <FileCheck2 />
              <div>
                <small>EVIDENCE PACKAGE</small>
                <h2>可追查來源與模型邊界</h2>
              </div>
            </div>
            <span>{complete ? `${scenario.evidence.length} linked records` : "Awaiting run"}</span>
          </header>
          <div>
            {scenario.evidence.map((item) => (
              <article key={item.source}>
                <small>{item.kind}</small>
                <strong>{complete ? item.source : "—"}</strong>
                <p>{complete ? item.claim : "執行後顯示 bounded Evidence。"}</p>
              </article>
            ))}
          </div>
        </section>

        <article className={`concept-action ${complete ? "is-complete" : ""}`}>
          <span><ShieldCheck /></span>
          <div>
            <small>DRAFT-ONLY NEXT STEP</small>
            <h2>{complete ? scenario.actionTitle : "No Action before Evidence"}</h2>
            <p>{complete ? scenario.actionBody : "Concept Agent 不會在分析完成前建立 Action。"}</p>
          </div>
          <button disabled={!complete}>Request Human Review</button>
        </article>
      </main>
    </div>
  );
}

export function AgentPlatformExperience({
  apiBaseUrl,
  bearerToken,
  onClose,
}: AgentPlatformExperienceProps) {
  const [activeAgentId, setActiveAgentId] = useState<AgentId | null>(null);
  const [portfolio, setPortfolio] = useState<AgentPortfolio>("chemical");
  const activeAgent = useMemo(
    () => (activeAgentId ? getAgent(activeAgentId) : null),
    [activeAgentId],
  );

  if (!activeAgent) {
    return (
      <AgentGallery
        portfolio={portfolio}
        onPortfolioChange={setPortfolio}
        onOpen={setActiveAgentId}
        {...(onClose ? { onClose } : {})}
      />
    );
  }
  if (activeAgent.id === "loop1") {
    return (
      <Loop1Experience
        apiBaseUrl={apiBaseUrl}
        bearerToken={bearerToken}
        onBack={() => setActiveAgentId(null)}
        {...(onClose ? { onClose } : {})}
      />
    );
  }
  if (activeAgent.id === "fasten1") {
    return (
      <Fasten1Experience
        onBack={() => {
          setPortfolio("precision");
          setActiveAgentId(null);
        }}
        {...(onClose ? { onClose } : {})}
      />
    );
  }
  if (activeAgent.id === "heat1") {
    return (
      <Heat1Experience
        onBack={() => {
          setPortfolio("precision");
          setActiveAgentId(null);
        }}
        {...(onClose ? { onClose } : {})}
      />
    );
  }
  return (
    <ConceptAgentExperience
      agent={activeAgent}
      onBack={() => setActiveAgentId(null)}
      {...(onClose ? { onClose } : {})}
    />
  );
}
