import type { DependencyAnalysis, RiskLevel, ScanReport } from "../types/index.js";
import { formatDate } from "../utils/formatDate.js";

export function renderHtmlReport(report: ScanReport): string {
  const dependencies = report.dependencies.map(renderDependencyRow).join("\n");
  const summaryMetrics: Array<[string, string]> = [
    ["Packages scanned", String(report.dependenciesScanned)],
    ["Deprecated", String(report.summary.deprecatedCount)],
    ["Install scripts", String(report.summary.installScriptRiskCount)],
    ["Missing licenses", String(report.summary.missingLicenseCount)],
    ["Inactive", String(report.summary.inactivePackageCount)],
    ["Metadata failures", String(report.summary.metadataFailureCount)]
  ];
  const summaryCards = summaryMetrics
    .map(([label, value]) => `<article class="metric-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`)
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>npm-package-doctor report - ${escapeHtml(report.projectName)}</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f5f7fb;
      --panel: #ffffff;
      --panel-soft: #f9fbff;
      --text: #172033;
      --muted: #64748b;
      --border: #dce3ef;
      --brand: #1769e0;
      --brand-dark: #0f3f8f;
      --low: #0f8a5f;
      --medium: #a15c00;
      --high: #bd2c2c;
      --critical: #8f1638;
      --shadow: 0 18px 42px rgba(23, 32, 51, 0.08);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
    }

    .page {
      max-width: 1180px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .hero {
      background: linear-gradient(135deg, var(--brand-dark), var(--brand));
      color: white;
      border-radius: 8px;
      padding: 36px;
      box-shadow: var(--shadow);
    }

    .hero-eyebrow {
      margin: 0 0 10px;
      color: rgba(255,255,255,0.78);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-size: clamp(32px, 5vw, 54px);
      line-height: 1.02;
      letter-spacing: 0;
    }

    .hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-top: 22px;
      color: rgba(255,255,255,0.86);
      font-size: 14px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 18px;
      margin-top: 22px;
    }

    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: var(--shadow);
      padding: 22px;
    }

    .score-card { grid-column: span 4; }
    .summary-card { grid-column: span 8; }
    .table-card { grid-column: span 12; }
    .recommendation-card { grid-column: span 12; }

    .section-title {
      margin: 0 0 16px;
      font-size: 18px;
      letter-spacing: 0;
    }

    .score {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin: 12px 0;
    }

    .score strong {
      font-size: 52px;
      line-height: 1;
    }

    .score span {
      color: var(--muted);
      font-weight: 700;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    .metric-card {
      background: var(--panel-soft);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
    }

    .metric-card span {
      display: block;
      color: var(--muted);
      font-size: 13px;
      margin-bottom: 8px;
    }

    .metric-card strong {
      font-size: 24px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0;
    }

    .badge.low { color: var(--low); background: #e8f7f1; }
    .badge.medium { color: var(--medium); background: #fff3db; }
    .badge.high { color: var(--high); background: #ffe7e7; }
    .badge.critical { color: var(--critical); background: #ffe3ec; }

    .table-wrap {
      width: 100%;
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: 8px;
    }

    table {
      width: 100%;
      min-width: 980px;
      border-collapse: collapse;
      background: white;
    }

    th, td {
      padding: 14px 16px;
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid var(--border);
      font-size: 14px;
    }

    th {
      background: var(--panel-soft);
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0;
    }

    tr:last-child td { border-bottom: 0; }
    .package-name { font-weight: 800; }
    .muted { color: var(--muted); }
    ul { margin: 0; padding-left: 18px; }
    li + li { margin-top: 6px; }

    footer {
      margin-top: 22px;
      color: var(--muted);
      text-align: center;
      font-size: 13px;
    }

    @media (max-width: 860px) {
      .hero { padding: 28px 22px; }
      .score-card, .summary-card { grid-column: span 12; }
      .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 560px) {
      .page { padding: 24px 14px; }
      .metrics { grid-template-columns: 1fr; }
      .score strong { font-size: 42px; }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <p class="hero-eyebrow">npm-package-doctor report</p>
      <h1>${escapeHtml(report.projectName)}</h1>
      <div class="hero-meta">
        <span>Created by Sri Pavan Tej Balam</span>
        <span>GitHub: @sripavantejb</span>
        <span>Generated ${escapeHtml(formatDate(report.timestamp))}</span>
      </div>
    </section>

    <section class="grid" aria-label="Project summary">
      <article class="card score-card">
        <h2 class="section-title">Overall score</h2>
        <div class="score"><strong>${report.overallScore}</strong><span>/100</span></div>
        ${riskBadge(report.overallRiskLevel)}
        <p class="muted">Project path: ${escapeHtml(report.projectPath)}</p>
        <p class="muted">Package manager: ${escapeHtml(report.packageManager)}</p>
      </article>

      <article class="card summary-card">
        <h2 class="section-title">Summary</h2>
        <div class="metrics">
          ${summaryCards}
        </div>
      </article>

      <article class="card table-card">
        <h2 class="section-title">Dependencies</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Package</th>
                <th>Type</th>
                <th>Requested</th>
                <th>Latest</th>
                <th>Score</th>
                <th>Risk</th>
                <th>Signals and recommendations</th>
              </tr>
            </thead>
            <tbody>
              ${dependencies}
            </tbody>
          </table>
        </div>
      </article>

      <article class="card recommendation-card">
        <h2 class="section-title">Project recommendations</h2>
        <ul>
          ${report.recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n")}
        </ul>
      </article>
    </section>

    <footer>
      npm-package-doctor is an independent open-source CLI for npm dependency health review.
    </footer>
  </main>
</body>
</html>
`;
}

function renderDependencyRow(dependency: DependencyAnalysis): string {
  const signals = dependency.reasons.length > 0 ? dependency.reasons : ["No major risk signals found."];
  const details = [...signals, ...dependency.recommendations.map((item) => `Recommendation: ${item}`)];

  return `<tr>
    <td><span class="package-name">${escapeHtml(dependency.name)}</span><br><span class="muted">${escapeHtml(dependency.description ?? "No description available.")}</span></td>
    <td>${escapeHtml(dependency.dependencyType)}</td>
    <td>${escapeHtml(dependency.requestedVersion)}</td>
    <td>${escapeHtml(dependency.latestVersion ?? "Unknown")}</td>
    <td><strong>${dependency.score}/100</strong></td>
    <td>${riskBadge(dependency.riskLevel)}</td>
    <td><ul>${details.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></td>
  </tr>`;
}

function riskBadge(riskLevel: RiskLevel): string {
  return `<span class="badge ${riskLevel}">${riskLevel}</span>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
