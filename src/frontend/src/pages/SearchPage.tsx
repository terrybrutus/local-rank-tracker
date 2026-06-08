import { MapPlaceholder, MapView, reverseGeocode } from "@/components/MapView";
import type { PoiMarker } from "@/components/MapView";
import { RankGrid } from "@/components/RankGrid";
import { SummaryBar } from "@/components/SummaryBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBackend, useSaveSearch } from "@/hooks/useBackend";
import { computeMetrics, resultsToGrid } from "@/types";
import type { RankResult } from "@/types";
import { exportToPdf } from "@/utils/pdf";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  HelpCircle,
  Info,
  Loader2,
  MapPin,
  Navigation,
  Save,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const PARTIAL_SCAN_KEY = "lrt_partial_scan";
const RADIUS_MIN = 0.5;
const RADIUS_MAX = 10;
const RADIUS_STEP = 0.5;

// Times Square, NYC — a recognizable default that shows POIs immediately
const DEFAULT_LAT = 40.758;
const DEFAULT_LNG = -73.9855;

const DIRECTIONS = ["NW", "N", "NE", "W", "Center", "E", "SW", "S", "SE"];

interface PartialScanData {
  businessName: string;
  keyword: string;
  address: string;
  results: Array<{ lat: number; lng: number; rank?: bigint }>;
}

interface RankResultWithPending extends RankResult {
  pending?: boolean;
}

interface SearchFormState {
  businessName: string;
  keyword: string;
  address: string;
  radiusMiles: number;
}

interface AddrSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

function FieldTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="More info"
        className="text-muted-foreground hover:text-accent transition-colors duration-200 ml-1"
        onClick={() => setOpen((v) => !v)}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-6 z-50 w-64 glassmorphism rounded-lg p-3 text-xs text-foreground/90 leading-relaxed"
          style={{
            borderColor: "rgba(139, 92, 246, 0.3)",
            boxShadow:
              "0 0 24px rgba(139, 92, 246, 0.3), 0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const { actor } = useBackend();
  const { mutate: saveSearch, isPending: isSaving } = useSaveSearch();
  const navigate = useNavigate();

  const searchParams = useSearch({ from: "/protected/search" });

  const [form, setForm] = useState<SearchFormState>({
    businessName: searchParams.businessName ?? "",
    keyword: searchParams.keyword ?? "",
    address: searchParams.address ?? "",
    radiusMiles: 1,
  });

  const [results, setResults] = useState<RankResult[] | null>(null);
  const [searchMeta, setSearchMeta] = useState<{
    centerLat: number;
    centerLng: number;
  }>({
    centerLat: DEFAULT_LAT,
    centerLng: DEFAULT_LNG,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [partialBanner, setPartialBanner] = useState<PartialScanData | null>(
    null,
  );
  const [isGeocodingPreview, setIsGeocodingPreview] = useState(false);
  const [hasGeocodedAddress, setHasGeocodedAddress] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);

  // Address autocomplete
  const [addrSuggestions, setAddrSuggestions] = useState<AddrSuggestion[]>([]);
  const [showAddrSuggestions, setShowAddrSuggestions] = useState(false);
  const addrSuggestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const geocodePreviewRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geoLocRef = useRef(false);

  // Load partial scan from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PARTIAL_SCAN_KEY);
      if (raw) {
        const data = JSON.parse(raw) as PartialScanData;
        if (data.results && data.results.length > 0 && data.results.length < 9) {
          setPartialBanner(data);
        } else if (data.results && data.results.length === 9) {
          localStorage.removeItem(PARTIAL_SCAN_KEY);
        }
      }
    } catch {
      localStorage.removeItem(PARTIAL_SCAN_KEY);
    }
  }, []);

  // Browser geolocation on initial load
  useEffect(() => {
    if (geoLocRef.current) return;
    geoLocRef.current = true;
    if (!navigator.geolocation) return;
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const address = await reverseGeocode(latitude, longitude);
          setForm((prev) => ({ ...prev, address }));
          setSearchMeta({ centerLat: latitude, centerLng: longitude });
          setHasGeocodedAddress(true);
        } catch {
          // silent fallback
        } finally {
          setGeoLocating(false);
        }
      },
      () => {
        setGeoLocating(false);
      },
      { timeout: 10000, maximumAge: 600000 },
    );
  }, []);

  const geocodeAddress = useCallback(
    async (address: string): Promise<{ lat: number; lng: number }> => {
      const coordPattern = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;
      if (coordPattern.test(address.trim())) {
        const [latStr, lngStr] = address.split(",");
        const lat = Number.parseFloat(latStr.trim());
        const lng = Number.parseFloat(lngStr.trim());
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };
      }
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (!data || data.length === 0)
        throw new Error("Address not found. Try a more specific address.");
      return {
        lat: Number.parseFloat(data[0].lat),
        lng: Number.parseFloat(data[0].lon),
      };
    },
    [],
  );

  const triggerPreviewGeocode = useCallback(
    (address: string) => {
      if (geocodePreviewRef.current) clearTimeout(geocodePreviewRef.current);
      if (!address.trim() || address.trim().length < 3) return;
      geocodePreviewRef.current = setTimeout(async () => {
        if (isRunning) return;
        try {
          setIsGeocodingPreview(true);
          const { lat, lng } = await geocodeAddress(address);
          setSearchMeta({ centerLat: lat, centerLng: lng });
          setHasGeocodedAddress(true);
        } catch {
          // silent
        } finally {
          setIsGeocodingPreview(false);
        }
      }, 900);
    },
    [geocodeAddress, isRunning],
  );

  const fetchAddressSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setAddrSuggestions([]);
      return;
    }
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=0`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = (await res.json()) as AddrSuggestion[];
      setAddrSuggestions(data ?? []);
      setShowAddrSuggestions((data ?? []).length > 0);
    } catch {
      setAddrSuggestions([]);
    }
  }, []);

  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, address: value }));
      triggerPreviewGeocode(value);
      if (addrSuggestTimerRef.current)
        clearTimeout(addrSuggestTimerRef.current);
      addrSuggestTimerRef.current = setTimeout(
        () => fetchAddressSuggestions(value),
        400,
      );
    },
    [triggerPreviewGeocode, fetchAddressSuggestions],
  );

  const handleSelectSuggestion = useCallback(
    (s: AddrSuggestion) => {
      const lat = Number.parseFloat(s.lat);
      const lng = Number.parseFloat(s.lon);
      setForm((prev) => ({ ...prev, address: s.display_name }));
      setSearchMeta({ centerLat: lat, centerLng: lng });
      setHasGeocodedAddress(true);
      setAddrSuggestions([]);
      setShowAddrSuggestions(false);
    },
    [],
  );

  const handleFieldChange =
    (field: "businessName" | "keyword") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleCenterDragged = useCallback(
    (lat: number, lng: number, address: string) => {
      setSearchMeta({ centerLat: lat, centerLng: lng });
      setHasGeocodedAddress(true);
      setForm((prev) => ({ ...prev, address }));
    },
    [],
  );

  const handlePoiScan = useCallback(async (poi: PoiMarker) => {
    const humanAddress = await reverseGeocode(poi.lat, poi.lng);
    setForm((prev) => ({
      ...prev,
      businessName: poi.name,
      keyword: poi.keyword,
      address: humanAddress,
    }));
    setSearchMeta({ centerLat: poi.lat, centerLng: poi.lng });
    setHasGeocodedAddress(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePoiSetCenter = useCallback(async (poi: PoiMarker) => {
    const humanAddress = await reverseGeocode(poi.lat, poi.lng);
    setSearchMeta({ centerLat: poi.lat, centerLng: poi.lng });
    setHasGeocodedAddress(true);
    setForm((prev) => ({ ...prev, address: humanAddress }));
  }, []);

  const handleRun = useCallback(async () => {
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    const businessName = form.businessName.trim();
    const keyword = form.keyword.trim();
    const address = form.address.trim();

    if (!address) {
      toast.error("Location is required");
      return;
    }
    if (!businessName && !keyword) {
      toast.error("Enter a business name, a keyword, or both");
      return;
    }

    const effectiveBusiness = businessName || keyword;
    const effectiveKeyword = keyword || businessName;

    setIsRunning(true);
    setResults(null);
    setProgress(0);
    setCurrentPoint(0);
    setPartialBanner(null);

    try {
      const { lat, lng } = await geocodeAddress(address);
      setSearchMeta({ centerLat: lat, centerLng: lng });
      setHasGeocodedAddress(true);

      const rawGridPoints = await actor.getGridPoints(lat, lng);
      const gridPoints: [number, number][] = (
        rawGridPoints as [number, number][]
      ).map(([pLat, pLng]) => [
        lat + (pLat - lat) * form.radiusMiles,
        lng + (pLng - lng) * form.radiusMiles,
      ]);
      const total = gridPoints.length;

      const pendingResults: RankResult[] = gridPoints.map(([pLat, pLng]) => ({
        lat: pLat,
        lng: pLng,
        rank: undefined,
        pending: true,
      }));
      setResults([...pendingResults]);

      const partialKey: PartialScanData = {
        businessName: effectiveBusiness,
        keyword: effectiveKeyword,
        address,
        results: [],
      };

      const completedResults: RankResult[] = [...pendingResults];

      for (let i = 0; i < total; i++) {
        setCurrentPoint(i + 1);
        const [pLat, pLng] = gridPoints[i];
        const rankOption = await actor.queryGridPoint(
          effectiveBusiness,
          effectiveKeyword,
          pLat,
          pLng,
          BigInt(i),
        );
        let rank: bigint | undefined;
        if (rankOption == null) {
          rank = undefined;
        } else if (Array.isArray(rankOption)) {
          rank = rankOption.length > 0 ? BigInt(rankOption[0]) : undefined;
        } else {
          rank = BigInt(rankOption as unknown as bigint);
        }

        completedResults[i] = { lat: pLat, lng: pLng, rank, pending: false };
        setResults([...completedResults]);
        setProgress(Math.round(((i + 1) / total) * 100));

        partialKey.results = completedResults
          .slice(0, i + 1)
          .map(({ lat: rLat, lng: rLng, rank: rRank }) => ({
            lat: rLat,
            lng: rLng,
            rank: rRank,
          }));
        localStorage.setItem(PARTIAL_SCAN_KEY, JSON.stringify(partialKey));
      }

      localStorage.removeItem(PARTIAL_SCAN_KEY);
      toast.success("Grid scan complete!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Search failed";
      toast.error(msg);
    } finally {
      setIsRunning(false);
    }
  }, [actor, form, geocodeAddress]);

  const handleSave = () => {
    if (!results || !searchMeta) return;
    const saveBusiness = form.businessName.trim() || form.keyword.trim();
    const saveKeyword = form.keyword.trim() || form.businessName.trim();
    const cleanResults = results.map(({ lat, lng, rank }) => ({ lat, lng, rank }));
    saveSearch(
      {
        businessName: saveBusiness,
        keyword: saveKeyword,
        address: form.address.trim(),
        ...searchMeta,
        results: cleanResults,
      },
      {
        onSuccess: (id) => {
          toast.success("Search saved!");
          navigate({ to: "/search/$id", params: { id: id.toString() } });
        },
        onError: () => toast.error("Failed to save search"),
      },
    );
  };

  const handleLoadPartial = () => {
    if (!partialBanner) return;
    setResults(partialBanner.results.map((r) => ({ ...r, pending: false })));
    setForm((prev) => ({
      ...prev,
      businessName: partialBanner.businessName,
      keyword: partialBanner.keyword,
      address: partialBanner.address,
    }));
    setPartialBanner(null);
  };

  const handleDismissPartial = () => {
    localStorage.removeItem(PARTIAL_SCAN_KEY);
    setPartialBanner(null);
  };

  const displayResults = results ? results.map((r) => ({ ...r })) : null;
  const grid = displayResults ? resultsToGrid(displayResults) : null;
  const completedForMetrics = results
    ? results.filter((r) => !(r as RankResultWithPending).pending)
    : [];
  const metrics =
    completedForMetrics.length > 0 ? computeMetrics(completedForMetrics) : null;

  const isComplete = !isRunning && results !== null && progress === 100;
  const allNotFound =
    isComplete && results !== null && results.every((r) => r.rank == null);
  const hasGrid = grid !== null;
  const showResultsActions = hasGrid && !isRunning && isComplete;

  const canRun =
    !isRunning &&
    !!form.address.trim() &&
    (!!form.businessName.trim() || !!form.keyword.trim());

  const directionLabel = DIRECTIONS[currentPoint - 1] ?? "";

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
      data-ocid="search.page"
    >
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ══════════════════════════════════
            LEFT COLUMN: Form
        ══════════════════════════════════ */}
        <div className="w-full lg:w-[400px] xl:w-[440px] shrink-0 space-y-4">

          {/* Compact info blurb */}
          <div
            className="flex items-start gap-3 glassmorphism rounded-xl px-4 py-3 slide-in"
            style={{
              borderColor: "rgba(99, 102, 241, 0.2)",
              boxShadow: "0 0 24px rgba(99, 70, 220, 0.1)",
            }}
          >
            <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/80 leading-relaxed">
              <span className="font-semibold text-foreground">
                Rankings vary by location.
              </span>{" "}
              This tool maps your visibility across a 3×3 geographic grid — 9 real
              Google searches from 9 nearby points.
            </p>
          </div>

          {/* Partial scan recovery banner */}
          {partialBanner && (
            <div
              className="flex items-center justify-between gap-3 glassmorphism rounded-lg px-4 py-3 text-sm slide-in"
              style={{
                borderColor: "rgba(139, 92, 246, 0.35)",
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.2)",
              }}
              data-ocid="search.partial_scan_banner"
            >
              <span className="text-foreground text-xs">
                <span className="font-medium text-accent">Incomplete scan</span>{" "}
                for{" "}
                <span className="font-mono text-xs bg-primary/20 px-1.5 py-0.5 rounded border border-primary/30">
                  {partialBanner.businessName}
                </span>{" "}
                &mdash; {partialBanner.results.length}/9 points completed.
              </span>
              <div className="flex gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  className="h-7 text-xs font-display px-3 border-accent/40 hover:border-accent hover:text-accent"
                  onClick={handleLoadPartial}
                  data-ocid="search.partial_scan_load_button"
                >
                  View
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                  onClick={handleDismissPartial}
                  data-ocid="search.partial_scan_dismiss_button"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* Search form */}
          <div
            className="glassmorphism rounded-xl p-5 slide-in"
            style={{
              borderColor: "rgba(139, 92, 246, 0.18)",
              boxShadow:
                "0 0 32px rgba(99, 70, 220, 0.1), inset 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center bg-primary/20 border border-primary/30"
                style={{ boxShadow: "0 0 10px rgba(139, 92, 246, 0.25)" }}
              >
                <Search className="w-3 h-3 text-primary" />
              </div>
              <h1 className="font-display font-semibold text-sm text-foreground">
                New Rank Search
              </h1>
            </div>

            <div className="space-y-3 mb-4">
              {/* Business Name */}
              <div className="space-y-1.5">
                <div className="flex items-center">
                  <Label htmlFor="businessName" className="text-xs font-medium text-foreground">
                    Business Name
                  </Label>
                  <FieldTooltip text="The name of your business as it appears on Google Maps. Used to find your listing in results. Leave blank if you provide a keyword instead." />
                  <span className="ml-2 text-xs text-muted-foreground italic">optional</span>
                </div>
                <Input
                  id="businessName"
                  placeholder="Downtown Café"
                  value={form.businessName}
                  onChange={handleFieldChange("businessName")}
                  className="h-9 text-sm font-body bg-background/40 border-border/60 focus:border-primary/60 transition-colors duration-200"
                  style={{
                    boxShadow: form.businessName
                      ? "0 0 8px rgba(139, 92, 246, 0.18)"
                      : undefined,
                  }}
                  data-ocid="search.business_name_input"
                  disabled={isRunning}
                />
              </div>

              {/* Keyword */}
              <div className="space-y-1.5">
                <div className="flex items-center">
                  <Label htmlFor="keyword" className="text-xs font-medium text-foreground">
                    Keyword
                  </Label>
                  <FieldTooltip text="The search phrase your customers type on Google (e.g. 'pizza near me'). Leave blank if you provide a business name — it will be used as the search term." />
                  <span className="ml-2 text-xs text-muted-foreground italic">optional</span>
                </div>
                <Input
                  id="keyword"
                  placeholder="best coffee downtown"
                  value={form.keyword}
                  onChange={handleFieldChange("keyword")}
                  className="h-9 text-sm font-body bg-background/40 border-border/60 focus:border-primary/60 transition-colors duration-200"
                  style={{
                    boxShadow: form.keyword
                      ? "0 0 8px rgba(139, 92, 246, 0.18)"
                      : undefined,
                  }}
                  data-ocid="search.keyword_input"
                  disabled={isRunning}
                />
              </div>

              {/* Location with autocomplete */}
              <div className="space-y-1.5">
                <div className="flex items-center">
                  <Label htmlFor="address" className="text-xs font-medium text-foreground">
                    Location
                  </Label>
                  <FieldTooltip text="Required. The center of your 3×3 grid. Can be an address, city name, or zip code. All 9 scan points will radiate outward from this location." />
                  <span className="ml-2 text-xs text-accent/80 font-semibold">*</span>
                </div>
                <div className="relative">
                  <Navigation className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="address"
                    placeholder="New York, NY"
                    value={form.address}
                    onChange={handleAddressChange}
                    onFocus={() =>
                      addrSuggestions.length > 0 && setShowAddrSuggestions(true)
                    }
                    onBlur={() =>
                      setTimeout(() => setShowAddrSuggestions(false), 180)
                    }
                    className="h-9 text-sm font-body pl-7 bg-background/40 border-border/60 focus:border-primary/60 transition-colors duration-200"
                    style={{
                      boxShadow: form.address
                        ? "0 0 8px rgba(0, 217, 255, 0.18)"
                        : undefined,
                    }}
                    data-ocid="search.address_input"
                    disabled={isRunning}
                    autoComplete="off"
                  />
                  {/* Autocomplete dropdown */}
                  {showAddrSuggestions && addrSuggestions.length > 0 && (
                    <div
                      className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg overflow-hidden"
                      style={{
                        background: "rgba(5,5,22,0.97)",
                        border: "1px solid rgba(139,92,246,0.35)",
                        boxShadow:
                          "0 0 24px rgba(139,92,246,0.2), 0 8px 32px rgba(0,0,0,0.5)",
                        backdropFilter: "blur(16px)",
                      }}
                    >
                      {addrSuggestions.map((s) => (
                        <button
                          key={`${s.lat},${s.lon}`}
                          type="button"
                          className="w-full text-left px-3 py-2 text-xs transition-colors duration-150 flex items-center gap-2"
                          style={{ color: "rgba(200,200,220,0.85)" }}
                          onMouseDown={() => handleSelectSuggestion(s)}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              "rgba(139,92,246,0.12)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              "transparent";
                          }}
                        >
                          <MapPin
                            className="w-3 h-3 shrink-0"
                            style={{ color: "rgba(139,92,246,0.6)" }}
                          />
                          <span className="truncate">{s.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {geoLocating && (
                  <p className="text-[10px] text-accent/80 font-mono mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full border border-accent/60 border-t-transparent animate-spin" />
                    Detecting your location&hellip;
                  </p>
                )}
                {isGeocodingPreview && !isRunning && (
                  <p className="text-[10px] text-muted-foreground font-mono mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full border border-muted-foreground/50 border-t-transparent animate-spin" />
                    Locating on map&hellip;
                  </p>
                )}
              </div>
            </div>

            {/* Radius slider */}
            <div
              className="mb-4 border-t pt-3"
              style={{ borderColor: "rgba(139, 92, 246, 0.12)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    Search Radius
                  </span>
                </div>
                <span
                  className="radius-display text-sm"
                  style={{ textShadow: "0 0 10px rgba(189,0,255,0.6)" }}
                  data-ocid="search.radius_display"
                >
                  {form.radiusMiles.toFixed(1)} mi
                </span>
              </div>
              <input
                type="range"
                min={RADIUS_MIN}
                max={RADIUS_MAX}
                step={RADIUS_STEP}
                value={form.radiusMiles}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    radiusMiles: Number.parseFloat(e.target.value),
                  }))
                }
                disabled={isRunning}
                className="radius-slider w-full"
                data-ocid="search.radius_slider"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground/40 font-mono mt-1">
                <span>0.5</span>
                <span>2</span>
                <span>5</span>
                <span>7.5</span>
                <span>10</span>
              </div>
            </div>

            {/* Track Rankings button — full width, dominant */}
            <button
              type="button"
              className="w-full h-11 font-display font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
              style={
                canRun
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(99,51,255,0.92) 0%, rgba(0,140,255,0.92) 100%)",
                      border: "1px solid rgba(120,80,255,0.55)",
                      boxShadow:
                        "0 0 24px rgba(99,51,255,0.4), 0 0 48px rgba(99,51,255,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
                      color: "#fff",
                      cursor: "pointer",
                    }
                  : {
                      background: "rgba(99,51,255,0.15)",
                      border: "1px solid rgba(120,80,255,0.2)",
                      color: "rgba(255,255,255,0.35)",
                      cursor: "default",
                    }
              }
              onClick={handleRun}
              disabled={!canRun}
              data-ocid="search.run_button"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning {directionLabel} ({currentPoint}/9)&hellip;
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Track Rankings
                </>
              )}
            </button>

            {/* Credit indicator */}
            {!isRunning && (
              <p className="text-center text-[10px] text-muted-foreground/50 mt-2 font-mono">
                Uses 9 SerpAPI credits per scan · 9 ICP HTTP outcalls
              </p>
            )}
          </div>

          {/* Progress bar — shown in left column while scanning */}
          {isRunning && (
            <div className="slide-in">
              <div
                className="h-1.5 rounded-full overflow-hidden bg-muted/40"
                style={{ boxShadow: "0 0 8px rgba(139, 92, 246, 0.12)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background:
                      "linear-gradient(90deg, oklch(0.55 0.24 260), oklch(0.72 0.30 290), oklch(0.68 0.28 180))",
                    boxShadow:
                      "0 0 12px rgba(139, 92, 246, 0.8), 0 0 24px rgba(0, 217, 255, 0.4)",
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                Querying{" "}
                {directionLabel ? `${directionLabel} — ` : ""}point {currentPoint} of 9&hellip;
              </p>
            </div>
          )}

          {/* Save / Export (left column, after scan) */}
          {showResultsActions && (
            <div className="flex gap-3 flex-wrap slide-in">
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 h-9 text-sm font-display gap-2 transition-all duration-200"
                style={{ boxShadow: "0 0 16px rgba(139, 92, 246, 0.3)" }}
                data-ocid="search.save_button"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Search
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 text-sm font-display gap-2 border-border/60 hover:border-accent/50 transition-all duration-200"
                onClick={() =>
                  exportToPdf(
                    form.businessName.trim() || form.keyword.trim(),
                    form.keyword.trim() || form.businessName.trim(),
                    form.address.trim(),
                    new Date().toLocaleDateString(),
                    grid,
                    metrics ?? computeMetrics(results ?? []),
                  )
                }
                data-ocid="search.export_button"
              >
                Export PDF
              </Button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════
            RIGHT COLUMN: Map + Results
        ══════════════════════════════════ */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* Map — sticky on desktop so it stays in view while scrolling */}
          <div className="lg:sticky lg:top-[72px]">
            {hasGrid ? (
              <MapView
                cells={grid!}
                centerLat={searchMeta.centerLat}
                centerLng={searchMeta.centerLng}
                radiusMiles={form.radiusMiles}
                className="mx-auto"
                onCenterDragged={handleCenterDragged}
                onPoiScan={handlePoiScan}
                onPoiSetCenter={handlePoiSetCenter}
              />
            ) : (
              <MapPlaceholder
                centerLat={searchMeta.centerLat}
                centerLng={searchMeta.centerLng}
                radiusMiles={form.radiusMiles}
                isScanning={isRunning}
                progress={progress}
                onCenterDragged={handleCenterDragged}
                onPoiScan={handlePoiScan}
                onPoiSetCenter={handlePoiSetCenter}
              />
            )}
            {!hasGeocodedAddress && !isRunning && (
              <p
                className="text-center text-xs text-muted-foreground mt-2 font-body"
                data-ocid="map_view.browse_hint"
              >
                Browsing Times Square, NYC &mdash; enter an address or drag the
                map to reposition
              </p>
            )}
          </div>

          {/* Summary metrics */}
          {metrics && !isRunning && <SummaryBar metrics={metrics} />}

          {/* Rank grid — flat 3×3 view after scan completes */}
          {isComplete && grid && (
            <RankGrid
              cells={grid}
              title="Geographic Rank Grid"
              className="slide-in"
            />
          )}

          {/* All not found callout */}
          {allNotFound && isComplete && (
            <div
              className="glassmorphism rounded-xl px-5 py-4 text-sm space-y-2 slide-in"
              style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}
              data-ocid="search.no_results_callout"
            >
              <p className="font-medium text-foreground">
                No rankings found across all 9 grid points
              </p>
              <ul className="text-muted-foreground text-xs space-y-1 list-disc list-inside">
                <li>
                  Verify the business name matches{" "}
                  <strong>exactly</strong> as it appears on Google Maps.
                </li>
                <li>
                  Try a shorter keyword — &ldquo;pizza&rdquo; instead of
                  &ldquo;best pizza near me tonight.&rdquo;
                </li>
                <li>
                  Make sure your SerpAPI key is valid and has remaining
                  quota.
                </li>
                <li>
                  The business may not appear in Google Maps local results
                  for this area.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
