"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ProfileUpdate } from "@/lib/supabase/types-enhanced";

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchProfile = useCallback(async (id?: string) => {
    if (!id && !userId) {
      setError(new Error("No user ID provided"));
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id || userId!)
        .single();

      if (fetchError) throw fetchError;

      setProfile(data as Profile);
      return data as Profile;
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(async (
    updates: ProfileUpdate,
    id?: string
  ) => {
    if (!id && !userId) {
      setError(new Error("No user ID provided"));
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id || userId!)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(data as Profile);
      return data as Profile;
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const uploadAvatar = useCallback(async (
    file: File,
    id?: string
  ) => {
    if (!id && !userId) {
      setError(new Error("No user ID provided"));
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${id || userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update the profile with the new avatar URL
      const updatedProfile = await updateProfile(
        { avatar_url: publicUrl },
        id
      );

      return updatedProfile;
    } catch (err) {
      console.error("Error uploading avatar:", err);
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, updateProfile]);

  const deleteAvatar = useCallback(async (id?: string) => {
    if (!id && !userId) {
      setError(new Error("No user ID provided"));
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current profile to get avatar URL
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", id || userId!)
        .single();

      if (currentProfile?.avatar_url) {
        // Extract file path from URL
        const url = new URL(currentProfile.avatar_url);
        const filePath = url.pathname.split("/").slice(-2).join("/");

        // Delete from storage
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove([filePath]);

        if (deleteError) {
          console.warn("Failed to delete avatar file:", deleteError);
        }
      }

      // Update profile to remove avatar URL
      const updatedProfile = await updateProfile(
        { avatar_url: null },
        id
      );

      return updatedProfile;
    } catch (err) {
      console.error("Error deleting avatar:", err);
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, updateProfile]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
  };
}