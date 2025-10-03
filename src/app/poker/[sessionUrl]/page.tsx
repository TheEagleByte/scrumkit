import { notFound } from "next/navigation";
import { getPokerSession } from "@/lib/poker/actions";
import { Header } from "@/components/layout/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Settings, ArrowLeft } from "lucide-react";
import { getSequenceByType } from "@/lib/poker/utils";
import { format } from "date-fns";
import { StoryManager } from "@/components/poker/StoryManager";
import { SessionSummary } from "@/components/poker/SessionSummary";
import { ExportButton } from "@/components/poker/ExportButton";
import Link from "next/link";

export default async function PokerSessionPage({
  params,
}: {
  params: Promise<{ sessionUrl: string }>;
}) {
  const { sessionUrl } = await params;

  // Fetch the poker session
  const session = await getPokerSession(sessionUrl);

  if (!session) {
    notFound();
  }

  const sequence = getSequenceByType(
    session.estimation_sequence,
    session.custom_sequence ?? undefined
  );

  return (
    <main className="bg-background grid-pattern min-h-screen">
      <Header showAuth={true} />

      <div className="container mx-auto max-w-7xl px-4 py-8 pt-24">
        {/* Session Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <Link href="/poker" data-testid="back-to-poker">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back to Sessions</span>
                  </Button>
                </Link>
                <TrendingUp className="h-8 w-8 text-indigo-500" />
                <h1 className="text-4xl font-bold">{session.title}</h1>
              </div>
              {session.description && (
                <p className="text-muted-foreground mt-2 text-lg ml-[120px] sm:ml-[160px]">
                  {session.description}
                </p>
              )}
            </div>
            <ExportButton session={session} />
          </div>
        </div>

        {/* Session Info Cards - Stack on mobile for better readability */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={session.status === "active" ? "default" : "secondary"}
                className={
                  session.status === "active"
                    ? "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400"
                    : ""
                }
              >
                {session.status.charAt(0).toUpperCase() +
                  session.status.slice(1)}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Estimation Sequence
              </CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sequence.name}</div>
              <p className="text-muted-foreground mt-1 text-xs">
                {sequence.values.join(", ")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
              <Calendar className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {format(new Date(session.created_at), "MMM d, yyyy")}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {format(new Date(session.created_at), "h:mm a")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Session Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Session Settings
            </CardTitle>
            <CardDescription>
              Configuration for this planning poker session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${session.auto_reveal ? "bg-green-500" : "bg-gray-300"}`}
                />
                <span className="text-sm">Auto-reveal votes</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${session.allow_revote ? "bg-green-500" : "bg-gray-300"}`}
                />
                <span className="text-sm">Allow revoting</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${session.show_voter_names ? "bg-green-500" : "bg-gray-300"}`}
                />
                <span className="text-sm">Show voter names</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Statistics */}
        <div className="mb-8">
          <SessionSummary sessionId={session.id} />
        </div>

        {/* Story Management */}
        <StoryManager session={session} />
      </div>
    </main>
  );
}
