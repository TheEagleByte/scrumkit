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
import { createClient } from '@/lib/supabase/server';
import { getTemplateById, getDefaultTemplate } from '../templates';
import { generateBoardUrl, defaultBoardSettings } from '../utils';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('../templates');
jest.mock('../utils');
jest.mock('next/headers');
jest.mock('next/cache');

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
  settings: defaultBoardSettings,
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

const mockBoard = {
  ...mockRetrospective,
  retrospective_columns: [
    {
      id: 'col-1',
      column_type: 'went-well',
      title: 'What went well?',
      description: 'Positive outcomes',
      color: 'bg-green-500/10',
      display_order: 0,
    },
  ],
  team: null,
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
    };
    mockCookies.mockResolvedValue(mockCookieStore);

    // Mock utils
    mockGenerateBoardUrl.mockReturnValue('abc123de');

    // Mock templates
    mockGetDefaultTemplate.mockReturnValue(mockTemplate);
    mockGetTemplateById.mockReturnValue(mockTemplate);

    // Setup Supabase mock
    mockSupabase = {
      from: jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn(),
      })),
    };

    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  describe('createBoard', () => {
    beforeEach(() => {
      // Mock successful retrospective creation
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockRetrospective,
        error: null,
      });

      // Mock successful columns creation
      mockSupabase.from().insert.mockResolvedValue({ error: null });

      // Mock cookies
      mockCookieStore.get.mockReturnValue(undefined);
    });

    it('creates board with default template successfully', async () => {
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
      expect(mockRevalidatePath).toHaveBeenCalledWith('/boards');
    });

    it('creates board with custom template', async () => {
      const input = {
        title: 'Sprint 1 Retrospective',
        templateId: 'custom-template',
      };

      await createBoard(input);

      expect(mockGetTemplateById).toHaveBeenCalledWith('custom-template');
      expect(mockGetDefaultTemplate).not.toHaveBeenCalled();
    });

    it('creates board with custom settings', async () => {
      const customSettings = {
        ...defaultBoardSettings,
        votingLimit: 5,
        timerEnabled: true,
      };

      const input = {
        title: 'Sprint 1 Retrospective',
        settings: customSettings,
      };

      await createBoard(input);

      const insertCall = mockSupabase.from().insert.mock.calls[0][0];
      expect(insertCall.settings).toEqual(customSettings);
      expect(insertCall.voting_limit).toBe(5);
    });

    it('generates and sets creator cookie if not exists', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      await createBoard({ title: 'Test Board' });

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'scrumkit_creator',
        expect.stringMatching(/^creator_abc123de_\d+$/),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 365,
          path: '/',
        })
      );
    });

    it('uses existing creator cookie if available', async () => {
      const existingCookie = 'creator_existing_123';
      mockCookieStore.get.mockReturnValue({ value: existingCookie });

      await createBoard({ title: 'Test Board' });

      const insertCall = mockSupabase.from().insert.mock.calls[0][0];
      expect(insertCall.creator_cookie).toBe(existingCookie);
    });

    it('adds board to user cookie list', async () => {
      const existingBoards = ['board1', 'board2'];
      mockCookieStore.get
        .mockReturnValueOnce({ value: 'creator_123' })
        .mockReturnValueOnce({ value: JSON.stringify(existingBoards) });

      await createBoard({ title: 'Test Board' });

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'scrumkit_boards',
        JSON.stringify(['abc123de', ...existingBoards]),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        })
      );
    });

    it('limits board list to 20 most recent', async () => {
      const existingBoards = Array.from({ length: 25 }, (_, i) => `board${i}`);
      mockCookieStore.get
        .mockReturnValueOnce({ value: 'creator_123' })
        .mockReturnValueOnce({ value: JSON.stringify(existingBoards) });

      await createBoard({ title: 'Test Board' });

      const setCall = mockCookieStore.set.mock.calls.find(
        call => call[0] === 'scrumkit_boards'
      );
      const boardsList = JSON.parse(setCall[1]);
      expect(boardsList).toHaveLength(20);
      expect(boardsList[0]).toBe('abc123de');
    });

    it('throws error if template is invalid', async () => {
      mockGetTemplateById.mockReturnValue(undefined);

      await expect(
        createBoard({ title: 'Test Board', templateId: 'invalid' })
      ).rejects.toThrow('Invalid template ID');
    });

    it('throws error if retrospective creation fails', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Creation failed' },
      });

      await expect(
        createBoard({ title: 'Test Board' })
      ).rejects.toThrow('Failed to create board');
    });

    it('cleans up retrospective if columns creation fails', async () => {
      mockSupabase.from().insert.mockResolvedValueOnce({
        data: mockRetrospective,
        error: null,
      });
      mockSupabase.from().insert.mockResolvedValueOnce({
        error: { message: 'Columns creation failed' },
      });

      await expect(
        createBoard({ title: 'Test Board' })
      ).rejects.toThrow('Failed to create board columns');

      // Should attempt cleanup
      expect(mockSupabase.from().delete().eq).toHaveBeenCalledWith(
        'id',
        mockRetrospective.id
      );
    });

    it('uses default title if none provided', async () => {
      await createBoard({});

      const insertCall = mockSupabase.from().insert.mock.calls[0][0];
      expect(insertCall.title).toBe('Untitled Retrospective');
    });

    it('creates anonymous board by default', async () => {
      await createBoard({ title: 'Test Board' });

      const insertCall = mockSupabase.from().insert.mock.calls[0][0];
      expect(insertCall.is_anonymous).toBe(true);
      expect(insertCall.team_id).toBeNull();
    });
  });

  describe('getBoard', () => {
    it('fetches board successfully', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockBoard,
        error: null,
      });

      const result = await getBoard('abc123de');

      expect(result).toEqual(mockBoard);
      expect(mockSupabase.from).toHaveBeenCalledWith('retrospectives');
      expect(mockSupabase.from().select().eq().eq().single).toHaveBeenCalled();
    });

    it('returns null if board not found', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await getBoard('nonexistent');

      expect(result).toBeNull();
    });

    it('includes related columns and team data', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockBoard,
        error: null,
      });

      await getBoard('abc123de');

      const selectCall = mockSupabase.from().select.mock.calls[0][0];
      expect(selectCall).toContain('retrospective_columns');
      expect(selectCall).toContain('team:teams');
    });

    it('filters out deleted boards', async () => {
      await getBoard('abc123de');

      expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('is_deleted', false);
    });
  });

  describe('getUserBoards', () => {
    it('fetches user boards from cookies successfully', async () => {
      const boardUrls = ['board1', 'board2'];
      mockCookieStore.get.mockReturnValue({ value: JSON.stringify(boardUrls) });

      const mockBoards = [
        { id: '1', unique_url: 'board1', title: 'Board 1' },
        { id: '2', unique_url: 'board2', title: 'Board 2' },
      ];

      mockSupabase.from().select().in().eq().order.mockResolvedValue({
        data: mockBoards,
        error: null,
      });

      const result = await getUserBoards();

      expect(result).toEqual(mockBoards);
      expect(mockSupabase.from).toHaveBeenCalledWith('retrospectives');
      expect(mockSupabase.from().select().in).toHaveBeenCalledWith('unique_url', boardUrls);
    });

    it('returns empty array if no boards in cookies', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const result = await getUserBoards();

      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('returns empty array if cookie parsing fails', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'invalid-json' });

      const result = await getUserBoards();

      expect(result).toEqual([]);
    });

    it('handles database fetch error gracefully', async () => {
      mockCookieStore.get.mockReturnValue({ value: JSON.stringify(['board1']) });
      mockSupabase.from().select().in().eq().order.mockResolvedValue({
        data: null,
        error: { message: 'Fetch failed' },
      });

      const result = await getUserBoards();

      expect(result).toEqual([]);
    });

    it('orders boards by created_at descending', async () => {
      mockCookieStore.get.mockReturnValue({ value: JSON.stringify(['board1']) });
      mockSupabase.from().select().in().eq().order.mockResolvedValue({
        data: [],
        error: null,
      });

      await getUserBoards();

      expect(mockSupabase.from().select().in().eq().order).toHaveBeenCalledWith(
        'created_at',
        { ascending: false }
      );
    });

    it('filters out deleted boards', async () => {
      mockCookieStore.get.mockReturnValue({ value: JSON.stringify(['board1']) });
      mockSupabase.from().select().in().eq().order.mockResolvedValue({
        data: [],
        error: null,
      });

      await getUserBoards();

      expect(mockSupabase.from().select().in().eq).toHaveBeenCalledWith('is_deleted', false);
    });
  });

  describe('updateBoard', () => {
    beforeEach(() => {
      mockCookieStore.get.mockReturnValue({ value: 'creator_123' });
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { creator_cookie: 'creator_123', team_id: null },
        error: null,
      });
      mockSupabase.from().update().eq.mockResolvedValue({ error: null });
    });

    it('updates board successfully', async () => {
      const updates = {
        title: 'Updated Title',
        voting_limit: 5,
        is_archived: true,
      };

      await updateBoard('abc123de', updates);

      expect(mockSupabase.from).toHaveBeenCalledWith('retrospectives');
      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Title',
          voting_limit: 5,
          is_archived: true,
          updated_at: expect.any(String),
        })
      );
      expect(mockRevalidatePath).toHaveBeenCalledWith('/retro/abc123de');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/boards');
    });

    it('updates board settings', async () => {
      const newSettings = { votingEnabled: false, timerEnabled: true };
      const updates = { settings: newSettings };

      await updateBoard('abc123de', updates);

      const updateCall = mockSupabase.from().update.mock.calls[0][0];
      expect(updateCall.settings).toEqual(newSettings);
    });

    it('throws error if board not found', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(
        updateBoard('nonexistent', { title: 'New Title' })
      ).rejects.toThrow('Board not found');
    });

    it('throws error if user lacks permission', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'creator_different' });
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { creator_cookie: 'creator_original', team_id: null },
        error: null,
      });

      await expect(
        updateBoard('abc123de', { title: 'New Title' })
      ).rejects.toThrow("You don't have permission to update this board");
    });

    it('throws error for team boards without auth', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { creator_cookie: 'creator_123', team_id: 'team-1' },
        error: null,
      });

      await expect(
        updateBoard('abc123de', { title: 'New Title' })
      ).rejects.toThrow('Cannot update team boards anonymously');
    });

    it('throws error if update fails', async () => {
      mockSupabase.from().update().eq.mockResolvedValue({
        error: { message: 'Update failed' },
      });

      await expect(
        updateBoard('abc123de', { title: 'New Title' })
      ).rejects.toThrow('Failed to update board');
    });
  });

  describe('deleteBoard', () => {
    beforeEach(() => {
      mockCookieStore.get
        .mockReturnValueOnce({ value: 'creator_123' })
        .mockReturnValueOnce({ value: JSON.stringify(['abc123de', 'other-board']) });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { creator_cookie: 'creator_123', team_id: null },
        error: null,
      });

      mockSupabase.from().update().eq.mockResolvedValue({ error: null });
    });

    it('soft deletes board successfully', async () => {
      await deleteBoard('abc123de');

      expect(mockSupabase.from).toHaveBeenCalledWith('retrospectives');
      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        is_deleted: true,
        updated_at: expect.any(String),
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/boards');
    });

    it('removes board from cookie list', async () => {
      await deleteBoard('abc123de');

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'scrumkit_boards',
        JSON.stringify(['other-board']),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        })
      );
    });

    it('throws error if board not found', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(deleteBoard('nonexistent')).rejects.toThrow('Board not found');
    });

    it('throws error if user lacks permission', async () => {
      mockCookieStore.get.mockReturnValueOnce({ value: 'creator_different' });
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { creator_cookie: 'creator_original', team_id: null },
        error: null,
      });

      await expect(deleteBoard('abc123de')).rejects.toThrow(
        "You don't have permission to delete this board"
      );
    });

    it('throws error for team boards', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { creator_cookie: 'creator_123', team_id: 'team-1' },
        error: null,
      });

      await expect(deleteBoard('abc123de')).rejects.toThrow(
        'Cannot delete team boards anonymously'
      );
    });

    it('throws error if deletion fails', async () => {
      mockSupabase.from().update().eq.mockResolvedValue({
        error: { message: 'Delete failed' },
      });

      await expect(deleteBoard('abc123de')).rejects.toThrow('Failed to delete board');
    });
  });

  describe('cloneBoard', () => {
    const originalBoard = {
      title: 'Original Board',
      template: 'default',
      settings: defaultBoardSettings,
      voting_limit: 3,
      retrospective_columns: mockTemplate.columns,
    };

    beforeEach(() => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: originalBoard,
        error: null,
      });

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockRetrospective,
        error: null,
      });

      mockSupabase.from().insert.mockResolvedValue({ error: null });
      mockCookieStore.get.mockReturnValue(undefined);
    });

    it('clones board successfully', async () => {
      const result = await cloneBoard('abc123de');

      expect(result).toEqual({
        id: mockRetrospective.id,
        unique_url: mockRetrospective.unique_url,
        title: mockRetrospective.title,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('retrospectives');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/boards');
    });

    it('clones board with custom title', async () => {
      await cloneBoard('abc123de', 'Custom Clone Title');

      const insertCall = mockSupabase.from().insert.mock.calls[0][0];
      expect(insertCall.title).toBe('Custom Clone Title');
    });

    it('uses default clone title if none provided', async () => {
      await cloneBoard('abc123de');

      const insertCall = mockSupabase.from().insert.mock.calls[0][0];
      expect(insertCall.title).toBe('Original Board (Copy)');
    });

    it('preserves original board settings', async () => {
      await cloneBoard('abc123de');

      const insertCall = mockSupabase.from().insert.mock.calls[0][0];
      expect(insertCall.settings).toEqual(originalBoard.settings);
      expect(insertCall.voting_limit).toBe(originalBoard.voting_limit);
    });

    it('throws error if original board not found', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(cloneBoard('nonexistent')).rejects.toThrow('Board not found');
    });

    it('uses default template if original template is null', async () => {
      const boardWithNullTemplate = { ...originalBoard, template: null };
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: boardWithNullTemplate,
        error: null,
      });

      await cloneBoard('abc123de');

      const insertCall = mockSupabase.from().insert.mock.calls[0][0];
      expect(insertCall.template).toBe('default');
    });
  });
});