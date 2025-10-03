"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { claimAnonymousAssets } from "@/lib/anonymous/actions";
import {
  getAllAnonymousAssets,
  clearAllAnonymousAssets,
  formatClaimResultMessage,
  getAnonymousAssetCount,
} from "@/lib/anonymous/asset-claiming";
import type { ClaimResult } from "@/lib/anonymous/asset-claiming";

/**
 * Hook for claiming anonymous assets when a user signs up or signs in
 *
 * This hook:
 * 1. Gets all anonymous asset IDs from localStorage
 * 2. Calls the server action to claim them in the database
 * 3. Clears localStorage on success
 * 4. Shows a success toast with the number of claimed assets
 * 5. Invalidates relevant queries to refresh the UI
 *
 * @returns Mutation object for claiming assets
 */
export function useClaimAssets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Get all anonymous assets from localStorage
      const assets = getAllAnonymousAssets();

      // If no assets to claim, return early
      if (
        assets.retrospectives.length === 0 &&
        assets.pokerSessions.length === 0
      ) {
        return {
          retrospectives: 0,
          pokerSessions: 0,
          total: 0,
        } as ClaimResult;
      }

      // Call server action to claim assets
      const result = await claimAnonymousAssets(userId, assets);

      return result;
    },
    onSuccess: (result) => {
      // Clear localStorage
      clearAllAnonymousAssets();

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.invalidateQueries({ queryKey: ["poker-sessions"] });

      // Show success toast if any assets were claimed
      if (result.total > 0) {
        const message = formatClaimResultMessage(result);
        toast.success(message.title, {
          description: message.description,
        });
      }
    },
    onError: (error) => {
      console.error("Error claiming assets:", error);
      toast.error("Failed to save your assets", {
        description:
          "Don't worry, your assets are still accessible. Try signing in again to save them.",
      });
    },
  });
}

/**
 * Hook to check if there are any anonymous assets to claim
 *
 * @returns Number of anonymous assets available to claim
 */
export function useHasAnonymousAssets(): number {
  if (typeof window === "undefined") return 0;

  return getAnonymousAssetCount();
}
