import Map "mo:core/Map";
import Common "../types/common";
import Types "../types/settings";

module {
  public type State = {
    settings : Map.Map<Common.UserId, Types.UserSettings>;
  };

  public func initState() : State {
    { settings = Map.empty<Common.UserId, Types.UserSettings>() };
  };

  /// Get the stored SerpAPI key for the caller, or null if not set.
  public func getSerpApiKey(
    state  : State,
    caller : Common.UserId,
  ) : ?Text {
    switch (state.settings.get(caller)) {
      case (?s) { ?s.serpApiKey };
      case null { null };
    };
  };

  /// Store or replace the SerpAPI key for the caller.
  public func setSerpApiKey(
    state  : State,
    caller : Common.UserId,
    apiKey : Text,
  ) : () {
    state.settings.add(caller, { userId = caller; serpApiKey = apiKey });
  };
};
