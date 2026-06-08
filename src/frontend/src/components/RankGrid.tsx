import { getRankTier } from "@/types";
import type { GridCell } from "@/types";

const DIRECTIONS = ["NW", "N", "NE", "W", "Center", "E", "SW", "S", "SE"];

const TIER_META = {
  success: {
    textColor: "text-green-300",
    bgInline: "rgba(20,83,45,0.45)",
    borderCls: "border-green-500/40",
    shadowStr: "0 0 16px rgba(34,197,94,0.45), 0 0 32px rgba(34,197,94,0.18), inset 0 0 10px rgba(34,197,94,0.08)",
    shadowVar: "rgba(34,197,94,0.7)",
    radialVar: "rgba(34,197,94,0.1)",
  },
  mid: {
    textColor: "text-amber-300",
    bgInline: "rgba(120,53,15,0.45)",
    borderCls: "border-amber-500/40",
    shadowStr: "0 0 16px rgba(245,158,11,0.45), 0 0 32px rgba(245,158,11,0.18), inset 0 0 10px rgba(245,158,11,0.08)",
    shadowVar: "rgba(245,158,11,0.7)",
    radialVar: "rgba(245,158,11,0.1)",
  },
  poor: {
    textColor: "text-red-300",
    bgInline: "rgba(127,29,29,0.45)",
    borderCls: "border-red-500/40",
    shadowStr: "0 0 16px rgba(239,68,68,0.45), 0 0 32px rgba(239,68,68,0.18), inset 0 0 10px rgba(239,68,68,0.08)",
    shadowVar: "rgba(239,68,68,0.7)",
    radialVar: "rgba(239,68,68,0.1)",
  },
  notfound: {
    textColor: "text-muted-foreground",
    bgInline: undefined as string | undefined,
    borderCls: "border-border/50",
    shadowStr: "0 0 8px rgba(100,100,140,0.28), inset 0 0 6px rgba(100,100,140,0.04)",
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
        meta.borderCls,
        "transition-all duration-300 ease-out cursor-default select-none",
        "hover:scale-105 hover:z-10",
        isCenter ? "ring-1 ring-white/10" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: (meta as { bgInline?: string }).bgInline ?? "oklch(0.14 0.01 270)",
        boxShadow: (meta as { shadowStr?: string }).shadowStr,
      }}
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
  { color: "#22c55e", shadow: "rgba(34,197,94,0.8)", label: "Rank 1\u20133 \u00b7 Top" },
  { color: "#f59e0b", shadow: "rgba(245,158,11,0.8)", label: "Rank 4\u201310 \u00b7 Mid" },
  { color: "#ef4444", shadow: "rgba(239,68,68,0.8)", label: "Rank 11+ \u00b7 Low" },
  { color: "oklch(0.45 0.02 270)", shadow: "rgba(120,120,160,0.5)", label: "Not found" },
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
