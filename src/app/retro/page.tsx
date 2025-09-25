import { RetrospectiveBoardRealtime } from "@/components/RetrospectiveBoardRealtime";
import { getUserFromServer, getProfileFromServer } from "@/lib/supabase/auth";
import { v4 as uuidv4 } from "uuid";

// Force dynamic rendering since we need to check auth status
export const dynamic = 'force-dynamic';

// Generate anonymous user data
function generateAnonymousUser() {
  const adjectives = ["Happy", "Clever", "Brave", "Calm", "Eager", "Gentle", "Kind", "Lively"];
  const animals = ["Panda", "Eagle", "Tiger", "Dolphin", "Fox", "Owl", "Wolf", "Bear"];
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

  return {
    id: `anon-${uuidv4()}`,
    name: `${randomAdj} ${randomAnimal}`,
    email: undefined,
    avatar: undefined,
  };
}

export default async function RetroPage() {
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
    : generateAnonymousUser();

  // For now, use a static retrospective ID
  // In a real app, this would come from URL params or be created dynamically
  const retrospectiveId = "default-retro";

  return (
    <main className="bg-background grid-pattern min-h-screen">
      <RetrospectiveBoardRealtime
        retrospectiveId={retrospectiveId}
        currentUser={boardUser}
        teamName="Development Team"
        sprintName="Current Sprint"
      />
    </main>
  );
}