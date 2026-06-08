import { c as createLucideIcon, j as jsxRuntimeExports, k as useParams, L as Link, B as Button, m as motion } from "./index-Dra4aKhn.js";
import { S as Skeleton } from "./skeleton-B-U1R3Ak.js";
import { d as useSavedSearch } from "./useBackend-fR6Z4du_.js";
import { g as getRankTier, r as resultsToGrid, c as computeMetrics } from "./index-BXO32LPc.js";
import { e as exportToPdf, S as SummaryBar } from "./pdf-Cx0TQr-O.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M12 15V3", key: "m9g1x1" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }]
];
const Download = createLucideIcon("download", __iconNode);
const DIRECTIONS = ["NW", "N", "NE", "W", "Center", "E", "SW", "S", "SE"];
const TIER_META = {
  success: {
    glow: "glow-cyan",
    textColor: "text-[oklch(0.85_0.32_180)]",
    bgCls: "bg-[oklch(0.14_0.06_180)]",
    borderCls: "border-[oklch(0.72_0.32_180)]/40",
    shadowVar: "rgba(0,217,255,0.7)",
    radialVar: "rgba(0,217,255,0.1)"
  },
  mid: {
    glow: "glow-purple",
    textColor: "text-[oklch(0.82_0.30_285)]",
    bgCls: "bg-[oklch(0.14_0.05_285)]",
    borderCls: "border-[oklch(0.68_0.30_285)]/40",
    shadowVar: "rgba(189,0,255,0.65)",
    radialVar: "rgba(189,0,255,0.09)"
  },
  poor: {
    glow: "glow-magenta",
    textColor: "text-[oklch(0.80_0.30_15)]",
    bgCls: "bg-[oklch(0.14_0.06_15)]",
    borderCls: "border-[oklch(0.65_0.32_15)]/40",
    shadowVar: "rgba(255,0,107,0.65)",
    radialVar: "rgba(255,0,107,0.1)"
  },
  notfound: {
    glow: "glow-soft",
    textColor: "text-muted-foreground",
    bgCls: "bg-[oklch(0.14_0.01_270)]",
    borderCls: "border-border/50",
    shadowVar: "rgba(100,100,140,0.35)",
    radialVar: "rgba(100,100,140,0.05)"
  }
};
function RankCell({ cell, index }) {
  const tier = getRankTier(cell.rank);
  const meta = TIER_META[tier];
  const direction = DIRECTIONS[index] ?? "";
  const isCenter = direction === "Center";
  if (cell.pending) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative w-full aspect-square flex flex-col items-center justify-center gap-1.5 rounded-sm border border-border/40 bg-[oklch(0.12_0.01_270)] rank-pending",
        title: `${direction} · scanning…`,
        "data-ocid": `rank_grid.cell.${index + 1}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] uppercase tracking-[0.2em] font-display font-semibold text-muted-foreground/60 leading-none", children: direction }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-5 h-5 rounded-full border-2 border-muted-foreground/40 border-t-transparent animate-spin" })
        ]
      }
    );
  }
  const rankDisplay = cell.rank != null ? String(Number(cell.rank)) : "N/A";
  const isNA = rankDisplay === "N/A";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: [
        "relative w-full aspect-square flex flex-col items-center justify-center gap-1 rounded-sm border",
        meta.bgCls,
        meta.borderCls,
        meta.glow,
        "transition-all duration-300 ease-out cursor-default select-none",
        "hover:scale-105 hover:z-10",
        isCenter ? "ring-1 ring-white/10" : ""
      ].filter(Boolean).join(" "),
      title: `${direction} · Lat: ${cell.lat.toFixed(4)}, Lng: ${cell.lng.toFixed(4)}`,
      "data-ocid": `rank_grid.cell.${index + 1}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-0 rounded-sm pointer-events-none",
            style: {
              background: `radial-gradient(ellipse at 50% 20%, ${meta.radialVar}, transparent 70%)`
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: [
              "relative z-10 text-[8px] uppercase tracking-[0.18em] font-display font-bold leading-none px-1 py-0.5 rounded-[2px]",
              isNA ? "text-muted-foreground/50" : `${meta.textColor} bg-white/5`
            ].join(" "),
            children: direction
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: [
              "relative z-10 font-mono font-black leading-none tracking-tight",
              isNA ? "text-xl text-muted-foreground/40" : `text-3xl ${meta.textColor}`
            ].join(" "),
            style: isNA ? void 0 : {
              textShadow: `0 0 12px ${meta.shadowVar}, 0 0 24px ${meta.shadowVar.replace("0.7", "0.4").replace("0.65", "0.35")}`
            },
            children: rankDisplay
          }
        )
      ]
    }
  );
}
const LEGEND_ITEMS = [
  {
    color: "oklch(0.72 0.32 180)",
    shadow: "rgba(0,217,255,0.8)",
    label: "Rank 1–3"
  },
  {
    color: "oklch(0.68 0.30 285)",
    shadow: "rgba(189,0,255,0.8)",
    label: "Rank 4–10"
  },
  {
    color: "oklch(0.65 0.32 15)",
    shadow: "rgba(255,0,107,0.8)",
    label: "Rank 11+"
  },
  {
    color: "oklch(0.45 0.02 270)",
    shadow: "rgba(120,120,160,0.5)",
    label: "Not found"
  }
];
function RankLegend() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-3", children: LEGEND_ITEMS.map(({ color, shadow, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: "flex items-center gap-2 text-[10px] text-muted-foreground font-body uppercase tracking-widest",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "w-2.5 h-2.5 rounded-full inline-block flex-shrink-0",
            style: {
              background: color,
              boxShadow: `0 0 6px ${shadow}, 0 0 12px ${shadow.replace("0.8", "0.4").replace("0.5", "0.25")}`
            }
          }
        ),
        label
      ]
    },
    label
  )) });
}
function RankGrid({ cells, title, className = "" }) {
  const flat = cells.flat();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `relative glassmorphism rounded-sm p-5 overflow-hidden ${className}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-0 pointer-events-none",
            style: {
              background: "radial-gradient(ellipse at 50% 0%, oklch(0.18 0.06 260 / 0.4), transparent 70%)"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-5", children: [
            title && /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-sm text-foreground tracking-wide uppercase", children: title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RankLegend, {})
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "grid grid-cols-3 gap-1.5 w-full max-w-[300px]",
              "data-ocid": "rank_grid.grid",
              children: flat.map((cell, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                RankCell,
                {
                  cell,
                  index: i
                },
                `cell-r${cell.row}-c${cell.col}`
              ))
            }
          )
        ] })
      ]
    }
  );
}
function SearchDetailPage() {
  const { id } = useParams({ strict: false });
  const searchId = id != null ? BigInt(id) : null;
  const { data: search, isLoading } = useSavedSearch(searchId ?? BigInt(0));
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4",
        "data-ocid": "search_detail.loading_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-48 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full opacity-20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full opacity-20" })
        ]
      }
    );
  }
  if (!search) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "max-w-5xl mx-auto px-4 sm:px-6 py-8",
        "data-ocid": "search_detail.error_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Search not found." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "link",
              size: "sm",
              className: "pl-0 mt-2 gap-1 text-cyan-400 hover:text-cyan-300",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-3.5 h-3.5" }),
                "Back to Dashboard"
              ]
            }
          ) })
        ]
      }
    );
  }
  const grid = resultsToGrid(search.results);
  const metrics = computeMetrics(search.results);
  const date = new Date(
    Number(search.createdAt) / 1e6
  ).toLocaleDateString();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.35 },
      className: "max-w-5xl mx-auto px-4 sm:px-6 py-8",
      "data-ocid": "search_detail.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, x: -12 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.4 },
            className: "flex items-center gap-2 mb-6",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", "data-ocid": "search_detail.back_link", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  className: "h-7 px-2 text-xs gap-1.5 flex items-center rounded-sm transition-all duration-200 font-display text-muted-foreground hover:text-cyan-400",
                  style: { background: "transparent" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-3.5 h-3.5" }),
                    "Dashboard"
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-muted-foreground/40 text-xs",
                  style: { fontFamily: "monospace" },
                  children: "/"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-xs font-medium font-mono",
                  style: {
                    color: "rgba(0,217,255,0.8)",
                    textShadow: "0 0 8px rgba(0,217,255,0.4)"
                  },
                  children: search.businessName
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: -8 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.4, delay: 0.05 },
            className: "flex items-start justify-between gap-4 mb-6",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-semibold text-xl text-foreground", children: search.businessName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "inline-block w-1.5 h-1.5 rounded-full",
                        style: {
                          background: "rgba(168,85,247,0.8)",
                          boxShadow: "0 0 4px rgba(168,85,247,0.8)"
                        }
                      }
                    ),
                    search.address
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "font-mono",
                      style: { color: "rgba(0,217,255,0.7)" },
                      children: search.keyword
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: date })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  className: "h-8 px-3 text-xs gap-1.5 font-display font-semibold rounded-sm flex items-center shrink-0 transition-all duration-300",
                  style: {
                    background: "rgba(0,217,255,0.1)",
                    border: "1px solid rgba(0,217,255,0.35)",
                    boxShadow: "0 0 12px rgba(0,217,255,0.2), inset 0 1px 0 rgba(0,217,255,0.1)",
                    color: "rgb(103,232,249)"
                  },
                  onMouseEnter: (e) => {
                    e.currentTarget.style.background = "rgba(0,217,255,0.18)";
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(0,217,255,0.4), inset 0 1px 0 rgba(0,217,255,0.15)";
                  },
                  onMouseLeave: (e) => {
                    e.currentTarget.style.background = "rgba(0,217,255,0.1)";
                    e.currentTarget.style.boxShadow = "0 0 12px rgba(0,217,255,0.2), inset 0 1px 0 rgba(0,217,255,0.1)";
                  },
                  onClick: () => exportToPdf(
                    search.businessName,
                    search.keyword,
                    search.address,
                    date,
                    grid,
                    metrics
                  ),
                  "data-ocid": "search_detail.export_button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5" }),
                    " Export PDF"
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.45, delay: 0.1 },
            className: "rounded-sm p-5 mb-5",
            style: {
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryBar, { metrics, className: "mb-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                RankGrid,
                {
                  cells: grid,
                  title: `Local Rank Heatmap — ${search.keyword}`,
                  "data-ocid": "search_detail.grid"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.5, delay: 0.2 },
            className: "rounded-sm p-4",
            style: {
              background: "rgba(0,217,255,0.04)",
              border: "1px solid rgba(0,217,255,0.15)",
              boxShadow: "0 0 20px rgba(0,217,255,0.05) inset"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-400 font-semibold", children: "Why does this matter?" }),
              " ",
              "Google's local results aren't uniform — your business might rank #1 directly at your address but rank #8 just a mile away. This grid maps that visibility gap so you can see where your local SEO is strong and where it needs work."
            ] })
          }
        )
      ]
    }
  );
}
export {
  SearchDetailPage as default
};
