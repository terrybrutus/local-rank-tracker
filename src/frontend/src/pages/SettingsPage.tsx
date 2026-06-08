import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useClearSerpApiKey,
  useSerpApiKey,
  useSetSerpApiKey,
} from "@/hooks/useBackend";
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Save,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: currentKey, isLoading } = useSerpApiKey();
  const { mutate: saveKey, isPending: isSaving } = useSetSerpApiKey();
  const { mutate: clearKey, isPending: isClearing } = useClearSerpApiKey();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isPending = isSaving || isClearing;

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      toast.error("Enter a valid API key");
      return;
    }
    saveKey(trimmed, {
      onSuccess: () => {
        toast.success("SerpAPI key saved successfully");
        setApiKey("");
      },
      onError: () => toast.error("Failed to save key — please try again"),
    });
  };

  const handleClear = () => {
    clearKey(undefined, {
      onSuccess: () => {
        toast.success("API key removed");
        setShowClearConfirm(false);
      },
      onError: () => toast.error("Failed to remove key"),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto px-4 sm:px-6 py-8"
      data-ocid="settings.page"
    >
      <div className="mb-8">
        <h1 className="font-display font-semibold text-xl text-foreground">
          Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure your account and integrations
        </p>
      </div>

      {/* SerpAPI Section */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="rounded-sm overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow:
            "0 4px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Section header */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0"
            style={{
              background: "rgba(99,51,255,0.15)",
              border: "1px solid rgba(99,51,255,0.35)",
              boxShadow: "0 0 12px rgba(99,51,255,0.25)",
            }}
          >
            <Key className="w-4 h-4 text-purple-300" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-sm text-foreground">
              SerpAPI Key
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Powers Google Maps ranking lookups for your grid scans
            </p>
          </div>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Credit cost callout — sci-fi info panel */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-start gap-3 p-4 rounded-sm"
            style={{
              background: "rgba(0,217,255,0.06)",
              border: "1px solid rgba(0,217,255,0.2)",
              boxShadow: "0 0 20px rgba(0,217,255,0.06) inset",
            }}
          >
            <AlertCircle
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{
                color: "rgb(34,211,238)",
                filter: "drop-shadow(0 0 4px rgba(0,217,255,0.6))",
              }}
            />
            <div className="text-xs leading-relaxed">
              <span
                className="font-semibold font-mono"
                style={{
                  color: "rgb(103,232,249)",
                  textShadow: "0 0 6px rgba(0,217,255,0.4)",
                }}
              >
                Each 3×3 grid scan uses 9 API credits
              </span>
              <span className="text-muted-foreground">
                {" "}
                — one request per grid point. On SerpAPI's free plan (100
                searches/month), you get ~11 full scans. Failed requests do not
                count against your quota.
              </span>
            </div>
          </motion.div>

          {/* Current key status */}
          {isLoading ? (
            <Skeleton className="h-9 w-52 opacity-30" />
          ) : currentKey ? (
            <div
              className="flex items-center justify-between gap-3 p-3 rounded-sm"
              style={{
                background: "rgba(0,217,255,0.07)",
                border: "1px solid rgba(0,217,255,0.25)",
                boxShadow: "0 0 12px rgba(0,217,255,0.08) inset",
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle
                  className="w-4 h-4 shrink-0"
                  style={{
                    color: "rgb(34,211,238)",
                    filter: "drop-shadow(0 0 3px rgba(0,217,255,0.5))",
                  }}
                />
                <span
                  className="text-xs font-mono truncate"
                  style={{
                    color: "rgb(103,232,249)",
                    textShadow: "0 0 6px rgba(0,217,255,0.3)",
                    letterSpacing: "0.05em",
                  }}
                >
                  Active: {currentKey.slice(0, 8)}
                  {"•".repeat(Math.min(8, currentKey.length - 8))}
                </span>
              </div>
              {!showClearConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs text-muted-foreground hover:text-rose-400 transition-colors shrink-0 font-mono"
                  data-ocid="settings.clear_key_button"
                >
                  Remove
                </button>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground font-mono">
                    Confirm?
                  </span>
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={isPending}
                    className="text-xs font-mono font-medium transition-colors disabled:opacity-50"
                    style={{ color: "rgb(251,113,133)" }}
                    data-ocid="settings.confirm_clear_button"
                  >
                    {isClearing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Yes, remove"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
                    data-ocid="settings.cancel_clear_button"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex items-center gap-2 p-3 rounded-sm"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">
                No API key configured.{" "}
                <a
                  href="https://serpapi.com/users/sign_up"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{
                    color: "rgb(0,217,255)",
                    textDecoration: "underline",
                  }}
                >
                  Sign up for SerpAPI
                </a>{" "}
                to get your free key.
              </span>
            </div>
          )}

          {/* Key input form */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="serpApiKey"
                className="text-xs font-medium text-foreground"
              >
                {currentKey ? "Update API Key" : "Enter API Key"}
              </Label>
              <div className="relative">
                <Input
                  id="serpApiKey"
                  type={showKey ? "text" : "password"}
                  placeholder="e.g. abc123def456…"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className="h-9 text-sm font-mono pr-10 transition-all duration-200"
                  style={{
                    background: "rgba(99,51,255,0.07)",
                    border: "1px solid rgba(99,51,255,0.3)",
                    color: "rgb(216,180,254)",
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  data-ocid="settings.api_key_input"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "rgba(168,85,247,0.7)" }}
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                  data-ocid="settings.toggle_key_visibility"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="h-8 px-3 text-xs font-display font-semibold rounded-sm flex items-center gap-1.5 transition-all duration-300 disabled:opacity-50"
                style={{
                  background: apiKey.trim()
                    ? "linear-gradient(135deg, rgba(99,51,255,0.9) 0%, rgba(0,140,255,0.9) 100%)"
                    : "rgba(99,51,255,0.2)",
                  border: "1px solid rgba(120,80,255,0.5)",
                  boxShadow: apiKey.trim()
                    ? "0 0 16px rgba(99,51,255,0.35), inset 0 1px 0 rgba(255,255,255,0.1)"
                    : "none",
                  color: "#fff",
                }}
                onClick={handleSave}
                disabled={isPending || !apiKey.trim()}
                data-ocid="settings.save_api_key_button"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {currentKey ? "Update Key" : "Save Key"}
              </button>
              {!apiKey.trim() && (
                <span className="text-xs text-muted-foreground">
                  Paste your key above to enable save
                </span>
              )}
            </div>
          </div>

          {/* Signup link */}
          <div className="flex items-center gap-2 pt-1">
            <ExternalLink
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: "rgba(0,217,255,0.5)" }}
            />
            <p className="text-xs text-muted-foreground">
              Don't have a key?{" "}
              <a
                href="https://serpapi.com/users/sign_up"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
                style={{ color: "rgb(0,217,255)", textDecoration: "underline" }}
                data-ocid="settings.serpapi_signup_link"
              >
                Sign up at serpapi.com
              </a>{" "}
              — free plan includes 100 searches/month.
            </p>
          </div>
        </div>

        {/* Privacy footer */}
        <div
          className="px-5 py-3"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Privacy:</span> Your
            SerpAPI key is stored in your personal canister on the Internet
            Computer and is never shared with other users or visible in network
            requests.
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
}
