import { redirect } from "next/navigation";
import { getUserFromServer } from "@/lib/supabase/auth";
import { AuthForm } from "@/components/auth/AuthForm";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string };
}) {
  const user = await getUserFromServer();

  // If user is already logged in, redirect them
  if (user) {
    redirect(searchParams.redirectTo || "/retro");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
      <div className="relative z-10">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl" />
          </div>
          <h1 className="text-3xl font-bold mb-2">ScrumKit</h1>
          <p className="text-muted-foreground">
            Sign in to unlock all features
          </p>
        </div>
        <AuthForm redirectTo={searchParams.redirectTo} />
      </div>
    </div>
  );
}