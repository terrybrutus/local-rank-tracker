import { MapPlaceholder, MapView, reverseGeocode } from "@/components/MapView";
import type { PoiMarker } from "@/components/MapView";
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
    // Default to center of the US — map is always visible
    centerLat: 39.8283,
    centerLng: -98.5795,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [partialBanner, setPartialBanner] = useState<PartialScanData | null>(
    null,
  );
  const [isGeocodingPreview, setIsGeocodingPreview] = useState(false);
  const [hasGeocodedAddress, setHasGeocodedAddress] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);
  const geocodePreviewRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geoLocRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PARTIAL_SCAN_KEY);
      if (raw) {
        const data = JSON.parse(raw) as PartialScanData;
        if (
          data.results &&
          data.results.length > 0 &&
          data.results.length < 9
        ) {
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
      // Defensive fallback: if the address looks like a coordinate pair
      // (e.g. "34.05234, -118.24368"), route to /reverse instead of /search
      // to avoid Nominatim returning zero results for raw coordinate strings.
      const coordPattern = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;
      if (coordPattern.test(address.trim())) {
        const [latStr, lngStr] = address.split(",");
        const lat = Number.parseFloat(latStr.trim());
        const lng = Number.parseFloat(lngStr.trim());
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          return { lat, lng };
        }
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

  // Geocode address for preview map when user stops typing
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
          // silent — don't toast on preview geocode failure
        } finally {
          setIsGeocodingPreview(false);
        }
      }, 900);
    },
    [geocodeAddress, isRunning],
  );

  const handleCenterDragged = useCallback(
    (lat: number, lng: number, address: string) => {
      setSearchMeta({ centerLat: lat, centerLng: lng });
      setHasGeocodedAddress(true);
      setForm((prev) => ({ ...prev, address }));
    },
    [],
  );

  const handlePoiScan = useCallback(async (poi: PoiMarker) => {
    // Resolve a human-readable address from POI coordinates so geocodeAddress
    // receives a real place string, not a raw "lat, lng" coordinate pair.
    const humanAddress = await reverseGeocode(poi.lat, poi.lng);
    setForm((prev) => ({
      ...prev,
      businessName: poi.name,
      keyword: poi.keyword,
      address: humanAddress,
    }));
    setSearchMeta({ centerLat: poi.lat, centerLng: poi.lng });
    setHasGeocodedAddress(true);
    // Scroll form into view
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePoiSetCenter = useCallback(async (poi: PoiMarker) => {
    const humanAddress = await reverseGeocode(poi.lat, poi.lng);
    setSearchMeta({ centerLat: poi.lat, centerLng: poi.lng });
    setHasGeocodedAddress(true);
    setForm((prev) => ({ ...prev, address: humanAddress }));
  }, []);

  const handleChange =
    (field: keyof Omit<SearchFormState, "radiusMiles">) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (field === "address") triggerPreviewGeocode(value);
    };

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
    setPartialBanner(null);

    try {
      const { lat, lng } = await geocodeAddress(address);
      setSearchMeta({ centerLat: lat, centerLng: lng });
      setHasGeocodedAddress(true);

      const rawGridPoints = await actor.getGridPoints(lat, lng);
      // Apply radius scaling client-side: stretch each point's offset from center
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
          // Already unwrapped bigint from generated bindings
          rank = BigInt(rankOption as unknown as bigint);
        }

        completedResults[i] = {
          lat: pLat,
          lng: pLng,
          rank,
          pending: false,
        };

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
    const cleanResults = results.map(({ lat, lng, rank }) => ({
      lat,
      lng,
      rank,
    }));
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

  // Map is ALWAYS shown. No gating — defaults to US center before address.
  const hasGrid = grid !== null;
  const showResultsActions = hasGrid && !isRunning && isComplete;

  const canRun =
    !isRunning &&
    !!form.address.trim() &&
    (!!form.businessName.trim() || !!form.keyword.trim());

  return (
    <div
      className="max-w-5xl mx-auto px-4 sm:px-6 py-8"
      data-ocid="search.page"
    >
      {/* Explanatory blurb */}
      <div className="slide-in mb-7">
        <div
          className="flex items-start gap-3 glassmorphism rounded-xl px-5 py-4"
          style={{
            borderColor: "rgba(99, 102, 241, 0.25)",
            boxShadow: "0 0 32px rgba(99, 70, 220, 0.15)",
          }}
        >
          <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              <span className="font-semibold text-foreground">
                Google's local results aren't the same everywhere.
              </span>{" "}
              Someone one mile away searches the same thing and sees a different
              list. This tool maps your visibility across a 3×3 geographic grid
              so you can see where you rank strong and where you're losing
              ground.
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              For local SEO, knowing which areas need work is everything.
            </p>
          </div>
        </div>
      </div>

      {/* Partial scan recovery banner */}
      {partialBanner && (
        <div
          className="flex items-center justify-between gap-3 glassmorphism rounded-lg px-4 py-3 mb-5 text-sm slide-in"
          style={{
            borderColor: "rgba(139, 92, 246, 0.35)",
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.2)",
          }}
          data-ocid="search.partial_scan_banner"
        >
          <span className="text-foreground">
            <span className="font-medium text-accent">Incomplete scan</span> for{" "}
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
              View partial results
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-7 text-xs font-display px-2 text-muted-foreground hover:text-foreground"
              onClick={handleDismissPartial}
              data-ocid="search.partial_scan_dismiss_button"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Search form — glassmorphism */}
      <div
        className="glassmorphism rounded-xl p-6 mb-6 slide-in"
        style={{
          borderColor: "rgba(139, 92, 246, 0.2)",
          boxShadow:
            "0 0 40px rgba(99, 70, 220, 0.12), inset 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/20 border border-primary/30"
            style={{ boxShadow: "0 0 12px rgba(139, 92, 246, 0.3)" }}
          >
            <Search className="w-3.5 h-3.5 text-primary" />
          </div>
          <h1 className="font-display font-semibold text-base text-foreground">
            New Rank Search
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {/* Business Name */}
          <div className="space-y-1.5">
            <div className="flex items-center">
              <Label
                htmlFor="businessName"
                className="text-xs font-medium text-foreground"
              >
                Business Name
              </Label>
              <FieldTooltip text="The name of your business as it appears on Google Maps. Used to find your listing in the search results. You can leave this blank if you provide a keyword instead." />
              <span className="ml-2 text-xs text-muted-foreground italic">
                optional
              </span>
            </div>
            <Input
              id="businessName"
              placeholder="Downtown Café"
              value={form.businessName}
              onChange={handleChange("businessName")}
              className="h-9 text-sm font-body bg-background/40 border-border/60 focus:border-primary/60 transition-colors duration-200"
              style={{
                boxShadow: form.businessName
                  ? "0 0 10px rgba(139, 92, 246, 0.2)"
                  : undefined,
              }}
              data-ocid="search.business_name_input"
              disabled={isRunning}
            />
          </div>

          {/* Keyword */}
          <div className="space-y-1.5">
            <div className="flex items-center">
              <Label
                htmlFor="keyword"
                className="text-xs font-medium text-foreground"
              >
                Keyword
              </Label>
              <FieldTooltip text="The search phrase your potential customers type on Google (e.g. 'pizza near me'). Leave blank if you provide a business name — the business name will be used as the search term." />
              <span className="ml-2 text-xs text-muted-foreground italic">
                optional
              </span>
            </div>
            <Input
              id="keyword"
              placeholder="best coffee downtown"
              value={form.keyword}
              onChange={handleChange("keyword")}
              className="h-9 text-sm font-body bg-background/40 border-border/60 focus:border-primary/60 transition-colors duration-200"
              style={{
                boxShadow: form.keyword
                  ? "0 0 10px rgba(139, 92, 246, 0.2)"
                  : undefined,
              }}
              data-ocid="search.keyword_input"
              disabled={isRunning}
            />
          </div>

          {/* Location — required */}
          <div className="space-y-1.5">
            <div className="flex items-center">
              <Label
                htmlFor="address"
                className="text-xs font-medium text-foreground"
              >
                Location
              </Label>
              <FieldTooltip text="Required. The center of your 3×3 geographic grid. Can be a full address, city name, or zip code. All 9 scan points will be spaced around this location at the radius you choose below." />
              <span className="ml-2 text-xs text-accent/80 font-semibold">
                *
              </span>
            </div>
            <div className="relative">
              <Navigation className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="address"
                placeholder="New York, NY"
                value={form.address}
                onChange={handleChange("address")}
                className="h-9 text-sm font-body pl-7 bg-background/40 border-border/60 focus:border-primary/60 transition-colors duration-200"
                style={{
                  boxShadow: form.address
                    ? "0 0 10px rgba(0, 217, 255, 0.2)"
                    : undefined,
                }}
                data-ocid="search.address_input"
                disabled={isRunning}
              />
            </div>
            {geoLocating && (
              <p className="text-[10px] text-accent/80 font-mono mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full border border-accent/60 border-t-transparent animate-spin" />
                Detecting your location&hellip;
              </p>
            )}
          </div>
        </div>

        {/* Radius slider */}
        <div
          className="mb-5 border-t pt-4"
          style={{ borderColor: "rgba(139, 92, 246, 0.15)" }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">
                Search Radius
              </span>
            </div>
            <span
              className="radius-display text-sm"
              style={{
                textShadow: "0 0 10px rgba(189,0,255,0.6)",
              }}
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
          <div className="flex justify-between text-[10px] text-muted-foreground/50 font-mono mt-1">
            <span>0.5</span>
            <span>1</span>
            <span>3</span>
            <span>5</span>
            <span>7.5</span>
            <span>10</span>
          </div>
        </div>

        <Button
          type="button"
          className="h-9 px-6 text-sm font-display gap-2 transition-all duration-200"
          style={
            canRun
              ? {
                  boxShadow:
                    "0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.2)",
                }
              : undefined
          }
          onClick={handleRun}
          disabled={!canRun}
          data-ocid="search.run_button"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Scanning {progress}
              %&hellip;
            </>
          ) : (
            <>
              <Search className="w-4 h-4" /> Track Rankings
            </>
          )}
        </Button>
      </div>

      {/* Progress bar — neon glow */}
      {isRunning && (
        <div className="mb-6 slide-in">
          <div
            className="h-1.5 rounded-full overflow-hidden bg-muted/40"
            style={{ boxShadow: "0 0 8px rgba(139, 92, 246, 0.15)" }}
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
            Querying grid point {Math.ceil((progress / 100) * 9) || 1} of
            9&hellip;
          </p>
        </div>
      )}

      {/* Map section — ALWAYS visible, defaults to US center */}
      <div className="space-y-6">
        {isGeocodingPreview && !isRunning && !hasGrid && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono -mb-3">
            <span className="w-3 h-3 rounded-full border border-muted-foreground/50 border-t-transparent animate-spin" />
            Locating on map&hellip;
          </div>
        )}

        {/* Always-mounted map — grid pins appear when scan runs */}
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
          <div className="text-center py-2" data-ocid="map_view.browse_hint">
            <p className="text-xs text-muted-foreground font-body">
              Browsing the world &mdash; enter an address or drag the map to
              explore
            </p>
          </div>
        )}

        {metrics && !isRunning && <SummaryBar metrics={metrics} />}

        {allNotFound && isComplete && (
          <div
            className="glassmorphism rounded-xl px-5 py-4 text-sm space-y-2"
            style={{ borderColor: "rgba(255, 0, 107, 0.2)" }}
            data-ocid="search.no_results_callout"
          >
            <p className="font-medium text-foreground">
              No rankings found across all 9 grid points
            </p>
            <ul className="text-muted-foreground text-xs space-y-1 list-disc list-inside">
              <li>
                Verify the business name matches <strong>exactly</strong> as it
                appears on Google Maps.
              </li>
              <li>
                Try a broader or shorter keyword &mdash; e.g.
                &ldquo;pizza&rdquo; instead of &ldquo;best pizza near me
                tonight.&rdquo;
              </li>
              <li>
                Make sure your SerpAPI key is valid and has remaining quota
                &mdash;{" "}
                <a
                  href="https://serpapi.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-foreground"
                >
                  serpapi.com/dashboard
                </a>
                .
              </li>
              <li>
                The business may not appear in Google Maps local results for
                this area.
              </li>
            </ul>
          </div>
        )}

        {showResultsActions && (
          <div className="flex gap-3 flex-wrap">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 text-sm font-display gap-2 transition-all duration-200"
              style={{ boxShadow: "0 0 16px rgba(139, 92, 246, 0.35)" }}
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
    </div>
  );
}
