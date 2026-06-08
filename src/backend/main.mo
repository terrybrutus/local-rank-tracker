import AccessControl "mo:caffeineai-authorization/access-control";

import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import SearchLib "lib/searches";
import SettingsLib "lib/settings";
import SearchesMixin "mixins/searches-api";
import SettingsMixin "mixins/settings-api";
import SerpMixin "mixins/serp-api";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let searchState = SearchLib.initState();
  let settingsState = SettingsLib.initState();

  include SearchesMixin(accessControlState, searchState);
  include SettingsMixin(accessControlState, settingsState);
  include SerpMixin(accessControlState, settingsState, searchState);
};
