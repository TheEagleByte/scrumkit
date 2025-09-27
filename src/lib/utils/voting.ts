import type { Database } from "@/lib/supabase/types-enhanced";

type Vote = Database["public"]["Tables"]["votes"]["Row"];

export interface VoteStats {
  retrospectiveId: string;
  userId: string;
  votesUsed: number;
  maxVotes: number;
  votesRemaining: number;
}

export interface VoteDisplay {
  count: number;
  hasVoted: boolean;
  canVote: boolean;
  voters?: string[];
}

/**
 * Calculate vote statistics for a user in a retrospective
 */
export function calculateVoteStats(
  votes: Vote[],
  userId: string,
  maxVotes: number = 5
): Omit<VoteStats, "retrospectiveId"> {
  const userVotes = votes.filter(v => v.profile_id === userId);
  const votesUsed = userVotes.length;
  const votesRemaining = Math.max(0, maxVotes - votesUsed);

  return {
    userId,
    votesUsed,
    maxVotes,
    votesRemaining,
  };
}

/**
 * Check if a user can vote on an item
 */
export function canUserVote(
  itemId: string,
  userId: string,
  votes: Vote[],
  maxVotes: number = 5
): boolean {
  // Check if user already voted for this item
  const hasVoted = votes.some(v => v.item_id === itemId && v.profile_id === userId);

  // If already voted, they can remove their vote (toggle off)
  if (hasVoted) {
    return true;
  }

  // Check if user has votes remaining
  const userVoteCount = votes.filter(v => v.profile_id === userId).length;
  return userVoteCount < maxVotes;
}

/**
 * Get vote display information for an item
 */
export function getVoteDisplay(
  itemId: string,
  userId: string,
  votes: Vote[],
  maxVotes: number = 5,
  includeVoters: boolean = false
): VoteDisplay {
  const itemVotes = votes.filter(v => v.item_id === itemId);
  const hasVoted = itemVotes.some(v => v.profile_id === userId);
  const canVote = canUserVote(itemId, userId, votes, maxVotes);

  const display: VoteDisplay = {
    count: itemVotes.length,
    hasVoted,
    canVote,
  };

  if (includeVoters) {
    display.voters = itemVotes.map(v => v.profile_id);
  }

  return display;
}

/**
 * Sort items by vote count with optional tiebreaker
 */
export function sortItemsByVotes<T extends { id: string }>(
  items: T[],
  votes: Vote[],
  order: "asc" | "desc" = "desc",
  tiebreaker?: (a: T, b: T) => number
): T[] {
  const voteCountMap = new Map<string, number>();

  // Count votes for each item
  votes.forEach(vote => {
    const count = voteCountMap.get(vote.item_id) || 0;
    voteCountMap.set(vote.item_id, count + 1);
  });

  // Sort items
  return [...items].sort((a, b) => {
    const aVotes = voteCountMap.get(a.id) || 0;
    const bVotes = voteCountMap.get(b.id) || 0;

    const cmp = order === "desc" ? bVotes - aVotes : aVotes - bVotes;
    if (cmp !== 0) return cmp;
    return tiebreaker ? tiebreaker(a, b) : 0;
  });
}

/**
 * Group votes by item for efficient lookup
 */
export function groupVotesByItem(votes: Vote[]): Map<string, Vote[]> {
  const grouped = new Map<string, Vote[]>();

  votes.forEach(vote => {
    const itemVotes = grouped.get(vote.item_id) || [];
    itemVotes.push(vote);
    grouped.set(vote.item_id, itemVotes);
  });

  return grouped;
}

/**
 * Get top voted items
 */
export function getTopVotedItems<T extends { id: string }>(
  items: T[],
  votes: Vote[],
  limit: number = 3
): Array<T & { voteCount: number }> {
  const voteCountMap = new Map<string, number>();

  votes.forEach(vote => {
    const count = voteCountMap.get(vote.item_id) || 0;
    voteCountMap.set(vote.item_id, count + 1);
  });

  return items
    .map(item => ({
      ...item,
      voteCount: voteCountMap.get(item.id) || 0,
    }))
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, limit);
}

/**
 * Format vote count for display
 */
export function formatVoteCount(count: number, showZero: boolean = true): string {
  if (count === 0 && !showZero) {
    return "";
  }
  return count.toString();
}

/**
 * Generate vote display dots for visual representation
 * @param currentVotes - Number of votes currently cast
 * @param maxVotes - Maximum number of votes allowed
 * @param showCapacity - Whether to show empty dots for remaining capacity (renamed from hasVoted for clarity)
 * @returns Array of dot objects with filled state and index
 */
export function getVoteDots(
  currentVotes: number,
  maxVotes: number = 5,
  showCapacity: boolean = false
): Array<{ filled: boolean; index: number }> {
  const dots = [];

  for (let i = 0; i < Math.min(currentVotes, maxVotes); i++) {
    dots.push({ filled: true, index: i });
  }

  // Add empty dots if showing user's voting capacity
  if (showCapacity && currentVotes < maxVotes) {
    for (let i = currentVotes; i < maxVotes; i++) {
      dots.push({ filled: false, index: i });
    }
  }

  return dots;
}