"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { FacilitatorSettings } from "@/components/retro/FacilitatorPanel";
import type { RetroPhase } from "@/components/retro/PhaseManager";
import type { TimerState } from "@/components/retro/Timer";
import { useEffect } from "react";

// Default facilitator settings
const DEFAULT_SETTINGS: FacilitatorSettings = {
  timer: null,
  phase: "brainstorm",
  focusedColumnId: null,
  soundEnabled: true,
};

/**
 * Parse facilitator settings from retrospective settings JSON
 */
function parseFacilitatorSettings(settings: unknown): FacilitatorSettings {
  if (!settings || typeof settings !== 'object') {
    return DEFAULT_SETTINGS;
  }

  const settingsObj = settings as Record<string, unknown>;
  const facilitator = settingsObj.facilitator as Record<string, unknown> | undefined;

  return {
    timer: (facilitator?.timer as TimerState | null) || null,
    phase: (facilitator?.phase as RetroPhase) || "brainstorm",
    focusedColumnId: (facilitator?.focusedColumnId as string | null) || null,
    soundEnabled: facilitator?.soundEnabled !== undefined ? (facilitator.soundEnabled as boolean) : true,
  };
}

/**
 * Hook to fetch facilitator settings for a retrospective
 */
export function useFacilitatorSettings(retrospectiveId: string) {
  return useQuery<FacilitatorSettings>({
    queryKey: ["retrospective", retrospectiveId, "facilitator-settings"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("retrospectives")
        .select("settings")
        .eq("id", retrospectiveId)
        .single();

      if (error) {
        console.error("Error fetching facilitator settings:", error);
        return DEFAULT_SETTINGS;
      }

      return parseFacilitatorSettings(data.settings);
    },
  });
}

/**
 * Hook to update facilitator settings
 */
export function useUpdateFacilitatorSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      retrospectiveId,
      settings,
    }: {
      retrospectiveId: string;
      settings: Partial<FacilitatorSettings>;
    }) => {
      const supabase = createClient();

      // First, fetch current settings
      const { data: current, error: fetchError } = await supabase
        .from("retrospectives")
        .select("settings")
        .eq("id", retrospectiveId)
        .single();

      if (fetchError) {
        throw new Error("Failed to fetch current settings");
      }

      // Merge new settings with existing
      const currentSettings = (current?.settings || {}) as Record<string, unknown>;
      const currentFacilitator = (currentSettings.facilitator || {}) as Record<string, unknown>;

      const updatedSettings = {
        ...currentSettings,
        facilitator: {
          ...currentFacilitator,
          ...settings,
        },
      };

      // Update in database
      const { error: updateError } = await supabase
        .from("retrospectives")
        .update({ settings: updatedSettings as unknown as typeof current.settings })
        .eq("id", retrospectiveId);

      if (updateError) {
        throw updateError;
      }

      return updatedSettings.facilitator;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["retrospective", variables.retrospectiveId, "facilitator-settings"],
      });
    },
    onError: (error) => {
      console.error("Failed to update facilitator settings:", error);
      toast.error("Failed to update facilitator settings");
    },
  });
}

/**
 * Hook to update timer state
 */
export function useUpdateTimer() {
  const updateSettings = useUpdateFacilitatorSettings();

  return useMutation({
    mutationFn: async ({
      retrospectiveId,
      timer,
    }: {
      retrospectiveId: string;
      timer: TimerState | null;
    }) => {
      return updateSettings.mutateAsync({
        retrospectiveId,
        settings: { timer },
      });
    },
  });
}

/**
 * Hook to update current phase
 */
export function useUpdatePhase() {
  const updateSettings = useUpdateFacilitatorSettings();

  return useMutation({
    mutationFn: async ({
      retrospectiveId,
      phase,
    }: {
      retrospectiveId: string;
      phase: RetroPhase;
    }) => {
      return updateSettings.mutateAsync({
        retrospectiveId,
        settings: { phase },
      });
    },
  });
}

/**
 * Hook to update focus mode
 */
export function useUpdateFocus() {
  const updateSettings = useUpdateFacilitatorSettings();

  return useMutation({
    mutationFn: async ({
      retrospectiveId,
      focusedColumnId,
    }: {
      retrospectiveId: string;
      focusedColumnId: string | null;
    }) => {
      return updateSettings.mutateAsync({
        retrospectiveId,
        settings: { focusedColumnId },
      });
    },
  });
}

/**
 * Hook to subscribe to real-time facilitator settings updates
 */
export function useFacilitatorRealtime(retrospectiveId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to retrospectives table changes
    const channel = supabase
      .channel(`facilitator-${retrospectiveId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "retrospectives",
          filter: `id=eq.${retrospectiveId}`,
        },
        (payload) => {
          // When settings change, invalidate the query
          const newSettings = parseFacilitatorSettings(payload.new.settings);
          queryClient.setQueryData(
            ["retrospective", retrospectiveId, "facilitator-settings"],
            newSettings
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [retrospectiveId, queryClient]);
}
