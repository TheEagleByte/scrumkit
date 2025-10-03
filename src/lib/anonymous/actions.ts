"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { AssetCollection, ClaimResult } from "./asset-claiming";
import { ASSET_CONFIG } from "./asset-claiming";

/**
 * Claim anonymous assets and associate them with a user account
 *
 * This server action:
 * 1. Validates that the user owns the assets (via cookies)
 * 2. Updates the database to associate assets with the user's profile
 * 3. Sets is_anonymous to false for all claimed assets
 * 4. Returns the count of successfully claimed assets
 *
 * @param userId - The user's profile ID
 * @param assets - Collection of asset IDs to claim
 * @returns Result containing counts of claimed assets by type
 */
export async function claimAnonymousAssets(
  userId: string,
  assets: AssetCollection
): Promise<ClaimResult> {
  const supabase = await createClient();
  const cookieStore = await cookies();

  const result: ClaimResult = {
    retrospectives: 0,
    pokerSessions: 0,
    total: 0,
  };

  try {
    // Claim retrospectives
    if (assets.retrospectives.length > 0) {
      const retroCount = await claimRetrospectives(
        supabase,
        cookieStore,
        userId,
        assets.retrospectives
      );
      result.retrospectives = retroCount;
      result.total += retroCount;
    }

    // Claim poker sessions
    if (assets.pokerSessions.length > 0) {
      const pokerCount = await claimPokerSessions(
        supabase,
        cookieStore,
        userId,
        assets.pokerSessions
      );
      result.pokerSessions = pokerCount;
      result.total += pokerCount;
    }

    return result;
  } catch (error) {
    console.error("Error claiming anonymous assets:", error);
    throw new Error("Failed to claim anonymous assets");
  }
}

/**
 * Claim retrospective boards
 *
 * @param supabase - Supabase client
 * @param cookieStore - Cookie store
 * @param userId - User's profile ID
 * @param boardIds - Array of board IDs to claim
 * @returns Number of successfully claimed boards
 */
async function claimRetrospectives(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  userId: string,
  boardIds: string[]
): Promise<number> {
  const config = ASSET_CONFIG.retrospective;

  // Get board URLs from cookies to validate ownership
  const boardsList = cookieStore.get(config.cookieKey)?.value;
  if (!boardsList) {
    return 0;
  }

  let boardUrls: string[] = [];
  try {
    boardUrls = JSON.parse(boardsList);
  } catch {
    return 0;
  }

  // Get boards from database that match both the IDs and URLs
  const { data: boards, error: fetchError } = await supabase
    .from("retrospectives")
    .select("id, unique_url, creator_cookie")
    .in("id", boardIds)
    .in("unique_url", boardUrls)
    .eq("is_anonymous", true);

  if (fetchError || !boards || boards.length === 0) {
    console.error("Error fetching boards to claim:", fetchError);
    return 0;
  }

  // Update boards to be owned by the user
  const { error: updateError } = await supabase
    .from("retrospectives")
    .update({
      created_by: userId,
      is_anonymous: false,
      updated_at: new Date().toISOString(),
    })
    .in(
      "id",
      boards.map((b) => b.id)
    );

  if (updateError) {
    console.error("Error updating boards:", updateError);
    throw updateError;
  }

  return boards.length;
}

/**
 * Claim poker sessions
 *
 * @param supabase - Supabase client
 * @param cookieStore - Cookie store
 * @param userId - User's profile ID
 * @param sessionIds - Array of session IDs to claim
 * @returns Number of successfully claimed sessions
 */
async function claimPokerSessions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  userId: string,
  sessionIds: string[]
): Promise<number> {
  const config = ASSET_CONFIG.poker_session;

  // Get session URLs from cookies to validate ownership
  const sessionsList = cookieStore.get(config.cookieKey)?.value;
  if (!sessionsList) {
    return 0;
  }

  let sessionUrls: string[] = [];
  try {
    sessionUrls = JSON.parse(sessionsList);
  } catch {
    return 0;
  }

  // Get sessions from database that match both the IDs and URLs
  const { data: sessions, error: fetchError } = await supabase
    .from("poker_sessions")
    .select("id, unique_url, creator_cookie")
    .in("id", sessionIds)
    .in("unique_url", sessionUrls)
    .eq("is_anonymous", true);

  if (fetchError || !sessions || sessions.length === 0) {
    console.error("Error fetching poker sessions to claim:", fetchError);
    return 0;
  }

  // Update sessions to be owned by the user
  const { error: updateError } = await supabase
    .from("poker_sessions")
    .update({
      created_by: userId,
      is_anonymous: false,
      updated_at: new Date().toISOString(),
    })
    .in(
      "id",
      sessions.map((s) => s.id)
    );

  if (updateError) {
    console.error("Error updating poker sessions:", updateError);
    throw updateError;
  }

  return sessions.length;
}

/**
 * Get anonymous board IDs from cookies
 *
 * This is a helper for testing and validation purposes.
 *
 * @returns Array of board URLs stored in cookies
 */
export async function getAnonymousBoardsFromCookies(): Promise<string[]> {
  const cookieStore = await cookies();
  const config = ASSET_CONFIG.retrospective;
  const boardsList = cookieStore.get(config.cookieKey)?.value;

  if (!boardsList) {
    return [];
  }

  try {
    const urls = JSON.parse(boardsList);
    return Array.isArray(urls) ? urls : [];
  } catch {
    return [];
  }
}

/**
 * Get anonymous poker session IDs from cookies
 *
 * This is a helper for testing and validation purposes.
 *
 * @returns Array of session URLs stored in cookies
 */
export async function getAnonymousPokerSessionsFromCookies(): Promise<
  string[]
> {
  const cookieStore = await cookies();
  const config = ASSET_CONFIG.poker_session;
  const sessionsList = cookieStore.get(config.cookieKey)?.value;

  if (!sessionsList) {
    return [];
  }

  try {
    const urls = JSON.parse(sessionsList);
    return Array.isArray(urls) ? urls : [];
  } catch {
    return [];
  }
}
