"use client";

import { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface EmailVerificationBannerProps {
  user: User | null;
  onResendEmail: () => void;
  isResending?: boolean;
}

/**
 * Banner component that displays a verification reminder for unverified users.
 * Shows prominently at the top of protected pages until the user verifies their email.
 *
 * Features:
 * - Only shows for users with unverified email addresses
 * - Dismissible per session (reappears on page refresh)
 * - Includes button to resend verification email
 * - Styled with orange/warning colors for visibility
 *
 * @param user - The current authenticated user
 * @param onResendEmail - Callback to resend verification email
 * @param isResending - Loading state for resend action
 */
export function EmailVerificationBanner({
  user,
  onResendEmail,
  isResending = false,
}: EmailVerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if no user, user is verified, or banner is dismissed
  if (!user || user.email_confirmed_at || dismissed) {
    return null;
  }

  return (
    <Alert
      variant="default"
      className="mb-6 border-l-4 border-orange-500 bg-orange-500/10"
    >
      <Mail className="h-4 w-4 text-orange-500" />
      <AlertTitle className="text-orange-500">
        Verify your email address
      </AlertTitle>
      <AlertDescription>
        <p className="text-sm text-orange-400/90 mb-3">
          We sent a verification link to <strong>{user.email}</strong>. Please
          check your inbox and click the link to verify your account.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={onResendEmail}
            disabled={isResending}
            className="border-orange-500/50 text-orange-400 hover:bg-orange-500/20"
          >
            {isResending ? "Sending..." : "Resend verification email"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="text-orange-400/70 hover:text-orange-400 hover:bg-orange-500/10"
          >
            <X className="h-4 w-4 mr-1" />
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
