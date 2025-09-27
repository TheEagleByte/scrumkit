import { notFound } from "next/navigation";
import { RetrospectiveBoardWrapper } from "@/components/RetrospectiveBoardWrapper";
import { getUserFromServer, getProfileFromServer } from "@/lib/supabase/auth";
import { getBoard } from "@/lib/boards/actions";

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

  // Use a non-null assertion since we know board exists after the check above
  // TypeScript has issues with control flow analysis after notFound()
  const validBoard = board!;

  // Get user info
  const user = await getUserFromServer();
  const profile = user ? await getProfileFromServer() : null;

  // Create authenticated user object if logged in
  const authenticatedUser = user && profile
    ? {
        id: user.id,
        name: profile.full_name || user.email?.split("@")[0] || "User",
        email: user.email,
        avatar: profile.avatar_url || undefined,
      }
    : undefined;

  return (
    <main className="bg-background grid-pattern min-h-screen">
      <RetrospectiveBoardWrapper
        retrospectiveId={validBoard.id}
        authenticatedUser={authenticatedUser}
        teamName={validBoard.team?.name || "Anonymous Board"}
        sprintName={validBoard.title || "Untitled Retrospective"}
      />
    </main>
  );
}