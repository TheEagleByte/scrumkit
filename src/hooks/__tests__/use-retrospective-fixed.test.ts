/**
 * Fixed Jest unit tests for use-retrospective.ts
 * Tests React Query hooks for retrospective functionality
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';
import {
  useRetrospective,
  useRetrospectiveColumns,
  useRetrospectiveItems,
  useVotes,
  useCreateItem,
  useDeleteItem,
  useToggleVote,
  useUpdateItem,
  retrospectiveKeys,
} from '../use-retrospective';
import { createClient } from '@/lib/supabase/client';
import { sanitizeItemContent, sanitizeUsername } from '@/lib/utils/sanitize';
import { canCreateItem, canDeleteItem, canVote } from '@/lib/utils/rate-limit';

// Mock dependencies
jest.mock('@/lib/supabase/client');
jest.mock('@/lib/utils/sanitize');
jest.mock('@/lib/utils/rate-limit');
jest.mock('sonner');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockSanitizeItemContent = sanitizeItemContent as jest.MockedFunction<typeof sanitizeItemContent>;
const mockSanitizeUsername = sanitizeUsername as jest.MockedFunction<typeof sanitizeUsername>;
const mockCanCreateItem = canCreateItem as jest.MockedFunction<typeof canCreateItem>;
const mockCanDeleteItem = canDeleteItem as jest.MockedFunction<typeof canDeleteItem>;
const mockCanVote = canVote as jest.MockedFunction<typeof canVote>;
const mockToast = toast as jest.Mocked<typeof toast>;

// Test data
const mockRetrospective = {
  id: 'retro-1',
  title: 'Sprint 1 Retrospective',
  status: 'active',
  template: 'default',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

const mockColumns = [
  {
    id: 'col-1',
    retrospective_id: 'retro-1',
    column_type: 'went-well',
    title: 'What went well?',
    description: 'Positive outcomes',
    color: 'bg-green-500/10',
    order_index: 0,
  },
  {
    id: 'col-2',
    retrospective_id: 'retro-1',
    column_type: 'improve',
    title: 'What could be improved?',
    description: 'Areas for enhancement',
    color: 'bg-yellow-500/10',
    order_index: 1,
  },
];

const mockItems = [
  {
    id: 'item-1',
    retrospective_id: 'retro-1',
    column_id: 'col-1',
    text: 'Great teamwork',
    author_id: 'user-1',
    author_name: 'John Doe',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'item-2',
    retrospective_id: 'retro-1',
    column_id: 'col-2',
    text: 'Need better documentation',
    author_id: 'user-2',
    author_name: 'Jane Smith',
    created_at: '2023-01-01T01:00:00Z',
    updated_at: '2023-01-01T01:00:00Z',
  },
];

const mockVotes = [
  {
    id: 'vote-1',
    item_id: 'item-1',
    profile_id: 'user-1',
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'vote-2',
    item_id: 'item-1',
    profile_id: 'user-2',
    created_at: '2023-01-01T00:30:00Z',
  },
];

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('use-retrospective (fixed)', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup sanitization mocks
    mockSanitizeItemContent.mockImplementation((content) => content);
    mockSanitizeUsername.mockImplementation((name) => name);

    // Setup rate limit mocks
    mockCanCreateItem.mockReturnValue(true);
    mockCanDeleteItem.mockReturnValue(true);
    mockCanVote.mockReturnValue(true);

    // Setup toast mocks
    mockToast.success = jest.fn();
    mockToast.error = jest.fn();

    // Create a working Supabase mock
    const createMockQueryBuilder = () => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
    });

    mockSupabase = {
      from: jest.fn(() => createMockQueryBuilder()),
    };

    mockCreateClient.mockReturnValue(mockSupabase);
  });

  describe('retrospectiveKeys', () => {
    it('generates correct query keys', () => {
      expect(retrospectiveKeys.all).toEqual(['retrospectives']);
      expect(retrospectiveKeys.details()).toEqual(['retrospectives', 'detail']);
      expect(retrospectiveKeys.detail('retro-1')).toEqual(['retrospectives', 'detail', 'retro-1']);
      expect(retrospectiveKeys.items('retro-1')).toEqual(['retrospectives', 'detail', 'retro-1', 'items']);
      expect(retrospectiveKeys.columns('retro-1')).toEqual(['retrospectives', 'detail', 'retro-1', 'columns']);
      expect(retrospectiveKeys.votes('retro-1')).toEqual(['retrospectives', 'detail', 'retro-1', 'votes']);
    });
  });

  describe('useRetrospective', () => {
    it('fetches retrospective data successfully', async () => {
      const queryBuilder = mockSupabase.from('retrospectives');
      queryBuilder.single.mockResolvedValue({ data: mockRetrospective, error: null });

      const { result } = renderHook(
        () => useRetrospective('retro-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockRetrospective);
      });
    });

    it('handles retrospective fetch error', async () => {
      const queryBuilder = mockSupabase.from('retrospectives');
      queryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Retrospective not found' }
      });

      const { result } = renderHook(
        () => useRetrospective('retro-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // When there's an error, the hook returns null as per the implementation
      expect(result.current.data).toBeNull();
    });
  });

  describe('useRetrospectiveColumns', () => {
    it('fetches columns data successfully', async () => {
      const queryBuilder = mockSupabase.from('retrospective_columns');
      queryBuilder.order.mockResolvedValue({ data: mockColumns, error: null });

      const { result } = renderHook(
        () => useRetrospectiveColumns('retro-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockColumns);
      });
    });

    it('handles columns fetch error', async () => {
      const queryBuilder = mockSupabase.from('retrospective_columns');
      queryBuilder.order.mockResolvedValue({
        data: null,
        error: { message: 'Columns not found' }
      });

      const { result } = renderHook(
        () => useRetrospectiveColumns('retro-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useRetrospectiveItems', () => {
    it('fetches items data successfully', async () => {
      const queryBuilder = mockSupabase.from('retrospective_items');
      queryBuilder.order.mockResolvedValue({ data: mockItems, error: null });

      const { result } = renderHook(
        () => useRetrospectiveItems('retro-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockItems);
      });
    });

    it('handles items fetch error', async () => {
      const queryBuilder = mockSupabase.from('retrospective_items');
      queryBuilder.order.mockResolvedValue({
        data: null,
        error: { message: 'Items not found' }
      });

      const { result } = renderHook(
        () => useRetrospectiveItems('retro-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useVotes', () => {
    it('fetches votes data successfully', async () => {
      const queryBuilder = mockSupabase.from('votes');
      queryBuilder.in.mockResolvedValue({ data: mockVotes, error: null });

      const { result } = renderHook(
        () => useVotes('retro-1', ['item-1', 'item-2']),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockVotes);
      });
    });

    it('returns empty array when no item IDs provided', async () => {
      const { result } = renderHook(
        () => useVotes('retro-1', []),
        { wrapper: createWrapper() }
      );

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useCreateItem', () => {
    it('creates item successfully', async () => {
      const queryBuilder = mockSupabase.from('retrospective_items');
      const newItem = { ...mockItems[0], id: 'item-3' };
      queryBuilder.single.mockResolvedValue({ data: newItem, error: null });

      const { result } = renderHook(() => useCreateItem(), { wrapper: createWrapper() });

      const createInput = {
        retrospectiveId: 'retro-1',
        columnId: 'col-1',
        content: 'New item',
        authorId: 'user-1',
        authorName: 'John Doe',
      };

      result.current.mutate(createInput);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('retrospective_items');
      expect(mockSanitizeItemContent).toHaveBeenCalledWith('New item');
      expect(mockSanitizeUsername).toHaveBeenCalledWith('John Doe');
    });

    it('handles rate limit error', async () => {
      mockCanCreateItem.mockReturnValue(false);

      const { result } = renderHook(() => useCreateItem(), { wrapper: createWrapper() });

      const createInput = {
        retrospectiveId: 'retro-1',
        columnId: 'col-1',
        content: 'New item',
        authorId: 'user-1',
        authorName: 'John Doe',
      };

      result.current.mutate(createInput);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useDeleteItem', () => {
    it('deletes item successfully', async () => {
      const queryBuilder = mockSupabase.from('retrospective_items');
      queryBuilder.eq.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useDeleteItem(), { wrapper: createWrapper() });

      const deleteInput = {
        itemId: 'item-1',
        retrospectiveId: 'retro-1',
        userId: 'user-1',
      };

      result.current.mutate(deleteInput);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('retrospective_items');
    });

    it('handles rate limit error', async () => {
      mockCanDeleteItem.mockReturnValue(false);

      const { result } = renderHook(() => useDeleteItem(), { wrapper: createWrapper() });

      const deleteInput = {
        itemId: 'item-1',
        retrospectiveId: 'retro-1',
        userId: 'user-1',
      };

      result.current.mutate(deleteInput);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useToggleVote', () => {
    it('adds vote successfully', async () => {
      const queryBuilder = mockSupabase.from('votes');
      const newVote = { id: 'vote-3', item_id: 'item-1', profile_id: 'user-3' };
      queryBuilder.single.mockResolvedValue({ data: newVote, error: null });

      const { result } = renderHook(() => useToggleVote(), { wrapper: createWrapper() });

      const voteInput = {
        itemId: 'item-1',
        userId: 'user-3',
        retrospectiveId: 'retro-1',
        hasVoted: false,
      };

      result.current.mutate(voteInput);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('votes');
    });

    it('removes vote successfully', async () => {
      const queryBuilder = mockSupabase.from('votes');
      queryBuilder.eq.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useToggleVote(), { wrapper: createWrapper() });

      const voteInput = {
        itemId: 'item-1',
        userId: 'user-1',
        retrospectiveId: 'retro-1',
        hasVoted: true,
      };

      result.current.mutate(voteInput);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('votes');
    });

    it('handles rate limit error', async () => {
      mockCanVote.mockReturnValue(false);

      const { result } = renderHook(() => useToggleVote(), { wrapper: createWrapper() });

      const voteInput = {
        itemId: 'item-1',
        userId: 'user-1',
        retrospectiveId: 'retro-1',
        hasVoted: false,
      };

      result.current.mutate(voteInput);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useUpdateItem', () => {
    it('updates item successfully', async () => {
      const queryBuilder = mockSupabase.from('retrospective_items');
      const updatedItem = { ...mockItems[0], text: 'Updated text' };
      queryBuilder.single.mockResolvedValue({ data: updatedItem, error: null });

      const { result } = renderHook(() => useUpdateItem(), { wrapper: createWrapper() });

      const updateInput = {
        itemId: 'item-1',
        content: 'Updated text',
        retrospectiveId: 'retro-1',
      };

      result.current.mutate(updateInput);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('retrospective_items');
      expect(mockSanitizeItemContent).toHaveBeenCalledWith('Updated text');
    });

    it('handles update error', async () => {
      const queryBuilder = mockSupabase.from('retrospective_items');
      queryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      });

      const { result } = renderHook(() => useUpdateItem(), { wrapper: createWrapper() });

      const updateInput = {
        itemId: 'item-1',
        content: 'Updated text',
        retrospectiveId: 'retro-1',
      };

      result.current.mutate(updateInput);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('mock verification', () => {
    it('verifies mock setup is working correctly', () => {
      expect(mockCreateClient).toBeDefined();
      expect(mockSanitizeItemContent).toBeDefined();
      expect(mockSanitizeUsername).toBeDefined();
      expect(mockCanCreateItem).toBeDefined();
      expect(mockCanDeleteItem).toBeDefined();
      expect(mockCanVote).toBeDefined();
      expect(mockToast.success).toBeDefined();
      expect(mockToast.error).toBeDefined();
    });

    it('verifies Supabase client mock structure', () => {
      const client = mockCreateClient();
      expect(client.from).toBeDefined();

      const queryBuilder = client.from('test');
      expect(queryBuilder.select).toBeDefined();
      expect(queryBuilder.insert).toBeDefined();
      expect(queryBuilder.update).toBeDefined();
      expect(queryBuilder.delete).toBeDefined();
      expect(queryBuilder.eq).toBeDefined();
      expect(queryBuilder.in).toBeDefined();
      expect(queryBuilder.order).toBeDefined();
      expect(queryBuilder.single).toBeDefined();
    });
  });
});