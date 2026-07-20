import { useState } from "react";

type StudioWidget =
  | "kpi"
  | "gauge"
  | "line"
  | "column"
  | "status"
  | "asset"
  | "process";

interface StudioItem {
  id: string;
  type: StudioWidget;
  title: string;
}

const PALETTE: Array<{
  type: StudioWidget;
  title: string;
  category: string;
  glyph: string;
}> = [
  { type: "kpi", title: "KPI Card", category: "Performance", glyph: "42" },
  { type: "gauge", title: "Gauge", category: "Performance", glyph: "◔" },
  { type: "line", title: "Line Chart", category: "Visualization", glyph: "⌁" },
  { type: "column", title: "Column Chart", category: "Visualization", glyph: "▥" },
  { type: "status", title: "Equipment Status", category: "Asset", glyph: "●" },
  { type: "asset", title: "Asset Card", category: "Asset", glyph: "◇" },
  { type: "process", title: "Process Flow", category: "Spatial", glyph: "⌘" },
];

const TEMPLATE_ITEMS: StudioItem[] = [
  { id: "template-kpi", type: "kpi", title: "Portfolio output" },
  { id: "template-line", type: "line", title: "Production trend" },
  { id: "template-status", type: "status", title: "Active alerts" },
  { id: "template-process", type: "process", title: "Energy flow" },
];

function WidgetPreview({ item }: { item: StudioItem }) {
  if (item.type === "kpi") {
    return <div className="studio-kpi"><strong>842.6</strong><span>MW</span><small>+2.4% vs plan</small></div>;
  }
  if (item.type === "gauge") {
    return <div className="studio-gauge"><i /><strong>94%</strong></div>;
  }
  if (item.type === "line" || item.type === "column") {
    return (
      <div className={`studio-mini-chart studio-mini-${item.type}`}>
        {Array.from({ length: 12 }, (_, index) => (
          <i key={index} style={{ height: `${26 + ((index * 19) % 62)}%` }} />
        ))}
      </div>
    );
  }
  if (item.type === "status") {
    return (
      <div className="studio-status-list">
        <span><i className="healthy" />Normal operations</span>
        <span><i className="warning" />2 items need attention</span>
      </div>
    );
  }
  if (item.type === "asset") {
    return <div className="studio-asset-preview"><i /><b>Solar Block 3</b><span>78% health</span></div>;
  }
  return (
    <div className="studio-process-preview">
      <i /><span /><b /><em />
    </div>
  );
}

export function CreateStudio() {
  const [items, setItems] = useState<StudioItem[]>(TEMPLATE_ITEMS);
  const [selectedId, setSelectedId] = useState<string | null>(TEMPLATE_ITEMS[0]?.id ?? null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  const addWidget = (type: StudioWidget, title: string) => {
    const item = {
      id: `${type}-${Date.now()}`,
      type,
      title,
    };
    setItems((current) => [...current, item]);
    setSelectedId(item.id);
    setNotice(`${title} added to the demo canvas`);
  };

  const selected = items.find((item) => item.id === selectedId) ?? null;

  return (
    <section className="exp-create-studio">
      <header className="exp-create-header">
        <div>
          <span>EXPERIENCE BUILDER · CONCEPT PREVIEW</span>
          <h2>Compose a role-specific workspace</h2>
          <p>Drag a trusted visualization into the grid or start from a template.</p>
        </div>
        <div className="exp-create-actions">
          <label>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(event) => setShowGrid(event.target.checked)}
            />
            Show grid
          </label>
          <button
            type="button"
            onClick={() => setNotice("Preview ready — this is a simulated workflow")}
          >
            Preview
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => setNotice("Demo workspace saved locally for this session")}
          >
            Save demo
          </button>
        </div>
      </header>

      {notice && (
        <button type="button" className="exp-studio-notice" onClick={() => setNotice(null)}>
          {notice}<span>Dismiss</span>
        </button>
      )}

      <div className="exp-studio-layout">
        <aside className="exp-widget-palette">
          <header><span>TRUSTED COMPONENTS</span><b>{PALETTE.length}</b></header>
          {PALETTE.map((widget) => (
            <button
              type="button"
              aria-label={`Add ${widget.title}`}
              draggable
              key={widget.type}
              onDragStart={(event) => {
                event.dataTransfer.setData("application/x-solera-widget", widget.type);
                event.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => addWidget(widget.type, widget.title)}
            >
              <i>{widget.glyph}</i>
              <span><strong>{widget.title}</strong><small>{widget.category}</small></span>
              <b>+</b>
            </button>
          ))}
        </aside>

        <main
          className={`exp-studio-canvas ${showGrid ? "show-grid" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData(
              "application/x-solera-widget",
            ) as StudioWidget;
            const paletteItem = PALETTE.find((item) => item.type === type);
            if (paletteItem) {
              addWidget(type, paletteItem.title);
            }
          }}
        >
          <div className="exp-studio-grid">
            {items.map((item) => (
              <button
                type="button"
                className={`exp-studio-widget exp-studio-widget-${item.type} ${
                  selectedId === item.id ? "selected" : ""
                }`}
                key={item.id}
                onClick={() => setSelectedId(item.id)}
              >
                <header><span>{item.type}</span><b>⋮</b></header>
                <h3>{item.title}</h3>
                <WidgetPreview item={item} />
              </button>
            ))}
            <div className="exp-studio-drop-hint">Drop component here</div>
          </div>
        </main>

        <aside className="exp-properties-panel">
          <header><span>PROPERTIES</span><b>×</b></header>
          {selected ? (
            <>
              <label>Title<input value={selected.title} readOnly /></label>
              <label>Component<input value={selected.type} readOnly /></label>
              <label>Data source<select defaultValue="mock"><option value="mock">Solera Demo Simulator</option></select></label>
              <label>Refresh<select defaultValue="5"><option value="5">Every 5 seconds</option></select></label>
              <div className="exp-property-preview"><WidgetPreview item={selected} /></div>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  setItems((current) => current.filter((item) => item.id !== selected.id));
                  setSelectedId(null);
                }}
              >
                Remove component
              </button>
            </>
          ) : (
            <p>Select a component to configure it.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
