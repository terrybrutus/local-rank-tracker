import Text "mo:core/Text";
import Float "mo:core/Float";
import Char "mo:core/Char";
import Array "mo:core/Array";
import Nat "mo:core/Nat";

module {
  // 1 mile in degrees latitude: 1 / 69.0
  let MILE_LAT : Float = 0.014492753623;

  /// Build the SerpAPI Google Maps local-search URL for a given grid point.
  public func buildUrl(
    apiKey       : Text,
    keyword      : Text,
    lat          : Float,
    lng          : Float,
  ) : Text {
    let latStr = floatToText(lat);
    let lngStr = floatToText(lng);
    "https://serpapi.com/search.json?engine=google_maps&type=search&q=" # urlEncode(keyword) #
    "&ll=@" # latStr # "," # lngStr # ",14z&api_key=" # apiKey;
  };

  /// Parse the rank of businessName from a raw JSON response returned by SerpAPI.
  /// Returns a record { rank : ?Nat; resultsFound : Nat }.
  /// rank = null when the business is not present in the result list.
  /// Uses simple text scanning to extract position/title pairs without a full JSON parser.
  public func parseRank(
    businessName : Text,
    rawJson      : Text,
  ) : { rank : ?Nat; resultsFound : Nat } {
    let normName = normalize(businessName);
    let chars = rawJson.toArray();
    let len = chars.size();

    // Find the start of the results array — try "local_results" first, then "place_results"
    let searchStart : Nat = label findStart : Nat {
      switch (indexOfChars(chars, 0, "\"local_results\"".toArray())) {
        case (?i) { break findStart i };
        case null {};
      };
      switch (indexOfChars(chars, 0, "\"place_results\"".toArray())) {
        case (?i) { break findStart i };
        case null {};
      };
      // Neither found — no results
      return { rank = null; resultsFound = 0 };
    };

    // Collect all (position, titleChars-start) pairs by scanning for "position": and "title":
    // We scan the substring after searchStart and build pairs within a window.
    var positions : [(Nat, Nat)] = []; // (charOffset, value)
    var titles    : [(Nat, Text)] = []; // (charOffset, value)

    let posNeedle   = "\"position\":".toArray();
    let titleNeedle = "\"title\":".toArray();

    var idx = searchStart;
    while (idx < len) {
      // Try to match "position":
      if (idx + posNeedle.size() <= len and charsEqual(chars, idx, posNeedle)) {
        let afterColon = idx + posNeedle.size();
        switch (scanNat(chars, afterColon)) {
          case (?n) { positions := positions.concat([(idx, n)]) };
          case null {};
        };
        idx += posNeedle.size();
      } else if (idx + titleNeedle.size() <= len and charsEqual(chars, idx, titleNeedle)) {
        let afterColon = idx + titleNeedle.size();
        switch (scanString(chars, afterColon)) {
          case (?t) { titles := titles.concat([(idx, t)]) };
          case null {};
        };
        idx += titleNeedle.size();
      } else {
        idx += 1;
      };
    };

    let resultsCount = positions.size();

    // For each position entry, find the nearest title within a 500-char window
    for (posEntry in positions.vals()) {
      let (posOff, posVal) = posEntry;
      var bestTitle : ?Text = null;
      var bestDist  : Nat = 501;
      for (titleEntry in titles.vals()) {
        let (titleOff, titleVal) = titleEntry;
        let dist : Nat = if (posOff >= titleOff) {
          posOff - titleOff
        } else {
          titleOff - posOff
        };
        if (dist < bestDist) {
          bestDist  := dist;
          bestTitle := ?titleVal;
        };
      };
      switch (bestTitle) {
        case (?t) {
          let normTitle = normalize(t);
          if (fuzzyMatches(normName, normTitle)) {
            return { rank = ?posVal; resultsFound = resultsCount };
          };
        };
        case null {};
      };
    };

    { rank = null; resultsFound = resultsCount };
  };

  /// Compute the lat/lng offset (in degrees) for each of the 9 grid points
  /// (3x3, 1 mile apart) given a centre coordinate.
  /// Returns a 9-element array ordered row-major: NW, N, NE, W, C, E, SW, S, SE.
  public func gridPoints(
    centerLat : Float,
    centerLng : Float,
  ) : [(Float, Float)] {
    // 1 mile in degrees longitude depends on latitude
    let cosLat = Float.cos(centerLat * Float.pi / 180.0);
    let mileLng = if (cosLat > 0.0001) { MILE_LAT / cosLat } else { MILE_LAT };
    let d = MILE_LAT;
    let dLng = mileLng;
    [
      (centerLat + d,  centerLng - dLng), // NW
      (centerLat + d,  centerLng),        // N
      (centerLat + d,  centerLng + dLng), // NE
      (centerLat,      centerLng - dLng), // W
      (centerLat,      centerLng),        // Center
      (centerLat,      centerLng + dLng), // E
      (centerLat - d,  centerLng - dLng), // SW
      (centerLat - d,  centerLng),        // S
      (centerLat - d,  centerLng + dLng), // SE
    ];
  };

  /// Normalize an address/location string: trim whitespace and collapse runs.
  public func normalizeAddress(addr : Text) : Text {
    let trimmed = addr.replace(#char '\t', " ").replace(#char '\n', " ");
    // collapse multiple spaces
    var prev = trimmed;
    var cur = trimmed.replace(#text "  ", " ");
    while (cur.size() < prev.size()) {
      prev := cur;
      cur := cur.replace(#text "  ", " ");
    };
    // trim leading/trailing space by stripping from front and back
    let stripped = switch (cur.stripStart(#char ' ')) {
      case (?s) { s };
      case null { cur };
    };
    switch (stripped.stripEnd(#char ' ')) {
      case (?s) { s };
      case null { stripped };
    };
  };

  // --- Scanning helpers for JSON fields ---

  /// Check if chars[offset..] starts with needle.
  func charsEqual(chars : [Char], offset : Nat, needle : [Char]) : Bool {
    let nLen = needle.size();
    if (offset + nLen > chars.size()) return false;
    var j = 0;
    while (j < nLen) {
      if (chars[offset + j] != needle[j]) return false;
      j += 1;
    };
    true;
  };

  /// Find first occurrence of needle in chars starting from fromIdx.
  func indexOfChars(chars : [Char], fromIdx : Nat, needle : [Char]) : ?Nat {
    let hsLen = chars.size();
    let ndLen = needle.size();
    if (ndLen == 0) return ?fromIdx;
    var i = fromIdx;
    while (i + ndLen <= hsLen) {
      if (charsEqual(chars, i, needle)) return ?i;
      i += 1;
    };
    null;
  };

  /// Scan a positive integer at chars[offset], skipping leading whitespace.
  func scanNat(chars : [Char], offset : Nat) : ?Nat {
    let len = chars.size();
    var i = offset;
    // skip whitespace
    while (i < len and (chars[i] == ' ' or chars[i] == '\t')) { i += 1 };
    if (i >= len) return null;
    var num : Nat = 0;
    var hasDigit = false;
    while (i < len and chars[i] >= '0' and chars[i] <= '9') {
      num := num * 10 + (chars[i].toNat32().toNat() - 48);
      hasDigit := true;
      i += 1;
    };
    if (hasDigit) ?num else null;
  };

  /// Scan a JSON string value at chars[offset] (skips whitespace, expects opening '"').
  /// Handles escaped quotes (\") inside the string.
  func scanString(chars : [Char], offset : Nat) : ?Text {
    let len = chars.size();
    var i = offset;
    // skip whitespace
    while (i < len and (chars[i] == ' ' or chars[i] == '\t')) { i += 1 };
    if (i >= len or chars[i] != '\"') return null;
    i += 1; // skip opening quote
    var result = "";
    var escape = false;
    while (i < len) {
      let c = chars[i];
      if (escape) {
        result #= Text.fromChar(c);
        escape := false;
      } else if (c == '\\') {
        escape := true;
      } else if (c == '\"') {
        return ?result; // closing quote
      } else {
        result #= Text.fromChar(c);
      };
      i += 1;
    };
    ?result; // unterminated string — return what we have
  };

  // --- Fuzzy matching helpers ---

  /// Normalize a business name: lowercase, strip punctuation, collapse whitespace.
  /// Normalize a business name: lowercase, keep only alphanumeric chars (no spaces).
  func normalize(s : Text) : Text {
    var result = "";
    for (c in s.chars()) {
      let code = c.toNat32();
      if (
        (code >= 97 and code <= 122) or  // a-z
        (code >= 65 and code <= 90)  or  // A-Z
        (code >= 48 and code <= 57)       // 0-9
      ) {
        let lower : Char = if (code >= 65 and code <= 90) {
          Char.fromNat32(code + 32)
        } else { c };
        result #= Text.fromChar(lower);
      };
    };
    result;
  };

  /// Levenshtein edit distance between two character arrays.
  func editDistance(a : [Char], b : [Char]) : Nat {
    let aLen = a.size();
    let bLen = b.size();
    if (aLen == 0) return bLen;
    if (bLen == 0) return aLen;
    // Use two rows to save memory
    let prev = Array.tabulate(bLen + 1, func i = i);
    var prevRow : [var Nat] = prev.toVarArray<Nat>();
    var currRow : [var Nat] = Array.tabulate(bLen + 1, func _ = 0).toVarArray<Nat>();
    var i = 1;
    while (i <= aLen) {
      currRow[0] := i;
      var j = 1;
      while (j <= bLen) {
        let cost = if (a[i - 1] == b[j - 1]) { 0 } else { 1 };
        let del = prevRow[j] + 1;
        let ins = currRow[j - 1] + 1;
        let sub = prevRow[j - 1] + cost;
        currRow[j] := Nat.min(del, Nat.min(ins, sub));
        j += 1;
      };
      // swap rows
      let tmp = prevRow;
      prevRow := currRow;
      currRow := tmp;
      i += 1;
    };
    prevRow[bLen];
  };

  /// Returns true if normInput matches normCandidate using:
  ///  1. Exact substring (normInput in normCandidate, or vice-versa)
  ///  2. Levenshtein with length-proportional threshold
  /// Returns true if normInput matches normCandidate using:
  ///  1. Exact match
  ///  2. Substring containment
  ///  3. Edit distance <= max(2, len/3)
  func fuzzyMatches(normInput : Text, normCandidate : Text) : Bool {
    if (normInput.size() == 0) return false;
    if (normInput == normCandidate) return true;
    if (normCandidate.contains(#text normInput)) return true;
    if (normInput.contains(#text normCandidate)) return true;
    let inputChars = normInput.toArray();
    let candChars  = normCandidate.toArray();
    let maxLen = Nat.max(inputChars.size(), candChars.size());
    if (maxLen == 0) return true;
    let threshold = Nat.max(2, maxLen / 3);
    let dist = editDistance(inputChars, candChars);
    dist <= threshold;
  };

  // --- Private helpers ---

  func floatToText(f : Float) : Text {
    f.toText();
  };

  func urlEncode(s : Text) : Text {
    s.replace(#char ' ', "+");
  };

  /// Find the first occurrence of needle in haystack starting at fromIdx (char offset).
  /// Find the first occurrence of needle in haystack starting at fromIdx (char offset).
  func indexOfText(haystack : Text, needle : Text, fromIdx : Nat) : ?Nat {
    indexOfChars(haystack.toArray(), fromIdx, needle.toArray());
  };



  /// Return text starting from char offset start.
  /// Return text starting from char offset start.
  func textDropChars(t : Text, start : Nat) : Text {
    let arr = t.toArray();
    let len = arr.size();
    if (start >= len) return "";
    var result = "";
    var idx = start;
    while (idx < len) {
      result #= Text.fromChar(arr[idx]);
      idx += 1;
    };
    result;
  };

  /// Extract characters from offset start until the next '"' character.
  /// Extract characters from offset start until the next '"' character.
  func extractUntilQuote(t : Text, start : Nat) : Text {
    let arr = t.toArray();
    let len = arr.size();
    var s = "";
    var i = start;
    while (i < len and arr[i] != '\"') {
      s #= Text.fromChar(arr[i]);
      i += 1;
    };
    s;
  };

  /// Extract a positive integer value from text starting at offset start,
  /// skipping over any whitespace or ':' characters first.
  /// Extract a positive integer value from text starting at offset start,
  /// skipping over any whitespace or ':' characters first.
  func extractNumber(t : Text, start : Nat) : ?Nat {
    scanNat(t.toArray(), start);
  };
};
