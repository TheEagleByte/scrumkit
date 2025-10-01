"use client";

import { useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, RotateCcw, CheckCircle } from "lucide-react";
import { RevealedCard } from "./RevealedCard";
import type { PokerVote, PokerParticipant, EstimationSequence } from "@/lib/poker/types";
import { cn } from "@/lib/utils";
import { useResetVotes } from "@/hooks/use-poker-reveal";
import { useUpdatePokerStory } from "@/hooks/use-poker-stories";

interface VoteResultsProps {
  storyId: string;
  sessionId: string;
  votes: (PokerVote & { participant: PokerParticipant })[];
  showVoterNames: boolean;
  isFacilitator: boolean;
  sequence: EstimationSequence;
}

interface VoteAnalysis {
  distribution: Map<string, number>;
  mode: string[]; // Most common value(s)
  numericVotes: number[];
  average?: number;
  median?: number;
  consensusThreshold: number;
  outlierThreshold: number;
}

export function VoteResults({
  storyId,
  sessionId,
  votes,
  showVoterNames,
  isFacilitator,
  sequence,
}: VoteResultsProps) {
  const resetVotes = useResetVotes();
  const updateStory = useUpdatePokerStory();

  // Analyze votes for consensus/outliers
  const analysis: VoteAnalysis = useMemo(() => {
    const distribution = new Map<string, number>();
    const numericVotes: number[] = [];

    // Count vote distribution
    votes.forEach((vote) => {
      const count = distribution.get(vote.vote_value) || 0;
      distribution.set(vote.vote_value, count + 1);

      // Track numeric votes for statistics
      const numValue = parseFloat(vote.vote_value);
      if (!isNaN(numValue)) {
        numericVotes.push(numValue);
      }
    });

    // Find mode (most common value)
    let maxCount = 0;
    const mode: string[] = [];
    distribution.forEach((count, value) => {
      if (count > maxCount) {
        maxCount = count;
        mode.length = 0;
        mode.push(value);
      } else if (count === maxCount) {
        mode.push(value);
      }
    });

    // Calculate statistics for numeric votes
    let average: number | undefined;
    let median: number | undefined;
    if (numericVotes.length > 0) {
      average = numericVotes.reduce((sum, v) => sum + v, 0) / numericVotes.length;

      const sorted = [...numericVotes].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      median = sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    }

    return {
      distribution,
      mode,
      numericVotes,
      average,
      median,
      consensusThreshold: 0.6, // 60% of votes within range
      outlierThreshold: 2, // Values >2 steps away from mode
    };
  }, [votes]);

  // Pre-compute value-to-index map for performance
  const valueIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    sequence.values.forEach((value, index) => {
      map.set(String(value), index);
    });
    return map;
  }, [sequence.values]);

  // Determine if a vote is consensus or outlier
  const getVoteCategory = useCallback((voteValue: string): 'consensus' | 'outlier' | 'normal' => {
    // Check if it's the mode (most common)
    if (analysis.mode.includes(voteValue)) {
      return 'consensus';
    }

    // For numeric votes, check distance from mode
    const numValue = parseFloat(voteValue);
    if (!isNaN(numValue) && analysis.mode.length > 0) {
      const modeNum = parseFloat(analysis.mode[0]);
      if (!isNaN(modeNum)) {
        // Use pre-computed map instead of findIndex
        const valueIndex = valueIndexMap.get(voteValue);
        const modeIndex = valueIndexMap.get(analysis.mode[0]);

        if (valueIndex !== undefined && modeIndex !== undefined) {
          const distance = Math.abs(valueIndex - modeIndex);

          // Consensus: within 1 card value
          if (distance <= 1) {
            return 'consensus';
          }

          // Outlier: more than 2 card values away
          if (distance > 2) {
            return 'outlier';
          }
        }
      }
    }

    return 'normal';
  }, [analysis.mode, valueIndexMap]);

  // Sort votes by participant name
  const sortedVotes = [...votes].sort((a, b) =>
    a.participant.name.localeCompare(b.participant.name)
  );

  const handleReset = () => {
    resetVotes.mutate(storyId);
  };

  const handleSetEstimate = (estimate: string) => {
    updateStory.mutate({
      storyId,
      sessionId,
      updates: {
        status: "estimated",
        final_estimate: estimate,
      },
    });
  };

  const maxVoteCount = Math.max(...Array.from(analysis.distribution.values()));

  return (
    <div className="space-y-6">
      {/* Vote Distribution Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Vote Distribution
              </CardTitle>
              <CardDescription>
                {votes.length} {votes.length === 1 ? 'vote' : 'votes'} received
              </CardDescription>
            </div>
            {isFacilitator && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={resetVotes.isPending}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Voting
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistics Summary */}
          {analysis.numericVotes.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400">Most Common</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {analysis.mode.join(", ")}
                </p>
              </div>
              {analysis.average !== undefined && (
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-600 dark:text-slate-400">Average</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {analysis.average.toFixed(1)}
                  </p>
                </div>
              )}
              {analysis.median !== undefined && (
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-600 dark:text-slate-400">Median</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {analysis.median}
                  </p>
                </div>
              )}
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400">Range</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {Math.min(...analysis.numericVotes)} - {Math.max(...analysis.numericVotes)}
                </p>
              </div>
            </div>
          )}

          {/* Bar Chart */}
          <div className="space-y-3">
            {sequence.values.map((value) => {
              const count = analysis.distribution.get(String(value)) || 0;
              if (count === 0) return null;

              const percentage = (count / votes.length) * 100;
              const width = (count / maxVoteCount) * 100;
              const isMode = analysis.mode.includes(String(value));

              return (
                <div key={String(value)} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {value}
                      {isMode && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Most Common
                        </Badge>
                      )}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden">
                    <div
                      className={cn(
                        "h-full flex items-center justify-end pr-2 text-xs font-medium transition-all duration-500",
                        isMode
                          ? "bg-green-500 text-white"
                          : "bg-indigo-500 text-white"
                      )}
                      style={{ width: `${width}%` }}
                    >
                      {count > 0 && count}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Special values */}
            {sequence.specialValues?.map((value) => {
              const count = analysis.distribution.get(String(value)) || 0;
              if (count === 0) return null;

              const percentage = (count / votes.length) * 100;
              const width = (count / maxVoteCount) * 100;

              return (
                <div key={String(value)} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {value === "☕" ? "Coffee Break" : value}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 flex items-center justify-end pr-2 text-xs font-medium text-white transition-all duration-500"
                      style={{ width: `${width}%` }}
                    >
                      {count > 0 && count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Revealed Votes */}
      <Card>
        <CardHeader>
          <CardTitle>All Votes</CardTitle>
          <CardDescription>
            Votes have been revealed to all participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 justify-center">
            {sortedVotes.map((vote, index) => {
              const category = getVoteCategory(vote.vote_value);
              return (
                <RevealedCard
                  key={vote.id}
                  value={vote.vote_value}
                  participantName={vote.participant.name}
                  showParticipantName={showVoterNames}
                  delay={index * 100} // Stagger animation
                  isConsensus={category === 'consensus'}
                  isOutlier={category === 'outlier'}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-50 dark:bg-green-900/20" />
                <span className="text-slate-600 dark:text-slate-400">Consensus (similar votes)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-red-500 bg-red-50 dark:bg-red-900/20" />
                <span className="text-slate-600 dark:text-slate-400">Outlier (divergent vote)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Set Final Estimate */}
      {isFacilitator && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Set Final Estimate
            </CardTitle>
            <CardDescription>
              Choose the agreed-upon estimate for this story
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sequence.values.map((value) => {
                const count = analysis.distribution.get(String(value)) || 0;
                const isMode = analysis.mode.includes(String(value));

                return (
                  <Button
                    key={String(value)}
                    variant={isMode ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleSetEstimate(String(value))}
                    disabled={updateStory.isPending}
                    className={cn(
                      "min-w-[60px]",
                      isMode && "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    {value}
                    {count > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2"
                      >
                        {count}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
