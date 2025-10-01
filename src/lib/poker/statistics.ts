// Statistics and Analytics utilities for Planning Poker

import type {
  PokerStory,
  PokerVote,
  PokerParticipant,
  StoryStatistics,
  SessionStatistics,
  ParticipantStatistics,
} from "./types";

/**
 * Calculate consensus percentage for a story's votes
 * Consensus is defined as the percentage of votes within 1 card value of the mode
 *
 * @param votes - Array of votes for a story
 * @param sequence - Estimation sequence values for distance calculation
 * @returns Percentage (0-100) of votes that are in consensus
 */
export function calculateConsensusPercentage(
  votes: { vote_value: string }[],
  sequence: (string | number)[]
): number {
  if (votes.length === 0) return 0;

  // Build distribution
  const distribution = new Map<string, number>();
  votes.forEach((vote) => {
    const count = distribution.get(vote.vote_value) || 0;
    distribution.set(vote.vote_value, count + 1);
  });

  // Find mode (most common value)
  let maxCount = 0;
  let mode: string | null = null;
  distribution.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count;
      mode = value;
    }
  });

  if (!mode) return 0;

  // Build value-to-index map
  const valueIndexMap = new Map<string, number>();
  sequence.forEach((value, index) => {
    valueIndexMap.set(String(value), index);
  });

  const modeIndex = valueIndexMap.get(mode);
  if (modeIndex === undefined) {
    // Mode not in sequence (e.g., special value like '?'), count all matching votes
    return (distribution.get(mode)! / votes.length) * 100;
  }

  // Count votes within 1 step of mode
  let consensusCount = 0;
  votes.forEach((vote) => {
    const voteIndex = valueIndexMap.get(vote.vote_value);
    if (voteIndex !== undefined) {
      const distance = Math.abs(voteIndex - modeIndex);
      if (distance <= 1) {
        consensusCount++;
      }
    } else if (vote.vote_value === mode) {
      // Exact match for non-sequence values
      consensusCount++;
    }
  });

  return (consensusCount / votes.length) * 100;
}

/**
 * Calculate estimation time for a story in minutes
 * Time is calculated from the first vote to the story's updated_at timestamp
 *
 * @param story - The poker story
 * @param votes - Votes for the story
 * @returns Estimation time in minutes, or null if not enough data
 */
export function calculateStoryVelocity(
  story: PokerStory,
  votes: PokerVote[]
): number | null {
  if (votes.length === 0 || story.status !== "estimated") {
    return null;
  }

  // Find earliest vote time
  const earliestVote = votes.reduce((earliest, vote) => {
    const voteTime = new Date(vote.created_at).getTime();
    return voteTime < earliest ? voteTime : earliest;
  }, new Date(votes[0].created_at).getTime());

  // Use story's updated_at as completion time
  const completionTime = new Date(story.updated_at).getTime();

  const durationMs = completionTime - earliestVote;
  const durationMinutes = durationMs / (1000 * 60);

  return durationMinutes > 0 ? durationMinutes : null;
}

/**
 * Calculate statistics for a single story
 *
 * @param story - The poker story
 * @param votes - Votes with participant information
 * @param sequence - Estimation sequence for consensus calculation
 * @returns Story statistics
 */
export function calculateStoryStatistics(
  story: PokerStory,
  votes: (PokerVote & { participant: PokerParticipant })[],
  sequence: (string | number)[]
): StoryStatistics {
  // Calculate numeric statistics
  const numericVotes = votes
    .map((v) => parseFloat(v.vote_value))
    .filter((v) => !isNaN(v));

  let averageVote: number | null = null;
  let medianVote: number | null = null;

  if (numericVotes.length > 0) {
    averageVote = numericVotes.reduce((sum, v) => sum + v, 0) / numericVotes.length;

    const sorted = [...numericVotes].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    medianVote =
      sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  const consensusPercentage = calculateConsensusPercentage(votes, sequence);
  const estimationTimeMinutes = calculateStoryVelocity(story, votes);

  const participants = [...new Set(votes.map((v) => v.participant.name))];
  const voteDetails = votes.map((v) => ({
    participantName: v.participant.name,
    voteValue: v.vote_value,
  }));

  return {
    storyId: story.id,
    title: story.title,
    finalEstimate: story.final_estimate,
    voteCount: votes.length,
    averageVote,
    medianVote,
    consensusPercentage,
    estimationTimeMinutes,
    participants,
    votes: voteDetails,
  };
}

/**
 * Calculate aggregate statistics for an entire session
 *
 * @param stories - All stories in the session
 * @param votesMap - Map of story ID to votes (with participant info)
 * @param sequence - Estimation sequence for consensus calculation
 * @returns Session statistics
 */
export function calculateSessionStatistics(
  stories: PokerStory[],
  votesMap: Map<string, (PokerVote & { participant: PokerParticipant })[]>,
  sequence: (string | number)[]
): SessionStatistics {
  const totalStories = stories.length;
  const estimatedStories = stories.filter((s) => s.status === "estimated").length;
  const pendingStories = stories.filter((s) => s.status === "pending").length;
  const skippedStories = stories.filter((s) => s.status === "skipped").length;

  // Calculate story-level statistics
  const storyStats: StoryStatistics[] = [];
  const estimationTimes: number[] = [];
  let totalConsensus = 0;
  let consensusCount = 0;

  stories.forEach((story) => {
    const votes = votesMap.get(story.id) || [];
    if (votes.length > 0) {
      const stats = calculateStoryStatistics(story, votes, sequence);
      storyStats.push(stats);

      if (stats.estimationTimeMinutes !== null) {
        estimationTimes.push(stats.estimationTimeMinutes);
      }

      if (story.status === "estimated") {
        totalConsensus += stats.consensusPercentage;
        consensusCount++;
      }
    }
  });

  // Calculate average and median estimation time
  let averageEstimationTimeMinutes: number | null = null;
  let medianEstimationTimeMinutes: number | null = null;
  let storiesPerHour: number | null = null;

  if (estimationTimes.length > 0) {
    const totalTime = estimationTimes.reduce((sum, t) => sum + t, 0);
    averageEstimationTimeMinutes = totalTime / estimationTimes.length;

    const sortedTimes = [...estimationTimes].sort((a, b) => a - b);
    const mid = Math.floor(sortedTimes.length / 2);
    medianEstimationTimeMinutes =
      sortedTimes.length % 2 === 0
        ? (sortedTimes[mid - 1] + sortedTimes[mid]) / 2
        : sortedTimes[mid];

    // Calculate stories per hour (60 minutes / average time)
    if (averageEstimationTimeMinutes > 0) {
      storiesPerHour = 60 / averageEstimationTimeMinutes;
    }
  }

  const overallConsensusRate = consensusCount > 0 ? totalConsensus / consensusCount : 0;

  // Calculate participant statistics
  const participantVotesMap = new Map<string, { name: string; votes: PokerVote[] }>();

  votesMap.forEach((votes) => {
    votes.forEach((vote) => {
      const existing = participantVotesMap.get(vote.participant_id);
      if (existing) {
        existing.votes.push(vote);
      } else {
        participantVotesMap.set(vote.participant_id, {
          name: vote.participant.name,
          votes: [vote],
        });
      }
    });
  });

  const participantStats: ParticipantStatistics[] = [];
  participantVotesMap.forEach((data, participantId) => {
    const numericVotes = data.votes
      .map((v) => parseFloat(v.vote_value))
      .filter((v) => !isNaN(v));

    const averageVoteValue =
      numericVotes.length > 0
        ? numericVotes.reduce((sum, v) => sum + v, 0) / numericVotes.length
        : null;

    // Count unique stories voted on
    const storiesVoted = new Set(data.votes.map((v) => v.story_id)).size;

    participantStats.push({
      participantId,
      name: data.name,
      totalVotes: data.votes.length,
      storiesVoted,
      averageVoteValue,
    });
  });

  // Calculate most common estimates
  const estimateFrequency = new Map<string, number>();
  stories.forEach((story) => {
    if (story.final_estimate) {
      const count = estimateFrequency.get(story.final_estimate) || 0;
      estimateFrequency.set(story.final_estimate, count + 1);
    }
  });

  const mostCommonEstimates = Array.from(estimateFrequency.entries())
    .map(([estimate, count]) => ({ estimate, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5

  return {
    sessionId: stories[0]?.session_id || "",
    totalStories,
    estimatedStories,
    pendingStories,
    skippedStories,
    averageEstimationTimeMinutes,
    medianEstimationTimeMinutes,
    overallConsensusRate,
    storiesPerHour,
    participantStats,
    storyStats,
    mostCommonEstimates,
  };
}
