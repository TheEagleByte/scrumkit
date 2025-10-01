"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";
import { playTimerComplete, playTimerWarning } from "@/lib/utils/sound-notifications";

export interface TimerState {
  duration: number; // Total duration in seconds
  remaining: number; // Remaining time in seconds
  isRunning: boolean;
  preset?: string; // Preset name if used
}

interface TimerProps {
  initialState?: TimerState;
  onChange?: (state: TimerState) => void;
  compact?: boolean; // Compact mode for header display
}

const PRESETS = [
  { label: "5 min", value: 5 * 60 },
  { label: "10 min", value: 10 * 60 },
  { label: "15 min", value: 15 * 60 },
  { label: "20 min", value: 20 * 60 },
];

/**
 * Format seconds to MM:SS display
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function Timer({ initialState, onChange, compact = false }: TimerProps) {
  const [timerState, setTimerState] = useState<TimerState>(
    initialState || {
      duration: 5 * 60,
      remaining: 5 * 60,
      isRunning: false,
    }
  );
  const [customMinutes, setCustomMinutes] = useState<string>("5");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningPlayedRef = useRef(false);

  // Sync with external state changes
  useEffect(() => {
    if (initialState) {
      setTimerState(initialState);
    }
  }, [initialState]);

  // Notify parent of state changes
  const updateState = useCallback(
    (newState: TimerState) => {
      setTimerState(newState);
      onChange?.(newState);
    },
    [onChange]
  );

  // Timer countdown logic
  useEffect(() => {
    if (timerState.isRunning && timerState.remaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          const newRemaining = prev.remaining - 1;

          // Play warning sound at 1 minute
          if (newRemaining === 60 && !warningPlayedRef.current) {
            playTimerWarning();
            warningPlayedRef.current = true;
          }

          // Play completion sound and stop timer
          if (newRemaining <= 0) {
            playTimerComplete();
            warningPlayedRef.current = false;
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            const completedState = {
              ...prev,
              remaining: 0,
              isRunning: false,
            };
            onChange?.(completedState);
            return completedState;
          }

          const newState = { ...prev, remaining: newRemaining };
          onChange?.(newState);
          return newState;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [timerState.isRunning, timerState.remaining, onChange]);

  const handlePresetSelect = (value: number, label: string) => {
    warningPlayedRef.current = false;
    updateState({
      duration: value,
      remaining: value,
      isRunning: false,
      preset: label,
    });
  };

  const handleCustomSet = () => {
    const minutes = parseInt(customMinutes, 10);
    if (isNaN(minutes) || minutes <= 0 || minutes > 999) {
      return;
    }
    const seconds = minutes * 60;
    warningPlayedRef.current = false;
    updateState({
      duration: seconds,
      remaining: seconds,
      isRunning: false,
      preset: `${minutes} min`,
    });
  };

  const handlePlayPause = () => {
    updateState({
      ...timerState,
      isRunning: !timerState.isRunning,
    });
  };

  const handleReset = () => {
    warningPlayedRef.current = false;
    updateState({
      ...timerState,
      remaining: timerState.duration,
      isRunning: false,
    });
  };

  // Calculate progress percentage
  const progress = timerState.duration > 0
    ? ((timerState.duration - timerState.remaining) / timerState.duration) * 100
    : 0;

  // Determine color based on remaining time
  const getProgressColor = () => {
    if (timerState.remaining <= 60) return "bg-red-500";
    if (timerState.remaining <= 180) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-card border rounded-md">
        <Clock className="h-4 w-4" />
        <span className={`font-mono text-sm ${timerState.remaining <= 60 ? 'text-red-500 font-bold' : ''}`}>
          {formatTime(timerState.remaining)}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={handlePlayPause}
        >
          {timerState.isRunning ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timer Display */}
      <div className="text-center space-y-2">
        <div className="text-4xl font-mono font-bold">
          {formatTime(timerState.remaining)}
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {timerState.preset && (
          <div className="text-xs text-muted-foreground">
            {timerState.preset} timer
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          size="lg"
          onClick={handlePlayPause}
          disabled={timerState.remaining === 0}
        >
          {timerState.isRunning ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start
            </>
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={handleReset}
          disabled={timerState.remaining === timerState.duration}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick Presets</Label>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.value}
              variant={timerState.duration === preset.value ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetSelect(preset.value, preset.label)}
              disabled={timerState.isRunning}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Duration */}
      <div className="space-y-2">
        <Label htmlFor="custom-minutes" className="text-sm font-medium">
          Custom Duration
        </Label>
        <div className="flex gap-2">
          <Input
            id="custom-minutes"
            type="number"
            min="1"
            max="999"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            placeholder="Minutes"
            disabled={timerState.isRunning}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={handleCustomSet}
            disabled={timerState.isRunning}
          >
            Set
          </Button>
        </div>
      </div>
    </div>
  );
}
