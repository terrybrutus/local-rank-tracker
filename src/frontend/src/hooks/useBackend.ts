import { createActor } from "@/backend";
import type { SaveSearchInput, SavedSearch } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBackend() {
  return useActor(createActor);
}

export function useSavedSearches() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SavedSearch[]>({
    queryKey: ["savedSearches"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSavedSearches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSavedSearch(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SavedSearch | null>({
    queryKey: ["savedSearch", id?.toString()],
    queryFn: async () => {
      if (!actor || id == null) return null;
      return actor.getSavedSearch(id);
    },
    enabled: !!actor && !isFetching && id != null,
  });
}

export function useSaveSearch() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation<bigint, Error, SaveSearchInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.saveSearch(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savedSearches"] }),
  });
}

export function useDeleteSearch() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteSavedSearch(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savedSearches"] }),
  });
}

export function useSerpApiKey() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<string | null>({
    queryKey: ["serpApiKey"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSerpApiKey();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetSerpApiKey() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (key) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setSerpApiKey(key);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["serpApiKey"] }),
  });
}

export function useClearSerpApiKey() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation<void, Error, undefined>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setSerpApiKey("");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["serpApiKey"] }),
  });
}

export function useGetGridPoints() {
  const { actor } = useActor(createActor);
  return useMutation<
    Array<[number, number]>,
    Error,
    { centerLat: number; centerLng: number }
  >({
    mutationFn: async ({ centerLat, centerLng }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getGridPoints(centerLat, centerLng);
    },
  });
}

export function useQueryGridPoint() {
  const { actor } = useActor(createActor);
  return useMutation<
    bigint | null,
    Error,
    {
      businessName: string;
      keyword: string;
      lat: number;
      lng: number;
      gridIndex: bigint;
    }
  >({
    mutationFn: async ({ businessName, keyword, lat, lng, gridIndex }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.queryGridPoint(businessName, keyword, lat, lng, gridIndex);
    },
  });
}
