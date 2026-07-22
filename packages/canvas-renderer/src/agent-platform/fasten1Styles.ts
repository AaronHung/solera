export const fasten1Styles = `
.fasten-shell {
  --f-bg: #080b0e;
  --f-panel: #0e151a;
  --f-raised: #141e25;
  --f-border: rgba(180, 211, 225, .14);
  --f-text: #f2f6f7;
  --f-muted: #98aab2;
  --f-dim: #657982;
  --f-blue: #72bfe8;
  --f-blue-rgb: 114, 191, 232;
  --f-cyan: #69d6d1;
  --f-green: #72d8a3;
  --f-amber: #f0b45e;
  --f-red: #ff7c82;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template: 72px 110px minmax(0, 1fr) / 1fr;
  overflow: hidden;
  color: var(--f-text);
  background:
    radial-gradient(circle at 18% -18%, rgba(var(--f-blue-rgb), .11), transparent 36%),
    radial-gradient(circle at 100% 12%, rgba(105, 214, 209, .06), transparent 28%),
    var(--f-bg);
  font: 400 16px/1.5 Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.fasten-shell *, .fasten-shell *::before, .fasten-shell *::after { box-sizing: border-box; }
.fasten-shell button { color: inherit; font: inherit; }
.fasten-topbar {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 18px;
  border-bottom: 1px solid var(--f-border);
  background: rgba(8, 11, 14, .94);
  backdrop-filter: blur(22px);
  z-index: 20;
}
.fasten-back,
.fasten-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--f-border);
  border-radius: 10px;
  color: var(--f-muted);
  background: rgba(255, 255, 255, .02);
  cursor: pointer;
}
.fasten-back { gap: 7px; padding: 8px 11px; font-size: 14px; }
.fasten-back svg { width: 17px; }
.fasten-close { width: 36px; height: 36px; padding: 0; }
.fasten-close svg { width: 18px; }
.fasten-back:hover, .fasten-close:hover { color: var(--f-blue); border-color: rgba(var(--f-blue-rgb), .35); }
.fasten-brand { min-width: 320px; display: flex; align-items: center; gap: 10px; }
.fasten-brand > span {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(var(--f-blue-rgb), .38);
  border-radius: 11px;
  color: var(--f-blue);
  background: rgba(var(--f-blue-rgb), .08);
  font-size: 13px;
  font-weight: 850;
  letter-spacing: .08em;
}
.fasten-brand > div { display: grid; }
.fasten-brand strong { font-size: 18px; }
.fasten-brand small { color: var(--f-muted); font-size: 14px; }
.fasten-boundary {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 auto;
  padding: 7px 11px;
  border: 1px solid rgba(var(--f-blue-rgb), .24);
  border-radius: 999px;
  color: #abd6ea;
  background: rgba(var(--f-blue-rgb), .055);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .08em;
}
.fasten-boundary svg { width: 15px; }
.fasten-progress { display: flex; align-items: center; gap: 8px; }
.fasten-progress > span { width: 90px; height: 5px; overflow: hidden; border-radius: 999px; background: rgba(255, 255, 255, .07); }
.fasten-progress i { height: 100%; display: block; border-radius: inherit; background: var(--f-blue); transition: width 300ms ease; }
.fasten-progress strong { min-width: 34px; color: var(--f-blue); font-size: 13px; }

.fasten-stage-rail {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0;
  padding: 12px clamp(20px, 3vw, 44px);
  border-bottom: 1px solid var(--f-border);
  background: rgba(10, 15, 18, .88);
  z-index: 12;
}
.fasten-stage-rail button {
  position: relative;
  min-width: 0;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 9px;
  align-items: center;
  padding: 9px 13px;
  border: 0;
  color: var(--f-dim);
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.fasten-stage-rail button:disabled { opacity: .34; cursor: not-allowed; }
.fasten-stage-rail button > span {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid var(--f-border);
  border-radius: 10px;
  background: rgba(255, 255, 255, .018);
}
.fasten-stage-rail button > span svg { width: 17px; }
.fasten-stage-rail button > div { min-width: 0; display: grid; }
.fasten-stage-rail button small { font-size: 12px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
.fasten-stage-rail button strong { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.fasten-stage-rail button em { overflow: hidden; color: var(--f-dim); font-size: 11px; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
.fasten-stage-rail button > i {
  position: absolute;
  top: 50%;
  right: -8px;
  width: 16px;
  height: 1px;
  background: var(--f-border);
}
.fasten-stage-rail button.is-active { color: var(--f-text); background: rgba(var(--f-blue-rgb), .055); border-radius: 12px; }
.fasten-stage-rail button.is-active > span { color: var(--f-blue); border-color: rgba(var(--f-blue-rgb), .4); background: rgba(var(--f-blue-rgb), .09); }
.fasten-stage-rail button.is-active small { color: var(--f-blue); }
.fasten-stage-rail button.is-complete { color: var(--f-muted); }
.fasten-stage-rail button.is-complete > span { color: var(--f-green); border-color: rgba(114, 216, 163, .3); }

.fasten-main { min-height: 0; overflow: auto; padding: 0 clamp(22px, 3vw, 46px) 34px; }
.fasten-context-bar {
  position: sticky;
  top: 0;
  max-width: 1580px;
  margin: 0 auto 22px;
  display: grid;
  grid-template-columns: .8fr 1fr 1.2fr 1.7fr auto;
  align-items: stretch;
  border: 1px solid var(--f-border);
  border-top: 0;
  border-radius: 0 0 13px 13px;
  overflow: hidden;
  background: rgba(8, 12, 15, .95);
  backdrop-filter: blur(20px);
  z-index: 10;
}
.fasten-context-bar > div { min-width: 0; display: grid; padding: 9px 12px; border-right: 1px solid var(--f-border); }
.fasten-context-bar small { color: var(--f-dim); font-size: 12px; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
.fasten-context-bar strong { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.fasten-context-bar > span { display: flex; align-items: center; gap: 6px; padding: 0 12px; color: var(--f-blue); font-size: 11px; font-weight: 800; letter-spacing: .08em; }
.fasten-context-bar > span svg { width: 11px; }
.fasten-stage-page { max-width: 1580px; margin: 0 auto; }
.fasten-stage-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 36px;
  align-items: end;
  margin-bottom: 20px;
}
.fasten-stage-hero > div > span,
.fasten-email-card small,
.fasten-attachment-card small,
.fasten-agent-handoff small,
.fasten-spec-panel small,
.fasten-case-grid small,
.fasten-route-panel small,
.fasten-machine-panel small,
.fasten-risk-panel small,
.fasten-signal-panel small,
.fasten-vision-panel small,
.fasten-hypotheses small,
.fasten-measurement-panel small,
.fasten-evidence-thread small,
.fasten-closeout small,
.fasten-stage-actions small,
.fasten-story-complete > small {
  color: var(--f-blue);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
}
.fasten-stage-hero h1 { margin: 5px 0 7px; font-size: clamp(30px, 3vw, 44px); line-height: 1.1; letter-spacing: -.03em; }
.fasten-stage-hero p { max-width: 980px; margin: 0; color: var(--f-muted); font-size: 17px; }
.fasten-stage-hero > aside {
  display: grid;
  gap: 3px;
  padding: 13px 16px;
  border-left: 2px solid var(--f-blue);
  background: rgba(var(--f-blue-rgb), .04);
}
.fasten-stage-hero > aside small { color: var(--f-blue); font-size: 12px; letter-spacing: .1em; }
.fasten-stage-hero > aside strong { font-size: 20px; }
.fasten-stage-hero > aside span { color: var(--f-muted); font-size: 14px; }
.fasten-stage-hero > aside.is-pass { border-color: var(--f-green); }
.fasten-stage-hero > aside.is-pass strong { color: var(--f-green); }
.fasten-stage-hero.compact h1 { font-size: clamp(28px, 2.5vw, 38px); }

.fasten-email-card,
.fasten-attachment-card,
.fasten-agent-handoff,
.fasten-drawing-board,
.fasten-spec-panel,
.fasten-search-query,
.fasten-case-grid > article,
.fasten-route-panel,
.fasten-machine-panel,
.fasten-risk-panel,
.fasten-signal-panel,
.fasten-vision-panel,
.fasten-hypotheses,
.fasten-measurement-panel,
.fasten-evidence-thread,
.fasten-closeout > article,
.fasten-stage-actions,
.fasten-story-complete {
  border: 1px solid var(--f-border);
  border-radius: 16px;
  background: rgba(14, 21, 26, .9);
}
.fasten-intake-grid { display: grid; grid-template-columns: 1.25fr .75fr; gap: 16px; }
.fasten-email-card { padding: 18px; }
.fasten-email-card > header,
.fasten-attachment-card > header,
.fasten-spec-panel > header,
.fasten-route-panel > header,
.fasten-machine-panel > header,
.fasten-risk-panel > header,
.fasten-signal-panel > header,
.fasten-vision-panel > header,
.fasten-hypotheses > header,
.fasten-measurement-panel > header,
.fasten-evidence-thread > header {
  display: flex;
  align-items: center;
}
.fasten-email-card > header { gap: 11px; }
.fasten-email-card > header > span {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(var(--f-blue-rgb), .3);
  border-radius: 11px;
  color: var(--f-blue);
  background: rgba(var(--f-blue-rgb), .08);
}
.fasten-email-card > header svg { width: 19px; }
.fasten-email-card > header > div { display: grid; }
.fasten-email-card > header strong { font-size: 17px; }
.fasten-email-card time { margin-left: auto; color: var(--f-muted); font-size: 13px; }
.fasten-email-card dl { display: grid; grid-template-columns: 80px 1fr; gap: 5px 10px; margin: 18px 0; padding: 12px 0; border-block: 1px solid var(--f-border); }
.fasten-email-card dt { color: var(--f-dim); font-size: 14px; }
.fasten-email-card dd { margin: 0; font-size: 15px; }
.fasten-email-card > p { margin: 0 0 16px; color: var(--f-muted); font-size: 16px; }
.fasten-commercial-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; }
.fasten-commercial-strip > span { display: grid; padding: 10px 11px; border: 1px solid var(--f-border); border-radius: 10px; background: rgba(255, 255, 255, .018); }
.fasten-commercial-strip strong { font-size: 15px; }
.fasten-attachment-card { display: grid; grid-template-rows: auto 1fr auto; padding: 18px; }
.fasten-attachment-card > header { gap: 9px; }
.fasten-attachment-card > header > svg { width: 20px; color: var(--f-blue); }
.fasten-attachment-card h2 { margin: 1px 0 0; font-size: 18px; }
.fasten-attachment-card > header > span { margin-left: auto; color: var(--f-green); font-size: 11px; font-weight: 800; letter-spacing: .08em; }
.fasten-attachment-card > div { display: grid; align-content: center; gap: 8px; margin: 12px 0; }
.fasten-attachment-card > div article { display: grid; grid-template-columns: 28px 1fr 22px; gap: 9px; align-items: center; padding: 10px; border: 1px solid var(--f-border); border-radius: 10px; }
.fasten-attachment-card > div article > span { width: 26px; height: 26px; display: grid; place-items: center; border-radius: 7px; color: var(--f-blue); background: rgba(var(--f-blue-rgb), .08); font-size: 12px; }
.fasten-attachment-card article > div { display: grid; min-width: 0; }
.fasten-attachment-card article strong { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.fasten-attachment-card article svg { width: 17px; color: var(--f-dim); }
.fasten-attachment-card > footer { display: flex; gap: 7px; padding-top: 10px; border-top: 1px solid var(--f-border); color: var(--f-muted); font-size: 13px; }
.fasten-attachment-card > footer svg { width: 15px; flex: 0 0 auto; color: var(--f-green); }
.fasten-agent-handoff { margin-top: 15px; display: grid; grid-template-columns: repeat(3, 1fr); overflow: hidden; }
.fasten-agent-handoff article { display: grid; grid-template-columns: 30px 1fr 18px; gap: 10px; align-items: center; padding: 14px 16px; border-right: 1px solid var(--f-border); }
.fasten-agent-handoff article:last-child { border-right: 0; }
.fasten-agent-handoff article > svg:first-child { width: 21px; color: var(--f-blue); }
.fasten-agent-handoff article > svg:last-child { width: 16px; color: var(--f-dim); }
.fasten-agent-handoff div { display: grid; }
.fasten-agent-handoff strong { font-size: 15px; }
.fasten-agent-handoff span { color: var(--f-muted); font-size: 13px; }

.fasten-drawing-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(400px, .65fr); gap: 16px; align-items: stretch; }
.fasten-drawing-board { min-width: 0; overflow: hidden; background: #0b161d; }
.fasten-drawing-board > header { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 13px 16px; border-bottom: 1px solid rgba(114, 191, 232, .16); }
.fasten-drawing-board > header > div { display: grid; }
.fasten-drawing-board > header small { color: var(--f-blue); font-size: 12px; letter-spacing: .09em; }
.fasten-drawing-board > header strong { font-size: 15px; }
.fasten-drawing-board > header > span { color: var(--f-muted); font-size: 11px; }
.fasten-drawing-board > svg { width: 100%; height: 490px; display: block; }
.drawing-grid { fill: url(#fasten-grid); }
#fasten-grid path { fill: none; stroke: rgba(114, 191, 232, .07); stroke-width: 1; }
.drawing-object { fill: none; stroke: #8bc8e7; stroke-width: 2; }
.drawing-object .center-line { stroke: rgba(139, 200, 231, .45); stroke-width: 1; stroke-dasharray: 8 5 2 5; }
.drawing-dimensions { fill: #b7d8e8; stroke: #72bfe8; stroke-width: 1; }
.drawing-dimensions text { stroke: none; fill: #b7d8e8; font-size: 13px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.drawing-notes { fill: none; stroke: rgba(139, 200, 231, .75); stroke-width: 1; }
.drawing-notes text { stroke: none; fill: #afc8d3; font-size: 11px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.drawing-callouts circle { fill: #0b161d; stroke: var(--f-amber); stroke-width: 2; }
.drawing-callouts text { fill: var(--f-amber); font-size: 11px; font-weight: 800; }
.fasten-drawing-board > footer { display: flex; justify-content: space-between; gap: 14px; padding: 10px 16px; border-top: 1px solid rgba(114, 191, 232, .16); color: var(--f-muted); font-size: 12px; }
.fasten-spec-panel { min-width: 0; padding: 16px; }
.fasten-spec-panel > header { gap: 9px; }
.fasten-spec-panel > header svg { width: 20px; color: var(--f-blue); }
.fasten-spec-panel h2 { margin: 2px 0 0; font-size: 19px; }
.fasten-spec-list { display: grid; gap: 6px; margin: 13px 0; }
.fasten-spec-list article { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: center; padding: 8px 9px; border: 1px solid var(--f-border); border-radius: 9px; opacity: .42; }
.fasten-spec-panel.is-revealed .fasten-spec-list article { opacity: 1; }
.fasten-spec-list article > div { min-width: 0; display: grid; }
.fasten-spec-list article strong { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.fasten-spec-list article > span { max-width: 145px; overflow: hidden; color: var(--f-muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.fasten-spec-list article.spec-missing { border-color: rgba(255, 124, 130, .3); background: rgba(255, 124, 130, .04); }
.fasten-spec-list article.spec-missing strong, .fasten-spec-list article.spec-missing > span { color: var(--f-red); }
.fasten-missing-alert { display: flex; gap: 9px; padding: 10px 11px; border: 1px solid rgba(255, 124, 130, .28); border-radius: 10px; background: rgba(255, 124, 130, .05); }
.fasten-missing-alert svg { width: 19px; flex: 0 0 auto; color: var(--f-red); }
.fasten-missing-alert strong { font-size: 14px; }
.fasten-missing-alert p { margin: 3px 0 0; color: var(--f-muted); font-size: 13px; }

.fasten-search-query { display: grid; grid-template-columns: 32px 1fr auto; gap: 10px; align-items: center; padding: 13px 15px; margin-bottom: 14px; }
.fasten-search-query svg { width: 20px; color: var(--f-blue); }
.fasten-search-query > div { min-width: 0; display: grid; }
.fasten-search-query strong { overflow: hidden; font-size: 15px; text-overflow: ellipsis; white-space: nowrap; }
.fasten-search-query > span { color: var(--f-muted); font-size: 13px; }
.fasten-case-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.fasten-case-grid > article { min-width: 0; padding: 15px; opacity: .5; }
.fasten-case-grid.is-revealed > article { opacity: 1; }
.fasten-case-grid > article.is-selected { border-color: rgba(var(--f-blue-rgb), .4); background: linear-gradient(145deg, rgba(var(--f-blue-rgb), .07), rgba(14,21,26,.92)); }
.fasten-case-grid article > header { display: grid; grid-template-columns: 30px 1fr auto; gap: 9px; }
.fasten-case-grid article > header > span { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; color: var(--f-blue); background: rgba(var(--f-blue-rgb), .08); font-size: 12px; }
.fasten-case-grid article > header > div { min-width: 0; }
.fasten-case-grid h2 { margin: 2px 0; font-size: 18px; }
.fasten-case-grid header p { margin: 0; color: var(--f-muted); font-size: 13px; }
.fasten-case-grid article > header > strong { display: grid; color: var(--f-blue); font-size: 23px; text-align: right; }
.fasten-case-grid article > header > strong small { color: var(--f-muted); font-size: 10px; }
.fasten-case-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin: 14px 0; }
.fasten-case-compare section { display: grid; align-content: start; gap: 5px; padding: 9px; border: 1px solid var(--f-border); border-radius: 9px; }
.fasten-case-compare span { display: flex; gap: 5px; color: var(--f-muted); font-size: 12px; }
.fasten-case-compare svg { width: 12px; flex: 0 0 auto; color: var(--f-green); }
.fasten-case-compare section:last-child svg { color: var(--f-amber); }
.fasten-case-grid dl { display: grid; grid-template-columns: 1fr auto 1fr auto; gap: 5px; margin: 0; padding: 9px 0; border-block: 1px solid var(--f-border); }
.fasten-case-grid dt { color: var(--f-muted); font-size: 12px; }
.fasten-case-grid dd { margin: 0 8px 0 0; font-size: 13px; font-weight: 700; }
.fasten-case-grid article > footer { display: flex; gap: 7px; margin-top: 10px; color: var(--f-muted); font-size: 12px; }
.fasten-case-grid footer svg { width: 15px; flex: 0 0 auto; color: var(--f-blue); }

.fasten-route-panel { padding: 16px; margin-bottom: 14px; }
.fasten-route-panel > header { gap: 9px; }
.fasten-route-panel > header svg, .fasten-machine-panel > header svg, .fasten-risk-panel > header svg,
.fasten-signal-panel > header svg, .fasten-vision-panel > header svg, .fasten-hypotheses > header svg,
.fasten-measurement-panel > header svg, .fasten-evidence-thread > header svg { width: 20px; color: var(--f-blue); }
.fasten-route-panel > header > div, .fasten-machine-panel > header > div, .fasten-risk-panel > header > div,
.fasten-signal-panel > header > div, .fasten-vision-panel > header > div, .fasten-hypotheses > header > div,
.fasten-measurement-panel > header > div, .fasten-evidence-thread > header > div { display: grid; }
.fasten-route-panel h2, .fasten-machine-panel h2, .fasten-risk-panel h2, .fasten-signal-panel h2,
.fasten-vision-panel h2, .fasten-hypotheses h2, .fasten-measurement-panel h2, .fasten-evidence-thread h2 { margin: 1px 0 0; font-size: 19px; }
.fasten-route-panel > header > span, .fasten-signal-panel > header > span, .fasten-measurement-panel > header > span { margin-left: auto; color: var(--f-muted); font-size: 12px; }
.fasten-route-panel > div { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; margin-top: 13px; }
.fasten-route-panel > div article { position: relative; min-width: 0; display: grid; gap: 3px; padding: 11px; border: 1px solid var(--f-border); border-radius: 10px; opacity: .42; }
.fasten-route-panel.is-revealed > div article { opacity: 1; }
.fasten-route-panel > div article > span { color: var(--f-blue); font-size: 12px; font-weight: 800; }
.fasten-route-panel > div article strong { font-size: 14px; }
.fasten-route-panel > div article p { margin: 3px 0 0; color: var(--f-muted); font-size: 11px; }
.fasten-route-panel > div article::after { content: "›"; position: absolute; top: 38%; right: -8px; color: var(--f-dim); z-index: 2; }
.fasten-route-panel > div article:last-child::after { display: none; }
.fasten-planning-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.fasten-machine-panel, .fasten-risk-panel { padding: 16px; }
.fasten-machine-panel > header, .fasten-risk-panel > header { gap: 9px; margin-bottom: 12px; }
.fasten-machine-panel > article { display: grid; grid-template-columns: 38px 1fr auto; gap: 9px; align-items: center; padding: 11px; border: 1px solid var(--f-border); border-radius: 10px; margin-top: 8px; opacity: .42; }
.fasten-machine-panel.is-revealed > article { opacity: 1; }
.fasten-machine-panel > article.is-recommended { border-color: rgba(var(--f-blue-rgb), .4); background: rgba(var(--f-blue-rgb), .045); }
.fasten-machine-panel > article > span { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 9px; color: var(--f-blue); background: rgba(var(--f-blue-rgb), .08); }
.fasten-machine-panel > article svg { width: 18px; }
.fasten-machine-panel > article > div { display: grid; }
.fasten-machine-panel > article strong { font-size: 15px; }
.fasten-machine-panel > article p { margin: 2px 0 0; color: var(--f-muted); font-size: 12px; }
.fasten-machine-panel > article aside { display: grid; text-align: right; }
.fasten-machine-panel > article aside strong { color: var(--f-blue); font-size: 20px; }
.fasten-machine-panel > article footer { grid-column: 2 / -1; padding-top: 7px; border-top: 1px solid var(--f-border); color: var(--f-amber); font-size: 12px; }
.fasten-risk-panel > article { display: grid; grid-template-columns: 48px 1fr; gap: 10px; padding: 10px 0; border-top: 1px solid var(--f-border); opacity: .42; }
.fasten-risk-panel.is-revealed > article { opacity: 1; }
.fasten-risk-panel > article > span { align-self: start; padding: 5px; border: 1px solid rgba(240,180,94,.3); border-radius: 6px; color: var(--f-amber); font-size: 10px; font-weight: 800; text-align: center; }
.fasten-risk-panel > article div { display: grid; }
.fasten-risk-panel > article strong { font-size: 15px; }
.fasten-risk-panel > article p { margin: 2px 0; color: var(--f-muted); font-size: 13px; }
.fasten-risk-panel > article small { color: var(--f-blue); letter-spacing: 0; text-transform: none; }

.fasten-trial-grid { display: grid; grid-template-columns: 1.35fr .65fr; gap: 14px; }
.fasten-signal-panel, .fasten-vision-panel { padding: 16px; }
.fasten-signal-panel > header, .fasten-vision-panel > header { gap: 9px; }
.fasten-signal-panel > header > span { padding: 5px 8px; border: 1px solid var(--f-border); border-radius: 999px; }
.fasten-signal-panel.has-anomaly > header > span { color: var(--f-red); border-color: rgba(255,124,130,.3); }
.fasten-signal-panel > svg { width: 100%; height: 210px; margin-top: 8px; }
.fasten-signal-panel svg line { stroke: rgba(180, 211, 225, .08); stroke-width: 1; vector-effect: non-scaling-stroke; }
.fasten-signal-panel svg polyline { fill: none; stroke-width: 2; vector-effect: non-scaling-stroke; }
.signal-baseline { stroke: #82969f; stroke-dasharray: 5 5; }
.signal-load { stroke: var(--f-blue); }
.signal-vibration { stroke: var(--f-amber); }
.fasten-signal-panel > footer { display: flex; gap: 15px; color: var(--f-muted); font-size: 12px; }
.fasten-signal-panel > footer span::before { content: ""; width: 14px; height: 2px; display: inline-block; margin-right: 5px; vertical-align: middle; background: var(--f-blue); }
.fasten-signal-panel > footer .legend-vibration::before { background: var(--f-amber); }
.fasten-signal-panel > footer .legend-baseline::before { height: 0; border-top: 1px dashed #82969f; background: transparent; }
.fasten-live-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
.fasten-live-metrics > span { display: grid; padding: 9px 10px; border: 1px solid var(--f-border); border-radius: 9px; }
.fasten-live-metrics small { color: var(--f-muted); }
.fasten-live-metrics strong { font-size: 18px; }
.fasten-signal-panel.has-anomaly .fasten-live-metrics > span:nth-child(n+2) strong { color: var(--f-amber); }
.fasten-vision-panel > header { margin-bottom: 10px; }
.fasten-part-image { position: relative; min-height: 260px; display: grid; place-items: center; border: 1px solid var(--f-border); border-radius: 12px; overflow: hidden; background: radial-gradient(circle, rgba(114,191,232,.11), transparent 62%), #0a1014; }
.fasten-part-image svg { width: 90%; height: 250px; }
.fasten-part-image circle, .fasten-part-image line { fill: none; stroke: #81949d; stroke-width: 2; }
.fasten-part-image .defect-path { fill: none; stroke: var(--f-red); stroke-width: 5; filter: drop-shadow(0 0 7px rgba(255,124,130,.55)); }
.fasten-part-image > span { position: absolute; bottom: 10px; padding: 5px 8px; border-radius: 6px; color: #ffd1d3; background: rgba(255,124,130,.12); font-size: 11px; font-weight: 800; }
.fasten-vision-panel > footer { margin-top: 9px; color: var(--f-muted); font-size: 12px; }
.fasten-hypotheses { margin-top: 14px; padding: 16px; }
.fasten-hypotheses > header { gap: 9px; }
.fasten-hypotheses > div { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin-top: 12px; }
.fasten-hypotheses article { display: grid; grid-template-columns: 30px 1fr auto; gap: 9px; padding: 11px; border: 1px solid var(--f-border); border-radius: 10px; opacity: .42; }
.fasten-hypotheses.is-revealed article { opacity: 1; }
.fasten-hypotheses article > span { width: 27px; height: 27px; display: grid; place-items: center; border-radius: 7px; color: var(--f-blue); background: rgba(var(--f-blue-rgb), .08); }
.fasten-hypotheses article > div { display: grid; }
.fasten-hypotheses article strong { font-size: 14px; }
.fasten-hypotheses article p { margin: 3px 0 0; color: var(--f-muted); font-size: 12px; }
.fasten-hypotheses article aside { display: grid; color: var(--f-blue); font-size: 17px; font-weight: 700; text-align: right; }
.fasten-hypotheses article aside small { color: var(--f-muted); font-size: 9px; }

.fasten-quality-grid { display: grid; grid-template-columns: 1.4fr .6fr; gap: 14px; }
.fasten-measurement-panel, .fasten-evidence-thread { padding: 16px; }
.fasten-measurement-panel > header, .fasten-evidence-thread > header { gap: 9px; }
.fasten-measurement-panel table { width: 100%; margin-top: 12px; border-collapse: collapse; }
.fasten-measurement-panel th { padding: 8px 9px; color: var(--f-muted); font-size: 12px; font-weight: 700; text-align: left; border-bottom: 1px solid var(--f-border); }
.fasten-measurement-panel td { padding: 10px 9px; font-size: 13px; border-bottom: 1px solid var(--f-border); opacity: .45; }
.fasten-measurement-panel.is-revealed td { opacity: 1; }
.fasten-measurement-panel td:first-child { font-weight: 700; }
.fasten-measurement-panel td span { padding: 4px 6px; border-radius: 5px; color: var(--f-green); background: rgba(114,216,163,.08); font-size: 10px; font-weight: 800; }
.fasten-evidence-thread > article { position: relative; display: grid; grid-template-columns: 24px 1fr; gap: 8px; padding: 8px 0; opacity: .42; }
.fasten-evidence-thread.is-revealed > article { opacity: 1; }
.fasten-evidence-thread > article:not(:last-child)::after { content: ""; position: absolute; top: 30px; bottom: -2px; left: 11px; width: 1px; background: var(--f-border); }
.fasten-evidence-thread > article > span { width: 23px; height: 23px; display: grid; place-items: center; color: var(--f-blue); }
.fasten-evidence-thread > article svg { width: 12px; }
.fasten-evidence-thread article > div { display: grid; }
.fasten-evidence-thread article strong { font-size: 13px; }
.fasten-evidence-thread article p { margin: 1px 0 0; color: var(--f-muted); font-size: 11px; }
.fasten-closeout { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
.fasten-closeout > article { display: grid; grid-template-columns: 36px 1fr auto; gap: 10px; align-items: center; padding: 13px; opacity: .48; }
.fasten-closeout.is-revealed > article { opacity: 1; }
.fasten-closeout article > svg { width: 22px; color: var(--f-blue); }
.fasten-closeout article > div { display: grid; }
.fasten-closeout article strong { font-size: 14px; }
.fasten-closeout article span { color: var(--f-muted); font-size: 11px; }
.fasten-closeout article button { padding: 7px 9px; border: 1px solid var(--f-border); border-radius: 8px; color: var(--f-muted); background: transparent; font-size: 11px; }
.fasten-closeout article button:not(:disabled) { color: var(--f-text); border-color: rgba(var(--f-blue-rgb), .3); cursor: pointer; }

.fasten-stage-actions {
  position: sticky;
  bottom: 0;
  max-width: 1580px;
  margin: 18px auto 0;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 13px 15px;
  background: rgba(10, 15, 19, .96);
  backdrop-filter: blur(20px);
  z-index: 11;
}
.fasten-stage-actions > div { min-width: 0; display: grid; }
.fasten-stage-actions > div strong { font-size: 15px; }
.fasten-stage-actions > div span { color: var(--f-muted); font-size: 12px; }
.fasten-primary-action {
  min-width: 270px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-left: auto;
  padding: 11px 16px;
  border: 1px solid var(--f-blue);
  border-radius: 10px;
  color: #071117;
  background: var(--f-blue);
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}
.fasten-primary-action:hover { filter: brightness(1.08); }
.fasten-primary-action:disabled { opacity: .55; cursor: wait; }
.fasten-primary-action svg { width: 17px; }

.fasten-story-complete {
  max-width: 1000px;
  min-height: 500px;
  margin: 50px auto;
  display: grid;
  place-items: center;
  align-content: center;
  padding: 50px;
  text-align: center;
  background:
    radial-gradient(circle at 50% 12%, rgba(114,216,163,.12), transparent 38%),
    rgba(14, 21, 26, .94);
}
.fasten-story-complete > span { width: 78px; height: 78px; display: grid; place-items: center; border: 1px solid rgba(114,216,163,.35); border-radius: 50%; color: var(--f-green); background: rgba(114,216,163,.08); }
.fasten-story-complete > span svg { width: 38px; }
.fasten-story-complete h1 { max-width: 780px; margin: 10px 0; font-size: 36px; line-height: 1.15; }
.fasten-story-complete p { max-width: 760px; margin: 0; color: var(--f-muted); font-size: 16px; }
.fasten-story-complete > div { display: flex; gap: 10px; margin-top: 22px; }
.fasten-story-complete button { display: flex; align-items: center; gap: 7px; padding: 10px 14px; border: 1px solid rgba(var(--f-blue-rgb),.35); border-radius: 10px; background: rgba(var(--f-blue-rgb),.08); cursor: pointer; }
.fasten-story-complete button svg { width: 17px; }

@media (max-width: 1240px) {
  .fasten-boundary { display: none; }
  .fasten-stage-rail button em { display: none; }
  .fasten-drawing-grid, .fasten-quality-grid { grid-template-columns: 1fr; }
  .fasten-case-grid { grid-template-columns: 1fr; }
  .fasten-route-panel > div { grid-template-columns: repeat(3, 1fr); }
  .fasten-hypotheses > div { grid-template-columns: 1fr; }
}
@media (max-width: 900px) {
  .fasten-shell { grid-template-rows: 72px 92px minmax(0, 1fr); }
  .fasten-brand { min-width: 0; }
  .fasten-brand small, .fasten-progress { display: none; }
  .fasten-stage-rail { padding-inline: 8px; }
  .fasten-stage-rail button { display: flex; justify-content: center; padding: 8px 4px; }
  .fasten-stage-rail button > div { display: none; }
  .fasten-context-bar { grid-template-columns: 1fr 1fr; }
  .fasten-context-bar > div:nth-child(n+3), .fasten-context-bar > span { display: none; }
  .fasten-stage-hero, .fasten-intake-grid, .fasten-planning-grid, .fasten-trial-grid { grid-template-columns: 1fr; }
  .fasten-agent-handoff, .fasten-closeout { grid-template-columns: 1fr; }
  .fasten-commercial-strip { grid-template-columns: 1fr; }
  .fasten-route-panel > div { grid-template-columns: 1fr; }
  .fasten-stage-actions { align-items: stretch; flex-direction: column; }
  .fasten-primary-action { width: 100%; min-width: 0; margin-left: 0; }
}
`;
