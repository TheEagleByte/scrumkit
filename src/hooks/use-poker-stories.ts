"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  getSessionStories,
  createPokerStory,
  updatePokerStory,
  deletePokerStory,
  reorderStories,
  setCurrentStory,
  bulkImportStories,
} from "@/lib/poker/actions";
import type {
  PokerStory,
  CreatePokerStoryInput,
  UpdatePokerStoryInput,
} from "@/lib/poker/types";
import { toast } from "sonner";

// Query keys factory
export const pokerStoryKeys = {
  all: ["poker-stories"] as const,
  lists: () => [...pokerStoryKeys.all, "list"] as const,
  list: (sessionId: string) => [...pokerStoryKeys.lists(), sessionId] as const,
  details: () => [...pokerStoryKeys.all, "detail"] as const,
  detail: (id: string) => [...pokerStoryKeys.details(), id] as const,
};

// Fetch stories for a session
export function usePokerStories(
  sessionId: string,
  options?: UseQueryOptions<PokerStory[]>
) {
  return useQuery({
    queryKey: pokerStoryKeys.list(sessionId),
    queryFn: async () => {
      const stories = await getSessionStories(sessionId);
      return stories;
    },
    enabled: !!sessionId,
    ...options,
  });
}

// Create a new story
export function useCreatePokerStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPokerStory,
    onMutate: async (newStory: CreatePokerStoryInput) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: pokerStoryKeys.list(newStory.sessionId),
      });

      // Snapshot previous value
      const previousStories = queryClient.getQueryData<PokerStory[]>(
        pokerStoryKeys.list(newStory.sessionId)
      );

      // Optimistically update to the new value
      const optimisticStory: PokerStory = {
        id: `temp-${Date.now()}`,
        session_id: newStory.sessionId,
        title: newStory.title,
        description: newStory.description || null,
        acceptance_criteria: newStory.acceptance_criteria || null,
        external_link: newStory.external_link || null,
        status: "pending",
        final_estimate: null,
        display_order: newStory.display_order ?? (previousStories?.length ?? 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<PokerStory[]>(
        pokerStoryKeys.list(newStory.sessionId),
        (old = []) => [...old, optimisticStory]
      );

      return { previousStories, sessionId: newStory.sessionId };
    },
    onError: (err, newStory, context) => {
      // Rollback on error
      if (context?.previousStories && context?.sessionId) {
        queryClient.setQueryData(
          pokerStoryKeys.list(context.sessionId),
          context.previousStories
        );
      }
      toast.error("Failed to create story");
    },
    onSuccess: () => {
      toast.success("Story created successfully!");
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: pokerStoryKeys.list(variables.sessionId),
      });
    },
  });
}

// Update a story
export function useUpdatePokerStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storyId,
      updates,
    }: {
      storyId: string;
      sessionId: string;
      updates: UpdatePokerStoryInput;
    }) => updatePokerStory(storyId, updates),
    onMutate: async ({ storyId, sessionId, updates }) => {
      await queryClient.cancelQueries({
        queryKey: pokerStoryKeys.list(sessionId),
      });

      const previousStories = queryClient.getQueryData<PokerStory[]>(
        pokerStoryKeys.list(sessionId)
      );

      // Optimistic update
      queryClient.setQueryData<PokerStory[]>(
        pokerStoryKeys.list(sessionId),
        (old = []) =>
          old.map((story) =>
            story.id === storyId
              ? {
                  ...story,
                  ...updates,
                  updated_at: new Date().toISOString(),
                }
              : story
          )
      );

      return { previousStories, sessionId };
    },
    onError: (err, variables, context) => {
      if (context?.previousStories && context?.sessionId) {
        queryClient.setQueryData(
          pokerStoryKeys.list(context.sessionId),
          context.previousStories
        );
      }
      toast.error("Failed to update story");
    },
    onSuccess: () => {
      toast.success("Story updated successfully!");
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: pokerStoryKeys.list(variables.sessionId),
      });
    },
  });
}

// Delete a story with undo functionality
export function useDeletePokerStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storyId, sessionId }: { storyId: string; sessionId: string }) => {
      // Don't call the server action immediately - we'll defer it
      return { storyId, sessionId };
    },
    onMutate: async ({ storyId, sessionId }) => {
      await queryClient.cancelQueries({
        queryKey: pokerStoryKeys.list(sessionId),
      });

      const previousStories = queryClient.getQueryData<PokerStory[]>(
        pokerStoryKeys.list(sessionId)
      );
      const storyToDelete = previousStories?.find((s) => s.id === storyId);

      // Optimistically remove from list
      queryClient.setQueryData<PokerStory[]>(
        pokerStoryKeys.list(sessionId),
        (old = []) => old.filter((story) => story.id !== storyId)
      );

      // Store deletion info in localStorage for persistence
      const deletionKey = `pending_story_deletion_${storyId}`;
      const deletionData = {
        story: storyToDelete,
        sessionId,
        scheduledFor: Date.now() + 5000, // Delete after 5 seconds
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(deletionKey, JSON.stringify(deletionData));
      }

      return { previousStories, storyToDelete, deletionKey, storyId, sessionId };
    },
    onError: (err, variables, context) => {
      // Restore the story on error
      if (context?.previousStories && context?.sessionId) {
        queryClient.setQueryData(
          pokerStoryKeys.list(context.sessionId),
          context.previousStories
        );
      }

      // Clean up localStorage
      if (context?.deletionKey && typeof window !== "undefined") {
        localStorage.removeItem(context.deletionKey);
      }

      toast.error("Failed to delete story");
    },
    onSuccess: (data, variables, context) => {
      const message = `Story "${context?.storyToDelete?.title}" deleted`;
      let deletionTimeoutId: ReturnType<typeof setTimeout> | null = null;

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
            if (context?.deletionKey && typeof window !== "undefined") {
              localStorage.removeItem(context.deletionKey);
            }

            // Restore story
            if (context?.previousStories && context?.sessionId) {
              queryClient.setQueryData(
                pokerStoryKeys.list(context.sessionId),
                context.previousStories
              );
            }

            toast.success("Story deletion cancelled");
          },
        },
      });

      // Schedule actual server deletion after 5 seconds
      deletionTimeoutId = setTimeout(async () => {
        // Check if deletion was cancelled
        if (
          context?.deletionKey &&
          typeof window !== "undefined" &&
          !localStorage.getItem(context.deletionKey)
        ) {
          return;
        }

        // Actually delete on server
        try {
          await deletePokerStory(context?.storyId || variables.storyId);

          // Clean up localStorage
          if (context?.deletionKey && typeof window !== "undefined") {
            localStorage.removeItem(context.deletionKey);
          }

          // Invalidate to sync with server
          queryClient.invalidateQueries({
            queryKey: pokerStoryKeys.list(context?.sessionId || variables.sessionId),
          });
        } catch (error) {
          // If server deletion fails, restore the story
          if (context?.previousStories && context?.sessionId) {
            queryClient.setQueryData(
              pokerStoryKeys.list(context.sessionId),
              context.previousStories
            );
          }
          toast.error("Failed to delete story");
        }
      }, 5000);
    },
  });
}

// Reorder stories
export function useReorderStories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      storyOrders,
    }: {
      sessionId: string;
      storyOrders: { id: string; display_order: number }[];
    }) => reorderStories(sessionId, storyOrders),
    onMutate: async ({ sessionId, storyOrders }) => {
      await queryClient.cancelQueries({
        queryKey: pokerStoryKeys.list(sessionId),
      });

      const previousStories = queryClient.getQueryData<PokerStory[]>(
        pokerStoryKeys.list(sessionId)
      );

      // Optimistic update - reorder stories
      queryClient.setQueryData<PokerStory[]>(
        pokerStoryKeys.list(sessionId),
        (old = []) => {
          const orderMap = new Map(storyOrders.map(o => [o.id, o.display_order]));
          return old
            .map(story => ({
              ...story,
              display_order: orderMap.get(story.id) ?? story.display_order,
            }))
            .sort((a, b) => a.display_order - b.display_order);
        }
      );

      return { previousStories, sessionId };
    },
    onError: (err, variables, context) => {
      if (context?.previousStories && context?.sessionId) {
        queryClient.setQueryData(
          pokerStoryKeys.list(context.sessionId),
          context.previousStories
        );
      }
      toast.error("Failed to reorder stories");
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: pokerStoryKeys.list(variables.sessionId),
      });
    },
  });
}

// Set current story
export function useSetCurrentStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      storyId,
    }: {
      sessionId: string;
      storyId: string | null;
    }) => setCurrentStory(sessionId, storyId),
    onSuccess: () => {
      toast.success("Current story updated");
      // Invalidate session queries to reflect the change
      queryClient.invalidateQueries({ queryKey: ["poker-sessions"] });
    },
    onError: () => {
      toast.error("Failed to set current story");
    },
  });
}

// Bulk import stories
export function useBulkImportStories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      stories,
    }: {
      sessionId: string;
      stories: Omit<CreatePokerStoryInput, "sessionId">[];
    }) => bulkImportStories(sessionId, stories),
    onSuccess: (data, variables) => {
      toast.success(`Successfully imported ${data.length} stories`);
      queryClient.invalidateQueries({
        queryKey: pokerStoryKeys.list(variables.sessionId),
      });
    },
    onError: () => {
      toast.error("Failed to import stories");
    },
  });
}

// Hook to navigate to next/previous story
export function useNavigateStory(sessionId: string, stories: PokerStory[], currentStoryId: string | null) {
  const setCurrentStory = useSetCurrentStory();

  const currentIndex = currentStoryId
    ? stories.findIndex((s) => s.id === currentStoryId)
    : -1;

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      const nextStory = stories[currentIndex + 1];
      setCurrentStory.mutate({ sessionId, storyId: nextStory.id });
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const previousStory = stories[currentIndex - 1];
      setCurrentStory.mutate({ sessionId, storyId: previousStory.id });
    }
  };

  return {
    goToNext,
    goToPrevious,
    canGoNext: currentIndex < stories.length - 1,
    canGoPrevious: currentIndex > 0,
    currentIndex,
  };
}
