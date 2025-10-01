import type { EstimationSequence, EstimationSequenceType, SessionSettings } from "./types";

// Pre-defined estimation sequences
export const ESTIMATION_SEQUENCES: Record<EstimationSequenceType, EstimationSequence> = {
  fibonacci: {
    type: 'fibonacci',
    name: 'Fibonacci',
    values: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
    specialValues: ['?', '☕'],
  },
  tshirt: {
    type: 'tshirt',
    name: 'T-Shirt Sizes',
    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    specialValues: ['?'],
  },
  linear: {
    type: 'linear',
    name: 'Linear (1-10)',
    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    specialValues: ['?', '☕'],
  },
  'powers-of-2': {
    type: 'powers-of-2',
    name: 'Powers of 2',
    values: [1, 2, 4, 8, 16, 32, 64],
    specialValues: ['?', '☕'],
  },
  custom: {
    type: 'custom',
    name: 'Custom',
    values: [],
    specialValues: [],
  },
};

// Get sequence by type
export function getSequenceByType(type: EstimationSequenceType, customValues?: (string | number)[]): EstimationSequence {
  if (type === 'custom' && customValues) {
    return {
      ...ESTIMATION_SEQUENCES.custom,
      values: customValues,
    };
  }
  return ESTIMATION_SEQUENCES[type];
}

// Get all available sequences (excluding custom for selection)
export function getAvailableSequences(): EstimationSequence[] {
  return Object.values(ESTIMATION_SEQUENCES).filter(seq => seq.type !== 'custom');
}

// Default session settings
export const DEFAULT_SESSION_SETTINGS: SessionSettings = {
  estimationSequence: 'fibonacci',
  autoReveal: false,
  allowRevote: true,
  showVoterNames: true,
};

// Generate a unique session URL (similar to board URLs)
export function generateSessionUrl(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Calculate voting statistics
export interface VotingStats {
  totalVotes: number;
  uniqueVotes: number;
  voteDistribution: Map<string, number>;
  average?: number; // Only for numeric estimates
  median?: number; // Only for numeric estimates
  consensus: boolean;
  consensusValue?: string;
}

export function calculateVotingStats(votes: string[]): VotingStats {
  const distribution = new Map<string, number>();
  const numericVotes: number[] = [];

  // Count votes and collect numeric values
  votes.forEach(vote => {
    distribution.set(vote, (distribution.get(vote) || 0) + 1);
    const numeric = parseFloat(vote);
    if (!isNaN(numeric)) {
      numericVotes.push(numeric);
    }
  });

  // Find most common vote
  let maxCount = 0;
  let consensusValue: string | undefined;
  distribution.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count;
      consensusValue = value;
    }
  });

  // Calculate average and median for numeric votes
  let average: number | undefined;
  let median: number | undefined;

  if (numericVotes.length > 0) {
    average = numericVotes.reduce((sum, val) => sum + val, 0) / numericVotes.length;

    const sorted = [...numericVotes].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  return {
    totalVotes: votes.length,
    uniqueVotes: distribution.size,
    voteDistribution: distribution,
    average,
    median,
    consensus: distribution.size === 1 || (maxCount / votes.length) >= 0.7, // 70% threshold for consensus
    consensusValue,
  };
}

// Format estimate value for display
export function formatEstimateValue(value: string, sequenceType: EstimationSequenceType): string {
  switch (value) {
    case '?':
      return 'Unsure';
    case '☕':
      return 'Break';
    default:
      return value;
  }
}

// Validate if a vote value is valid for the sequence
export function isValidVoteValue(
  value: string,
  sequence: EstimationSequence
): boolean {
  return (
    sequence.values.some(v => String(v) === value) ||
    (sequence.specialValues?.some(v => v === value) || false)
  );
}

// Check if session can be joined
export function canJoinSession(sessionStatus: string): boolean {
  return sessionStatus === 'active';
}

// Check if story can be voted on
export function canVoteOnStory(storyStatus: string): boolean {
  return storyStatus === 'voting';
}

// Check if votes can be revealed
export function canRevealVotes(storyStatus: string): boolean {
  return storyStatus === 'voting';
}
