import Map "mo:core/Map";
import List "mo:core/List";
import Common "../types/common";
import Types "../types/searches";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";

module {
  public type State = {
    searches     : Map.Map<Common.SearchId, Types.SavedSearch>;
    counterState : { var nextId : Common.SearchId };
    partialScans : Map.Map<Common.UserId, Types.PartialScan>;
  };

  public func initState() : State {
    {
      searches     = Map.empty<Common.SearchId, Types.SavedSearch>();
      counterState = { var nextId = 0 };
      partialScans = Map.empty<Common.UserId, Types.PartialScan>();
    };
  };

  /// Start or replace a partial scan record for a user.
  public func savePartialScan(
    state    : State,
    caller   : Common.UserId,
    partial  : Types.PartialScan,
  ) : () {
    state.partialScans.add(caller, partial);
  };

  /// Append one more result to the user's in-progress partial scan.
  public func appendPartialResult(
    state    : State,
    caller   : Common.UserId,
    result   : Types.RankResult,
  ) : () {
    switch (state.partialScans.get(caller)) {
      case null {}; // no partial scan — silently ignore
      case (?ps) {
        let updated : Types.PartialScan = { ps with results = ps.results.concat([result]) };
        state.partialScans.add(caller, updated);
      };
    };
  };

  /// Return whatever partial scan exists for the user (may be null).
  public func getPartialScan(
    state  : State,
    caller : Common.UserId,
  ) : ?Types.PartialScan {
    state.partialScans.get(caller);
  };

  /// Remove the partial scan for the user (call after a successful full save).
  public func clearPartialScan(
    state  : State,
    caller : Common.UserId,
  ) : () {
    state.partialScans.remove(caller);
  };

  /// Save a new search and return its assigned ID.
  public func save(
    state        : State,
    caller       : Common.UserId,
    input        : Types.SaveSearchInput,
    now          : Common.Timestamp,
  ) : Common.SearchId {
    let id = state.counterState.nextId;
    state.counterState.nextId += 1;
    let search : Types.SavedSearch = {
      id;
      userId       = caller;
      businessName = input.businessName;
      keyword      = input.keyword;
      address      = input.address;
      centerLat    = input.centerLat;
      centerLng    = input.centerLng;
      createdAt    = now;
      results      = input.results;
    };
    state.searches.add(id, search);
    id;
  };

  /// List all searches belonging to the given user.
  public func listForUser(
    state  : State,
    caller : Common.UserId,
  ) : [Types.SavedSearch] {
    let allValues = state.searches.values();
    let filtered = List.fromIter<Types.SavedSearch>(allValues);
    let userFiltered = filtered.filter(func(s : Types.SavedSearch) : Bool {
      Principal.equal(s.userId, caller)
    });
    userFiltered.sortInPlace(func(a : Types.SavedSearch, b : Types.SavedSearch) : { #less; #equal; #greater } {
      Int.compare(b.createdAt, a.createdAt)
    });
    userFiltered.toArray();
  };

  /// Retrieve a single search by ID; returns null if not found or not owned by caller.
  public func getById(
    state    : State,
    caller   : Common.UserId,
    searchId : Common.SearchId,
  ) : ?Types.SavedSearch {
    switch (state.searches.get(searchId)) {
      case (?s) {
        if (Principal.equal(s.userId, caller)) { ?s } else { null };
      };
      case null { null };
    };
  };

  /// Delete a search; traps if not found or not owned by caller.
  public func deleteById(
    state    : State,
    caller   : Common.UserId,
    searchId : Common.SearchId,
  ) : () {
    switch (state.searches.get(searchId)) {
      case (?s) {
        if (not Principal.equal(s.userId, caller)) {
          Runtime.trap("Unauthorized: cannot delete another user's search");
        };
        state.searches.remove(searchId);
      };
      case null {
        Runtime.trap("Search not found");
      };
    };
  };
};
