import type { Principal } from "@icp-sdk/core/principal";

export type SearchId = bigint;
export type UserId = Principal;
export type Timestamp = bigint;

export interface RankResult {
  lat: number;
  lng: number;
  rank?: bigint;
  pending?: boolean;
}

export interface SavedSearch {
  id: SearchId;
  userId: UserId;
  createdAt: Timestamp;
  businessName: string;
  results: RankResult[];
  address: string;
  keyword: string;
  centerLat: number;
  centerLng: number;
}

export interface SaveSearchInput {
  businessName: string;
  results: RankResult[];
  address: string;
  keyword: string;
  centerLat: number;
  centerLng: number;
}

export interface GridCell {
  lat: number;
  lng: number;
  rank: bigint | null;
  row: number;
  col: number;
  pending?: boolean;
}

export interface SummaryMetrics {
  avgRank: number | null;
  bestRank: number | null;
  worstRank: number | null;
  topThreePct: number;
  totalCells: number;
  foundCells: number;
}

export type RankTier = "success" | "mid" | "poor" | "notfound";

export function getRankTier(rank: bigint | null | undefined): RankTier {
  if (rank == null) return "notfound";
  const n = Number(rank);
  if (n <= 3) return "success";
  if (n <= 10) return "mid";
  return "poor";
}

export function computeMetrics(results: RankResult[]): SummaryMetrics {
  const total = results.length;
  const found = results.filter((r) => r.rank != null);
  const ranks = found.map((r) => Number(r.rank!));
  const topThree = found.filter((r) => Number(r.rank!) <= 3);

  return {
    avgRank:
      ranks.length > 0
        ? Math.round((ranks.reduce((a, b) => a + b, 0) / ranks.length) * 10) /
          10
        : null,
    bestRank: ranks.length > 0 ? Math.min(...ranks) : null,
    worstRank: ranks.length > 0 ? Math.max(...ranks) : null,
    topThreePct: total > 0 ? Math.round((topThree.length / total) * 100) : 0,
    totalCells: total,
    foundCells: found.length,
  };
}

export function resultsToGrid(
  results: Array<RankResult & { pending?: boolean }>,
): GridCell[][] {
  const sorted = [...results];
  const grid: GridCell[][] = [];
  for (let row = 0; row < 3; row++) {
    grid[row] = [];
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const r = sorted[idx];
      grid[row][col] = {
        lat: r?.lat ?? 0,
        lng: r?.lng ?? 0,
        rank: r?.rank != null ? r.rank : null,
        row,
        col,
        pending:
          (r as (RankResult & { pending?: boolean }) | undefined)?.pending ??
          false,
      };
    }
  }
  return grid;
}
