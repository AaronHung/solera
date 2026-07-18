import type { Evidence, PageContext, ViewSpec } from "@solera/contracts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { listCanvases, saveCanvas, streamChat } from "../api/client";

interface SidecarSettings {
  apiBaseUrl: string;
  bearerToken: string;
  tenantId: string;
  timezone: string;
}

const DEFAULT_SETTINGS: SidecarSettings = {
  apiBaseUrl: "http://localhost:8000",
  bearerToken: "",
  tenantId: "tenant-demo",
  timezone: "Asia/Taipei",
};

type Tab = "chat" | "context" | "evidence" | "canvas";

async function loadSettings(): Promise<SidecarSettings> {
  const stored = await chrome.storage.local.get("soleraSettings");
  return { ...DEFAULT_SETTINGS, ...(stored.soleraSettings as Partial<SidecarSettings>) };
}

async function captureContext(settings: SidecarSettings): Promise<PageContext> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error("No active browser tab is available");
  }
  const response = (await chrome.tabs.sendMessage(tab.id, {
    type: "SOLERA_CAPTURE_CONTEXT",
    tenantId: settings.tenantId,
    tabSessionId: `tab-${tab.id}`,
    timezone: settings.timezone,
  })) as { ok: boolean; context?: PageContext; error?: string };
  if (!response.ok || !response.context) {
    throw new Error(response.error ?? "This page is not enabled for Solera");
  }
  return response.context;
}

async function openCanvas(viewSpec: ViewSpec): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error("No active browser tab is available");
  }
  const response = (await chrome.tabs.sendMessage(tab.id, {
    type: "SOLERA_MOUNT_CANVAS",
    viewSpec,
  })) as { ok: boolean; error?: string };
  if (!response.ok) {
    throw new Error(response.error ?? "Canvas could not be opened");
  }
}

function assetNeedsConfirmation(context: PageContext | null): boolean {
  return Boolean(
    context?.candidateAssets.some(
      (asset) => asset.confidence < 0.85 && !asset.confirmed,
    ),
  );
}

export function App() {
  const [tab, setTab] = useState<Tab>("chat");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [context, setContext] = useState<PageContext | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("Ready");
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [viewSpec, setViewSpec] = useState<ViewSpec | null>(null);
  const [savedCanvases, setSavedCanvases] = useState<ViewSpec[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const refreshContext = useCallback(async (nextSettings: SidecarSettings) => {
    setContextError(null);
    try {
      setContext(await captureContext(nextSettings));
    } catch (captureError) {
      setContext(null);
      setContextError(
        captureError instanceof Error ? captureError.message : "Context capture failed",
      );
    }
  }, []);

  useEffect(() => {
    void loadSettings().then((loaded) => {
      setSettings(loaded);
      void refreshContext(loaded);
    });
  }, [refreshContext]);

  const selectedAsset = context?.candidateAssets[0];
  const tags = useMemo(
    () =>
      context?.candidateAssets
        .filter((asset) => asset.assetId.startsWith("pi-tag:"))
        .map((asset) => asset.assetId.replace("pi-tag:", "")) ?? [],
    [context],
  );

  const confirmAsset = () => {
    if (!context || !selectedAsset) {
      return;
    }
    setContext({
      ...context,
      candidateAssets: context.candidateAssets.map((asset, index) =>
        index === 0 ? { ...asset, confirmed: true } : asset,
      ),
    });
  };

  const saveSettings = async () => {
    await chrome.storage.local.set({ soleraSettings: settings });
    setShowSettings(false);
    await refreshContext(settings);
  };

  const refreshCanvases = useCallback(async () => {
    if (!settings.bearerToken) {
      return;
    }
    try {
      setSavedCanvases(await listCanvases(settings));
    } catch (canvasError) {
      setError(canvasError instanceof Error ? canvasError.message : "Canvas list failed");
    }
  }, [settings]);

  const submit = async (prompt = question) => {
    const trimmed = prompt.trim();
    if (!context || !trimmed || running) {
      return;
    }
    if (!settings.bearerToken) {
      setError("Configure an authenticated Solera bearer token first.");
      setShowSettings(true);
      return;
    }
    if (assetNeedsConfirmation(context)) {
      setError("Confirm the candidate asset before running this analysis.");
      setTab("context");
      return;
    }

    setRunning(true);
    setAnswer("");
    setEvidence([]);
    setViewSpec(null);
    setError(null);
    setStatus("Understanding context");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await streamChat(
        settings,
        {
          question: trimmed,
          pageContext: context,
          tags,
          maxPoints: 1000,
        },
        (event) => {
          if (event.type === "tool-start") {
            setStatus(`Reading ${String(event.payload.tag ?? "industrial data")}`);
          } else if (event.type === "evidence") {
            const item = event.payload.evidence as unknown as Evidence;
            setEvidence((current) => [
              ...current.filter((candidate) => candidate.evidenceId !== item.evidenceId),
              item,
            ]);
          } else if (event.type === "text-delta") {
            setAnswer((current) => current + String(event.payload.text ?? ""));
            setStatus("Explaining evidence");
          } else if (event.type === "view-spec") {
            setViewSpec(event.payload.viewSpec as unknown as ViewSpec);
          } else if (event.type === "complete") {
            setStatus("Complete");
          } else if (event.type === "error") {
            setError(String(event.payload.message ?? "Analysis failed"));
            setStatus("Stopped safely");
          }
        },
        controller.signal,
      );
      setQuestion("");
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setError(requestError instanceof Error ? requestError.message : "Request failed");
      }
    } finally {
      abortRef.current = null;
      setRunning(false);
    }
  };

  return (
    <div className="sidecar-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">
          S
        </div>
        <div>
          <strong>Solera</strong>
          <span>Industrial intelligence, distilled</span>
        </div>
        <button
          className="icon-button"
          onClick={() => setShowSettings((current) => !current)}
          aria-label="Connection settings"
        >
          ⚙
        </button>
      </header>

      {showSettings && (
        <section className="settings-panel" aria-label="Connection settings">
          <label>
            API URL
            <input
              value={settings.apiBaseUrl}
              onChange={(event) =>
                setSettings({ ...settings, apiBaseUrl: event.target.value })
              }
            />
          </label>
          <label>
            Bearer token
            <input
              type="password"
              value={settings.bearerToken}
              autoComplete="off"
              onChange={(event) =>
                setSettings({ ...settings, bearerToken: event.target.value })
              }
            />
          </label>
          <label>
            Tenant
            <input
              value={settings.tenantId}
              onChange={(event) =>
                setSettings({ ...settings, tenantId: event.target.value })
              }
            />
          </label>
          <button className="primary" onClick={() => void saveSettings()}>
            Save and reconnect
          </button>
          <p>Credentials are stored only in extension-local storage for this Pilot.</p>
        </section>
      )}

      <nav className="tabs" aria-label="Sidecar sections">
        {(["chat", "context", "evidence", "canvas"] as Tab[]).map((item) => (
          <button
            key={item}
            className={tab === item ? "active" : ""}
            onClick={() => {
              setTab(item);
              if (item === "canvas") {
                void refreshCanvases();
              }
            }}
          >
            {item === "chat"
              ? "Chat"
              : item === "context"
                ? "Context"
                : item === "evidence"
                  ? `Evidence ${evidence.length}`
                  : "Canvas"}
          </button>
        ))}
      </nav>

      {tab === "chat" && (
        <main className="chat-panel">
          <section className="context-strip">
            <span className={`status-dot ${context ? "healthy" : "warning"}`} />
            <div>
              <strong>{context?.page.title ?? "No approved page context"}</strong>
              <span>
                {selectedAsset
                  ? `${selectedAsset.label} · ${Math.round(selectedAsset.confidence * 100)}%`
                  : context?.page.systemType ?? contextError}
              </span>
            </div>
            <button onClick={() => void refreshContext(settings)}>Refresh</button>
          </section>

          <section className="conversation" aria-live="polite">
            {!answer && !running && (
              <div className="welcome">
                <p className="eyebrow">READ-ONLY AGENT</p>
                <h1>What should we verify?</h1>
                <p>
                  Solera uses the current page as context and retrieves numerical
                  truth from approved industrial APIs.
                </p>
                <div className="suggestions">
                  <button onClick={() => void submit("比較 CDT158 與 CDT159")}>
                    Compare CDT158 and CDT159
                  </button>
                  <button onClick={() => void submit("顯示 SINUSOID 最近 24 小時的趨勢")}>
                    Explain SINUSOID trend
                  </button>
                </div>
              </div>
            )}
            {(running || answer) && (
              <article className="answer-card">
                <div className="answer-meta">
                  <span className={running ? "pulse" : "status-dot healthy"} />
                  {status}
                </div>
                <p>{answer || "Retrieving authoritative data…"}</p>
                {evidence.length > 0 && (
                  <div className="answer-actions">
                    <button className="evidence-link" onClick={() => setTab("evidence")}>
                      Show {evidence.length} source{evidence.length === 1 ? "" : "s"}
                    </button>
                    {viewSpec && (
                      <>
                        <button
                          className="evidence-link"
                          onClick={() =>
                            void saveCanvas(settings, viewSpec)
                              .then((saved) => {
                                setSavedCanvases((current) => [
                                  saved,
                                  ...current.filter(
                                    (item) => item.viewId !== saved.viewId,
                                  ),
                                ]);
                                setStatus("Canvas saved");
                              })
                              .catch((canvasError) =>
                                setError(
                                  canvasError instanceof Error
                                    ? canvasError.message
                                    : "Canvas save failed",
                                ),
                              )
                          }
                        >
                          Save
                        </button>
                        <button
                          className="primary"
                          onClick={() =>
                            void openCanvas(viewSpec).catch((canvasError) =>
                              setError(
                                canvasError instanceof Error
                                  ? canvasError.message
                                  : "Canvas failed",
                              ),
                            )
                          }
                        >
                          Open Canvas
                        </button>
                      </>
                    )}
                  </div>
                )}
              </article>
            )}
            {error && <div className="error-banner">{error}</div>}
          </section>

          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about the current asset or PI Tag…"
              rows={3}
            />
            {running ? (
              <button
                type="button"
                className="stop"
                onClick={() => abortRef.current?.abort()}
              >
                Stop
              </button>
            ) : (
              <button className="send" type="submit" disabled={!context || !question.trim()}>
                Send
              </button>
            )}
          </form>
        </main>
      )}

      {tab === "context" && (
        <main className="detail-panel">
          <p className="eyebrow">CONFIRM BEFORE ANALYSIS</p>
          <h2>{context?.page.title ?? "No context"}</h2>
          {context ? (
            <>
              <dl>
                <dt>System</dt>
                <dd>{context.page.systemType}</dd>
                <dt>View</dt>
                <dd>{context.page.viewType}</dd>
                <dt>Time</dt>
                <dd>
                  {new Date(context.timeContext.start).toLocaleString()} –{" "}
                  {new Date(context.timeContext.end).toLocaleString()}
                </dd>
                <dt>Adapter</dt>
                <dd>{context.page.adapterId ?? "generic"}</dd>
              </dl>
              {selectedAsset ? (
                <section className="asset-card">
                  <span>Candidate asset</span>
                  <strong>{selectedAsset.label}</strong>
                  <small>{Math.round(selectedAsset.confidence * 100)}% confidence</small>
                  {!selectedAsset.confirmed && (
                    <button className="primary" onClick={confirmAsset}>
                      Confirm asset
                    </button>
                  )}
                </section>
              ) : (
                <p>No asset was inferred. Name a supported PI Tag in Chat.</p>
              )}
            </>
          ) : (
            <div className="error-banner">{contextError}</div>
          )}
        </main>
      )}

      {tab === "evidence" && (
        <main className="detail-panel">
          <p className="eyebrow">REPRODUCIBLE SOURCES</p>
          <h2>Evidence</h2>
          {evidence.length === 0 && <p>No analysis evidence in this session.</p>}
          {evidence.map((item) => (
            <article className="source-card" key={item.evidenceId}>
              <strong>{item.tags.join(", ") || item.sourceSystem}</strong>
              <span>
                {item.retrievalMode} · {item.dataQuality.validCount}/
                {item.dataQuality.sampleCount} valid
              </span>
              <dl>
                <dt>Query</dt>
                <dd>{item.queryId}</dd>
                <dt>Period</dt>
                <dd>
                  {new Date(item.start).toLocaleString()} –{" "}
                  {new Date(item.end).toLocaleString()}
                </dd>
                <dt>Method</dt>
                <dd>{item.calculationVersion}</dd>
                <dt>Coverage</dt>
                <dd>{Math.round(item.dataQuality.coverage * 100)}%</dd>
              </dl>
            </article>
          ))}
        </main>
      )}

      {tab === "canvas" && (
        <main className="detail-panel">
          <p className="eyebrow">TENANT-SCOPED WORKSPACES</p>
          <h2>Saved Canvas</h2>
          {savedCanvases.length === 0 && (
            <p>No saved Canvas yet. Complete an analysis and choose Save.</p>
          )}
          {savedCanvases.map((item) => (
            <article className="source-card" key={item.viewId}>
              <strong>{item.title}</strong>
              <span>
                {item.widgets.length} Widgets ·{" "}
                {new Date(item.createdAt).toLocaleString()}
              </span>
              <button
                className="primary"
                onClick={() =>
                  void openCanvas(item).catch((canvasError) =>
                    setError(
                      canvasError instanceof Error
                        ? canvasError.message
                        : "Canvas failed",
                    ),
                  )
                }
              >
                Open on page
              </button>
            </article>
          ))}
        </main>
      )}
    </div>
  );
}
