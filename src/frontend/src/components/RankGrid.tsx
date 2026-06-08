import { getRankTier } from "@/types";
import type { GridCell } from "@/types";

const DIRECTIONS = ["NW", "N", "NE", "W", "Center", "E", "SW", "S", "SE"];

const TIER_META = {
  success: {
    glow: "glow-cyan",
    textColor: "text-[oklch(0.85_0.32_180)]",
    bgCls: "bg-[oklch(0.14_0.06_180)]",
    borderCls: "border-[oklch(0.72_0.32_180)]/40",
    shadowVar: "rgba(0,217,255,0.7)",
    radialVar: "rgba(0,217,255,0.1)",
  },
  mid: {
    glow: "glow-purple",
    textColor: "text-[oklch(0.82_0.30_285)]",
    bgCls: "bg-[oklch(0.14_0.05_285)]",
    borderCls: "border-[oklch(0.68_0.30_285)]/40",
    shadowVar: "rgba(189,0,255,0.65)",
    radialVar: "rgba(189,0,255,0.09)",
  },
  poor: {
    glow: "glow-magenta",
    textColor: "text-[oklch(0.80_0.30_15)]",
    bgCls: "bg-[oklch(0.14_0.06_15)]",
    borderCls: "border-[oklch(0.65_0.32_15)]/40",
    shadowVar: "rgba(255,0,107,0.65)",
    radialVar: "rgba(255,0,107,0.1)",
  },
  notfound: {
    glow: "glow-soft",
    textColor: "text-muted-foreground",
    bgCls: "bg-[oklch(0.14_0.01_270)]",
    borderCls: "border-border/50",
    shadowVar: "rgba(100,100,140,0.35)",
    radialVar: "rgba(100,100,140,0.05)",
  },
} as const;

type TierKey = keyof typeof TIER_META;

function RankCell({ cell, index }: { cell: GridCell; index: number }) {
  const tier = getRankTier(cell.rank) as TierKey;
  const meta = TIER_META[tier];
  const direction = DIRECTIONS[index] ?? "";
  const isCenter = direction === "Center";

  if (cell.pending) {
    return (
      <div
        className="relative w-full aspect-square flex flex-col items-center justify-center gap-1.5 rounded-sm border border-border/40 bg-[oklch(0.12_0.01_270)] rank-pending"
        title={`${direction} \u00b7 scanning\u2026`}
        data-ocid={`rank_grid.cell.${index + 1}`}
      >
        <span className="text-[8px] uppercase tracking-[0.2em] font-display font-semibold text-muted-foreground/60 leading-none">
          {direction}
        </span>
        <span className="w-5 h-5 rounded-full border-2 border-muted-foreground/40 border-t-transparent animate-spin" />
      </div>
    );
  }

  const rankDisplay = cell.rank != null ? String(Number(cell.rank)) : "N/A";
  const isNA = rankDisplay === "N/A";

  return (
    <div
      className={[
        "relative w-full aspect-square flex flex-col items-center justify-center gap-1 rounded-sm border",
        meta.bgCls,
        meta.borderCls,
        meta.glow,
        "transition-all duration-300 ease-out cursor-default select-none",
        "hover:scale-105 hover:z-10",
        isCenter ? "ring-1 ring-white/10" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      title={`${direction} \u00b7 Lat: ${cell.lat.toFixed(4)}, Lng: ${cell.lng.toFixed(4)}`}
      data-ocid={`rank_grid.cell.${index + 1}`}
    >
      {/* Inner radial highlight */}
      <div
        className="absolute inset-0 rounded-sm pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 20%, ${meta.radialVar}, transparent 70%)`,
        }}
      />

      {/* Direction badge */}
      <span
        className={[
          "relative z-10 text-[8px] uppercase tracking-[0.18em] font-display font-bold leading-none px-1 py-0.5 rounded-[2px]",
          isNA ? "text-muted-foreground/50" : `${meta.textColor} bg-white/5`,
        ].join(" ")}
      >
        {direction}
      </span>

      {/* Rank number */}
      <span
        className={[
          "relative z-10 font-mono font-black leading-none tracking-tight",
          isNA
            ? "text-xl text-muted-foreground/40"
            : `text-3xl ${meta.textColor}`,
        ].join(" ")}
        style={
          isNA
            ? undefined
            : {
                textShadow: `0 0 12px ${meta.shadowVar}, 0 0 24px ${meta.shadowVar.replace("0.7", "0.4").replace("0.65", "0.35")}`,
              }
        }
      >
        {rankDisplay}
      </span>
    </div>
  );
}

const LEGEND_ITEMS = [
  {
    color: "oklch(0.72 0.32 180)",
    shadow: "rgba(0,217,255,0.8)",
    label: "Rank 1\u20133",
  },
  {
    color: "oklch(0.68 0.30 285)",
    shadow: "rgba(189,0,255,0.8)",
    label: "Rank 4\u201310",
  },
  {
    color: "oklch(0.65 0.32 15)",
    shadow: "rgba(255,0,107,0.8)",
    label: "Rank 11+",
  },
  {
    color: "oklch(0.45 0.02 270)",
    shadow: "rgba(120,120,160,0.5)",
    label: "Not found",
  },
];

export function RankLegend() {
  return (
    <div className="flex flex-wrap gap-3">
      {LEGEND_ITEMS.map(({ color, shadow, label }) => (
        <span
          key={label}
          className="flex items-center gap-2 text-[10px] text-muted-foreground font-body uppercase tracking-widest"
        >
          <span
            className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
            style={{
              background: color,
              boxShadow: `0 0 6px ${shadow}, 0 0 12px ${shadow.replace("0.8", "0.4").replace("0.5", "0.25")}`,
            }}
          />
          {label}
        </span>
      ))}
    </div>
  );
}

interface RankGridProps {
  cells: GridCell[][];
  title?: string;
  className?: string;
}

export function RankGrid({ cells, title, className = "" }: RankGridProps) {
  const flat = cells.flat();

  return (
    <div
      className={`relative glassmorphism rounded-sm p-5 overflow-hidden ${className}`}
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, oklch(0.18 0.06 260 / 0.4), transparent 70%)",
        }}
      />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          {title && (
            <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">
              {title}
            </h2>
          )}
          <RankLegend />
        </div>

        <div
          className="grid grid-cols-3 gap-1.5 w-full max-w-[300px]"
          data-ocid="rank_grid.grid"
        >
          {flat.map((cell, i) => (
            <RankCell
              key={`cell-r${cell.row}-c${cell.col}`}
              cell={cell}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
