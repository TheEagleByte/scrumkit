"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePokerStories, useReorderStories } from "@/hooks/use-poker-stories";
import type { PokerStory, PokerSession } from "@/lib/poker/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileUp, ListOrdered } from "lucide-react";
import { StoryCard } from "./StoryCard";
import { StoryForm } from "./StoryForm";
import { BulkImportDialog } from "./BulkImportDialog";
import { StoryNavigation } from "./StoryNavigation";
import { VotingInterface } from "./VotingInterface";
import { getSequenceByType } from "@/lib/poker/utils";

interface StoryManagerProps {
  session: PokerSession;
}

// Sortable wrapper for StoryCard
function SortableStoryCard({
  story,
  sessionId,
  isCurrentStory,
  onSetCurrent,
}: {
  story: PokerStory;
  sessionId: string;
  isCurrentStory: boolean;
  onSetCurrent?: (id: string | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: story.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <StoryCard
        story={story}
        sessionId={sessionId}
        isCurrentStory={isCurrentStory}
        isDragging={isDragging}
        dragHandleProps={listeners}
        onSetCurrent={onSetCurrent}
      />
    </div>
  );
}

export function StoryManager({ session }: StoryManagerProps) {
  const { data: stories, isLoading } = usePokerStories(session.id);
  const reorderStories = useReorderStories();
  const [addStoryOpen, setAddStoryOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [, setActiveId] = useState<string | null>(null);
  const [localStories, setLocalStories] = useState<PokerStory[]>([]);
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(session.current_story_id ?? null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update local stories when data changes
  useEffect(() => {
    if (stories) {
      setLocalStories(stories);
    }
  }, [stories]);

  // Sync currentStoryId with session prop
  useEffect(() => {
    setCurrentStoryId(session.current_story_id ?? null);
  }, [session.current_story_id]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localStories.findIndex((s) => s.id === active.id);
    const newIndex = localStories.findIndex((s) => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Optimistically update local state
    const reorderedStories = arrayMove(localStories, oldIndex, newIndex);
    setLocalStories(reorderedStories);

    // Update display orders
    const storyOrders = reorderedStories.map((story, index) => ({
      id: story.id,
      display_order: index + 1,
    }));

    // Persist to server
    reorderStories.mutate({ sessionId: session.id, storyOrders });
  };

  const currentStory = localStories.find((s) => s.id === currentStoryId);
  const sequence = getSequenceByType(
    session.estimation_sequence,
    session.custom_sequence ?? undefined
  );

  return (
    <div className="space-y-6">
      {/* Current Story Section */}
      {currentStory && (
        <>
          <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ListOrdered className="h-5 w-5 text-indigo-600" />
                  Current Story
                </CardTitle>
              </div>
              <CardDescription>
                The story currently being estimated by the team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{currentStory.title}</h3>
                  {currentStory.description && (
                    <p className="text-muted-foreground">{currentStory.description}</p>
                  )}
                </div>

                {currentStory.acceptance_criteria && (
                  <div>
                    <h4 className="font-semibold mb-2">Acceptance Criteria:</h4>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {currentStory.acceptance_criteria}
                    </p>
                  </div>
                )}

                {currentStory.external_link && (
                  <div>
                    <a
                      href={currentStory.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View in external tracker →
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Voting Interface */}
          <VotingInterface
            story={currentStory}
            sequence={sequence}
          />
        </>
      )}

      {/* Story Navigation */}
      {localStories.length > 0 && (
        <StoryNavigation
          stories={localStories}
          currentStoryId={currentStoryId}
          sessionId={session.id}
          onSetCurrent={setCurrentStoryId}
        />
      )}

      {/* Story Queue Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Story Queue</CardTitle>
              <CardDescription>
                Manage and reorder stories for this session
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkImportOpen(true)}
              >
                <FileUp className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
              <Button size="sm" onClick={() => setAddStoryOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Story
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : localStories.length === 0 ? (
            <div className="text-center py-12">
              <ListOrdered className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No stories yet</h3>
              <p className="text-muted-foreground mb-4">
                Add stories to start your planning poker session
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setAddStoryOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Story
                </Button>
                <Button variant="outline" onClick={() => setBulkImportOpen(true)}>
                  <FileUp className="h-4 w-4 mr-2" />
                  Import from CSV
                </Button>
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localStories.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {localStories.map((story) => (
                    <SortableStoryCard
                      key={story.id}
                      story={story}
                      sessionId={session.id}
                      isCurrentStory={story.id === currentStoryId}
                      onSetCurrent={setCurrentStoryId}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <StoryForm
        sessionId={session.id}
        open={addStoryOpen}
        onOpenChange={setAddStoryOpen}
      />

      <BulkImportDialog
        sessionId={session.id}
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
      />
    </div>
  );
}
