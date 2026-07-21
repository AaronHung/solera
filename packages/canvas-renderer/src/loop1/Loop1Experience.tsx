import {
  Activity,
  CircleDot,
  FastForward,
  FileCheck2,
  FlaskConical,
  Gauge,
  Link2,
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
  fetchLoop1Snapshot,
  investigateLoop1,
  requestLoop1Approval,
} from "./api";
import type {
  Loop1ExperienceProps,
  Loop1Investigation,
  Loop1Page,
  Loop1Snapshot,
} from "./types";

const PAGES: Array<{
  id: Loop1Page;
  label: string;
  icon: typeof Activity;
}> = [
  { id: "unit", label: "Unit", icon: FlaskConical },
  { id: "timeline", label: "Timeline", icon: Activity },
  { id: "investigation", label: "Investigation", icon: Search },
  { id: "evidence", label: "Evidence", icon: FileCheck2 },
];

const PROCESS_ASSETS = [
  {
    id: "component-cooling-valve",
    code: "FV-101",
    name: "Cooling valve",
    tags: ["cooling-valve-command", "cooling-valve-position", "cooling-water-flow"],
  },
  {
    id: "equipment-reactor",
    code: "R-101",
    name: "Reactor",
    tags: ["reactor-temperature", "reactor-pressure", "reactor-level"],
  },
  {
    id: "equipment-condenser",
    code: "E-101",
    name: "Condenser",
    tags: ["condenser-duty", "condenser-outlet-temp"],
  },
  {
    id: "equipment-separator",
    code: "V-101",
    name: "Separator",
    tags: ["separator-level", "separator-pressure"],
  },
  {
    id: "equipment-compressor",
    code: "K-101",
    name: "Recycle compressor",
    tags: ["compressor-load", "compressor-vibration-de"],
  },
  {
    id: "equipment-stripper",
    code: "T-101",
    name: "Stripper",
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
  onClose,
}: Loop1ExperienceProps) {
  const api = useMemo(
    () => ({ apiBaseUrl, bearerToken }),
    [apiBaseUrl, bearerToken],
  );
  const [page, setPage] = useState<Loop1Page>("unit");
  const [snapshot, setSnapshot] = useState<Loop1Snapshot | null>(null);
  const [investigation, setInvestigation] =
    useState<Loop1Investigation | null>(null);
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
    void Promise.all([fetchLoop1Snapshot(api), investigateLoop1(api)])
      .then(([nextSnapshot, nextInvestigation]) => {
        if (!cancelled) {
          setSnapshot(nextSnapshot);
          setInvestigation(nextInvestigation);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "LOOP-1 failed to load",
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
  }, [api]);

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
            : "LOOP-1 control failed",
        );
        setAutoRun(false);
      } finally {
        pendingRef.current = false;
        setBusy(false);
      }
    },
    [api, refreshInvestigation],
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
        <strong>Connecting to LOOP-1 synthetic plant…</strong>
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
            <small>Synthetic Industrial Agent Lab</small>
          </div>
        </div>
        <div className="loop1-disclosure">
          <ShieldCheck />
          <span>SYNTHETIC · READ-ONLY · NOT A SAFETY SYSTEM</span>
        </div>
        <div className="loop1-run-meta">
          <span className={`loop1-state state-${snapshot?.run.state ?? "unknown"}`}>
            <CircleDot /> {snapshot?.run.state ?? "offline"}
          </span>
          <span>Tick {snapshot?.run.tick ?? 0}</span>
          <span>{snapshot ? ageLabel(snapshot.run.simulationTime) : "—"}</span>
          <button aria-label="Close LOOP-1" onClick={onClose}><X /></button>
        </div>
      </header>

      <nav className="loop1-nav" aria-label="LOOP-1 workspace">
        {PAGES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={page === id ? "active" : ""}
            onClick={() => setPage(id)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <main className="loop1-main">
        <section className="loop1-hero">
          <div>
            <p>LOOP-1 / REACTOR COOLING LOOP</p>
            <h1>
              {page === "unit" && "Live Unit Overview"}
              {page === "timeline" && "Causal Alarm Timeline"}
              {page === "investigation" && "Evidence-first Investigation"}
              {page === "evidence" && "Evidence & Case Thread"}
            </h1>
            <span>
              One backend scenario clock drives telemetry, alarms, Agent Evidence,
              replay, and this Experience.
            </span>
          </div>
          <div className="loop1-pulse">
            <Activity />
            <div>
              <small>SOLERA PULSE</small>
              <strong>{snapshot?.pulse?.status ?? "checking"}</strong>
            </div>
            <span>{snapshot?.pulse?.lagSeconds ?? 0}s lag</span>
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
          />
        )}
        {page === "timeline" && snapshot && (
          <Timeline snapshot={snapshot} investigation={investigation} />
        )}
        {page === "investigation" && (
          <Investigation result={investigation} busy={busy} />
        )}
        {page === "evidence" && (
          <EvidenceWorkspace result={investigation} />
        )}
      </main>

      <aside className="loop1-action-rail">
        <div>
          <small>REPLAY MODE</small>
          <strong>{autoRun ? `${speed}x running` : "Paused"}</strong>
        </div>
        <button
          className="loop1-icon-button"
          title={autoRun ? "Pause replay" : "Start replay"}
          onClick={() => setAutoRun((value) => !value)}
        >
          {autoRun ? <Pause /> : <Play />}
        </button>
        <div className="loop1-speed">
          {([1, 5, 10] as const).map((value) => (
            <button
              key={value}
              className={speed === value ? "active" : ""}
              onClick={() => setSpeed(value)}
            >
              {value}x
            </button>
          ))}
        </div>
        <button
          onClick={() => void runControl({ action: "reset" })}
          disabled={busy}
        >
          <RotateCcw /> Reset
        </button>
        <button
          onClick={() => void runControl({ action: "jump-to-fault" })}
          disabled={busy}
        >
          <FastForward /> Jump to fault
        </button>
        <button
          className="loop1-hero-run"
          onClick={() => void runControl({ action: "replay", toTick: 220 })}
          disabled={busy}
        >
          <TriangleAlert /> Run Hero scenario
        </button>
        <button
          onClick={() => void refreshInvestigation().catch((reason: unknown) =>
            setError(reason instanceof Error ? reason.message : "Investigation failed"),
          )}
          disabled={busy}
        >
          <Search /> Investigate
        </button>
        <button
          className="loop1-approve"
          disabled={!investigation?.actionDraft || busy}
          onClick={() => {
            setBusy(true);
            void requestLoop1Approval(api)
              .then(() => setActionMessage("Draft sent for human approval."))
              .catch((reason: unknown) =>
                setActionMessage(
                  reason instanceof Error
                    ? reason.message
                    : "Approval request failed",
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
}: {
  snapshot: Loop1Snapshot;
  telemetry: Map<string, Loop1Snapshot["observations"][number]>;
  criticalAlarms: number;
}) {
  const mismatch =
    Number(telemetry.get("cooling-valve-command")?.value ?? 0) -
    Number(telemetry.get("cooling-valve-position")?.value ?? 0);
  return (
    <>
      <section className="loop1-kpis">
        <article>
          <small>COMMAND–POSITION</small>
          <strong>{mismatch.toFixed(2)} pp</strong>
          <span className={mismatch > 5 ? "critical" : "healthy"}>
            {mismatch > 5 ? "Mismatch detected" : "Tracking"}
          </span>
        </article>
        <article>
          <small>REACTOR TEMPERATURE</small>
          <strong>{valueLabel(telemetry.get("reactor-temperature")?.value, "°C")}</strong>
          <span>Deterministic signal</span>
        </article>
        <article>
          <small>RAW ALARMS</small>
          <strong>{snapshot.alarms.length}</strong>
          <span>{criticalAlarms} critical remain visible</span>
        </article>
        <article>
          <small>EVENT CLUSTERS</small>
          <strong>{snapshot.alarms.length ? 1 : 0}</strong>
          <span>Cause-event grouping</span>
        </article>
      </section>
      <section className="loop1-process">
        <div className="loop1-process-line" aria-hidden="true" />
        {PROCESS_ASSETS.map((asset, index) => (
          <article key={asset.id} className={index === 0 && mismatch > 5 ? "alert" : ""}>
            <div className="loop1-asset-head">
              <Gauge />
              <div><strong>{asset.code}</strong><span>{asset.name}</span></div>
            </div>
            <dl>
              {asset.tags.map((tagId) => {
                const signal = telemetry.get(tagId);
                return (
                  <div key={tagId}>
                    <dt>{signal?.name ?? tagId}</dt>
                    <dd>{valueLabel(signal?.value, signal?.unit)}</dd>
                  </div>
                );
              })}
            </dl>
            <footer>
              <span>{index + 1}</span>
              <small>{snapshot.run.state}</small>
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
}: {
  snapshot: Loop1Snapshot;
  investigation: Loop1Investigation | null;
}) {
  if (!snapshot.alarms.length) {
    return (
      <section className="loop1-empty">
        <Activity />
        <h2>No alarms in this replay window</h2>
        <p>Run the Hero scenario or continue past tick 180.</p>
      </section>
    );
  }
  return (
    <section className="loop1-timeline">
      <header>
        <div><small>RAW ALARMS</small><strong>{snapshot.alarms.length}</strong></div>
        <span>compressed into</span>
        <div><small>EVENT CLUSTERS</small><strong>{investigation?.alarmClusters.length ?? 1}</strong></div>
      </header>
      <ol>
        {snapshot.alarms.map((alarm, index) => (
          <li key={alarm.alarmId} className={`priority-${alarm.priority}`}>
            <time>{ageLabel(alarm.occurredAt)}</time>
            <span className="loop1-timeline-dot">{index + 1}</span>
            <div>
              <small>{alarm.assetId} · {alarm.priority}</small>
              <strong>{alarm.message}</strong>
              <span>{alarm.tagId ?? "event"} · linked cause retained</span>
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
}: {
  result: Loop1Investigation | null;
  busy: boolean;
}) {
  if (!result) {
    return <section className="loop1-empty"><Search /><h2>No investigation yet</h2></section>;
  }
  return (
    <section className="loop1-investigation">
      <article className={`loop1-findings status-${result.status}`}>
        <small>{result.status.toUpperCase()}</small>
        <h2>{result.summary}</h2>
        <p>{result.safetyNotice}</p>
        {busy && <span className="loop1-working">Updating Evidence…</span>}
      </article>
      <div className="loop1-hypotheses">
        {result.hypotheses.map((hypothesis) => (
          <article key={hypothesis.hypothesisId}>
            <span className="loop1-rank">#{hypothesis.rank}</span>
            <div>
              <small>{hypothesis.status}</small>
              <h3>{hypothesis.title}</h3>
              <p>{hypothesis.reasoningSummary}</p>
              <footer>
                <span>{hypothesis.evidenceRefs.length} supporting Evidence</span>
                <span>{hypothesis.counterEvidenceRefs.length} counter Evidence</span>
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
            <small>DRAFT-ONLY ACTION</small>
            <h3>{result.actionDraft.title}</h3>
            <p>{result.actionDraft.safetyBoundary}</p>
          </div>
        </article>
      )}
    </section>
  );
}

function EvidenceWorkspace({ result }: { result: Loop1Investigation | null }) {
  if (!result) {
    return <section className="loop1-empty"><Link2 /><h2>No Evidence package yet</h2></section>;
  }
  return (
    <section className="loop1-evidence">
      <div className="loop1-evidence-list">
        <header><h2>Evidence ledger</h2><span>{result.evidence.length} records</span></header>
        {result.evidence.map((item) => (
          <article key={item.evidenceId}>
            <span className={`evidence-${item.kind}`}>{item.kind}</span>
            <div>
              <strong>{item.claim}</strong>
              <small>{item.sourceId}</small>
            </div>
            <code>{valueLabel(item.value, item.unit ?? undefined)}</code>
          </article>
        ))}
      </div>
      <div className="loop1-context-stack">
        <article>
          <header><FileCheck2 /><h3>Documents</h3></header>
          {result.documents.slice(0, 5).map((document) => (
            <div key={document.documentId}>
              <strong>{document.title}</strong>
              <small>{document.section} · score {document.score.toFixed(2)}</small>
            </div>
          ))}
        </article>
        <article>
          <header><Link2 /><h3>Similar cases</h3></header>
          {result.similarCases.slice(0, 5).map((caseItem) => (
            <div key={caseItem.caseId}>
              <strong>{caseItem.title}</strong>
              <small>{caseItem.rootCause} · score {caseItem.score}</small>
            </div>
          ))}
        </article>
        <article>
          <header><ShieldCheck /><h3>Skill trace</h3></header>
          {result.skillTrace.map((skill) => (
            <div key={skill.skillId}>
              <strong>{skill.skillId}</strong>
              <small>{skill.summary}</small>
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}
