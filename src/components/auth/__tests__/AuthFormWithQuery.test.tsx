/**
 * Jest unit tests for AuthFormWithQuery.tsx
 * Tests password confirmation validation functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthFormWithQuery } from '../AuthFormWithQuery';
import { useSignIn, useSignUp, useSignInWithProvider } from '@/hooks/use-auth-query';
import { useRouter } from 'next/navigation';

// Mock the hooks
jest.mock('@/hooks/use-auth-query');
jest.mock('next/navigation');

const mockUseSignIn = useSignIn as jest.MockedFunction<typeof useSignIn>;
const mockUseSignUp = useSignUp as jest.MockedFunction<typeof useSignUp>;
const mockUseSignInWithProvider = useSignInWithProvider as jest.MockedFunction<typeof useSignInWithProvider>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('AuthFormWithQuery - Password Confirmation', () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    } as any);

    mockUseSignIn.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    mockUseSignUp.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    mockUseSignInWithProvider.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
  });

  describe('Password Confirmation Field', () => {
    it('should render password confirmation field on signup tab', async () => {
      const user = userEvent.setup();
      render(<AuthFormWithQuery />);

      await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<AuthFormWithQuery />);

      await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

      const password = document.getElementById('signup-password') as HTMLInputElement;
      const confirmPassword = document.getElementById('signup-confirm-password') as HTMLInputElement;

      await user.type(password, 'password123');
      await user.type(confirmPassword, 'differentpassword');

      // Trigger validation by blurring the confirm password field
      confirmPassword.blur();

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should not show error when passwords match', async () => {
      const user = userEvent.setup();
      render(<AuthFormWithQuery />);

      await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

      const password = document.getElementById('signup-password') as HTMLInputElement;
      const confirmPassword = document.getElementById('signup-confirm-password') as HTMLInputElement;

      await user.type(password, 'password123');
      await user.type(confirmPassword, 'password123');

      confirmPassword.blur();

      await waitFor(() => {
        expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
      });
    });

    it('should prevent form submission when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<AuthFormWithQuery />);

      await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

      const name = document.getElementById('signup-name') as HTMLInputElement;
      const email = document.getElementById('signup-email') as HTMLInputElement;
      const password = document.getElementById('signup-password') as HTMLInputElement;
      const confirmPassword = document.getElementById('signup-confirm-password') as HTMLInputElement;

      await user.type(name, 'Test User');
      await user.type(email, 'test@example.com');
      await user.type(password, 'password123');
      await user.type(confirmPassword, 'wrongpassword');

      confirmPassword.blur();

      const submitButton = screen.getByRole('button', { name: /create account/i });

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      await user.click(submitButton);

      // Should not call the mutation
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('should allow form submission when passwords match', async () => {
      mockMutateAsync.mockResolvedValue({});
      const user = userEvent.setup();
      render(<AuthFormWithQuery />);

      await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

      const name = document.getElementById('signup-name') as HTMLInputElement;
      const email = document.getElementById('signup-email') as HTMLInputElement;
      const password = document.getElementById('signup-password') as HTMLInputElement;
      const confirmPassword = document.getElementById('signup-confirm-password') as HTMLInputElement;

      await user.type(name, 'Test User');
      await user.type(email, 'test@example.com');
      await user.type(password, 'password123');
      await user.type(confirmPassword, 'password123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User',
        });
      });
    });

    it('should clear error when user corrects confirm password', async () => {
      const user = userEvent.setup();
      render(<AuthFormWithQuery />);

      await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

      const password = document.getElementById('signup-password') as HTMLInputElement;
      const confirmPassword = document.getElementById('signup-confirm-password') as HTMLInputElement;

      await user.type(password, 'password123');
      await user.type(confirmPassword, 'wrongpassword');
      confirmPassword.blur();

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });

      // Clear and retype correct password
      await user.clear(confirmPassword);
      await user.type(confirmPassword, 'password123');
      confirmPassword.blur();

      await waitFor(() => {
        expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
      });
    });

    it('should have proper accessibility attributes when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<AuthFormWithQuery />);

      await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

      const password = document.getElementById('signup-password') as HTMLInputElement;
      const confirmPassword = document.getElementById('signup-confirm-password') as HTMLInputElement;

      await user.type(password, 'password123');
      await user.type(confirmPassword, 'wrongpassword');
      confirmPassword.blur();

      await waitFor(() => {
        expect(confirmPassword).toHaveAttribute('aria-invalid', 'true');
        expect(confirmPassword).toHaveAttribute('aria-describedby', 'password-error');

        const errorMessage = screen.getByText('Passwords do not match');
        expect(errorMessage).toHaveAttribute('role', 'alert');
        expect(errorMessage).toHaveAttribute('id', 'password-error');
      });
    });

    it('should clear both password fields on duplicate email error', async () => {
      const duplicateError = new Error('User already registered');
      (duplicateError as any).message = 'User already registered';

      mockMutateAsync.mockRejectedValue(duplicateError);

      const user = userEvent.setup();
      render(<AuthFormWithQuery />);

      await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

      const name = document.getElementById('signup-name') as HTMLInputElement;
      const email = document.getElementById('signup-email') as HTMLInputElement;
      const password = document.getElementById('signup-password') as HTMLInputElement;
      const confirmPassword = document.getElementById('signup-confirm-password') as HTMLInputElement;

      await user.type(name, 'Test User');
      await user.type(email, 'existing@example.com');
      await user.type(password, 'password123');
      await user.type(confirmPassword, 'password123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(password).toHaveValue('');
        expect(confirmPassword).toHaveValue('');
      });
    });
  });
});
