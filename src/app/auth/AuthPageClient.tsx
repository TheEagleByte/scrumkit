"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AuthFormWithQuery } from "@/components/auth/AuthFormWithQuery";
import InteractiveAnimatedLogo from "@/components/InteractiveAnimatedLogo";

/**
 * Client-side wrapper for the auth page that handles confirmation toast notifications
 */
export function AuthPageClient({ redirectTo }: { redirectTo?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Check if user just confirmed their email
    const confirmed = searchParams.get("confirmed");

    if (confirmed === "true") {
      // Show success toast
      toast.success("Email confirmed successfully!", {
        description: "You can now sign in to your account.",
      });

      // Clear the URL parameter after showing the toast
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
      <div className="relative z-10">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <InteractiveAnimatedLogo
              size={64}
              playOnMount={true}
              enableHover={true}
              sessionKey="auth-logo-animated"
              className="drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">ScrumKit</h1>
          <p className="text-muted-foreground">
            Sign in to unlock all features
          </p>
        </div>
        <AuthFormWithQuery redirectTo={redirectTo} />
        <div className="mt-6 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            continue as guest
          </Link>
        </div>
      </div>
    </div>
  );
}
