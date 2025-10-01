"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";
import { useSessionStatistics } from "@/hooks/use-poker-statistics";

interface SessionSummaryProps {
  sessionId: string;
}

export function SessionSummary({ sessionId }: SessionSummaryProps) {
  const { data: statistics, isLoading, isError } = useSessionStatistics(sessionId);

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Statistics</CardTitle>
          <CardDescription>Failed to load session statistics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Session Statistics
          </CardTitle>
          <CardDescription>Comprehensive analytics for this session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!statistics || statistics.estimatedStories === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Session Statistics
          </CardTitle>
          <CardDescription>Statistics will appear once stories are estimated</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete story estimation to see analytics and velocity metrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          Session Statistics
        </CardTitle>
        <CardDescription>
          Comprehensive analytics across {statistics.estimatedStories} estimated{" "}
          {statistics.estimatedStories === 1 ? "story" : "stories"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Total Stories */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Stories Completed
              </p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {statistics.estimatedStories} / {statistics.totalStories}
            </p>
            {statistics.pendingStories > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                {statistics.pendingStories} pending
                {statistics.skippedStories > 0 && `, ${statistics.skippedStories} skipped`}
              </p>
            )}
          </div>

          {/* Average Time */}
          {statistics.averageEstimationTimeMinutes !== null && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Avg. Time per Story
                </p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {statistics.averageEstimationTimeMinutes.toFixed(1)} min
              </p>
              {statistics.medianEstimationTimeMinutes !== null && (
                <p className="text-xs text-slate-500 mt-1">
                  Median: {statistics.medianEstimationTimeMinutes.toFixed(1)} min
                </p>
              )}
            </div>
          )}

          {/* Velocity */}
          {statistics.storiesPerHour !== null && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Estimation Velocity
                </p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {statistics.storiesPerHour.toFixed(1)} / hour
              </p>
              <p className="text-xs text-slate-500 mt-1">Stories estimated per hour</p>
            </div>
          )}

          {/* Consensus Rate */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Consensus Rate
              </p>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {statistics.overallConsensusRate.toFixed(0)}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Agreement on estimates</p>
          </div>

          {/* Participants */}
          {statistics.participantStats.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Active Participants
                </p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {statistics.participantStats.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Team members voting</p>
            </div>
          )}

          {/* Most Common Estimates */}
          {statistics.mostCommonEstimates.length > 0 && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Most Common Estimate
                </p>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {statistics.mostCommonEstimates[0].estimate}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Used {statistics.mostCommonEstimates[0].count}{" "}
                {statistics.mostCommonEstimates[0].count === 1 ? "time" : "times"}
              </p>
            </div>
          )}
        </div>

        {/* Participant Breakdown */}
        {statistics.participantStats.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participant Contributions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...statistics.participantStats]
                .sort((a, b) => b.totalVotes - a.totalVotes)
                .map((participant) => (
                  <div
                    key={participant.participantId}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                        {participant.name}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {participant.totalVotes} votes
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {participant.storiesVoted} stories
                      {participant.averageVoteValue !== null && (
                        <> • Avg: {participant.averageVoteValue.toFixed(1)}</>
                      )}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Estimate Distribution */}
        {statistics.mostCommonEstimates.length > 1 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estimate Distribution
            </h3>
            <div className="space-y-2">
              {statistics.mostCommonEstimates.map((estimate) => {
                const percentage = (estimate.count / statistics.estimatedStories) * 100;
                return (
                  <div key={estimate.estimate} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {estimate.estimate}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {estimate.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
