import Common "common";

module {
  /// Rank result for a single grid point.
  /// rank = null means the business was not found in results (distinct from ranked 11+).
  public type RankResult = {
    rank : ?Nat;       // null = not found; Nat = 1-indexed position
    lat  : Float;
    lng  : Float;
  };

  public type SavedSearch = {
    id          : Common.SearchId;
    userId      : Common.UserId;
    businessName : Text;
    keyword     : Text;
    address     : Text;
    centerLat   : Float;
    centerLng   : Float;
    createdAt   : Common.Timestamp;
    results     : [RankResult];   // 9 elements, left-to-right, top-to-bottom
  };

  /// A partial (in-progress) scan for a user — stores completed grid points so far.
  public type PartialScan = {
    businessName : Text;
    keyword      : Text;
    address      : Text;
    centerLat    : Float;
    centerLng    : Float;
    startedAt    : Common.Timestamp;
    results      : [RankResult];   // may be 0–8 elements while scan is in progress
  };

  /// Input type accepted by saveSearch.
  public type SaveSearchInput = {
    businessName : Text;
    keyword      : Text;
    address      : Text;
    centerLat    : Float;
    centerLng    : Float;
    results      : [RankResult];
  };
};
