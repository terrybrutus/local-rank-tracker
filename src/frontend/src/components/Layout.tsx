import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  LogOut,
  MapPin,
  PlusCircle,
  Search,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const navLinks = [
  { label: "Dashboard", to: "/", icon: BarChart3 },
  { label: "New Search", to: "/search", icon: PlusCircle },
  { label: "Settings", to: "/settings", icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated, principalText, logout } = useAuth();
  const location = useLocation();

  const shortPrincipal = principalText
    ? `${principalText.slice(0, 5)}…${principalText.slice(-3)}`
    : null;

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ background: "#050510" }}
    >
      {/* Top Nav — glassmorphic command bar */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(5, 5, 20, 0.75)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(0, 217, 255, 0.15)",
          boxShadow:
            "0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(0, 217, 255, 0.08) inset",
        }}
      >
        {/* Scanning line at top of nav */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0, 217, 255, 0.8) 30%, rgba(189, 0, 255, 0.8) 70%, transparent 100%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-6">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 group"
            data-ocid="nav.logo_link"
          >
            <div
              className="logo-glow w-8 h-8 rounded-sm flex items-center justify-center relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(189, 0, 255, 0.2) 100%)",
                border: "1px solid rgba(0, 217, 255, 0.4)",
              }}
            >
              <MapPin
                className="w-4 h-4 relative z-10"
                style={{ color: "rgb(0, 217, 255)" }}
                strokeWidth={2.5}
              />
              {/* Inner glow dot */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-sm"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(0, 217, 255, 0.15) 0%, transparent 70%)",
                }}
              />
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="font-display font-bold tracking-tight text-sm"
                style={{
                  color: "rgb(0, 217, 255)",
                  textShadow: "0 0 8px rgba(0, 217, 255, 0.6)",
                }}
              >
                LOCAL RANK
              </span>
              <span
                className="font-mono text-[9px] tracking-[0.2em] uppercase"
                style={{
                  color: "rgba(189, 0, 255, 0.9)",
                  textShadow: "0 0 6px rgba(189, 0, 255, 0.5)",
                }}
              >
                TRACKER
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          {isAuthenticated && (
            <nav
              className="hidden sm:flex items-center gap-1 flex-1"
              aria-label="Main navigation"
            >
              {navLinks.map(({ label, to, icon: Icon }) => {
                const active =
                  location.pathname === to ||
                  (to !== "/" && location.pathname.startsWith(to));
                return (
                  <Link
                    key={to}
                    to={to}
                    data-ocid={`nav.${label.toLowerCase().replace(" ", "_")}_link`}
                    className={[
                      "relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-all duration-200",
                      active ? "nav-link-active" : "nav-link-hover",
                    ].join(" ")}
                    style={
                      active
                        ? {
                            background: "rgba(0, 217, 255, 0.08)",
                            border: "1px solid rgba(0, 217, 255, 0.2)",
                            color: "rgb(0, 217, 255)",
                          }
                        : {
                            color: "rgba(200, 200, 220, 0.7)",
                            border: "1px solid transparent",
                          }
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-sm"
                        style={{
                          background:
                            "radial-gradient(ellipse at center, rgba(0, 217, 255, 0.05) 0%, transparent 70%)",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right — principal + logout */}
          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated && shortPrincipal && (
              <>
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-sm"
                  style={{
                    background: "rgba(0, 217, 255, 0.06)",
                    border: "1px solid rgba(0, 217, 255, 0.15)",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-sm flex items-center justify-center"
                    style={{
                      background: "rgba(0, 217, 255, 0.15)",
                      border: "1px solid rgba(0, 217, 255, 0.3)",
                    }}
                  >
                    <Search
                      className="w-2.5 h-2.5"
                      style={{ color: "rgb(0, 217, 255)" }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono"
                    style={{ color: "rgba(0, 217, 255, 0.8)" }}
                  >
                    {shortPrincipal}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  data-ocid="nav.logout_button"
                  className="h-7 px-2.5 text-xs gap-1 rounded-sm transition-all duration-200"
                  style={{
                    color: "rgba(200, 200, 220, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 relative z-10">{children}</main>

      {/* Footer */}
      <footer
        className="relative z-10"
        style={{
          background: "rgba(5, 5, 20, 0.8)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(0, 217, 255, 0.1)",
        }}
      >
        {/* Top accent line */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(189, 0, 255, 0.4) 30%, rgba(0, 217, 255, 0.4) 70%, transparent 100%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <p
            className="text-xs font-body"
            style={{ color: "rgba(150, 150, 180, 0.7)" }}
          >
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-200 hover:underline underline-offset-2"
              style={{ color: "rgba(0, 217, 255, 0.8)" }}
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-1.5">
            <MapPin
              className="w-3 h-3"
              style={{ color: "rgba(189, 0, 255, 0.7)" }}
            />
            <span
              className="text-xs font-mono tracking-wide"
              style={{ color: "rgba(150, 150, 180, 0.6)" }}
            >
              LOCAL RANK TRACKER
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
