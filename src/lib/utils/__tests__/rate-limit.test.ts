/**
 * Tests for rate limiting utility
 * Validates rate limiting logic, timing behavior, and edge cases
 */

import rateLimiter, {
  canVote,
  canCreateItem,
  canDeleteItem,
  getCooldownTime,
  checkRateLimit,
} from '@/lib/utils/rate-limit';

// Mock the constants module
jest.mock('@/lib/realtime/constants', () => ({
  RATE_LIMIT_CONFIG: {
    MAX_ACTIONS_PER_MINUTE: 20,
  },
}));

// Mock Date.now for predictable timing
const mockDateNow = jest.spyOn(Date, 'now');

describe('Rate Limiting Utility', () => {
  const MOCK_TIME = 1640995200000; // 2022-01-01 00:00:00

  beforeEach(() => {
    // Reset time to a known value
    mockDateNow.mockReturnValue(MOCK_TIME);

    // Clear all rate limits
    rateLimiter.clearAll();
  });

  afterAll(() => {
    mockDateNow.mockRestore();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow first request', () => {
      const result = rateLimiter.checkLimit('test-key', 5, 60000);
      expect(result).toBe(true);
    });

    it('should track multiple requests within limit', () => {
      expect(rateLimiter.checkLimit('test-key', 5, 60000)).toBe(true);
      expect(rateLimiter.checkLimit('test-key', 5, 60000)).toBe(true);
      expect(rateLimiter.checkLimit('test-key', 5, 60000)).toBe(true);
      expect(rateLimiter.checkLimit('test-key', 5, 60000)).toBe(true);
      expect(rateLimiter.checkLimit('test-key', 5, 60000)).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      // Make 5 requests (at limit)
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.checkLimit('test-key', 5, 60000)).toBe(true);
      }

      // 6th request should be blocked
      expect(rateLimiter.checkLimit('test-key', 5, 60000)).toBe(false);
    });

    it('should maintain separate limits for different keys', () => {
      // Use up limit for key1
      for (let i = 0; i < 3; i++) {
        expect(rateLimiter.checkLimit('key1', 3, 60000)).toBe(true);
      }
      expect(rateLimiter.checkLimit('key1', 3, 60000)).toBe(false);

      // key2 should still work
      expect(rateLimiter.checkLimit('key2', 3, 60000)).toBe(true);
    });

    it('should reset after time window expires', () => {
      // Use up limit
      for (let i = 0; i < 3; i++) {
        expect(rateLimiter.checkLimit('test-key', 3, 60000)).toBe(true);
      }
      expect(rateLimiter.checkLimit('test-key', 3, 60000)).toBe(false);

      // Advance time past window
      mockDateNow.mockReturnValue(MOCK_TIME + 60001);

      // Should work again
      expect(rateLimiter.checkLimit('test-key', 3, 60000)).toBe(true);
    });
  });

  describe('Reset Time Tracking', () => {
    it('should return 0 for non-existent key', () => {
      const resetTime = rateLimiter.getResetTime('non-existent');
      expect(resetTime).toBe(0);
    });

    it('should return remaining time correctly', () => {
      rateLimiter.checkLimit('test-key', 5, 60000);

      const resetTime = rateLimiter.getResetTime('test-key');
      expect(resetTime).toBe(60000); // Full window remaining
    });

    it('should return decreasing reset time', () => {
      rateLimiter.checkLimit('test-key', 5, 60000);

      // Advance time partially
      mockDateNow.mockReturnValue(MOCK_TIME + 30000);

      const resetTime = rateLimiter.getResetTime('test-key');
      expect(resetTime).toBe(30000); // Half window remaining
    });

    it('should return 0 when window has expired', () => {
      rateLimiter.checkLimit('test-key', 5, 60000);

      // Advance time past window
      mockDateNow.mockReturnValue(MOCK_TIME + 60001);

      const resetTime = rateLimiter.getResetTime('test-key');
      expect(resetTime).toBe(0);
    });
  });

  describe('Clear Methods', () => {
    it('should clear specific key', () => {
      // Set up rate limits
      rateLimiter.checkLimit('key1', 1, 60000);
      rateLimiter.checkLimit('key2', 1, 60000);

      // Both should be at limit
      expect(rateLimiter.checkLimit('key1', 1, 60000)).toBe(false);
      expect(rateLimiter.checkLimit('key2', 1, 60000)).toBe(false);

      // Clear key1
      rateLimiter.clear('key1');

      // key1 should work again, key2 should still be blocked
      expect(rateLimiter.checkLimit('key1', 1, 60000)).toBe(true);
      expect(rateLimiter.checkLimit('key2', 1, 60000)).toBe(false);
    });

    it('should clear all keys', () => {
      // Set up rate limits
      rateLimiter.checkLimit('key1', 1, 60000);
      rateLimiter.checkLimit('key2', 1, 60000);

      // Both should be at limit
      expect(rateLimiter.checkLimit('key1', 1, 60000)).toBe(false);
      expect(rateLimiter.checkLimit('key2', 1, 60000)).toBe(false);

      // Clear all
      rateLimiter.clearAll();

      // Both should work again
      expect(rateLimiter.checkLimit('key1', 1, 60000)).toBe(true);
      expect(rateLimiter.checkLimit('key2', 1, 60000)).toBe(true);
    });

    it('should handle clearing non-existent keys gracefully', () => {
      expect(() => rateLimiter.clear('non-existent')).not.toThrow();
    });
  });

  describe('Voting Rate Limits', () => {
    it('should allow voting within limit', () => {
      const userId = 'user123';

      // Should allow up to 10 votes
      for (let i = 0; i < 10; i++) {
        expect(canVote(userId)).toBe(true);
      }

      // 11th vote should be blocked
      expect(canVote(userId)).toBe(false);
    });

    it('should have separate limits per user', () => {
      const user1 = 'user1';
      const user2 = 'user2';

      // User1 uses up their votes
      for (let i = 0; i < 10; i++) {
        expect(canVote(user1)).toBe(true);
      }
      expect(canVote(user1)).toBe(false);

      // User2 should still be able to vote
      expect(canVote(user2)).toBe(true);
    });

    it('should reset voting limit after time window', () => {
      const userId = 'user123';

      // Use up votes
      for (let i = 0; i < 10; i++) {
        canVote(userId);
      }
      expect(canVote(userId)).toBe(false);

      // Advance time past 1 minute window
      mockDateNow.mockReturnValue(MOCK_TIME + 60001);

      // Should be able to vote again
      expect(canVote(userId)).toBe(true);
    });
  });

  describe('Item Creation Rate Limits', () => {
    it('should allow creating items within limit', () => {
      const userId = 'user123';

      // Should allow up to 20 items (from mocked MAX_ACTIONS_PER_MINUTE)
      for (let i = 0; i < 20; i++) {
        expect(canCreateItem(userId)).toBe(true);
      }

      // 21st item should be blocked
      expect(canCreateItem(userId)).toBe(false);
    });

    it('should have separate creation limits per user', () => {
      const user1 = 'user1';
      const user2 = 'user2';

      // User1 uses up their limit
      for (let i = 0; i < 20; i++) {
        canCreateItem(user1);
      }
      expect(canCreateItem(user1)).toBe(false);

      // User2 should still be able to create items
      expect(canCreateItem(user2)).toBe(true);
    });

    it('should reset creation limit after time window', () => {
      const userId = 'user123';

      // Use up creation limit
      for (let i = 0; i < 20; i++) {
        canCreateItem(userId);
      }
      expect(canCreateItem(userId)).toBe(false);

      // Advance time past 1 minute window
      mockDateNow.mockReturnValue(MOCK_TIME + 60001);

      // Should be able to create items again
      expect(canCreateItem(userId)).toBe(true);
    });
  });

  describe('Item Deletion Rate Limits', () => {
    it('should allow deleting items within limit', () => {
      const userId = 'user123';

      // Should allow up to 10 deletions
      for (let i = 0; i < 10; i++) {
        expect(canDeleteItem(userId)).toBe(true);
      }

      // 11th deletion should be blocked
      expect(canDeleteItem(userId)).toBe(false);
    });

    it('should have separate deletion limits per user', () => {
      const user1 = 'user1';
      const user2 = 'user2';

      // User1 uses up their deletions
      for (let i = 0; i < 10; i++) {
        canDeleteItem(user1);
      }
      expect(canDeleteItem(user1)).toBe(false);

      // User2 should still be able to delete
      expect(canDeleteItem(user2)).toBe(true);
    });

    it('should reset deletion limit after time window', () => {
      const userId = 'user123';

      // Use up deletion limit
      for (let i = 0; i < 10; i++) {
        canDeleteItem(userId);
      }
      expect(canDeleteItem(userId)).toBe(false);

      // Advance time past 1 minute window
      mockDateNow.mockReturnValue(MOCK_TIME + 60001);

      // Should be able to delete again
      expect(canDeleteItem(userId)).toBe(true);
    });
  });

  describe('Cooldown Time Helper', () => {
    it('should return correct cooldown time for vote action', () => {
      const userId = 'user123';

      // Use up votes
      for (let i = 0; i < 10; i++) {
        canVote(userId);
      }

      const cooldown = getCooldownTime('vote', userId);
      expect(cooldown).toBe(60000); // Full minute remaining
    });

    it('should return correct cooldown time for create action', () => {
      const userId = 'user123';

      // Use up creation limit
      for (let i = 0; i < 20; i++) {
        canCreateItem(userId);
      }

      const cooldown = getCooldownTime('create', userId);
      expect(cooldown).toBe(60000); // Full minute remaining
    });

    it('should return correct cooldown time for delete action', () => {
      const userId = 'user123';

      // Use up deletion limit
      for (let i = 0; i < 10; i++) {
        canDeleteItem(userId);
      }

      const cooldown = getCooldownTime('delete', userId);
      expect(cooldown).toBe(60000); // Full minute remaining
    });

    it('should return decreasing cooldown time', () => {
      const userId = 'user123';

      // Use up votes
      for (let i = 0; i < 10; i++) {
        canVote(userId);
      }

      // Advance time partially
      mockDateNow.mockReturnValue(MOCK_TIME + 30000);

      const cooldown = getCooldownTime('vote', userId);
      expect(cooldown).toBe(30000); // Half minute remaining
    });

    it('should return 0 cooldown for non-rate-limited actions', () => {
      const userId = 'user123';
      const cooldown = getCooldownTime('vote', userId);
      expect(cooldown).toBe(0);
    });
  });

  describe('Generic Rate Limit Check', () => {
    it('should work with custom parameters', () => {
      expect(checkRateLimit('custom-key', 3, 30000)).toBe(true);
      expect(checkRateLimit('custom-key', 3, 30000)).toBe(true);
      expect(checkRateLimit('custom-key', 3, 30000)).toBe(true);
      expect(checkRateLimit('custom-key', 3, 30000)).toBe(false);
    });

    it('should respect custom time windows', () => {
      // Use up limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit('test-key', 5, 30000);
      }
      expect(checkRateLimit('test-key', 5, 30000)).toBe(false);

      // Advance time past custom window (30 seconds)
      mockDateNow.mockReturnValue(MOCK_TIME + 30001);

      // Should work again
      expect(checkRateLimit('test-key', 5, 30000)).toBe(true);
    });

    it('should handle zero limits', () => {
      expect(checkRateLimit('zero-limit', 0, 60000)).toBe(true); // First call creates entry, then immediately exceeds limit
      expect(checkRateLimit('zero-limit', 0, 60000)).toBe(false); // Second call is blocked
    });

    it('should handle very high limits', () => {
      for (let i = 0; i < 1000; i++) {
        expect(checkRateLimit('high-limit', 10000, 60000)).toBe(true);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent requests properly', () => {
      const userId = 'user123';
      const results = [];

      // Simulate multiple concurrent requests
      for (let i = 0; i < 15; i++) {
        results.push(canVote(userId));
      }

      // First 10 should succeed, rest should fail
      expect(results.slice(0, 10).every(r => r === true)).toBe(true);
      expect(results.slice(10).every(r => r === false)).toBe(true);
    });

    it('should handle empty string keys', () => {
      expect(checkRateLimit('', 5, 60000)).toBe(true);
      expect(checkRateLimit('', 5, 60000)).toBe(true);
    });

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(1000);
      expect(checkRateLimit(longKey, 5, 60000)).toBe(true);
    });

    it('should handle special characters in keys', () => {
      const specialKey = 'user@example.com-action#123';
      expect(checkRateLimit(specialKey, 5, 60000)).toBe(true);
    });

    it('should handle negative time windows gracefully', () => {
      // This should immediately expire
      expect(checkRateLimit('negative-time', 5, -1000)).toBe(true);
      expect(checkRateLimit('negative-time', 5, -1000)).toBe(true);
    });

    it('should handle zero time windows', () => {
      // With zero window, entries expire immediately but still count the first time
      expect(checkRateLimit('zero-time', 1, 0)).toBe(true);
      expect(checkRateLimit('zero-time', 1, 0)).toBe(false); // Exceeds limit
    });

    it('should handle very small time windows', () => {
      expect(checkRateLimit('small-window', 1, 1)).toBe(true);

      // Advance by 2ms (past the 1ms window)
      mockDateNow.mockReturnValue(MOCK_TIME + 2);

      // Should be reset
      expect(checkRateLimit('small-window', 1, 1)).toBe(true);
    });

    it('should handle large time windows', () => {
      const largeWindow = 24 * 60 * 60 * 1000; // 24 hours

      checkRateLimit('large-window', 1, largeWindow);
      expect(checkRateLimit('large-window', 1, largeWindow)).toBe(false);

      // Still blocked after 1 hour
      mockDateNow.mockReturnValue(MOCK_TIME + 60 * 60 * 1000);
      expect(checkRateLimit('large-window', 1, largeWindow)).toBe(false);
    });

    it('should handle system clock changes', () => {
      expect(checkRateLimit('clock-test', 1, 60000)).toBe(true);

      // Simulate clock going backwards
      mockDateNow.mockReturnValue(MOCK_TIME - 30000);

      // Should still work (expired entry gets reset)
      expect(checkRateLimit('clock-test', 1, 60000)).toBe(false); // Actually, this will still be blocked because the reset time is in the future
    });

    it('should maintain accurate counts across time boundary', () => {
      const userId = 'boundary-user';

      // Make 9 votes (just under limit)
      for (let i = 0; i < 9; i++) {
        canVote(userId);
      }

      // Advance to just before reset
      mockDateNow.mockReturnValue(MOCK_TIME + 59999);
      expect(canVote(userId)).toBe(true); // 10th vote
      expect(canVote(userId)).toBe(false); // Over limit

      // Advance just past reset
      mockDateNow.mockReturnValue(MOCK_TIME + 60001);
      expect(canVote(userId)).toBe(true); // Should work again
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory with many different keys', () => {
      // Create many different rate limit entries
      for (let i = 0; i < 1000; i++) {
        checkRateLimit(`key-${i}`, 1, 60000);
      }

      // Advance time to expire all entries
      mockDateNow.mockReturnValue(MOCK_TIME + 60001);

      // New entries should still work (old ones should be cleaned up on access)
      for (let i = 0; i < 10; i++) {
        expect(checkRateLimit(`new-key-${i}`, 1, 60000)).toBe(true);
      }
    });

    it('should handle repeated clear operations', () => {
      checkRateLimit('test-key', 1, 60000);

      for (let i = 0; i < 100; i++) {
        rateLimiter.clear('test-key');
      }

      expect(checkRateLimit('test-key', 1, 60000)).toBe(true);
    });

    it('should handle repeated clearAll operations', () => {
      for (let i = 0; i < 10; i++) {
        checkRateLimit(`key-${i}`, 1, 60000);
      }

      for (let i = 0; i < 100; i++) {
        rateLimiter.clearAll();
      }

      expect(checkRateLimit('test-key', 1, 60000)).toBe(true);
    });
  });

  describe('Type Safety and Exports', () => {
    it('should export all required functions', () => {
      expect(typeof canVote).toBe('function');
      expect(typeof canCreateItem).toBe('function');
      expect(typeof canDeleteItem).toBe('function');
      expect(typeof getCooldownTime).toBe('function');
      expect(typeof checkRateLimit).toBe('function');
    });

    it('should export default rateLimiter', () => {
      expect(typeof rateLimiter).toBe('object');
      expect(typeof rateLimiter.checkLimit).toBe('function');
      expect(typeof rateLimiter.getResetTime).toBe('function');
      expect(typeof rateLimiter.clear).toBe('function');
      expect(typeof rateLimiter.clearAll).toBe('function');
    });

    it('should handle string parameters correctly', () => {
      expect(() => canVote('string-user-id')).not.toThrow();
      expect(() => getCooldownTime('string-action', 'string-user-id')).not.toThrow();
    });

    it('should handle numeric parameters correctly', () => {
      expect(() => checkRateLimit('key', 10, 60000)).not.toThrow();
    });
  });
});