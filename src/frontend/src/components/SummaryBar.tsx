import type { SummaryMetrics } from "@/types";

const STAT_META = [
  {
    label: "Avg. Rank",
    key: "avgRank" as const,
    format: (v: number | null) => (v != null ? `#${v}` : "N/A"),
    accentColor: "oklch(0.72 0.32 180)",
    glowColor: "rgba(0,217,255,0.6)",
    glowColorDim: "rgba(0,217,255,0.12)",
    bgColor: "oklch(0.12 0.05 200 / 0.5)",
    borderColor: "oklch(0.72 0.32 180 / 0.25)",
    ocid: "summary_bar.avg_rank",
    delay: "0ms",
    subtext: "across 9 grid points",
  },
  {
    label: "Best Rank",
    key: "bestRank" as const,
    format: (v: number | null) => (v != null ? `#${v}` : "N/A"),
    accentColor: "oklch(0.82 0.30 285)",
    glowColor: "rgba(130,0,255,0.55)",
    glowColorDim: "rgba(130,0,255,0.1)",
    bgColor: "oklch(0.12 0.05 285 / 0.5)",
    borderColor: "oklch(0.68 0.30 285 / 0.25)",
    ocid: "summary_bar.best_rank",
    delay: "80ms",
  },
  {
    label: "Worst Rank",
    key: "worstRank" as const,
    format: (v: number | null) => (v != null ? `#${v}` : "N/A"),
    accentColor: "oklch(0.80 0.30 15)",
    glowColor: "rgba(255,0,107,0.55)",
    glowColorDim: "rgba(255,0,107,0.1)",
    bgColor: "oklch(0.12 0.05 15 / 0.5)",
    borderColor: "oklch(0.65 0.32 15 / 0.25)",
    ocid: "summary_bar.worst_rank",
    delay: "160ms",
  },
  {
    label: "% in Top 3",
    key: "topThreePct" as const,
    format: (v: number) => `${v}%`,
    accentColor: "oklch(0.85 0.28 260)",
    glowColor: "rgba(80,140,255,0.55)",
    glowColorDim: "rgba(80,140,255,0.1)",
    bgColor: "oklch(0.12 0.05 260 / 0.5)",
    borderColor: "oklch(0.70 0.28 260 / 0.25)",
    ocid: "summary_bar.top3_pct",
    delay: "240ms",
  },
] as const;

interface StatCardProps {
  label: string;
  value: string;
  accentColor: string;
  glowColor: string;
  glowColorDim: string;
  bgColor: string;
  borderColor: string;
  delay: string;
  ocid?: string;
  subtext?: string;
}

function StatCard({
  label,
  value,
  accentColor,
  glowColor,
  glowColorDim,
  bgColor,
  borderColor,
  delay,
  ocid,
  subtext,
}: StatCardProps) {
  const isNA = value === "N/A";

  return (
    <div
      className="relative rounded-sm overflow-hidden slide-in flex flex-col gap-2 p-4"
      style={{
        background: bgColor,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 24px ${glowColorDim}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        animationDelay: delay,
      }}
      data-ocid={ocid}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          opacity: 0.7,
        }}
      />

      {/* Inner corner glow */}
      <div
        className="absolute top-0 left-0 w-16 h-16 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 0% 0%, ${glowColorDim}, transparent 70%)`,
        }}
      />

      <p className="relative z-10 text-[9px] font-display font-semibold text-muted-foreground uppercase tracking-[0.2em] leading-none">
        {label}
      </p>

      <p
        className="relative z-10 font-mono font-black leading-none tracking-tight"
        style={{
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          color: isNA ? "oklch(0.45 0.02 270)" : accentColor,
          textShadow: isNA
            ? "none"
            : `0 0 10px ${glowColor}, 0 0 22px ${glowColor.replace("0.6", "0.35").replace("0.55", "0.3")}`,
        }}
      >
        {value}
      </p>
      {subtext && (
        <p
          className="relative z-10 text-[9px] font-body leading-none"
          style={{ color: "rgba(160,160,190,0.5)", marginTop: 2 }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}

interface SummaryBarProps {
  metrics: SummaryMetrics;
  className?: string;
}

export function SummaryBar({ metrics, className = "" }: SummaryBarProps) {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}
      data-ocid="summary_bar.section"
    >
      {STAT_META.map((meta) => {
        const raw = metrics[meta.key];
        const value = meta.format(raw as never);
        return (
          <StatCard
            key={meta.label}
            label={meta.label}
            value={value}
            accentColor={meta.accentColor}
            glowColor={meta.glowColor}
            glowColorDim={meta.glowColorDim}
            bgColor={meta.bgColor}
            borderColor={meta.borderColor}
            delay={meta.delay}
            ocid={meta.ocid}
            subtext={(meta as any).subtext}
          />
        );
      })}
    </div>
  );
}
