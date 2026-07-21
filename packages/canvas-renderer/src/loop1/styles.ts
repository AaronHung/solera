export const loop1Styles = `
:host { all: initial; color-scheme: dark; }
*, *::before, *::after { box-sizing: border-box; }
button { color: inherit; font: inherit; }
.loop1-shell {
  --bg: #070b0d;
  --panel: #0e1518;
  --raised: #131d21;
  --border: rgba(188, 216, 216, .13);
  --muted: #91a2a6;
  --dim: #617277;
  --text: #f0f5f3;
  --amber: #eda94f;
  --cyan: #62d6d2;
  --green: #6bd6a0;
  --red: #ff7278;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template: 68px minmax(0, 1fr) / 82px minmax(0, 1fr) 238px;
  overflow: hidden;
  color: var(--text);
  background:
    radial-gradient(circle at 30% -20%, rgba(98, 214, 210, .09), transparent 38%),
    radial-gradient(circle at 100% 0%, rgba(237, 169, 79, .08), transparent 30%),
    var(--bg);
  font: 400 14px/1.45 Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.loop1-loading {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--muted);
}
.loop1-loading svg { width: 32px; color: var(--amber); }
.loop1-topbar {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(240px, 1fr) auto minmax(300px, 1fr);
  align-items: center;
  min-width: 0;
  padding: 0 18px;
  border-bottom: 1px solid var(--border);
  background: rgba(7, 11, 13, .92);
  backdrop-filter: blur(24px);
  z-index: 10;
}
.loop1-brand, .loop1-run-meta, .loop1-disclosure, .loop1-pulse,
.loop1-asset-head, .loop1-draft, .loop1-context-stack header {
  display: flex;
  align-items: center;
}
.loop1-brand { gap: 11px; }
.loop1-brand > div, .loop1-pulse > div { display: grid; }
.loop1-brand strong { font-size: 17px; letter-spacing: .02em; }
.loop1-brand small, .loop1-pulse small { color: var(--muted); font-size: 12px; }
.loop1-mark {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(237, 169, 79, .35);
  border-radius: 12px;
  color: var(--amber);
  background: rgba(237, 169, 79, .08);
}
.loop1-mark svg { width: 21px; }
.loop1-disclosure {
  gap: 8px;
  padding: 7px 12px;
  border: 1px solid rgba(98, 214, 210, .2);
  border-radius: 999px;
  color: #abd9d6;
  background: rgba(98, 214, 210, .06);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .1em;
}
.loop1-disclosure svg { width: 15px; }
.loop1-run-meta { justify-content: flex-end; gap: 16px; color: var(--muted); }
.loop1-run-meta button, .loop1-icon-button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--panel);
  cursor: pointer;
}
.loop1-run-meta button:hover { border-color: rgba(255,255,255,.3); }
.loop1-run-meta button svg, .loop1-icon-button svg { width: 17px; }
.loop1-state { display: inline-flex; align-items: center; gap: 6px; color: var(--cyan); text-transform: uppercase; font-size: 12px; font-weight: 700; }
.loop1-state svg { width: 12px; fill: currentColor; }
.state-alarm-flood, .state-degrading { color: var(--red); }
.state-recovery { color: var(--green); }
.loop1-nav {
  grid-row: 2;
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 18px 10px;
  border-right: 1px solid var(--border);
  background: rgba(8, 13, 15, .8);
}
.loop1-nav button {
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: 11px 4px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--dim);
  background: transparent;
  cursor: pointer;
}
.loop1-nav button:hover { color: var(--text); background: rgba(255,255,255,.03); }
.loop1-nav button.active { color: var(--amber); border-color: rgba(237,169,79,.22); background: rgba(237,169,79,.08); }
.loop1-nav svg { width: 20px; height: 20px; }
.loop1-nav span { font-size: 11px; }
.loop1-main {
  grid-row: 2;
  grid-column: 2;
  min-width: 0;
  overflow: auto;
  padding: 22px 24px 56px;
}
.loop1-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
}
.loop1-hero p, .loop1-findings > small {
  margin: 0 0 5px;
  color: var(--amber);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .13em;
}
.loop1-hero h1 { margin: 0; font-size: clamp(24px, 2.2vw, 34px); line-height: 1.1; letter-spacing: -.025em; }
.loop1-hero > div > span { display: block; max-width: 720px; margin-top: 8px; color: var(--muted); }
.loop1-pulse {
  flex: 0 0 auto;
  gap: 10px;
  min-width: 210px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--panel);
}
.loop1-pulse > svg { width: 20px; color: var(--cyan); }
.loop1-pulse > span { margin-left: auto; color: var(--muted); font-size: 12px; }
.loop1-pulse strong { color: var(--green); text-transform: uppercase; font-size: 13px; }
.loop1-error {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
  padding: 11px 13px;
  border: 1px solid rgba(255,114,120,.35);
  border-radius: 10px;
  color: #ffb3b6;
  background: rgba(255,114,120,.08);
}
.loop1-error svg { width: 18px; }
.loop1-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.loop1-kpis article {
  min-width: 0;
  padding: 15px 16px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: linear-gradient(145deg, var(--raised), var(--panel));
}
.loop1-kpis small { display: block; color: var(--muted); font-size: 11px; letter-spacing: .08em; }
.loop1-kpis strong { display: block; margin: 7px 0 4px; font-size: 26px; font-variant-numeric: tabular-nums; }
.loop1-kpis span { color: var(--muted); font-size: 12px; }
.loop1-kpis .critical { color: var(--red); }
.loop1-kpis .healthy { color: var(--green); }
.loop1-process {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(210px, 1fr));
  gap: 14px;
}
.loop1-process-line {
  position: absolute;
  z-index: 0;
  top: 50%;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(98,214,210,.45), transparent);
}
.loop1-process article {
  position: relative;
  z-index: 1;
  min-height: 210px;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: rgba(14, 21, 24, .96);
  box-shadow: 0 16px 40px rgba(0,0,0,.16);
}
.loop1-process article.alert { border-color: rgba(255,114,120,.42); box-shadow: inset 0 0 0 1px rgba(255,114,120,.08); }
.loop1-asset-head { gap: 11px; }
.loop1-asset-head > svg { width: 28px; color: var(--cyan); }
.loop1-asset-head > div { display: grid; }
.loop1-asset-head strong { font-size: 17px; }
.loop1-asset-head span { color: var(--muted); font-size: 12px; }
.loop1-process dl { display: grid; gap: 7px; margin: 18px 0 14px; }
.loop1-process dl > div { display: flex; justify-content: space-between; gap: 12px; }
.loop1-process dt { overflow: hidden; color: var(--muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.loop1-process dd { margin: 0; font-weight: 700; font-variant-numeric: tabular-nums; }
.loop1-process footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; color: var(--dim); }
.loop1-process footer > span { width: 24px; height: 24px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 50%; }
.loop1-process footer small { text-transform: uppercase; }
.loop1-action-rail {
  grid-row: 2;
  grid-column: 3;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 16px;
  border-left: 1px solid var(--border);
  background: rgba(10, 15, 17, .84);
}
.loop1-action-rail > div:first-child { display: grid; margin-bottom: 4px; }
.loop1-action-rail small { color: var(--muted); font-size: 11px; letter-spacing: .1em; }
.loop1-action-rail > button:not(.loop1-icon-button) {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 11px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--panel);
  cursor: pointer;
}
.loop1-action-rail > button:hover:not(:disabled) { border-color: rgba(255,255,255,.28); background: var(--raised); }
.loop1-action-rail button:disabled { opacity: .4; cursor: not-allowed; }
.loop1-action-rail button svg { width: 17px; }
.loop1-icon-button { color: var(--cyan); }
.loop1-speed { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin-bottom: 6px; }
.loop1-speed button { padding: 6px; border: 1px solid var(--border); border-radius: 7px; color: var(--muted); background: transparent; cursor: pointer; }
.loop1-speed button.active { color: var(--text); border-color: rgba(98,214,210,.35); background: rgba(98,214,210,.08); }
.loop1-hero-run { color: #ffc6c8; border-color: rgba(255,114,120,.3) !important; background: rgba(255,114,120,.08) !important; }
.loop1-approve { margin-top: auto; color: #ffe0ae; border-color: rgba(237,169,79,.34) !important; background: rgba(237,169,79,.1) !important; }
.loop1-action-message { color: var(--muted); font-size: 12px; }
.loop1-empty {
  min-height: 420px;
  display: grid;
  place-content: center;
  justify-items: center;
  text-align: center;
  color: var(--muted);
  border: 1px dashed var(--border);
  border-radius: 16px;
  background: rgba(255,255,255,.012);
}
.loop1-empty svg { width: 36px; height: 36px; color: var(--dim); }
.loop1-empty h2 { margin: 14px 0 3px; color: var(--text); }
.loop1-empty p { margin: 0; }
.loop1-timeline {
  border: 1px solid var(--border);
  border-radius: 15px;
  background: var(--panel);
  overflow: hidden;
}
.loop1-timeline > header { display: flex; align-items: center; justify-content: center; gap: 28px; padding: 18px; border-bottom: 1px solid var(--border); background: rgba(255,255,255,.018); }
.loop1-timeline > header div { display: grid; text-align: center; }
.loop1-timeline > header small { color: var(--muted); font-size: 11px; }
.loop1-timeline > header strong { font-size: 28px; }
.loop1-timeline > header > span { color: var(--dim); }
.loop1-timeline ol { max-width: 850px; margin: 0 auto; padding: 22px 24px 32px; list-style: none; }
.loop1-timeline li { position: relative; display: grid; grid-template-columns: 80px 28px 1fr; gap: 12px; min-height: 82px; }
.loop1-timeline li:not(:last-child)::after { content: ""; position: absolute; left: 93px; top: 28px; bottom: 0; width: 1px; background: var(--border); }
.loop1-timeline time { padding-top: 3px; color: var(--muted); font-variant-numeric: tabular-nums; }
.loop1-timeline-dot { z-index: 1; width: 25px; height: 25px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 50%; color: var(--muted); background: var(--panel); font-size: 11px; }
.priority-critical .loop1-timeline-dot { color: #fff; border-color: var(--red); background: var(--red); }
.priority-high .loop1-timeline-dot { color: var(--amber); border-color: var(--amber); }
.loop1-timeline li > div { display: grid; align-content: start; }
.loop1-timeline li small, .loop1-timeline li span { color: var(--muted); }
.loop1-timeline li strong { margin: 2px 0; font-size: 15px; }
.loop1-investigation { display: grid; grid-template-columns: minmax(300px, .8fr) minmax(480px, 1.4fr); gap: 14px; }
.loop1-findings, .loop1-hypotheses article, .loop1-draft {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--panel);
}
.loop1-findings { padding: 20px; }
.loop1-findings h2 { margin: 7px 0 13px; font-size: 21px; line-height: 1.35; }
.loop1-findings p { color: var(--muted); }
.loop1-findings.status-safe-decline { border-color: rgba(237,169,79,.35); }
.loop1-working { display: inline-block; margin-top: 12px; color: var(--cyan); }
.loop1-hypotheses { display: grid; gap: 10px; }
.loop1-hypotheses article { display: grid; grid-template-columns: 34px 1fr auto; gap: 12px; padding: 15px; }
.loop1-rank { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 9px; color: var(--amber); background: rgba(237,169,79,.09); font-weight: 800; }
.loop1-hypotheses h3 { margin: 2px 0 5px; font-size: 17px; }
.loop1-hypotheses p { margin: 0; color: var(--muted); }
.loop1-hypotheses small { color: var(--green); text-transform: uppercase; }
.loop1-hypotheses article > strong { font-size: 24px; color: var(--cyan); }
.loop1-hypotheses footer { display: flex; gap: 12px; margin-top: 8px; color: var(--dim); font-size: 11px; }
.loop1-draft { grid-column: 1 / -1; gap: 14px; padding: 16px; border-color: rgba(237,169,79,.3); }
.loop1-draft > svg { width: 26px; color: var(--amber); }
.loop1-draft h3 { margin: 2px 0; }
.loop1-draft p { margin: 0; color: var(--muted); }
.loop1-evidence { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(340px, .65fr); gap: 14px; }
.loop1-evidence-list, .loop1-context-stack > article { border: 1px solid var(--border); border-radius: 14px; background: var(--panel); }
.loop1-evidence-list { overflow: hidden; }
.loop1-evidence-list > header { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid var(--border); }
.loop1-evidence-list h2 { margin: 0; font-size: 18px; }
.loop1-evidence-list > header span { color: var(--muted); }
.loop1-evidence-list > article { display: grid; grid-template-columns: 86px 1fr minmax(80px, auto); gap: 12px; align-items: center; padding: 12px 15px; border-bottom: 1px solid rgba(188,216,216,.07); }
.loop1-evidence-list > article > span { padding: 4px 7px; border-radius: 6px; color: var(--cyan); background: rgba(98,214,210,.07); font-size: 11px; text-transform: uppercase; }
.loop1-evidence-list > article > div { display: grid; }
.loop1-evidence-list small { color: var(--muted); }
.loop1-evidence-list code { max-width: 220px; overflow: hidden; color: var(--amber); text-overflow: ellipsis; white-space: nowrap; }
.loop1-context-stack { display: grid; align-content: start; gap: 12px; }
.loop1-context-stack > article { padding: 14px; }
.loop1-context-stack header { gap: 8px; margin-bottom: 10px; }
.loop1-context-stack header svg { width: 18px; color: var(--cyan); }
.loop1-context-stack h3 { margin: 0; }
.loop1-context-stack article > div { display: grid; padding: 9px 0; border-top: 1px solid rgba(188,216,216,.07); }
.loop1-context-stack small { color: var(--muted); }
@media (max-width: 1180px) {
  .loop1-shell { grid-template-columns: 72px minmax(0, 1fr) 205px; }
  .loop1-topbar { grid-template-columns: 1fr auto; }
  .loop1-disclosure { display: none; }
  .loop1-process { grid-template-columns: repeat(2, minmax(210px, 1fr)); }
  .loop1-investigation, .loop1-evidence { grid-template-columns: 1fr; }
  .loop1-draft { grid-column: 1; }
}
`;
