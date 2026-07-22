import {
  Activity,
  CircleDot,
  FastForward,
  FileCheck2,
  FlaskConical,
  Gauge,
  Languages,
  Link2,
  ListChecks,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  controlLoop1,
  fetchLoop1Cases,
  fetchLoop1Snapshot,
  investigateLoop1,
  investigateLoop1Stream,
  requestLoop1Approval,
} from "./api";
import {
  alarmMessage,
  assetLabel,
  documentTitle,
  evidenceClaim,
  evidenceKindLabel,
  hypothesisReasoning,
  hypothesisTitle,
  investigationSummary,
  safetyNotice,
  similarCaseTitle,
  skillSummary,
  stateLabel,
  t,
  tagLabel,
  traceEventLabel,
  rootCauseLabel,
} from "./i18n";
import type {
  Loop1CaseSummary,
  Loop1ExperienceProps,
  Loop1Investigation,
  Loop1Locale,
  Loop1Page,
  Loop1Snapshot,
  Loop1TraceEvent,
} from "./types";

const PAGES: Array<{
  id: Loop1Page;
  icon: typeof Activity;
}> = [
  { id: "unit", icon: FlaskConical },
  { id: "timeline", icon: Activity },
  { id: "investigation", icon: Search },
  { id: "evidence", icon: FileCheck2 },
];

const PROCESS_ASSETS = [
  {
    id: "component-cooling-valve",
    code: "FV-101",
    tags: ["cooling-valve-command", "cooling-valve-position", "cooling-water-flow"],
  },
  {
    id: "equipment-reactor",
    code: "R-101",
    tags: ["reactor-temperature", "reactor-pressure", "reactor-level"],
  },
  {
    id: "equipment-condenser",
    code: "E-101",
    tags: ["condenser-duty", "condenser-outlet-temp"],
  },
  {
    id: "equipment-separator",
    code: "V-101",
    tags: ["separator-level", "separator-pressure"],
  },
  {
    id: "equipment-compressor",
    code: "K-101",
    tags: ["compressor-load", "compressor-vibration-de"],
  },
  {
    id: "equipment-stripper",
    code: "T-101",
    tags: ["product-quality-proxy", "stripper-temperature-top"],
  },
] as const;

function valueLabel(value: unknown, unit?: string): string {
  if (typeof value === "number") {
    const formatted = Math.abs(value) >= 100 ? value.toFixed(1) : value.toFixed(2);
    return `${formatted}${unit ? ` ${unit}` : ""}`;
  }
  return value == null ? "—" : String(value);
}

function ageLabel(timestamp: string): string {
  return new Date(timestamp).toISOString().slice(11, 19);
}

export function Loop1Experience({
  apiBaseUrl,
  bearerToken,
  locale: initialLocale = "zh-TW",
  onClose,
}: Loop1ExperienceProps) {
  const api = useMemo(
    () => ({ apiBaseUrl, bearerToken }),
    [apiBaseUrl, bearerToken],
  );
  const [page, setPage] = useState<Loop1Page>("unit");
  const [locale, setLocale] = useState<Loop1Locale>(initialLocale);
  const [snapshot, setSnapshot] = useState<Loop1Snapshot | null>(null);
  const [investigation, setInvestigation] =
    useState<Loop1Investigation | null>(null);
  const [cases, setCases] = useState<Loop1CaseSummary[]>([]);
  const [selectedCase, setSelectedCase] =
    useState<Loop1CaseSummary["caseId"]>("hero");
  const [objective, setObjective] = useState(
    "調查反應器冷卻偏差，找出最早變化、主要根因假設、反證與安全的下一步。",
  );
  const [trace, setTrace] = useState<Loop1TraceEvent[]>([]);
  const [autoRun, setAutoRun] = useState(false);
  const [speed, setSpeed] = useState<1 | 5 | 10>(1);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const pendingRef = useRef(false);

  const refreshInvestigation = useCallback(async () => {
    const result = await investigateLoop1(api);
    setInvestigation(result);
    return result;
  }, [api]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchLoop1Snapshot(api),
      investigateLoop1(api),
      fetchLoop1Cases(api),
    ])
      .then(([nextSnapshot, nextInvestigation, nextCases]) => {
        if (!cancelled) {
          setSnapshot(nextSnapshot);
          setInvestigation(nextInvestigation);
          setCases(nextCases);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : t(locale, "loadFailed"),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setBusy(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [api, locale]);

  const runCaseInvestigation = useCallback(
    async (caseId: "current" | Loop1CaseSummary["caseId"]) => {
      if (pendingRef.current) {
        return;
      }
      pendingRef.current = true;
      setBusy(true);
      setError(null);
      setActionMessage(null);
      setTrace([]);
      setPage("investigation");
      try {
        await investigateLoop1Stream(
          api,
          { caseId, objective, locale },
          (event) => {
            setTrace((current) => [...current, event]);
            if (event.type === "complete") {
              const result = event.payload.result as Loop1Investigation | undefined;
              if (result) {
                setInvestigation(result);
              }
            } else if (event.type === "error") {
              setError(String(event.payload.message ?? t(locale, "investigationFailed")));
            }
          },
        );
        setSnapshot(await fetchLoop1Snapshot(api));
      } catch (reason) {
        setError(
          reason instanceof Error ? reason.message : t(locale, "investigationFailed"),
        );
      } finally {
        pendingRef.current = false;
        setBusy(false);
      }
    },
    [api, locale, objective],
  );

  const runControl = useCallback(
    async (
      control:
        | { action: "step"; count: number }
        | { action: "pause" | "resume" | "reset" | "jump-to-fault" }
        | { action: "replay"; toTick: number },
      refreshAgent = true,
    ) => {
      if (pendingRef.current) {
        return;
      }
      pendingRef.current = true;
      setBusy(true);
      setActionMessage(null);
      try {
        const nextSnapshot = await controlLoop1(api, control);
        setSnapshot(nextSnapshot);
        if (refreshAgent) {
          await refreshInvestigation();
        }
        setError(null);
      } catch (controlError) {
        setError(
          controlError instanceof Error
            ? controlError.message
            : t(locale, "controlFailed"),
        );
        setAutoRun(false);
      } finally {
        pendingRef.current = false;
        setBusy(false);
      }
    },
    [api, locale, refreshInvestigation],
  );

  useEffect(() => {
    if (!autoRun) {
      return;
    }
    const timer = window.setInterval(() => {
      const nextTick = (snapshot?.run.tick ?? 0) + speed;
      void runControl(
        { action: "step", count: speed },
        nextTick % 10 === 0,
      );
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [autoRun, runControl, snapshot?.run.tick, speed]);

  const telemetry = useMemo(
    () =>
      new Map(
        (snapshot?.observations ?? []).map((observation) => [
          observation.tagId,
          observation,
        ]),
      ),
    [snapshot],
  );
  const criticalAlarms =
    snapshot?.alarms.filter((alarm) => alarm.priority === "critical").length ?? 0;

  if (!snapshot && busy) {
    return (
      <div className="loop1-shell loop1-loading">
        <FlaskConical />
        <strong>{t(locale, "connecting")}</strong>
      </div>
    );
  }

  return (
    <div className="loop1-shell">
      <header className="loop1-topbar">
        <div className="loop1-brand">
          <span className="loop1-mark"><FlaskConical /></span>
          <div>
            <strong>Solera LOOP-1</strong>
            <small>{t(locale, "lab")}</small>
          </div>
        </div>
        <div className="loop1-disclosure">
          <ShieldCheck />
          <span>{t(locale, "disclosure")}</span>
        </div>
        <div className="loop1-run-meta">
          <span className={`loop1-state state-${snapshot?.run.state ?? "unknown"}`}>
            <CircleDot /> {stateLabel(snapshot?.run.state ?? "offline", locale)}
          </span>
          <span>Tick {snapshot?.run.tick ?? 0}</span>
          <span>
            {t(locale, "simulationTime")}{" "}
            {snapshot ? ageLabel(snapshot.run.simulationTime) : "—"}
          </span>
          <button
            className="loop1-locale"
            aria-label={t(locale, "locale")}
            title={t(locale, "locale")}
            onClick={() => setLocale((value) => (value === "zh-TW" ? "en" : "zh-TW"))}
          >
            <Languages />
            <small>{locale === "zh-TW" ? "EN" : "中"}</small>
          </button>
          <button aria-label="Close LOOP-1" onClick={onClose}><X /></button>
        </div>
      </header>

      <nav className="loop1-nav" aria-label="LOOP-1 workspace">
        {PAGES.map(({ id, icon: Icon }) => (
          <button
            key={id}
            className={page === id ? "active" : ""}
            onClick={() => setPage(id)}
          >
            <Icon />
            <span>{t(locale, id)}</span>
          </button>
        ))}
      </nav>

      <main className="loop1-main">
        <section className="loop1-hero">
          <div>
            <p>{t(locale, "heroEyebrow")}</p>
            <h1>
              {page === "unit" && t(locale, "unitTitle")}
              {page === "timeline" && t(locale, "timelineTitle")}
              {page === "investigation" && t(locale, "investigationTitle")}
              {page === "evidence" && t(locale, "evidenceTitle")}
            </h1>
            <span>{t(locale, "heroDescription")}</span>
          </div>
          <div className="loop1-pulse">
            <Activity />
            <div>
              <small>SOLERA PULSE</small>
              <strong>
                {snapshot?.pulse?.status === "healthy" && locale === "zh-TW"
                  ? "正常"
                  : snapshot?.pulse?.status ?? t(locale, "checking")}
              </strong>
            </div>
            <span>
              {snapshot?.pulse?.lagSeconds ?? 0}
              {t(locale, "lag")}
            </span>
          </div>
        </section>

        {error && (
          <div className="loop1-error"><TriangleAlert /> {error}</div>
        )}

        {page === "unit" && snapshot && (
          <UnitOverview
            snapshot={snapshot}
            telemetry={telemetry}
            criticalAlarms={criticalAlarms}
            locale={locale}
          />
        )}
        {page === "timeline" && snapshot && (
          <Timeline
            snapshot={snapshot}
            investigation={investigation}
            locale={locale}
          />
        )}
        {page === "investigation" && (
          <Investigation
            result={investigation}
            busy={busy}
            locale={locale}
            cases={cases}
            selectedCase={selectedCase}
            onCaseChange={setSelectedCase}
            objective={objective}
            onObjectiveChange={setObjective}
            trace={trace}
            onRun={() => void runCaseInvestigation(selectedCase)}
          />
        )}
        {page === "evidence" && (
          <EvidenceWorkspace result={investigation} locale={locale} />
        )}
      </main>

      <aside className="loop1-action-rail">
        <div>
          <small>{t(locale, "replayMode")}</small>
          <strong>
            {autoRun ? `${speed}x ${t(locale, "running")}` : t(locale, "paused")}
          </strong>
        </div>
        <button
          className="loop1-icon-button"
          title={t(locale, autoRun ? "pauseReplay" : "playReplay")}
          aria-label={t(locale, autoRun ? "pauseReplay" : "playReplay")}
          onClick={() => setAutoRun((value) => !value)}
        >
          {autoRun ? <Pause /> : <Play />}
        </button>
        <div className="loop1-speed">
          {([1, 5, 10] as const).map((value) => (
            <button
              key={value}
              className={speed === value ? "active" : ""}
              title={t(locale, "speedReplay")}
              onClick={() => setSpeed(value)}
            >
              {value}x
            </button>
          ))}
        </div>
        <button
          onClick={() => void runControl({ action: "reset" })}
          disabled={busy}
          title={t(locale, "resetReplay")}
        >
          <RotateCcw /> Reset to tick 0
        </button>
        <button
          onClick={() => void runControl({ action: "replay", toTick: 60 })}
          disabled={busy}
          title={t(locale, "normalReplay")}
        >
          <CircleDot /> Normal baseline
        </button>
        <button
          onClick={() => void runControl({ action: "jump-to-fault" })}
          disabled={busy}
          title={t(locale, "jumpReplay")}
        >
          <FastForward /> Jump to fault
        </button>
        <button
          className="loop1-hero-run"
          onClick={() => {
            setSelectedCase("hero");
            void runCaseInvestigation("hero");
          }}
          disabled={busy}
          title={t(locale, "heroReplay")}
        >
          <TriangleAlert /> Run Hero scenario
        </button>
        <button
          onClick={() => void runCaseInvestigation("current")}
          disabled={busy}
          title={t(locale, "currentInvestigation")}
        >
          <Search /> Investigate
        </button>
        <button
          className="loop1-approve"
          disabled={!investigation?.actionDraft || busy}
          title={t(locale, "approvalRequest")}
          onClick={() => {
            setBusy(true);
            void requestLoop1Approval(api)
              .then(() => setActionMessage(t(locale, "approvedDraft")))
              .catch((reason: unknown) =>
                setActionMessage(
                  reason instanceof Error
                    ? reason.message
                    : t(locale, "approvalFailed"),
                ),
              )
              .finally(() => setBusy(false));
          }}
        >
          <FileCheck2 /> Request approval
        </button>
        {actionMessage && <span className="loop1-action-message">{actionMessage}</span>}
      </aside>
    </div>
  );
}

function UnitOverview({
  snapshot,
  telemetry,
  criticalAlarms,
  locale,
}: {
  snapshot: Loop1Snapshot;
  telemetry: Map<string, Loop1Snapshot["observations"][number]>;
  criticalAlarms: number;
  locale: Loop1Locale;
}) {
  const mismatch =
    Number(telemetry.get("cooling-valve-command")?.value ?? 0) -
    Number(telemetry.get("cooling-valve-position")?.value ?? 0);
  return (
    <>
      <section className="loop1-kpis">
        <article>
          <small>{t(locale, "commandPosition")}</small>
          <strong>{mismatch.toFixed(2)} pp</strong>
          <span className={mismatch > 5 ? "critical" : "healthy"}>
            {mismatch > 5 ? t(locale, "mismatchDetected") : t(locale, "tracking")}
          </span>
        </article>
        <article>
          <small>{t(locale, "reactorTemperature")}</small>
          <strong>{valueLabel(telemetry.get("reactor-temperature")?.value, "°C")}</strong>
          <span>{t(locale, "deterministicSignal")}</span>
        </article>
        <article>
          <small>{t(locale, "rawAlarms")}</small>
          <strong>{snapshot.alarms.length}</strong>
          <span>
            {criticalAlarms} {t(locale, "criticalVisible")}
          </span>
        </article>
        <article>
          <small>{t(locale, "eventClusters")}</small>
          <strong>{snapshot.alarms.length ? 1 : 0}</strong>
          <span>{t(locale, "causeGrouping")}</span>
        </article>
      </section>
      <section className="loop1-process">
        <div className="loop1-process-line" aria-hidden="true" />
        {PROCESS_ASSETS.map((asset, index) => (
          <article key={asset.id} className={index === 0 && mismatch > 5 ? "alert" : ""}>
            <div className="loop1-asset-head">
              <Gauge />
              <div>
                <strong>{asset.code}</strong>
                <span>{assetLabel(asset.id, locale)}</span>
              </div>
            </div>
            <dl>
              {asset.tags.map((tagId) => {
                const signal = telemetry.get(tagId);
                return (
                  <div key={tagId}>
                    <dt title={tagId}>
                      <span>{tagLabel(tagId, locale)}</span>
                      <code>{tagId}</code>
                    </dt>
                    <dd>{valueLabel(signal?.value, signal?.unit)}</dd>
                  </div>
                );
              })}
            </dl>
            <footer>
              <span>{index + 1}</span>
              <small>{stateLabel(snapshot.run.state, locale)}</small>
            </footer>
          </article>
        ))}
      </section>
    </>
  );
}

function Timeline({
  snapshot,
  investigation,
  locale,
}: {
  snapshot: Loop1Snapshot;
  investigation: Loop1Investigation | null;
  locale: Loop1Locale;
}) {
  if (!snapshot.alarms.length) {
    return (
      <section className="loop1-empty">
        <Activity />
        <h2>{t(locale, "noAlarms")}</h2>
        <p>{t(locale, "runHeroHint")}</p>
      </section>
    );
  }
  return (
    <section className="loop1-timeline">
      <header>
        <div>
          <small>{t(locale, "rawAlarms")}</small>
          <strong>{snapshot.alarms.length}</strong>
        </div>
        <span>{t(locale, "compressedInto")}</span>
        <div>
          <small>{t(locale, "eventClusters")}</small>
          <strong>{investigation?.alarmClusters.length ?? 1}</strong>
        </div>
      </header>
      <ol>
        {snapshot.alarms.map((alarm, index) => (
          <li key={alarm.alarmId} className={`priority-${alarm.priority}`}>
            <time>{ageLabel(alarm.occurredAt)}</time>
            <span className="loop1-timeline-dot">{index + 1}</span>
            <div>
              <small>
                {assetLabel(alarm.assetId, locale)} · {alarm.assetId} ·{" "}
                {stateLabel(alarm.priority, locale)}
              </small>
              <strong>{alarmMessage(alarm, locale)}</strong>
              <span>
                {alarm.tagId ?? "event"} · {t(locale, "linkedCause")}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Investigation({
  result,
  busy,
  locale,
  cases,
  selectedCase,
  onCaseChange,
  objective,
  onObjectiveChange,
  trace,
  onRun,
}: {
  result: Loop1Investigation | null;
  busy: boolean;
  locale: Loop1Locale;
  cases: Loop1CaseSummary[];
  selectedCase: Loop1CaseSummary["caseId"];
  onCaseChange: (caseId: Loop1CaseSummary["caseId"]) => void;
  objective: string;
  onObjectiveChange: (objective: string) => void;
  trace: Loop1TraceEvent[];
  onRun: () => void;
}) {
  const plan = [
    t(locale, "planQuality"),
    t(locale, "planAlarm"),
    t(locale, "planContext"),
    t(locale, "planHypothesis"),
    t(locale, "planSafety"),
  ];
  return (
    <section className="loop1-investigation">
      <article className="loop1-console">
        <header>
          <div>
            <small>{t(locale, "caseConsole")}</small>
            <h2>{t(locale, "chooseCase")}</h2>
          </div>
          <span>
            {locale === "zh-TW" ? "唯讀 · DETERMINISTIC" : "READ-ONLY · DETERMINISTIC"}
          </span>
        </header>
        <div className="loop1-console-grid">
          <label>
            <span>Case</span>
            <select
              value={selectedCase}
              disabled={busy}
              onChange={(event) =>
                onCaseChange(event.target.value as Loop1CaseSummary["caseId"])
              }
            >
              {cases.map((caseItem) => (
                <option key={caseItem.caseId} value={caseItem.caseId}>
                  {caseItem.title[locale]} · tick {caseItem.targetTick}
                </option>
              ))}
            </select>
            <small>
              {cases.find((caseItem) => caseItem.caseId === selectedCase)
                ?.description[locale] ?? ""}
            </small>
          </label>
          <label>
            <span>{t(locale, "objective")}</span>
            <textarea
              value={objective}
              disabled={busy}
              placeholder={t(locale, "objectivePlaceholder")}
              onChange={(event) => onObjectiveChange(event.target.value)}
            />
          </label>
        </div>
        <div className="loop1-plan">
          <header>
            <ListChecks />
            <strong>{t(locale, "boundedPlan")}</strong>
          </header>
          <ol>
            {plan.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <button
          className="loop1-console-run"
          disabled={busy || !objective.trim()}
          onClick={onRun}
        >
          <Search /> {t(locale, "startInvestigation")}
        </button>
      </article>

      <article className="loop1-trace">
        <header>
          <div>
            <Activity />
            <h3>{t(locale, "executionTrace")}</h3>
          </div>
          <small>{t(locale, "traceDisclaimer")}</small>
        </header>
        {!trace.length ? (
          <p>{t(locale, "waitingTrace")}</p>
        ) : (
          <ol>
            {trace.map((event, index) => (
              <li key={event.eventId} className={`trace-${event.type}`}>
                <span>{index + 1}</span>
                <div>
                  <strong>{traceEventLabel(event, locale)}</strong>
                  <small>
                    {new Date(event.occurredAt).toISOString().slice(11, 23)} ·{" "}
                    {event.type}
                  </small>
                </div>
              </li>
            ))}
          </ol>
        )}
      </article>

      {!result ? (
        <section className="loop1-empty loop1-investigation-empty">
          <Search />
          <h2>{t(locale, "noInvestigation")}</h2>
        </section>
      ) : (
        <>
          <article className={`loop1-findings status-${result.status}`}>
            <small>{stateLabel(result.status, locale).toUpperCase()}</small>
            <h2>{investigationSummary(result, locale)}</h2>
            <p>{safetyNotice(result, locale)}</p>
            {busy && (
              <span className="loop1-working">{t(locale, "updatingEvidence")}</span>
            )}
          </article>
          <div className="loop1-hypotheses">
            {result.hypotheses.map((hypothesis) => (
              <article key={hypothesis.hypothesisId}>
                <span className="loop1-rank">#{hypothesis.rank}</span>
                <div>
                  <small>{stateLabel(hypothesis.status, locale)}</small>
                  <h3>{hypothesisTitle(hypothesis, locale)}</h3>
                  <p>{hypothesisReasoning(hypothesis, locale)}</p>
                  <footer>
                    <span>
                      {hypothesis.evidenceRefs.length}{" "}
                      {t(locale, "supportingEvidence")}
                    </span>
                    <span>
                      {hypothesis.counterEvidenceRefs.length}{" "}
                      {t(locale, "counterEvidence")}
                    </span>
                  </footer>
                </div>
                <strong>{Math.round(hypothesis.confidence * 100)}%</strong>
              </article>
            ))}
          </div>
          {result.actionDraft && (
            <article className="loop1-draft">
              <FileCheck2 />
              <div>
                <small>{t(locale, "draftOnlyAction")}</small>
                <h3>
                  {locale === "zh-TW"
                    ? "建立 FV-101 現場檢查草稿"
                    : result.actionDraft.title}
                </h3>
                <p>
                  {locale === "zh-TW"
                    ? "僅限草稿；授權人員仍須依核准程序、工作許可與隔離流程執行。"
                    : result.actionDraft.safetyBoundary}
                </p>
              </div>
            </article>
          )}
        </>
      )}
    </section>
  );
}

function EvidenceWorkspace({
  result,
  locale,
}: {
  result: Loop1Investigation | null;
  locale: Loop1Locale;
}) {
  if (!result) {
    return (
      <section className="loop1-empty">
        <Link2 />
        <h2>{t(locale, "noEvidence")}</h2>
      </section>
    );
  }
  return (
    <section className="loop1-evidence">
      <div className="loop1-evidence-list">
        <header>
          <h2>{t(locale, "evidenceLedger")}</h2>
          <span>
            {result.evidence.length} {t(locale, "records")}
          </span>
        </header>
        {result.evidence.map((item) => (
          <article key={item.evidenceId}>
            <span className={`evidence-${item.kind}`}>
              {evidenceKindLabel(item.kind, locale)}
            </span>
            <div>
              <strong>{evidenceClaim(item, locale)}</strong>
              <small>{item.sourceId}</small>
            </div>
            <code>{valueLabel(item.value, item.unit ?? undefined)}</code>
          </article>
        ))}
      </div>
      <div className="loop1-context-stack">
        <article>
          <header>
            <FileCheck2 />
            <h3>{t(locale, "documents")}</h3>
          </header>
          {result.documents.slice(0, 5).map((document) => (
            <div key={document.documentId}>
              <strong>{documentTitle(document, locale)}</strong>
              <small>
                {document.documentId} · {t(locale, "score")}{" "}
                {document.score.toFixed(2)}
              </small>
            </div>
          ))}
        </article>
        <article>
          <header>
            <Link2 />
            <h3>{t(locale, "similarCases")}</h3>
          </header>
          {result.similarCases.slice(0, 5).map((caseItem) => (
            <div key={caseItem.caseId}>
              <strong>{similarCaseTitle(caseItem, locale)}</strong>
              <small>
                {rootCauseLabel(caseItem.rootCause, locale)} · {caseItem.caseId} ·{" "}
                {t(locale, "score")} {caseItem.score}
              </small>
            </div>
          ))}
        </article>
        <article>
          <header>
            <ShieldCheck />
            <h3>{t(locale, "skillTrace")}</h3>
          </header>
          {result.skillTrace.map((skill) => (
            <div key={skill.skillId}>
              <strong>{skill.skillId}</strong>
              <small>{skillSummary(skill.skillId, skill.summary, locale)}</small>
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}
