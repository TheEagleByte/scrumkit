"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { generateSessionUrl, DEFAULT_SESSION_SETTINGS } from "./utils";
import type {
  CreatePokerSessionInput,
  UpdatePokerSessionInput,
  PokerSession,
  CreatePokerParticipantInput,
  PokerParticipant,
  CreatePokerStoryInput,
  UpdatePokerStoryInput,
  PokerStory,
} from "./types";

// Create a new poker session
export async function createPokerSession(input: CreatePokerSessionInput) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Get or create creator cookie
  let creatorCookie = cookieStore.get("scrumkit_poker_creator")?.value;
  if (!creatorCookie) {
    creatorCookie = `poker_creator_${generateSessionUrl()}_${Date.now()}`;
    cookieStore.set("scrumkit_poker_creator", creatorCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
  }

  // Merge settings with defaults
  const settings = {
    ...DEFAULT_SESSION_SETTINGS,
    ...input.settings,
  };

  // Create the poker session
  const { data: session, error: sessionError } = await supabase
    .from("poker_sessions")
    .insert({
      title: input.title,
      description: input.description,
      team_id: input.teamId || null,
      unique_url: "", // Will be set by trigger
      creator_cookie: creatorCookie,
      is_anonymous: !input.teamId, // Anonymous if no team
      estimation_sequence: settings.estimationSequence,
      custom_sequence: settings.customSequence
        ? JSON.parse(JSON.stringify(settings.customSequence))
        : null,
      auto_reveal: settings.autoReveal,
      allow_revote: settings.allowRevote,
      show_voter_names: settings.showVoterNames,
      status: "active",
    })
    .select()
    .single();

  if (sessionError || !session) {
    console.error("Error creating poker session:", sessionError);
    throw new Error("Failed to create poker session");
  }

  // Add session to user's cookie list
  if (!input.teamId) {
    const sessionsList = cookieStore.get("scrumkit_poker_sessions")?.value;
    let sessions: string[] = [];
    if (sessionsList) {
      try {
        sessions = JSON.parse(sessionsList);
      } catch {
        // Reset corrupted cookie
        sessions = [];
      }
    }
    sessions.unshift(session.unique_url);
    // Keep only last 20 sessions
    const recentSessions = sessions.slice(0, 20);

    cookieStore.set("scrumkit_poker_sessions", JSON.stringify(recentSessions), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }

  revalidatePath("/poker");

  return {
    id: session.id,
    unique_url: session.unique_url,
    title: session.title,
  };
}

// Get a poker session by URL
export async function getPokerSession(uniqueUrl: string): Promise<PokerSession | null> {
  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from("poker_sessions")
    .select("*")
    .eq("unique_url", uniqueUrl)
    .eq("is_deleted", false)
    .single();

  if (error || !session) {
    console.error("Error fetching poker session:", error);
    return null;
  }

  return session as PokerSession;
}

// Get user's poker sessions
export async function getUserPokerSessions(): Promise<PokerSession[]> {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Get user's sessions from cookies
  const sessionsList = cookieStore.get("scrumkit_poker_sessions")?.value;
  let sessionUrls: string[] = [];
  if (sessionsList) {
    try {
      sessionUrls = JSON.parse(sessionsList);
    } catch {
      // Reset corrupted cookie
      sessionUrls = [];
    }
  }

  if (sessionUrls.length === 0) {
    return [];
  }

  // Fetch sessions data
  const { data: sessions, error } = await supabase
    .from("poker_sessions")
    .select("*")
    .in("unique_url", sessionUrls)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user poker sessions:", error);
    return [];
  }

  return (sessions as PokerSession[]) || [];
}

// Update a poker session
export async function updatePokerSession(
  uniqueUrl: string,
  updates: UpdatePokerSessionInput
) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Check if user has permission (via creator_cookie)
  const creatorCookie = cookieStore.get("scrumkit_poker_creator")?.value;

  const { data: session, error: fetchError } = await supabase
    .from("poker_sessions")
    .select("creator_cookie, team_id")
    .eq("unique_url", uniqueUrl)
    .single();

  if (fetchError || !session) {
    throw new Error("Poker session not found");
  }

  // Check permission
  if (session.team_id) {
    // For team sessions, would need auth check
    throw new Error("Cannot update team poker sessions anonymously");
  } else if (session.creator_cookie !== creatorCookie) {
    throw new Error("You don't have permission to update this poker session");
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.status !== undefined) {
    updateData.status = updates.status;
    if (updates.status === 'ended') {
      updateData.ended_at = new Date().toISOString();
    }
  }
  if (updates.currentStoryId !== undefined) updateData.current_story_id = updates.currentStoryId;

  // Handle settings updates
  if (updates.settings) {
    if (updates.settings.estimationSequence !== undefined) {
      updateData.estimation_sequence = updates.settings.estimationSequence;
    }
    if (updates.settings.customSequence !== undefined) {
      updateData.custom_sequence = JSON.parse(JSON.stringify(updates.settings.customSequence));
    }
    if (updates.settings.autoReveal !== undefined) {
      updateData.auto_reveal = updates.settings.autoReveal;
    }
    if (updates.settings.allowRevote !== undefined) {
      updateData.allow_revote = updates.settings.allowRevote;
    }
    if (updates.settings.showVoterNames !== undefined) {
      updateData.show_voter_names = updates.settings.showVoterNames;
    }
  }

  const { error: updateError } = await supabase
    .from("poker_sessions")
    .update(updateData)
    .eq("unique_url", uniqueUrl);

  if (updateError) {
    console.error("Error updating poker session:", updateError);
    throw new Error("Failed to update poker session");
  }

  revalidatePath(`/poker/${uniqueUrl}`);
  revalidatePath("/poker");
}

// End a poker session
export async function endPokerSession(uniqueUrl: string) {
  return updatePokerSession(uniqueUrl, { status: "ended" });
}

// Archive a poker session
export async function archivePokerSession(uniqueUrl: string) {
  return updatePokerSession(uniqueUrl, { status: "archived" });
}

// Delete a poker session (soft delete)
export async function deletePokerSession(uniqueUrl: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Check if user has permission (via creator_cookie)
  const creatorCookie = cookieStore.get("scrumkit_poker_creator")?.value;

  const { data: session, error: fetchError } = await supabase
    .from("poker_sessions")
    .select("creator_cookie, team_id")
    .eq("unique_url", uniqueUrl)
    .single();

  if (fetchError || !session) {
    throw new Error("Poker session not found");
  }

  // Check permission
  if (session.team_id) {
    throw new Error("Cannot delete team poker sessions anonymously");
  } else if (session.creator_cookie !== creatorCookie) {
    throw new Error("You don't have permission to delete this poker session");
  }

  // Soft delete the session
  const { error: deleteError } = await supabase
    .from("poker_sessions")
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq("unique_url", uniqueUrl);

  if (deleteError) {
    console.error("Error deleting poker session:", deleteError);
    throw new Error("Failed to delete poker session");
  }

  // Remove from user's cookie list
  const sessionsList = cookieStore.get("scrumkit_poker_sessions")?.value;
  let sessions: string[] = [];
  if (sessionsList) {
    try {
      sessions = JSON.parse(sessionsList);
    } catch {
      // Reset corrupted cookie
      sessions = [];
    }
  }
  const filtered = sessions.filter((url: string) => url !== uniqueUrl);

  cookieStore.set("scrumkit_poker_sessions", JSON.stringify(filtered), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  revalidatePath("/poker");
}

// Join a poker session as a participant
export async function joinPokerSession(
  sessionId: string,
  input: CreatePokerParticipantInput
): Promise<PokerParticipant> {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Get or create participant cookie
  let participantCookie = cookieStore.get("scrumkit_poker_participant")?.value;
  if (!participantCookie) {
    participantCookie = `poker_participant_${generateSessionUrl()}_${Date.now()}`;
    cookieStore.set("scrumkit_poker_participant", participantCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
  }

  // Check if participant already exists
  const { data: existing } = await supabase
    .from("poker_participants")
    .select("*")
    .eq("session_id", sessionId)
    .eq("participant_cookie", participantCookie)
    .single();

  if (existing) {
    // Update last_seen_at
    const { data: updated, error: updateError } = await supabase
      .from("poker_participants")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating participant:", updateError);
      throw new Error("Failed to rejoin session");
    }

    return updated as PokerParticipant;
  }

  // Create new participant
  const { data: participant, error: participantError } = await supabase
    .from("poker_participants")
    .insert({
      session_id: sessionId,
      name: input.name,
      avatar_url: input.avatar_url,
      is_facilitator: input.is_facilitator || false,
      is_observer: input.is_observer || false,
      participant_cookie: participantCookie,
    })
    .select()
    .single();

  if (participantError || !participant) {
    console.error("Error creating participant:", participantError);
    throw new Error("Failed to join poker session");
  }

  return participant as PokerParticipant;
}

// Get participants for a session
export async function getSessionParticipants(sessionId: string): Promise<PokerParticipant[]> {
  const supabase = await createClient();

  const { data: participants, error } = await supabase
    .from("poker_participants")
    .select("*")
    .eq("session_id", sessionId)
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("Error fetching participants:", error);
    return [];
  }

  return (participants as PokerParticipant[]) || [];
}

// ===========================
// Story Management Actions
// ===========================

// Create a new story
export async function createPokerStory(input: CreatePokerStoryInput): Promise<PokerStory> {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Check if user has permission (via creator_cookie for anonymous sessions)
  const creatorCookie = cookieStore.get("scrumkit_poker_creator")?.value;

  // Fetch the session to verify permissions
  const { data: session, error: sessionError } = await supabase
    .from("poker_sessions")
    .select("creator_cookie, team_id, id, unique_url")
    .eq("id", input.sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error("Poker session not found");
  }

  // Check permission for anonymous sessions
  if (!session.team_id && session.creator_cookie !== creatorCookie) {
    throw new Error("You don't have permission to add stories to this session");
  }

  // Get the max display order
  const { data: maxOrderStory } = await supabase
    .from("poker_stories")
    .select("display_order")
    .eq("session_id", input.sessionId)
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const displayOrder = input.display_order ?? (maxOrderStory?.display_order ?? 0) + 1;

  // Create the story
  const { data: story, error: storyError } = await supabase
    .from("poker_stories")
    .insert({
      session_id: input.sessionId,
      title: input.title,
      description: input.description,
      acceptance_criteria: input.acceptance_criteria,
      external_link: input.external_link,
      display_order: displayOrder,
      status: "pending",
    })
    .select()
    .single();

  if (storyError || !story) {
    console.error("Error creating poker story:", storyError);
    throw new Error("Failed to create poker story");
  }

  // If this is the first story, set it as current
  const { count } = await supabase
    .from("poker_stories")
    .select("*", { count: "exact", head: true })
    .eq("session_id", input.sessionId);

  if (count === 1 && !session.team_id) {
    // Update session to set current story
    await supabase
      .from("poker_sessions")
      .update({ current_story_id: story.id })
      .eq("id", input.sessionId);
  }

  revalidatePath(`/poker/${session.unique_url}`);

  return story as PokerStory;
}

// Get all stories for a session
export async function getSessionStories(sessionId: string): Promise<PokerStory[]> {
  const supabase = await createClient();

  const { data: stories, error } = await supabase
    .from("poker_stories")
    .select("*")
    .eq("session_id", sessionId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching poker stories:", error);
    return [];
  }

  return (stories as PokerStory[]) || [];
}

// Update a story
export async function updatePokerStory(
  storyId: string,
  updates: UpdatePokerStoryInput
): Promise<void> {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Check if user has permission (via creator_cookie)
  const creatorCookie = cookieStore.get("scrumkit_poker_creator")?.value;

  // Get the story's session to check permissions
  const { data: story, error: fetchError } = await supabase
    .from("poker_stories")
    .select("session_id, poker_sessions!inner(creator_cookie, team_id, unique_url)")
    .eq("id", storyId)
    .single();

  if (fetchError || !story) {
    throw new Error("Poker story not found");
  }

  const session = story.poker_sessions as unknown as {
    creator_cookie: string;
    team_id: string | null;
    unique_url: string;
  };

  // Check permission for anonymous sessions
  if (!session.team_id && session.creator_cookie !== creatorCookie) {
    throw new Error("You don't have permission to update this story");
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.acceptance_criteria !== undefined) updateData.acceptance_criteria = updates.acceptance_criteria;
  if (updates.external_link !== undefined) updateData.external_link = updates.external_link;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.final_estimate !== undefined) updateData.final_estimate = updates.final_estimate;
  if (updates.display_order !== undefined) updateData.display_order = updates.display_order;

  const { error: updateError } = await supabase
    .from("poker_stories")
    .update(updateData)
    .eq("id", storyId);

  if (updateError) {
    console.error("Error updating poker story:", updateError);
    throw new Error("Failed to update poker story");
  }

  revalidatePath(`/poker/${session.unique_url}`);
  revalidatePath("/poker");
}

// Delete a story
export async function deletePokerStory(storyId: string): Promise<void> {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Check if user has permission (via creator_cookie)
  const creatorCookie = cookieStore.get("scrumkit_poker_creator")?.value;

  // Get the story's session to check permissions
  const { data: story, error: fetchError } = await supabase
    .from("poker_stories")
    .select("session_id, poker_sessions!inner(creator_cookie, team_id, current_story_id, unique_url)")
    .eq("id", storyId)
    .single();

  if (fetchError || !story) {
    throw new Error("Poker story not found");
  }

  const session = story.poker_sessions as unknown as {
    creator_cookie: string;
    team_id: string | null;
    current_story_id: string | null;
    unique_url: string;
  };

  // Check permission for anonymous sessions
  if (!session.team_id && session.creator_cookie !== creatorCookie) {
    throw new Error("You don't have permission to delete this story");
  }

  // If this was the current story, clear it
  if (session.current_story_id === storyId) {
    await supabase
      .from("poker_sessions")
      .update({ current_story_id: null })
      .eq("id", story.session_id);
  }

  // Delete the story
  const { error: deleteError } = await supabase
    .from("poker_stories")
    .delete()
    .eq("id", storyId);

  if (deleteError) {
    console.error("Error deleting poker story:", deleteError);
    throw new Error("Failed to delete poker story");
  }

  revalidatePath(`/poker/${session.unique_url}`);
  revalidatePath("/poker");
}

// Reorder stories
export async function reorderStories(
  sessionId: string,
  storyOrders: { id: string; display_order: number }[]
): Promise<void> {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Check if user has permission (via creator_cookie)
  const creatorCookie = cookieStore.get("scrumkit_poker_creator")?.value;

  const { data: session, error: sessionError } = await supabase
    .from("poker_sessions")
    .select("creator_cookie, team_id, unique_url")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error("Poker session not found");
  }

  // Check permission for anonymous sessions
  if (!session.team_id && session.creator_cookie !== creatorCookie) {
    throw new Error("You don't have permission to reorder stories");
  }

  // Update each story's display_order
  const updatePromises = storyOrders.map(({ id, display_order }) =>
    supabase
      .from("poker_stories")
      .update({ display_order })
      .eq("id", id)
  );

  const results = await Promise.all(updatePromises);
  const errors = results.filter(r => r.error);

  if (errors.length > 0) {
    console.error("Error reordering stories:", errors);
    throw new Error("Failed to reorder stories");
  }

  revalidatePath(`/poker/${session.unique_url}`);
  revalidatePath("/poker");
}

// Set current story
export async function setCurrentStory(
  sessionId: string,
  storyId: string | null
): Promise<void> {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Check if user has permission (via creator_cookie)
  const creatorCookie = cookieStore.get("scrumkit_poker_creator")?.value;

  const { data: session, error: sessionError } = await supabase
    .from("poker_sessions")
    .select("creator_cookie, team_id, unique_url")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error("Poker session not found");
  }

  // Check permission for anonymous sessions
  if (!session.team_id && session.creator_cookie !== creatorCookie) {
    throw new Error("You don't have permission to change the current story");
  }

  // Update session
  const { error: updateError } = await supabase
    .from("poker_sessions")
    .update({ current_story_id: storyId })
    .eq("id", sessionId);

  if (updateError) {
    console.error("Error setting current story:", updateError);
    throw new Error("Failed to set current story");
  }

  revalidatePath(`/poker/${session.unique_url}`);
  revalidatePath("/poker");
}

// Bulk import stories from array
export async function bulkImportStories(
  sessionId: string,
  stories: Omit<CreatePokerStoryInput, "sessionId">[]
): Promise<PokerStory[]> {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Check if user has permission (via creator_cookie)
  const creatorCookie = cookieStore.get("scrumkit_poker_creator")?.value;

  const { data: session, error: sessionError } = await supabase
    .from("poker_sessions")
    .select("creator_cookie, team_id, id, unique_url")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error("Poker session not found");
  }

  // Check permission for anonymous sessions
  if (!session.team_id && session.creator_cookie !== creatorCookie) {
    throw new Error("You don't have permission to add stories to this session");
  }

  // Get the max display order
  const { data: maxOrderStory } = await supabase
    .from("poker_stories")
    .select("display_order")
    .eq("session_id", sessionId)
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrderStory?.display_order ?? 0) + 1;

  // Prepare story inserts
  const storyInserts = stories.map((story, index) => ({
    session_id: sessionId,
    title: story.title,
    description: story.description || null,
    acceptance_criteria: story.acceptance_criteria || null,
    external_link: story.external_link || null,
    display_order: story.display_order ?? nextOrder + index,
    status: "pending" as const,
  }));

  // Insert all stories
  const { data: insertedStories, error: insertError } = await supabase
    .from("poker_stories")
    .insert(storyInserts)
    .select();

  if (insertError || !insertedStories) {
    console.error("Error bulk importing stories:", insertError);
    throw new Error("Failed to import stories");
  }

  // If session has no current story and stories were added, set the first as current
  const { data: currentSession } = await supabase
    .from("poker_sessions")
    .select("current_story_id")
    .eq("id", sessionId)
    .single();

  if (!currentSession?.current_story_id && insertedStories.length > 0) {
    await supabase
      .from("poker_sessions")
      .update({ current_story_id: insertedStories[0].id })
      .eq("id", sessionId);
  }

  revalidatePath(`/poker/${session.unique_url}`);
  revalidatePath("/poker");

  return insertedStories as PokerStory[];
}
