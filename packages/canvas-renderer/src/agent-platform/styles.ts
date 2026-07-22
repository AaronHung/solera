export const agentPlatformStyles = `
:host { all: initial; color-scheme: dark; }
*, *::before, *::after { box-sizing: border-box; }
button { color: inherit; font: inherit; }
.agent-platform-shell,
.agent-concept-shell {
  --ap-bg: #070a0c;
  --ap-panel: #0e1417;
  --ap-raised: #131c20;
  --ap-border: rgba(192, 215, 214, .14);
  --ap-text: #f2f6f4;
  --ap-muted: #91a2a4;
  --ap-dim: #5f7074;
  --ap-accent: #66d8d3;
  --ap-accent-rgb: 102, 216, 211;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: var(--ap-text);
  background:
    radial-gradient(circle at 12% -16%, rgba(var(--ap-accent-rgb), .1), transparent 32%),
    radial-gradient(circle at 92% 8%, rgba(237, 169, 79, .07), transparent 28%),
    var(--ap-bg);
  font: 400 16px/1.5 Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.agent-platform-shell { display: grid; grid-template-rows: 64px minmax(0, 1fr); }
.accent-cyan { --ap-accent: #66d8d3; --ap-accent-rgb: 102, 216, 211; }
.accent-amber { --ap-accent: #eda94f; --ap-accent-rgb: 237, 169, 79; }
.accent-violet { --ap-accent: #a99af2; --ap-accent-rgb: 169, 154, 242; }
.accent-green { --ap-accent: #70d7a2; --ap-accent-rgb: 112, 215, 162; }
.accent-steel { --ap-accent: #72bfe8; --ap-accent-rgb: 114, 191, 232; }

.agent-platform-topbar,
.concept-topbar {
  min-width: 0;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--ap-border);
  background: rgba(7, 10, 12, .94);
  backdrop-filter: blur(20px);
  z-index: 10;
}
.agent-platform-topbar { padding: 0 22px; }
.agent-platform-brand,
.concept-brand,
.concept-trace-panel header > div,
.concept-evidence header > div {
  display: flex;
  align-items: center;
}
.agent-platform-brand { gap: 12px; min-width: 270px; }
.agent-platform-brand > span {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(var(--ap-accent-rgb), .35);
  border-radius: 13px;
  color: var(--ap-accent);
  background: rgba(var(--ap-accent-rgb), .08);
}
.agent-platform-brand svg { width: 21px; }
.agent-platform-brand > div,
.concept-brand > div { display: grid; }
.agent-platform-brand strong { font-size: 19px; letter-spacing: .01em; }
.agent-platform-brand small,
.concept-brand small { color: var(--ap-muted); font-size: 13px; }
.agent-platform-boundary,
.concept-boundary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  padding: 7px 12px;
  border: 1px solid rgba(var(--ap-accent-rgb), .23);
  border-radius: 999px;
  color: #b7d9d7;
  background: rgba(var(--ap-accent-rgb), .06);
  font-size: 13px;
  font-weight: 750;
  letter-spacing: .1em;
}
.agent-platform-boundary svg,
.concept-boundary svg { width: 15px; }
.agent-platform-close,
.concept-close {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid var(--ap-border);
  border-radius: 10px;
  background: rgba(255, 255, 255, .025);
  cursor: pointer;
}
.agent-platform-close svg,
.concept-close svg { width: 18px; }
.agent-platform-close:hover,
.concept-close:hover { color: var(--ap-accent); border-color: rgba(var(--ap-accent-rgb), .35); }

.agent-gallery-main {
  min-height: 0;
  overflow: auto;
  padding: 18px clamp(24px, 4vw, 64px) 24px;
}
.agent-gallery-hero {
  max-width: 1500px;
  margin: 0 auto 14px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 32px;
  align-items: end;
}
.agent-gallery-hero > div > span,
.agent-card-copy > span,
.agent-card-outcome small,
.agent-gallery-footer span,
.concept-hero > div > span,
.concept-chart-panel small,
.concept-trace-panel small,
.concept-verdict small,
.concept-factors small,
.concept-evidence small,
.concept-action small {
  color: var(--ap-accent);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.agent-gallery-hero h1 {
  max-width: 880px;
  margin: 5px 0 6px;
  font-size: clamp(30px, 3.1vw, 44px);
  line-height: 1.08;
  letter-spacing: -.035em;
}
.agent-gallery-hero p {
  max-width: 890px;
  margin: 0;
  color: var(--ap-muted);
  font-size: 17px;
}
.agent-gallery-hero aside {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 3px 12px;
  padding: 16px 18px;
  border-left: 1px solid var(--ap-border);
}
.agent-gallery-hero aside strong { color: var(--ap-accent); font-size: 20px; }
.agent-gallery-hero aside span { color: var(--ap-muted); align-self: center; font-size: 14px; }

.agent-portfolio-tabs {
  max-width: 1500px;
  margin: 0 auto 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}
.agent-portfolio-tabs button {
  min-width: 0;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 10px 13px;
  border: 1px solid var(--ap-border);
  border-radius: 12px;
  color: var(--ap-muted);
  background: rgba(14, 20, 23, .66);
  text-align: left;
  cursor: pointer;
}
.agent-portfolio-tabs button > svg { width: 19px; color: var(--ap-dim); }
.agent-portfolio-tabs button > span { min-width: 0; display: grid; }
.agent-portfolio-tabs button small { color: var(--ap-dim); font-size: 11px; font-weight: 800; letter-spacing: .09em; }
.agent-portfolio-tabs button strong { font-size: 15px; }
.agent-portfolio-tabs button em { color: var(--ap-dim); font-size: 12px; font-style: normal; font-weight: 700; }
.agent-portfolio-tabs button.is-active {
  color: var(--ap-text);
  border-color: rgba(var(--ap-accent-rgb), .34);
  background: rgba(var(--ap-accent-rgb), .065);
}
.agent-portfolio-tabs button.is-active > svg,
.agent-portfolio-tabs button.is-active small { color: var(--ap-accent); }

.agent-platform-layers {
  max-width: 1500px;
  margin: 0 auto 14px;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  border: 1px solid var(--ap-border);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(14, 20, 23, .72);
}
.agent-platform-layers article {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-right: 1px solid var(--ap-border);
}
.agent-platform-layers article:last-child { border-right: 0; }
.agent-platform-layers svg { width: 18px; color: var(--ap-accent); flex: 0 0 auto; }
.agent-platform-layers div { min-width: 0; display: grid; }
.agent-platform-layers strong { font-size: 15px; }
.agent-platform-layers small {
  overflow: hidden;
  color: var(--ap-muted);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-gallery-grid {
  max-width: 1500px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.agent-gallery-grid.portfolio-precision { grid-template-columns: minmax(430px, .88fr) minmax(0, 1.12fr); }
.agent-card {
  --ap-accent: #66d8d3;
  --ap-accent-rgb: 102, 216, 211;
  min-width: 0;
  display: grid;
  grid-template-rows: auto auto 48px auto auto;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--ap-border);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(var(--ap-accent-rgb), .065), transparent 42%),
    rgba(14, 20, 23, .9);
  transition: border-color 160ms ease, transform 160ms ease;
}
.agent-card:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--ap-accent-rgb), .38);
}
.agent-card > header,
.agent-card > footer {
  display: flex;
  align-items: center;
}
.agent-card > header { gap: 11px; }
.agent-card-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(var(--ap-accent-rgb), .3);
  border-radius: 11px;
  color: var(--ap-accent);
  background: rgba(var(--ap-accent-rgb), .08);
}
.agent-card-icon svg { width: 20px; }
.agent-card > header > div { display: grid; }
.agent-card > header small { color: var(--ap-accent); font-size: 14px; font-weight: 800; letter-spacing: .12em; }
.agent-card > header strong { font-size: 17px; }
.agent-maturity {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  padding: 5px 8px;
  border: 1px solid var(--ap-border);
  border-radius: 999px;
  color: var(--ap-muted);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: .1em;
}
.agent-maturity svg { width: 10px; }
.maturity-live { color: #83e3ae; border-color: rgba(112, 215, 162, .28); }
.agent-card-copy h2 { margin: 3px 0 4px; font-size: 24px; letter-spacing: -.02em; }
.agent-card-copy p { min-height: 46px; margin: 0; color: var(--ap-muted); font-size: 15px; }
.agent-card-spark { width: 100%; height: 48px; overflow: visible; }
.agent-card-spark polyline {
  fill: none;
  stroke: var(--ap-accent);
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
  filter: drop-shadow(0 0 7px rgba(var(--ap-accent-rgb), .28));
}
.agent-card-outcome {
  display: grid;
  gap: 4px;
  padding: 8px 11px;
  border-left: 2px solid var(--ap-accent);
  background: rgba(var(--ap-accent-rgb), .045);
}
.agent-card-outcome strong { font-size: 15px; }
.agent-card > footer { justify-content: space-between; gap: 12px; }
.agent-card > footer > span { color: var(--ap-muted); font-size: 14px; }
.agent-card button,
.concept-run,
.concept-reset,
.concept-action button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 13px;
  border: 1px solid rgba(var(--ap-accent-rgb), .36);
  border-radius: 10px;
  color: var(--ap-text);
  background: rgba(var(--ap-accent-rgb), .1);
  font-size: 15px;
  font-weight: 750;
  cursor: pointer;
}
.agent-card button:hover,
.concept-run:hover { background: rgba(var(--ap-accent-rgb), .18); }
.agent-card button svg { width: 15px; }

.precision-journey-preview {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--ap-border);
  border-radius: 18px;
  background:
    linear-gradient(145deg, rgba(114, 191, 232, .065), transparent 48%),
    rgba(14, 20, 23, .9);
}
.precision-journey-preview > header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 11px;
}
.precision-journey-preview > header > svg { width: 21px; color: #72bfe8; }
.precision-journey-preview > header > div { display: grid; }
.precision-journey-preview > header small { color: #72bfe8; font-size: 12px; font-weight: 800; letter-spacing: .1em; }
.precision-journey-preview h2 { margin: 2px 0 0; font-size: 19px; }
.precision-journey-preview ol {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.precision-journey-preview li {
  min-width: 0;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 14px;
  gap: 8px;
  align-items: center;
  padding: 9px;
  border: 1px solid var(--ap-border);
  border-radius: 10px;
  background: rgba(255, 255, 255, .018);
}
.precision-journey-preview li > span {
  width: 27px;
  height: 27px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  color: #72bfe8;
  background: rgba(114, 191, 232, .08);
  font-size: 11px;
  font-weight: 800;
}
.precision-journey-preview li > div { min-width: 0; display: grid; }
.precision-journey-preview li strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.precision-journey-preview li small { overflow: hidden; color: var(--ap-muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.precision-journey-preview li > svg { width: 13px; color: var(--ap-dim); }
.precision-journey-preview > footer {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--ap-border);
  color: var(--ap-muted);
  font-size: 12px;
}
.precision-journey-preview > footer svg { width: 15px; color: #72bfe8; }

.agent-gallery-footer {
  max-width: 1500px;
  margin: 12px auto 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  padding: 10px 16px;
  border-top: 1px solid var(--ap-border);
}
.agent-gallery-footer > div { display: grid; gap: 3px; }
.agent-gallery-footer strong { font-size: 15px; }
.agent-gallery-footer p { max-width: 610px; margin: 0; color: var(--ap-muted); font-size: 14px; text-align: right; }

.agent-concept-shell {
  display: grid;
  grid-template-rows: 72px minmax(0, 1fr);
}
.concept-topbar { padding: 0 18px; gap: 18px; }
.concept-back {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  border: 1px solid var(--ap-border);
  border-radius: 9px;
  color: var(--ap-muted);
  background: transparent;
  cursor: pointer;
}
.concept-back:hover { color: var(--ap-accent); }
.concept-back svg { width: 17px; }
.concept-brand { gap: 10px; min-width: 320px; }
.concept-brand > span {
  padding: 6px 9px;
  border: 1px solid rgba(var(--ap-accent-rgb), .35);
  border-radius: 8px;
  color: var(--ap-accent);
  background: rgba(var(--ap-accent-rgb), .08);
  font-size: 14px;
  font-weight: 850;
  letter-spacing: .1em;
}
.concept-close { margin-left: auto; }

.concept-main {
  min-height: 0;
  overflow: auto;
  padding: 24px clamp(22px, 3vw, 46px) 34px;
}
.concept-hero {
  max-width: 1540px;
  margin: 0 auto 18px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(370px, 480px);
  gap: 28px;
  align-items: end;
}
.concept-hero h1 {
  margin: 5px 0 7px;
  font-size: clamp(28px, 3vw, 44px);
  line-height: 1.1;
  letter-spacing: -.03em;
}
.concept-hero p { max-width: 870px; margin: 0; color: var(--ap-muted); font-size: 17px; }
.concept-hero aside {
  display: grid;
  gap: 11px;
  padding: 14px 16px;
  border: 1px solid var(--ap-border);
  border-radius: 14px;
  background: rgba(14, 20, 23, .82);
}
.concept-hero label { display: grid; gap: 3px; color: var(--ap-muted); font-size: 14px; letter-spacing: .08em; text-transform: uppercase; }
.concept-hero label strong { color: var(--ap-text); font-size: 16px; letter-spacing: 0; text-transform: none; }
.concept-hero aside > div { display: flex; gap: 8px; }
.concept-run { flex: 1; color: #07100f; background: var(--ap-accent); border-color: var(--ap-accent); }
.concept-run:hover { background: var(--ap-accent); filter: brightness(1.08); }
.concept-run svg,
.concept-reset svg { width: 16px; }
.concept-reset { color: var(--ap-muted); background: transparent; border-color: var(--ap-border); }
.concept-run:disabled,
.concept-reset:disabled,
.concept-action button:disabled { opacity: .45; cursor: not-allowed; }

.concept-workspace {
  max-width: 1540px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(360px, .85fr);
  gap: 16px;
  align-items: stretch;
}
.concept-chart-panel,
.concept-trace-panel,
.concept-verdict,
.concept-metrics article,
.concept-factors,
.concept-evidence,
.concept-action {
  border: 1px solid var(--ap-border);
  border-radius: 16px;
  background: rgba(14, 20, 23, .88);
}
.concept-chart-panel { min-width: 0; padding: 17px 18px 12px; }
.concept-chart-panel > header,
.concept-verdict > header,
.concept-factors > header,
.concept-evidence > header,
.concept-action {
  display: flex;
  align-items: center;
}
.concept-chart-panel > header { justify-content: space-between; gap: 16px; }
.concept-chart-panel h2,
.concept-trace-panel h2,
.concept-evidence h2,
.concept-action h2,
.concept-verdict h2 { margin: 2px 0 0; font-size: 20px; }
.concept-chart-legend { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 9px 14px; }
.concept-chart-legend span { color: var(--ap-muted); font-size: 14px; }
.concept-chart-legend span::before {
  content: "";
  width: 16px;
  height: 2px;
  display: inline-block;
  margin-right: 6px;
  vertical-align: middle;
  background: var(--ap-accent);
}
.concept-chart-legend .legend-secondary::before { background: #8da1a5; }
.concept-chart-legend .legend-limit::before {
  height: 0;
  border-top: 1px dashed #f07e82;
  background: transparent;
}
.concept-chart { position: relative; height: 222px; margin-top: 10px; padding: 13px 0 0; }
.concept-chart svg { width: 100%; height: 100%; overflow: visible; }
.concept-chart line { stroke: rgba(190, 216, 214, .08); stroke-width: 1; vector-effect: non-scaling-stroke; }
.concept-chart polyline { fill: none; stroke-width: 2.5; vector-effect: non-scaling-stroke; }
.chart-line-primary { stroke: var(--ap-accent); filter: drop-shadow(0 0 7px rgba(var(--ap-accent-rgb), .25)); }
.chart-line-secondary { stroke: #8da1a5; stroke-width: 1.5 !important; }
.chart-line-limit { stroke: #f07e82; stroke-width: 1.2 !important; stroke-dasharray: 5 5; }
.chart-max,
.chart-min { position: absolute; left: 8px; color: var(--ap-dim); font-size: 12px; }
.chart-max { top: 7px; }
.chart-min { bottom: 3px; }
.concept-chart-panel > footer { display: flex; justify-content: space-between; color: var(--ap-dim); font-size: 12px; }

.concept-trace-panel {
  min-width: 0;
  grid-row: span 2;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  padding: 17px;
}
.concept-trace-panel > header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.concept-trace-panel header > div { gap: 9px; }
.concept-trace-panel header svg { width: 19px; color: var(--ap-accent); }
.concept-trace-panel > header > span {
  padding: 5px 8px;
  border: 1px solid rgba(var(--ap-accent-rgb), .22);
  border-radius: 999px;
  color: var(--ap-accent);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: .1em;
}
.concept-trace-panel ol { margin: 13px 0; padding: 0; list-style: none; }
.concept-trace-panel li {
  display: grid;
  grid-template-columns: 29px minmax(0, 1fr);
  gap: 10px;
  padding: 8px 0;
  opacity: .28;
  transition: opacity 180ms ease, transform 180ms ease;
}
.concept-trace-panel li.visible { opacity: 1; transform: translateX(2px); }
.concept-trace-panel li > span {
  width: 25px;
  height: 25px;
  display: grid;
  place-items: center;
  border: 1px solid var(--ap-border);
  border-radius: 50%;
  color: var(--ap-muted);
  font-size: 12px;
}
.concept-trace-panel li.visible > span {
  color: var(--ap-accent);
  border-color: rgba(var(--ap-accent-rgb), .36);
  background: rgba(var(--ap-accent-rgb), .07);
}
.concept-trace-panel li svg { width: 13px; }
.concept-trace-panel li > div { display: grid; }
.concept-trace-panel li strong { font-size: 16px; }
.concept-trace-panel li p { margin: 2px 0 0; color: var(--ap-muted); font-size: 14px; }
.concept-trace-panel > footer {
  display: flex;
  align-items: center;
  gap: 7px;
  padding-top: 10px;
  border-top: 1px solid var(--ap-border);
  color: var(--ap-muted);
  font-size: 14px;
}
.concept-trace-panel > footer svg { width: 14px; color: var(--ap-accent); }

.concept-results {
  min-width: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.concept-verdict { padding: 15px 16px; }
.concept-verdict > header { gap: 10px; }
.concept-verdict > header > span {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: var(--ap-dim);
  background: rgba(255, 255, 255, .04);
}
.concept-verdict.is-complete > header > span,
.concept-results.is-complete .concept-verdict > header > span { color: var(--ap-accent); background: rgba(var(--ap-accent-rgb), .1); }
.concept-verdict svg { width: 17px; }
.concept-verdict > header > strong { margin-left: auto; display: grid; color: var(--ap-accent); font-size: 26px; text-align: right; }
.concept-verdict > header > strong small { color: var(--ap-muted); font-size: 12px; letter-spacing: .04em; }
.concept-verdict p { margin: 10px 0 0; color: var(--ap-muted); font-size: 16px; }
.concept-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.concept-metrics article { display: grid; gap: 2px; padding: 11px; }
.concept-metrics small { color: var(--ap-muted); font-size: 14px; }
.concept-metrics strong { font-size: 24px; }
.concept-metrics span { color: var(--ap-dim); font-size: 13px; }
.concept-metrics .metric-critical strong { color: #ff8588; }
.concept-metrics .metric-warning strong { color: #edb266; }
.concept-metrics .metric-positive strong { color: #78dda7; }
.concept-factors { padding: 13px 14px; }
.concept-factors > header { justify-content: space-between; margin-bottom: 8px; }
.concept-factors > header strong { font-size: 14px; }
.concept-factors > div {
  display: grid;
  grid-template-columns: minmax(120px, 1.1fr) 1.7fr 28px;
  gap: 8px;
  align-items: center;
  margin-top: 7px;
}
.concept-factors > div > span { overflow: hidden; color: var(--ap-muted); font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.concept-factors i { height: 4px; overflow: hidden; border-radius: 999px; background: rgba(255, 255, 255, .06); }
.concept-factors b { height: 100%; display: block; border-radius: inherit; background: var(--ap-accent); transition: width 500ms ease; }
.concept-factors > div > strong { color: var(--ap-muted); font-size: 13px; text-align: right; }

.concept-evidence {
  max-width: 1540px;
  margin: 16px auto 0;
  padding: 16px;
}
.concept-evidence > header { justify-content: space-between; gap: 16px; }
.concept-evidence header > div { gap: 9px; }
.concept-evidence header svg { width: 19px; color: var(--ap-accent); }
.concept-evidence > header > span { color: var(--ap-muted); font-size: 14px; }
.concept-evidence > div { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 9px; margin-top: 12px; }
.concept-evidence article { min-width: 0; padding: 11px; border: 1px solid var(--ap-border); border-radius: 10px; background: rgba(255, 255, 255, .018); }
.concept-evidence article strong { display: block; margin-top: 3px; overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.concept-evidence article p { margin: 5px 0 0; color: var(--ap-muted); font-size: 14px; }
.concept-evidence:not(.is-complete) article { opacity: .35; }

.concept-action {
  max-width: 1540px;
  margin: 12px auto 0;
  gap: 12px;
  padding: 14px 16px;
}
.concept-action > span {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: var(--ap-dim);
  background: rgba(255, 255, 255, .04);
}
.concept-action.is-complete > span { color: var(--ap-accent); background: rgba(var(--ap-accent-rgb), .09); }
.concept-action svg { width: 18px; }
.concept-action > div { min-width: 0; flex: 1; }
.concept-action p { margin: 3px 0 0; color: var(--ap-muted); font-size: 15px; }
.concept-action button { margin-left: auto; }

@media (max-width: 1180px) {
  .agent-platform-layers { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .agent-platform-layers article:nth-child(3) { border-right: 0; }
  .agent-platform-layers article:nth-child(-n+3) { border-bottom: 1px solid var(--ap-border); }
  .concept-workspace { grid-template-columns: 1fr; }
  .concept-trace-panel { grid-row: auto; }
  .concept-evidence > div { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .agent-gallery-grid.portfolio-precision { grid-template-columns: 1fr; }
}
@media (max-width: 820px) {
  .agent-platform-boundary, .concept-boundary { display: none; }
  .agent-gallery-hero, .concept-hero { grid-template-columns: 1fr; }
  .agent-gallery-grid { grid-template-columns: 1fr; }
  .agent-platform-layers { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .agent-platform-layers article { border-bottom: 1px solid var(--ap-border); }
  .agent-platform-layers article:nth-child(2n) { border-right: 0; }
  .concept-brand { min-width: 0; }
  .concept-evidence > div { grid-template-columns: 1fr; }
}
`;
