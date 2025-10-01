"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { useDeletePokerSession, useEndPokerSession, useArchivePokerSession } from "@/hooks/use-poker-session";
import type { PokerSession } from "@/lib/poker/types";
import { getSequenceByType } from "@/lib/poker/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Play,
  Archive,
  Trash2,
  MoreVertical,
  Clock,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface PokerSessionListProps {
  sessions: PokerSession[];
  showArchived?: boolean;
}

export function PokerSessionList({ sessions, showArchived = false }: PokerSessionListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const deleteSession = useDeletePokerSession();
  const endSession = useEndPokerSession();
  const archiveSession = useArchivePokerSession();

  const handleDelete = async () => {
    if (!sessionToDelete) return;
    await deleteSession.mutateAsync(sessionToDelete);
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  const handleEndSession = async (uniqueUrl: string) => {
    await endSession.mutateAsync(uniqueUrl);
  };

  const handleArchiveSession = async (uniqueUrl: string) => {
    await archiveSession.mutateAsync(uniqueUrl);
  };

  if (sessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {showArchived ? "No archived sessions" : "No active sessions"}
        </h3>
        <p className="text-muted-foreground mb-6">
          {showArchived
            ? "Archived sessions will appear here"
            : "Create your first planning poker session to get started"}
        </p>
        {!showArchived && (
          <Link href="/poker/new">
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Create Session
            </Button>
          </Link>
        )}
      </motion.div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session, index) => {
          const sequence = getSequenceByType(session.estimation_sequence);
          const isActive = session.status === "active";
          const isEnded = session.status === "ended";

          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200 h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{session.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {session.description || "No description"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/poker/${session.unique_url}`}>
                            Open Session
                          </Link>
                        </DropdownMenuItem>
                        {isActive && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEndSession(session.unique_url)}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              End Session
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleArchiveSession(session.unique_url)}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSessionToDelete(session.unique_url);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-3">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isActive ? "default" : isEnded ? "secondary" : "outline"}
                        className={
                          isActive
                            ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                            : ""
                        }
                      >
                        {isActive ? (
                          <>
                            <Play className="mr-1 h-3 w-3" />
                            Active
                          </>
                        ) : isEnded ? (
                          <>
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Ended
                          </>
                        ) : (
                          <>
                            <Archive className="mr-1 h-3 w-3" />
                            Archived
                          </>
                        )}
                      </Badge>
                    </div>

                    {/* Estimation Sequence */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>{sequence.name}</span>
                    </div>

                    {/* Session Settings */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {session.auto_reveal && (
                        <Badge variant="outline" className="font-normal">
                          Auto-reveal
                        </Badge>
                      )}
                      {session.allow_revote && (
                        <Badge variant="outline" className="font-normal">
                          Revoting
                        </Badge>
                      )}
                      {!session.show_voter_names && (
                        <Badge variant="outline" className="font-normal">
                          Anonymous
                        </Badge>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        Created {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t">
                  <Link href={`/poker/${session.unique_url}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      {isActive ? "Join Session" : "View Session"}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Poker Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The session and all its stories and votes
              will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSessionToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
