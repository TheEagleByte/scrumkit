"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getSessionParticipants,
  joinPokerSession,
} from "@/lib/poker/actions";
import type {
  PokerParticipant,
  CreatePokerParticipantInput,
} from "@/lib/poker/types";
import { toast } from "sonner";

// Query keys factory
export const pokerParticipantKeys = {
  all: ["poker-participants"] as const,
  session: (sessionId: string) =>
    [...pokerParticipantKeys.all, "session", sessionId] as const,
};

// Fetch all participants for a session with real-time updates
export function useSessionParticipants(
  sessionId: string,
  options?: UseQueryOptions<PokerParticipant[]>
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: pokerParticipantKeys.session(sessionId),
    queryFn: async () => {
      const participants = await getSessionParticipants(sessionId);
      return participants;
    },
    enabled: !!sessionId,
    ...options,
  });

  // Real-time subscription for participant changes
  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();

    // Subscribe to poker_participants changes for this session
    const channel = supabase
      .channel(`poker-participants:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "poker_participants",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log("Participant change:", payload);

          // Invalidate queries to refetch data
          queryClient.invalidateQueries({
            queryKey: pokerParticipantKeys.session(sessionId),
          });
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);

  return query;
}

// Join a poker session as a participant
export function useJoinPokerSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      input,
    }: {
      sessionId: string;
      input: CreatePokerParticipantInput;
    }) => joinPokerSession(sessionId, input),
    onMutate: async ({ sessionId, input }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: pokerParticipantKeys.session(sessionId),
      });

      // Snapshot previous value
      const previousParticipants = queryClient.getQueryData<PokerParticipant[]>(
        pokerParticipantKeys.session(sessionId)
      );

      // Optimistically update to the new value
      const optimisticParticipant: PokerParticipant = {
        id: `temp-${Date.now()}`,
        session_id: sessionId,
        profile_id: null,
        name: input.name,
        avatar_url: input.avatar_url || null,
        is_facilitator: input.is_facilitator || false,
        is_observer: input.is_observer || false,
        participant_cookie: null,
        last_seen_at: new Date().toISOString(),
        joined_at: new Date().toISOString(),
      };

      queryClient.setQueryData<PokerParticipant[]>(
        pokerParticipantKeys.session(sessionId),
        (old = []) => [...old, optimisticParticipant]
      );

      return { previousParticipants, sessionId };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousParticipants !== undefined && context?.sessionId) {
        queryClient.setQueryData(
          pokerParticipantKeys.session(context.sessionId),
          context.previousParticipants
        );
      }

      const errorMessage =
        err instanceof Error ? err.message : "Failed to join session";
      toast.error(errorMessage);
    },
    onSuccess: () => {
      toast.success("Joined session successfully!");
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: pokerParticipantKeys.session(variables.sessionId),
      });
    },
  });
}

// Hook to get participant count for a session
export function useParticipantCount(sessionId: string): number {
  const { data: participants } = useSessionParticipants(sessionId);
  return participants?.length || 0;
}
