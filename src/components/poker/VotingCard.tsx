"use client";

import { cn } from "@/lib/utils";
import { Coffee } from "lucide-react";

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
  const displayValue = value === "☕" ? <Coffee className="h-8 w-8" /> : value;
  const isSpecialCard = value === "?" || value === "☕";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "relative group flex flex-col items-center justify-center",
        "h-32 w-20 rounded-xl border-2 transition-all duration-200",
        "hover:scale-105 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        isSelected
          ? "bg-indigo-600 text-white border-indigo-700 shadow-lg shadow-indigo-500/50 scale-105"
          : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-md",
        isDisabled && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100",
        isSpecialCard && !isSelected && "border-amber-300 dark:border-amber-600"
      )}
      aria-label={`Vote for ${value}`}
      aria-pressed={isSelected}
    >
      {/* Card Value */}
      <div
        className={cn(
          "text-3xl font-bold transition-colors",
          isSelected ? "text-white" : "text-slate-900 dark:text-slate-100"
        )}
      >
        {displayValue}
      </div>

      {/* Keyboard Shortcut */}
      {keyboardShortcut && (
        <div
          className={cn(
            "absolute bottom-2 text-xs font-medium transition-colors",
            isSelected
              ? "text-indigo-200"
              : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400"
          )}
        >
          {keyboardShortcut}
        </div>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <svg
            className="w-3 h-3 text-white"
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
