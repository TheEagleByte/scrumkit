"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  getUserPokerSessions,
  createPokerSession,
  updatePokerSession,
  deletePokerSession,
  endPokerSession,
  archivePokerSession,
} from "@/lib/poker/actions";
import type {
  CreatePokerSessionInput,
  UpdatePokerSessionInput,
  PokerSession,
} from "@/lib/poker/types";
import { toast } from "sonner";
import { storeAnonymousAsset } from "@/lib/anonymous/asset-claiming";

// Query keys factory
export const pokerSessionKeys = {
  all: ["poker-sessions"] as const,
  lists: () => [...pokerSessionKeys.all, "list"] as const,
  list: (filters: string) => [...pokerSessionKeys.lists(), { filters }] as const,
  details: () => [...pokerSessionKeys.all, "detail"] as const,
  detail: (id: string) => [...pokerSessionKeys.details(), id] as const,
};

// Fetch all user poker sessions
export function usePokerSessions(options?: UseQueryOptions<PokerSession[]>) {
  return useQuery({
    queryKey: pokerSessionKeys.lists(),
    queryFn: async () => {
      const sessions = await getUserPokerSessions();
      return sessions;
    },
    ...options,
  });
}

// Create a new poker session
export function useCreatePokerSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPokerSession,
    onMutate: async (newSession: CreatePokerSessionInput) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: pokerSessionKeys.lists() });

      // Snapshot previous value
      const previousSessions = queryClient.getQueryData<PokerSession[]>(
        pokerSessionKeys.lists()
      );

      // Optimistically update to the new value
      const optimisticSession: PokerSession = {
        id: `temp-${Date.now()}`,
        unique_url: `temp-${Date.now()}`,
        title: newSession.title,
        description: newSession.description || null,
        team_id: newSession.teamId || null,
        created_by: null,
        creator_cookie: null,
        estimation_sequence: newSession.settings?.estimationSequence || "fibonacci",
        custom_sequence: newSession.settings?.customSequence || null,
        auto_reveal: newSession.settings?.autoReveal ?? false,
        allow_revote: newSession.settings?.allowRevote ?? true,
        show_voter_names: newSession.settings?.showVoterNames ?? true,
        status: "active",
        current_story_id: null,
        is_anonymous: !newSession.teamId,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ended_at: null,
      };

      queryClient.setQueryData<PokerSession[]>(
        pokerSessionKeys.lists(),
        (old = []) => [optimisticSession, ...old]
      );

      return { previousSessions };
    },
    onError: (err, newSession, context) => {
      // Rollback on error
      if (context?.previousSessions) {
        queryClient.setQueryData(
          pokerSessionKeys.lists(),
          context.previousSessions
        );
      }
      toast.error("Failed to create poker session");
    },
    onSuccess: (data) => {
      // Store session ID in localStorage for anonymous claiming
      if (data.id) {
        storeAnonymousAsset("poker_session", data.id);
      }
      toast.success("Poker session created successfully!");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: pokerSessionKeys.lists() });
    },
  });
}

// Update a poker session
export function useUpdatePokerSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uniqueUrl,
      updates,
    }: {
      uniqueUrl: string;
      updates: UpdatePokerSessionInput;
    }) => updatePokerSession(uniqueUrl, updates),
    onMutate: async ({ uniqueUrl, updates }) => {
      await queryClient.cancelQueries({ queryKey: pokerSessionKeys.lists() });

      const previousSessions = queryClient.getQueryData<PokerSession[]>(
        pokerSessionKeys.lists()
      );

      // Optimistic update
      queryClient.setQueryData<PokerSession[]>(
        pokerSessionKeys.lists(),
        (old = []) =>
          old.map((session) =>
            session.unique_url === uniqueUrl
              ? {
                  ...session,
                  ...updates,
                  updated_at: new Date().toISOString(),
                }
              : session
          )
      );

      return { previousSessions };
    },
    onError: (err, variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(
          pokerSessionKeys.lists(),
          context.previousSessions
        );
      }
      toast.error("Failed to update poker session");
    },
    onSuccess: (data, { updates }) => {
      if ("status" in updates) {
        if (updates.status === "ended") {
          toast.success("Poker session ended");
        } else if (updates.status === "archived") {
          toast.success("Poker session archived");
        } else {
          toast.success("Poker session updated");
        }
      } else {
        toast.success("Poker session updated");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: pokerSessionKeys.lists() });
    },
  });
}

// End a poker session
export function useEndPokerSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uniqueUrl: string) => endPokerSession(uniqueUrl),
    onSuccess: () => {
      toast.success("Poker session ended");
      queryClient.invalidateQueries({ queryKey: pokerSessionKeys.lists() });
    },
    onError: () => {
      toast.error("Failed to end poker session");
    },
  });
}

// Archive a poker session
export function useArchivePokerSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uniqueUrl: string) => archivePokerSession(uniqueUrl),
    onSuccess: () => {
      toast.success("Poker session archived");
      queryClient.invalidateQueries({ queryKey: pokerSessionKeys.lists() });
    },
    onError: () => {
      toast.error("Failed to archive poker session");
    },
  });
}

// Delete a poker session with undo functionality
export function useDeletePokerSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uniqueUrl: string) => {
      // Don't call the server action immediately - we'll defer it
      return { uniqueUrl };
    },
    onMutate: async (uniqueUrl: string) => {
      await queryClient.cancelQueries({ queryKey: pokerSessionKeys.lists() });

      const previousSessions = queryClient.getQueryData<PokerSession[]>(
        pokerSessionKeys.lists()
      );
      const sessionToDelete = previousSessions?.find(
        (s) => s.unique_url === uniqueUrl
      );

      // Optimistically remove from list
      queryClient.setQueryData<PokerSession[]>(
        pokerSessionKeys.lists(),
        (old = []) => old.filter((session) => session.unique_url !== uniqueUrl)
      );

      // Store deletion info in localStorage for persistence
      const deletionKey = `pending_poker_deletion_${uniqueUrl}`;
      const deletionData = {
        session: sessionToDelete,
        scheduledFor: Date.now() + 5000, // Delete after 5 seconds
      };
      localStorage.setItem(deletionKey, JSON.stringify(deletionData));

      return { previousSessions, sessionToDelete, deletionKey, uniqueUrl };
    },
    onError: (err, uniqueUrl, context) => {
      // Restore the session on error
      if (context?.previousSessions) {
        queryClient.setQueryData(
          pokerSessionKeys.lists(),
          context.previousSessions
        );
      }

      // Clean up localStorage
      if (context?.deletionKey) {
        localStorage.removeItem(context.deletionKey);
      }

      toast.error("Failed to delete poker session");
    },
    onSuccess: (data, uniqueUrl, context) => {
      const message = `Poker session "${context?.sessionToDelete?.title}" deleted`;
      let deletionTimeoutId: NodeJS.Timeout | null = null;

      // Show undo toast
      toast.success(message, {
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => {
            // Cancel deletion
            if (deletionTimeoutId) {
              clearTimeout(deletionTimeoutId);
            }

            // Remove from localStorage
            if (context?.deletionKey) {
              localStorage.removeItem(context.deletionKey);
            }

            // Restore session
            if (context?.previousSessions) {
              queryClient.setQueryData(
                pokerSessionKeys.lists(),
                context.previousSessions
              );
            }

            toast.success("Poker session deletion cancelled");
          },
        },
      });

      // Schedule actual server deletion after 5 seconds
      deletionTimeoutId = setTimeout(async () => {
        // Check if deletion was cancelled
        if (
          context?.deletionKey &&
          !localStorage.getItem(context.deletionKey)
        ) {
          return;
        }

        // Actually delete on server
        try {
          await deletePokerSession(context?.uniqueUrl || uniqueUrl);

          // Clean up localStorage
          if (context?.deletionKey) {
            localStorage.removeItem(context.deletionKey);
          }

          // Invalidate to sync with server
          queryClient.invalidateQueries({ queryKey: pokerSessionKeys.lists() });
        } catch (error) {
          // If server deletion fails, restore the session
          if (context?.previousSessions) {
            queryClient.setQueryData(
              pokerSessionKeys.lists(),
              context.previousSessions
            );
          }
          toast.error("Failed to delete poker session");
        }
      }, 5000);
    },
  });
}
