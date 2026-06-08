import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import SettingsLib "../lib/settings";
import SerpLib "../lib/serp";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import SearchLib "../lib/searches";
import SearchTypes "../types/searches";
import Time "mo:core/Time";

mixin (
  accessControlState : AccessControl.AccessControlState,
  settingsState      : SettingsLib.State,
  searchState        : SearchLib.State,
) {
  /// IC-required transform function for HTTP outcalls.
  public query func transform(
    input : OutCall.TransformationInput,
  ) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  /// Query SerpAPI for a single grid point and return the rank of businessName.
  /// Uses the caller's stored SerpAPI key.
  public shared ({ caller }) func queryGridPoint(
    businessName : Text,
    keyword      : Text,
    lat          : Float,
    lng          : Float,
    gridIndex    : Nat,
  ) : async ?Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let apiKey = switch (SettingsLib.getSerpApiKey(settingsState, caller)) {
      case (?k) {
        if (k.size() == 0) {
          Runtime.trap("No SerpAPI key configured. Please add your API key in Settings.");
        };
        k;
      };
      case null { Runtime.trap("No SerpAPI key configured. Please add your API key in Settings.") };
    };
    let url = SerpLib.buildUrl(apiKey, keyword, lat, lng);
    let rawJson = await OutCall.httpGetRequest(url, [], transform);
    let parseResult = SerpLib.parseRank(businessName, rawJson);
    let rank = parseResult.rank;
    // Persist this result immediately to the partial scan
    let result : SearchTypes.RankResult = { rank; lat; lng };
    SearchLib.appendPartialResult(searchState, caller, result);
    rank;
  };

  /// Start a new partial scan session, recording the scan metadata before grid points execute.
  public shared ({ caller }) func startScan(
    businessName : Text,
    keyword      : Text,
    address      : Text,
    centerLat    : Float,
    centerLng    : Float,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let partial : SearchTypes.PartialScan = {
      businessName;
      keyword;
      address      = SerpLib.normalizeAddress(address);
      centerLat;
      centerLng;
      startedAt    = Time.now();
      results      = [];
    };
    SearchLib.savePartialScan(searchState, caller, partial);
  };

  /// Return the current partial scan for the caller (if any).
  public query ({ caller }) func getLastPartialScan() : async ?SearchTypes.PartialScan {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SearchLib.getPartialScan(searchState, caller);
  };

  /// Clear the partial scan after a successful full save.
  public shared ({ caller }) func clearLastPartialScan() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SearchLib.clearPartialScan(searchState, caller);
  };

  /// Compute and return the 9 grid-point coordinates for the given centre.
  public query func getGridPoints(
    centerLat : Float,
    centerLng : Float,
  ) : async [(Float, Float)] {
    SerpLib.gridPoints(centerLat, centerLng);
  };
};
