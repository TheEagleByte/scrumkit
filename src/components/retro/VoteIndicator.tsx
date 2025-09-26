"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2 } from "lucide-react";

interface VoteIndicatorProps {
  voteCount: number;
  hasVoted: boolean;
  canVote: boolean;
  onVote: () => void;
  maxDisplay?: number;
  showTooltip?: boolean;
  voters?: string[];
  disabled?: boolean;
  className?: string;
}

export function VoteIndicator({
  voteCount,
  hasVoted,
  canVote,
  onVote,
  maxDisplay = 5,
  showTooltip = true,
  voters = [],
  disabled = false,
  className,
}: VoteIndicatorProps) {
  // Generate dots for visual representation
  const dots = Array.from({ length: Math.min(voteCount, maxDisplay) }, (_, i) => i);
  const remainingVotes = Math.max(0, voteCount - maxDisplay);

  const handleClick = () => {
    if (!disabled && canVote) {
      onVote();
    }
  };

  const tooltipContent = () => {
    if (hasVoted && !canVote) {
      return "Click to remove your vote";
    }
    if (canVote && !hasVoted) {
      return "Click to vote for this item";
    }
    if (!canVote) {
      return "You've used all your votes";
    }
    return `${voteCount} ${voteCount === 1 ? "vote" : "votes"}`;
  };

  const VoteButton = (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={disabled || (!hasVoted && !canVote)}
      className={cn(
        "h-auto px-2 py-1 gap-1 transition-all",
        hasVoted && "bg-primary/10 hover:bg-primary/20",
        className
      )}
      aria-label={hasVoted ? "Remove vote" : "Add vote"}
    >
      <div className="flex items-center gap-0.5">
        {dots.map((i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              hasVoted
                ? "bg-primary"
                : voteCount > i
                ? "bg-muted-foreground"
                : "bg-muted"
            )}
          />
        ))}
        {remainingVotes > 0 && (
          <span className="text-xs text-muted-foreground ml-0.5">
            +{remainingVotes}
          </span>
        )}
      </div>
      <span className="text-xs font-medium">
        {voteCount}
      </span>
      {hasVoted && (
        <CheckCircle2 className="w-3 h-3 text-primary" />
      )}
    </Button>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {VoteButton}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{tooltipContent()}</p>
            {voters.length > 0 && (
              <div className="mt-1 text-xs text-muted-foreground">
                Voters: {voters.slice(0, 3).join(", ")}
                {voters.length > 3 && ` +${voters.length - 3} more`}
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return VoteButton;
}

interface VoteCounterProps {
  votesUsed: number;
  maxVotes: number;
  className?: string;
}

export function VoteCounter({ votesUsed, maxVotes, className }: VoteCounterProps) {
  const votesRemaining = Math.max(0, maxVotes - votesUsed);
  const percentage = (votesUsed / maxVotes) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Votes</span>
        <span className="font-medium">
          {votesUsed} / {maxVotes}
        </span>
      </div>
      <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "absolute h-full transition-all rounded-full",
            votesRemaining === 0 ? "bg-orange-500" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {votesRemaining === 0 && (
        <p className="text-xs text-orange-500">
          All votes used
        </p>
      )}
    </div>
  );
}