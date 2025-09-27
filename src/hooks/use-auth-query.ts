"use client";

import { useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { User, AuthError } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types-enhanced";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

// Query keys factory
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  session: () => [...authKeys.all, "session"] as const,
  profile: (userId?: string) => [...authKeys.all, "profile", userId] as const,
};

// Get current user
export function useUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error);
        return null;
      }

      return user;
    },
    staleTime: 5 * 60 * 1000, // Consider user data fresh for 5 minutes
  });
}

// Get current session
export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error);
        return null;
      }

      return session;
    },
    staleTime: 5 * 60 * 1000, // Consider session data fresh for 5 minutes
  });
}

// Get user profile
export function useProfile(userId?: string) {
  const { data: currentUser } = useUser();
  const profileUserId = userId || currentUser?.id;

  return useQuery({
    queryKey: authKeys.profile(profileUserId),
    queryFn: async () => {
      if (!profileUserId) return null;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileUserId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data;
    },
    enabled: !!profileUserId,
    staleTime: 5 * 60 * 1000, // Consider profile data fresh for 5 minutes
  });
}

// Sign in with email and password
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password
    }: {
      email: string;
      password: string;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      toast.success("Signed in successfully!");
    },
    onError: (error: AuthError) => {
      toast.error(error.message || "Failed to sign in");
    },
  });
}

// Sign up with email and password
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      fullName
    }: {
      email: string;
      password: string;
      fullName?: string;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      toast.success("Account created! Please check your email to verify your account.");
    },
    onError: (error: AuthError) => {
      toast.error(error.message || "Failed to sign up");
    },
  });
}

// Sign out
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.all });
      // Also clear boards and other user data
      queryClient.removeQueries({ queryKey: ["boards"] });
      queryClient.removeQueries({ queryKey: ["retrospectives"] });
      toast.success("Signed out successfully");
    },
    onError: (error: AuthError) => {
      toast.error(error.message || "Failed to sign out");
    },
  });
}

// Update user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async ({
      fullName,
      avatarUrl
    }: {
      fullName?: string;
      avatarUrl?: string;
    }) => {
      if (!user) throw new Error("No user logged in");

      const supabase = createClient();

      const updates: ProfileInsert = {
        id: user.id,
        email: user.email!,
        updated_at: new Date().toISOString(),
        ...(fullName !== undefined && { full_name: fullName }),
        ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
      };

      const { data, error } = await supabase
        .from("profiles")
        .upsert(updates)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (updates) => {
      if (!user) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: authKeys.profile(user.id) });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<Profile>(
        authKeys.profile(user.id)
      );

      // Optimistically update
      if (previousProfile) {
        queryClient.setQueryData<Profile>(
          authKeys.profile(user.id),
          {
            ...previousProfile,
            ...updates,
            updated_at: new Date().toISOString(),
          }
        );
      }

      return { previousProfile };
    },
    onError: (err, updates, context) => {
      // Rollback on error
      if (context?.previousProfile && user) {
        queryClient.setQueryData(
          authKeys.profile(user.id),
          context.previousProfile
        );
      }
      toast.error("Failed to update profile");
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onSettled: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: authKeys.profile(user.id) });
      }
    },
  });
}

// Reset password
export function useResetPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Password reset email sent! Check your inbox.");
    },
    onError: (error: AuthError) => {
      toast.error(error.message || "Failed to send reset email");
    },
  });
}

// Update password
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Password updated successfully");
    },
    onError: (error: AuthError) => {
      toast.error(error.message || "Failed to update password");
    },
  });
}

// Sign in with OAuth provider
export function useSignInWithProvider() {
  return useMutation({
    mutationFn: async (provider: "google" | "github") => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    },
    onError: (error: AuthError) => {
      toast.error(error.message || `Failed to sign in with provider`);
    },
  });
}

// Listen to auth state changes
export function useAuthStateChange(
  callback?: (user: User | null) => void
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Update cached user data
        if (session?.user) {
          queryClient.setQueryData(authKeys.user(), session.user);
          queryClient.setQueryData(authKeys.session(), session);
        } else {
          queryClient.setQueryData(authKeys.user(), null);
          queryClient.setQueryData(authKeys.session(), null);
        }

        // Invalidate all queries on auth change
        queryClient.invalidateQueries({ queryKey: authKeys.all });

        // Call callback if provided
        if (callback) {
          callback(session?.user || null);
        }

        // Handle specific auth events
        switch (event) {
          case "SIGNED_IN":
            toast.success("Welcome back!");
            break;
          case "SIGNED_OUT":
            // Clear all cached data
            queryClient.clear();
            break;
          case "TOKEN_REFRESHED":
            // Silently refresh queries
            queryClient.invalidateQueries({ queryKey: authKeys.all });
            break;
          case "USER_UPDATED":
            // Refetch user profile
            if (session?.user) {
              queryClient.invalidateQueries({
                queryKey: authKeys.profile(session.user.id)
              });
            }
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, callback]);
}

// Check if user has a specific role
// Note: Profile doesn't have a role field in current schema
// export function useHasRole(role: string) {
//   const { data: profile } = useProfile();
//
//   return {
//     hasRole: profile?.role === role,
//     isLoading: !profile,
//   };
// }

// Check if user is authenticated
export function useIsAuthenticated() {
  const { data: user, isLoading } = useUser();

  return {
    isAuthenticated: !!user,
    isLoading,
  };
}