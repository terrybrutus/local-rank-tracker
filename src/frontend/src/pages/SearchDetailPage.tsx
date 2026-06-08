import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSavedSearch } from "@/hooks/useBackend";
import { computeMetrics, resultsToGrid } from "@/types";

import { RankGrid } from "@/components/RankGrid";
import { SummaryBar } from "@/components/SummaryBar";
import { exportToPdf } from "@/utils/pdf";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export default function SearchDetailPage() {
  const { id } = useParams({ strict: false });
  const searchId = id != null ? BigInt(id) : null;
  const { data: search, isLoading } = useSavedSearch(searchId ?? BigInt(0));

  if (isLoading) {
    return (
      <div
        className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4"
        data-ocid="search_detail.loading_state"
      >
        <Skeleton className="h-6 w-48 opacity-30" />
        <Skeleton className="h-24 w-full opacity-20" />
        <Skeleton className="h-64 w-full opacity-20" />
      </div>
    );
  }

  if (!search) {
    return (
      <div
        className="max-w-5xl mx-auto px-4 sm:px-6 py-8"
        data-ocid="search_detail.error_state"
      >
        <p className="text-sm text-muted-foreground">Search not found.</p>
        <Link to="/">
          <Button
            type="button"
            variant="link"
            size="sm"
            className="pl-0 mt-2 gap-1 text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const grid = resultsToGrid(search.results);
  const metrics = computeMetrics(search.results);
  const date = new Date(
    Number(search.createdAt) / 1_000_000,
  ).toLocaleDateString();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 py-8"
      data-ocid="search_detail.page"
    >
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2 mb-6"
      >
        <Link to="/" data-ocid="search_detail.back_link">
          <button
            type="button"
            className="h-7 px-2 text-xs gap-1.5 flex items-center rounded-sm transition-all duration-200 font-display text-muted-foreground hover:text-cyan-400"
            style={{ background: "transparent" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </button>
        </Link>
        <span
          className="text-muted-foreground/40 text-xs"
          style={{ fontFamily: "monospace" }}
        >
          /
        </span>
        <span
          className="text-xs font-medium font-mono"
          style={{
            color: "rgba(0,217,255,0.8)",
            textShadow: "0 0 8px rgba(0,217,255,0.4)",
          }}
        >
          {search.businessName}
        </span>
      </motion.div>

      {/* Title + Export */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex items-start justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="font-display font-semibold text-xl text-foreground">
            {search.businessName}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{
                  background: "rgba(168,85,247,0.8)",
                  boxShadow: "0 0 4px rgba(168,85,247,0.8)",
                }}
              />
              {search.address}
            </span>
            <span
              className="font-mono"
              style={{ color: "rgba(0,217,255,0.7)" }}
            >
              {search.keyword}
            </span>
            <span>{date}</span>
          </div>
        </div>
        <button
          type="button"
          className="h-8 px-3 text-xs gap-1.5 font-display font-semibold rounded-sm flex items-center shrink-0 transition-all duration-300"
          style={{
            background: "rgba(0,217,255,0.1)",
            border: "1px solid rgba(0,217,255,0.35)",
            boxShadow:
              "0 0 12px rgba(0,217,255,0.2), inset 0 1px 0 rgba(0,217,255,0.1)",
            color: "rgb(103,232,249)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(0,217,255,0.18)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 20px rgba(0,217,255,0.4), inset 0 1px 0 rgba(0,217,255,0.15)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(0,217,255,0.1)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 12px rgba(0,217,255,0.2), inset 0 1px 0 rgba(0,217,255,0.1)";
          }}
          onClick={() =>
            exportToPdf(
              search.businessName,
              search.keyword,
              search.address,
              date,
              grid,
              metrics,
            )
          }
          data-ocid="search_detail.export_button"
        >
          <Download className="w-3.5 h-3.5" /> Export PDF
        </button>
      </motion.div>

      {/* Summary + Grid in glassmorphic container */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="rounded-sm p-5 mb-5"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow:
            "0 4px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <SummaryBar metrics={metrics} className="mb-5" />
        <RankGrid
          cells={grid}
          title={`Local Rank Heatmap — ${search.keyword}`}
          data-ocid="search_detail.grid"
        />
      </motion.div>

      {/* Explainer blurb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-sm p-4"
        style={{
          background: "rgba(0,217,255,0.04)",
          border: "1px solid rgba(0,217,255,0.15)",
          boxShadow: "0 0 20px rgba(0,217,255,0.05) inset",
        }}
      >
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-cyan-400 font-semibold">
            Why does this matter?
          </span>{" "}
          Google's local results aren't uniform — your business might rank #1
          directly at your address but rank #8 just a mile away. This grid maps
          that visibility gap so you can see where your local SEO is strong and
          where it needs work.
        </p>
      </motion.div>
    </motion.div>
  );
}
