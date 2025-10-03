"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSignIn, useSignUp, useSignInWithProvider } from "@/hooks/use-auth-query";
import { Loader2, ArrowRight, Github } from "lucide-react";
import { useRouter } from "next/navigation";
import { isDuplicateEmailError } from "@/lib/utils/auth-utils";
import { useClaimAssets } from "@/hooks/use-claim-assets";

/**
 * Props for the AuthFormWithQuery component
 */
interface AuthFormWithQueryProps {
  /** The URL to redirect to after successful authentication */
  redirectTo?: string;
}

/**
 * Authentication form component with TanStack Query integration
 *
 * Provides both sign-in and sign-up functionality with:
 * - Email/password authentication
 * - OAuth providers (Google, GitHub)
 * - Duplicate email detection with auto-switch to sign-in
 * - Password clearing on duplicate email errors
 * - Toast notifications for user feedback
 *
 * @param props - Component props
 * @returns React component
 */
export function AuthFormWithQuery({ redirectTo = "/dashboard" }: AuthFormWithQueryProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [activeTab, setActiveTab] = useState<string>("signin");
  const [passwordError, setPasswordError] = useState("");

  const router = useRouter();

  // Use TanStack Query mutations
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const signInWithProviderMutation = useSignInWithProvider();
  const claimAssetsMutation = useClaimAssets();

  /**
   * Handle email/password sign-in form submission
   * @param e - Form submission event
   */
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await signInMutation.mutateAsync({ email, password });

      // Claim anonymous assets after successful sign in
      if (result.user?.id) {
        try {
          await claimAssetsMutation.mutateAsync(result.user.id);
        } catch (claimError) {
          // Don't block sign in if claiming fails
          console.error("Failed to claim assets on sign in:", claimError);
        }
      }

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  /**
   * Validate that password and confirm password match
   * @returns true if passwords match, false otherwise
   */
  const validatePasswords = () => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  /**
   * Handle email/password sign-up form submission
   *
   * If a duplicate email is detected:
   * - Clears the password field for security
   * - Auto-switches to the Sign In tab
   * - Pre-fills the email field for user convenience
   *
   * @param e - Form submission event
   */
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match before submitting
    if (!validatePasswords()) {
      return;
    }

    try {
      const result = await signUpMutation.mutateAsync({
        email,
        password,
        fullName
      });

      // Claim anonymous assets after successful signup
      if (result.user?.id) {
        try {
          await claimAssetsMutation.mutateAsync(result.user.id);
        } catch (claimError) {
          // Don't block signup if claiming fails
          console.error("Failed to claim assets on signup:", claimError);
        }
      }
    } catch (error) {
      // Check if this is a duplicate email error using shared utility
      if (isDuplicateEmailError(error)) {
        // Clear password fields for security
        setPassword("");
        setConfirmPassword("");

        // Auto-switch to Sign In tab and keep email pre-filled
        setActiveTab("signin");
      }
    }
  };

  /**
   * Handle OAuth provider sign-in
   * @param provider - The OAuth provider to use (google or github)
   */
  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      await signInWithProviderMutation.mutateAsync(provider);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isLoading = signInMutation.isPending || signUpMutation.isPending ||
                   signInWithProviderMutation.isPending || claimAssetsMutation.isPending;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Welcome</CardTitle>
        <CardDescription>
          Sign in to your account or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Sign In Tab */}
          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {signInMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignIn("github")}
                disabled={isLoading}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={validatePasswords}
                  required
                  disabled={isLoading}
                  aria-invalid={passwordError ? "true" : "false"}
                  aria-describedby={passwordError ? "password-error" : undefined}
                />
                {passwordError && (
                  <p id="password-error" className="text-sm text-destructive" role="alert">
                    {passwordError}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !!passwordError}
              >
                {signUpMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-center text-muted-foreground w-full">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 underline"
          >
            Privacy Policy
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}