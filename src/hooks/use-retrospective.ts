"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions
} from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types-enhanced";
import { sanitizeItemContent, sanitizeUsername } from "@/lib/utils/sanitize";
import { canCreateItem, canDeleteItem, canVote } from "@/lib/utils/rate-limit";
import { storeAnonymousItemOwnership } from "@/lib/boards/anonymous-items";
import { v4 as uuidv4 } from "uuid";
import {
  calculateReorderPositions,
  calculateCrossColumnPositions,
  reindexPositions
} from "@/lib/utils/position";

// Types
type RetrospectiveItem = Database["public"]["Tables"]["retrospective_items"]["Row"];
type RetrospectiveColumn = Database["public"]["Tables"]["retrospective_columns"]["Row"];
type Vote = Database["public"]["Tables"]["votes"]["Row"];
type Retrospective = Database["public"]["Tables"]["retrospectives"]["Row"];

interface CreateItemInput {
  retrospectiveId: string;
  columnId: string;
  content: string;
  authorId: string;
  authorName: string;
}

// Query keys factory
export const retrospectiveKeys = {
  all: ["retrospectives"] as const,
  details: () => [...retrospectiveKeys.all, "detail"] as const,
  detail: (id: string) => [...retrospectiveKeys.details(), id] as const,
  items: (retrospectiveId: string) => [...retrospectiveKeys.detail(retrospectiveId), "items"] as const,
  columns: (retrospectiveId: string) => [...retrospectiveKeys.detail(retrospectiveId), "columns"] as const,
  votes: (retrospectiveId: string, scope: string = "all") =>
    [...retrospectiveKeys.detail(retrospectiveId), "votes", scope] as const,
  voteStats: (retrospectiveId: string, userId: string) => [...retrospectiveKeys.detail(retrospectiveId), "voteStats", userId] as const,
};

// Fetch retrospective details
export function useRetrospective(retrospectiveId: string, options?: UseQueryOptions<Retrospective | null>) {
  return useQuery({
    queryKey: retrospectiveKeys.detail(retrospectiveId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("retrospectives")
        .select("*")
        .eq("id", retrospectiveId)
        .single();

      if (error) {
        console.error("Error fetching retrospective:", error);
        return null;
      }
      return data;
    },
    ...options,
  });
}

// Fetch retrospective columns
export function useRetrospectiveColumns(retrospectiveId: string) {
  return useQuery<RetrospectiveColumn[]>({
    queryKey: retrospectiveKeys.columns(retrospectiveId),
    queryFn: async (): Promise<RetrospectiveColumn[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("retrospective_columns")
        .select("*")
        .eq("retrospective_id", retrospectiveId)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching columns:", error);
        return [];
      }
      return data;
    },
  });
}

// Fetch retrospective items
export function useRetrospectiveItems(retrospectiveId: string) {
  return useQuery<RetrospectiveItem[]>({
    queryKey: retrospectiveKeys.items(retrospectiveId),
    queryFn: async (): Promise<RetrospectiveItem[]> => {
      const supabase = createClient();

      // First get all column IDs for this retrospective
      const { data: columns, error: columnsError } = await supabase
        .from("retrospective_columns")
        .select("id")
        .eq("retrospective_id", retrospectiveId);

      if (columnsError) {
        console.error("Error fetching columns for items:", columnsError);
        return [];
      }

      if (!columns || columns.length === 0) {
        return [];
      }

      const columnIds = columns.map(col => col.id);

      // Now fetch items for these columns
      const { data, error } = await supabase
        .from("retrospective_items")
        .select("*")
        .in("column_id", columnIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching items:", error);
        return [];
      }
      return data;
    },
    refetchInterval: 5000, // Poll every 5 seconds for real-time feel
  });
}

// Fetch votes for items
export function useVotes(retrospectiveId: string, itemIds: string[]) {
  // Create a stable scope string from itemIds
  const scope = itemIds.length === 0 ? "none" : itemIds.slice().sort().join(",");

  return useQuery<Vote[]>({
    queryKey: retrospectiveKeys.votes(retrospectiveId, scope),
    queryFn: async (): Promise<Vote[]> => {
      if (itemIds.length === 0) return [];

      const supabase = createClient();
      const { data, error } = await supabase
        .from("votes")
        .select("*")
        .in("item_id", itemIds);

      if (error) {
        console.error("Error fetching votes:", error);
        return [];
      }
      return data;
    },
    enabled: itemIds.length > 0,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

// Create a new retrospective item
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateItemInput) => {
      // Check rate limit
      if (!canCreateItem(input.authorId)) {
        throw new Error("Please wait before adding another item");
      }

      const supabase = createClient();
      const sanitizedContent = sanitizeItemContent(input.content);
      const sanitizedName = sanitizeUsername(input.authorName);

      // For anonymous users (IDs starting with "anon-"), use null for author_id
      const isAnonymous = input.authorId.startsWith("anon-");
      const authorId = isAnonymous ? null : input.authorId;

      // Get the highest position in the column to add item at the end
      const { data: existingItems, error: fetchError } = await supabase
        .from("retrospective_items")
        .select("position")
        .eq("column_id", input.columnId)
        .order("position", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const nextPosition = existingItems && existingItems.length > 0
        ? (existingItems[0].position ?? 0) + 1
        : 0;

      const { data, error } = await supabase
        .from("retrospective_items")
        .insert({
          column_id: input.columnId,
          text: sanitizedContent,
          author_id: authorId,
          author_name: sanitizedName,
          position: nextPosition,
        })
        .select()
        .single();

      if (error) throw error;

      // Store anonymous item ownership locally
      if (isAnonymous && data) {
        storeAnonymousItemOwnership(data.id, input.authorId);
      }

      return data;
    },
    onMutate: async (input) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: retrospectiveKeys.items(input.retrospectiveId)
      });

      // Snapshot previous value
      const previousItems = queryClient.getQueryData<RetrospectiveItem[]>(
        retrospectiveKeys.items(input.retrospectiveId)
      );

      // Calculate position for optimistic update
      const columnItems = previousItems?.filter(item => item.column_id === input.columnId) || [];
      const maxPosition = columnItems.reduce((max, item) =>
        Math.max(max, item.position ?? 0), -1
      );

      // Optimistically update
      const optimisticItem: RetrospectiveItem = {
        id: uuidv4(),
        column_id: input.columnId,
        text: sanitizeItemContent(input.content),
        author_id: input.authorId.startsWith("anon-") ? null : input.authorId,
        author_name: sanitizeUsername(input.authorName),
        color: null,
        position: maxPosition + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<RetrospectiveItem[]>(
        retrospectiveKeys.items(input.retrospectiveId),
        (old = []) => [optimisticItem, ...old]
      );

      return { previousItems };
    },
    onError: (err, input, context) => {
      // Rollback on error
      if (context?.previousItems) {
        queryClient.setQueryData(
          retrospectiveKeys.items(input.retrospectiveId),
          context.previousItems
        );
      }
      toast.error(err instanceof Error ? err.message : "Failed to add item");
    },
    onSuccess: () => {
      toast.success("Item added successfully");
    },
    onSettled: (_data, _error, input) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: retrospectiveKeys.items(input.retrospectiveId)
      });
    },
  });
}

// Delete a retrospective item
export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      retrospectiveId,
      userId
    }: {
      itemId: string;
      retrospectiveId: string;
      userId: string;
    }) => {
      // Check permission - in a real app, would check if user is the author
      // For now, just check rate limit
      if (!canDeleteItem(userId)) {
        throw new Error("Please wait before deleting another item");
      }

      const supabase = createClient();
      const { error } = await supabase
        .from("retrospective_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onMutate: async ({ itemId, retrospectiveId }) => {
      await queryClient.cancelQueries({
        queryKey: retrospectiveKeys.items(retrospectiveId)
      });

      const previousItems = queryClient.getQueryData<RetrospectiveItem[]>(
        retrospectiveKeys.items(retrospectiveId)
      );

      // Optimistically remove
      queryClient.setQueryData<RetrospectiveItem[]>(
        retrospectiveKeys.items(retrospectiveId),
        (old = []) => old.filter(item => item.id !== itemId)
      );

      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          retrospectiveKeys.items(variables.retrospectiveId),
          context.previousItems
        );
      }
      toast.error(err instanceof Error ? err.message : "Failed to delete item");
    },
    onSuccess: () => {
      toast.success("Item deleted");
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: retrospectiveKeys.items(variables.retrospectiveId)
      });
    },
  });
}

// Toggle vote on an item
export function useToggleVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      userId,
      retrospectiveId,
      hasVoted
    }: {
      itemId: string;
      userId: string;
      retrospectiveId: string;
      hasVoted: boolean;
    }) => {
      // Anonymous users cannot vote (they don't have valid profile IDs)
      if (userId.startsWith("anon-")) {
        throw new Error("Anonymous users cannot vote. Please sign in to vote.");
      }

      // Check rate limit
      if (!canVote(userId)) {
        throw new Error("Please wait before voting again");
      }

      const supabase = createClient();

      if (hasVoted) {
        // Remove vote
        const { error } = await supabase
          .from("votes")
          .delete()
          .eq("item_id", itemId)
          .eq("profile_id", userId);

        if (error) throw error;
        return { action: "removed" as const };
      } else {
        // Check vote limit before adding using server-side function
        const { data: canVote, error: checkError } = await supabase
          .rpc("can_user_vote", {
            p_retrospective_id: retrospectiveId,
            p_user_id: userId,
            p_item_id: itemId
          });

        if (checkError) throw checkError;

        if (!canVote) {
          // Get the max votes for a better error message
          const { data: retro } = await supabase
            .from("retrospectives")
            .select("max_votes_per_user")
            .eq("id", retrospectiveId)
            .single();

          const maxVotes = retro?.max_votes_per_user || 5;
          throw new Error(`You've reached the maximum of ${maxVotes} votes for this retrospective`);
        }

        // Add vote
        const { data, error } = await supabase
          .from("votes")
          .insert({
            item_id: itemId,
            profile_id: userId,
          })
          .select()
          .single();

        if (error) throw error;
        return { action: "added" as const, vote: data };
      }
    },
    onMutate: async ({ itemId, userId, retrospectiveId, hasVoted }) => {
      // Don't perform optimistic updates for anonymous users
      if (userId.startsWith("anon-")) {
        return {};
      }

      await queryClient.cancelQueries({
        queryKey: retrospectiveKeys.votes(retrospectiveId, "all")
      });

      const previousVotes = queryClient.getQueryData<Vote[]>(
        retrospectiveKeys.votes(retrospectiveId, "all")
      );

      // Optimistically update
      if (hasVoted) {
        // Remove vote
        queryClient.setQueryData<Vote[]>(
          retrospectiveKeys.votes(retrospectiveId, "all"),
          (old = []) => old.filter(v => !(v.item_id === itemId && v.profile_id === userId))
        );
      } else {
        // Add vote
        const optimisticVote: Vote = {
          id: uuidv4(),
          item_id: itemId,
          profile_id: userId,
          created_at: new Date().toISOString(),
        };
        queryClient.setQueryData<Vote[]>(
          retrospectiveKeys.votes(retrospectiveId, "all"),
          (old = []) => [...old, optimisticVote]
        );
      }

      return { previousVotes };
    },
    onError: (err, variables, context) => {
      if (context?.previousVotes) {
        queryClient.setQueryData(
          retrospectiveKeys.votes(variables.retrospectiveId, "all"),
          context.previousVotes
        );
      }
      toast.error(err instanceof Error ? err.message : "Failed to update vote");
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: retrospectiveKeys.votes(variables.retrospectiveId, "all")
      });
      // Also invalidate vote stats for the user
      if (!variables.userId.startsWith("anon-")) {
        queryClient.invalidateQueries({
          queryKey: retrospectiveKeys.voteStats(variables.retrospectiveId, variables.userId)
        });
      }
    },
  });
}

// Update retrospective item content
export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      content,
      color,
      retrospectiveId
    }: {
      itemId: string;
      content?: string;
      color?: string;
      retrospectiveId: string;
    }) => {
      const supabase = createClient();
      const updateData: { text?: string; color?: string } = {};

      if (content !== undefined) {
        updateData.text = sanitizeItemContent(content);
      }
      if (color !== undefined) {
        updateData.color = color;
      }

      const { data, error } = await supabase
        .from("retrospective_items")
        .update(updateData)
        .eq("id", itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ itemId, content, color, retrospectiveId }) => {
      await queryClient.cancelQueries({
        queryKey: retrospectiveKeys.items(retrospectiveId)
      });

      const previousItems = queryClient.getQueryData<RetrospectiveItem[]>(
        retrospectiveKeys.items(retrospectiveId)
      );

      // Optimistically update
      queryClient.setQueryData<RetrospectiveItem[]>(
        retrospectiveKeys.items(retrospectiveId),
        (old = []) => old.map(item =>
          item.id === itemId
            ? {
                ...item,
                ...(content !== undefined && { text: sanitizeItemContent(content) }),
                ...(color !== undefined && { color }),
                updated_at: new Date().toISOString()
              }
            : item
        )
      );

      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          retrospectiveKeys.items(variables.retrospectiveId),
          context.previousItems
        );
      }
      toast.error("Failed to update item");
    },
    onSuccess: () => {
      toast.success("Item updated");
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: retrospectiveKeys.items(variables.retrospectiveId)
      });
    },
  });
}

// Move retrospective item between columns or reorder within column
export function useMoveItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      sourceColumnId,
      destinationColumnId,
      newPosition,
      retrospectiveId
    }: {
      itemId: string;
      sourceColumnId: string;
      destinationColumnId: string;
      newPosition: number;
      retrospectiveId: string;
    }) => {
      const supabase = createClient();

      // If moving between columns
      if (sourceColumnId !== destinationColumnId) {
        // First, get all items in the destination column to update positions
        const { data: destItems, error: destError } = await supabase
          .from("retrospective_items")
          .select("id, position")
          .eq("column_id", destinationColumnId)
          .order("position", { ascending: true });

        if (destError) throw destError;

        // Calculate position updates for destination column
        const destUpdates = calculateCrossColumnPositions(destItems || [], newPosition);

        // Batch update positions in destination column
        if (destUpdates.length > 0) {
          // Use Promise.all for parallel updates
          await Promise.all(
            destUpdates.map(update =>
              supabase
                .from("retrospective_items")
                .update({ position: update.position })
                .eq("id", update.id)
            )
          );
        }

        // Move the item to the new column with new position
        const { data: movedItem, error: moveError } = await supabase
          .from("retrospective_items")
          .update({
            column_id: destinationColumnId,
            position: newPosition,
            updated_at: new Date().toISOString()
          })
          .eq("id", itemId)
          .select()
          .single();

        if (moveError) throw moveError;

        // Update positions in source column to fill the gap
        const { data: sourceItems, error: sourceError } = await supabase
          .from("retrospective_items")
          .select("id, position")
          .eq("column_id", sourceColumnId)
          .order("position", { ascending: true });

        if (sourceError) throw sourceError;

        // Re-index positions in source column
        const sourceUpdates = reindexPositions(sourceItems || []);

        if (sourceUpdates.length > 0) {
          await Promise.all(
            sourceUpdates.map(update =>
              supabase
                .from("retrospective_items")
                .update({ position: update.position })
                .eq("id", update.id)
            )
          );
        }

        return movedItem;
      } else {
        // Reordering within the same column
        const { data: items, error: fetchError } = await supabase
          .from("retrospective_items")
          .select("id, position")
          .eq("column_id", sourceColumnId)
          .order("position", { ascending: true });

        if (fetchError) throw fetchError;

        // Calculate position updates for reordering within same column
        const updates = calculateReorderPositions(items || [], itemId, newPosition);

        if (updates.length === 0) {
          // No position change needed
          return { id: itemId, position: newPosition };
        }

        // Apply updates in parallel for better performance
        await Promise.all(
          updates.map(update =>
            supabase
              .from("retrospective_items")
              .update({
                position: update.position,
                updated_at: new Date().toISOString()
              })
              .eq("id", update.id)
          )
        );

        return { id: itemId, position: newPosition };
      }
    },
    onMutate: async ({ itemId, sourceColumnId, destinationColumnId, newPosition, retrospectiveId }) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({
        queryKey: retrospectiveKeys.items(retrospectiveId)
      });

      // Snapshot previous state
      const previousItems = queryClient.getQueryData<RetrospectiveItem[]>(
        retrospectiveKeys.items(retrospectiveId)
      );

      // Optimistically update the UI
      queryClient.setQueryData<RetrospectiveItem[]>(
        retrospectiveKeys.items(retrospectiveId),
        (old = []) => {
          const newItems = [...old];
          const itemIndex = newItems.findIndex(item => item.id === itemId);

          if (itemIndex !== -1) {
            const [movedItem] = newItems.splice(itemIndex, 1);

            // Update the moved item
            movedItem.column_id = destinationColumnId;
            movedItem.position = newPosition;

            // Update positions for other items
            if (sourceColumnId !== destinationColumnId) {
              // Update source column positions
              newItems
                .filter(item => item.column_id === sourceColumnId)
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .forEach((item, index) => {
                  item.position = index;
                });

              // Update destination column positions
              newItems
                .filter(item => item.column_id === destinationColumnId)
                .forEach(item => {
                  if ((item.position ?? 0) >= newPosition) {
                    item.position = (item.position ?? 0) + 1;
                  }
                });
            } else {
              // Reordering within same column
              const currentPos = movedItem.position ?? 0;
              newItems
                .filter(item => item.column_id === sourceColumnId)
                .forEach(item => {
                  const pos = item.position ?? 0;
                  if (currentPos < newPosition) {
                    if (pos > currentPos && pos <= newPosition) {
                      item.position = pos - 1;
                    }
                  } else if (currentPos > newPosition) {
                    if (pos >= newPosition && pos < currentPos) {
                      item.position = pos + 1;
                    }
                  }
                });
            }

            // Re-insert the moved item
            newItems.push(movedItem);
          }

          return newItems;
        }
      );

      return { previousItems };
    },
    onError: (error, _variables, context) => {
      console.error("Failed to move item:", error);

      // Rollback on error
      if (context?.previousItems) {
        queryClient.setQueryData(
          retrospectiveKeys.items(_variables.retrospectiveId),
          context.previousItems
        );
      }

      toast.error("Failed to move item");
    },
    onSettled: (_data, _error, variables) => {
      // Re-fetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: retrospectiveKeys.items(variables.retrospectiveId)
      });
    },
  });
}

export function useMergeItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceItemIds,
      targetColumnId,
      retrospectiveId,
      authorId,
      authorName
    }: {
      sourceItemIds: string[];
      targetColumnId: string;
      retrospectiveId: string;
      authorId: string;
      authorName: string;
    }) => {
      const supabase = createClient();

      const { data: itemsToMerge, error: fetchError } = await supabase
        .from("retrospective_items")
        .select("*")
        .in("id", sourceItemIds);

      if (fetchError) throw fetchError;
      if (!itemsToMerge || itemsToMerge.length === 0) {
        throw new Error("No items found to merge");
      }

      const mergedText = itemsToMerge.map(item => item.text).join(" • ");

      const { data: newItem, error: createError } = await supabase
        .from("retrospective_items")
        .insert({
          column_id: targetColumnId,
          text: mergedText,
          author_id: authorId.startsWith("anon-") ? null : authorId,
          author_name: `${authorName} (merged)`,
        })
        .select()
        .single();

      if (createError) throw createError;

      const { data: votes, error: votesError } = await supabase
        .from("votes")
        .select("profile_id")
        .in("item_id", sourceItemIds);

      if (!votesError && votes && votes.length > 0) {
        const uniqueVoters = Array.from(new Set(votes.map(v => v.profile_id)));
        const newVotes = uniqueVoters.map(profileId => ({
          item_id: newItem.id,
          profile_id: profileId
        }));

        await supabase
          .from("votes")
          .insert(newVotes);
      }

      const { error: deleteError } = await supabase
        .from("retrospective_items")
        .delete()
        .in("id", sourceItemIds);

      if (deleteError) throw deleteError;

      return newItem;
    },
    onSuccess: (data, variables) => {
      toast.success("Items merged successfully");
      queryClient.invalidateQueries({
        queryKey: retrospectiveKeys.items(variables.retrospectiveId)
      });
      queryClient.invalidateQueries({
        queryKey: retrospectiveKeys.votes(variables.retrospectiveId, "all")
      });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to merge items");
    },
  });
}

// Fetch user's vote statistics for a retrospective
export function useUserVoteStats(retrospectiveId: string, userId: string) {
  return useQuery({
    queryKey: retrospectiveKeys.voteStats(retrospectiveId, userId),
    queryFn: async () => {
      const supabase = createClient();

      // Use the retrospective_vote_stats view for efficient querying
      const { data: stats, error } = await supabase
        .from("retrospective_vote_stats")
        .select("*")
        .eq("retrospective_id", retrospectiveId)
        .eq("profile_id", userId)
        .single();

      if (error) {
        // If no data exists, user hasn't voted yet
        if (error.code === 'PGRST116') {
          // Get the max votes from retrospective
          const { data: retro } = await supabase
            .from("retrospectives")
            .select("max_votes_per_user")
            .eq("id", retrospectiveId)
            .single();

          const maxVotes = retro?.max_votes_per_user || 5;
          return { votesUsed: 0, maxVotes, votesRemaining: maxVotes };
        }

        console.error("Error fetching vote stats:", error);
        return { votesUsed: 0, maxVotes: 5, votesRemaining: 5 };
      }

      return {
        votesUsed: stats?.votes_used || 0,
        maxVotes: stats?.max_votes_per_user || 5,
        votesRemaining: stats?.votes_remaining || 5,
      };
    },
    enabled: !!userId && !userId.startsWith("anon-"), // Don't fetch for anonymous users
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

// Check if user can vote on an item (considering vote limits)
export function useCanVote(retrospectiveId: string, userId: string, itemId: string) {
  const { data: voteStats } = useUserVoteStats(retrospectiveId, userId);
  const { data: votes = [] } = useVotes(retrospectiveId, [itemId]);

  const hasVoted = votes.some(v => v.item_id === itemId && v.profile_id === userId);

  // If already voted, they can toggle it off
  if (hasVoted) {
    return { canVote: true, reason: "toggle" };
  }

  // Check if they have votes remaining
  if (!voteStats || voteStats.votesRemaining <= 0) {
    return { canVote: false, reason: "no_votes_remaining" };
  }

  return { canVote: true, reason: "can_vote" };
}