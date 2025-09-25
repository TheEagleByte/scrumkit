"use server";

import { createClient } from "@/lib/supabase/server";
import { getTemplateById, getDefaultTemplate } from "./templates";
import { generateBoardUrl, BoardSettings, defaultBoardSettings } from "./utils";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export interface CreateBoardInput {
  title: string;
  templateId?: string;
  settings?: BoardSettings;
  teamId?: string;
}

export interface BoardData {
  id: string;
  unique_url: string;
  title: string;
  template: string | null;
  settings: BoardSettings;
  voting_limit: number;
  is_anonymous: boolean;
  is_archived: boolean;
  is_deleted: boolean;
  creator_cookie: string | null;
  team_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function createBoard(input: CreateBoardInput) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Get or create creator cookie
  let creatorCookie = cookieStore.get("scrumkit_creator")?.value;
  if (!creatorCookie) {
    creatorCookie = `creator_${generateBoardUrl()}_${Date.now()}`;
    cookieStore.set("scrumkit_creator", creatorCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
  }

  // Get template
  const template = input.templateId
    ? getTemplateById(input.templateId)
    : getDefaultTemplate();

  if (!template) {
    throw new Error("Invalid template ID");
  }

  // Merge settings with defaults
  const settings = {
    ...defaultBoardSettings,
    ...input.settings,
  };

  // Create the retrospective
  const { data: retrospective, error: retroError } = await supabase
    .from("retrospectives")
    .insert({
      title: input.title || "Untitled Retrospective",
      template: template.id,
      settings,
      voting_limit: settings.votingLimit || 3,
      is_anonymous: !input.teamId,
      team_id: input.teamId || null,
      creator_cookie: !input.teamId ? creatorCookie : null,
      status: "active",
    })
    .select()
    .single();

  if (retroError || !retrospective) {
    console.error("Error creating retrospective:", retroError);
    throw new Error("Failed to create board");
  }

  // Create columns based on template
  const columns = template.columns.map((col) => ({
    retrospective_id: retrospective.id,
    column_type: col.column_type,
    title: col.title,
    description: col.description,
    color: col.color,
    display_order: col.display_order,
  }));

  const { error: columnsError } = await supabase
    .from("retrospective_columns")
    .insert(columns);

  if (columnsError) {
    console.error("Error creating columns:", columnsError);
    // Try to clean up the retrospective
    await supabase.from("retrospectives").delete().eq("id", retrospective.id);
    throw new Error("Failed to create board columns");
  }

  // Add board to user's cookie list
  if (!input.teamId) {
    const boardsList = cookieStore.get("scrumkit_boards")?.value;
    const boards = boardsList ? JSON.parse(boardsList) : [];
    boards.unshift(retrospective.unique_url);
    // Keep only last 20 boards
    const recentBoards = boards.slice(0, 20);

    cookieStore.set("scrumkit_boards", JSON.stringify(recentBoards), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }

  revalidatePath("/boards");

  return {
    id: retrospective.id,
    unique_url: retrospective.unique_url,
    title: retrospective.title,
  };
}

export async function getBoard(uniqueUrl: string) {
  const supabase = await createClient();

  const { data: board, error } = await supabase
    .from("retrospectives")
    .select(`
      *,
      retrospective_columns (
        id,
        column_type,
        title,
        description,
        color,
        display_order
      ),
      team:teams (
        id,
        name
      )
    `)
    .eq("unique_url", uniqueUrl)
    .eq("is_deleted", false)
    .single();

  if (error || !board) {
    console.error("Error fetching board:", error);
    return null;
  }

  return board;
}

export async function getUserBoards() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Get user's boards from cookies
  const boardsList = cookieStore.get("scrumkit_boards")?.value;
  const boardUrls = boardsList ? JSON.parse(boardsList) : [];

  if (boardUrls.length === 0) {
    return [];
  }

  // Fetch boards data
  const { data: boards, error } = await supabase
    .from("retrospectives")
    .select(`
      id,
      unique_url,
      title,
      template,
      is_archived,
      created_at,
      updated_at
    `)
    .in("unique_url", boardUrls)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user boards:", error);
    return [];
  }

  return boards || [];
}

export async function updateBoard(
  uniqueUrl: string,
  updates: Partial<{
    title: string;
    settings: BoardSettings;
    voting_limit: number;
    is_archived: boolean;
  }>
) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Check if user has permission (via creator_cookie)
  const creatorCookie = cookieStore.get("scrumkit_creator")?.value;

  const { data: board, error: fetchError } = await supabase
    .from("retrospectives")
    .select("creator_cookie, team_id")
    .eq("unique_url", uniqueUrl)
    .single();

  if (fetchError || !board) {
    throw new Error("Board not found");
  }

  // Check permission
  if (board.team_id) {
    // For team boards, check if user is a team member
    // This would require auth - for now, skip
    throw new Error("Cannot update team boards anonymously");
  } else if (board.creator_cookie !== creatorCookie) {
    throw new Error("You don't have permission to update this board");
  }

  // Update the board
  const { error: updateError } = await supabase
    .from("retrospectives")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("unique_url", uniqueUrl);

  if (updateError) {
    console.error("Error updating board:", updateError);
    throw new Error("Failed to update board");
  }

  revalidatePath(`/retro/${uniqueUrl}`);
  revalidatePath("/boards");
}

export async function deleteBoard(uniqueUrl: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Check if user has permission (via creator_cookie)
  const creatorCookie = cookieStore.get("scrumkit_creator")?.value;

  const { data: board, error: fetchError } = await supabase
    .from("retrospectives")
    .select("creator_cookie, team_id")
    .eq("unique_url", uniqueUrl)
    .single();

  if (fetchError || !board) {
    throw new Error("Board not found");
  }

  // Check permission
  if (board.team_id) {
    throw new Error("Cannot delete team boards anonymously");
  } else if (board.creator_cookie !== creatorCookie) {
    throw new Error("You don't have permission to delete this board");
  }

  // Soft delete the board
  const { error: deleteError } = await supabase
    .from("retrospectives")
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq("unique_url", uniqueUrl);

  if (deleteError) {
    console.error("Error deleting board:", deleteError);
    throw new Error("Failed to delete board");
  }

  // Remove from user's cookie list
  const boardsList = cookieStore.get("scrumkit_boards")?.value;
  const boards = boardsList ? JSON.parse(boardsList) : [];
  const filtered = boards.filter((url: string) => url !== uniqueUrl);

  cookieStore.set("scrumkit_boards", JSON.stringify(filtered), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  revalidatePath("/boards");
}

export async function cloneBoard(uniqueUrl: string, newTitle?: string) {
  const supabase = await createClient();

  // Fetch the original board
  const { data: original, error: fetchError } = await supabase
    .from("retrospectives")
    .select(`
      title,
      template,
      settings,
      voting_limit,
      retrospective_columns (
        column_type,
        title,
        description,
        color,
        display_order
      )
    `)
    .eq("unique_url", uniqueUrl)
    .eq("is_deleted", false)
    .single();

  if (fetchError || !original) {
    throw new Error("Board not found");
  }

  // Create a clone with the same settings
  const clonedBoard = await createBoard({
    title: newTitle || `${original.title} (Copy)`,
    templateId: original.template || "default",
    settings: original.settings as BoardSettings,
  });

  revalidatePath("/boards");

  return clonedBoard;
}