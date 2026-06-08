import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteSearch, useSavedSearches } from "@/hooks/useBackend";
import { computeMetrics, getRankTier } from "@/types";
import type { RankResult, SavedSearch } from "@/types";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  MapPin,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

function MiniGrid({ results }: { results: RankResult[] }) {
  const COLORS: Record<string, string> = {
    success: "#22c55e",
    mid: "#f59e0b",
    poor: "#ef4444",
    notfound: "#374151",
  };
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 3,
        width: 42,
        flexShrink: 0,
      }}
      title="Rank grid preview"
    >
      {results.slice(0, 9).map((r, i) => {
        const rankVal =
          r.rank != null
            ? typeof r.rank === "bigint"
              ? r.rank
              : BigInt(r.rank as unknown as number)
            : null;
        const tier = getRankTier(rankVal);
        return (
          <div
            key={`${r.lat},${r.lng}`}
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: COLORS[tier],
              opacity: tier === "notfound" ? 0.35 : 0.82,
            }}
          />
        );
      })}
    </div>
  );
}

function SearchCard({
  search,
  onDelete,
  onRerun,
  index,
}: {
  search: SavedSearch;
  onDelete: (id: bigint) => void;
  onRerun: (search: SavedSearch) => void;
  index: number;
}) {
  const navigate = useNavigate();
  const metrics = computeMetrics(search.results);
  const date = new Date(Number(search.createdAt) / 1_000_000);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ scale: 1.015, translateY: -2 }}
      className="flex flex-col gap-3 cursor-pointer text-left w-full rounded-sm transition-all duration-300 group"
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.border =
          "1px solid rgba(99,51,255,0.5)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 0 24px rgba(99,51,255,0.2), 0 4px 24px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.border =
          "1px solid rgba(255,255,255,0.1)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 24px rgba(0,0,0,0.3)";
      }}
      data-ocid={`dashboard.search.item.${Number(search.id)}`}
      onClick={() =>
        navigate({ to: "/search/$id", params: { id: search.id.toString() } })
      }
      aria-label={`View ${search.businessName} — ${search.keyword}`}
    >
      {/* Card header */}
      <div className="px-4 pt-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-sm text-foreground truncate">
            {search.businessName}
          </h3>
          <p className="text-xs text-cyan-400/70 mt-0.5 font-mono truncate">
            {search.keyword}
          </p>
        </div>
        <MiniGrid results={search.results} />
      </div>

      {/* Meta row */}
      <div className="px-4 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0 text-purple-400/60" />
          <span className="truncate">{search.address}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="w-3 h-3 shrink-0 text-purple-400/60" />
          <span>{dateStr}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 flex gap-2 text-xs font-mono">
        <span
          className="px-2 py-1 rounded-sm whitespace-nowrap text-cyan-300 border border-cyan-500/25"
          style={{ background: "rgba(0,217,255,0.08)" }}
        >
          Best: #{metrics.bestRank ?? "—"}
        </span>
        <span
          className="px-2 py-1 rounded-sm whitespace-nowrap text-purple-300 border border-purple-500/25"
          style={{ background: "rgba(168,85,247,0.08)" }}
        >
          Top 3: {metrics.topThreePct}%
        </span>
        <span
          className="px-2 py-1 rounded-sm whitespace-nowrap text-muted-foreground border border-border"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          Avg: {metrics.avgRank != null ? `#${metrics.avgRank}` : "—"}
        </span>
      </div>

      {/* Actions */}
      <div
        className="px-4 pb-4 flex gap-2"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="presentation"
      >
        <Link
          to="/search/$id"
          params={{ id: search.id.toString() }}
          className="flex-1"
          data-ocid={`dashboard.view_button.${Number(search.id)}`}
        >
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full h-7 text-xs gap-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200"
          >
            <TrendingUp className="w-3 h-3" /> View Grid
          </Button>
        </Link>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-cyan-400 hover:border-cyan-500/40"
          onClick={() => onRerun(search)}
          data-ocid={`dashboard.rerun_button.${Number(search.id)}`}
          aria-label="Re-run search"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-rose-400"
          onClick={() => onDelete(search.id)}
          data-ocid={`dashboard.delete_button.${Number(search.id)}`}
          aria-label="Delete search"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </motion.button>
  );
}

export default function DashboardPage() {
  const { data: searches, isLoading } = useSavedSearches();
  const { mutate: deleteSearch, isPending: isDeleting } = useDeleteSearch();
  const navigate = useNavigate();

  const [filter, setFilter] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<bigint | null>(null);

  const filtered = (searches ?? []).filter((s) => {
    const q = filter.toLowerCase();
    return (
      s.businessName.toLowerCase().includes(q) ||
      s.keyword.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  const handleDeleteRequest = (id: bigint) => setPendingDeleteId(id);

  const handleDeleteConfirm = () => {
    if (pendingDeleteId == null) return;
    deleteSearch(pendingDeleteId, {
      onSuccess: () => {
        toast.success("Search deleted");
        setPendingDeleteId(null);
      },
      onError: () => {
        toast.error("Failed to delete search");
        setPendingDeleteId(null);
      },
    });
  };

  const handleRerun = (search: SavedSearch) => {
    navigate({
      to: "/search",
      search: (prev) => ({
        ...prev,
        businessName: search.businessName,
        keyword: search.keyword,
        address: search.address,
      }),
    });
  };

  const pendingSearch = searches?.find((s) => s.id === pendingDeleteId);

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
      data-ocid="dashboard.page"
    >
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="font-display font-semibold text-lg text-foreground">
            Saved Searches
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {searches && searches.length > 0
              ? `${searches.length} tracked ${
                  searches.length === 1 ? "business" : "businesses"
                }`
              : "Your tracked businesses and their grid rankings"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {searches && searches.length > 0 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-400/50 pointer-events-none" />
              <Input
                placeholder="Filter searches…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-8 h-8 text-xs w-44 sm:w-52 border-border/60 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(8px)",
                }}
                data-ocid="dashboard.filter_input"
              />
            </div>
          )}
          <Link
            to="/search"
            search={{
              businessName: undefined,
              keyword: undefined,
              address: undefined,
            }}
            data-ocid="dashboard.new_search_button"
          >
            <button
              type="button"
              className="h-8 px-3 text-xs gap-1.5 font-display font-semibold rounded-sm flex items-center whitespace-nowrap transition-all duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99,51,255,0.9) 0%, rgba(0,140,255,0.9) 100%)",
                border: "1px solid rgba(120,80,255,0.6)",
                boxShadow:
                  "0 0 16px rgba(99,51,255,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
                color: "#fff",
              }}
            >
              <PlusCircle className="w-3.5 h-3.5" /> New Search
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Search list */}
      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="dashboard.loading_state"
        >
          {["skel-a", "skel-b", "skel-c"].map((key) => (
            <Skeleton key={key} className="h-48 rounded-sm opacity-30" />
          ))}
        </div>
      ) : sorted.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="dashboard.list"
        >
          {sorted.map((s, i) => (
            <SearchCard
              key={s.id.toString()}
              search={s}
              onDelete={handleDeleteRequest}
              onRerun={handleRerun}
              index={i}
            />
          ))}
        </div>
      ) : filter && searches && searches.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-3 rounded-sm border"
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
          data-ocid="dashboard.no_results_state"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No searches match &ldquo;{filter}&rdquo;
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-cyan-400 hover:text-cyan-300"
            onClick={() => setFilter("")}
          >
            Clear filter
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-20 gap-5 rounded-sm border"
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(99,51,255,0.2)",
            boxShadow: "0 0 40px rgba(99,51,255,0.08) inset",
          }}
          data-ocid="dashboard.empty_state"
        >
          {/* Animated icon */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="w-14 h-14 rounded-sm flex items-center justify-center"
            style={{
              background: "rgba(99,51,255,0.15)",
              border: "1px solid rgba(99,51,255,0.35)",
              boxShadow:
                "0 0 20px rgba(99,51,255,0.3), inset 0 0 12px rgba(99,51,255,0.1)",
            }}
          >
            <Search className="w-6 h-6 text-purple-300" />
          </motion.div>
          <div className="text-center">
            <p className="text-sm font-display font-semibold text-foreground">
              No searches yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Run your first rank check to map your local SEO visibility across
              a 3×3 geographic grid
            </p>
          </div>
          <Link
            to="/search"
            search={{
              businessName: undefined,
              keyword: undefined,
              address: undefined,
            }}
            data-ocid="dashboard.empty_cta_button"
          >
            <button
              type="button"
              className="h-9 px-4 text-xs gap-1.5 font-display font-semibold rounded-sm flex items-center transition-all duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99,51,255,0.9) 0%, rgba(0,140,255,0.9) 100%)",
                border: "1px solid rgba(120,80,255,0.6)",
                boxShadow:
                  "0 0 20px rgba(99,51,255,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                color: "#fff",
              }}
            >
              <PlusCircle className="w-3.5 h-3.5" /> Start Tracking
            </button>
          </Link>
        </motion.div>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={pendingDeleteId != null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent
          data-ocid="dashboard.delete_dialog"
          style={{
            background: "rgba(20,16,40,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,50,50,0.2)",
            boxShadow: "0 0 40px rgba(0,0,0,0.6)",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">
              Delete this search?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingSearch ? (
                <>
                  <strong className="text-foreground">
                    {pendingSearch.businessName}
                  </strong>{" "}
                  — &ldquo;{pendingSearch.keyword}&rdquo; at{" "}
                  {pendingSearch.address}. This action cannot be undone.
                </>
              ) : (
                "This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="dashboard.delete_cancel_button"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-500 text-white border-rose-500/50"
              style={{ boxShadow: "0 0 12px rgba(244,63,94,0.3)" }}
              data-ocid="dashboard.delete_confirm_button"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
