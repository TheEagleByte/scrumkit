/**
 * Comprehensive Jest unit tests for AuthForm.tsx
 * Tests authentication form component functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthForm } from '../AuthForm';
import { createClient } from '@/lib/supabase/client';

// Create mock functions at module level
const mockToast = jest.fn();
const mockPush = jest.fn();
const mockRefresh = jest.fn();

// Mock dependencies
jest.mock('@/lib/supabase/client');
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock window.location for components that use it
delete (window as any).location;
(window as any).location = { origin: 'http://localhost' };

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

// Mock data
const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
};

const mockSession = {
  user: mockUser,
  access_token: 'token',
};

describe('AuthForm', () => {
  let mockAuth: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuth = {
      signInWithOtp: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    };

    const mockClient = {
      auth: mockAuth,
    };

    mockCreateClient.mockReturnValue(mockClient);
  });

  describe('Component Rendering', () => {
    it('renders the authentication form with default elements', () => {
      render(<AuthForm />);

      expect(screen.getByText('Welcome to ScrumKit')).toBeInTheDocument();
      expect(screen.getByText('Sign in to save your boards and collaborate with your team')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Magic Link' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Password' })).toBeInTheDocument();
      expect(screen.getByText('continue as guest')).toBeInTheDocument();
    });

    it('renders magic link form by default', () => {
      render(<AuthForm />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('switches to password tab when clicked', async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      const passwordTab = screen.getByRole('tab', { name: 'Password' });
      await user.click(passwordTab);

      expect(screen.getByRole('tab', { name: 'Sign In' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Sign Up' })).toBeInTheDocument();
    });

    it('switches between sign in and sign up forms', async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      // Switch to password tab
      await user.click(screen.getByRole('tab', { name: 'Password' }));

      // Should show sign in by default
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

      // Switch to sign up
      await user.click(screen.getByRole('tab', { name: 'Sign Up' }));
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  describe('Magic Link Authentication', () => {
    it('sends magic link successfully', async () => {
      mockAuth.signInWithOtp.mockResolvedValue({ error: null });
      const user = userEvent.setup();

      render(<AuthForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send magic link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      expect(mockAuth.signInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'http://localhost/auth/confirm?redirectTo=%2Fretro',
        },
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Check your email',
        description: "We've sent you a magic link to sign in.",
      });
    });

    it('handles magic link errors', async () => {
      mockAuth.signInWithOtp.mockRejectedValue(new Error('Invalid email'));
      const user = userEvent.setup();

      render(<AuthForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send magic link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Invalid email',
          variant: 'destructive',
        });
      });
    });

    it('shows success screen after magic link sent', async () => {
      mockAuth.signInWithOtp.mockResolvedValue({ error: null });
      const user = userEvent.setup();

      render(<AuthForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send magic link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Check your email')).toBeInTheDocument();
        expect(screen.getByText(/test@example\.com/)).toBeInTheDocument();
        expect(screen.getByText('Try a different email')).toBeInTheDocument();
      });
    });

    it('uses custom redirectTo in magic link', async () => {
      mockAuth.signInWithOtp.mockResolvedValue({ error: null });
      const user = userEvent.setup();

      render(<AuthForm redirectTo="/custom" />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send magic link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      expect(mockAuth.signInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'http://localhost/auth/confirm?redirectTo=%2Fcustom',
        },
      });
    });
  });

  describe('Email/Password Sign In', () => {
    it('signs in successfully with email and password', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });
      const user = userEvent.setup();

      render(<AuthForm />);

      // Switch to password tab
      await user.click(screen.getByRole('tab', { name: 'Password' }));

      const emailInput = document.getElementById('signin-email') as HTMLInputElement;
      const passwordInput = document.getElementById('signin-password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: "You've been signed in successfully.",
      });

      expect(mockPush).toHaveBeenCalledWith('/retro');
      expect(mockRefresh).toHaveBeenCalled();
    });

    it('handles sign in errors', async () => {
      mockAuth.signInWithPassword.mockRejectedValue(new Error('Invalid credentials'));
      const user = userEvent.setup();

      render(<AuthForm />);

      // Switch to password tab
      await user.click(screen.getByRole('tab', { name: 'Password' }));

      const emailInput = document.getElementById('signin-email') as HTMLInputElement;
      const passwordInput = document.getElementById('signin-password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Invalid credentials',
          variant: 'destructive',
        });
      });
    });

    it('navigates to custom redirect after sign in', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });
      const user = userEvent.setup();

      render(<AuthForm redirectTo="/dashboard" />);

      // Switch to password tab
      await user.click(screen.getByRole('tab', { name: 'Password' }));

      const emailInput = document.getElementById('signin-email') as HTMLInputElement;
      const passwordInput = document.getElementById('signin-password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Email/Password Sign Up', () => {
    it('signs up successfully with email, password, and full name', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });
      const user = userEvent.setup();

      render(<AuthForm />);

      // Switch to password tab and sign up
      await user.click(screen.getByRole('tab', { name: 'Password' }));
      await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

      const fullNameInput = document.getElementById('signup-name') as HTMLInputElement;
      const emailInput = document.getElementById('signup-email') as HTMLInputElement;
      const passwordInput = document.getElementById('signup-password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await user.type(fullNameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'John Doe',
          },
          emailRedirectTo: 'http://localhost/auth/confirm?redirectTo=%2Fretro',
        },
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Check your email',
        description: "We've sent you a confirmation link to complete your sign up.",
      });
    });

    it('handles sign up errors', async () => {
      mockAuth.signUp.mockRejectedValue(new Error('User already registered'));
      const user = userEvent.setup();

      render(<AuthForm />);

      // Switch to password tab and sign up
      await user.click(screen.getByRole('tab', { name: 'Password' }));
      await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

      const fullNameInput = document.getElementById('signup-name') as HTMLInputElement;
      const emailInput = document.getElementById('signup-email') as HTMLInputElement;
      const passwordInput = document.getElementById('signup-password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await user.type(fullNameInput, 'John Doe');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'User already registered',
          variant: 'destructive',
        });
      });
    });
  });

  describe('Guest Access', () => {
    it('navigates to default redirect when continuing as guest', async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      const guestButton = screen.getByText('continue as guest');
      await user.click(guestButton);

      expect(mockPush).toHaveBeenCalledWith('/retro');
    });

    it('navigates to custom redirect when continuing as guest', async () => {
      const user = userEvent.setup();
      render(<AuthForm redirectTo="/custom-path" />);

      const guestButton = screen.getByText('continue as guest');
      await user.click(guestButton);

      expect(mockPush).toHaveBeenCalledWith('/custom-path');
    });
  });

  describe('Form Validation', () => {
    it('enforces minimum password length on sign up', async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      // Switch to password tab and sign up
      await user.click(screen.getByRole('tab', { name: 'Password' }));
      await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

      const passwordInput = document.getElementById('signup-password');
      expect(passwordInput).toHaveAttribute('minLength', '6');
    });
  });

  describe('Component State Management', () => {
    it('maintains email state across tab switches', async () => {
      const user = userEvent.setup();
      render(<AuthForm />);

      // Enter email in magic link tab
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      // Switch to password tab
      await user.click(screen.getByRole('tab', { name: 'Password' }));

      // Email should be preserved
      const passwordTabEmailInput = screen.getByLabelText(/email/i);
      expect(passwordTabEmailInput).toHaveValue('test@example.com');
    });

    it('resets state when returning from success screen', async () => {
      mockAuth.signInWithOtp.mockResolvedValue({ error: null });
      const user = userEvent.setup();

      render(<AuthForm />);

      // Send magic link
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send magic link/i }));

      // Wait for success screen and return
      await waitFor(() => {
        expect(screen.getByText('Try a different email')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Try a different email'));

      // Email should be cleared
      const newEmailInput = screen.getByLabelText(/email/i);
      expect(newEmailInput).toHaveValue('');
    });
  });
});