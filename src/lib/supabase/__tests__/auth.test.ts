/**
 * Comprehensive Jest unit tests for auth.ts
 * Tests authentication utility functions
 */

import {
  signUp,
  signIn,
  signInWithMagicLink,
  verifyOtp,
  signOut,
  getSession,
  getCurrentUser,
  getCurrentProfile,
  updateProfile,
  requestPasswordReset,
  updatePassword,
  getUserFromServer,
  getProfileFromServer,
  AUTH_ERRORS,
} from '../auth';
import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Mock dependencies
jest.mock('@/lib/supabase/client');
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock window.location for auth functions that use it
const mockLocation = {
  origin: 'http://localhost',
  href: 'http://localhost',
};

// Mock window object if not present or extend it
(global as any).window = global.window || {};
(global as any).window.location = mockLocation;

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockCreateServerClient = createServerClient as jest.MockedFunction<typeof createServerClient>;

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

describe('Auth Utilities', () => {
  let mockAuth: any;
  let mockQueryBuilder: any;
  let mockFrom: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock query builder
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    // Create mock from function
    mockFrom = jest.fn(() => mockQueryBuilder);

    // Create mock auth
    mockAuth = {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOtp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      verifyOtp: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    };

    // Create mock client
    const mockClient = {
      auth: mockAuth,
      from: mockFrom,
    };

    mockCreateClient.mockReturnValue(mockClient);
    mockCreateServerClient.mockResolvedValue(mockClient);
  });

  describe('signUp', () => {
    it('signs up a user successfully', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });
      mockQueryBuilder.single.mockResolvedValue({ error: null });

      const result = await signUp('test@example.com', 'password123', {
        full_name: 'Test User',
      });

      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
          },
        },
      });

      expect(result).toEqual({
        user: mockUser,
        session: null,
      });
    });

    it('handles signup errors', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already exists' },
      });

      await expect(signUp('test@example.com', 'password123')).rejects.toThrow(
        'User already exists'
      );
    });
  });

  describe('signIn', () => {
    it('signs in user successfully', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await signIn('test@example.com', 'password123');

      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        user: mockUser,
        session: mockSession,
      });
    });

    it('handles invalid credentials error specifically', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(signIn('test@example.com', 'wrong-password')).rejects.toThrow(
        AUTH_ERRORS.INVALID_CREDENTIALS
      );
    });
  });

  describe('signInWithMagicLink', () => {
    it('sends magic link successfully', async () => {
      mockAuth.signInWithOtp.mockResolvedValue({ error: null });

      const result = await signInWithMagicLink('test@example.com');

      expect(mockAuth.signInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'http://localhost/auth/confirm',
        },
      });

      expect(result).toEqual({ success: true });
    });

    it('handles magic link errors', async () => {
      mockAuth.signInWithOtp.mockResolvedValue({
        error: { message: 'Invalid email' },
      });

      await expect(signInWithMagicLink('invalid@email')).rejects.toThrow(
        'Invalid email'
      );
    });
  });

  describe('verifyOtp', () => {
    it('verifies OTP token successfully', async () => {
      mockAuth.verifyOtp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await verifyOtp('token-123');

      expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
        token_hash: 'token-123',
        type: 'email',
      });

      expect(result).toEqual({
        user: mockUser,
        session: mockSession,
      });
    });
  });

  describe('signOut', () => {
    it('signs out user successfully', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null });

      const result = await signOut();

      expect(mockAuth.signOut).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe('getSession', () => {
    it('gets user session successfully', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await getSession();

      expect(mockAuth.getSession).toHaveBeenCalled();
      expect(result).toEqual(mockSession);
    });
  });

  describe('getCurrentUser', () => {
    it('gets current user successfully', async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getCurrentUser();

      expect(mockAuth.getUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('returns null for missing session', async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth session missing' },
      });

      const result = await getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe('getCurrentProfile', () => {
    it('gets current user profile successfully', async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockQueryBuilder.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await getCurrentProfile();

      expect(mockAuth.getUser).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(result).toEqual(mockProfile);
    });

    it('returns null if no user', async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth session missing' },
      });

      const result = await getCurrentProfile();
      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('updates user profile successfully', async () => {
      const updatedProfile = { ...mockProfile, full_name: 'Updated Name' };
      mockQueryBuilder.single.mockResolvedValue({
        data: updatedProfile,
        error: null,
      });

      const result = await updateProfile(mockUser.id, { full_name: 'Updated Name' });

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(result).toEqual(updatedProfile);
    });
  });

  describe('requestPasswordReset', () => {
    it('requests password reset successfully', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValue({ error: null });

      const result = await requestPasswordReset('test@example.com');

      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'http://localhost/auth/reset-password',
        }
      );

      expect(result).toEqual({ success: true });
    });
  });

  describe('updatePassword', () => {
    it('updates password successfully', async () => {
      mockAuth.updateUser.mockResolvedValue({ error: null });

      const result = await updatePassword('newpassword123');

      expect(mockAuth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe('getUserFromServer', () => {
    it('gets user from server successfully', async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getUserFromServer();

      expect(mockCreateServerClient).toHaveBeenCalled();
      expect(mockAuth.getUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('getProfileFromServer', () => {
    it('gets profile from server successfully', async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockQueryBuilder.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await getProfileFromServer();

      expect(mockCreateServerClient).toHaveBeenCalled();
      expect(mockAuth.getUser).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(result).toEqual(mockProfile);
    });
  });

  describe('AUTH_ERRORS Constants', () => {
    it('contains all expected error messages', () => {
      expect(AUTH_ERRORS.INVALID_CREDENTIALS).toBe('Invalid email or password');
      expect(AUTH_ERRORS.EMAIL_NOT_CONFIRMED).toBe('Please confirm your email address');
      expect(AUTH_ERRORS.USER_NOT_FOUND).toBe('User not found');
      expect(AUTH_ERRORS.SESSION_EXPIRED).toBe('Your session has expired. Please sign in again.');
      expect(AUTH_ERRORS.NETWORK_ERROR).toBe('Network error. Please check your connection.');
      expect(AUTH_ERRORS.UNKNOWN_ERROR).toBe('An unexpected error occurred. Please try again.');
    });
  });
});