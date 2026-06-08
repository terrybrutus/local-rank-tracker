import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useSearch } from "@tanstack/react-router";
import {
  ArrowRight,
  FileDown,
  Grid3x3,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Grid3x3,
    label: "3×3 Geographic Grid",
    desc: "Map rankings across 9 nearby locations — 1 mile apart",
    color: "cyan",
  },
  {
    icon: TrendingUp,
    label: "Live Rank Intelligence",
    desc: "Real Google Maps results via SerpAPI for each grid point",
    color: "purple",
  },
  {
    icon: FileDown,
    label: "PDF Client Reports",
    desc: "Branded, shareable reports for sales and client delivery",
    color: "magenta",
  },
];

const colorMap = {
  cyan: {
    icon: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/25",
    glow: "shadow-[0_0_12px_rgba(0,217,255,0.3)]",
  },
  purple: {
    icon: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/25",
    glow: "shadow-[0_0_12px_rgba(168,85,247,0.3)]",
  },
  magenta: {
    icon: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/25",
    glow: "shadow-[0_0_12px_rgba(255,0,107,0.3)]",
  },
} as const;

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const search = useSearch({ strict: false }) as { redirect?: string };

  if (isAuthenticated) {
    return <Navigate to={search.redirect ?? "/"} />;
  }

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center px-4 overflow-hidden"
      data-ocid="login.page"
    >
      {/* Animated background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/assets/generated/login-hero-bg.dim_1200x800.jpg')",
        }}
      />
      {/* Deep dark overlay */}
      <div className="absolute inset-0 bg-background/80" />
      {/* Radial accent glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,51,255,0.18),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_110%,rgba(0,217,255,0.08),transparent)]" />

      {/* Animated scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
        animate={{ top: ["10%", "90%", "10%"] }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo + headline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-4 mb-10"
        >
          <div
            className="w-14 h-14 rounded-sm flex items-center justify-center"
            style={{
              background: "rgba(99, 51, 255, 0.2)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(99, 51, 255, 0.4)",
              boxShadow:
                "0 0 24px rgba(99,51,255,0.5), 0 0 48px rgba(99,51,255,0.2), inset 0 0 16px rgba(99,51,255,0.1)",
            }}
          >
            <MapPin className="w-7 h-7 text-purple-300" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="font-display font-semibold text-2xl text-foreground tracking-tight">
              Local Rank Tracker
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5 font-body leading-relaxed">
              Google's local results aren't the same everywhere.{" "}
              <span className="text-cyan-400/80">
                Map your rankings across every mile.
              </span>
            </p>
          </div>
        </motion.div>

        {/* Feature cards */}
        <div className="space-y-2.5 mb-8">
          {features.map(({ icon: Icon, label, desc, color }, i) => {
            const c = colorMap[color];
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                className={`flex items-start gap-3 p-3 rounded-sm border ${c.border} ${c.glow}`}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className={`w-7 h-7 ${c.bg} rounded-sm flex items-center justify-center shrink-0 mt-0.5 border ${c.border}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${c.icon}`} />
                </div>
                <div>
                  <p className={`text-xs font-semibold font-display ${c.icon}`}>
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    {desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <button
            type="button"
            className="w-full h-11 font-display font-semibold text-sm rounded-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70"
            style={{
              background: isLoading
                ? "rgba(99,51,255,0.3)"
                : "linear-gradient(135deg, rgba(99,51,255,0.9) 0%, rgba(0,140,255,0.9) 100%)",
              border: "1px solid rgba(120,80,255,0.6)",
              boxShadow:
                "0 0 20px rgba(99,51,255,0.4), 0 0 40px rgba(99,51,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
              color: "#fff",
            }}
            onClick={login}
            disabled={isLoading}
            data-ocid="login.submit_button"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                Sign in with Internet Identity
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-xs text-center text-muted-foreground mt-3 font-body">
            Secure, anonymous login — no passwords required.
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-4 text-xs text-muted-foreground/60 font-body z-10">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
