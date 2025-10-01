"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PokerStory } from "@/lib/poker/types";
import { useSetCurrentStory } from "@/hooks/use-poker-stories";

interface StoryNavigationProps {
  stories: PokerStory[];
  currentStoryId: string | null;
  sessionId: string;
}

export function StoryNavigation({
  stories,
  currentStoryId,
  sessionId,
}: StoryNavigationProps) {
  const setCurrentStory = useSetCurrentStory();

  if (stories.length === 0) {
    return null;
  }

  const currentIndex = currentStoryId
    ? stories.findIndex((s) => s.id === currentStoryId)
    : -1;

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < stories.length - 1;

  const handlePrevious = async () => {
    if (hasPrevious) {
      const previousStory = stories[currentIndex - 1];
      await setCurrentStory.mutateAsync({
        sessionId,
        storyId: previousStory.id,
      });
    }
  };

  const handleNext = async () => {
    if (hasNext) {
      const nextStory = stories[currentIndex + 1];
      await setCurrentStory.mutateAsync({
        sessionId,
        storyId: nextStory.id,
      });
    }
  };

  const handleSelectStory = async (storyId: string) => {
    await setCurrentStory.mutateAsync({
      sessionId,
      storyId,
    });
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={!hasPrevious || setCurrentStory.isPending}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>

      {/* Story Selector */}
      <div className="flex-1 flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Story {currentIndex >= 0 ? currentIndex + 1 : 0} of {stories.length}
        </span>
        <Select
          value={currentStoryId || undefined}
          onValueChange={handleSelectStory}
          disabled={setCurrentStory.isPending}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a story" />
          </SelectTrigger>
          <SelectContent>
            {stories.map((story, index) => (
              <SelectItem key={story.id} value={story.id}>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">#{index + 1}</span>
                  <span className="truncate">{story.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={!hasNext || setCurrentStory.isPending}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
