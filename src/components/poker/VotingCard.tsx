"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Coffee } from "lucide-react";
import {
  triggerHaptic,
  HapticFeedbackType,
  getHapticPreference,
} from "@/lib/utils/haptics";
import { useIsMobile } from "@/hooks/use-mobile";

interface VotingCardProps {
  value: string | number;
  isSelected: boolean;
  isDisabled?: boolean;
  onClick: () => void;
  keyboardShortcut?: string;
}

export function VotingCard({
  value,
  isSelected,
  isDisabled = false,
  onClick,
  keyboardShortcut,
}: VotingCardProps) {
  const displayValue =
    value === "☕" ? <Coffee className="h-8 w-8 md:h-10 md:w-10" /> : value;
  const isSpecialCard = value === "?" || value === "☕";
  const isMobile = useIsMobile();

  const handleClick = useCallback(() => {
    if (isDisabled) return;

    // Trigger haptic feedback on mobile devices
    if (isMobile) {
      const hapticEnabled = getHapticPreference();
      triggerHaptic(HapticFeedbackType.SELECTION, hapticEnabled);
    }

    onClick();
  }, [isDisabled, isMobile, onClick]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        "group relative flex flex-col items-center justify-center",
        // Mobile-optimized: larger touch targets (min 48x48 iOS, 44x44 Android)
        "h-28 w-20 rounded-xl border-2 transition-all duration-200 sm:h-32 sm:w-24 md:h-36 md:w-28",
        // Enhanced touch feedback
        "touch-manipulation select-none",
        "hover:scale-105 active:scale-95 active:brightness-95",
        "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none",
        isSelected
          ? "scale-105 border-indigo-700 bg-indigo-600 text-white shadow-lg shadow-indigo-500/50"
          : "border-slate-200 bg-white text-slate-900 shadow-md hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-indigo-500",
        isDisabled &&
          "cursor-not-allowed opacity-50 hover:scale-100 active:scale-100",
        isSpecialCard && !isSelected && "border-amber-300 dark:border-amber-600"
      )}
      aria-label={`Vote for ${value}`}
      aria-pressed={isSelected}
    >
      {/* Card Value */}
      <div
        className={cn(
          "text-2xl font-bold transition-colors sm:text-3xl md:text-4xl",
          isSelected ? "text-white" : "text-slate-900 dark:text-slate-100"
        )}
      >
        {displayValue}
      </div>

      {/* Keyboard Shortcut - Hidden on mobile */}
      {keyboardShortcut && !isMobile && (
        <div
          className={cn(
            "absolute bottom-2 text-xs font-medium transition-colors",
            isSelected
              ? "text-indigo-200"
              : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-400"
          )}
        >
          {keyboardShortcut}
        </div>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-lg sm:h-5 sm:w-5">
          <svg
            className="h-4 w-4 text-white sm:h-3 sm:w-3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
