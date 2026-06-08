import { getRankTier } from "@/types";
import type { GridCell } from "@/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
export interface PoiMarker {
  lat: number;
  lng: number;
  name: string;
  category: string;
  keyword: string;
}

function makePoiHtml(name: string, index: number): string {
  const short = name.length > 18 ? `${name.slice(0, 16)}\u2026` : name;
  const delay = index * 45;
  const offsetIdx = index % 5;
  const offsets = [
    { x: 0, y: 0 },
    { x: 10, y: -2 },
    { x: -10, y: 2 },
    { x: 6, y: 3 },
    { x: -6, y: -3 },
  ];
  const off = offsets[offsetIdx];
  return `
    <div class="poi-marker-wrap" style="display:flex;flex-direction:column;align-items:center;cursor:pointer;animation:lrt-poi-bounce 0.35s ease-out ${delay}ms both;transform:translate(${off.x}px,${off.y}px);">
      <div class="poi-marker" style="width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(230,200,255,0.98),oklch(0.58 0.28 290));border:1.5px solid rgba(189,0,255,0.85);box-shadow:0 0 10px rgba(189,0,255,0.8),0 0 20px rgba(189,0,255,0.35);transition:transform 0.15s ease;"></div>
      <span style="margin-top:3px;font-size:9px;font-family:sans-serif;font-weight:700;white-space:nowrap;background:rgba(15,10,25,0.92);backdrop-filter:blur(4px);padding:2px 6px;border-radius:4px;color:#e8c8ff;border:1px solid rgba(189,0,255,0.4);max-width:90px;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px rgba(0,0,0,0.8);box-shadow:0 2px 6px rgba(0,0,0,0.4);">${short}</span>
    </div>
  `;
}

function createPoiIcon(name: string, index: number): L.DivIcon {
  return L.divIcon({
    html: makePoiHtml(name, index),
    iconSize: [100, 38],
    iconAnchor: [6, 6],
    className: "",
  });
}

async function fetchPois(
  lat: number,
  lng: number,
  radiusMeters: number,
  signal?: AbortSignal,
): Promise<PoiMarker[]> {
  const r = Math.min(radiusMeters, 3200);
  const query = `[out:json][timeout:10];\n(\n  node["amenity"~"^(restaurant|cafe|bar|fast_food)$"](around:${r},${lat},${lng});\n  node["shop"~"^(mall|clothes|hairdresser|beauty|department_store)$"](around:${r},${lat},${lng});\n);\nout body 50;`;
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      elements?: Array<{
        lat: number;
        lon: number;
        tags?: Record<string, string>;
      }>;
    };
    if (!data.elements) return [];
    return data.elements.slice(0, 50).map((el) => {
      const tags = el.tags ?? {};
      const amenity = tags.amenity ?? tags.shop ?? "place";
      let keyword = "business near me";
      if (amenity === "restaurant") keyword = "restaurant near me";
      else if (amenity === "fast_food") keyword = "fast food near me";
      else if (amenity === "cafe") keyword = "cafe near me";
      else if (amenity === "bar") keyword = "bar near me";
      else if (amenity === "hairdresser" || amenity === "beauty")
        keyword = "hair salon near me";
      else if (
        amenity === "mall" ||
        amenity === "clothes" ||
        amenity === "department_store"
      )
        keyword = "shopping near me";
      return {
        lat: el.lat,
        lng: el.lon,
        name: tags.name ?? amenity,
        category: amenity,
        keyword,
      };
    });
  } catch {
    return [];
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } },
    );
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

const DIRECTIONS = ["NW", "N", "NE", "W", "Center", "E", "SW", "S", "SE"];

// 1 mile in degrees latitude (constant)
const MILE_LAT = 0.0144927536;

/** Convert miles offset to longitude degrees at a given latitude */
function milesToLng(miles: number, lat: number): number {
  return (miles / Math.cos((lat * Math.PI) / 180)) * MILE_LAT;
}

/** Compute the 9 grid points (NW, N, NE, W, Center, E, SW, S, SE) */
export function computeGridPoints(
  centerLat: number,
  centerLng: number,
  radiusMiles: number,
): Array<{ lat: number; lng: number }> {
  const dLat = MILE_LAT * radiusMiles;
  const dLng = milesToLng(radiusMiles, centerLat);
  return [
    { lat: centerLat + dLat, lng: centerLng - dLng }, // NW
    { lat: centerLat + dLat, lng: centerLng }, // N
    { lat: centerLat + dLat, lng: centerLng + dLng }, // NE
    { lat: centerLat, lng: centerLng - dLng }, // W
    { lat: centerLat, lng: centerLng }, // Center
    { lat: centerLat, lng: centerLng + dLng }, // E
    { lat: centerLat - dLat, lng: centerLng - dLng }, // SW
    { lat: centerLat - dLat, lng: centerLng }, // S
    { lat: centerLat - dLat, lng: centerLng + dLng }, // SE
  ];
}

const TIER_COLORS = {
  success: { fill: "#22c55e", text: "#ffffff", glow: "rgba(34,197,94,0.7)" },
  mid: { fill: "#eab308", text: "#1a1200", glow: "rgba(234,179,8,0.7)" },
  poor: { fill: "#ef4444", text: "#ffffff", glow: "rgba(239,68,68,0.7)" },
  notfound: { fill: "#6b7280", text: "#ffffff", glow: "rgba(107,114,128,0.4)" },
  pending: { fill: "#1e1e32", text: "#8282a0", glow: "rgba(100,100,140,0.3)" },
  center: {
    fill: "rgba(0,217,255,0.12)",
    text: "#00d9ff",
    glow: "rgba(0,217,255,0.6)",
  },
} as const;

function makePinHtml(
  rankLabel: string,
  direction: string,
  type: "success" | "mid" | "poor" | "notfound" | "pending" | "center",
  draggable = false,
): string {
  const c = TIER_COLORS[type];
  const isCenter = direction === "Center";
  const isPending = type === "pending";

  // Center: crosshair/target style with optional drag indicator
  if (isCenter) {
    const dragRing = draggable
      ? `<circle cx="22" cy="22" r="20" stroke="rgba(0,217,255,0.45)" stroke-width="1" stroke-dasharray="4 3" fill="none"/>`
      : "";
    return `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          ${dragRing}
          <circle cx="22" cy="22" r="16" stroke="rgba(0,217,255,0.7)" stroke-width="1.5" fill="rgba(0,217,255,0.06)"/>
          <circle cx="22" cy="22" r="5" fill="rgba(0,217,255,0.35)" stroke="rgba(0,217,255,0.9)" stroke-width="1.5"/>
          <line x1="22" y1="8" x2="22" y2="14" stroke="rgba(0,217,255,0.7)" stroke-width="1.5"/>
          <line x1="22" y1="30" x2="22" y2="36" stroke="rgba(0,217,255,0.7)" stroke-width="1.5"/>
          <line x1="8" y1="22" x2="14" y2="22" stroke="rgba(0,217,255,0.7)" stroke-width="1.5"/>
          <line x1="30" y1="22" x2="36" y2="22" stroke="rgba(0,217,255,0.7)" stroke-width="1.5"/>
        </svg>
        ${
          draggable
            ? `<span style="margin-top:2px;font-size:7px;font-family:sans-serif;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;white-space:nowrap;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);padding:2px 6px;border-radius:3px;color:rgba(0,217,255,0.75);border:1px solid rgba(0,217,255,0.25);">DRAG</span>`
            : `<span style="margin-top:3px;font-size:7px;font-family:sans-serif;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;white-space:nowrap;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);padding:2px 5px;border-radius:3px;color:rgba(0,217,255,0.85);border:1px solid rgba(0,217,255,0.25);">Center</span>`
        }
      </div>
    `;
  }

  // Pending: animated pulse ring with spinner
  if (isPending) {
    return `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="position:relative;width:36px;height:48px;">
          <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2 C8.06 2 1 9.06 1 19 C1 30 18 46 18 46 C18 46 35 30 35 19 C35 9.06 27.94 2 18 2 Z" fill="rgba(20,20,40,0.85)" stroke="rgba(100,100,160,0.5)" stroke-width="1.5"/>
          </svg>
          <div style="
            position:absolute;top:5px;left:50%;transform:translateX(-50%);
            width:20px;height:20px;border-radius:50%;
            border:2px solid rgba(130,130,160,0.4);border-top-color:rgba(0,217,255,0.7);
            animation:lrt-spin 1s linear infinite;
          "></div>
        </div>
        <span style="
          margin-top:1px;
          font-size:7px;font-family:sans-serif;font-weight:700;letter-spacing:0.1em;
          text-transform:uppercase;white-space:nowrap;
          background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);
          padding:2px 5px;border-radius:3px;
          color:rgba(130,130,160,0.8);
          border:1px solid rgba(100,100,140,0.25);
        ">${direction}</span>
      </div>
    `;
  }

  // Ranked: teardrop SVG pin with number inside
  const displayLabel = rankLabel || "N/A";
  const fontSize =
    displayLabel.length > 2 ? 9 : displayLabel.length === 2 ? 11 : 13;
  return `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      <div style="position:relative;width:36px;height:48px;">
        <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="glow-${type}" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          <path d="M18 2 C8.06 2 1 9.06 1 19 C1 30 18 46 18 46 C18 46 35 30 35 19 C35 9.06 27.94 2 18 2 Z"
            fill="${c.fill}" filter="url(#glow-${type})"
            stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
          <circle cx="18" cy="19" r="11" fill="rgba(0,0,0,0.25)"/>
          <text x="18" y="${19 + fontSize * 0.38}" text-anchor="middle"
            font-family="monospace" font-weight="800" font-size="${fontSize}"
            fill="${c.text}">${displayLabel}</text>
        </svg>
      </div>
      <span style="
        margin-top:1px;
        font-size:7px;font-family:sans-serif;font-weight:700;letter-spacing:0.1em;
        text-transform:uppercase;white-space:nowrap;
        background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);
        padding:2px 5px;border-radius:3px;
        color:${c.fill};
        border:1px solid ${c.fill}44;
        text-shadow:0 0 6px ${c.glow};
      ">${direction}</span>
    </div>
  `;
}

function createPinIcon(
  rankLabel: string,
  direction: string,
  type: "success" | "mid" | "poor" | "notfound" | "pending" | "center",
  draggable = false,
): L.DivIcon {
  const isCenter = direction === "Center";
  const w = isCenter ? 60 : 52;
  const h = isCenter ? 60 : 68;
  return L.divIcon({
    html: makePinHtml(rankLabel, direction, type, draggable),
    iconSize: [w, h],
    iconAnchor: isCenter ? [w / 2, h / 2] : [w / 2, 48],
    className: "",
  });
}

function getPinType(
  cell: GridCell & { pending?: boolean },
  direction: string,
): "success" | "mid" | "poor" | "notfound" | "pending" | "center" {
  if (direction === "Center") return "center";
  if (cell.pending) return "pending";
  const tier = getRankTier(cell.rank);
  return tier;
}

function zoomForRadius(radiusMiles: number): number {
  if (radiusMiles <= 0.5) return 15;
  if (radiusMiles <= 1) return 14;
  if (radiusMiles <= 2) return 13;
  if (radiusMiles <= 3) return 13;
  if (radiusMiles <= 5) return 12;
  return 11;
}

const MAP_STYLES = `
  @keyframes lrt-spin { to { transform: rotate(360deg); } }
  @keyframes lrt-ring {
    0% { transform: scale(1.5); opacity: 0.6; }
    100% { transform: scale(2.5); opacity: 0; }
  }
  .leaflet-container { background: #050510 !important; }
  .leaflet-tile-pane { filter: brightness(0.9) saturate(1.1); }
  .leaflet-attribution-flag { display: none !important; }
  .leaflet-control-attribution {
    background: rgba(0,0,0,0.55) !important;
    color: rgba(255,255,255,0.5) !important;
    font-size: 9px !important;
    padding: 2px 6px !important;
    border-radius: 3px !important;
    backdrop-filter: blur(4px);
    border: none !important;
    box-shadow: none !important;
  }
  .leaflet-control-attribution a { color: rgba(0,217,255,0.6) !important; }
  @keyframes lrt-poi-bounce {
    0% { transform: scale(0); opacity: 0; }
    55% { transform: scale(1.15); opacity: 1; }
    80% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }
  .poi-marker:hover { transform: scale(1.5); }
  .poi-marker-wrap:hover .poi-marker { transform: scale(1.5); }
  .lrt-poi-popup .leaflet-popup-content-wrapper {
    background: rgba(5,5,22,0.92) !important;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(189,0,255,0.4) !important;
    border-radius: 10px !important;
    box-shadow: 0 0 24px rgba(189,0,255,0.3), 0 8px 32px rgba(0,0,0,0.5) !important;
    color: rgba(255,255,255,0.9) !important;
    padding: 0 !important;
    min-width: 180px;
  }
  .lrt-poi-popup .leaflet-popup-tip-container { display: none; }
  .lrt-poi-popup .leaflet-popup-content { margin: 0 !important; padding: 0 !important; }
  .lrt-poi-popup .leaflet-popup-close-button {
    color: rgba(189,0,255,0.7) !important;
    font-size: 16px !important;
    top: 6px !important;
    right: 8px !important;
  }
`;

interface LeafletMapProps {
  centerLat: number;
  centerLng: number;
  radiusMiles: number;
  cells?: GridCell[][];
  isPreview?: boolean;
  progress?: number;
  className?: string;
  onCenterDragged?: (lat: number, lng: number, address: string) => void;
  onPoiScan?: (poi: PoiMarker) => void;
  onPoiSetCenter?: (poi: PoiMarker) => void;
  showPois?: boolean;
}

/**
 * LeafletMap — always-visible map using ESRI satellite tiles (no API key).
 * Renders grid points immediately once lat/lng are available.
 */
export function LeafletMap({
  centerLat,
  centerLng,
  radiusMiles,
  cells,
  isPreview = false,
  progress = 0,
  className = "",
  onCenterDragged,
  onPoiScan,
  onPoiSetCenter,
  showPois = true,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const gridMarkersRef = useRef<L.Marker[]>([]);
  const gridLinesRef = useRef<L.Polyline[]>([]);
  const poiMarkersRef = useRef<L.Marker[]>([]);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const prevRef = useRef<{ lat: number; lng: number; radius: number } | null>(
    null,
  );
  const poiAbortRef = useRef<AbortController | null>(null);
  const wasCellsNullRef = useRef(true);
  const [tileMode, setTileMode] = useState<"satellite" | "street">("street");

  const TILE_CONFIGS = {
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "© Esri",
      maxZoom: 19,
      subdomains: "abc",
    },
    street: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
      subdomains: "abcd",
    },
  } as const;

  // Initialize map once on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: zoomForRadius(radiusMiles),
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: true,
      keyboard: true,
      touchZoom: true,
    });

    // Initial tile layer — street (CartoDB Dark Matter)
    const cfg = TILE_CONFIGS.street;
    const tile = L.tileLayer(cfg.url, {
      maxZoom: cfg.maxZoom,
      attribution: cfg.attribution,
      subdomains: cfg.subdomains,
    });
    tile.addTo(map);
    tileLayerRef.current = tile;

    mapRef.current = map;
    prevRef.current = { lat: centerLat, lng: centerLng, radius: radiusMiles };

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
    };
  }, []); // intentional mount-only

  // Fetch and render POI layer — debounced 1.5s to avoid hammering Overpass on every keystroke
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !showPois) return;
    for (const m of poiMarkersRef.current) m.remove();
    poiMarkersRef.current = [];
    if (poiAbortRef.current) poiAbortRef.current.abort();

    const debounceTimer = setTimeout(() => {
      const ac = new AbortController();
      poiAbortRef.current = ac;
      const radiusMeters = Math.round(radiusMiles * 1609.34);
      fetchPois(centerLat, centerLng, radiusMeters, ac.signal)
      .then((pois) => {
        if (ac.signal.aborted) return;
        const currentMap = mapRef.current;
        if (!currentMap) return;
        for (const [idx, poi] of pois.entries()) {
          const icon = createPoiIcon(poi.name, idx);
          const marker = L.marker([poi.lat, poi.lng], {
            icon,
            interactive: true,
            zIndexOffset: -100,
          }).addTo(currentMap);
          if (onPoiScan) {
            marker.on("click", () => {
              currentMap.closePopup();
              const popupContent = document.createElement("div");
              popupContent.style.cssText =
                "padding:12px 14px;min-width:180px;display:flex;flex-direction:column;gap:8px;";

              const categoryDiv = document.createElement("div");
              categoryDiv.style.cssText =
                "font-size:11px;font-weight:700;color:rgba(189,0,255,0.85);letter-spacing:0.08em;text-transform:uppercase;";
              categoryDiv.textContent = poi.category;
              popupContent.appendChild(categoryDiv);

              const nameDiv = document.createElement("div");
              nameDiv.style.cssText =
                "font-size:13px;font-weight:600;color:rgba(255,255,255,0.95);margin-bottom:4px;line-height:1.3;";
              nameDiv.textContent = poi.name;
              popupContent.appendChild(nameDiv);

              const scanBtn = document.createElement("button");
              scanBtn.type = "button";
              scanBtn.textContent = "⚡ Scan this business";
              scanBtn.style.cssText =
                "width:100%;padding:6px 0;border-radius:6px;background:linear-gradient(135deg,rgba(189,0,255,0.7),rgba(99,0,255,0.6));border:1px solid rgba(189,0,255,0.5);color:white;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;box-shadow:0 0 12px rgba(189,0,255,0.3);transition:all 0.2s;";
              scanBtn.addEventListener("click", () => {
                popup.close();
                onPoiScan(poi);
              });
              scanBtn.addEventListener("mouseenter", () => {
                scanBtn.style.boxShadow = "0 0 20px rgba(189,0,255,0.5)";
                scanBtn.style.transform = "translateY(-1px)";
              });
              scanBtn.addEventListener("mouseleave", () => {
                scanBtn.style.boxShadow = "0 0 12px rgba(189,0,255,0.3)";
                scanBtn.style.transform = "none";
              });
              popupContent.appendChild(scanBtn);

              if (onPoiSetCenter) {
                const centerBtn = document.createElement("button");
                centerBtn.type = "button";
                centerBtn.textContent = "📍 Set as Center";
                centerBtn.style.cssText =
                  "width:100%;padding:6px 0;border-radius:6px;background:rgba(0,217,255,0.12);border:1px solid rgba(0,217,255,0.4);color:rgba(0,217,255,0.9);font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;box-shadow:0 0 8px rgba(0,217,255,0.15);transition:all 0.2s;";
                centerBtn.addEventListener("click", () => {
                  popup.close();
                  onPoiSetCenter(poi);
                });
                centerBtn.addEventListener("mouseenter", () => {
                  centerBtn.style.background = "rgba(0,217,255,0.22)";
                  centerBtn.style.boxShadow = "0 0 16px rgba(0,217,255,0.3)";
                  centerBtn.style.transform = "translateY(-1px)";
                });
                centerBtn.addEventListener("mouseleave", () => {
                  centerBtn.style.background = "rgba(0,217,255,0.12)";
                  centerBtn.style.boxShadow = "0 0 8px rgba(0,217,255,0.15)";
                  centerBtn.style.transform = "none";
                });
                popupContent.appendChild(centerBtn);
              }

              const popup = L.popup({
                className: "lrt-poi-popup",
                offset: [0, -4],
              })
                .setLatLng([poi.lat, poi.lng])
                .setContent(popupContent)
                .openOn(currentMap);
            });
          }
          poiMarkersRef.current.push(marker);
        }
      })
      .catch(() => {
        /* POI is non-critical */
      });
    }, 1500);

    return () => {
      clearTimeout(debounceTimer);
      if (poiAbortRef.current) poiAbortRef.current.abort();
    };
  }, [centerLat, centerLng, radiusMiles, showPois, onPoiScan, onPoiSetCenter]);

  // Swap tile layer when tileMode changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: TILE_CONFIGS is a stable const defined inside component; only tileMode triggers this swap
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }
    const cfg = TILE_CONFIGS[tileMode];
    const tile = L.tileLayer(cfg.url, {
      maxZoom: cfg.maxZoom,
      attribution: cfg.attribution,
      subdomains: cfg.subdomains,
    });
    tile.addTo(map);
    tileLayerRef.current = tile;
  }, [tileMode]);

  // Update view + pins when dependencies change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const prev = prevRef.current;
    const centerChanged =
      !prev ||
      Math.abs(prev.lat - centerLat) > 0.00001 ||
      Math.abs(prev.lng - centerLng) > 0.00001 ||
      prev.radius !== radiusMiles;

    if (centerChanged) {
      map.setView([centerLat, centerLng], zoomForRadius(radiusMiles), {
        animate: true,
        duration: 0.5,
      });
      prevRef.current = { lat: centerLat, lng: centerLng, radius: radiusMiles };
    }

    // Clear old grid markers and lines
    for (const m of gridMarkersRef.current) m.remove();
    gridMarkersRef.current = [];
    for (const l of gridLinesRef.current) l.remove();
    gridLinesRef.current = [];

    const gridPoints = computeGridPoints(centerLat, centerLng, radiusMiles);
    const flatCells = cells ? cells.flat() : null;

    // Auto-fit bounds when cells first become available
    if (flatCells && wasCellsNullRef.current) {
      wasCellsNullRef.current = false;
      const bounds = L.latLngBounds(
        gridPoints.map((p) => [p.lat, p.lng] as L.LatLngTuple),
      );
      map.fitBounds(bounds, { padding: [50, 50], animate: true, maxZoom: 15 });
    } else if (!flatCells) {
      wasCellsNullRef.current = true;
    }

    gridPoints.forEach((pt, i) => {
      const direction = DIRECTIONS[i] ?? "";
      let rankLabel = "";
      let pinType:
        | "success"
        | "mid"
        | "poor"
        | "notfound"
        | "pending"
        | "center";

      const isCenter = direction === "Center";
      if (isCenter) {
        pinType = "center";
      } else if (!flatCells || isPreview) {
        pinType = "pending";
      } else {
        const cell = flatCells[i] as GridCell & { pending?: boolean };
        pinType = getPinType(cell, direction);
        rankLabel = cell?.rank != null ? String(Number(cell.rank)) : "N/A";
      }

      const canDragCenter = isCenter && !!onCenterDragged;
      const icon = createPinIcon(rankLabel, direction, pinType, canDragCenter);
      const marker = L.marker([pt.lat, pt.lng], {
        icon,
        interactive: isCenter,
        draggable: canDragCenter,
        zIndexOffset: isCenter ? 1000 : 0,
      }).addTo(map);
      if (canDragCenter && onCenterDragged) {
        marker.on("dragend", async () => {
          const pos = marker.getLatLng();
          marker.setIcon(createPinIcon("", "Center", "center", true));
          const address = await reverseGeocode(pos.lat, pos.lng);
          onCenterDragged(pos.lat, pos.lng, address);
        });
      }
      gridMarkersRef.current.push(marker);
    });

    // Grid connection lines (thin dashed cyan connecting the 3×3 points)
    const lineStyle = { color: "rgba(0,217,255,0.18)", weight: 1, dashArray: "5 5" };
    const rowGroups = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
    const colGroups = [[0, 3, 6], [1, 4, 7], [2, 5, 8]];
    for (const grp of [...rowGroups, ...colGroups]) {
      const pts = grp.map((i) => [gridPoints[i].lat, gridPoints[i].lng] as L.LatLngTuple);
      gridLinesRef.current.push(L.polyline(pts, lineStyle).addTo(map));
    }
  }, [centerLat, centerLng, radiusMiles, cells, isPreview, onCenterDragged]);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        width: "100%",
        height: "clamp(360px, 50vw, 540px)",
        border: "1px solid rgba(0,217,255,0.2)",
        boxShadow:
          "0 0 40px rgba(0,217,255,0.08), 0 0 80px rgba(189,0,255,0.05), 0 8px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
      data-ocid="map_view.container"
    >
      {/* Inject CSS for pin animations and tile theming */}
      <style>{MAP_STYLES}</style>

      {/* Leaflet target — must have explicit height, never display:none */}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

      {/* Street / Satellite toggle — top-left, above Leaflet controls */}
      <div
        className="absolute"
        style={{ top: 12, left: 12, zIndex: 1000 }}
        data-ocid="map_view.tile_toggle"
      >
        <button
          type="button"
          onClick={() =>
            setTileMode((m) => (m === "satellite" ? "street" : "satellite"))
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 6,
            background: "rgba(5,5,16,0.82)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,217,255,0.28)",
            color: "rgba(0,217,255,0.9)",
            fontSize: 11,
            fontFamily: "sans-serif",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "0 0 12px rgba(0,217,255,0.12)",
            transition: "all 0.2s ease",
          }}
        >
          <span style={{ fontSize: 13 }}>
            {tileMode === "satellite" ? "🛰" : "🗺"}
          </span>
          {tileMode === "satellite" ? "Satellite" : "Dark Map"}
          <span style={{ opacity: 0.5, fontSize: 9 }}>▼</span>
        </button>
      </div>

      {/* Drag hint when center dragging is enabled */}
      {onCenterDragged && (
        <div
          className="absolute"
          style={{ bottom: 14, left: 12, zIndex: 1000 }}
          data-ocid="map_view.drag_hint"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 6,
              background: "rgba(5,5,16,0.78)",
              backdropFilter: "blur(10px)",
              border: "1px dashed rgba(0,217,255,0.25)",
              color: "rgba(0,217,255,0.65)",
              fontSize: 10,
              fontFamily: "sans-serif",
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            <span>&#8853;</span> Drag center pin to reposition grid
          </div>
        </div>
      )}

      {/* Radial vignette for pin contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.35) 100%)",
          zIndex: 400,
        }}
      />

      {/* Grid label badge */}
      <div
        className="absolute top-3 right-3 pointer-events-none"
        style={{ zIndex: 500 }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(0,217,255,0.2)",
            borderRadius: 6,
            padding: "4px 10px",
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontFamily: "sans-serif",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(0,217,255,0.75)",
            }}
          >
            {isPreview ? "3×3 Scan Grid Preview" : "Live Rank Grid"}
          </span>
        </div>
      </div>

      {/* Scan progress bar */}
      {progress > 0 && progress < 100 && (
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: 3, background: "rgba(0,0,0,0.4)", zIndex: 500 }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, oklch(0.55 0.24 260), oklch(0.72 0.30 290), oklch(0.68 0.28 180))",
              boxShadow: "0 0 8px rgba(139, 92, 246, 0.8)",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Legacy export aliases so SearchPage imports still work ───────────────────

interface MapViewProps {
  cells: GridCell[][];
  centerLat: number;
  centerLng: number;
  radiusMiles: number;
  className?: string;
  onCenterDragged?: (lat: number, lng: number, address: string) => void;
  onPoiScan?: (poi: PoiMarker) => void;
  onPoiSetCenter?: (poi: PoiMarker) => void;
}

export function MapView(props: MapViewProps) {
  return (
    <LeafletMap
      centerLat={props.centerLat}
      centerLng={props.centerLng}
      radiusMiles={props.radiusMiles}
      cells={props.cells}
      isPreview={false}
      className={props.className}
      onCenterDragged={props.onCenterDragged}
      onPoiScan={props.onPoiScan}
      onPoiSetCenter={props.onPoiSetCenter}
      showPois={true}
    />
  );
}

export function MapPlaceholder({
  centerLat,
  centerLng,
  radiusMiles,
  isScanning = false,
  progress = 0,
  onCenterDragged,
  onPoiScan,
  onPoiSetCenter,
}: {
  centerLat: number;
  centerLng: number;
  radiusMiles: number;
  isScanning?: boolean;
  progress?: number;
  onCenterDragged?: (lat: number, lng: number, address: string) => void;
  onPoiScan?: (poi: PoiMarker) => void;
  onPoiSetCenter?: (poi: PoiMarker) => void;
}) {
  return (
    <LeafletMap
      centerLat={centerLat}
      centerLng={centerLng}
      radiusMiles={radiusMiles}
      cells={undefined}
      isPreview={!isScanning}
      progress={progress}
      onCenterDragged={onCenterDragged}
      onPoiScan={onPoiScan}
      onPoiSetCenter={onPoiSetCenter}
      showPois={true}
    />
  );
}
