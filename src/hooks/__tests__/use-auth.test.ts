/**
 * Comprehensive Jest unit tests for use-auth.ts
 * Tests authentication React hook functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../use-auth';
import { createClient } from '@/lib/supabase/client';

// Mock dependencies
jest.mock('@/lib/supabase/client');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Mock data
const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' },
};

const mockSession = {
  user: mockUser,
  access_token: 'token',
};

const mockProfile = {
  id: mockUser.id,
  email: 'test@example.com',
  full_name: 'Test User',
};

describe('useAuth Hook', () => {
  let mockAuth: any;
  let mockQueryBuilder: any;
  let mockFrom: any;
  let authStateChangeCallback: any;
  let mockSubscription: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock subscription
    mockSubscription = {
      unsubscribe: jest.fn(),
    };

    // Create mock query builder
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    };

    // Create mock from function
    mockFrom = jest.fn(() => mockQueryBuilder);

    // Create mock auth
    mockAuth = {
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn((callback) => {
        authStateChangeCallback = callback;
        return { data: { subscription: mockSubscription } };
      }),
      signOut: jest.fn(),
    };

    // Create mock client
    const mockClient = {
      auth: mockAuth,
      from: mockFrom,
    };

    mockCreateClient.mockReturnValue(mockClient);

    // Default successful responses
    mockAuth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    mockQueryBuilder.single.mockResolvedValue({
      data: mockProfile,
      error: null,
    });
    mockAuth.signOut.mockResolvedValue({ error: null });
  });

  describe('Initial State', () => {
    it('initializes with loading state', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.profile).toBeNull();
      expect(result.current.isLoading).toBe(true);
    });

    it('creates Supabase client on mount', () => {
      renderHook(() => useAuth());
      expect(mockCreateClient).toHaveBeenCalled();
    });
  });

  describe('Session Loading', () => {
    it('loads user session and profile on mount', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.profile).toEqual(mockProfile);

      expect(mockAuth.getSession).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith('profiles');
    });

    it('handles no initial session', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.profile).toBeNull();
    });

    it('handles session loading errors', async () => {
      mockAuth.getSession.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.profile).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error initializing auth:', expect.any(Error));
    });

    it('sets up auth state change listener', () => {
      renderHook(() => useAuth());
      expect(mockAuth.onAuthStateChange).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Auth State Changes', () => {
    it('updates state on sign in', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Simulate sign in
      await act(async () => {
        await authStateChangeCallback('SIGNED_IN', mockSession);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });

    it('updates state on sign out', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Simulate sign out
      await act(async () => {
        await authStateChangeCallback('SIGNED_OUT', null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.profile).toBeNull();
    });

    it('fetches profile on auth state change with user', async () => {
      const updatedProfile = { ...mockProfile, full_name: 'Updated Name' };

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Update mock for profile fetch during state change
      mockQueryBuilder.single.mockResolvedValue({
        data: updatedProfile,
        error: null,
      });

      await act(async () => {
        await authStateChangeCallback('TOKEN_REFRESHED', mockSession);
      });

      await waitFor(() => {
        expect(result.current.profile?.full_name).toBe('Updated Name');
      });
    });
  });

  describe('signOut Method', () => {
    it('signs out user successfully', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockAuth.signOut).toHaveBeenCalled();
    });

    it('handles signout errors', async () => {
      mockAuth.signOut.mockResolvedValue({ error: new Error('Signout failed') });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.signOut()).rejects.toThrow('Signout failed');
      expect(console.error).toHaveBeenCalledWith('Error signing out:', expect.any(Error));
    });
  });

  describe('updateProfile Method', () => {
    it('updates profile successfully', async () => {
      const updatedProfile = { ...mockProfile, full_name: 'Updated Name' };
      mockQueryBuilder.single.mockResolvedValue({
        data: updatedProfile,
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let updateResult: any;
      await act(async () => {
        updateResult = await result.current.updateProfile({ full_name: 'Updated Name' });
      });

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(result.current.profile?.full_name).toBe('Updated Name');
      expect(updateResult).toEqual(updatedProfile);
    });

    it('throws error when no user is logged in', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        result.current.updateProfile({ full_name: 'New Name' })
      ).rejects.toThrow('No user logged in');
    });

    it('handles profile update errors', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: new Error('Update failed'),
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        result.current.updateProfile({ full_name: 'New Name' })
      ).rejects.toThrow('Update failed');

      expect(console.error).toHaveBeenCalledWith('Error updating profile:', expect.any(Error));
    });
  });

  describe('Cleanup', () => {
    it('unsubscribes from auth state changes on unmount', () => {
      const { unmount } = renderHook(() => useAuth());

      unmount();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Return Values', () => {
    it('returns all expected properties and methods', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('session');
      expect(result.current).toHaveProperty('profile');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('signOut');
      expect(result.current).toHaveProperty('updateProfile');

      expect(typeof result.current.signOut).toBe('function');
      expect(typeof result.current.updateProfile).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('handles auth state change with partial session data', async () => {
      const partialSession = { ...mockSession, user: null };

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await authStateChangeCallback('TOKEN_REFRESHED', partialSession);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toEqual(partialSession);
      expect(result.current.profile).toBeNull();
    });

    it('handles malformed profile data', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: { id: mockUser.id }, // Incomplete profile
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.profile).toEqual({ id: mockUser.id });
    });
  });
});