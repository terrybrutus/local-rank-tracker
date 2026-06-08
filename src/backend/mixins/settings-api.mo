import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import SettingsLib "../lib/settings";

mixin (
  accessControlState : AccessControl.AccessControlState,
  settingsState      : SettingsLib.State,
) {
  /// Get the caller's stored SerpAPI key (null if not yet set).
  public query ({ caller }) func getSerpApiKey() : async ?Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SettingsLib.getSerpApiKey(settingsState, caller);
  };

  /// Store or replace the caller's SerpAPI key.
  public shared ({ caller }) func setSerpApiKey(apiKey : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    SettingsLib.setSerpApiKey(settingsState, caller, apiKey);
  };
};
