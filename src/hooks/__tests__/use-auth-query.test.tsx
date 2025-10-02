import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSignUp } from "../use-auth-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// Mock dependencies
jest.mock("@/lib/supabase/client");
jest.mock("sonner");
jest.mock("@/lib/utils/auth-utils", () => ({
  isDuplicateEmailError: (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    const lowerMessage = message.toLowerCase();
    return lowerMessage.includes('already') ||
           lowerMessage.includes('registered') ||
           lowerMessage.includes('exists');
  }
}));

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockToast = toast as jest.Mocked<typeof toast>;

/**
 * Test suite for authentication query hooks
 */
describe("use-auth-query hooks", () => {
  let queryClient: QueryClient;
  let mockSupabase: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    // Setup Supabase mock
    mockSupabase = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        getUser: jest.fn(),
        getSession: jest.fn(),
      },
      from: jest.fn(),
    };

    mockCreateClient.mockReturnValue(mockSupabase);
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("useSignUp", () => {
    it("should handle duplicate email error", async () => {
      const duplicateError = new Error("User already registered");
      (duplicateError as any).status = 400;

      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: duplicateError,
      });

      const { result } = renderHook(() => useSignUp(), { wrapper });

      try {
        await result.current.mutateAsync({
          email: "existing@example.com",
          password: "password123",
          fullName: "Test User",
        });
      } catch (error: any) {
        expect(error.message).toContain("already registered");
      }

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        "Account already exists",
        expect.objectContaining({
          description: "Please sign in instead or use a different email.",
        })
      );
    });

    it("should handle 'already exists' error message", async () => {
      const existsError = new Error("Email address already exists");
      (existsError as any).status = 400;

      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: existsError,
      });

      const { result } = renderHook(() => useSignUp(), { wrapper });

      try {
        await result.current.mutateAsync({
          email: "existing@example.com",
          password: "password123",
          fullName: "Test User",
        });
      } catch (error: any) {
        expect(error.message).toContain("already exists");
      }

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          "Account already exists",
          expect.objectContaining({
            description: "Please sign in instead or use a different email.",
          })
        );
      });
    });

    it("should handle other signup errors normally", async () => {
      const genericError = new Error("Invalid password format");
      (genericError as any).status = 400;

      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: genericError,
      });

      const { result } = renderHook(() => useSignUp(), { wrapper });

      try {
        await result.current.mutateAsync({
          email: "test@example.com",
          password: "weak",
          fullName: "Test User",
        });
      } catch (error: any) {
        expect(error.message).toContain("Invalid password format");
      }

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Invalid password format");
      });
    });

    it("should successfully sign up with valid credentials", async () => {
      const successData = {
        user: {
          id: "user-123",
          email: "newuser@example.com",
        },
        session: null,
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: successData,
        error: null,
      });

      const { result } = renderHook(() => useSignUp(), { wrapper });

      await result.current.mutateAsync({
        email: "newuser@example.com",
        password: "password123",
        fullName: "New User",
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        "Account created! Please check your email to verify your account."
      );
    });

    it("should invalidate queries after successful signup", async () => {
      const successData = {
        user: {
          id: "user-123",
          email: "newuser@example.com",
        },
        session: null,
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: successData,
        error: null,
      });

      const { result } = renderHook(() => useSignUp(), { wrapper });

      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      await result.current.mutateAsync({
        email: "newuser@example.com",
        password: "password123",
        fullName: "New User",
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["auth"],
      });
    });

    it("should detect duplicate with case-insensitive matching", async () => {
      const duplicateError = new Error("This email ALREADY has an account");
      (duplicateError as any).status = 400;

      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: duplicateError,
      });

      const { result } = renderHook(() => useSignUp(), { wrapper });

      try {
        await result.current.mutateAsync({
          email: "EXISTING@EXAMPLE.COM",
          password: "password123",
          fullName: "Test User",
        });
      } catch (error) {
        // Error expected
      }

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          "Account already exists",
          expect.objectContaining({
            description: "Please sign in instead or use a different email.",
          })
        );
      });
    });
  });
});
