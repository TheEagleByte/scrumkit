import { notFound } from "next/navigation";
import { getPokerSession } from "@/lib/poker/actions";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Settings, Users } from "lucide-react";
import { getSequenceByType } from "@/lib/poker/utils";
import { format } from "date-fns";

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
    session.custom_sequence ?? undefined,
  );

  return (
    <main className="min-h-screen bg-background grid-pattern">
      <Header showAuth={true} />

      <div className="container max-w-7xl mx-auto py-8 px-4 pt-24">
        {/* Session Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-8 w-8 text-indigo-500" />
            <h1 className="text-4xl font-bold">{session.title}</h1>
          </div>
          {session.description && (
            <p className="text-lg text-muted-foreground mt-2">{session.description}</p>
          )}
        </div>

        {/* Session Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={session.status === "active" ? "default" : "secondary"}
                className={
                  session.status === "active"
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                    : ""
                }
              >
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimation Sequence</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sequence.name}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {sequence.values.join(", ")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {format(new Date(session.created_at), "MMM d, yyyy")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${session.auto_reveal ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Auto-reveal votes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${session.allow_revote ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Allow revoting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${session.show_voter_names ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">Show voter names</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Session Features Coming Soon
            </CardTitle>
            <CardDescription>
              This is Story 1: Session Management. Additional features will be added in upcoming stories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Story/Ticket Management (Story 2)</li>
              <li>Voting Interface (Story 3)</li>
              <li>Real-time Voting Status (Story 4)</li>
              <li>Vote Reveal System (Story 5)</li>
              <li>Statistics & Analytics (Story 7)</li>
              <li>Timer & Discussion Tools (Story 8)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
