import { redirect } from "next/navigation";
import { getUserFromServer } from "@/lib/supabase/auth";
import { Suspense } from "react";
import { AuthPageClient } from "./AuthPageClient";

export default async function AuthPage(props: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const searchParams = await props.searchParams;
  const user = await getUserFromServer();

  // If user is already logged in, redirect them
  if (user) {
    redirect(searchParams.redirectTo || "/dashboard");
  }

  return (
    <Suspense fallback={null}>
      <AuthPageClient redirectTo={searchParams.redirectTo} />
    </Suspense>
  );
}