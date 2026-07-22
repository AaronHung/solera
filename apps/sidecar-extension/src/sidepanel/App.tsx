import type { Evidence, PageContext, ViewSpec } from "@solera/contracts";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { listCanvases, saveCanvas, streamChat } from "../api/client";

export interface SidecarSettings {
  settingsRevision: number;
  apiBaseUrl: string;
  bearerToken: string;
  tenantId: string;
  timezone: string;
  modelName: string;
}

const LOCAL_DEMO_TOKEN = "dev:tenant-demo:demo-user:viewer";
const CURRENT_SETTINGS_REVISION = 2;

const OPENROUTER_MODELS = [
  { id: "openai/gpt-5.6-luna", label: "GPT-5.6 Luna · Default" },
  { id: "openai/gpt-5.6-terra", label: "GPT-5.6 Terra" },
  { id: "anthropic/claude-sonnet-5", label: "Claude Sonnet 5 💰" },
  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6 💰" },
  { id: "anthropic/claude-opus-4.8", label: "Claude Opus 4.8 💰💰" },
  { id: "x-ai/grok-4.5", label: "Grok 4.5 💰" },
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    label: "Nemotron 3 Ultra 🎁",
  },
] as const;
export const DEFAULT_MODEL = "openai/gpt-5.6-luna";

const DEFAULT_SETTINGS: SidecarSettings = {
  settingsRevision: CURRENT_SETTINGS_REVISION,
  apiBaseUrl: "http://localhost:8000",
  bearerToken: "",
  tenantId: "tenant-demo",
  timezone: "Asia/Taipei",
  modelName: DEFAULT_MODEL,
};

const EASY_PI_DEMO_TAGS = ["CDT158", "CDT159", "SINUSOID"];
const TAB_SESSIONS_STORAGE_KEY = "soleraTabSessions";

type Tab = "chat" | "context" | "evidence" | "canvas";
type Feedback = "positive" | "negative" | null;
type ExperienceRole =
  | "executive"
  | "shift-supervisor"
  | "operator"
  | "reliability"
  | "it-data";

const EXPERIENCE_ROLES: Array<{ id: ExperienceRole; label: string }> = [
  { id: "executive", label: "Executive" },
  { id: "shift-supervisor", label: "Shift Supervisor" },
  { id: "operator", label: "Operator" },
  { id: "reliability", label: "Reliability Engineer" },
  { id: "it-data", label: "IT / Data" },
];

interface ConversationTurn {
  id: string;
  question: string;
  answer: string;
  evidence: Evidence[];
  thoughts: string[];
  durationMs: number | null;
  createdAt: number;
  feedback: Feedback;
}

interface TabSession {
  tab: Tab;
  conversation: ConversationTurn[];
  lastSubmittedQuestion: string;
  question: string;
  answer: string;
  status: string;
  evidence: Evidence[];
  viewSpec: ViewSpec | null;
  error: string | null;
  thoughts: string[];
  durationMs: number | null;
  submittedAt: number | null;
  feedback: Feedback;
  attachments: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export function resolveSettings(
  storedSettings?: Partial<SidecarSettings>,
): SidecarSettings {
  const settings = {
    ...DEFAULT_SETTINGS,
    ...storedSettings,
  };
  const needsLunaMigration =
    (storedSettings?.settingsRevision ?? 0) < CURRENT_SETTINGS_REVISION;
  if (
    needsLunaMigration ||
    !OPENROUTER_MODELS.some((model) => model.id === settings.modelName)
  ) {
    settings.modelName = DEFAULT_MODEL;
  }
  settings.settingsRevision = CURRENT_SETTINGS_REVISION;
  if (!settings.bearerToken && settings.apiBaseUrl.startsWith("http://localhost")) {
    settings.bearerToken = LOCAL_DEMO_TOKEN;
  }
  return settings;
}

async function loadSettings(): Promise<SidecarSettings> {
  const stored = await chrome.storage.local.get("soleraSettings");
  const storedSettings = stored.soleraSettings as Partial<SidecarSettings> | undefined;
  const settings = resolveSettings(storedSettings);
  if (
    storedSettings?.settingsRevision !== settings.settingsRevision ||
    storedSettings?.modelName !== settings.modelName ||
    storedSettings?.bearerToken !== settings.bearerToken
  ) {
    await chrome.storage.local.set({ soleraSettings: settings });
  }
  return settings;
}

function tabSessionStorage() {
  return chrome.storage.session ?? chrome.storage.local;
}

async function loadTabSessions(): Promise<Map<number, TabSession>> {
  const stored = await tabSessionStorage().get(TAB_SESSIONS_STORAGE_KEY);
  const serialized = stored[TAB_SESSIONS_STORAGE_KEY] as
    | Record<string, TabSession>
    | undefined;
  return new Map(
    Object.entries(serialized ?? {}).map(([tabId, session]) => [
      Number(tabId),
      session,
    ]),
  );
}

async function saveTabSessions(sessions: Map<number, TabSession>): Promise<void> {
  const serialized = Object.fromEntries(
    [...sessions.entries()].map(([tabId, session]) => [String(tabId), session]),
  );
  await tabSessionStorage().set({ [TAB_SESSIONS_STORAGE_KEY]: serialized });
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

async function openExperience(role: ExperienceRole): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error("No active browser tab is available");
  }
  const response = (await chrome.tabs.sendMessage(tab.id, {
    type: "SOLERA_MOUNT_EXPERIENCE",
    role,
  })) as { ok: boolean; error?: string };
  if (!response.ok) {
    throw new Error(response.error ?? "Experience Demo could not be opened");
  }
}

async function openAgentPlatform(settings: SidecarSettings): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error("No active browser tab is available");
  }
  const response = (await chrome.tabs.sendMessage(tab.id, {
    type: "SOLERA_MOUNT_EXPERIENCE",
    mode: "agent-platform",
    loop1: {
      apiBaseUrl: settings.apiBaseUrl,
      bearerToken: settings.bearerToken,
    },
  })) as { ok: boolean; error?: string };
  if (!response.ok) {
    throw new Error(response.error ?? "Solera Agent Platform could not be opened");
  }
}

function assetNeedsConfirmation(context: PageContext | null): boolean {
  return Boolean(
    context?.candidateAssets.some(
      (asset) => asset.confidence < 0.85 && !asset.confirmed,
    ),
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const wholeMalformedStrong = text.match(/^\*([^*]+?)\s*\*{2}$/);
  let normalized = wholeMalformedStrong
    ? `**${wholeMalformedStrong[1]?.trim() ?? ""}**`
    : text;
  normalized = normalized
    .replace(
      /(^|[^*])\*([^*\n]+?)\*{2}(?=\s|$|[：:，,。！？；;])/g,
      "$1**$2**",
    )
    .replace(
      /(^|[^*])\*{2}([^*\n]+?)\*(?=\s|$|[：:，,。！？；;])/g,
      "$1**$2**",
    );
  const parts = normalized.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <span className="markdown-inline">
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
        }
        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </span>
  );
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  const cells = splitTableRow(line);
  return cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isTableRow(line: string): boolean {
  return line.trim().includes("|") && splitTableRow(line).length >= 2;
}

function MarkdownTable({
  headers,
  rows,
  keyPrefix,
}: {
  headers: string[];
  rows: string[][];
  keyPrefix: string;
}) {
  return (
    <div className="markdown-table-wrap" key={keyPrefix}>
      <table className="markdown-table">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={`${keyPrefix}-header-${index}`}>
                <InlineMarkdown text={header} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${keyPrefix}-row-${rowIndex}`}>
              {headers.map((_, cellIndex) => (
                <td key={`${keyPrefix}-cell-${rowIndex}-${cellIndex}`}>
                  <InlineMarkdown text={row[cellIndex] ?? ""} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarkdownText({ text, className }: { text: string; className?: string }) {
  const lines = text.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    const nextLine = lines[index + 1] ?? "";
    if (isTableRow(line) && isTableSeparator(nextLine)) {
      const headers = splitTableRow(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && isTableRow(lines[index] ?? "")) {
        rows.push(splitTableRow(lines[index] ?? ""));
        index += 1;
      }
      blocks.push(
        <MarkdownTable
          headers={headers}
          rows={rows}
          keyPrefix={`table-${index}`}
        />,
      );
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      blocks.push(<div className="markdown-spacer" key={`space-${index}`} />);
    } else {
      const listItem = trimmed.match(/^[-*•]\s*(.+)$/);
      if (listItem) {
        blocks.push(
          <div className="markdown-list-item" key={`list-${index}`}>
            <span className="markdown-bullet" aria-hidden="true">
              •
            </span>
            <InlineMarkdown text={listItem[1] ?? ""} />
          </div>,
        );
      } else {
        const heading = trimmed.match(/^#{1,3}\s+(.+)$/);
        if (heading) {
          blocks.push(
            <h3 key={`heading-${index}`}>
              <InlineMarkdown text={heading[1] ?? ""} />
            </h3>,
          );
        } else {
          blocks.push(
            <p key={`line-${index}`}>
              <InlineMarkdown text={line} />
            </p>,
          );
        }
      }
    }
    index += 1;
  }

  return <div className={className ?? "markdown-text"}>{blocks}</div>;
}

function ActivityDetails({
  thoughts,
  durationMs,
  running,
}: {
  thoughts: string[];
  durationMs: number | null;
  running?: boolean;
}) {
  if (thoughts.length === 0) {
    return null;
  }
  const duration = durationMs === null ? "working" : `${Math.max(1, Math.round(durationMs / 1000))}s`;
  return (
    <details className="activity-details">
      <summary>{running ? "Working…" : `Worked for ${duration} · Agent activity`}</summary>
      <ul>
        {thoughts.map((thought) => (
          <li key={thought}>{thought}</li>
        ))}
      </ul>
    </details>
  );
}

function formatMessageTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function MessageActions({
  text,
  timestamp,
  durationMs,
  feedback,
  onFeedback,
}: {
  text: string;
  timestamp: number | null;
  durationMs?: number | null;
  feedback?: Feedback;
  onFeedback?: (value: Exclude<Feedback, null>) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="message-actions">
      <button type="button" title="Copy" aria-label="Copy message" onClick={() => void copyText()}>
        {copied ? "✓" : "⧉"}
      </button>
      {onFeedback && (
        <>
          <button
            type="button"
            className={feedback === "positive" ? "selected" : ""}
            title="Good response"
            aria-label="Good response"
            onClick={() => onFeedback("positive")}
          >
            👍
          </button>
          <button
            type="button"
            className={feedback === "negative" ? "selected" : ""}
            title="Bad response"
            aria-label="Bad response"
            onClick={() => onFeedback("negative")}
          >
            👎
          </button>
        </>
      )}
      {timestamp !== null && <time>{formatMessageTime(timestamp)}</time>}
      {durationMs !== undefined && durationMs !== null && (
        <span>{Math.max(1, Math.round(durationMs / 1000))}s</span>
      )}
    </div>
  );
}

export function App() {
  const [tab, setTab] = useState<Tab>("chat");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [context, setContext] = useState<PageContext | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [lastSubmittedQuestion, setLastSubmittedQuestion] = useState("");
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [answer, setAnswer] = useState("");
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [status, setStatus] = useState("Ready");
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [viewSpec, setViewSpec] = useState<ViewSpec | null>(null);
  const [savedCanvases, setSavedCanvases] = useState<ViewSpec[]>([]);
  const [experienceRole, setExperienceRole] =
    useState<ExperienceRole>("executive");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const composerTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const tabSessionsRef = useRef(new Map<number, TabSession>());
  const activeTabIdRef = useRef<number | null>(null);
  const sessionsLoadedRef = useRef(false);
  const sessionStateRef = useRef<TabSession>({
    tab: "chat",
    conversation: [],
    lastSubmittedQuestion: "",
    submittedAt: null,
    question: "",
    answer: "",
    status: "Ready",
    evidence: [],
    viewSpec: null,
    error: null,
    thoughts: [],
    durationMs: null,
    feedback: null,
    attachments: [],
  });
  sessionStateRef.current = {
    tab,
    conversation,
    lastSubmittedQuestion,
    submittedAt,
    question,
    answer,
    status,
    evidence,
    viewSpec,
    error,
    thoughts,
    durationMs,
    feedback,
    attachments,
  };

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

  const reloadHostPage = useCallback(async () => {
    const [activeBrowserTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!activeBrowserTab?.id) {
      setContextError("No active browser tab is available");
      return;
    }
    await chrome.tabs.reload(activeBrowserTab.id);
  }, []);

  const resetAnalysis = () => {
    setTab("chat");
    setConversation([]);
    setLastSubmittedQuestion("");
    setSubmittedAt(null);
    setQuestion("");
    setAnswer("");
    setThoughts([]);
    setDurationMs(null);
    setEvidence([]);
    setViewSpec(null);
    setError(null);
    setStatus("Ready");
    setFeedback(null);
    setAttachments([]);
  };

  const refreshActiveTab = useCallback(async (reset = false) => {
    if (!sessionsLoadedRef.current) {
      return;
    }
    const [activeBrowserTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const nextTabId = activeBrowserTab?.id;
    if (nextTabId === undefined) {
      return;
    }
    const previousTabId = activeTabIdRef.current;
    if (previousTabId !== null && previousTabId !== nextTabId) {
      tabSessionsRef.current.set(previousTabId, sessionStateRef.current);
      void saveTabSessions(tabSessionsRef.current);
      abortRef.current?.abort();
      setRunning(false);
    }
    activeTabIdRef.current = nextTabId;

    if (reset) {
      tabSessionsRef.current.delete(nextTabId);
      void saveTabSessions(tabSessionsRef.current);
    }
    const savedSession = reset ? undefined : tabSessionsRef.current.get(nextTabId);
    if (savedSession) {
      setTab(savedSession.tab);
      setConversation(savedSession.conversation);
      setLastSubmittedQuestion(savedSession.lastSubmittedQuestion);
      setSubmittedAt(savedSession.submittedAt);
      setQuestion(savedSession.question);
      setAnswer(savedSession.answer);
      setEvidence(savedSession.evidence);
      setViewSpec(savedSession.viewSpec);
      setError(savedSession.error);
      setStatus(savedSession.status);
      setThoughts(savedSession.thoughts);
      setDurationMs(savedSession.durationMs);
      setFeedback(savedSession.feedback);
      setAttachments(savedSession.attachments ?? []);
    } else {
      resetAnalysis();
    }

    const loaded = await loadSettings();
    setSettings(loaded);
    await refreshContext(loaded);
  }, [refreshContext]);

  useEffect(() => {
    void loadTabSessions().then((sessions) => {
      tabSessionsRef.current = sessions;
      sessionsLoadedRef.current = true;
      void refreshActiveTab();
    });
    const onActivated = () => {
      void refreshActiveTab();
    };
    const onUpdated = (
      _tabId: number,
      changeInfo: { status?: string; url?: string },
      tabInfo: chrome.tabs.Tab,
    ) => {
      if (tabInfo.active && changeInfo.status === "complete") {
        void refreshActiveTab(Boolean(changeInfo.url));
      }
    };
    chrome.tabs.onActivated.addListener(onActivated);
    chrome.tabs.onUpdated.addListener(onUpdated);
    return () => {
      chrome.tabs.onActivated.removeListener(onActivated);
      chrome.tabs.onUpdated.removeListener(onUpdated);
    };
  }, [refreshActiveTab]);

  useEffect(() => {
    const activeTabId = activeTabIdRef.current;
    if (!sessionsLoadedRef.current || activeTabId === null || running) {
      return;
    }
    tabSessionsRef.current.set(activeTabId, sessionStateRef.current);
    void saveTabSessions(tabSessionsRef.current);
  }, [
    answer,
    conversation,
    durationMs,
    error,
    evidence,
    feedback,
    attachments,
    lastSubmittedQuestion,
    running,
    status,
    submittedAt,
    thoughts,
    viewSpec,
  ]);

  useEffect(() => {
    const textarea = composerTextareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [question]);

  const selectedAsset = context?.candidateAssets[0];
  const tags = useMemo(
    () =>
      context?.candidateAssets
        .filter((asset) => asset.assetId.startsWith("pi-tag:"))
        .map((asset) => asset.assetId.replace("pi-tag:", "")) ?? [],
    [context],
  );
  const promptTags = useMemo(() => {
    if (tags.length > 0) {
      return tags;
    }
    return context?.page.systemType === "easy-pi" ? EASY_PI_DEMO_TAGS : [];
  }, [context, tags]);
  const isPiVision = context?.page.systemType === "pi-vision";
  const quickQuestions = useMemo(() => {
    if (promptTags.length >= 2) {
      return [
        {
          label: `Compare ${promptTags[0]} and ${promptTags[1]}`,
          question: `比較 ${promptTags[0]} 與 ${promptTags[1]}`,
        },
        {
          label: `Explain ${promptTags[0]} trend`,
          question: `顯示 ${promptTags[0]} 最近 24 小時的趨勢`,
        },
      ];
    }
    if (promptTags.length === 1) {
      return [
        {
          label: `Explain ${promptTags[0]} trend`,
          question: `顯示 ${promptTags[0]} 最近 24 小時的趨勢`,
        },
        {
          label: `Show current ${promptTags[0]} value`,
          question: `顯示 ${promptTags[0]} 目前數值`,
        },
      ];
    }
    if (context) {
      return [
        {
          label: isPiVision ? "Explain this PI Vision screen" : "Explain this page",
          question: isPiVision ? "這個畫面在做什麼？" : "這個頁面在做什麼？",
        },
      ];
    }
    return [];
  }, [context, isPiVision, promptTags]);

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
    setError(null);
    setStatus("Ready");
    setTab("chat");
  };

  const saveSettings = async () => {
    const nextSettings =
      !settings.bearerToken && settings.apiBaseUrl.startsWith("http://localhost")
        ? { ...settings, bearerToken: LOCAL_DEMO_TOKEN }
        : settings;
    setSettings(nextSettings);
    await chrome.storage.local.set({ soleraSettings: nextSettings });
    setShowSettings(false);
    await refreshContext(nextSettings);
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

  const addThought = (thought: string) => {
    setThoughts((current) => (current.includes(thought) ? current : [...current, thought]));
  };

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
    if (assetNeedsConfirmation(context) && tags.length > 0) {
      setError("Confirm the candidate asset before running this analysis.");
      setTab("context");
      return;
    }

    setRunning(true);
    if (lastSubmittedQuestion && (answer || evidence.length > 0)) {
      setConversation((current) => [
        ...current,
        {
          id: `turn-${Date.now()}`,
          question: lastSubmittedQuestion,
          answer,
          evidence,
          thoughts,
          durationMs,
          createdAt: submittedAt ?? Date.now(),
          feedback,
        },
      ]);
    }
    setLastSubmittedQuestion(trimmed);
    setSubmittedAt(Date.now());
    setQuestion(trimmed);
    setAnswer("");
    setEvidence([]);
    setViewSpec(null);
    setError(null);
    setStatus("Understanding context");
    setThoughts(["讀取目前頁面 context", "判斷問題需要頁面理解或資料查詢"]);
    setDurationMs(null);
    setFeedback(null);
    setQuestion("");
    startedAtRef.current = Date.now();
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
          model: settings.modelName,
        },
        (event) => {
          if (event.type === "tool-start") {
            const tag = String(event.payload.tag ?? "industrial data");
            setStatus(`Reading ${tag}`);
            addThought(`查詢 authoritative data：${tag}`);
          } else if (event.type === "evidence") {
            const item = event.payload.evidence as unknown as Evidence;
            setEvidence((current) => [
              ...current.filter((candidate) => candidate.evidenceId !== item.evidenceId),
              item,
            ]);
            addThought("已取得 Evidence 與資料品質資訊");
          } else if (event.type === "text-delta") {
            setAnswer((current) => current + String(event.payload.text ?? ""));
            setStatus("Explaining page and evidence");
            addThought("整理頁面事實、計算與推論限制");
          } else if (event.type === "view-spec") {
            setViewSpec(event.payload.viewSpec as unknown as ViewSpec);
            addThought("準備可驗證的 Canvas ViewSpec");
          } else if (event.type === "complete") {
            setStatus("Complete");
            addThought("完成回答");
            setDurationMs(
              startedAtRef.current ? Date.now() - startedAtRef.current : null,
            );
          } else if (event.type === "error") {
            setError(String(event.payload.message ?? "Analysis failed"));
            setStatus("Stopped safely");
            addThought("安全停止：請檢查錯誤訊息");
          }
        },
        controller.signal,
      );
    } catch (requestError) {
      if (!controller.signal.aborted) {
        setError(requestError instanceof Error ? requestError.message : "Request failed");
      }
    } finally {
      if (startedAtRef.current && durationMs === null) {
        setDurationMs(Date.now() - startedAtRef.current);
      }
      startedAtRef.current = null;
      abortRef.current = null;
      setRunning(false);
    }
  };

  return (
    <div className="sidecar-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">
          <img src="icons/solera.svg" alt="" />
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
              placeholder="dev:tenant-demo:demo-user:viewer"
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
          <p>
            Local demo token: <code>dev:tenant-demo:demo-user:viewer</code>.
            Credentials are stored only in extension-local storage for this Pilot.
          </p>
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
            {contextError?.includes("Receiving end does not exist") ? (
              <button onClick={() => void reloadHostPage()}>Reload page</button>
            ) : (
              <button onClick={() => void refreshContext(settings)}>Refresh</button>
            )}
          </section>

          <section className="conversation" aria-live="polite">
            {conversation.map((turn) => (
              <article className="history-card" key={turn.id}>
                <div className="question-label">You</div>
                <p className="question-text">{turn.question}</p>
                <MessageActions text={turn.question} timestamp={turn.createdAt} />
                <div className="answer-meta">
                  <span className="status-dot healthy" />
                  Complete
                </div>
                <ActivityDetails
                  thoughts={turn.thoughts}
                  durationMs={turn.durationMs}
                />
                <MarkdownText text={turn.answer} className="history-answer" />
                <MessageActions
                  text={turn.answer}
                  timestamp={turn.createdAt}
                  durationMs={turn.durationMs}
                  feedback={turn.feedback}
                  onFeedback={(value) =>
                    setConversation((current) =>
                      current.map((item) =>
                        item.id === turn.id ? { ...item, feedback: value } : item,
                      ),
                    )
                  }
                />
                {turn.evidence.length > 0 && (
                  <span className="history-source-count">
                    {turn.evidence.length} source{turn.evidence.length === 1 ? "" : "s"}
                  </span>
                )}
              </article>
            ))}
            {!answer && !running && !lastSubmittedQuestion && conversation.length === 0 && (
              <div className="welcome">
                <p className="eyebrow">READ-ONLY AGENT</p>
                <h1>What should we verify?</h1>
                <p>
                  {isPiVision
                    ? "Solera detected this PI Vision display as context. Display context comes from PI Vision; numerical truth comes from approved PI Tags."
                    : "Solera uses the current page as context and retrieves numerical truth from approved industrial APIs."}
                </p>
                {quickQuestions.length > 0 ? (
                  <div className="suggestions">
                    {quickQuestions.map((item) => (
                      <button key={item.question} onClick={() => setQuestion(item.question)}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="context-hint">
                    {contextError
                      ? `${contextError} Use Reload page above to inject Solera into this tab.`
                      : isPiVision
                      ? "No approved PI Tag was detected. Page questions can run from visible context; confirm the candidate asset only for asset-scoped connector analysis."
                      : "Name an approved PI Tag in your question to begin an analysis."}
                  </div>
                )}
              </div>
            )}
            {(running || answer || lastSubmittedQuestion) && (
              <article className="answer-card">
                <div className="question-label">You</div>
                <p className="question-text">{lastSubmittedQuestion}</p>
                <MessageActions text={lastSubmittedQuestion} timestamp={submittedAt} />
                <div className="answer-meta">
                  <span className={running ? "pulse" : "status-dot healthy"} />
                  {status}
                </div>
                <ActivityDetails
                  thoughts={thoughts}
                  durationMs={durationMs}
                  running={running}
                />
                {answer ? (
                  <MarkdownText text={answer} className="answer-markdown" />
                ) : (
                  <p>Retrieving authoritative data…</p>
                )}
                {answer && (
                  <MessageActions
                    text={answer}
                    timestamp={submittedAt}
                    durationMs={durationMs}
                    feedback={feedback}
                    onFeedback={(value) => setFeedback(value)}
                  />
                )}
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
            <input
              ref={attachmentInputRef}
              className="attachment-input"
              type="file"
              multiple
              accept=".csv,.json,.txt,.md,.pdf,.png,.jpg,.jpeg"
              onChange={(event) => {
                const selected = Array.from(event.target.files ?? []).map((file) => ({
                  id: `${file.name}-${file.size}-${file.lastModified}`,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                }));
                setAttachments((current) => [
                  ...current,
                  ...selected.filter(
                    (file) => !current.some((item) => item.id === file.id),
                  ),
                ]);
                event.currentTarget.value = "";
              }}
            />
            {attachments.length > 0 && (
              <div className="attachment-list" aria-label="Selected attachments">
                {attachments.map((file) => (
                  <span className="attachment-chip" key={file.id}>
                    {file.name}
                    <button
                      type="button"
                      title={`Remove ${file.name}`}
                      aria-label={`Remove ${file.name}`}
                      onClick={() =>
                        setAttachments((current) =>
                          current.filter((item) => item.id !== file.id),
                        )
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
                <span className="attachment-note">metadata only · not uploaded</span>
              </div>
            )}
            <textarea
              ref={composerTextareaRef}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault();
                  void submit();
                }
              }}
              placeholder={
                promptTags.length > 0
                  ? `Ask about ${promptTags.join(", ")}…`
                  : isPiVision
                    ? "Ask what this PI Vision screen shows…"
                    : "Ask what this page shows…"
              }
              rows={1}
            />
            <div className="composer-toolbar">
              <select
                className="model-select"
                aria-label="Select model"
                title={
                  OPENROUTER_MODELS.find((model) => model.id === settings.modelName)?.label ??
                  settings.modelName
                }
                value={settings.modelName}
                onChange={(event) => {
                  const nextSettings = {
                    ...settings,
                    modelName: event.target.value,
                  };
                  setSettings(nextSettings);
                  void chrome.storage.local.set({ soleraSettings: nextSettings });
                }}
              >
                {OPENROUTER_MODELS.map((model) => (
                  <option value={model.id} key={model.id}>
                    {model.label}
                  </option>
                ))}
              </select>
              <span className="composer-spacer" />
              <button
                type="button"
                className="attach-button"
                title="Attach files (local selection only)"
                aria-label="Attach files"
                onClick={() => attachmentInputRef.current?.click()}
              >
                <span aria-hidden="true">📎</span>
              </button>
              {running ? (
                <button
                  type="button"
                  className="stop"
                  title="Stop"
                  aria-label="Stop"
                  onClick={() => abortRef.current?.abort()}
                >
                  ■
                </button>
              ) : (
                <button
                  className="send"
                  type="submit"
                  title="Send"
                  aria-label="Send"
                  disabled={!context || !question.trim()}
                >
                  ↑
                </button>
              )}
            </div>
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
          <p className="eyebrow">SOLERA EXPERIENCE LAB</p>
          <h2>Solera Agent Platform</h2>
          <article className="experience-launcher">
            <div className="experience-preview" aria-hidden="true">
              <i />
              <i />
              <i />
              <strong>A4</strong>
            </div>
            <p>
              從 Agent Gallery 進入 LOOP-1 Live Experience，或探索 LOOP-2
              後燃風險、LOOP-3 觸媒活性與 LOOP-4 水質 Soft Sensor concepts。
            </p>
            <button
              className="experience-open"
              onClick={() =>
                void openAgentPlatform(settings).catch((platformError) =>
                  setError(
                    platformError instanceof Error
                      ? platformError.message
                      : "Solera Agent Platform 啟動失敗",
                  ),
                )
              }
            >
              Open Agent Gallery
              <span>↗</span>
            </button>
            <small>
              LOOP-1 Live · LOOP-2–4 Concept · 按 Esc 關閉
            </small>
          </article>

          <p className="eyebrow saved-canvas-eyebrow">PORTFOLIO CONCEPT</p>
          <h2>Experience Demo</h2>
          <article className="experience-launcher">
            <div className="experience-preview" aria-hidden="true">
              <i />
              <i />
              <i />
              <strong>S</strong>
            </div>
            <p>
              Explore role-specific industrial dashboards, trusted visualization
              components and a concept workspace builder.
            </p>
            <label>
              Start as
              <select
                value={experienceRole}
                onChange={(event) =>
                  setExperienceRole(event.target.value as ExperienceRole)
                }
              >
                {EXPERIENCE_ROLES.map((role) => (
                  <option value={role.id} key={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="experience-open"
              onClick={() =>
                void openExperience(experienceRole).catch(
                  (experienceError) =>
                    setError(
                      experienceError instanceof Error
                        ? experienceError.message
                        : "Experience Demo failed",
                    ),
                )
              }
            >
              Open full-screen Experience
              <span>↗</span>
            </button>
            <small>
              SIMULATED DATA · 1s telemetry · 5s trends · Press Esc to close
            </small>
          </article>

          <p className="eyebrow saved-canvas-eyebrow">
            TENANT-SCOPED WORKSPACES
          </p>
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
