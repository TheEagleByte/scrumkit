"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { useUpdateBoard, useDeleteBoard } from "@/hooks/use-boards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  ExternalLink,
  Archive,
  ArchiveRestore,
  Trash2,
  Copy,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Board {
  id: string;
  unique_url: string;
  title: string;
  template: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface BoardListProps {
  boards: Board[];
  showArchived?: boolean;
  onArchiveStatusChange?: () => void;
}

export function BoardList({ boards, showArchived = false, onArchiveStatusChange }: BoardListProps) {
  const [loadingBoardId, setLoadingBoardId] = useState<string | null>(null);

  // Use TanStack Query mutations
  const updateBoardMutation = useUpdateBoard();
  const deleteBoardMutation = useDeleteBoard();

  async function handleArchive(board: Board) {
    setLoadingBoardId(board.unique_url);

    try {
      await updateBoardMutation.mutateAsync({
        uniqueUrl: board.unique_url,
        updates: { is_archived: !board.is_archived }
      });

      // Notify parent component about archive status change
      if (onArchiveStatusChange) {
        onArchiveStatusChange();
      }
    } finally {
      setLoadingBoardId(null);
    }
  }

  function handleDelete(board: Board) {
    // TanStack Query mutation handles optimistic updates and undo
    deleteBoardMutation.mutate(board.unique_url);
  }

  async function copyLink(board: Board) {
    const url = `${window.location.origin}/retro/${board.unique_url}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!", {
        description: url,
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link to clipboard");
    }
  }

  if (boards.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {showArchived
              ? "No archived boards found"
              : "You haven't created any boards yet"}
          </p>
          {!showArchived && (
            <Link href="/boards/new">
              <Button>Create Your First Board</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board, index) => (
          <motion.div
            key={board.unique_url}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: "easeOut"
            }}
            whileHover={{ y: -4 }}
          >
            <Card
              className={`hover:shadow-lg transition-all ${
                board.is_archived ? "opacity-60" : ""
              }`}
            >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <Link href={`/retro/${board.unique_url}`}>
                    <CardTitle className="text-lg truncate hover:underline cursor-pointer">
                      {board.title}
                    </CardTitle>
                  </Link>
                  <CardDescription className="mt-1">
                    Created {formatDistanceToNow(new Date(board.created_at))} ago
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={loadingBoardId === board.unique_url || updateBoardMutation.isPending}
                    >
                      {loadingBoardId === board.unique_url ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreVertical className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {board.is_archived ? (
                      // Archived board menu
                      <>
                        <DropdownMenuItem onClick={() => copyLink(board)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/retro/${board.unique_url}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Board
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleArchive(board)}>
                          <ArchiveRestore className="mr-2 h-4 w-4" />
                          Restore Board
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(board)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Permanently
                        </DropdownMenuItem>
                      </>
                    ) : (
                      // Active board menu
                      <>
                        <DropdownMenuItem asChild>
                          <Link href={`/retro/${board.unique_url}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Board
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyLink(board)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleArchive(board)}>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(board)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {board.is_archived && (
                  <Badge variant="secondary">
                    <Archive className="mr-1 h-3 w-3" />
                    Archived
                  </Badge>
                )}
                {board.template && (
                  <Badge variant="outline">{board.template}</Badge>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  Updated {formatDistanceToNow(new Date(board.updated_at))} ago
                </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        ))}
      </div>

    </>
  );
}