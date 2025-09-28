/**
 * Authentication helper functions for Supabase
 * Provides utilities for user authentication and session management
 */

import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import type { Profile, UUID } from './types-enhanced';
import { logger } from '@/lib/logger';

// Auth error messages
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_CONFIRMED: 'Please confirm your email address',
  USER_NOT_FOUND: 'User not found',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Sign up a new user
 * Note: Profile will be created automatically via database trigger after email confirmation
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: {
    full_name?: string;
    organization_id?: UUID;
  }
) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        throw new Error('This email is already registered. Try signing in instead.');
      }
      logger.error('Sign up error', error);
      throw new Error(error.message || AUTH_ERRORS.UNKNOWN_ERROR);
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    logger.error('Sign up failed', error as Error);
    throw error;
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error('Sign in error', error);

      if (error.message?.includes('Invalid login credentials')) {
        throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
      }

      throw new Error(error.message || AUTH_ERRORS.UNKNOWN_ERROR);
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    logger.error('Sign in failed', error as Error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Sign out error', error);
      throw new Error(error.message || AUTH_ERRORS.UNKNOWN_ERROR);
    }

    return { success: true };
  } catch (error) {
    logger.error('Sign out failed', error as Error);
    throw error;
  }
}

/**
 * Get the current user session
 */
export async function getSession() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      logger.error('Get session error', error);
      throw new Error(error.message || AUTH_ERRORS.UNKNOWN_ERROR);
    }

    return data.session;
  } catch (error) {
    logger.error('Get session failed', error as Error);
    throw error;
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      if (error.message !== 'Auth session missing') {
        logger.error('Get user error', error);
      }
      return null;
    }

    return data.user;
  } catch (error) {
    logger.error('Get current user failed', error as Error);
    return null;
  }
}

/**
 * Get the current user profile
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = createClient();
    const user = await getCurrentUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      logger.error('Get profile error', error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Get current profile failed', error as Error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: UUID,
  updates: {
    full_name?: string;
    avatar_url?: string;
    organization_id?: UUID;
  }
) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Update profile error', error);
      throw new Error(error.message || 'Failed to update profile');
    }

    return data;
  } catch (error) {
    logger.error('Update profile failed', error as Error);
    throw error;
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string) {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      logger.error('Password reset request error', error);
      throw new Error(error.message || AUTH_ERRORS.UNKNOWN_ERROR);
    }

    return { success: true };
  } catch (error) {
    logger.error('Password reset request failed', error as Error);
    throw error;
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      logger.error('Update password error', error);
      throw new Error(error.message || AUTH_ERRORS.UNKNOWN_ERROR);
    }

    return { success: true };
  } catch (error) {
    logger.error('Update password failed', error as Error);
    throw error;
  }
}

/**
 * Server-side function to get user from cookies
 */
export async function getUserFromServer() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      if (error.message !== 'Auth session missing') {
        logger.error('Server get user error', error);
      }
      return null;
    }

    return data.user;
  } catch (error) {
    logger.error('Server get user failed', error as Error);
    return null;
  }
}

/**
 * Server-side function to get user profile
 */
export async function getProfileFromServer(): Promise<Profile | null> {
  try {
    const user = await getUserFromServer();
    if (!user) return null;

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      logger.error('Server get profile error', error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Server get profile failed', error as Error);
    return null;
  }
}