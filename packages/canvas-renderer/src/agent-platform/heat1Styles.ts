export const heat1Styles = `
.heat-shell {
  --h-bg: #0b0908;
  --h-panel: #17110e;
  --h-raised: #211713;
  --h-border: rgba(235, 190, 158, .15);
  --h-text: #fbf4ef;
  --h-muted: #b3a198;
  --h-dim: #796861;
  --h-copper: #f28d52;
  --h-copper-rgb: 242, 141, 82;
  --h-gold: #f0bd68;
  --h-green: #78d49e;
  --h-red: #ff7777;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template: 72px 110px minmax(0, 1fr) / 1fr;
  overflow: hidden;
  color: var(--h-text);
  background:
    radial-gradient(circle at 19% -14%, rgba(var(--h-copper-rgb), .14), transparent 36%),
    radial-gradient(circle at 96% 4%, rgba(240, 189, 104, .07), transparent 27%),
    var(--h-bg);
  font: 400 16px/1.5 Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.heat-shell *, .heat-shell *::before, .heat-shell *::after { box-sizing: border-box; }
.heat-shell button { color: inherit; font: inherit; }
.heat-topbar {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 18px;
  border-bottom: 1px solid var(--h-border);
  background: rgba(11, 9, 8, .95);
  backdrop-filter: blur(22px);
  z-index: 20;
}
.heat-back, .heat-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--h-border);
  border-radius: 10px;
  color: var(--h-muted);
  background: rgba(255,255,255,.02);
  cursor: pointer;
}
.heat-back { gap: 7px; padding: 8px 11px; font-size: 14px; }
.heat-back svg { width: 17px; }
.heat-close { width: 36px; height: 36px; padding: 0; }
.heat-close svg { width: 18px; }
.heat-back:hover, .heat-close:hover { color: var(--h-copper); border-color: rgba(var(--h-copper-rgb), .4); }
.heat-brand { min-width: 320px; display: flex; align-items: center; gap: 10px; }
.heat-brand > span {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(var(--h-copper-rgb), .42);
  border-radius: 11px;
  color: var(--h-copper);
  background: rgba(var(--h-copper-rgb), .09);
}
.heat-brand > span svg { width: 19px; }
.heat-brand > div { display: grid; }
.heat-brand strong { font-size: 18px; }
.heat-brand small { color: var(--h-muted); font-size: 14px; }
.heat-boundary {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 auto;
  padding: 7px 11px;
  border: 1px solid rgba(var(--h-copper-rgb), .27);
  border-radius: 999px;
  color: #efc2a6;
  background: rgba(var(--h-copper-rgb), .06);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .08em;
}
.heat-boundary svg { width: 15px; }
.heat-progress { display: flex; align-items: center; gap: 8px; }
.heat-progress > span { width: 90px; height: 5px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.07); }
.heat-progress i { height: 100%; display: block; border-radius: inherit; background: var(--h-copper); transition: width 300ms ease; }
.heat-progress strong { min-width: 34px; color: var(--h-copper); font-size: 13px; }

.heat-stage-rail {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  padding: 12px clamp(20px, 3vw, 44px);
  border-bottom: 1px solid var(--h-border);
  background: rgba(15, 11, 9, .9);
  z-index: 12;
}
.heat-stage-rail button {
  position: relative;
  min-width: 0;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 9px;
  align-items: center;
  padding: 9px 13px;
  border: 0;
  color: var(--h-dim);
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.heat-stage-rail button:disabled { opacity: .34; cursor: not-allowed; }
.heat-stage-rail button > span { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid var(--h-border); border-radius: 10px; background: rgba(255,255,255,.018); }
.heat-stage-rail button > span svg { width: 17px; }
.heat-stage-rail button > div { min-width: 0; display: grid; }
.heat-stage-rail button small { color: inherit; font-size: 12px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
.heat-stage-rail button strong { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.heat-stage-rail button em { overflow: hidden; color: var(--h-dim); font-size: 11px; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
.heat-stage-rail button > i { position: absolute; top: 50%; right: -8px; width: 16px; height: 1px; background: var(--h-border); }
.heat-stage-rail button.is-active { color: var(--h-text); border-radius: 12px; background: rgba(var(--h-copper-rgb), .065); }
.heat-stage-rail button.is-active > span { color: var(--h-copper); border-color: rgba(var(--h-copper-rgb), .42); background: rgba(var(--h-copper-rgb), .1); }
.heat-stage-rail button.is-active small { color: var(--h-copper); }
.heat-stage-rail button.is-complete > span { color: var(--h-green); border-color: rgba(120,212,158,.3); }

.heat-main { min-height: 0; overflow: auto; padding: 0 clamp(22px, 3vw, 46px) 34px; }
.heat-context-bar {
  position: sticky;
  top: 0;
  max-width: 1580px;
  margin: 0 auto 22px;
  display: grid;
  grid-template-columns: 1fr 1fr 1.45fr 1.55fr auto;
  border: 1px solid var(--h-border);
  border-top: 0;
  border-radius: 0 0 13px 13px;
  overflow: hidden;
  background: rgba(12,9,8,.96);
  backdrop-filter: blur(20px);
  z-index: 10;
}
.heat-context-bar > div { min-width: 0; display: grid; padding: 9px 12px; border-right: 1px solid var(--h-border); }
.heat-context-bar small { color: var(--h-dim); font-size: 12px; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
.heat-context-bar strong { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.heat-context-bar > span { display: flex; align-items: center; gap: 6px; padding: 0 12px; color: var(--h-copper); font-size: 11px; font-weight: 800; letter-spacing: .08em; }
.heat-context-bar > span svg { width: 11px; }
.heat-stage-page { max-width: 1580px; margin: 0 auto; }
.heat-stage-hero { display: grid; grid-template-columns: minmax(0,1fr) 300px; gap: 36px; align-items: end; margin-bottom: 20px; }
.heat-stage-hero > div > span,
.heat-part-card small, .heat-spec-card small, .heat-document-thread small,
.heat-furnace-map small, .heat-recipe-panel small, .heat-journey-chart small,
.heat-atmosphere-chart small, .heat-event-strip small, .heat-risk-map small,
.heat-soft-summary small, .heat-causal-thread small, .heat-hypothesis-panel small,
.heat-sampling-plan small, .heat-lab-panel small, .heat-disposition-card small,
.heat-release-package small, .heat-stage-actions small, .heat-story-complete > small {
  color: var(--h-copper);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
}
.heat-stage-hero h1 { margin: 5px 0 7px; font-size: clamp(30px, 3vw, 44px); line-height: 1.1; letter-spacing: -.03em; }
.heat-stage-hero p { max-width: 1000px; margin: 0; color: var(--h-muted); font-size: 17px; }
.heat-stage-hero > aside { display: grid; gap: 3px; padding: 13px 16px; border-left: 2px solid var(--h-copper); background: rgba(var(--h-copper-rgb), .045); }
.heat-stage-hero > aside small { color: var(--h-copper); font-size: 12px; letter-spacing: .1em; }
.heat-stage-hero > aside strong { font-size: 20px; }
.heat-stage-hero > aside span { color: var(--h-muted); font-size: 14px; }
.heat-stage-hero > aside.is-hold { border-color: var(--h-red); }
.heat-stage-hero > aside.is-hold strong { color: var(--h-red); }
.heat-stage-hero.compact h1 { font-size: clamp(28px, 2.5vw, 38px); }

.heat-part-card, .heat-spec-card, .heat-document-thread, .heat-furnace-map,
.heat-recipe-panel, .heat-journey-chart, .heat-atmosphere-chart,
.heat-event-strip, .heat-risk-map, .heat-soft-verdict, .heat-soft-metrics article,
.heat-model-card, .heat-causal-thread, .heat-hypothesis-panel,
.heat-sampling-plan, .heat-lab-panel, .heat-disposition-card,
.heat-release-package article, .heat-stage-actions, .heat-story-complete {
  border: 1px solid var(--h-border);
  border-radius: 16px;
  background: rgba(23, 17, 14, .91);
}
.heat-passport-grid { display: grid; grid-template-columns: .85fr .75fr 1.1fr; gap: 14px; }
.heat-part-card, .heat-spec-card, .heat-document-thread { padding: 16px; }
.heat-part-card > header, .heat-spec-card > header, .heat-document-thread > header,
.heat-furnace-map > header, .heat-recipe-panel > header, .heat-journey-chart > header,
.heat-atmosphere-chart > header, .heat-risk-map > header, .heat-causal-thread > header,
.heat-hypothesis-panel > header, .heat-sampling-plan > header, .heat-lab-panel > header,
.heat-disposition-card > header {
  display: flex;
  align-items: center;
  gap: 9px;
}
.heat-part-card > header > span { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px; color: var(--h-copper); background: rgba(var(--h-copper-rgb), .09); }
.heat-part-card > header svg, .heat-spec-card > header svg, .heat-document-thread > header svg,
.heat-furnace-map > header svg, .heat-recipe-panel > header svg, .heat-journey-chart > header svg,
.heat-atmosphere-chart > header svg, .heat-risk-map > header svg, .heat-causal-thread > header svg,
.heat-hypothesis-panel > header svg, .heat-sampling-plan > header svg, .heat-lab-panel > header svg,
.heat-disposition-card > header svg { width: 20px; color: var(--h-copper); }
.heat-part-card header > div, .heat-spec-card header > div, .heat-document-thread header > div,
.heat-furnace-map header > div, .heat-recipe-panel header > div, .heat-journey-chart header > div,
.heat-atmosphere-chart header > div, .heat-risk-map header > div, .heat-causal-thread header > div,
.heat-hypothesis-panel header > div, .heat-sampling-plan header > div, .heat-lab-panel header > div,
.heat-disposition-card header > div { display: grid; }
.heat-part-card h2, .heat-spec-card h2, .heat-document-thread h2,
.heat-furnace-map h2, .heat-recipe-panel h2, .heat-journey-chart h2,
.heat-atmosphere-chart h2, .heat-risk-map h2, .heat-causal-thread h2,
.heat-hypothesis-panel h2, .heat-sampling-plan h2, .heat-lab-panel h2,
.heat-disposition-card h2 { margin: 1px 0 0; font-size: 19px; }
.heat-part-card header p { margin: 1px 0 0; color: var(--h-muted); font-size: 13px; }
.heat-part-visual { height: 260px; display: grid; place-items: center; margin: 10px 0; border: 1px solid var(--h-border); border-radius: 12px; background: radial-gradient(circle, rgba(var(--h-copper-rgb),.1), transparent 62%), #0d0c0b; }
.heat-gear-glyph { width: 100%; height: 245px; }
.heat-gear-glyph circle { fill: url(#heat-gear-fill); stroke: #a78674; stroke-width: 2; }
.heat-gear-glyph line { stroke: #a78674; stroke-width: 5; }
.heat-gear-glyph .heat-case-layer { fill: none; stroke: var(--h-copper); stroke-width: 6; filter: drop-shadow(0 0 7px rgba(var(--h-copper-rgb),.45)); }
.heat-gear-glyph text { fill: var(--h-muted); font-size: 11px; letter-spacing: .08em; }
.heat-part-card dl { display: grid; grid-template-columns: 94px 1fr; gap: 5px 8px; margin: 0; }
.heat-part-card dt { color: var(--h-muted); font-size: 13px; }
.heat-part-card dd { margin: 0; font-size: 14px; }
.heat-spec-card > header > span { margin-left: auto; color: var(--h-muted); font-size: 11px; }
.heat-spec-stack { display: grid; gap: 7px; margin: 13px 0; }
.heat-spec-stack article { display: grid; grid-template-columns: 40px 1fr 18px; gap: 8px; align-items: center; padding: 9px; border: 1px solid var(--h-border); border-radius: 10px; }
.heat-spec-stack article > span { width: 38px; height: 28px; display: grid; place-items: center; border-radius: 7px; color: var(--h-copper); background: rgba(var(--h-copper-rgb),.08); font-size: 10px; font-weight: 800; }
.heat-spec-stack article > div { display: grid; }
.heat-spec-stack article strong { font-size: 14px; }
.heat-spec-stack article > svg { width: 15px; color: var(--h-green); }
.heat-spec-card > footer { display: flex; gap: 7px; padding-top: 10px; border-top: 1px solid var(--h-border); color: var(--h-muted); font-size: 12px; }
.heat-spec-card > footer svg { width: 15px; flex: 0 0 auto; color: var(--h-green); }
.heat-document-thread > div { display: grid; gap: 7px; margin-top: 13px; }
.heat-document-thread article { display: grid; grid-template-columns: 24px 1fr auto; gap: 8px; align-items: center; padding: 9px; border: 1px solid var(--h-border); border-radius: 9px; }
.heat-document-thread article > span { color: var(--h-copper); }
.heat-document-thread article svg { width: 12px; }
.heat-document-thread article > div { display: grid; }
.heat-document-thread article strong { font-size: 13px; }
.heat-document-thread article em { color: var(--h-green); font-size: 11px; font-style: normal; }

.heat-load-grid { display: grid; grid-template-columns: 1.25fr .75fr; gap: 14px; }
.heat-furnace-map, .heat-recipe-panel { padding: 16px; }
.heat-furnace-map > header > span { margin-left: auto; color: var(--h-muted); font-size: 12px; }
.heat-chamber { display: grid; grid-template-columns: 100px 1fr 90px; gap: 10px; align-items: stretch; margin-top: 14px; padding: 14px; border: 1px solid rgba(var(--h-copper-rgb),.18); border-radius: 14px; background: linear-gradient(90deg, rgba(var(--h-copper-rgb),.08), transparent 30%, rgba(var(--h-copper-rgb),.07)); }
.heat-chamber > aside { display: grid; place-items: center; align-content: center; color: var(--h-muted); text-align: center; }
.heat-chamber > aside strong { color: var(--h-copper); font-size: 13px; }
.heat-chamber > aside small { font-size: 11px; }
.heat-chamber > aside i { width: 45px; height: 2px; margin-top: 8px; background: var(--h-copper); box-shadow: 0 0 14px rgba(var(--h-copper-rgb),.5); }
.heat-chamber > section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.heat-chamber > section article { padding: 10px; border: 1px solid var(--h-border); border-radius: 10px; opacity: .45; background: rgba(0,0,0,.13); }
.heat-furnace-map.is-revealed .heat-chamber article { opacity: 1; }
.heat-chamber article.is-risk { border-color: rgba(255,119,119,.35); background: rgba(255,119,119,.045); }
.heat-chamber article header { display: flex; justify-content: space-between; }
.heat-chamber article header span { color: var(--h-copper); font-size: 13px; font-weight: 800; }
.heat-chamber article header small { color: var(--h-muted); font-size: 10px; }
.heat-chamber article > strong { display: block; margin-top: 8px; font-size: 17px; }
.heat-chamber article > p { margin: 1px 0 7px; color: var(--h-muted); font-size: 12px; }
.heat-chamber article footer { display: grid; grid-template-columns: 1fr auto; gap: 7px; align-items: center; }
.heat-chamber article footer i { height: 4px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.06); }
.heat-chamber article footer b { height: 100%; display: block; border-radius: inherit; background: var(--h-copper); transition: width 500ms ease; }
.heat-chamber article.is-risk footer b { background: var(--h-red); }
.heat-chamber article footer span { color: var(--h-muted); font-size: 10px; }
.heat-load-alert { display: flex; gap: 9px; margin-top: 12px; padding: 10px 11px; border: 1px solid rgba(255,119,119,.28); border-radius: 10px; background: rgba(255,119,119,.045); }
.heat-load-alert svg { width: 19px; flex: 0 0 auto; color: var(--h-red); }
.heat-load-alert strong { font-size: 14px; }
.heat-load-alert p { margin: 2px 0 0; color: var(--h-muted); font-size: 12px; }
.heat-recipe-panel ol { margin: 13px 0 0; padding: 0; list-style: none; }
.heat-recipe-panel li { display: grid; grid-template-columns: 34px 1fr auto; gap: 9px; align-items: center; padding: 9px 0; border-top: 1px solid var(--h-border); opacity: .45; }
.heat-recipe-panel.is-revealed li { opacity: 1; }
.heat-recipe-panel li > span { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 8px; color: var(--h-copper); background: rgba(var(--h-copper-rgb),.08); font-size: 11px; font-weight: 800; }
.heat-recipe-panel li > div, .heat-recipe-panel li > aside { display: grid; }
.heat-recipe-panel li strong { font-size: 14px; }
.heat-recipe-panel li p { margin: 1px 0 0; color: var(--h-muted); font-size: 11px; }
.heat-recipe-panel li > aside { text-align: right; }
.heat-recipe-panel li > aside strong { color: var(--h-copper); }
.heat-recipe-panel li > aside small { color: var(--h-muted); font-size: 10px; }

.heat-journey-grid { display: grid; grid-template-columns: 1.35fr .65fr; gap: 14px; }
.heat-journey-chart, .heat-atmosphere-chart { padding: 16px; }
.heat-journey-chart > header > span { margin-left: auto; color: var(--h-muted); font-size: 12px; }
.heat-journey-chart > svg, .heat-atmosphere-chart > svg { width: 100%; height: 230px; margin-top: 8px; }
.heat-journey-chart svg line, .heat-atmosphere-chart svg line { stroke: rgba(235,190,158,.08); stroke-width: 1; vector-effect: non-scaling-stroke; }
.heat-journey-chart svg polyline, .heat-atmosphere-chart svg polyline { fill: none; stroke-width: 2; vector-effect: non-scaling-stroke; }
.heat-envelope-line { stroke: #826f65; stroke-dasharray: 5 5; }
.heat-furnace-line { stroke: var(--h-copper); }
.heat-load-line { stroke: var(--h-gold); }
.heat-journey-chart > footer, .heat-atmosphere-chart > footer { display: flex; gap: 14px; color: var(--h-muted); font-size: 12px; }
.heat-journey-chart > footer span::before, .heat-atmosphere-chart > footer span::before { content: ""; width: 14px; height: 2px; display: inline-block; margin-right: 5px; vertical-align: middle; background: var(--h-copper); }
.heat-journey-chart > footer .legend-load::before { background: var(--h-gold); }
.heat-journey-chart > footer .legend-envelope::before { height: 0; border-top: 1px dashed #826f65; background: transparent; }
.heat-phase-band { display: grid; grid-template-columns: repeat(6,1fr); gap: 3px; margin-top: 11px; }
.heat-phase-band span { padding: 5px; border-radius: 4px; color: var(--h-muted); background: rgba(var(--h-copper-rgb),.055); font-size: 10px; text-align: center; }
.heat-cp-target { stroke: #826f65; stroke-dasharray: 5 5; }
.heat-cp-line { stroke: var(--h-copper); }
.heat-atmosphere-chart > footer { justify-content: space-between; }
.heat-event-strip { display: grid; grid-template-columns: repeat(3,1fr); gap: 0; margin-top: 14px; overflow: hidden; }
.heat-event-strip article { display: grid; grid-template-columns: 28px 46px 1fr; gap: 8px; padding: 13px; border-right: 1px solid var(--h-border); opacity: .45; }
.heat-event-strip.is-revealed article { opacity: 1; }
.heat-event-strip article:last-child { border-right: 0; }
.heat-event-strip article > span { width: 27px; height: 27px; display: grid; place-items: center; border-radius: 50%; color: var(--h-copper); background: rgba(var(--h-copper-rgb),.09); }
.heat-event-strip time { color: var(--h-copper); font-size: 13px; font-weight: 700; }
.heat-event-strip article > div { display: grid; }
.heat-event-strip article strong { font-size: 14px; }
.heat-event-strip article p { margin: 2px 0 0; color: var(--h-muted); font-size: 12px; }

.heat-soft-grid { display: grid; grid-template-columns: 1.25fr .75fr; gap: 14px; }
.heat-risk-map { padding: 16px; }
.heat-risk-map > header > span { margin-left: auto; color: var(--h-muted); font-size: 12px; }
.heat-risk-map > div { display: grid; grid-template-columns: repeat(3,1fr); gap: 9px; margin-top: 13px; }
.heat-risk-map > div > article { min-width: 0; padding: 11px; border: 1px solid var(--h-border); border-radius: 11px; opacity: .45; background: rgba(255,255,255,.015); }
.heat-risk-map.is-revealed > div > article { opacity: 1; }
.heat-risk-map article.is-warning { border-color: rgba(240,189,104,.28); }
.heat-risk-map article.is-critical { border-color: rgba(255,119,119,.36); background: rgba(255,119,119,.04); }
.heat-risk-map article > header { display: flex; justify-content: space-between; }
.heat-risk-map article > header strong { color: var(--h-copper); font-size: 16px; }
.heat-risk-map article > header span { color: var(--h-muted); font-size: 11px; }
.heat-risk-score { display: grid; grid-template-columns: 12px auto 1fr; gap: 6px; align-items: end; margin: 10px 0; }
.heat-risk-score i { width: 8px; height: 70px; display: flex; align-items: end; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.06); }
.heat-risk-score b { width: 100%; display: block; border-radius: inherit; background: var(--h-copper); transition: height 500ms ease; }
.is-critical .heat-risk-score b { background: var(--h-red); }
.heat-risk-score strong { font-size: 30px; line-height: 1; }
.heat-risk-score small { color: var(--h-muted); font-size: 10px; }
.heat-risk-map dl { display: grid; grid-template-columns: 1fr auto; gap: 4px 8px; margin: 0; }
.heat-risk-map dt { color: var(--h-muted); font-size: 11px; }
.heat-risk-map dd { margin: 0; font-size: 12px; font-weight: 700; }
.heat-soft-summary { display: grid; gap: 10px; }
.heat-soft-verdict { display: flex; gap: 10px; padding: 14px; opacity: .5; }
.heat-soft-summary.is-revealed .heat-soft-verdict { opacity: 1; border-color: rgba(255,119,119,.3); }
.heat-soft-verdict > span { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px; color: var(--h-red); background: rgba(255,119,119,.08); flex: 0 0 auto; }
.heat-soft-verdict svg { width: 19px; }
.heat-soft-verdict h2 { margin: 2px 0; font-size: 19px; }
.heat-soft-verdict p { margin: 3px 0 0; color: var(--h-muted); font-size: 13px; }
.heat-soft-metrics { display: grid; grid-template-columns: repeat(2,1fr); gap: 8px; }
.heat-soft-metrics article { display: grid; padding: 12px; opacity: .45; }
.heat-soft-summary.is-revealed .heat-soft-metrics article { opacity: 1; }
.heat-soft-metrics article strong { margin-top: 4px; font-size: 20px; }
.heat-soft-metrics .state-below-spec strong, .heat-soft-metrics .state-above-spec strong { color: var(--h-red); }
.heat-soft-metrics .state-warning strong { color: var(--h-gold); }
.heat-model-card { display: flex; gap: 9px; align-items: center; padding: 13px; opacity: .45; }
.heat-soft-summary.is-revealed .heat-model-card { opacity: 1; }
.heat-model-card svg { width: 20px; color: var(--h-copper); }
.heat-model-card div { min-width: 0; display: grid; }
.heat-model-card strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.heat-model-card span { color: var(--h-muted); font-size: 11px; }

.heat-investigation-grid { display: grid; grid-template-columns: .78fr 1.22fr; gap: 14px; }
.heat-causal-thread, .heat-hypothesis-panel { padding: 16px; }
.heat-causal-thread ol { margin: 13px 0 0; padding: 0; list-style: none; }
.heat-causal-thread li { position: relative; display: grid; grid-template-columns: 28px 48px 1fr; gap: 8px; padding: 9px 0; opacity: .45; }
.heat-causal-thread.is-revealed li { opacity: 1; }
.heat-causal-thread li:not(:last-child)::after { content: ""; position: absolute; top: 37px; bottom: -3px; left: 13px; width: 1px; background: var(--h-border); }
.heat-causal-thread li > span { width: 27px; height: 27px; display: grid; place-items: center; border-radius: 50%; color: var(--h-copper); background: rgba(var(--h-copper-rgb),.09); }
.heat-causal-thread time { color: var(--h-copper); font-size: 12px; }
.heat-causal-thread li > div { display: grid; }
.heat-causal-thread li strong { font-size: 14px; }
.heat-causal-thread li p { margin: 2px 0; color: var(--h-muted); font-size: 12px; }
.heat-causal-thread li small { color: var(--h-dim); font-size: 10px; }
.heat-hypothesis-panel > article { display: grid; grid-template-columns: 30px 1fr auto; gap: 9px; padding: 11px 0; border-top: 1px solid var(--h-border); opacity: .45; }
.heat-hypothesis-panel.is-revealed > article { opacity: 1; }
.heat-hypothesis-panel > article > span { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; color: var(--h-copper); background: rgba(var(--h-copper-rgb),.08); }
.heat-hypothesis-panel article > div { display: grid; }
.heat-hypothesis-panel article strong { font-size: 14px; }
.heat-hypothesis-panel article p { margin: 2px 0; color: var(--h-muted); font-size: 12px; }
.heat-hypothesis-panel article div small { color: var(--h-gold); font-size: 10px; letter-spacing: 0; text-transform: none; }
.heat-hypothesis-panel article aside { display: grid; color: var(--h-copper); font-size: 18px; font-weight: 700; text-align: right; }
.heat-hypothesis-panel article aside small { color: var(--h-muted); font-size: 9px; }
.heat-sampling-plan { margin-top: 14px; padding: 16px; }
.heat-sampling-plan > div { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-top: 12px; }
.heat-sampling-plan > div article { display: grid; grid-template-columns: 48px 1fr; gap: 8px; padding: 10px; border: 1px solid var(--h-border); border-radius: 10px; opacity: .45; }
.heat-sampling-plan.is-revealed > div article { opacity: 1; }
.heat-sampling-plan article > span { align-self: start; padding: 5px; border-radius: 6px; color: var(--h-copper); background: rgba(var(--h-copper-rgb),.08); font-size: 10px; font-weight: 800; text-align: center; }
.heat-sampling-plan article strong { font-size: 13px; }
.heat-sampling-plan article p { margin: 2px 0 0; color: var(--h-muted); font-size: 11px; }

.heat-release-grid { display: grid; grid-template-columns: 1.25fr .75fr; gap: 14px; }
.heat-lab-panel, .heat-disposition-card { padding: 16px; }
.heat-lab-panel > header > span { margin-left: auto; color: var(--h-muted); font-size: 12px; }
.heat-lab-panel table { width: 100%; margin-top: 12px; border-collapse: collapse; }
.heat-lab-panel th { padding: 8px 9px; color: var(--h-muted); font-size: 12px; text-align: left; border-bottom: 1px solid var(--h-border); }
.heat-lab-panel td { padding: 10px 9px; font-size: 13px; border-bottom: 1px solid var(--h-border); opacity: .45; }
.heat-lab-panel.is-revealed td { opacity: 1; }
.heat-lab-panel tr.is-hold { background: rgba(255,119,119,.035); }
.heat-lab-panel td span { padding: 4px 6px; border-radius: 5px; color: var(--h-green); background: rgba(120,212,158,.08); font-size: 10px; font-weight: 800; }
.heat-lab-panel tr.is-hold td span { color: var(--h-red); background: rgba(255,119,119,.08); }
.heat-lab-panel > footer { display: flex; gap: 7px; padding-top: 10px; color: var(--h-muted); font-size: 12px; }
.heat-lab-panel > footer svg { width: 15px; color: var(--h-copper); }
.heat-disposition-counts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 13px 0; }
.heat-disposition-counts > span { display: grid; padding: 12px; border: 1px solid var(--h-border); border-radius: 10px; opacity: .45; }
.heat-disposition-card.is-revealed .heat-disposition-counts > span { opacity: 1; }
.heat-disposition-counts > span:last-child { border-color: rgba(255,119,119,.3); }
.heat-disposition-counts strong { color: var(--h-green); font-size: 32px; }
.heat-disposition-counts > span:last-child strong { color: var(--h-red); }
.heat-disposition-counts em { color: var(--h-muted); font-size: 11px; font-style: normal; }
.heat-disposition-card ol { margin: 0; padding: 0; list-style: none; }
.heat-disposition-card li { display: flex; gap: 7px; padding: 7px 0; color: var(--h-muted); font-size: 12px; opacity: .45; }
.heat-disposition-card.is-revealed li { opacity: 1; }
.heat-disposition-card li svg { width: 14px; flex: 0 0 auto; color: var(--h-copper); }
.heat-disposition-card > footer { display: flex; gap: 7px; margin-top: 10px; padding-top: 9px; border-top: 1px solid var(--h-border); color: var(--h-muted); font-size: 11px; }
.heat-disposition-card > footer svg { width: 14px; color: var(--h-copper); }
.heat-release-package { display: grid; grid-template-columns: repeat(4,1fr); gap: 9px; margin-top: 14px; }
.heat-release-package article { display: grid; grid-template-columns: 30px 1fr auto; gap: 8px; align-items: center; padding: 11px; opacity: .45; }
.heat-release-package.is-revealed article { opacity: 1; }
.heat-release-package article > svg { width: 19px; color: var(--h-copper); }
.heat-release-package article > div { min-width: 0; display: grid; }
.heat-release-package article strong, .heat-release-package article span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.heat-release-package article strong { font-size: 12px; }
.heat-release-package article span { color: var(--h-muted); font-size: 10px; }
.heat-release-package button { padding: 6px 8px; border: 1px solid var(--h-border); border-radius: 7px; color: var(--h-muted); background: transparent; font-size: 10px; }
.heat-release-package button:not(:disabled) { color: var(--h-text); border-color: rgba(var(--h-copper-rgb),.34); cursor: pointer; }

.heat-stage-actions {
  position: sticky;
  bottom: 0;
  max-width: 1580px;
  margin: 18px auto 0;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 13px 15px;
  background: rgba(14,10,8,.97);
  backdrop-filter: blur(20px);
  z-index: 11;
}
.heat-stage-actions > div { min-width: 0; display: grid; }
.heat-stage-actions > div strong { font-size: 15px; }
.heat-stage-actions > div span { color: var(--h-muted); font-size: 12px; }
.heat-primary-action {
  min-width: 280px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-left: auto;
  padding: 11px 16px;
  border: 1px solid var(--h-copper);
  border-radius: 10px;
  color: #1a0d07;
  background: var(--h-copper);
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}
.heat-primary-action:hover { filter: brightness(1.08); }
.heat-primary-action:disabled { opacity: .55; cursor: wait; }
.heat-primary-action svg { width: 17px; }

.heat-story-complete {
  max-width: 1000px;
  min-height: 500px;
  margin: 50px auto;
  display: grid;
  place-items: center;
  align-content: center;
  padding: 50px;
  text-align: center;
  background: radial-gradient(circle at 50% 12%, rgba(var(--h-copper-rgb),.14), transparent 40%), rgba(23,17,14,.95);
}
.heat-story-complete > span { width: 78px; height: 78px; display: grid; place-items: center; border: 1px solid rgba(var(--h-copper-rgb),.4); border-radius: 50%; color: var(--h-copper); background: rgba(var(--h-copper-rgb),.09); }
.heat-story-complete > span svg { width: 38px; }
.heat-story-complete h1 { max-width: 800px; margin: 10px 0; font-size: 36px; line-height: 1.15; }
.heat-story-complete p { max-width: 760px; margin: 0; color: var(--h-muted); font-size: 16px; }
.heat-story-complete > div { display: flex; gap: 10px; margin-top: 22px; }
.heat-story-complete button { display: flex; align-items: center; gap: 7px; padding: 10px 14px; border: 1px solid rgba(var(--h-copper-rgb),.38); border-radius: 10px; background: rgba(var(--h-copper-rgb),.08); cursor: pointer; }
.heat-story-complete button svg { width: 17px; }

@media (max-width: 1240px) {
  .heat-boundary { display: none; }
  .heat-stage-rail button em { display: none; }
  .heat-passport-grid, .heat-load-grid, .heat-journey-grid, .heat-soft-grid,
  .heat-investigation-grid, .heat-release-grid { grid-template-columns: 1fr; }
  .heat-release-package { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 900px) {
  .heat-shell { grid-template-rows: 72px 92px minmax(0,1fr); }
  .heat-brand { min-width: 0; }
  .heat-brand small, .heat-progress { display: none; }
  .heat-stage-rail { padding-inline: 8px; }
  .heat-stage-rail button { display: flex; justify-content: center; padding: 8px 4px; }
  .heat-stage-rail button > div { display: none; }
  .heat-context-bar { grid-template-columns: 1fr 1fr; }
  .heat-context-bar > div:nth-child(n+3), .heat-context-bar > span { display: none; }
  .heat-stage-hero { grid-template-columns: 1fr; }
  .heat-chamber { grid-template-columns: 1fr; }
  .heat-chamber > section, .heat-risk-map > div { grid-template-columns: repeat(2,1fr); }
  .heat-event-strip, .heat-sampling-plan > div, .heat-release-package { grid-template-columns: 1fr; }
  .heat-stage-actions { align-items: stretch; flex-direction: column; }
  .heat-primary-action { width: 100%; min-width: 0; margin-left: 0; }
}
`;
