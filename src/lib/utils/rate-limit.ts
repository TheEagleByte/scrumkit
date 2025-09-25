/**
 * Client-side rate limiting utilities
 */

import { RATE_LIMIT_CONFIG } from '@/lib/realtime/constants';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  /**
   * Check if an action is rate limited
   * @param key - Unique key for the action (e.g., 'vote', 'create-item')
   * @param maxAttempts - Maximum attempts allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if the action should be allowed, false if rate limited
   */
  public checkLimit(
    key: string,
    maxAttempts: number,
    windowMs: number
  ): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (entry.count >= maxAttempts) {
      // Rate limit exceeded
      return false;
    }

    // Increment count
    entry.count++;
    return true;
  }

  /**
   * Get remaining time until rate limit resets
   * @param key - Unique key for the action
   * @returns Milliseconds until reset, or 0 if not rate limited
   */
  public getResetTime(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;

    const remaining = entry.resetTime - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Clear rate limit for a specific key
   * @param key - Unique key for the action
   */
  public clear(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all rate limits
   */
  public clearAll(): void {
    this.limits.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit wrapper for voting actions
 * @param userId - The user performing the action
 * @returns true if allowed, false if rate limited
 */
export function canVote(userId: string): boolean {
  return rateLimiter.checkLimit(
    `vote-${userId}`,
    10, // 10 votes
    60000 // per minute
  );
}

/**
 * Rate limit wrapper for creating items
 * @param userId - The user performing the action
 * @returns true if allowed, false if rate limited
 */
export function canCreateItem(userId: string): boolean {
  return rateLimiter.checkLimit(
    `create-${userId}`,
    RATE_LIMIT_CONFIG.MAX_ACTIONS_PER_MINUTE,
    60000 // per minute
  );
}

/**
 * Rate limit wrapper for deleting items
 * @param userId - The user performing the action
 * @returns true if allowed, false if rate limited
 */
export function canDeleteItem(userId: string): boolean {
  return rateLimiter.checkLimit(
    `delete-${userId}`,
    10, // 10 deletions
    60000 // per minute
  );
}

/**
 * Get cooldown time for an action
 * @param actionType - Type of action ('vote', 'create', 'delete')
 * @param userId - The user performing the action
 * @returns Milliseconds until the action is available again
 */
export function getCooldownTime(actionType: string, userId: string): number {
  return rateLimiter.getResetTime(`${actionType}-${userId}`);
}

/**
 * Generic rate limit check
 * @param key - Unique key for the rate limit
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): boolean {
  return rateLimiter.checkLimit(key, maxAttempts, windowMs);
}

export default rateLimiter;