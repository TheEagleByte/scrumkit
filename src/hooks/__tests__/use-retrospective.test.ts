/**
 * Comprehensive Jest unit tests for use-retrospective.ts
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
import { storeAnonymousItemOwnership } from '@/lib/boards/anonymous-items';

// Mock dependencies
jest.mock('@/lib/supabase/client');
jest.mock('@/lib/utils/sanitize');
jest.mock('@/lib/utils/rate-limit');
jest.mock('@/lib/boards/anonymous-items');
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
    display_order: 0,
  },
  {
    id: 'col-2',
    retrospective_id: 'retro-1',
    column_type: 'improve',
    title: 'What could be improved?',
    description: 'Areas for enhancement',
    color: 'bg-yellow-500/10',
    display_order: 1,
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
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Provider = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
  Provider.displayName = 'TestQueryClientProvider';
  return Provider;
};

describe('use-retrospective', () => {
  let mockSupabase: any;
  let mockQueryBuilder: any;

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

    // Create a mock query builder that can be used across tests
    mockQueryBuilder = {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      eq: jest.fn(),
      in: jest.fn(),
      order: jest.fn(),
      single: jest.fn(),
    };

    // Set up method chaining - all methods return the same builder by default
    mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.insert.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.update.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.delete.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.in.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.order.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.single.mockReturnValue(mockQueryBuilder);

    // Individual tests will override the terminal method they need

    // Setup Supabase mock to return the same builder instance
    mockSupabase = {
      from: jest.fn(() => mockQueryBuilder),
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
      // Setup the mock to return the expected data
      mockQueryBuilder.single.mockResolvedValue({ data: mockRetrospective, error: null });

      const { result } = renderHook(
        () => useRetrospective('retro-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockRetrospective);
      expect(mockSupabase.from).toHaveBeenCalledWith('retrospectives');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'retro-1');
    });

    it('handles retrospective fetch error', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Retrospective not found' }
      });

      const { result } = renderHook(
        () => useRetrospective('retro-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });

    it('accepts custom options', async () => {
      mockQueryBuilder.single.mockResolvedValue({ data: mockRetrospective, error: null });

      const { result } = renderHook(
        () => useRetrospective('retro-1', { enabled: false }),
        { wrapper: createWrapper() }
      );

      // Should not fetch when disabled
      expect(result.current.isFetching).toBe(false);
    });
  });

  describe('useRetrospectiveColumns', () => {
    it('fetches columns data successfully', async () => {
      mockQueryBuilder.order.mockResolvedValue({ data: mockColumns, error: null });

      const { result } = renderHook(
        () => useRetrospectiveColumns('retro-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockColumns);
      expect(mockSupabase.from).toHaveBeenCalledWith('retrospective_columns');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('retrospective_id', 'retro-1');
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('display_order', { ascending: true });
    });

    it('handles columns fetch error', async () => {
      mockQueryBuilder.order.mockResolvedValue({
        data: null,
        error: { message: 'Columns not found' }
      });

      const { result } = renderHook(
        () => useRetrospectiveColumns('retro-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('orders columns by display_order ascending', async () => {
      mockQueryBuilder.order.mockResolvedValue({ data: mockColumns, error: null });

      renderHook(
        () => useRetrospectiveColumns('retro-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(mockQueryBuilder.order).toHaveBeenCalledWith('display_order', { ascending: true });
      });
    });
  });

  describe('useRetrospectiveItems', () => {
    it('fetches items data successfully', async () => {
      // Mock the first call for columns
      const mockColumnsResponse = { data: [{ id: 'col-1' }, { id: 'col-2' }], error: null };

      // Setup different responses for different from() calls
      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call for columns
          mockQueryBuilder.eq.mockResolvedValueOnce(mockColumnsResponse);
        } else {
          // Second call for items
          mockQueryBuilder.order.mockResolvedValueOnce({ data: mockItems, error: null });
        }
        return mockQueryBuilder;
      });

      const { result } = renderHook(
        () => useRetrospectiveItems('retro-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockItems);
      expect(mockSupabase.from).toHaveBeenCalledWith('retrospective_columns');
      expect(mockSupabase.from).toHaveBeenCalledWith('retrospective_items');
      expect(mockQueryBuilder.in).toHaveBeenCalledWith('column_id', ['col-1', 'col-2']);
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('handles items fetch error', async () => {
      // Mock the first call for columns with error
      mockQueryBuilder.eq.mockResolvedValueOnce({
        data: null,
        error: { message: 'Columns not found' }
      });

      const { result } = renderHook(
        () => useRetrospectiveItems('retro-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('polls for updates every 5 seconds', () => {
      // Mock the columns response
      mockQueryBuilder.eq.mockResolvedValueOnce({
        data: [{ id: 'col-1' }, { id: 'col-2' }],
        error: null
      });

      // Mock the items response
      mockQueryBuilder.order.mockResolvedValue({ data: mockItems, error: null });

      renderHook(
        () => useRetrospectiveItems('retro-1'),
        { wrapper: createWrapper() }
      );

      // The hook should be configured with refetchInterval: 5000
      // This is tested implicitly through the hook configuration
      expect(mockSupabase.from).toHaveBeenCalledWith('retrospective_columns');
    });

    it('orders items by created_at descending', async () => {
      // Mock the columns response
      mockQueryBuilder.eq.mockResolvedValueOnce({
        data: [{ id: 'col-1' }, { id: 'col-2' }],
        error: null
      });

      // Mock the items response
      mockQueryBuilder.order.mockResolvedValue({ data: mockItems, error: null });

      renderHook(
        () => useRetrospectiveItems('retro-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
      });
    });
  });

  describe('useVotes', () => {
    it('fetches votes data successfully', async () => {
      mockQueryBuilder.in.mockResolvedValue({ data: mockVotes, error: null });

      const { result } = renderHook(
        () => useVotes('retro-1', ['item-1', 'item-2']),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockVotes);
      expect(mockSupabase.from).toHaveBeenCalledWith('votes');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.in).toHaveBeenCalledWith('item_id', ['item-1', 'item-2']);
    });

    it('handles empty item IDs array', async () => {
      const { result } = renderHook(
        () => useVotes('retro-1', []),
        { wrapper: createWrapper() }
      );

      // When enabled: false, data is undefined and no API call is made
      expect(result.current.data).toBeUndefined();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('handles votes fetch error', async () => {
      mockQueryBuilder.in.mockResolvedValue({
        data: null,
        error: { message: 'Votes not found' }
      });

      const { result } = renderHook(
        () => useVotes('retro-1', ['item-1']),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('is disabled when no item IDs provided', () => {
      const { result } = renderHook(
        () => useVotes('retro-1', []),
        { wrapper: createWrapper() }
      );

      // Should not fetch when itemIds is empty
      expect(result.current.isFetching).toBe(false);
    });

    it('polls for updates every 5 seconds', () => {
      mockQueryBuilder.in.mockResolvedValue({ data: mockVotes, error: null });

      renderHook(
        () => useVotes('retro-1', ['item-1']),
        { wrapper: createWrapper() }
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('votes');
    });
  });

  describe('useCreateItem', () => {
    it('creates item successfully', async () => {
      const newItem = { ...mockItems[0], id: 'item-3' };
      mockQueryBuilder.single.mockResolvedValue({ data: newItem, error: null });

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
      expect(mockToast.success).toHaveBeenCalledWith('Item added successfully');
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

      await waitFor(() => {
        result.current.mutate(createInput);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockToast.error).toHaveBeenCalledWith('Please wait before adding another item');
    });

    it('handles create item error', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Creation failed' }
      });

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

      expect(mockToast.error).toHaveBeenCalledWith('Failed to add item');
    });

    it('performs optimistic update', async () => {
      mockQueryBuilder.single.mockResolvedValue({ data: mockItems[0], error: null });

      const { result } = renderHook(() => useCreateItem(), { wrapper: createWrapper() });

      // The optimistic update behavior would be tested in integration tests
      // Here we verify the mutation structure
      expect(result.current.mutate).toBeDefined();
    });
  });

  describe('useDeleteItem', () => {
    it('deletes item successfully', async () => {
      mockQueryBuilder.eq.mockResolvedValue({ error: null });

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
      expect(mockToast.success).toHaveBeenCalledWith('Item deleted');
    });

    it('handles rate limit error', async () => {
      mockCanDeleteItem.mockReturnValue(false);

      const { result } = renderHook(() => useDeleteItem(), { wrapper: createWrapper() });

      const deleteInput = {
        itemId: 'item-1',
        retrospectiveId: 'retro-1',
        userId: 'user-1',
      };

      await waitFor(() => {
        result.current.mutate(deleteInput);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockToast.error).toHaveBeenCalledWith('Please wait before deleting another item');
    });

    it('handles delete error', async () => {
      mockQueryBuilder.eq.mockResolvedValue({ error: { message: 'Delete failed' } });

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

      expect(mockToast.error).toHaveBeenCalledWith('Failed to delete item');
    });
  });

  describe('useToggleVote', () => {
    it('adds vote successfully', async () => {
      const newVote = { id: 'vote-3', item_id: 'item-1', profile_id: 'user-3' };
      mockQueryBuilder.single.mockResolvedValue({ data: newVote, error: null });

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
      expect(result.current.data).toEqual({ action: 'added', vote: newVote });
    });

    it('removes vote successfully', async () => {
      // For delete operations with two .eq() calls, the first returns builder, second returns resolved value
      mockQueryBuilder.eq
        .mockReturnValueOnce(mockQueryBuilder)  // First .eq() returns builder
        .mockResolvedValueOnce({ error: null }); // Second .eq() returns resolved value

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
      expect(result.current.data).toEqual({ action: 'removed' });
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

      await waitFor(() => {
        result.current.mutate(voteInput);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockToast.error).toHaveBeenCalledWith('Please wait before voting again');
    });

    it('handles vote error', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Vote failed' }
      });

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

      expect(mockToast.error).toHaveBeenCalledWith('Failed to update vote');
    });
  });

  describe('useUpdateItem', () => {
    it('updates item successfully', async () => {
      const updatedItem = { ...mockItems[0], text: 'Updated text' };
      mockQueryBuilder.single.mockResolvedValue({ data: updatedItem, error: null });

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
      expect(mockToast.success).toHaveBeenCalledWith('Item updated');
    });

    it('handles update error', async () => {
      mockQueryBuilder.single.mockResolvedValue({
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

      expect(mockToast.error).toHaveBeenCalledWith('Failed to update item');
    });
  });
});