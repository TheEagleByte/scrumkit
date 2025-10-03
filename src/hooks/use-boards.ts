"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions
} from "@tanstack/react-query";
import {
  getUserBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  cloneBoard,
  CreateBoardInput,
} from "@/lib/boards/actions";
import { toast } from "sonner";
import { storeAnonymousAsset } from "@/lib/anonymous/asset-claiming";

// Types
interface Board {
  id: string;
  unique_url: string;
  title: string;
  template: string | null;
  is_archived: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// Query keys factory
export const boardKeys = {
  all: ["boards"] as const,
  lists: () => [...boardKeys.all, "list"] as const,
  list: (filters: string) => [...boardKeys.lists(), { filters }] as const,
  details: () => [...boardKeys.all, "detail"] as const,
  detail: (id: string) => [...boardKeys.details(), id] as const,
};

// Fetch all user boards
export function useBoards(options?: UseQueryOptions<Board[]>) {
  return useQuery({
    queryKey: boardKeys.lists(),
    queryFn: async () => {
      const boards = await getUserBoards();
      // Map the database response to match our Board interface
      return boards.map(b => ({
        id: b.id,
        unique_url: b.unique_url || '',
        title: b.title || 'Untitled Board',
        template: b.template,
        is_archived: b.is_archived || false,
        is_deleted: false, // Not in DB response, default to false
        created_at: b.created_at || new Date().toISOString(),
        updated_at: b.updated_at || new Date().toISOString(),
      })) as Board[];
    },
    ...options,
  });
}

// Create a new board
export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBoard,
    onMutate: async (newBoard: CreateBoardInput) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: boardKeys.lists() });

      // Snapshot previous value
      const previousBoards = queryClient.getQueryData<Board[]>(boardKeys.lists());

      // Optimistically update to the new value
      const optimisticBoard: Board = {
        id: `temp-${Date.now()}`,
        unique_url: `temp-${Date.now()}`,
        title: newBoard.title,
        template: newBoard.templateId || null,
        is_archived: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Board[]>(boardKeys.lists(), (old = []) => [
        optimisticBoard,
        ...old,
      ]);

      return { previousBoards };
    },
    onError: (err, newBoard, context) => {
      // Rollback on error
      if (context?.previousBoards) {
        queryClient.setQueryData(boardKeys.lists(), context.previousBoards);
      }
      toast.error("Failed to create board");
    },
    onSuccess: (data) => {
      // Store board ID in localStorage for anonymous claiming
      if (data.id) {
        storeAnonymousAsset("retrospective", data.id);
      }
      toast.success("Board created successfully!");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}

// Update a board (archive/restore)
export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uniqueUrl,
      updates
    }: {
      uniqueUrl: string;
      updates: Parameters<typeof updateBoard>[1];
    }) => updateBoard(uniqueUrl, updates),
    onMutate: async ({ uniqueUrl, updates }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.lists() });

      const previousBoards = queryClient.getQueryData<Board[]>(boardKeys.lists());

      // Optimistic update
      queryClient.setQueryData<Board[]>(boardKeys.lists(), (old = []) =>
        old.map(board =>
          board.unique_url === uniqueUrl
            ? { ...board, ...updates, updated_at: new Date().toISOString() }
            : board
        )
      );

      return { previousBoards };
    },
    onError: (err, variables, context) => {
      if (context?.previousBoards) {
        queryClient.setQueryData(boardKeys.lists(), context.previousBoards);
      }
      toast.error("Failed to update board");
    },
    onSuccess: (data, { updates }) => {
      if ('is_archived' in updates) {
        toast.success(updates.is_archived ? "Board archived" : "Board restored");
      } else {
        toast.success("Board updated");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}

// Delete a board with undo functionality
export function useDeleteBoard() {
  const queryClient = useQueryClient();
  let undoTimeoutId: NodeJS.Timeout | null = null;

  return useMutation({
    mutationFn: deleteBoard,
    onMutate: async (uniqueUrl: string) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.lists() });

      const previousBoards = queryClient.getQueryData<Board[]>(boardKeys.lists());
      const boardToDelete = previousBoards?.find(b => b.unique_url === uniqueUrl);

      // Optimistically remove from list
      queryClient.setQueryData<Board[]>(boardKeys.lists(), (old = []) =>
        old.filter(board => board.unique_url !== uniqueUrl)
      );

      // Store deletion info in localStorage for persistence
      const deletionKey = `pending_deletion_${uniqueUrl}`;
      const deletionData = {
        board: boardToDelete,
        scheduledFor: Date.now() + 5000, // Delete after 5 seconds
      };
      localStorage.setItem(deletionKey, JSON.stringify(deletionData));

      return { previousBoards, boardToDelete, deletionKey };
    },
    onError: (err, uniqueUrl, context) => {
      // Restore the board on error
      if (context?.previousBoards) {
        queryClient.setQueryData(boardKeys.lists(), context.previousBoards);
      }

      // Clean up localStorage
      if (context?.deletionKey) {
        localStorage.removeItem(context.deletionKey);
      }

      toast.error("Failed to delete board");
    },
    onSuccess: (data, uniqueUrl, context) => {
      const boardType = context?.boardToDelete?.is_archived ? "archived board" : "board";
      const message = `${boardType.charAt(0).toUpperCase() + boardType.slice(1)} "${context?.boardToDelete?.title}" deleted`;

      // Show undo toast
      toast.success(message, {
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => {
            // Cancel deletion
            if (undoTimeoutId) {
              clearTimeout(undoTimeoutId);
            }

            // Remove from localStorage
            if (context?.deletionKey) {
              localStorage.removeItem(context.deletionKey);
            }

            // Restore board
            if (context?.previousBoards) {
              queryClient.setQueryData(boardKeys.lists(), context.previousBoards);
            }

            toast.success("Board deletion cancelled");
          },
        },
      });

      // Schedule actual deletion after 5 seconds
      undoTimeoutId = setTimeout(() => {
        // Check if deletion was cancelled
        if (context?.deletionKey && !localStorage.getItem(context.deletionKey)) {
          return;
        }

        // Clean up localStorage
        if (context?.deletionKey) {
          localStorage.removeItem(context.deletionKey);
        }
      }, 5000);
    },
    onSettled: () => {
      // Don't immediately invalidate, wait for timeout or undo
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      }, 5500);
    },
  });
}

// Clone a board
export function useCloneBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uniqueUrl,
      newTitle
    }: {
      uniqueUrl: string;
      newTitle?: string;
    }) => cloneBoard(uniqueUrl, newTitle),
    onSuccess: () => {
      toast.success("Board cloned successfully!");
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
    onError: () => {
      toast.error("Failed to clone board");
    },
  });
}