"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { deleteBoard, updateBoard } from "@/lib/boards/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
}

export function BoardList({ boards: initialBoards, showArchived = false }: BoardListProps) {
  const [boards, setBoards] = useState(initialBoards);
  const [loadingBoardId, setLoadingBoardId] = useState<string | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);

  const filteredBoards = showArchived
    ? boards
    : boards.filter((board) => !board.is_archived);

  async function handleArchive(board: Board) {
    setLoadingBoardId(board.unique_url);
    try {
      await updateBoard(board.unique_url, { is_archived: !board.is_archived });
      setBoards((prev) =>
        prev.map((b) =>
          b.unique_url === board.unique_url
            ? { ...b, is_archived: !b.is_archived }
            : b
        )
      );
      toast.success(board.is_archived ? "Board restored" : "Board archived");
    } catch (error) {
      console.error("Error archiving board:", error);
      toast.error("Failed to archive board");
    } finally {
      setLoadingBoardId(null);
    }
  }

  async function handleDelete() {
    if (!boardToDelete) return;

    setLoadingBoardId(boardToDelete.unique_url);
    try {
      await deleteBoard(boardToDelete.unique_url);
      setBoards((prev) => prev.filter((b) => b.unique_url !== boardToDelete.unique_url));
      toast.success("Board deleted successfully");
      setBoardToDelete(null);
    } catch (error) {
      console.error("Error deleting board:", error);
      toast.error("Failed to delete board");
    } finally {
      setLoadingBoardId(null);
    }
  }

  function copyLink(board: Board) {
    const url = `${window.location.origin}/retro/${board.unique_url}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  }

  if (filteredBoards.length === 0) {
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
        {filteredBoards.map((board) => (
          <Card
            key={board.unique_url}
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
                      disabled={loadingBoardId === board.unique_url}
                    >
                      {loadingBoardId === board.unique_url ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreVertical className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
                      {board.is_archived ? (
                        <>
                          <ArchiveRestore className="mr-2 h-4 w-4" />
                          Restore
                        </>
                      ) : (
                        <>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setBoardToDelete(board)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
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
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!boardToDelete} onOpenChange={() => setBoardToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the board
              &ldquo;{boardToDelete?.title}&rdquo; and all its content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Board
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}