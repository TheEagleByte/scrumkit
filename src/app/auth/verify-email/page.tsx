"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.email) {
        throw new Error("No email found. Please sign up again.");
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Email sent",
        description: "Check your inbox for the verification link",
      });
    } catch (error) {
      toast({
        title: "Failed to send email",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            {emailSent ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <Mail className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to your email address. Please click it to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Didn&apos;t receive the email?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your spam folder</li>
              <li>Wait a few minutes and try again</li>
              <li>Make sure you entered the correct email</li>
            </ul>
          </div>
          <Button
            onClick={handleResendEmail}
            disabled={isResending || emailSent}
            className="w-full"
            variant="outline"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : emailSent ? (
              "Email Sent!"
            ) : (
              "Resend Verification Email"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}