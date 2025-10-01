"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  submitPokerVote,
  getStoryVotes,
  getParticipantVote,
} from "@/lib/poker/actions";
import type { PokerVote, PokerParticipant } from "@/lib/poker/types";
import { toast } from "sonner";

// Query keys factory
export const pokerVoteKeys = {
  all: ["poker-votes"] as const,
  story: (storyId: string) => [...pokerVoteKeys.all, "story", storyId] as const,
  participant: (storyId: string) => [...pokerVoteKeys.all, "participant", storyId] as const,
};

// Fetch all votes for a story
export function useStoryVotes(
  storyId: string,
  options?: UseQueryOptions<(PokerVote & { participant: PokerParticipant })[]>
) {
  return useQuery({
    queryKey: pokerVoteKeys.story(storyId),
    queryFn: async () => {
      const votes = await getStoryVotes(storyId);
      return votes;
    },
    enabled: !!storyId,
    ...options,
  });
}

// Fetch current participant's vote for a story
export function useParticipantVote(
  storyId: string,
  options?: UseQueryOptions<PokerVote | null>
) {
  return useQuery({
    queryKey: pokerVoteKeys.participant(storyId),
    queryFn: async () => {
      const vote = await getParticipantVote(storyId);
      return vote;
    },
    enabled: !!storyId,
    ...options,
  });
}

// Submit or update a vote
export function useSubmitVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storyId,
      voteValue,
    }: {
      storyId: string;
      voteValue: string;
    }) => submitPokerVote(storyId, voteValue),
    onMutate: async ({ storyId, voteValue }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: pokerVoteKeys.participant(storyId),
      });

      // Snapshot previous value
      const previousVote = queryClient.getQueryData<PokerVote | null>(
        pokerVoteKeys.participant(storyId)
      );

      // Optimistically update to the new value
      const optimisticVote: PokerVote = {
        id: previousVote?.id || `temp-${Date.now()}`,
        story_id: storyId,
        participant_id: previousVote?.participant_id || "temp",
        session_id: previousVote?.session_id || "temp",
        vote_value: voteValue,
        is_revealed: false,
        created_at: previousVote?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<PokerVote | null>(
        pokerVoteKeys.participant(storyId),
        optimisticVote
      );

      return { previousVote, storyId };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousVote !== undefined && context?.storyId) {
        queryClient.setQueryData(
          pokerVoteKeys.participant(context.storyId),
          context.previousVote
        );
      }

      // Extract error message
      const errorMessage = err instanceof Error ? err.message : "Failed to submit vote";
      toast.error(errorMessage);
    },
    onSuccess: (data, variables, context) => {
      const isUpdate = !!context?.previousVote;
      toast.success(isUpdate ? "Vote updated!" : "Vote submitted!");
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: pokerVoteKeys.participant(variables.storyId),
      });
      queryClient.invalidateQueries({
        queryKey: pokerVoteKeys.story(variables.storyId),
      });
    },
  });
}

// Hook to check if user has voted
export function useHasVoted(storyId: string): boolean {
  const { data: vote } = useParticipantVote(storyId);
  return !!vote;
}

// Hook to get current vote value
export function useCurrentVoteValue(storyId: string): string | null {
  const { data: vote } = useParticipantVote(storyId);
  return vote?.vote_value || null;
}
