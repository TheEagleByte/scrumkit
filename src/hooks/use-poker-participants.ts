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

// Type for session participants query key
type SessionParticipantsKey = ReturnType<typeof pokerParticipantKeys.session>;

// Type for session participants options - narrowed to prevent key/fn override
type SessionParticipantsOptions = Omit<
  UseQueryOptions<PokerParticipant[], Error, PokerParticipant[], SessionParticipantsKey>,
  "queryKey" | "queryFn" | "enabled"
>;

/**
 * Hook to fetch and subscribe to participants for a poker session with real-time updates.
 *
 * @param sessionId - The unique identifier of the poker session
 * @param options - Optional React Query configuration options
 * @returns Query result containing participant data and loading states
 *
 * @example
 * ```tsx
 * const { data: participants, isLoading } = useSessionParticipants(sessionId);
 * ```
 */
export function useSessionParticipants(
  sessionId: string,
  options?: SessionParticipantsOptions
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
          if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.debug("Participant change:", payload?.eventType);
          }

          // Skip heartbeat-only updates to reduce unnecessary refetches
          if (payload?.eventType === "UPDATE") {
            const oldRow = payload.old ?? {};
            const newRow = payload.new ?? {};
            const changed = Object.keys(newRow).filter((k) => oldRow[k] !== newRow[k]);
            if (changed.length === 1 && changed[0] === "last_seen_at") {
              return;
            }
          }

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

/**
 * Mutation hook to join a poker session as a participant with optimistic updates.
 *
 * @returns Mutation object with mutate function and loading states
 *
 * @example
 * ```tsx
 * const joinSession = useJoinPokerSession();
 * joinSession.mutate({ sessionId, input: { name: "John" } });
 * ```
 */
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

/**
 * Hook to get the count of participants in a session.
 *
 * Note: This hook calls useSessionParticipants and subscribes to real-time updates.
 * For count-only queries without real-time updates, consider using a separate hook.
 *
 * @param sessionId - The unique identifier of the poker session
 * @returns The number of participants in the session
 *
 * @example
 * ```tsx
 * const participantCount = useParticipantCount(sessionId);
 * ```
 */
export function useParticipantCount(sessionId: string): number {
  const { data: participants } = useSessionParticipants(sessionId);
  return participants?.length || 0;
}
