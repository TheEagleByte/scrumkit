import { notFound } from "next/navigation";
import { RetrospectiveBoardRealtime } from "@/components/RetrospectiveBoardRealtime";
import { getUserFromServer, getProfileFromServer } from "@/lib/supabase/auth";
import { getBoard } from "@/lib/boards/actions";
import { generateAnonymousUserName } from "@/lib/boards/utils";
import { v4 as uuidv4 } from "uuid";

export default async function RetroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch the board data
  const board = await getBoard(id);

  if (!board) {
    notFound();
  }

  // Get user info
  const user = await getUserFromServer();
  const profile = user ? await getProfileFromServer() : null;

  // Create user object for the board
  const boardUser = user && profile
    ? {
        id: user.id,
        name: profile.full_name || user.email?.split("@")[0] || "User",
        email: user.email,
        avatar: profile.avatar_url || undefined,
      }
    : {
        id: `anon-${uuidv4()}`,
        name: generateAnonymousUserName(),
        email: undefined,
        avatar: undefined,
      };

  return (
    <main className="bg-background grid-pattern min-h-screen">
      <RetrospectiveBoardRealtime
        retrospectiveId={board.id}
        currentUser={boardUser}
        teamName={board.team?.name || "Anonymous Board"}
        sprintName={board.title || "Untitled Retrospective"}
      />
    </main>
  );
}