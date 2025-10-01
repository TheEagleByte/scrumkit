import { describe, it, expect } from '@jest/globals';
import {
  getSequenceByType,
  getAvailableSequences,
  generateSessionUrl,
  DEFAULT_SESSION_SETTINGS,
  calculateVotingStats,
  formatEstimateValue,
  isValidVoteValue,
  canJoinSession,
  canVoteOnStory,
  canRevealVotes,
  parseCustomSequence,
  validateCustomSequence,
  getEmojiSuggestions,
} from '../utils';

describe('getSequenceByType', () => {
  it('should return fibonacci sequence', () => {
    const sequence = getSequenceByType('fibonacci');

    expect(sequence.type).toBe('fibonacci');
    expect(sequence.name).toBe('Fibonacci');
    expect(sequence.values).toEqual([0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]);
    expect(sequence.specialValues).toEqual(['?', '☕']);
  });

  it('should return t-shirt sequence', () => {
    const sequence = getSequenceByType('tshirt');

    expect(sequence.type).toBe('tshirt');
    expect(sequence.name).toBe('T-Shirt Sizes');
    expect(sequence.values).toEqual(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    expect(sequence.specialValues).toEqual(['?']);
  });

  it('should return linear sequence', () => {
    const sequence = getSequenceByType('linear');

    expect(sequence.type).toBe('linear');
    expect(sequence.name).toBe('Linear (1-10)');
    expect(sequence.values).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(sequence.specialValues).toEqual(['?', '☕']);
  });

  it('should return powers of 2 sequence', () => {
    const sequence = getSequenceByType('powers-of-2');

    expect(sequence.type).toBe('powers-of-2');
    expect(sequence.name).toBe('Powers of 2');
    expect(sequence.values).toEqual([1, 2, 4, 8, 16, 32, 64]);
    expect(sequence.specialValues).toEqual(['?', '☕']);
  });

  it('should return custom sequence with provided values', () => {
    const customValues = ['A', 'B', 'C', 'D'];
    const sequence = getSequenceByType('custom', customValues);

    expect(sequence.type).toBe('custom');
    expect(sequence.name).toBe('Custom');
    expect(sequence.values).toEqual(customValues);
  });

  it('should return empty custom sequence if no values provided', () => {
    const sequence = getSequenceByType('custom');

    expect(sequence.type).toBe('custom');
    expect(sequence.name).toBe('Custom');
    expect(sequence.values).toEqual([]);
  });

  it('should include special values in sequences', () => {
    const fibonacci = getSequenceByType('fibonacci');
    const tshirt = getSequenceByType('tshirt');
    const linear = getSequenceByType('linear');
    const powers = getSequenceByType('powers-of-2');

    expect(fibonacci.specialValues).toContain('?');
    expect(tshirt.specialValues).toContain('?');
    expect(linear.specialValues).toContain('?');
    expect(powers.specialValues).toContain('?');
  });

  it('should handle null custom sequence', () => {
    const sequence = getSequenceByType('custom', null);

    expect(sequence.type).toBe('custom');
    expect(sequence.values).toEqual([]);
  });

  it('should handle undefined custom sequence', () => {
    const sequence = getSequenceByType('custom', undefined);

    expect(sequence.type).toBe('custom');
    expect(sequence.values).toEqual([]);
  });
});

describe('getAvailableSequences', () => {
  it('should return all available sequences', () => {
    const sequences = getAvailableSequences();

    expect(sequences).toHaveLength(4);
    expect(sequences.map(s => s.type)).toEqual([
      'fibonacci',
      'tshirt',
      'linear',
      'powers-of-2',
    ]);
  });

  it('should have correct structure for each sequence', () => {
    const sequences = getAvailableSequences();

    sequences.forEach(sequence => {
      expect(sequence).toHaveProperty('type');
      expect(sequence).toHaveProperty('name');
      expect(sequence).toHaveProperty('values');
      expect(Array.isArray(sequence.values)).toBe(true);
      expect(sequence.values.length).toBeGreaterThan(0);
    });
  });

  it('should not include custom sequence in available sequences', () => {
    const sequences = getAvailableSequences();

    expect(sequences.find(s => s.type === 'custom')).toBeUndefined();
  });
});

describe('generateSessionUrl', () => {
  it('should generate a URL-safe string', () => {
    const url = generateSessionUrl();

    expect(url).toMatch(/^[a-z0-9-]+$/);
  });

  it('should generate strings of expected length', () => {
    const url = generateSessionUrl();

    // Should be reasonable length (e.g., 8-16 characters)
    expect(url.length).toBeGreaterThanOrEqual(8);
    expect(url.length).toBeLessThanOrEqual(32);
  });

  it('should generate unique URLs', () => {
    const url1 = generateSessionUrl();
    const url2 = generateSessionUrl();
    const url3 = generateSessionUrl();

    expect(url1).not.toBe(url2);
    expect(url2).not.toBe(url3);
    expect(url1).not.toBe(url3);
  });

  it('should not contain uppercase letters', () => {
    const url = generateSessionUrl();

    expect(url).toBe(url.toLowerCase());
  });

  it('should not start or end with hyphen', () => {
    const url = generateSessionUrl();

    expect(url[0]).not.toBe('-');
    expect(url[url.length - 1]).not.toBe('-');
  });

  it('should generate 100 unique URLs', () => {
    const urls = new Set<string>();

    for (let i = 0; i < 100; i++) {
      urls.add(generateSessionUrl());
    }

    expect(urls.size).toBe(100);
  });
});

describe('DEFAULT_SESSION_SETTINGS', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_SESSION_SETTINGS).toEqual({
      estimationSequence: 'fibonacci',
      autoReveal: false,
      allowRevote: true,
      showVoterNames: true,
    });
  });

  it('should use fibonacci as default sequence', () => {
    expect(DEFAULT_SESSION_SETTINGS.estimationSequence).toBe('fibonacci');
  });

  it('should not auto-reveal by default', () => {
    expect(DEFAULT_SESSION_SETTINGS.autoReveal).toBe(false);
  });

  it('should allow revoting by default', () => {
    expect(DEFAULT_SESSION_SETTINGS.allowRevote).toBe(true);
  });

  it('should show voter names by default', () => {
    expect(DEFAULT_SESSION_SETTINGS.showVoterNames).toBe(true);
  });

  it('should not include custom sequence by default', () => {
    expect(DEFAULT_SESSION_SETTINGS).not.toHaveProperty('customSequence');
  });
});

describe('calculateVotingStats', () => {
  it('should calculate stats for numeric votes', () => {
    const votes = ['5', '5', '8', '13'];
    const stats = calculateVotingStats(votes);

    expect(stats.totalVotes).toBe(4);
    expect(stats.uniqueVotes).toBe(3);
    expect(stats.average).toBeCloseTo(7.75);
    expect(stats.median).toBe(6.5);
  });

  it('should detect consensus with all same votes', () => {
    const votes = ['5', '5', '5', '5'];
    const stats = calculateVotingStats(votes);

    expect(stats.consensus).toBe(true);
    expect(stats.consensusValue).toBe('5');
    expect(stats.uniqueVotes).toBe(1);
  });

  it('should detect consensus with 70% threshold', () => {
    const votes = ['5', '5', '5', '5', '8', '13', '13'];
    const stats = calculateVotingStats(votes);

    // 4 out of 7 = 57%, but let's test with 5 out of 7 = 71%
    const votes2 = ['5', '5', '5', '5', '5', '8', '13'];
    const stats2 = calculateVotingStats(votes2);

    expect(stats2.consensus).toBe(true);
    expect(stats2.consensusValue).toBe('5');
  });

  it('should not detect consensus below 70% threshold', () => {
    const votes = ['5', '5', '8', '8', '13'];
    const stats = calculateVotingStats(votes);

    expect(stats.consensus).toBe(false);
  });

  it('should handle non-numeric votes', () => {
    const votes = ['XL', 'L', 'XL', 'M'];
    const stats = calculateVotingStats(votes);

    expect(stats.totalVotes).toBe(4);
    expect(stats.uniqueVotes).toBe(3);
    expect(stats.average).toBeUndefined();
    expect(stats.median).toBeUndefined();
    expect(stats.consensusValue).toBe('XL');
  });

  it('should handle mixed numeric and special votes', () => {
    const votes = ['5', '8', '?', '5'];
    const stats = calculateVotingStats(votes);

    expect(stats.totalVotes).toBe(4);
    expect(stats.uniqueVotes).toBe(3);
    expect(stats.average).toBeCloseTo(6);
    expect(stats.consensusValue).toBe('5');
  });

  it('should calculate median for odd number of votes', () => {
    const votes = ['1', '2', '3', '4', '5'];
    const stats = calculateVotingStats(votes);

    expect(stats.median).toBe(3);
  });

  it('should calculate median for even number of votes', () => {
    const votes = ['1', '2', '3', '4'];
    const stats = calculateVotingStats(votes);

    expect(stats.median).toBe(2.5);
  });

  it('should handle single vote', () => {
    const votes = ['8'];
    const stats = calculateVotingStats(votes);

    expect(stats.totalVotes).toBe(1);
    expect(stats.uniqueVotes).toBe(1);
    expect(stats.consensus).toBe(true);
    expect(stats.consensusValue).toBe('8');
  });

  it('should handle empty votes array', () => {
    const votes: string[] = [];
    const stats = calculateVotingStats(votes);

    expect(stats.totalVotes).toBe(0);
    expect(stats.uniqueVotes).toBe(0);
    expect(stats.average).toBeUndefined();
    expect(stats.median).toBeUndefined();
  });
});

describe('formatEstimateValue', () => {
  it('should format unsure value', () => {
    expect(formatEstimateValue('?')).toBe('Unsure');
  });

  it('should format break value', () => {
    expect(formatEstimateValue('☕')).toBe('Break');
  });

  it('should return numeric values as-is', () => {
    expect(formatEstimateValue('5')).toBe('5');
    expect(formatEstimateValue('13')).toBe('13');
  });

  it('should return t-shirt sizes as-is', () => {
    expect(formatEstimateValue('XL')).toBe('XL');
    expect(formatEstimateValue('M')).toBe('M');
  });
});

describe('isValidVoteValue', () => {
  it('should validate numeric votes in fibonacci', () => {
    const sequence = getSequenceByType('fibonacci');

    expect(isValidVoteValue('5', sequence)).toBe(true);
    expect(isValidVoteValue('8', sequence)).toBe(true);
    expect(isValidVoteValue('100', sequence)).toBe(false);
  });

  it('should validate special values', () => {
    const sequence = getSequenceByType('fibonacci');

    expect(isValidVoteValue('?', sequence)).toBe(true);
    expect(isValidVoteValue('☕', sequence)).toBe(true);
  });

  it('should validate t-shirt sizes', () => {
    const sequence = getSequenceByType('tshirt');

    expect(isValidVoteValue('XL', sequence)).toBe(true);
    expect(isValidVoteValue('M', sequence)).toBe(true);
    expect(isValidVoteValue('XXXL', sequence)).toBe(false);
  });

  it('should handle custom sequence', () => {
    const sequence = getSequenceByType('custom', ['A', 'B', 'C']);

    expect(isValidVoteValue('A', sequence)).toBe(true);
    expect(isValidVoteValue('D', sequence)).toBe(false);
  });
});

describe('canJoinSession', () => {
  it('should allow joining active sessions', () => {
    expect(canJoinSession('active')).toBe(true);
  });

  it('should not allow joining ended sessions', () => {
    expect(canJoinSession('ended')).toBe(false);
  });

  it('should not allow joining archived sessions', () => {
    expect(canJoinSession('archived')).toBe(false);
  });
});

describe('canVoteOnStory', () => {
  it('should allow voting on voting stories', () => {
    expect(canVoteOnStory('voting')).toBe(true);
  });

  it('should not allow voting on pending stories', () => {
    expect(canVoteOnStory('pending')).toBe(false);
  });

  it('should not allow voting on revealed stories', () => {
    expect(canVoteOnStory('revealed')).toBe(false);
  });

  it('should not allow voting on estimated stories', () => {
    expect(canVoteOnStory('estimated')).toBe(false);
  });
});

describe('canRevealVotes', () => {
  it('should allow revealing votes during voting', () => {
    expect(canRevealVotes('voting')).toBe(true);
  });

  it('should not allow revealing votes for pending stories', () => {
    expect(canRevealVotes('pending')).toBe(false);
  });

  it('should not allow revealing votes for revealed stories', () => {
    expect(canRevealVotes('revealed')).toBe(false);
  });
});

describe('parseCustomSequence', () => {
  it('should parse numeric values', () => {
    const result = parseCustomSequence('1, 2, 3, 5, 8');
    expect(result).toEqual([1, 2, 3, 5, 8]);
  });

  it('should parse text values', () => {
    const result = parseCustomSequence('XS, S, M, L, XL');
    expect(result).toEqual(['XS', 'S', 'M', 'L', 'XL']);
  });

  it('should parse emoji values', () => {
    const result = parseCustomSequence('🚀, 🏃, 🚶, 🐌, ☕');
    expect(result).toEqual(['🚀', '🏃', '🚶', '🐌', '☕']);
  });

  it('should parse mixed values', () => {
    const result = parseCustomSequence('1, 2, 3, XL, 🚀, ?');
    expect(result).toEqual([1, 2, 3, 'XL', '🚀', '?']);
  });

  it('should trim whitespace', () => {
    const result = parseCustomSequence('  1  ,  2  ,  3  ');
    expect(result).toEqual([1, 2, 3]);
  });

  it('should filter empty values', () => {
    const result = parseCustomSequence('1, , 2, , 3');
    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle single value', () => {
    const result = parseCustomSequence('5');
    expect(result).toEqual([5]);
  });

  it('should handle empty string', () => {
    const result = parseCustomSequence('');
    expect(result).toEqual([]);
  });

  it('should parse decimal numbers', () => {
    const result = parseCustomSequence('0.5, 1, 1.5, 2');
    expect(result).toEqual([0.5, 1, 1.5, 2]);
  });

  it('should handle special characters', () => {
    const result = parseCustomSequence('?, ☕, 💤');
    expect(result).toEqual(['?', '☕', '💤']);
  });
});

describe('validateCustomSequence', () => {
  it('should validate sequence with 3 values', () => {
    expect(validateCustomSequence([1, 2, 3])).toBe(true);
  });

  it('should validate sequence with 20 values', () => {
    const values = Array.from({ length: 20 }, (_, i) => i + 1);
    expect(validateCustomSequence(values)).toBe(true);
  });

  it('should reject sequence with less than 3 values', () => {
    expect(validateCustomSequence([1, 2])).toBe(false);
  });

  it('should reject sequence with more than 20 values', () => {
    const values = Array.from({ length: 21 }, (_, i) => i + 1);
    expect(validateCustomSequence(values)).toBe(false);
  });

  it('should validate mixed types', () => {
    expect(validateCustomSequence([1, 'XL', '🚀'])).toBe(true);
  });

  it('should validate emoji values', () => {
    expect(validateCustomSequence(['🚀', '🏃', '🚶', '🐌'])).toBe(true);
  });

  it('should reject empty string values', () => {
    expect(validateCustomSequence([1, '', 3])).toBe(false);
  });

  it('should reject whitespace-only string values', () => {
    expect(validateCustomSequence([1, '  ', 3])).toBe(false);
  });

  it('should validate decimal numbers', () => {
    expect(validateCustomSequence([0.5, 1, 1.5, 2])).toBe(true);
  });

  it('should reject NaN values', () => {
    expect(validateCustomSequence([1, NaN, 3])).toBe(false);
  });

  it('should handle special characters', () => {
    expect(validateCustomSequence(['?', '☕', '💤'])).toBe(true);
  });
});

describe('getEmojiSuggestions', () => {
  it('should return emoji suggestions', () => {
    const suggestions = getEmojiSuggestions();
    expect(suggestions).toBeInstanceOf(Array);
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('should have category and values for each suggestion', () => {
    const suggestions = getEmojiSuggestions();
    suggestions.forEach(suggestion => {
      expect(suggestion).toHaveProperty('category');
      expect(suggestion).toHaveProperty('values');
      expect(Array.isArray(suggestion.values)).toBe(true);
      expect(suggestion.values.length).toBeGreaterThan(0);
    });
  });

  it('should include speed category', () => {
    const suggestions = getEmojiSuggestions();
    const speedCategory = suggestions.find(s => s.category === 'Speed');
    expect(speedCategory).toBeDefined();
    expect(speedCategory?.values).toContain('🚀');
  });

  it('should include common category', () => {
    const suggestions = getEmojiSuggestions();
    const commonCategory = suggestions.find(s => s.category === 'Common');
    expect(commonCategory).toBeDefined();
    expect(commonCategory?.values).toContain('?');
    expect(commonCategory?.values).toContain('☕');
  });
});
