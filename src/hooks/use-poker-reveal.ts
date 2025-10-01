"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { revealStoryVotes, resetStoryVotes } from "@/lib/poker/actions";
import { toast } from "sonner";
import { pokerVoteKeys } from "./use-poker-votes";
import { pokerStoryKeys } from "./use-poker-stories";

// Reveal votes for a story
export function useRevealVotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storyId: string) => revealStoryVotes(storyId),
    onMutate: async (storyId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: pokerVoteKeys.story(storyId),
      });

      return { storyId };
    },
    onError: (err) => {
      // Extract error message
      const errorMessage = err instanceof Error ? err.message : "Failed to reveal votes";
      toast.error(errorMessage);
    },
    onSuccess: () => {
      toast.success("Votes revealed!");
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: pokerVoteKeys.story(variables),
      });
      queryClient.invalidateQueries({
        queryKey: pokerStoryKeys.all,
      });
    },
  });
}

// Reset votes for a story
export function useResetVotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storyId: string) => resetStoryVotes(storyId),
    onMutate: async (storyId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: pokerVoteKeys.story(storyId),
      });

      return { storyId };
    },
    onError: (err) => {
      // Extract error message
      const errorMessage = err instanceof Error ? err.message : "Failed to reset votes";
      toast.error(errorMessage);
    },
    onSuccess: () => {
      toast.success("Voting has been reset");
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: pokerVoteKeys.story(variables),
      });
      queryClient.invalidateQueries({
        queryKey: pokerVoteKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: pokerStoryKeys.all,
      });
    },
  });
}
