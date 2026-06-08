import { j as jsxRuntimeExports } from "./index-Dra4aKhn.js";
import { g as getRankTier } from "./index-BXO32LPc.js";
const STAT_META = [
  {
    label: "Avg. Rank",
    key: "avgRank",
    format: (v) => v != null ? `#${v}` : "N/A",
    accentColor: "oklch(0.72 0.32 180)",
    glowColor: "rgba(0,217,255,0.6)",
    glowColorDim: "rgba(0,217,255,0.12)",
    bgColor: "oklch(0.12 0.05 200 / 0.5)",
    borderColor: "oklch(0.72 0.32 180 / 0.25)",
    ocid: "summary_bar.avg_rank",
    delay: "0ms"
  },
  {
    label: "Best Rank",
    key: "bestRank",
    format: (v) => v != null ? `#${v}` : "N/A",
    accentColor: "oklch(0.82 0.30 285)",
    glowColor: "rgba(130,0,255,0.55)",
    glowColorDim: "rgba(130,0,255,0.1)",
    bgColor: "oklch(0.12 0.05 285 / 0.5)",
    borderColor: "oklch(0.68 0.30 285 / 0.25)",
    ocid: "summary_bar.best_rank",
    delay: "80ms"
  },
  {
    label: "Worst Rank",
    key: "worstRank",
    format: (v) => v != null ? `#${v}` : "N/A",
    accentColor: "oklch(0.80 0.30 15)",
    glowColor: "rgba(255,0,107,0.55)",
    glowColorDim: "rgba(255,0,107,0.1)",
    bgColor: "oklch(0.12 0.05 15 / 0.5)",
    borderColor: "oklch(0.65 0.32 15 / 0.25)",
    ocid: "summary_bar.worst_rank",
    delay: "160ms"
  },
  {
    label: "% in Top 3",
    key: "topThreePct",
    format: (v) => `${v}%`,
    accentColor: "oklch(0.85 0.28 260)",
    glowColor: "rgba(80,140,255,0.55)",
    glowColorDim: "rgba(80,140,255,0.1)",
    bgColor: "oklch(0.12 0.05 260 / 0.5)",
    borderColor: "oklch(0.70 0.28 260 / 0.25)",
    ocid: "summary_bar.top3_pct",
    delay: "240ms"
  }
];
function StatCard({
  label,
  value,
  accentColor,
  glowColor,
  glowColorDim,
  bgColor,
  borderColor,
  delay,
  ocid
}) {
  const isNA = value === "N/A";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative rounded-sm overflow-hidden slide-in flex flex-col gap-2 p-4",
      style: {
        background: bgColor,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 24px ${glowColorDim}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        animationDelay: delay
      },
      "data-ocid": ocid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none",
            style: {
              background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
              opacity: 0.7
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute top-0 left-0 w-16 h-16 pointer-events-none",
            style: {
              background: `radial-gradient(circle at 0% 0%, ${glowColorDim}, transparent 70%)`
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "relative z-10 text-[9px] font-display font-semibold text-muted-foreground uppercase tracking-[0.2em] leading-none", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: "relative z-10 font-mono font-black leading-none tracking-tight",
            style: {
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              color: isNA ? "oklch(0.45 0.02 270)" : accentColor,
              textShadow: isNA ? "none" : `0 0 10px ${glowColor}, 0 0 22px ${glowColor.replace("0.6", "0.35").replace("0.55", "0.3")}`
            },
            children: value
          }
        )
      ]
    }
  );
}
function SummaryBar({ metrics, className = "" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`,
      "data-ocid": "summary_bar.section",
      children: STAT_META.map((meta) => {
        const raw = metrics[meta.key];
        const value = meta.format(raw);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatCard,
          {
            label: meta.label,
            value,
            accentColor: meta.accentColor,
            glowColor: meta.glowColor,
            glowColorDim: meta.glowColorDim,
            bgColor: meta.bgColor,
            borderColor: meta.borderColor,
            delay: meta.delay,
            ocid: meta.ocid
          },
          meta.label
        );
      })
    }
  );
}
const DIRECTIONS = ["NW", "N", "NE", "W", "Center", "E", "SW", "S", "SE"];
const CELL_COLORS = {
  success: { bg: "#16a34a", text: "#ffffff" },
  mid: { bg: "#ca8a04", text: "#ffffff" },
  poor: { bg: "#dc2626", text: "#ffffff" },
  notfound: { bg: "#e2e8f0", text: "#64748b" }
};
function buildCellHtml(cell, index) {
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
    "</div>"
  ].join("");
}
function buildSummaryHtml(metrics) {
  const stats = [
    {
      label: "Avg. Rank",
      value: metrics.avgRank != null ? `#${metrics.avgRank}` : "N/A"
    },
    {
      label: "Best Rank",
      value: metrics.bestRank != null ? `#${metrics.bestRank}` : "N/A"
    },
    {
      label: "Worst Rank",
      value: metrics.worstRank != null ? `#${metrics.worstRank}` : "N/A"
    },
    { label: "% in Top 3", value: `${metrics.topThreePct}%` }
  ];
  const items = stats.map(
    ({ label, value }) => [
      `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:10px 14px;">`,
      `<div style="font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;`,
      `font-family:'Inter',sans-serif;margin-bottom:4px;">${label}</div>`,
      `<div style="font-size:22px;font-weight:800;color:#0f172a;`,
      `font-family:'JetBrains Mono','Courier New',monospace;line-height:1;">${value}</div>`,
      "</div>"
    ].join("")
  ).join("");
  return [
    `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px;">`,
    items,
    "</div>"
  ].join("");
}
function formatDateLong(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
function exportToPdf(businessName, keyword, address, date, cells, metrics) {
  const flat = cells.flat();
  const gridCells = flat.map((c, i) => buildCellHtml(c, i)).join("");
  const summaryHtml = buildSummaryHtml(metrics);
  const generatedOn = formatDateLong(/* @__PURE__ */ new Date());
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    window.print();
    return;
  }
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${businessName} — Local Rank Report</title>
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
    <span>📍 ${address}</span>
    <span>📅 ${date}</span>
  </div>
  <div class="section-title">Performance Summary</div>
  ${summaryHtml}
  <div class="section-title">Geographic Rank Grid</div>
  <div class="rank-grid">${gridCells}</div>
  <div class="legend">
    <div class="legend-item"><div class="legend-dot" style="background:#16a34a"></div> Rank 1–3 (Top)</div>
    <div class="legend-item"><div class="legend-dot" style="background:#ca8a04"></div> Rank 4–10 (Mid)</div>
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
export {
  SummaryBar as S,
  exportToPdf as e
};
