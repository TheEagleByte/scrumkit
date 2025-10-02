"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, User, Bell, Palette, Shield, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showAuth={true} />
        <div className="flex items-center justify-center h-[calc(100vh-6rem)] pt-24">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth?redirectTo=/settings");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showAuth={true} />
      <div className="container max-w-4xl mx-auto px-4 py-8 pt-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application preferences and account settings
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Profile Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Update your profile picture, name, and other personal details
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/profile")}
                    className="w-full sm:w-auto"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Go to Profile
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Email Preferences</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage how you receive updates and communications
                  </p>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="marketing-emails" className="flex flex-col cursor-pointer">
                        <span>Marketing emails</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          Receive updates about new features
                        </span>
                      </Label>
                      <Switch id="marketing-emails" disabled />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="weekly-digest" className="flex flex-col cursor-pointer">
                        <span>Weekly digest</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          Summary of your team&apos;s activity
                        </span>
                      </Label>
                      <Switch id="weekly-digest" disabled />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">
                    Note: Email preferences will be available in a future update
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications" className="flex flex-col cursor-pointer">
                      <span>Email notifications</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Receive notifications via email
                      </span>
                    </Label>
                    <Switch id="email-notifications" disabled />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="inapp-notifications" className="flex flex-col cursor-pointer">
                      <span>In-app notifications</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Show notifications in the app
                      </span>
                    </Label>
                    <Switch id="inapp-notifications" disabled />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Label htmlFor="board-updates" className="flex flex-col cursor-pointer">
                      <span>Board updates</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        When items are added to boards
                      </span>
                    </Label>
                    <Switch id="board-updates" disabled />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="vote-reminders" className="flex flex-col cursor-pointer">
                      <span>Vote reminders</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Reminders to vote on retrospectives
                      </span>
                    </Label>
                    <Switch id="vote-reminders" disabled />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="poker-notifications" className="flex flex-col cursor-pointer">
                      <span>Planning poker updates</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Session invites and vote reveals
                      </span>
                    </Label>
                    <Switch id="poker-notifications" disabled />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground pt-2">
                  Note: Notification settings will be available in a future update
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize how the application looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color theme
                  </p>
                  <div className="pt-2">
                    <ThemeToggle />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Display</h3>
                  <p className="text-sm text-muted-foreground">
                    Additional display preferences
                  </p>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="compact-mode" className="flex flex-col cursor-pointer">
                        <span>Compact mode</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          Reduce spacing and padding
                        </span>
                      </Label>
                      <Switch id="compact-mode" disabled />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animations" className="flex flex-col cursor-pointer">
                        <span>Animations</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          Enable interface animations
                        </span>
                      </Label>
                      <Switch id="animations" disabled />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">
                    Note: Additional display settings will be available in a future update
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>
                  Manage your privacy settings and data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Data Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Control your data and privacy settings
                  </p>
                  <div className="space-y-3 pt-2">
                    <Button variant="outline" disabled className="w-full sm:w-auto">
                      Export My Data
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Download all your data in a portable format
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Privacy Controls</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage who can see your activity
                  </p>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="profile-visibility" className="flex flex-col cursor-pointer">
                        <span>Public profile</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          Allow others to see your profile
                        </span>
                      </Label>
                      <Switch id="profile-visibility" disabled />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="activity-tracking" className="flex flex-col cursor-pointer">
                        <span>Activity tracking</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          Track your usage for analytics
                        </span>
                      </Label>
                      <Switch id="activity-tracking" disabled />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">
                    Note: Privacy controls will be available in a future update
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Sessions</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your active sessions
                  </p>
                  <div className="pt-2">
                    <Button variant="outline" disabled className="w-full sm:w-auto">
                      View Active Sessions
                    </Button>
                    <p className="text-xs text-muted-foreground pt-2">
                      Note: Session management will be available in a future update
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
