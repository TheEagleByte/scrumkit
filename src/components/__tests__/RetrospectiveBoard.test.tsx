/**
 * Jest unit tests for RetrospectiveBoard component
 * Tests the main retrospective board component functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RetrospectiveBoard } from '../RetrospectiveBoard';

// Mock hooks and dependencies
jest.mock('@/hooks/use-retrospective', () => ({
  useRetrospective: jest.fn(() => ({ data: null, isLoading: false })),
  useRetrospectiveColumns: jest.fn(() => ({
    data: [
      { id: 'went-well', title: 'What went well?', description: 'Celebrate successes' },
      { id: 'improve', title: 'What could be improved?', description: 'Areas for enhancement' },
      { id: 'blockers', title: 'What blocked us?', description: 'Obstacles faced' },
      { id: 'action-items', title: 'Action items', description: 'Next steps' },
    ],
    isLoading: false
  })),
  useRetrospectiveItems: jest.fn(() => ({ data: [], isLoading: false })),
  useVotes: jest.fn(() => ({ data: [], isLoading: false })),
  useCreateItem: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useDeleteItem: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useToggleVote: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useUpdateItem: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useMoveItem: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useUserVoteStats: jest.fn(() => ({
    data: {
      votesUsed: 0,
      maxVotes: 5,
      votesRemaining: 5
    },
    isLoading: false
  })),
}));

jest.mock('@/hooks/use-realtime', () => ({
  useRetrospectiveRealtime: jest.fn(() => ({
    items: [],
    votes: [],
    retrospective: null,
    presenceUsers: [],
    otherUsers: [],
    activeUsersCount: 0,
    myPresenceState: null,
    updatePresence: jest.fn(),
    cursors: new Map(),
    updateCursor: jest.fn(),
    isSubscribed: true,
    connectionStatus: 'connected',
    broadcast: jest.fn(),
    refetch: jest.fn(),
  })),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  })),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock('@/lib/utils/sanitize', () => ({
  sanitizeItemContent: jest.fn((text) => text),
  isValidItemText: jest.fn(() => ({ valid: true })),
}));

jest.mock('@/lib/utils/rate-limit', () => ({
  getCooldownTime: jest.fn(() => 0),
}));

jest.mock('@/lib/boards/anonymous-items', () => ({
  isAnonymousItemOwner: jest.fn(() => false),
}));

// Mock RetroItem component
jest.mock('@/components/retro/RetroItem', () => ({
  RetroItem: ({ item }: any) => (
    <div data-testid={`item-${item.id}`}>
      <span>{item.text}</span>
      <span>{item.author}</span>
      <span data-testid={`votes-${item.id}`}>{item.votes}</span>
    </div>
  ),
}));

describe('RetrospectiveBoard', () => {
  let queryClient: QueryClient;

  const defaultProps = {
    retrospectiveId: 'test-retro-123',
    currentUser: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    },
    teamName: 'Test Team',
    sprintName: 'Sprint 1',
  };

  beforeEach(() => {
    // Clear any mocks
    jest.clearAllMocks();
    // Create new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  describe('Initial Render', () => {
    it('renders the retrospective board', () => {
      renderWithProviders(<RetrospectiveBoard {...defaultProps} />);

      // The board should render with columns
      expect(screen.getByText('What went well?')).toBeInTheDocument();
      expect(screen.getByText('What could be improved?')).toBeInTheDocument();
      expect(screen.getByText('What blocked us?')).toBeInTheDocument();
      expect(screen.getByText('Action items')).toBeInTheDocument();
    });

    it('renders team and sprint information', () => {
      renderWithProviders(<RetrospectiveBoard {...defaultProps} />);
      expect(screen.getByText('Test Team')).toBeInTheDocument();
      expect(screen.getByText('Sprint 1')).toBeInTheDocument();
    });

    it('renders with loading state', () => {
      renderWithProviders(<RetrospectiveBoard {...defaultProps} />);
      // Should render without errors even when loading
      expect(screen.getByText('Test Team')).toBeInTheDocument();
    });

    it('shows user presence information', () => {
      renderWithProviders(<RetrospectiveBoard {...defaultProps} />);
      // Should show user count
      expect(screen.getByText(/Just you|0 users/)).toBeInTheDocument();
    });

    it('initializes with empty columns', () => {
      renderWithProviders(<RetrospectiveBoard {...defaultProps} />);
      // Should have column headers but no items initially
      expect(screen.getByText('What went well?')).toBeInTheDocument();
      expect(screen.queryAllByTestId(/^item-/)).toHaveLength(0);
    });
  });

  describe('Real-time Integration', () => {
    it('uses real-time hook with correct parameters', () => {
      const { useRetrospectiveRealtime } = require('@/hooks/use-realtime');
      renderWithProviders(<RetrospectiveBoard {...defaultProps} />);

      expect(useRetrospectiveRealtime).toHaveBeenCalledWith(
        defaultProps.retrospectiveId,
        defaultProps.currentUser
      );
    });

    it('displays connection status', () => {
      renderWithProviders(<RetrospectiveBoard {...defaultProps} />);

      // Connection status should be shown
      const connectionElement = screen.getByText(/Connected|Connecting|Disconnected/i);
      expect(connectionElement).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing props gracefully', () => {
      const minimalProps = {
        retrospectiveId: 'test-id',
        currentUser: { id: '1', name: 'User' },
      };

      expect(() =>
        renderWithProviders(<RetrospectiveBoard {...minimalProps as any} />)
      ).not.toThrow();
    });
  });
});