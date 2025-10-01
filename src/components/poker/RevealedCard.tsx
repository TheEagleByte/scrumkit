"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Coffee, TrendingUp, TrendingDown } from "lucide-react";

interface RevealedCardProps {
  value: string;
  participantName: string;
  showParticipantName: boolean;
  delay?: number; // Stagger animation delay in ms
  isConsensus?: boolean;
  isOutlier?: boolean;
}

export function RevealedCard({
  value,
  participantName,
  showParticipantName,
  delay = 0,
  isConsensus = false,
  isOutlier = false,
}: RevealedCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Trigger flip animation after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const displayValue = value === "☕" ? <Coffee className="h-6 w-6" /> : value;
  const isSpecialCard = value === "?" || value === "☕";

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Card with 3D flip animation */}
      <div
        className="relative w-20 h-28"
        style={{
          perspective: "1000px",
        }}
      >
        <div
          className={cn(
            "relative w-full h-full transition-transform duration-500",
            isFlipped && "rotate-y-180"
          )}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Card Back */}
          <div
            className={cn(
              "absolute inset-0 rounded-lg border-2",
              "bg-gradient-to-br from-indigo-500 to-indigo-600",
              "border-indigo-700 shadow-lg",
              "flex items-center justify-center",
              "backface-hidden"
            )}
            style={{
              backfaceVisibility: "hidden",
            }}
          >
            <div className="text-white/20 text-4xl font-bold">?</div>
          </div>

          {/* Card Front (Revealed) */}
          <div
            className={cn(
              "absolute inset-0 rounded-lg border-2",
              "bg-white dark:bg-slate-800",
              "flex flex-col items-center justify-center",
              "backface-hidden shadow-lg",
              isConsensus && "border-green-500 bg-green-50 dark:bg-green-900/20",
              isOutlier && "border-red-500 bg-red-50 dark:bg-red-900/20",
              !isConsensus && !isOutlier && "border-slate-200 dark:border-slate-700",
              isSpecialCard && !isConsensus && !isOutlier && "border-amber-300 dark:border-amber-600"
            )}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Vote Value */}
            <div
              className={cn(
                "text-2xl font-bold",
                isConsensus && "text-green-700 dark:text-green-300",
                isOutlier && "text-red-700 dark:text-red-300",
                !isConsensus && !isOutlier && "text-slate-900 dark:text-slate-100"
              )}
            >
              {displayValue}
            </div>

            {/* Consensus/Outlier Indicator */}
            {isConsensus && (
              <div className="absolute top-1 right-1">
                <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
            )}
            {isOutlier && (
              <div className="absolute top-1 right-1">
                <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Participant Name */}
      {showParticipantName && (
        <div
          className={cn(
            "text-xs font-medium text-center truncate max-w-[80px] transition-opacity delay-300",
            isFlipped ? "opacity-100" : "opacity-0"
          )}
        >
          {participantName}
        </div>
      )}
    </div>
  );
}
