export const experienceStyles = `
:host {
  all: initial;
  color-scheme: dark;
}

*, *::before, *::after {
  box-sizing: border-box;
}

button, input, select {
  font: inherit;
}

button {
  color: inherit;
}

.solera-experience {
  --exp-bg: #07090d;
  --exp-panel: #10141b;
  --exp-panel-raised: #151a22;
  --exp-border: rgba(255, 255, 255, 0.09);
  --exp-border-strong: rgba(255, 255, 255, 0.16);
  --exp-text: #f5f4ef;
  --exp-muted: #8e96a3;
  --exp-dim: #606875;
  --exp-amber: #e6a84c;
  --exp-amber-bright: #ffc66e;
  --exp-cyan: #55d6dc;
  --exp-magenta: #df6bd5;
  --exp-green: #62d79b;
  --exp-red: #ff6b70;
  position: relative;
  display: grid;
  grid-template: 66px minmax(0, 1fr) 72px / 68px minmax(0, 1fr);
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    radial-gradient(circle at 52% -18%, rgba(230, 168, 76, 0.1), transparent 32%),
    linear-gradient(145deg, #090c11 0%, var(--exp-bg) 60%);
  color: var(--exp-text);
  font: 400 13px/1.45 Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  letter-spacing: 0.01em;
}

.exp-topbar {
  z-index: 20;
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  min-width: 0;
  border-bottom: 1px solid var(--exp-border);
  background: rgba(9, 12, 17, 0.92);
  backdrop-filter: blur(22px);
}

.exp-brand {
  display: flex;
  align-items: center;
  width: 236px;
  height: 100%;
  padding: 0 24px 0 18px;
  border: 0;
  border-right: 1px solid var(--exp-border);
  background: transparent;
  cursor: pointer;
}

.exp-brand > i {
  display: grid;
  place-items: center;
  width: 35px;
  height: 35px;
  border: 1px solid rgba(230, 168, 76, 0.45);
  border-radius: 50% 50% 46% 54%;
  background:
    radial-gradient(circle at 30% 25%, #ffd894, #b96b24 55%, #59331d 100%);
  box-shadow: 0 0 28px rgba(230, 168, 76, 0.18);
  color: #211206;
  font-style: normal;
  font-weight: 900;
}

.exp-brand > span {
  display: grid;
  margin-left: 11px;
  text-align: left;
  line-height: 1;
}

.exp-brand strong {
  font-size: 15px;
  letter-spacing: 0.28em;
}

.exp-brand small {
  margin-top: 5px;
  color: var(--exp-amber);
  font-size: 8px;
  letter-spacing: 0.34em;
}

.exp-context {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  padding: 0 24px;
  color: var(--exp-muted);
  font-size: 11px;
}

.exp-context strong {
  overflow: hidden;
  max-width: 180px;
  color: #d9dce1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exp-context b {
  color: var(--exp-dim);
}

.exp-live-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  color: var(--exp-muted);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.exp-live-controls button {
  padding: 5px 8px;
  border: 1px solid var(--exp-border);
  border-radius: 6px;
  background: rgba(255,255,255,.025);
  color: #c9cdd2;
  font-size: 9px;
  cursor: pointer;
}

.exp-live-controls button:hover {
  border-color: rgba(230,168,76,.4);
}

.exp-demo-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border: 1px solid rgba(230, 168, 76, 0.34);
  border-radius: 999px;
  background: rgba(230, 168, 76, 0.08);
  color: var(--exp-amber-bright);
  font-weight: 700;
  letter-spacing: .12em;
}

.exp-demo-badge::before {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--exp-green);
  box-shadow: 0 0 8px var(--exp-green);
  content: "";
  animation: exp-live-pulse 1s ease-in-out infinite;
}

.exp-role-select {
  display: grid;
  gap: 1px;
  margin: 0 14px 0 22px;
  color: var(--exp-muted);
  font-size: 8px;
  text-transform: uppercase;
}

.exp-role-select select {
  width: 154px;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--exp-text);
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
}

.exp-close {
  align-self: stretch;
  width: 56px;
  border: 0;
  border-left: 1px solid var(--exp-border);
  background: transparent;
  color: var(--exp-muted);
  font-size: 25px;
  font-weight: 200;
  cursor: pointer;
}

.exp-close:hover {
  background: rgba(255,255,255,.05);
  color: white;
}

.exp-rail {
  z-index: 11;
  grid-row: 2 / 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  padding: 18px 0 86px;
  border-right: 1px solid var(--exp-border);
  background: rgba(8, 11, 15, 0.72);
}

.exp-rail button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: #78818e;
  font-size: 17px;
  cursor: pointer;
}

.exp-rail button:hover,
.exp-rail button.active {
  border-color: rgba(230,168,76,.25);
  background: rgba(230,168,76,.09);
  color: var(--exp-amber-bright);
}

.exp-rail span {
  flex: 1;
}

.exp-main {
  grid-column: 2;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: #3d4249 transparent;
}

.exp-main::-webkit-scrollbar {
  width: 8px;
}

.exp-main::-webkit-scrollbar-thumb {
  border-radius: 99px;
  background: #333943;
}

.exp-page {
  width: min(1600px, calc(100% - 64px));
  min-height: 100%;
  margin: 0 auto;
  padding: 34px 0 52px;
}

.exp-hero,
.exp-page-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 28px;
}

.exp-hero > div > span,
.exp-page-title > div > span,
.exp-section-header > div > span {
  color: var(--exp-amber);
  font-size: 9px;
  font-weight: 750;
  letter-spacing: .22em;
}

.exp-hero h1,
.exp-page-title h1 {
  margin: 5px 0 3px;
  font-size: clamp(27px, 2.3vw, 40px);
  font-weight: 400;
  letter-spacing: -.035em;
  line-height: 1.08;
}

.exp-hero p,
.exp-page-title p {
  margin: 7px 0 0;
  color: var(--exp-muted);
  font-size: 12px;
}

.exp-hero > button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px 10px 10px;
  border: 1px solid rgba(230, 168, 76, .38);
  border-radius: 9px;
  background: linear-gradient(135deg, rgba(230,168,76,.13), rgba(230,168,76,.04));
  color: var(--exp-amber-bright);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.exp-hero > button i {
  display: grid;
  place-items: center;
  width: 23px;
  height: 23px;
  border-radius: 6px;
  background: var(--exp-amber);
  color: #221509;
  font-size: 15px;
  font-style: normal;
}

.exp-kpi-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 15px;
}

.exp-kpi-row-compact {
  grid-template-columns: repeat(3, minmax(0,1fr));
}

.exp-kpi-card {
  position: relative;
  min-height: 134px;
  overflow: hidden;
  padding: 17px 18px;
  border: 1px solid var(--exp-border);
  border-radius: 10px;
  background:
    linear-gradient(135deg, rgba(255,255,255,.035), transparent 52%),
    var(--exp-panel);
}

.exp-kpi-card::after {
  position: absolute;
  right: -30px;
  bottom: -55px;
  width: 120px;
  height: 120px;
  border: 1px solid rgba(255,255,255,.04);
  border-radius: 50%;
  content: "";
}

.exp-kpi-card.exp-tone-warning {
  border-color: rgba(230, 168, 76, .22);
}

.exp-kpi-card.exp-tone-critical {
  border-color: rgba(255, 107, 112, .42);
  background:
    linear-gradient(135deg, rgba(255,107,112,.08), transparent 52%),
    var(--exp-panel);
}

.exp-kpi-card header {
  display: flex;
  justify-content: space-between;
  color: var(--exp-muted);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: .11em;
  text-transform: uppercase;
}

.exp-kpi-card header b {
  color: var(--exp-green);
}

.exp-kpi-card.exp-tone-warning header b {
  color: var(--exp-amber-bright);
}

.exp-kpi-card.exp-tone-critical header b {
  color: var(--exp-red);
}

.exp-kpi-value {
  display: flex;
  align-items: baseline;
  gap: 7px;
  margin-top: 14px;
}

.exp-kpi-value strong {
  font-size: clamp(24px, 2vw, 34px);
  font-weight: 420;
  letter-spacing: -.05em;
  line-height: 1;
}

.exp-kpi-value small {
  color: var(--exp-muted);
  font-size: 11px;
}

.exp-kpi-card p {
  margin: 11px 0 0;
  color: var(--exp-dim);
  font-size: 9px;
}

.exp-live-rail {
  margin-bottom: 15px;
  overflow: hidden;
  border: 1px solid var(--exp-border);
  border-radius: 10px;
  background: rgba(12, 16, 21, .96);
}

.exp-live-rail > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 30px;
  padding: 0 13px;
  border-bottom: 1px solid var(--exp-border);
}

.exp-live-rail > header > span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--exp-green);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: .13em;
}

.exp-live-rail > header > span > i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--exp-green);
  box-shadow: 0 0 9px var(--exp-green);
  animation: exp-live-pulse 1s ease-in-out infinite;
}

.exp-live-rail > header > span.paused {
  color: var(--exp-amber);
}

.exp-live-rail > header > span.paused > i {
  background: var(--exp-amber);
  box-shadow: none;
  animation: none;
}

.exp-live-rail > header > small {
  color: var(--exp-dim);
  font-size: 8px;
  letter-spacing: .07em;
}

.exp-live-rail > div {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.exp-live-metric {
  min-width: 0;
  padding: 10px 12px 9px;
  border-right: 1px solid var(--exp-border);
  background: linear-gradient(135deg, rgba(98,215,155,.025), transparent 55%);
  transition: background .25s, box-shadow .25s;
}

.exp-live-metric:last-child {
  border-right: 0;
}

.exp-live-metric.exp-tone-warning {
  background: linear-gradient(135deg, rgba(230,168,76,.16), transparent 65%);
  box-shadow: inset 0 2px 0 rgba(230,168,76,.5);
}

.exp-live-metric.exp-tone-critical {
  background: linear-gradient(135deg, rgba(255,107,112,.2), transparent 65%);
  box-shadow: inset 0 2px 0 rgba(255,107,112,.72);
}

.exp-live-metric > header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: var(--exp-muted);
  font-size: 7px;
  letter-spacing: .07em;
  text-transform: uppercase;
}

.exp-live-metric > header b {
  color: var(--exp-dim);
  font-size: 7px;
}

.exp-live-metric > div {
  display: grid;
  grid-template-columns: auto minmax(45px, 1fr);
  align-items: center;
  gap: 9px;
  min-height: 45px;
}

.exp-live-metric > div > strong {
  white-space: nowrap;
  font-size: clamp(15px, 1.35vw, 21px);
  font-weight: 430;
  letter-spacing: -.035em;
  animation: exp-value-flash .55s ease-out;
}

.exp-live-metric > div > strong small {
  margin-left: 3px;
  color: var(--exp-muted);
  font-size: 7px;
  letter-spacing: 0;
}

.exp-live-metric .exp-sparkline {
  height: 32px;
}

.exp-live-metric > p {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  color: var(--exp-green);
  font-size: 7px;
  font-weight: 650;
}

.exp-live-metric > p > i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.exp-live-metric.exp-tone-warning > p {
  color: var(--exp-amber-bright);
}

.exp-live-metric.exp-tone-critical > p {
  color: var(--exp-red);
}

.exp-home-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(275px, .72fr);
  gap: 15px;
}

.exp-panel {
  border: 1px solid var(--exp-border);
  border-radius: 12px;
  background: rgba(15, 19, 25, .94);
}

.exp-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 17px 19px;
  border-bottom: 1px solid var(--exp-border);
}

.exp-panel-header > div > span,
.exp-panel-header > span {
  color: var(--exp-muted);
  font-size: 8px;
  font-weight: 750;
  letter-spacing: .16em;
}

.exp-panel-header h3 {
  margin: 3px 0 0;
  font-size: 14px;
  font-weight: 560;
}

.exp-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  color: var(--exp-muted);
  font-size: 8px;
  font-weight: 750;
  letter-spacing: .07em;
  text-transform: uppercase;
}

.exp-status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--exp-dim);
  box-shadow: 0 0 0 3px rgba(255,255,255,.04);
}

.exp-status-healthy i { background: var(--exp-green); box-shadow: 0 0 0 3px rgba(98,215,155,.1); }
.exp-status-warning i { background: var(--exp-amber); box-shadow: 0 0 0 3px rgba(230,168,76,.1); }
.exp-status-critical i { background: var(--exp-red); box-shadow: 0 0 0 3px rgba(255,107,112,.1); }

.exp-energy-network {
  position: relative;
  min-height: clamp(380px, calc(100vh - 650px), 470px);
  overflow: hidden;
  background:
    radial-gradient(circle at center, rgba(230,168,76,.09), transparent 22%),
    linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px);
  background-size: auto, 30px 30px, 30px 30px;
}

.exp-energy-network::before,
.exp-energy-network::after {
  position: absolute;
  inset: 50% auto auto 50%;
  width: 310px;
  height: 310px;
  transform: translate(-50%,-50%);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 50%;
  content: "";
}

.exp-energy-network::after {
  width: 210px;
  height: 210px;
  border-style: dashed;
}

.exp-network-center {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  display: grid;
  place-items: center;
  width: 132px;
  height: 132px;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(230,168,76,.34);
  border-radius: 50%;
  background: radial-gradient(circle at 32% 25%, #372c1c, #121317 61%, #080a0d);
  box-shadow: 0 0 55px rgba(230,168,76,.13), inset 0 0 22px rgba(230,168,76,.08);
}

.exp-network-center span {
  margin-top: 22px;
  color: var(--exp-muted);
  font-size: 8px;
  letter-spacing: .18em;
}

.exp-network-center strong {
  margin-top: -7px;
  font-size: 38px;
  font-weight: 300;
  letter-spacing: -.08em;
}

.exp-network-center strong small {
  margin-left: 5px;
  color: var(--exp-amber);
  font-size: 9px;
  letter-spacing: .08em;
}

.exp-network-center > i {
  width: 36px;
  height: 2px;
  margin-bottom: 18px;
  background: var(--exp-amber);
  box-shadow: 0 0 10px var(--exp-amber);
}

.exp-network-lines i {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  width: 190px;
  height: 1px;
  transform-origin: 0 center;
  background: linear-gradient(90deg, rgba(230,168,76,.45), rgba(85,214,220,.05));
}

.exp-network-lines i:nth-child(1) { transform: rotate(-116deg); }
.exp-network-lines i:nth-child(2) { transform: rotate(-39deg); }
.exp-network-lines i:nth-child(3) { transform: rotate(4deg); }
.exp-network-lines i:nth-child(4) { transform: rotate(44deg); }
.exp-network-lines i:nth-child(5) { transform: rotate(133deg); }

.exp-network-node {
  position: absolute;
  z-index: 5;
  display: grid;
  grid-template: auto auto / 58px 1fr;
  gap: 0 10px;
  width: 145px;
  padding: 10px;
  border: 1px solid var(--exp-border);
  border-radius: 9px;
  background: rgba(14,18,24,.9);
  text-align: left;
  cursor: pointer;
  transition: border-color .2s, transform .2s;
}

.exp-network-node:hover {
  transform: translateY(-3px);
  border-color: rgba(230,168,76,.4);
}

.exp-network-node .exp-asset-glyph {
  grid-row: 1 / 5;
}

.exp-network-node > span {
  color: var(--exp-muted);
  font-size: 8px;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.exp-network-node > strong {
  font-size: 18px;
  font-weight: 450;
}

.exp-network-node > small {
  color: var(--exp-dim);
  font-size: 8px;
}

.exp-network-node.node-1 { top: 8%; left: 18%; }
.exp-network-node.node-2 { top: 10%; right: 13%; }
.exp-network-node.node-3 { top: 43%; right: 4%; }
.exp-network-node.node-4 { right: 16%; bottom: 8%; }
.exp-network-node.node-5 { bottom: 9%; left: 13%; }

.exp-alert-panel {
  display: flex;
  flex-direction: column;
}

.exp-alert-panel .exp-panel-header > b {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(230,168,76,.12);
  color: var(--exp-amber-bright);
}

.exp-alert-list {
  display: grid;
  padding: 6px 14px;
}

.exp-alert-list button {
  display: grid;
  grid-template-columns: 7px minmax(0,1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 15px 4px;
  border: 0;
  border-bottom: 1px solid var(--exp-border);
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.exp-alert-list button:hover strong {
  color: var(--exp-amber-bright);
}

.exp-alert-list button > i,
.exp-concept-list > div > i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.severity-high { background: var(--exp-red); }
.severity-medium { background: var(--exp-amber); }
.severity-low { background: var(--exp-cyan); }

.exp-alert-list button > span {
  display: grid;
  min-width: 0;
}

.exp-alert-list strong {
  overflow: hidden;
  font-size: 10px;
  font-weight: 560;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exp-alert-list small,
.exp-alert-list time {
  color: var(--exp-muted);
  font-size: 8px;
}

.exp-mini-performance {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  margin: auto 14px 14px;
  overflow: hidden;
  border: 1px solid var(--exp-border);
  border-radius: 8px;
  background: var(--exp-border);
}

.exp-mini-performance > div {
  display: grid;
  gap: 5px;
  padding: 16px;
  background: var(--exp-panel-raised);
}

.exp-mini-performance span {
  color: var(--exp-muted);
  font-size: 8px;
  letter-spacing: .12em;
}

.exp-mini-performance strong {
  font-size: 16px;
  font-weight: 430;
}

.exp-bottom-nav {
  z-index: 12;
  grid-column: 2;
  display: grid;
  grid-template-columns: repeat(9, minmax(72px, 1fr));
  border-top: 1px solid var(--exp-border);
  background: rgba(8,11,15,.94);
  backdrop-filter: blur(20px);
}

.exp-bottom-nav button {
  position: relative;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 5px;
  border: 0;
  border-right: 1px solid rgba(255,255,255,.035);
  background: transparent;
  color: var(--exp-muted);
  font-size: 9px;
  cursor: pointer;
}

.exp-bottom-nav button::before {
  position: absolute;
  top: 0;
  right: 22%;
  left: 22%;
  height: 2px;
  transform: scaleX(0);
  background: var(--exp-amber);
  box-shadow: 0 0 10px var(--exp-amber);
  content: "";
  transition: transform .2s;
}

.exp-bottom-nav button:hover,
.exp-bottom-nav button.active {
  background: linear-gradient(180deg, rgba(230,168,76,.08), transparent);
  color: var(--exp-text);
}

.exp-bottom-nav button.active::before {
  transform: scaleX(1);
}

.exp-bottom-nav i {
  color: var(--exp-amber);
  font-size: 17px;
  font-style: normal;
}

.exp-page-summary {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid var(--exp-border);
  border-radius: 8px;
}

.exp-page-summary strong {
  color: var(--exp-amber-bright);
  font-size: 23px;
  font-weight: 420;
}

.exp-page-summary span {
  color: var(--exp-muted);
  font-size: 9px;
}

.exp-site-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 14px;
}

.exp-site-card {
  min-height: 270px;
  padding: 18px;
  border: 1px solid var(--exp-border);
  border-radius: 11px;
  background:
    linear-gradient(145deg, rgba(255,255,255,.03), transparent 46%),
    var(--exp-panel);
  text-align: left;
  cursor: pointer;
  transition: transform .2s, border-color .2s;
}

.exp-site-card:hover {
  transform: translateY(-3px);
  border-color: rgba(230,168,76,.32);
}

.exp-site-card > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.exp-site-card > header span:first-child {
  color: var(--exp-muted);
  font-size: 8px;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.exp-site-card h3 {
  margin: 4px 0 0;
  font-size: 15px;
  font-weight: 540;
}

.exp-site-visual {
  display: grid;
  grid-template-columns: 1fr 120px;
  align-items: center;
  min-height: 145px;
}

.exp-site-card > dl {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 1px;
  margin: 0;
  border-top: 1px solid var(--exp-border);
}

.exp-site-card > dl div {
  display: grid;
  gap: 4px;
  padding: 13px 8px 0 0;
}

.exp-site-card dt {
  color: var(--exp-muted);
  font-size: 8px;
}

.exp-site-card dd {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
}

.exp-site-construction {
  display: grid;
  place-content: center;
  justify-items: center;
  background: rgba(255,255,255,.012);
  color: var(--exp-muted);
  text-align: center;
}

.exp-site-construction > i {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 15px;
  border: 1px dashed rgba(230,168,76,.38);
  border-radius: 50%;
  color: var(--exp-amber);
  font-size: 21px;
  font-style: normal;
}

.exp-site-construction strong {
  color: var(--exp-text);
  font-size: 13px;
}

.exp-site-construction span {
  margin-top: 6px;
  font-size: 9px;
}

.exp-asset-glyph {
  position: relative;
  width: 100px;
  height: 92px;
  filter: drop-shadow(0 16px 18px rgba(0,0,0,.25));
}

.exp-asset-glyph > span,
.exp-asset-glyph > i,
.exp-asset-glyph > b {
  position: absolute;
  display: block;
  transform: rotateX(56deg) rotateZ(-36deg);
  border: 1px solid rgba(85,214,220,.42);
  background: linear-gradient(135deg, rgba(85,214,220,.32), rgba(85,214,220,.05));
  box-shadow: inset 0 0 20px rgba(85,214,220,.08);
}

.exp-asset-glyph > span {
  top: 24px;
  left: 19px;
  width: 66px;
  height: 42px;
}

.exp-asset-glyph > i {
  top: 7px;
  left: 39px;
  width: 42px;
  height: 31px;
}

.exp-asset-glyph > b {
  top: 44px;
  left: 9px;
  width: 33px;
  height: 27px;
}

.exp-asset-wind > span {
  top: 36px;
  left: 49px;
  width: 4px;
  height: 50px;
  transform: none;
  border: 0;
  background: linear-gradient(#55d6dc, transparent);
}

.exp-asset-wind > i,
.exp-asset-wind > b {
  top: 25px;
  left: 48px;
  width: 43px;
  height: 2px;
  transform-origin: 0;
  transform: rotate(-27deg);
  border: 0;
  background: var(--exp-cyan);
}

.exp-asset-wind > b { transform: rotate(95deg); }

.exp-asset-hydrogen > span {
  top: 23px;
  left: 23px;
  width: 58px;
  height: 56px;
  transform: none;
  border-radius: 50% 50% 24% 24%;
}

.exp-asset-hydrogen > i {
  top: 9px;
  left: 42px;
  width: 20px;
  height: 30px;
  transform: none;
}

.exp-asset-hydrogen > b {
  top: 47px;
  left: 38px;
  width: 29px;
  height: 2px;
  transform: none;
  border: 0;
  background: var(--exp-cyan);
}

.exp-asset-thermal > span,
.exp-asset-storage > span {
  top: 27px;
  left: 14px;
  width: 72px;
  height: 49px;
}

.exp-gauge {
  position: relative;
  display: grid;
  justify-items: center;
  width: 120px;
}

.exp-gauge svg {
  width: 112px;
  overflow: visible;
}

.exp-gauge path {
  fill: none;
  stroke-width: 7px;
  stroke-linecap: round;
}

.exp-gauge-track { stroke: rgba(255,255,255,.07); }
.exp-gauge-value { stroke: var(--exp-green); }
.exp-gauge-warning .exp-gauge-value { stroke: var(--exp-amber); }
.exp-gauge-critical .exp-gauge-value { stroke: var(--exp-red); }

.exp-gauge > strong {
  position: absolute;
  top: 35px;
  font-size: 20px;
  font-weight: 430;
}

.exp-gauge > strong small {
  margin-left: 2px;
  color: var(--exp-muted);
  font-size: 8px;
}

.exp-gauge > span {
  margin-top: -10px;
  color: var(--exp-muted);
  font-size: 8px;
}

.exp-site-title-metrics {
  display: flex;
  align-items: center;
  gap: 26px;
}

.exp-site-title-metrics > div:not(.exp-gauge) {
  display: grid;
  gap: 4px;
  padding-left: 24px;
  border-left: 1px solid var(--exp-border);
}

.exp-site-title-metrics span {
  color: var(--exp-muted);
  font-size: 8px;
  text-transform: uppercase;
}

.exp-site-title-metrics strong {
  font-size: 18px;
  font-weight: 450;
}

.exp-operation-grid {
  display: grid;
  grid-template-columns: minmax(0,1.7fr) minmax(300px,.8fr);
  gap: 14px;
}

.exp-chart-panel,
.exp-bar-panel {
  min-height: 330px;
}

.exp-chart-legend {
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--exp-muted);
  font-size: 8px;
}

.exp-chart-legend span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.exp-chart-legend i {
  width: 13px;
  height: 2px;
}

.exp-chart-legend .primary { background: var(--exp-cyan); }
.exp-chart-legend .previous {
  height: 0;
  border-top: 1px dashed #777f8c;
  background: transparent;
}
.exp-chart-legend .secondary { background: var(--exp-magenta); }

.exp-line-chart {
  min-height: 260px;
  padding: 8px 13px 14px;
}

.exp-line-chart svg {
  display: block;
  width: 100%;
  height: 250px;
}

.exp-line-chart .grid {
  stroke: rgba(255,255,255,.055);
  stroke-width: 1;
}

.exp-line-chart polyline {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.2;
  vector-effect: non-scaling-stroke;
}

.exp-line-chart .primary-line {
  stroke: var(--exp-cyan);
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  filter: drop-shadow(0 0 5px rgba(85,214,220,.25));
  animation: exp-line-reveal .8s ease-out;
}

.exp-line-chart .previous-line {
  stroke: #78818e;
  stroke-dasharray: 5 7;
  opacity: .48;
}

.exp-line-chart .secondary-line {
  stroke: var(--exp-magenta);
  stroke-dasharray: 6 5;
  opacity: .8;
}

.exp-line-chart text {
  fill: var(--exp-muted);
  font-size: 9px;
}

@keyframes exp-line-reveal {
  from {
    stroke-dashoffset: 1;
    opacity: .35;
  }
  to {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

@keyframes exp-value-flash {
  from {
    color: white;
    text-shadow: 0 0 12px rgba(85,214,220,.85);
    transform: translateY(-1px);
  }
  to {
    color: inherit;
    text-shadow: none;
    transform: translateY(0);
  }
}

@keyframes exp-live-pulse {
  0%, 100% {
    opacity: .45;
    transform: scale(.82);
  }
  50% {
    opacity: 1;
    transform: scale(1.18);
  }
}

.exp-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 250px;
  padding: 26px 18px 25px;
}

.exp-bar-column {
  position: relative;
  display: flex;
  align-items: flex-end;
  flex: 1;
  height: 100%;
}

.exp-bar-column i {
  width: 100%;
  min-height: 4px;
  border-radius: 2px 2px 0 0;
  background: linear-gradient(180deg, var(--exp-amber), rgba(230,168,76,.22));
}

.exp-bar-column span {
  position: absolute;
  bottom: -16px;
  left: 0;
  color: var(--exp-muted);
  font-size: 7px;
}

.exp-section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin: 33px 0 14px;
}

.exp-section-header h2 {
  margin: 3px 0 0;
  font-size: 20px;
  font-weight: 450;
}

.exp-asset-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 12px;
}

.exp-asset-card {
  min-width: 0;
  padding: 15px;
  border: 1px solid var(--exp-border);
  border-radius: 10px;
  background: var(--exp-panel);
  text-align: left;
}

.exp-asset-card[role="button"] {
  cursor: pointer;
}

.exp-asset-card[role="button"]:hover {
  border-color: rgba(85,214,220,.3);
}

.exp-asset-card > header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.exp-asset-card > header span:first-child {
  color: var(--exp-muted);
  font-size: 8px;
  letter-spacing: .12em;
}

.exp-asset-card h3 {
  margin: 3px 0 0;
  font-size: 12px;
  font-weight: 560;
}

.exp-asset-visual {
  display: grid;
  grid-template-columns: 105px 1fr;
  align-items: center;
  min-height: 112px;
}

.exp-sparkline {
  width: 100%;
  height: 52px;
}

.exp-sparkline polyline {
  stroke: var(--exp-green);
  stroke-width: 1.5;
}

.exp-sparkline-warning polyline { stroke: var(--exp-amber); }
.exp-sparkline-critical polyline { stroke: var(--exp-red); }
.exp-sparkline-neutral polyline { stroke: var(--exp-cyan); }

.exp-asset-metrics {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  border-top: 1px solid var(--exp-border);
}

.exp-asset-metrics .exp-gauge {
  transform: scale(.78);
  transform-origin: left center;
}

.exp-asset-metrics dl {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 5px;
  margin: 0;
  font-size: 8px;
}

.exp-asset-metrics dt { color: var(--exp-muted); }
.exp-asset-metrics dd { margin: 0; font-weight: 650; }

.exp-asset-detail-grid {
  display: grid;
  grid-template-columns: minmax(290px,.7fr) minmax(420px,1.2fr) minmax(260px,.65fr);
  gap: 14px;
}

.exp-asset-detail-grid > .exp-chart-panel {
  grid-column: 1 / -1;
}

.exp-asset-hero-card {
  display: grid;
  grid-template-columns: 110px 1fr;
  align-content: center;
  align-items: center;
  min-height: 270px;
  padding: 24px;
}

.exp-asset-hero-card > div:nth-child(2) {
  display: grid;
}

.exp-asset-hero-card > div:nth-child(2) > span {
  color: var(--exp-muted);
  font-size: 8px;
  letter-spacing: .12em;
}

.exp-asset-hero-card > div:nth-child(2) > strong {
  margin-top: 5px;
  font-size: 32px;
  font-weight: 420;
}

.exp-asset-hero-card strong small {
  margin-left: 4px;
  color: var(--exp-muted);
  font-size: 10px;
}

.exp-asset-hero-card p {
  margin: 3px 0 0;
  color: var(--exp-green);
  font-size: 9px;
}

.exp-asset-hero-card > .exp-gauge {
  grid-column: 1 / -1;
  justify-self: center;
  margin-top: 12px;
}

.exp-status-matrix {
  overflow: hidden;
}

.exp-status-matrix > div {
  display: grid;
  grid-template-columns: 7px minmax(100px,1fr) 70px 120px;
  align-items: center;
  gap: 10px;
  padding: 8px 18px;
  border-bottom: 1px solid var(--exp-border);
}

.exp-status-matrix > div > i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.tone-healthy { background: var(--exp-green); }
.tone-warning { background: var(--exp-amber); }
.tone-critical { background: var(--exp-red); }
.tone-neutral { background: var(--exp-cyan); }

.exp-status-matrix > div > span {
  color: var(--exp-muted);
  font-size: 9px;
}

.exp-status-matrix > div > strong {
  font-size: 10px;
}

.exp-status-matrix .exp-sparkline {
  height: 30px;
}

.exp-maintenance-card dl {
  display: grid;
  gap: 1px;
  margin: 0;
}

.exp-maintenance-card dl > div {
  display: flex;
  justify-content: space-between;
  padding: 15px 18px;
  border-bottom: 1px solid var(--exp-border);
}

.exp-maintenance-card dt {
  color: var(--exp-muted);
  font-size: 9px;
}

.exp-maintenance-card dd {
  margin: 0;
  font-size: 10px;
  font-weight: 600;
}

.exp-map-panel {
  position: relative;
  min-height: 640px;
  overflow: hidden;
  border: 1px solid var(--exp-border);
  border-radius: 13px;
  background:
    radial-gradient(circle at 50% 48%, rgba(85,214,220,.1), transparent 28%),
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px),
    #0d1117;
  background-size: auto, 40px 40px, 40px 40px, auto;
}

.exp-map-orbit i {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 70%;
  height: 32%;
  transform: translate(-50%,-50%) rotate(-8deg);
  border: 1px solid rgba(85,214,220,.14);
  border-radius: 50%;
}

.exp-map-orbit i:nth-child(2) { width: 48%; height: 51%; transform: translate(-50%,-50%) rotate(33deg); }
.exp-map-orbit i:nth-child(3) { width: 32%; height: 68%; transform: translate(-50%,-50%) rotate(-43deg); }

.exp-map-site {
  position: absolute;
  display: grid;
  grid-template: auto auto / 75px 1fr;
  align-items: center;
  width: 185px;
  padding: 10px;
  border: 1px solid var(--exp-border);
  border-radius: 10px;
  background: rgba(13,17,23,.9);
  text-align: left;
  cursor: pointer;
}

.exp-map-site:hover { border-color: rgba(85,214,220,.36); }
.exp-map-site .exp-asset-glyph { grid-row: 1 / 4; width: 70px; transform: scale(.72); transform-origin: left center; }
.exp-map-site > span { font-size: 10px; font-weight: 650; }
.exp-map-site > strong { color: var(--exp-muted); font-size: 8px; }
.exp-map-site .exp-status { margin-top: 4px; }
.map-site-1 { top: 10%; left: 12%; }
.map-site-2 { top: 12%; right: 11%; }
.map-site-3 { top: 42%; left: 5%; }
.map-site-4 { top: 45%; right: 5%; }
.map-site-5 { bottom: 8%; left: 18%; }
.map-site-6 { right: 18%; bottom: 9%; }

.exp-map-total {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  place-items: center;
  width: 180px;
  height: 180px;
  transform: translate(-50%,-50%);
  border: 1px solid rgba(85,214,220,.28);
  border-radius: 50%;
  background: rgba(9,15,19,.9);
  box-shadow: 0 0 70px rgba(85,214,220,.1);
}

.exp-map-total span { color: var(--exp-muted); font-size: 8px; letter-spacing: .15em; }
.exp-map-total strong { margin-top: -45px; font-size: 23px; font-weight: 420; }

.exp-concept-badge {
  padding: 7px 11px;
  border: 1px solid rgba(223,107,213,.3);
  border-radius: 999px;
  background: rgba(223,107,213,.07);
  color: #e79edf;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .09em;
  text-transform: uppercase;
}

.exp-concept-grid {
  display: grid;
  grid-template-columns: minmax(0,1.8fr) minmax(290px,.7fr);
  gap: 14px;
}

.exp-concept-list > div {
  display: grid;
  grid-template-columns: 7px 1fr auto;
  align-items: center;
  gap: 11px;
  padding: 18px;
  border-bottom: 1px solid var(--exp-border);
}

.exp-concept-list > div > span { display: grid; }
.exp-concept-list strong { font-size: 10px; }
.exp-concept-list small { color: var(--exp-muted); font-size: 8px; }
.exp-concept-list b { color: var(--exp-amber); font-size: 8px; text-transform: uppercase; }

.exp-create-studio {
  display: grid;
  grid-template-rows: auto auto minmax(0,1fr);
  width: 100%;
  height: 100%;
}

.exp-create-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 25px;
  border-bottom: 1px solid var(--exp-border);
}

.exp-create-header > div:first-child > span {
  color: var(--exp-amber);
  font-size: 8px;
  font-weight: 750;
  letter-spacing: .18em;
}

.exp-create-header h2 {
  margin: 4px 0 0;
  font-size: 21px;
  font-weight: 430;
}

.exp-create-header p {
  margin: 3px 0 0;
  color: var(--exp-muted);
  font-size: 9px;
}

.exp-create-actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.exp-create-actions label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 9px;
  color: var(--exp-muted);
  font-size: 9px;
}

.exp-create-actions button {
  padding: 8px 13px;
  border: 1px solid var(--exp-border-strong);
  border-radius: 7px;
  background: rgba(255,255,255,.03);
  font-size: 9px;
  cursor: pointer;
}

.exp-create-actions button.primary {
  border-color: var(--exp-amber);
  background: var(--exp-amber);
  color: #211407;
  font-weight: 750;
}

.exp-studio-notice {
  display: flex;
  justify-content: space-between;
  padding: 8px 24px;
  border: 0;
  border-bottom: 1px solid rgba(98,215,155,.18);
  background: rgba(98,215,155,.08);
  color: #b6f1d1;
  font-size: 9px;
  cursor: pointer;
}

.exp-studio-notice span {
  color: var(--exp-muted);
}

.exp-studio-layout {
  display: grid;
  grid-template-columns: 210px minmax(500px,1fr) 220px;
  min-height: 0;
  overflow: hidden;
}

.exp-widget-palette,
.exp-properties-panel {
  min-height: 0;
  overflow-y: auto;
  border-right: 1px solid var(--exp-border);
  background: #0c0f14;
}

.exp-properties-panel {
  border-right: 0;
  border-left: 1px solid var(--exp-border);
}

.exp-widget-palette > header,
.exp-properties-panel > header {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid var(--exp-border);
  color: var(--exp-muted);
  font-size: 8px;
  letter-spacing: .12em;
}

.exp-widget-palette > button {
  display: grid;
  grid-template-columns: 32px 1fr auto;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 11px 14px;
  border: 0;
  border-bottom: 1px solid rgba(255,255,255,.045);
  background: transparent;
  text-align: left;
  cursor: grab;
}

.exp-widget-palette > button:hover {
  background: rgba(230,168,76,.06);
}

.exp-widget-palette > button > i {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--exp-border);
  border-radius: 6px;
  color: var(--exp-cyan);
  font-size: 14px;
  font-style: normal;
}

.exp-widget-palette > button > span {
  display: grid;
}

.exp-widget-palette strong {
  font-size: 9px;
}

.exp-widget-palette small {
  color: var(--exp-muted);
  font-size: 7px;
}

.exp-widget-palette > button > b {
  color: var(--exp-muted);
}

.exp-studio-canvas {
  min-height: 0;
  overflow: auto;
  padding: 20px;
  background: #080b0f;
}

.exp-studio-canvas.show-grid {
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 16px 16px;
}

.exp-studio-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px,1fr));
  grid-auto-rows: 160px;
  gap: 10px;
  min-width: 600px;
  min-height: 100%;
  padding: 10px;
  border: 1px dashed rgba(255,255,255,.1);
  border-radius: 9px;
}

.exp-studio-widget {
  padding: 11px;
  border: 1px solid var(--exp-border);
  border-radius: 7px;
  background: var(--exp-panel);
  text-align: left;
  cursor: pointer;
}

.exp-studio-widget:hover,
.exp-studio-widget.selected {
  border-color: rgba(230,168,76,.55);
  box-shadow: 0 0 0 1px rgba(230,168,76,.12);
}

.exp-studio-widget-line,
.exp-studio-widget-process {
  grid-column: span 2;
}

.exp-studio-widget > header {
  display: flex;
  justify-content: space-between;
  color: var(--exp-muted);
  font-size: 7px;
  text-transform: uppercase;
}

.exp-studio-widget h3 {
  margin: 4px 0 8px;
  font-size: 10px;
  font-weight: 550;
}

.exp-studio-drop-hint {
  display: grid;
  place-items: center;
  min-height: 150px;
  border: 1px dashed rgba(230,168,76,.2);
  border-radius: 7px;
  color: var(--exp-muted);
  font-size: 8px;
}

.studio-kpi strong { font-size: 25px; font-weight: 420; }
.studio-kpi span { margin-left: 4px; color: var(--exp-muted); font-size: 8px; }
.studio-kpi small { display: block; margin-top: 8px; color: var(--exp-green); font-size: 7px; }

.studio-gauge {
  position: relative;
  display: grid;
  place-items: center;
  height: 85px;
}

.studio-gauge i {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 8px solid var(--exp-green);
  border-right-color: rgba(255,255,255,.07);
  border-radius: 50%;
  transform: rotate(-45deg);
}

.studio-gauge strong { font-size: 16px; }

.studio-mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 73px;
}

.studio-mini-chart i {
  flex: 1;
  min-height: 4px;
  background: linear-gradient(var(--exp-cyan), rgba(85,214,220,.16));
}

.studio-mini-line i {
  width: 8px;
  flex: none;
  transform: skewY(-25deg);
  background: var(--exp-magenta);
}

.studio-status-list { display: grid; gap: 8px; }
.studio-status-list span { display: flex; align-items: center; gap: 6px; color: var(--exp-muted); font-size: 8px; }
.studio-status-list i { width: 6px; height: 6px; border-radius: 50%; }
.studio-status-list i.healthy { background: var(--exp-green); }
.studio-status-list i.warning { background: var(--exp-amber); }

.studio-asset-preview { display: grid; grid-template-columns: 30px 1fr; align-items: center; }
.studio-asset-preview i { grid-row: 1 / 3; width: 22px; height: 22px; border: 1px solid var(--exp-cyan); transform: rotate(45deg); }
.studio-asset-preview b { font-size: 9px; }
.studio-asset-preview span { color: var(--exp-amber); font-size: 7px; }

.studio-process-preview { display: flex; align-items: center; justify-content: space-around; height: 70px; }
.studio-process-preview > * { width: 18px; height: 18px; border: 1px solid var(--exp-cyan); border-radius: 50%; background: rgba(85,214,220,.12); }
.studio-process-preview > span { border-radius: 2px; transform: rotate(45deg); }
.studio-process-preview > b { border-color: var(--exp-amber); }
.studio-process-preview > em { border-color: var(--exp-magenta); }

.exp-properties-panel {
  padding-bottom: 20px;
}

.exp-properties-panel > label {
  display: grid;
  gap: 6px;
  padding: 12px 14px 0;
  color: var(--exp-muted);
  font-size: 8px;
}

.exp-properties-panel input,
.exp-properties-panel select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--exp-border);
  border-radius: 5px;
  outline: none;
  background: rgba(255,255,255,.025);
  color: var(--exp-text);
  font-size: 9px;
}

.exp-property-preview {
  margin: 17px 14px;
  padding: 13px;
  border: 1px solid var(--exp-border);
  border-radius: 6px;
}

.exp-properties-panel > button.danger {
  width: calc(100% - 28px);
  margin: 0 14px;
  padding: 8px;
  border: 1px solid rgba(255,107,112,.24);
  border-radius: 6px;
  background: rgba(255,107,112,.04);
  color: #ff999d;
  font-size: 8px;
  cursor: pointer;
}

.exp-properties-panel > p {
  padding: 15px;
  color: var(--exp-muted);
  font-size: 9px;
}

@media (max-width: 1240px) {
  .solera-experience {
    grid-template-columns: 54px minmax(0,1fr);
  }
  .exp-brand { width: 190px; }
  .exp-context { display: none; }
  .exp-page { width: calc(100% - 40px); }
  .exp-home-grid { grid-template-columns: 1fr 310px; }
  .exp-asset-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .exp-site-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .exp-operation-grid { grid-template-columns: 1fr; }
  .exp-asset-detail-grid { grid-template-columns: 1fr 1.4fr; }
  .exp-maintenance-card { grid-column: 1 / -1; }
  .exp-studio-layout { grid-template-columns: 185px minmax(500px,1fr); }
  .exp-properties-panel { display: none; }
}

@media (max-width: 1024px) {
  .exp-live-controls time,
  .exp-live-controls button:nth-of-type(2) { display: none; }
  .exp-role-select { margin-left: 10px; }
  .exp-role-select select { width: 130px; }
  .exp-kpi-row { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .exp-home-grid,
  .exp-concept-grid { grid-template-columns: 1fr; }
  .exp-bottom-nav span { display: none; }
  .exp-bottom-nav { grid-template-columns: repeat(9,1fr); }
  .exp-bottom-nav i { font-size: 16px; }
  .exp-energy-network { min-height: 420px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: .001ms !important;
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
  }
}
`;
