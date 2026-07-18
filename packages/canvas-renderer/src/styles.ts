export const CANVAS_STYLES = `
:host {
  all: initial;
  color-scheme: dark;
}

* {
  box-sizing: border-box;
}

.solera-canvas {
  position: fixed;
  inset: 18px;
  z-index: 2147483646;
  overflow: auto;
  border: 1px solid #474c46;
  border-radius: 14px;
  background:
    radial-gradient(circle at 82% -20%, rgb(214 139 54 / 18%), transparent 34%),
    #101310;
  box-shadow: 0 20px 80px rgb(0 0 0 / 58%);
  color: #e9e7df;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  line-height: 1.4;
}

.solera-canvas-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #30352f;
  background: rgb(16 19 16 / 92%);
  backdrop-filter: blur(14px);
}

.solera-canvas-header span,
.solera-widget > header span {
  color: #db9447;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.solera-canvas-header h2 {
  margin: 3px 0 0;
  font-family: Georgia, serif;
  font-size: 22px;
  font-weight: 400;
}

.solera-canvas-header button {
  padding: 8px 12px;
  border: 1px solid #564c3e;
  border-radius: 7px;
  background: #1d1c18;
  color: #e8d8c4;
  cursor: pointer;
  font: 600 11px Inter, ui-sans-serif, system-ui, sans-serif;
}

.solera-canvas-layout {
  display: grid;
  gap: 12px;
  padding: 14px;
}

.solera-layout-grid {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.solera-layout-stack {
  grid-template-columns: 1fr;
}

.solera-widget {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #30362f;
  border-radius: 10px;
  background: linear-gradient(145deg, #191d19, #141714);
}

.solera-widget-timeseries,
.solera-widget-table {
  grid-column: span 2;
}

.solera-widget > header {
  padding: 11px 13px 0;
}

.solera-widget > header h3 {
  margin: 2px 0 0;
  color: #e4e2da;
  font-size: 13px;
  font-weight: 600;
}

.solera-widget-body {
  min-height: 86px;
  padding: 12px 13px 14px;
}

.solera-chart {
  color: #849089;
  font-size: 10px;
}

.solera-chart svg {
  display: block;
  width: 100%;
  min-height: 210px;
}

.solera-chart text {
  fill: #849089;
  font: 10px Inter, ui-sans-serif, system-ui, sans-serif;
}

.solera-chart .gridline {
  stroke: #28312d;
  stroke-width: 1;
}

.solera-chart .axis {
  stroke: #48534e;
  stroke-width: 1;
}

.solera-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 4px;
}

.solera-chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.solera-chart-legend i {
  width: 12px;
  height: 2px;
}

.solera-kpi {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.solera-kpi strong {
  font-family: Georgia, serif;
  font-size: 34px;
  font-weight: 400;
}

.solera-kpi span,
.solera-widget-body p {
  color: #8f9992;
  font-size: 11px;
}

.solera-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.solera-status > span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #869087;
}

.solera-status-healthy > span { background: #59c8aa; }
.solera-status-warning > span { background: #e4a34d; }
.solera-status-critical > span { background: #df7068; }

.solera-table-wrap {
  max-height: 320px;
  overflow: auto;
}

.solera-table-wrap table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.solera-table-wrap th,
.solera-table-wrap td {
  padding: 7px 8px;
  border-bottom: 1px solid #293029;
  text-align: left;
}

.solera-table-wrap th {
  position: sticky;
  top: 0;
  background: #191d19;
  color: #939d96;
}

.solera-asset,
.solera-evidence-list section {
  display: grid;
  grid-template-columns: 78px 1fr;
  gap: 7px;
  margin: 0;
  font-size: 11px;
}

.solera-asset dt {
  color: #7f8982;
}

.solera-asset dd {
  margin: 0;
}

.solera-evidence-list {
  display: grid;
  gap: 9px;
}

.solera-evidence-list section {
  padding-bottom: 9px;
  border-bottom: 1px solid #2b302b;
}

.solera-evidence-list span,
.solera-evidence-list code,
.solera-evidence-list small {
  color: #8c968f;
  font-size: 10px;
}

.solera-empty {
  padding: 35px 0;
  text-align: center;
}

@media (max-width: 720px) {
  .solera-canvas {
    inset: 8px;
  }
  .solera-widget-timeseries,
  .solera-widget-table {
    grid-column: span 1;
  }
}
`;
