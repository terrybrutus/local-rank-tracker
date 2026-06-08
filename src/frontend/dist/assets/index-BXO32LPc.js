function getRankTier(rank) {
  if (rank == null) return "notfound";
  const n = Number(rank);
  if (n <= 3) return "success";
  if (n <= 10) return "mid";
  return "poor";
}
function computeMetrics(results) {
  const total = results.length;
  const found = results.filter((r) => r.rank != null);
  const ranks = found.map((r) => Number(r.rank));
  const topThree = found.filter((r) => Number(r.rank) <= 3);
  return {
    avgRank: ranks.length > 0 ? Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length * 10) / 10 : null,
    bestRank: ranks.length > 0 ? Math.min(...ranks) : null,
    worstRank: ranks.length > 0 ? Math.max(...ranks) : null,
    topThreePct: total > 0 ? Math.round(topThree.length / total * 100) : 0,
    totalCells: total,
    foundCells: found.length
  };
}
function resultsToGrid(results) {
  const sorted = [...results];
  const grid = [];
  for (let row = 0; row < 3; row++) {
    grid[row] = [];
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const r = sorted[idx];
      grid[row][col] = {
        lat: (r == null ? void 0 : r.lat) ?? 0,
        lng: (r == null ? void 0 : r.lng) ?? 0,
        rank: (r == null ? void 0 : r.rank) != null ? r.rank : null,
        row,
        col,
        pending: (r == null ? void 0 : r.pending) ?? false
      };
    }
  }
  return grid;
}
export {
  computeMetrics as c,
  getRankTier as g,
  resultsToGrid as r
};
