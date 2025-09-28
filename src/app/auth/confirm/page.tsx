"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AuthConfirmPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const handleAuthConfirmation = async () => {
      try {
        // Get the token hash from the URL
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        const redirectTo = searchParams.get("redirectTo") || "/retro";

        if (!token_hash || !type) {
          throw new Error("Invalid confirmation link");
        }

        // Verify the OTP token
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as "email",
        });

        if (error) throw error;

        setStatus("success");

        // Redirect after a short delay
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 2000);
      } catch (error) {
        console.error("Auth confirmation error:", error);
        setStatus("error");
        setErrorMessage((error as Error).message || "Failed to confirm authentication");
      }
    };

    handleAuthConfirmation();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {status === "loading" && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <CardTitle>Confirming your sign in</CardTitle>
              <CardDescription>
                Please wait while we verify your authentication...
              </CardDescription>
            </CardHeader>
          </>
        )}

        {status === "success" && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle>Success!</CardTitle>
              <CardDescription>
                You&apos;ve been successfully signed in. Redirecting...
              </CardDescription>
            </CardHeader>
          </>
        )}

        {status === "error" && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Verification Failed</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(errorMessage.toLowerCase().includes("expired") || errorMessage.toLowerCase().includes("invalid")) && (
                <p className="text-sm text-center text-muted-foreground">
                  Your verification link has expired or is invalid. Request a new one below.
                </p>
              )}
              <div className="space-y-2">
                <Button
                  onClick={() => router.push("/auth/verify-email")}
                  className="w-full"
                >
                  Resend Verification Email
                </Button>
                <Button
                  onClick={() => router.push("/auth")}
                  variant="outline"
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}