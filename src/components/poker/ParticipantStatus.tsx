"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, Clock, Users, Eye } from "lucide-react";
import { useSessionParticipants } from "@/hooks/use-poker-participants";
import { useStoryVotes } from "@/hooks/use-poker-votes";
import type { PokerStory } from "@/lib/poker/types";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface ParticipantStatusProps {
  story: PokerStory;
  sessionId: string;
}

interface ParticipantPresence {
  [key: string]: {
    online_at: string;
  };
}

export function ParticipantStatus({ story, sessionId }: ParticipantStatusProps) {
  const { data: participants = [], isLoading: loadingParticipants } = useSessionParticipants(sessionId);
  const { data: votes = [], isLoading: loadingVotes } = useStoryVotes(story.id);
  const [presenceState, setPresenceState] = useState<ParticipantPresence>({});

  // Supabase Presence for tracking online participants
  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel;

    const setupPresence = async () => {
      channel = supabase.channel(`poker-session:${sessionId}`, {
        config: {
          presence: {
            key: sessionId,
          },
        },
      });

      // Subscribe to presence changes
      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          setPresenceState(state as ParticipantPresence);
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          console.log("Participant joined:", key, newPresences);
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          console.log("Participant left:", key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            // Track this user's presence
            await channel.track({
              online_at: new Date().toISOString(),
            });
          }
        });
    };

    setupPresence();

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [sessionId]);

  // Calculate vote statistics
  const votingParticipants = participants.filter(p => !p.is_observer);
  const observerParticipants = participants.filter(p => p.is_observer);
  const votedParticipantIds = new Set(votes.map(v => v.participant_id));

  const votedCount = votingParticipants.filter(p => votedParticipantIds.has(p.id)).length;
  const waitingCount = votingParticipants.length - votedCount;
  const waitingParticipants = votingParticipants.filter(p => !votedParticipantIds.has(p.id));

  // Get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if participant is online via presence
  const isOnline = (participantId: string): boolean => {
    return Object.keys(presenceState).length > 0;
  };

  if (loadingParticipants || loadingVotes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Loading participants...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Participants
            </CardTitle>
            <CardDescription>
              {votedCount} of {votingParticipants.length} participants have voted
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-lg px-3 py-1",
              votedCount === votingParticipants.length && votingParticipants.length > 0
                ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400"
                : "bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-700 dark:text-amber-400"
            )}
          >
            {votedCount} / {votingParticipants.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Waiting for indicator */}
        {waitingCount > 0 && story.status === "voting" && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Waiting for {waitingCount} {waitingCount === 1 ? "participant" : "participants"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {waitingParticipants.map(participant => (
                <Badge
                  key={participant.id}
                  variant="outline"
                  className="text-xs bg-white dark:bg-slate-800"
                >
                  {participant.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* All ready indicator */}
        {votedCount === votingParticipants.length && votingParticipants.length > 0 && story.status === "voting" && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm font-medium text-green-900 dark:text-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              All participants have voted! Ready to reveal.
            </p>
          </div>
        )}

        {/* Voting Participants List */}
        {votingParticipants.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">
              Voters ({votingParticipants.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {votingParticipants.map(participant => {
                const hasVoted = votedParticipantIds.has(participant.id);
                const online = isOnline(participant.id);

                return (
                  <div
                    key={participant.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                      hasVoted
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={cn(
                          "text-sm font-semibold",
                          hasVoted
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        )}>
                          {getInitials(participant.name)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online indicator */}
                      {online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate text-slate-900 dark:text-slate-100">
                          {participant.name}
                        </p>
                        {participant.is_facilitator && (
                          <Badge variant="secondary" className="text-xs">
                            Host
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      {hasVoted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Observers List */}
        {observerParticipants.length > 0 && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Observers ({observerParticipants.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {observerParticipants.map(participant => {
                const online = isOnline(participant.id);

                return (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                          {getInitials(participant.name)}
                        </AvatarFallback>
                      </Avatar>
                      {online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-slate-900 dark:text-slate-100">
                        {participant.name}
                      </p>
                    </div>
                    <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {participants.length === 0 && (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No participants have joined yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
