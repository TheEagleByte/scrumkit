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

interface CreateVoteInput {
  itemId: string;
  userId: string;
}

// Query keys factory
export const retrospectiveKeys = {
  all: ["retrospectives"] as const,
  details: () => [...retrospectiveKeys.all, "detail"] as const,
  detail: (id: string) => [...retrospectiveKeys.details(), id] as const,
  items: (retrospectiveId: string) => [...retrospectiveKeys.detail(retrospectiveId), "items"] as const,
  columns: (retrospectiveId: string) => [...retrospectiveKeys.detail(retrospectiveId), "columns"] as const,
  votes: (retrospectiveId: string) => [...retrospectiveKeys.detail(retrospectiveId), "votes"] as const,
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
  return useQuery({
    queryKey: retrospectiveKeys.columns(retrospectiveId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("retrospective_columns")
        .select("*")
        .eq("retrospective_id", retrospectiveId)
        .order("order_index", { ascending: true });

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
  return useQuery({
    queryKey: retrospectiveKeys.items(retrospectiveId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("retrospective_items")
        .select("*")
        .eq("retrospective_id", retrospectiveId)
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
  return useQuery({
    queryKey: retrospectiveKeys.votes(retrospectiveId),
    queryFn: async () => {
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

      const { data, error } = await supabase
        .from("retrospective_items")
        .insert({
          retrospective_id: input.retrospectiveId,
          column_id: input.columnId,
          text: sanitizedContent,
          author_id: input.authorId,
          author_name: sanitizedName,
        })
        .select()
        .single();

      if (error) throw error;
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

      // Optimistically update
      const optimisticItem: RetrospectiveItem = {
        id: `temp-${Date.now()}`,
        column_id: input.columnId,
        text: sanitizeItemContent(input.content),
        author_id: input.authorId,
        author_name: sanitizeUsername(input.authorName),
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
    onSuccess: (data, input) => {
      toast.success("Item added successfully");
    },
    onSettled: (data, error, input) => {
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
    onSuccess: (data, variables) => {
      toast.success("Item deleted");
    },
    onSettled: (data, error, variables) => {
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
      await queryClient.cancelQueries({
        queryKey: retrospectiveKeys.votes(retrospectiveId)
      });

      const previousVotes = queryClient.getQueryData<Vote[]>(
        retrospectiveKeys.votes(retrospectiveId)
      );

      // Optimistically update
      if (hasVoted) {
        // Remove vote
        queryClient.setQueryData<Vote[]>(
          retrospectiveKeys.votes(retrospectiveId),
          (old = []) => old.filter(v => !(v.item_id === itemId && v.profile_id === userId))
        );
      } else {
        // Add vote
        const optimisticVote: Vote = {
          id: `temp-${Date.now()}`,
          item_id: itemId,
          profile_id: userId,
          created_at: new Date().toISOString(),
        };
        queryClient.setQueryData<Vote[]>(
          retrospectiveKeys.votes(retrospectiveId),
          (old = []) => [...old, optimisticVote]
        );
      }

      return { previousVotes };
    },
    onError: (err, variables, context) => {
      if (context?.previousVotes) {
        queryClient.setQueryData(
          retrospectiveKeys.votes(variables.retrospectiveId),
          context.previousVotes
        );
      }
      toast.error(err instanceof Error ? err.message : "Failed to update vote");
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: retrospectiveKeys.votes(variables.retrospectiveId)
      });
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
    onSettled: (data, error, variables) => {
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
          author_id: authorId,
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
        queryKey: retrospectiveKeys.votes(variables.retrospectiveId)
      });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to merge items");
    },
  });
}