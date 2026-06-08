import type { GridCell, SummaryMetrics } from "@/types";
import { getRankTier } from "@/types";

const DIRECTIONS = ["NW", "N", "NE", "W", "Center", "E", "SW", "S", "SE"];

const CELL_COLORS: Record<string, { bg: string; text: string }> = {
  success: { bg: "#16a34a", text: "#ffffff" },
  mid: { bg: "#ca8a04", text: "#ffffff" },
  poor: { bg: "#dc2626", text: "#ffffff" },
  notfound: { bg: "#e2e8f0", text: "#64748b" },
};

function buildCellHtml(cell: GridCell, index: number): string {
  const tier = getRankTier(cell.rank);
  const colors = CELL_COLORS[tier];
  const rankLabel = cell.rank != null ? String(Number(cell.rank)) : "N/A";
  const direction = DIRECTIONS[index] ?? "";
  return [
    `<div style="aspect-ratio:1;background:${colors.bg};color:${colors.text};`,
    "display:flex;flex-direction:column;align-items:center;justify-content:center;",
    `gap:4px;padding:8px;border-radius:3px;">`,
    `<span style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;opacity:.75;`,
    `font-family:'Inter',sans-serif;line-height:1;">${direction}</span>`,
    `<span style="font-size:26px;font-weight:800;`,
    `font-family:'JetBrains Mono','Courier New',monospace;line-height:1;">${rankLabel}</span>`,
    "</div>",
  ].join("");
}

function buildSummaryHtml(metrics: SummaryMetrics): string {
  const stats = [
    {
      label: "Avg. Rank",
      value: metrics.avgRank != null ? `#${metrics.avgRank}` : "N/A",
    },
    {
      label: "Best Rank",
      value: metrics.bestRank != null ? `#${metrics.bestRank}` : "N/A",
    },
    {
      label: "Worst Rank",
      value: metrics.worstRank != null ? `#${metrics.worstRank}` : "N/A",
    },
    { label: "% in Top 3", value: `${metrics.topThreePct}%` },
  ];

  const items = stats
    .map(({ label, value }) =>
      [
        `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:10px 14px;">`,
        `<div style="font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;`,
        `font-family:'Inter',sans-serif;margin-bottom:4px;">${label}</div>`,
        `<div style="font-size:22px;font-weight:800;color:#0f172a;`,
        `font-family:'JetBrains Mono','Courier New',monospace;line-height:1;">${value}</div>`,
        "</div>",
      ].join(""),
    )
    .join("");

  return [
    `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px;">`,
    items,
    "</div>",
  ].join("");
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function exportToPdf(
  businessName: string,
  keyword: string,
  address: string,
  date: string,
  cells: GridCell[][],
  metrics: SummaryMetrics,
): void {
  const flat = cells.flat();
  const gridCells = flat.map((c, i) => buildCellHtml(c, i)).join("");
  const summaryHtml = buildSummaryHtml(metrics);
  const generatedOn = formatDateLong(new Date());

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    window.print();
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${businessName} \u2014 Local Rank Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',-apple-system,sans-serif;background:#fff;color:#0f172a;padding:40px 48px;max-width:820px;margin:0 auto;}
    .header{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:20px;border-bottom:2px solid #0f172a;margin-bottom:28px;}
    .brand{font-size:10px;font-family:'Space Grotesk',sans-serif;letter-spacing:.15em;text-transform:uppercase;color:#64748b;font-weight:600;}
    .report-badge{background:#0f172a;color:#f8fafc;font-family:'Space Grotesk',sans-serif;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:4px 10px;border-radius:2px;}
    .business-name{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:800;color:#0f172a;letter-spacing:-.03em;margin-bottom:8px;line-height:1.1;}
    .keyword-pill{display:inline-block;background:#dbeafe;color:#1e40af;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;padding:3px 10px;border-radius:2px;letter-spacing:.02em;margin-bottom:6px;}
    .meta-row{font-size:11px;color:#64748b;font-family:'Inter',sans-serif;display:flex;gap:16px;flex-wrap:wrap;margin-bottom:28px;}
    .section-title{font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#94a3b8;margin-bottom:10px;}
    .rank-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:320px;margin-bottom:32px;}
    .legend{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;margin-bottom:28px;}
    .legend-item{display:flex;align-items:center;gap:6px;font-size:10px;color:#475569;font-family:'Inter',sans-serif;}
    .legend-dot{width:10px;height:10px;border-radius:50%;}
    .footer{margin-top:40px;padding-top:14px;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;}
    .footer-left{font-size:10px;color:#94a3b8;font-family:'Inter',sans-serif;}
    .footer-right{font-size:10px;color:#94a3b8;font-family:'Space Grotesk',sans-serif;font-weight:600;letter-spacing:.05em;}
    @media print{body{padding:24px 32px;}@page{margin:.5cm;size:A4 portrait;}}
  </style>
</head>
<body>
  <div class="header">
    <span class="brand">Local Rank Tracker</span>
    <span class="report-badge">Rank Report</span>
  </div>
  <div class="business-name">${businessName}</div>
  <div class="keyword-pill">${keyword}</div>
  <div class="meta-row">
    <span>\u{1F4CD} ${address}</span>
    <span>\u{1F4C5} ${date}</span>
  </div>
  <div class="section-title">Performance Summary</div>
  ${summaryHtml}
  <div class="section-title">Geographic Rank Grid</div>
  <div class="rank-grid">${gridCells}</div>
  <div class="legend">
    <div class="legend-item"><div class="legend-dot" style="background:#16a34a"></div> Rank 1\u20133 (Top)</div>
    <div class="legend-item"><div class="legend-dot" style="background:#ca8a04"></div> Rank 4\u201310 (Mid)</div>
    <div class="legend-item"><div class="legend-dot" style="background:#dc2626"></div> Rank 11+ (Low)</div>
    <div class="legend-item"><div class="legend-dot" style="background:#e2e8f0;border:1px solid #cbd5e1"></div> Not Found</div>
  </div>
  <div class="footer">
    <span class="footer-left">Generated ${generatedOn} &bull; caffeine.ai</span>
    <span class="footer-right">LOCAL RANK TRACKER</span>
  </div>
  <script>window.onload=function(){setTimeout(function(){window.print();},600);};<\/script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
