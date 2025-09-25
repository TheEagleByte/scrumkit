"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types-enhanced";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if Supabase environment variables are available
  const hasSupabaseConfig = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Only create client if we have the required config
  const supabase = hasSupabaseConfig ? createClient() : null;

  useEffect(() => {
    // If no Supabase client, just set loading to false and return
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);

          // Fetch user profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", initialSession.user.id)
            .single();

          if (profileData) {
            setProfile(profileData as Profile);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        // Fetch updated profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentSession.user.id)
          .single();

        if (profileData) {
          setProfile(profileData as Profile);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    if (!supabase) throw new Error("Supabase client not initialized");

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!supabase) throw new Error("Supabase client not initialized");
    if (!user) throw new Error("No user logged in");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    setProfile(data as Profile);
    return data;
  };

  return {
    user,
    session,
    profile,
    isLoading,
    signOut,
    updateProfile,
  };
}