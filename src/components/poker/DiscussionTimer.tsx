"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Coffee,
  Plus
} from "lucide-react";
import { useDiscussionTimer } from "@/hooks/use-discussion-timer";
import {
  formatTime,
  calculateProgress,
  getWarningLevel,
  getWarningColors,
  minutesToSeconds,
  TIMER_PRESETS
} from "@/lib/poker/timer-utils";
import { cn } from "@/lib/utils";

interface DiscussionTimerProps {
  className?: string;
}

export function DiscussionTimer({ className }: DiscussionTimerProps) {
  const {
    state,
    remainingSeconds,
    soundEnabled,
    start,
    pause,
    resume,
    reset,
    toggleSound,
    addTime,
  } = useDiscussionTimer();

  const [isBreakMode, setIsBreakMode] = useState(false);
  const [customMinutes, setCustomMinutes] = useState<string>("");

  const handlePresetClick = (minutes: number) => {
    start(minutesToSeconds(minutes));
  };

  const handleCustomStart = () => {
    const minutes = parseInt(customMinutes, 10);
    if (minutes > 0 && minutes <= 60) {
      start(minutesToSeconds(minutes));
      setCustomMinutes("");
    }
  };

  const handleAddMinute = () => {
    addTime(60);
  };

  const progress = calculateProgress(state.elapsedSeconds, state.totalSeconds);
  const warningLevel = getWarningLevel(state.elapsedSeconds, state.totalSeconds);
  const colors = getWarningColors(warningLevel);

  const presets = isBreakMode ? TIMER_PRESETS.break : TIMER_PRESETS.discussion;

  return (
    <Card className={cn("border-indigo-200 dark:border-indigo-800", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            <CardTitle>Discussion Timer</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              className="h-8 w-8 p-0"
              title={soundEnabled ? "Mute notifications" : "Enable notifications"}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant={isBreakMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsBreakMode(!isBreakMode)}
              disabled={state.isRunning}
              className="gap-2"
            >
              <Coffee className="h-4 w-4" />
              {isBreakMode ? "Break" : "Discussion"}
            </Button>
          </div>
        </div>
        <CardDescription>
          Timebox your {isBreakMode ? "breaks" : "estimation discussions"} to stay efficient
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timer Display */}
        {state.isRunning && (
          <div className={cn("p-6 rounded-lg border transition-colors", colors.bg, colors.border)}>
            <div className="text-center space-y-4">
              <div className={cn("text-6xl font-mono font-bold tabular-nums", colors.text)}>
                {formatTime(remainingSeconds)}
              </div>

              {state.isPaused && (
                <Badge variant="outline" className="bg-background">
                  Paused
                </Badge>
              )}

              {state.isComplete && (
                <Badge variant="outline" className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700">
                  Time&apos;s Up!
                </Badge>
              )}

              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress
                  value={progress}
                  className="h-2"
                  indicatorClassName={colors.progress}
                />
                <div className="text-xs text-muted-foreground text-center">
                  {Math.round(progress)}% elapsed
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-2">
                {!state.isPaused ? (
                  <Button
                    onClick={pause}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    onClick={resume}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-green-500 hover:bg-green-600 text-white border-green-600"
                  >
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                )}

                <Button
                  onClick={handleAddMinute}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={state.isComplete}
                >
                  <Plus className="h-4 w-4" />
                  +1 min
                </Button>

                <Button
                  onClick={reset}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Preset Buttons */}
        {!state.isRunning && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 justify-center">
              {presets.map((minutes) => (
                <Button
                  key={minutes}
                  onClick={() => handlePresetClick(minutes)}
                  variant="outline"
                  className="gap-2"
                >
                  <Clock className="h-4 w-4" />
                  {minutes} min
                </Button>
              ))}
            </div>

            {/* Custom Time Input */}
            <div className="flex items-center gap-2 justify-center">
              <input
                type="number"
                min="1"
                max="60"
                step="1"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                placeholder="Custom"
                className={cn(
                  "w-20 px-3 py-2 text-sm border rounded-md bg-background",
                  customMinutes && (parseInt(customMinutes) < 1 || parseInt(customMinutes) > 60)
                    ? "border-red-500 focus:ring-red-500"
                    : "border-input"
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomStart();
                  }
                }}
              />
              <span className="text-sm text-muted-foreground">minutes</span>
              <Button
                onClick={handleCustomStart}
                disabled={!customMinutes || parseInt(customMinutes) <= 0}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Start
              </Button>
            </div>
          </div>
        )}

        {/* Helper Text */}
        {!state.isRunning && (
          <div className="text-center text-xs text-muted-foreground">
            Select a preset or enter a custom duration to start the timer
          </div>
        )}
      </CardContent>
    </Card>
  );
}
