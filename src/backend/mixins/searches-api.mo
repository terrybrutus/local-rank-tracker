import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import SearchLib "../lib/searches";
import Common "../types/common";
import Types "../types/searches";

mixin (
  accessControlState : AccessControl.AccessControlState,
  searchState        : SearchLib.State,
) {
  /// Save a completed search for the authenticated caller.
  public shared ({ caller }) func saveSearch(
    input : Types.SaveSearchInput,
  ) : async Common.SearchId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SearchLib.save(searchState, caller, input, Time.now());
  };

  /// List all saved searches belonging to the authenticated caller.
  public query ({ caller }) func listSavedSearches() : async [Types.SavedSearch] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SearchLib.listForUser(searchState, caller);
  };

  /// Retrieve a single saved search by ID.
  public query ({ caller }) func getSavedSearch(
    searchId : Common.SearchId,
  ) : async ?Types.SavedSearch {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SearchLib.getById(searchState, caller, searchId);
  };

  /// Delete a saved search by ID.
  public shared ({ caller }) func deleteSavedSearch(
    searchId : Common.SearchId,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SearchLib.deleteById(searchState, caller, searchId);
  };
};
