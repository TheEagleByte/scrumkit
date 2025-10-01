"use client";

import { useState } from "react";
import type { PokerStory } from "@/lib/poker/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  PlayCircle,
  CheckCircle2,
  GripVertical,
} from "lucide-react";
import { useDeletePokerStory, useSetCurrentStory } from "@/hooks/use-poker-stories";
import { StoryForm } from "./StoryForm";
import { cn } from "@/lib/utils";

interface StoryCardProps {
  story: PokerStory;
  sessionId: string;
  isCurrentStory?: boolean;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
  onSetCurrent?: (id: string | null) => void;
}

export function StoryCard({
  story,
  sessionId,
  isCurrentStory,
  isDragging,
  dragHandleProps,
  onSetCurrent,
}: StoryCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const deleteStory = useDeletePokerStory();
  const setCurrentStory = useSetCurrentStory();

  const handleDelete = async () => {
    await deleteStory.mutateAsync({ storyId: story.id, sessionId });
  };

  const handleSetCurrent = async () => {
    // Update UI immediately if callback provided
    onSetCurrent?.(story.id);
    await setCurrentStory.mutateAsync({ sessionId, storyId: story.id });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
      case "voting":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "revealed":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      case "estimated":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "skipped":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  return (
    <>
      <Card
        className={cn(
          "relative transition-all",
          isCurrentStory && "ring-2 ring-indigo-500 ring-offset-2 bg-indigo-50/50 dark:bg-indigo-950/20",
          isDragging && "opacity-50 rotate-3 scale-105"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-2">
            {/* Drag Handle */}
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing mt-1"
              aria-label="Drag handle"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Title and Actions */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base leading-tight break-words">
                    {story.title}
                  </CardTitle>
                  {isCurrentStory && (
                    <Badge className="mt-1 bg-indigo-500">
                      Current Story
                    </Badge>
                  )}
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!isCurrentStory && (
                      <>
                        <DropdownMenuItem onClick={handleSetCurrent}>
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Set as Current
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(story.status)}>
              {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
            </Badge>
            {story.final_estimate && (
              <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Estimate: {story.final_estimate}
              </Badge>
            )}
          </div>

          {/* Description */}
          {story.description && (
            <CardDescription className="text-sm line-clamp-2">
              {story.description}
            </CardDescription>
          )}

          {/* Acceptance Criteria */}
          {story.acceptance_criteria && (
            <div className="text-sm">
              <span className="font-medium text-foreground">Acceptance Criteria:</span>
              <p className="text-muted-foreground mt-1 line-clamp-3 whitespace-pre-wrap">
                {story.acceptance_criteria}
              </p>
            </div>
          )}

          {/* External Link */}
          {story.external_link && (
            <a
              href={story.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              View in tracker
            </a>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <StoryForm
        sessionId={sessionId}
        story={story}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
