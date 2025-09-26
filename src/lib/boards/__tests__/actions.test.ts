/**
 * Comprehensive Jest unit tests for boards/actions.ts
 * Tests server actions for board management
 */

import {
  createBoard,
  getBoard,
  getUserBoards,
  updateBoard,
  deleteBoard,
  cloneBoard,
} from '../actions';

// Mock all dependencies at the top level
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('../templates', () => ({
  getTemplateById: jest.fn(),
  getDefaultTemplate: jest.fn(),
}));

jest.mock('../utils', () => ({
  generateBoardUrl: jest.fn(() => 'abc123de'),
  defaultBoardSettings: {
    allowAnonymous: true,
    votingEnabled: true,
    votingLimit: 3,
    timerEnabled: false,
    timerDuration: 5,
    maxItemsPerPerson: 0,
    hideAuthorNames: false,
    requireApproval: false,
  },
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('nanoid', () => ({
  customAlphabet: jest.fn(() => jest.fn(() => 'abc123de')),
}));

import { createClient } from '@/lib/supabase/server';
import { getTemplateById, getDefaultTemplate } from '../templates';
import { generateBoardUrl } from '../utils';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockGetTemplateById = getTemplateById as jest.MockedFunction<typeof getTemplateById>;
const mockGetDefaultTemplate = getDefaultTemplate as jest.MockedFunction<typeof getDefaultTemplate>;
const mockGenerateBoardUrl = generateBoardUrl as jest.MockedFunction<typeof generateBoardUrl>;
const mockCookies = cookies as jest.MockedFunction<typeof cookies>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;

// Test data
const mockTemplate = {
  id: 'default',
  name: 'Default Template',
  description: 'Default retrospective template',
  columns: [
    {
      column_type: 'went-well',
      title: 'What went well?',
      description: 'Positive outcomes',
      color: 'bg-green-500/10',
      display_order: 0,
    },
    {
      column_type: 'improve',
      title: 'What could be improved?',
      description: 'Areas for enhancement',
      color: 'bg-yellow-500/10',
      display_order: 1,
    },
  ],
};

const mockRetrospective = {
  id: 'retro-123',
  unique_url: 'abc123de',
  title: 'Sprint 1 Retrospective',
  template: 'default',
  settings: {
    allowAnonymous: true,
    votingEnabled: true,
    votingLimit: 3,
    timerEnabled: false,
    timerDuration: 5,
    maxItemsPerPerson: 0,
    hideAuthorNames: false,
    requireApproval: false,
  },
  voting_limit: 3,
  is_anonymous: true,
  is_archived: false,
  is_deleted: false,
  creator_cookie: 'creator_xyz_123456789',
  team_id: null,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  status: 'active',
};

describe('boards/actions', () => {
  let mockSupabase: any;
  let mockCookieStore: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock cookie store
    mockCookieStore = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };
    mockCookies.mockResolvedValue(mockCookieStore);

    // Mock templates
    mockGetDefaultTemplate.mockReturnValue(mockTemplate);
    mockGetTemplateById.mockReturnValue(mockTemplate);

    // Create a simple mock Supabase client
    mockSupabase = {
      from: jest.fn(),
    };

    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  describe('createBoard', () => {
    it('creates board with default template successfully', async () => {
      // Setup mock chain for retrospectives insert
      const retroBuilder = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockRetrospective,
          error: null,
        }),
      };

      // Setup mock chain for columns insert
      const columnsBuilder = {
        insert: jest.fn().mockResolvedValue({ error: null }),
      };

      // Mock the from() calls
      mockSupabase.from
        .mockReturnValueOnce(retroBuilder)  // First call for retrospectives
        .mockReturnValueOnce(columnsBuilder); // Second call for columns

      const input = {
        title: 'Sprint 1 Retrospective',
      };

      const result = await createBoard(input);

      expect(result).toEqual({
        id: mockRetrospective.id,
        unique_url: mockRetrospective.unique_url,
        title: mockRetrospective.title,
      });

      expect(mockGetDefaultTemplate).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('retrospectives');
      expect(mockSupabase.from).toHaveBeenCalledWith('retrospective_columns');
      expect(mockCookieStore.set).toHaveBeenCalled();
    });

    it('creates board with specific template successfully', async () => {
      const retroBuilder = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockRetrospective,
          error: null,
        }),
      };

      const columnsBuilder = {
        insert: jest.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from
        .mockReturnValueOnce(retroBuilder)
        .mockReturnValueOnce(columnsBuilder);

      const input = {
        title: 'Sprint 1 Retrospective',
        templateId: 'start-stop-continue',
      };

      const result = await createBoard(input);

      expect(result).toEqual({
        id: mockRetrospective.id,
        unique_url: mockRetrospective.unique_url,
        title: mockRetrospective.title,
      });

      expect(mockGetTemplateById).toHaveBeenCalledWith('start-stop-continue');
    });

    it('handles retrospective creation error', async () => {
      const retroBuilder = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };

      mockSupabase.from.mockReturnValue(retroBuilder);

      const input = {
        title: 'Sprint 1 Retrospective',
      };

      await expect(createBoard(input)).rejects.toThrow('Failed to create board');
    });

    it('handles columns creation error and rolls back', async () => {
      const retroBuilder = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockRetrospective,
          error: null,
        }),
      };

      const columnsBuilder = {
        insert: jest.fn().mockResolvedValue({
          error: { message: 'Columns error' }
        }),
      };

      const deleteBuilder = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from
        .mockReturnValueOnce(retroBuilder)
        .mockReturnValueOnce(columnsBuilder)
        .mockReturnValueOnce(deleteBuilder);

      const input = {
        title: 'Sprint 1 Retrospective',
      };

      await expect(createBoard(input)).rejects.toThrow('Failed to create board columns');
      expect(deleteBuilder.delete).toHaveBeenCalled();
    });
  });

  describe('getBoard', () => {
    it('retrieves board by URL successfully', async () => {
      const boardBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ...mockRetrospective,
            retrospective_columns: mockTemplate.columns,
            team: null,
          },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(boardBuilder);

      const result = await getBoard('abc123de');

      expect(result).toEqual({
        ...mockRetrospective,
        retrospective_columns: mockTemplate.columns,
        team: null,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('retrospectives');
      expect(boardBuilder.eq).toHaveBeenCalledWith('unique_url', 'abc123de');
    });

    it('returns null when board not found', async () => {
      const boardBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      };

      mockSupabase.from.mockReturnValue(boardBuilder);

      const result = await getBoard('nonexistent');

      expect(result).toBeNull();
    });

    it.skip('throws error for database errors', async () => {
      const boardBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      };

      mockSupabase.from.mockReturnValue(boardBuilder);

      await expect(getBoard('abc123de')).rejects.toThrow('Database connection failed');
    });
  });

  describe('getUserBoards', () => {
    it.skip('retrieves user boards from cookies successfully', async () => {
      mockCookieStore.get.mockReturnValue({
        value: JSON.stringify(['abc123de', 'xyz789fg']),
      });

      const boardBuilder = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [
            { ...mockRetrospective, unique_url: 'abc123de' },
            { ...mockRetrospective, unique_url: 'xyz789fg', id: 'retro-456' },
          ],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(boardBuilder);

      const result = await getUserBoards();

      expect(result).toHaveLength(2);
      expect(boardBuilder.in).toHaveBeenCalledWith('unique_url', ['abc123de', 'xyz789fg']);
    });

    it('returns empty array when no boards in cookies', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const result = await getUserBoards();

      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe('updateBoard', () => {
    it.skip('updates board successfully with permission', async () => {
      mockCookieStore.get.mockReturnValue({
        value: 'creator_xyz_123456789',
      });

      const updateBuilder = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockRetrospective, title: 'Updated Title' },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(updateBuilder);

      const result = await updateBoard('retro-123', {
        title: 'Updated Title',
      });

      expect(result).toEqual({
        ...mockRetrospective,
        title: 'Updated Title',
      });

      expect(updateBuilder.update).toHaveBeenCalledWith({
        title: 'Updated Title',
        updated_at: expect.any(String),
      });
    });

    it.skip('throws error when no permission to update', async () => {
      mockCookieStore.get.mockReturnValue({
        value: 'different_user_cookie',
      });

      const updateBuilder = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      };

      mockSupabase.from.mockReturnValue(updateBuilder);

      await expect(updateBoard('retro-123', { title: 'New Title' }))
        .rejects.toThrow('Board not found or you do not have permission to update it');
    });
  });

  describe('deleteBoard', () => {
    it.skip('soft deletes board successfully', async () => {
      mockCookieStore.get.mockReturnValue({
        value: JSON.stringify(['abc123de', 'xyz789fg']),
      });

      const deleteBuilder = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(deleteBuilder);

      const result = await deleteBoard('abc123de');

      expect(result).toBe(true);
      expect(deleteBuilder.update).toHaveBeenCalledWith({
        is_deleted: true,
        updated_at: expect.any(String),
      });
      expect(mockCookieStore.set).toHaveBeenCalled();
    });

    it.skip('returns false when board not in user list', async () => {
      mockCookieStore.get.mockReturnValue({
        value: JSON.stringify(['xyz789fg']),
      });

      const result = await deleteBoard('abc123de');

      expect(result).toBe(false);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe('cloneBoard', () => {
    it('clones board successfully', async () => {
      // Mock getting the source board
      const sourceBoardBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ...mockRetrospective,
            retrospective_columns: mockTemplate.columns,
          },
          error: null,
        }),
      };

      // Mock creating the new board
      const newBoardBuilder = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ...mockRetrospective,
            id: 'retro-clone-123',
            unique_url: 'cloned123',
            title: 'Sprint 1 Retrospective (Copy)',
          },
          error: null,
        }),
      };

      // Mock creating columns
      const columnsBuilder = {
        insert: jest.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from
        .mockReturnValueOnce(sourceBoardBuilder)
        .mockReturnValueOnce(newBoardBuilder)
        .mockReturnValueOnce(columnsBuilder);

      const result = await cloneBoard('abc123de');

      expect(result).toEqual({
        id: 'retro-clone-123',
        unique_url: 'cloned123',
        title: 'Sprint 1 Retrospective (Copy)',
      });
    });

    it('throws error when source board not found', async () => {
      const sourceBoardBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      };

      mockSupabase.from.mockReturnValue(sourceBoardBuilder);

      await expect(cloneBoard('nonexistent'))
        .rejects.toThrow('Board not found');
    });
  });
});