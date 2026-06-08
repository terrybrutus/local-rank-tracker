import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, FileDown, Grid3x3, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Navigate, useSearch } from "@tanstack/react-router";

// Animated demo grid showing the product in action
const DEMO_CELLS = [
  { rank: 2, dir: "NW" },
  { rank: 1, dir: "N" },
  { rank: 4, dir: "NE" },
  { rank: 6, dir: "W" },
  { rank: 1, dir: "Ctr" },
  { rank: 5, dir: "E" },
  { rank: 14, dir: "SW" },
  { rank: 9, dir: "S" },
  { rank: 11, dir: "SE" },
];

function getDemoStyle(rank: number) {
  if (rank <= 3)
    return {
      bg: "rgba(20,83,45,0.6)",
      border: "rgba(34,197,94,0.6)",
      text: "#86efac",
      glow: "0 0 14px rgba(34,197,94,0.45)",
    };
  if (rank <= 10)
    return {
      bg: "rgba(120,53,15,0.6)",
      border: "rgba(245,158,11,0.6)",
      text: "#fcd34d",
      glow: "0 0 14px rgba(245,158,11,0.45)",
    };
  return {
    bg: "rgba(127,29,29,0.6)",
    border: "rgba(239,68,68,0.6)",
    text: "#fca5a5",
    glow: "0 0 14px rgba(239,68,68,0.45)",
  };
}

function DemoGrid() {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed < DEMO_CELLS.length) {
      const t = setTimeout(() => setRevealed((r) => r + 1), 380);
      return () => clearTimeout(t);
    }
    // Hold 2.5s then restart
    const t = setTimeout(() => setRevealed(0), 2500);
    return () => clearTimeout(t);
  }, [revealed]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 8,
        width: "100%",
        maxWidth: 280,
      }}
    >
      {DEMO_CELLS.map((cell, i) => {
        const isOn = i < revealed;
        const s = getDemoStyle(cell.rank);
        return (
          <div
            key={cell.dir}
            style={{
              aspectRatio: "1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              border: `1px solid ${isOn ? s.border : "rgba(255,255,255,0.08)"}`,
              background: isOn ? s.bg : "rgba(255,255,255,0.03)",
              boxShadow: isOn ? s.glow : "none",
              transition: "all 0.35s ease",
              gap: 3,
            }}
          >
            <span
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "sans-serif",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              {cell.dir}
            </span>
            <span
              style={{
                fontSize: isOn ? 22 : 16,
                fontFamily: "monospace",
                fontWeight: 800,
                color: isOn ? s.text : "rgba(255,255,255,0.1)",
                transition: "all 0.35s ease",
                lineHeight: 1,
              }}
            >
              {isOn ? `#${cell.rank}` : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const FEATURES = [
  {
    icon: Grid3x3,
    headline: "Know your blind spots",
    desc: "9-point grid shows where you rank strong — and where you disappear",
    accent: "#22d3ee",
    border: "rgba(34,211,238,0.25)",
    bg: "rgba(34,211,238,0.06)",
  },
  {
    icon: TrendingUp,
    headline: "Real Google Maps data",
    desc: "Live results via SerpAPI — not estimates, not guesses",
    accent: "#a78bfa",
    border: "rgba(167,139,250,0.25)",
    bg: "rgba(167,139,250,0.06)",
  },
  {
    icon: FileDown,
    headline: "Send clients proof",
    desc: "Branded PDF reports that close deals and justify your fees",
    accent: "#f472b6",
    border: "rgba(244,114,182,0.25)",
    bg: "rgba(244,114,182,0.06)",
  },
];

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const search = useSearch({ strict: false }) as { redirect?: string };

  if (isAuthenticated) {
    return <Navigate to={search.redirect ?? "/"} />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      data-ocid="login.page"
    >
      {/* Subtle radial accent glows — intentional, not noise */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(99,51,255,0.14), transparent), " +
            "radial-gradient(ellipse 40% 40% at 80% 100%, rgba(0,217,255,0.06), transparent)",
        }}
      />

      {/* Two-column layout on lg+ */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">

        {/* ── LEFT: branding + form ── */}
        <div className="w-full lg:w-[420px] shrink-0">
          {/* Logo mark */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-7"
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, rgba(0,217,255,0.2), rgba(99,51,255,0.2))",
                border: "1px solid rgba(0,217,255,0.35)",
                boxShadow: "0 0 20px rgba(0,217,255,0.2), 0 0 40px rgba(99,51,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Grid3x3
                style={{ width: 18, height: 18, color: "rgb(0,217,255)" }}
                strokeWidth={2}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "rgb(0,217,255)",
                  letterSpacing: "0.05em",
                  textShadow: "0 0 8px rgba(0,217,255,0.5)",
                  lineHeight: 1.1,
                }}
              >
                LOCAL RANK TRACKER
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 9,
                  color: "rgba(189,0,255,0.8)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                Local SEO Intelligence
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <h1
              style={{
                fontFamily: "var(--font-display, sans-serif)",
                fontWeight: 700,
                fontSize: "clamp(1.6rem, 3.5vw, 2.1rem)",
                lineHeight: 1.2,
                color: "rgba(255,255,255,0.95)",
                marginBottom: 10,
              }}
            >
              See exactly where you
              <span
                style={{
                  display: "block",
                  color: "rgb(0,217,255)",
                  textShadow: "0 0 20px rgba(0,217,255,0.4)",
                }}
              >
                disappear from Google
              </span>
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body, sans-serif)",
                fontSize: 14,
                color: "rgba(200,200,220,0.75)",
                lineHeight: 1.6,
              }}
            >
              Your Google ranking changes every mile. This tool maps your
              visibility across a{" "}
              <span style={{ color: "rgba(0,217,255,0.85)", fontWeight: 500 }}>
                3×3 geographic grid
              </span>{" "}
              so you can see exactly where you win — and where you lose.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-2.5 mb-7"
          >
            {FEATURES.map(({ icon: Icon, headline, desc, accent, border, bg }, i) => (
              <motion.div
                key={headline}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.25 + i * 0.08 }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${border}`,
                  background: bg,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: `${bg}`,
                    border: `1px solid ${border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <Icon style={{ width: 13, height: 13, color: accent }} />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-display, sans-serif)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: accent,
                      lineHeight: 1.2,
                      marginBottom: 2,
                    }}
                  >
                    {headline}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body, sans-serif)",
                      fontSize: 11,
                      color: "rgba(180,180,210,0.75)",
                      lineHeight: 1.4,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.5 }}
          >
            <button
              type="button"
              onClick={login}
              disabled={isLoading}
              style={{
                width: "100%",
                height: 46,
                borderRadius: 10,
                background: isLoading
                  ? "rgba(99,51,255,0.3)"
                  : "linear-gradient(135deg, rgba(99,51,255,0.92) 0%, rgba(0,140,255,0.92) 100%)",
                border: "1px solid rgba(120,80,255,0.55)",
                boxShadow: isLoading
                  ? "none"
                  : "0 0 24px rgba(99,51,255,0.4), 0 0 48px rgba(99,51,255,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
                color: "#fff",
                fontFamily: "var(--font-display, sans-serif)",
                fontWeight: 600,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: isLoading ? "default" : "pointer",
                transition: "all 0.25s ease",
                opacity: isLoading ? 0.7 : 1,
              }}
              data-ocid="login.submit_button"
            >
              {isLoading ? (
                <>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid rgba(255,255,255,0.25)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Connecting…
                </>
              ) : (
                <>
                  Get Started — it's free
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </>
              )}
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: 11,
                color: "rgba(160,160,190,0.6)",
                marginTop: 8,
                fontFamily: "var(--font-body, sans-serif)",
              }}
            >
              Uses Internet Identity — no password, no email required
            </p>
          </motion.div>
        </div>

        {/* ── RIGHT: animated product demo ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full lg:flex-1 flex flex-col items-center justify-center gap-5"
        >
          {/* Demo context label */}
          <div
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 9,
              color: "rgba(0,217,255,0.6)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            Live demo · Joe's Pizza · New York, NY
          </div>

          {/* Demo grid */}
          <div
            style={{
              padding: "28px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 0 40px rgba(0,0,0,0.4), inset 0 0 1px rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <DemoGrid />

            {/* Legend */}
            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {[
                { color: "#22c55e", label: "Top 3" },
                { color: "#f59e0b", label: "4–10" },
                { color: "#ef4444", label: "11+" },
              ].map(({ color, label }) => (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: color,
                      boxShadow: `0 0 6px ${color}`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: "rgba(180,180,210,0.65)",
                      fontFamily: "var(--font-body, sans-serif)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Explainer text */}
          <p
            style={{
              fontFamily: "var(--font-body, sans-serif)",
              fontSize: 12,
              color: "rgba(160,160,200,0.65)",
              textAlign: "center",
              maxWidth: 320,
              lineHeight: 1.6,
            }}
          >
            Each number is where your business ranks{" "}
            <span style={{ color: "rgba(0,217,255,0.75)" }}>
              from that exact location
            </span>
            . One search. Nine perspectives.
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <p
        className="absolute bottom-4"
        style={{
          fontSize: 11,
          color: "rgba(130,130,160,0.5)",
          fontFamily: "var(--font-body, sans-serif)",
          zIndex: 10,
        }}
      >
        © {new Date().getFullYear()} Local Rank Tracker
      </p>

      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}
