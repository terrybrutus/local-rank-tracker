import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type SearchId = bigint;
export type UserId = Principal;
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SavedSearch {
    id: SearchId;
    userId: UserId;
    createdAt: Timestamp;
    businessName: string;
    results: Array<RankResult>;
    address: string;
    keyword: string;
    centerLat: number;
    centerLng: number;
}
export interface SaveSearchInput {
    businessName: string;
    results: Array<RankResult>;
    address: string;
    keyword: string;
    centerLat: number;
    centerLng: number;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface RankResult {
    lat: number;
    lng: number;
    rank?: bigint;
}
export interface PartialScan {
    startedAt: Timestamp;
    businessName: string;
    results: Array<RankResult>;
    address: string;
    keyword: string;
    centerLat: number;
    centerLng: number;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearLastPartialScan(): Promise<void>;
    deleteSavedSearch(searchId: SearchId): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getGridPoints(centerLat: number, centerLng: number): Promise<Array<[number, number]>>;
    getLastPartialScan(): Promise<PartialScan | null>;
    getSavedSearch(searchId: SearchId): Promise<SavedSearch | null>;
    getSerpApiKey(): Promise<string | null>;
    isCallerAdmin(): Promise<boolean>;
    listSavedSearches(): Promise<Array<SavedSearch>>;
    queryGridPoint(businessName: string, keyword: string, lat: number, lng: number, gridIndex: bigint): Promise<bigint | null>;
    saveSearch(input: SaveSearchInput): Promise<SearchId>;
    setSerpApiKey(apiKey: string): Promise<void>;
    startScan(businessName: string, keyword: string, address: string, centerLat: number, centerLng: number): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
