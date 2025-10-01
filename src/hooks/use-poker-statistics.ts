"use client";

import {
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { getSessionStatistics } from "@/lib/poker/actions";
import type { SessionStatistics } from "@/lib/poker/types";

// Query keys factory
export const pokerStatisticsKeys = {
  all: ["poker-statistics"] as const,
  session: (sessionId: string) => [...pokerStatisticsKeys.all, sessionId] as const,
};

/**
 * Hook to fetch session statistics
 * Fetches comprehensive analytics including story metrics, participant stats, and velocity
 */
export function useSessionStatistics(
  sessionId: string,
  options?: Omit<UseQueryOptions<SessionStatistics>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: pokerStatisticsKeys.session(sessionId),
    queryFn: async () => {
      const statistics = await getSessionStatistics(sessionId);
      return statistics;
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    ...options,
  });
}
