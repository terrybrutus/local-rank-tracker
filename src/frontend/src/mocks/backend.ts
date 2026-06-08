import type { backendInterface, SavedSearch, RankResult, PartialScan } from "../backend";
import { UserRole } from "../backend";
import { Principal } from "@icp-sdk/core/principal";

const sampleResults: RankResult[] = [
  { lat: 34.2257, lng: -77.9447, rank: BigInt(2) },
  { lat: 34.2257, lng: -77.9302, rank: BigInt(4) },
  { lat: 34.2257, lng: -77.9157, rank: BigInt(1) },
  { lat: 34.2112, lng: -77.9447, rank: BigInt(7) },
  { lat: 34.2112, lng: -77.9302, rank: BigInt(3) },
  { lat: 34.2112, lng: -77.9157, rank: BigInt(5) },
  { lat: 34.1967, lng: -77.9447, rank: BigInt(12) },
  { lat: 34.1967, lng: -77.9302, rank: undefined },
  { lat: 34.1967, lng: -77.9157, rank: BigInt(9) },
];

const sampleSearch: SavedSearch = {
  id: BigInt(1),
  userId: Principal.anonymous(),
  createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  businessName: "McDonald's",
  keyword: "fast food near me",
  address: "Wilmington, NC",
  results: sampleResults,
  centerLat: 34.2112,
  centerLng: -77.9302,
};

export const mockBackend: backendInterface = {
  assignCallerUserRole: async () => undefined,
  clearLastPartialScan: async () => undefined,
  deleteSavedSearch: async () => undefined,
  getCallerUserRole: async () => UserRole.user,
  getGridPoints: async (centerLat: number, centerLng: number) => [
    [centerLat + 0.0145, centerLng - 0.0174],
    [centerLat + 0.0145, centerLng],
    [centerLat + 0.0145, centerLng + 0.0174],
    [centerLat, centerLng - 0.0174],
    [centerLat, centerLng],
    [centerLat, centerLng + 0.0174],
    [centerLat - 0.0145, centerLng - 0.0174],
    [centerLat - 0.0145, centerLng],
    [centerLat - 0.0145, centerLng + 0.0174],
  ],
  getLastPartialScan: async () => null,
  getSavedSearch: async () => sampleSearch,
  getSerpApiKey: async () => "mock-api-key-for-testing",
  isCallerAdmin: async () => false,
  listSavedSearches: async () => [sampleSearch],
  queryGridPoint: async () => BigInt(4),
  saveSearch: async () => BigInt(2),
  setSerpApiKey: async () => undefined,  _initializeAccessControl: async () => undefined,

  startScan: async () => undefined,
  transform: async (input) => ({
    status: BigInt(200),
    body: new Uint8Array(),
    headers: [],
  }),
};
