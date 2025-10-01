"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { playNotificationSound } from '@/lib/poker/timer-utils';

export interface TimerState {
  totalSeconds: number;
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
}

export interface TimerPreferences {
  soundEnabled: boolean;
  lastPreset: number;
}

const STORAGE_KEY = 'scrumkit_timer_preferences';

/**
 * Custom hook for managing discussion timer state and logic
 */
export function useDiscussionTimer() {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const warningPlayedRef = useRef(false);
  const completePlayedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const prefs: TimerPreferences = JSON.parse(stored);
        setSoundEnabled(prefs.soundEnabled ?? true);
      }
    } catch (error) {
      console.warn('Failed to load timer preferences:', error);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((prefs: Partial<TimerPreferences>) => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const current: TimerPreferences = stored ? JSON.parse(stored) : { soundEnabled: true, lastPreset: 5 };
      const updated = { ...current, ...prefs };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save timer preferences:', error);
    }
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (!isRunning || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;

        // Check for warning threshold (90%)
        const percentage = (next / totalSeconds) * 100;
        if (percentage >= 90 && !warningPlayedRef.current) {
          playNotificationSound('warning', soundEnabled);
          warningPlayedRef.current = true;
        }

        // Check for completion
        if (next >= totalSeconds) {
          playNotificationSound('complete', soundEnabled);
          completePlayedRef.current = true;
          setIsRunning(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return totalSeconds;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, totalSeconds, soundEnabled]);

  /**
   * Start the timer with specified duration
   */
  const start = useCallback((durationInSeconds: number) => {
    setTotalSeconds(durationInSeconds);
    setElapsedSeconds(0);
    setIsRunning(true);
    setIsPaused(false);
    warningPlayedRef.current = false;
    completePlayedRef.current = false;
  }, []);

  /**
   * Pause the timer
   */
  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  /**
   * Resume the timer
   */
  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  /**
   * Stop and reset the timer
   */
  const reset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setTotalSeconds(0);
    warningPlayedRef.current = false;
    completePlayedRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Toggle sound notifications
   */
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      savePreferences({ soundEnabled: newValue });
      return newValue;
    });
  }, [savePreferences]);

  /**
   * Add time to the current timer
   */
  const addTime = useCallback((seconds: number) => {
    setTotalSeconds((prev) => prev + seconds);
  }, []);

  const remainingSeconds = totalSeconds - elapsedSeconds;
  const isComplete = isRunning && elapsedSeconds >= totalSeconds;

  const state: TimerState = {
    totalSeconds,
    elapsedSeconds,
    isRunning,
    isPaused,
    isComplete,
  };

  return {
    state,
    remainingSeconds,
    soundEnabled,
    start,
    pause,
    resume,
    reset,
    toggleSound,
    addTime,
  };
}
