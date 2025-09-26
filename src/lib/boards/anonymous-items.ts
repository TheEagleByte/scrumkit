/**
 * Client-side storage for anonymous user's item ownership
 * This avoids exposing anonymous user IDs in the database
 */

const ANONYMOUS_ITEMS_KEY = "scrumkit_anonymous_items";

interface AnonymousItemMapping {
  [itemId: string]: {
    anonymousUserId: string;
    createdAt: number;
  };
}

/**
 * Store that an anonymous user created an item
 */
export function storeAnonymousItemOwnership(itemId: string, anonymousUserId: string): void {
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem(ANONYMOUS_ITEMS_KEY);
  let mappings: AnonymousItemMapping = {};

  if (stored) {
    try {
      mappings = JSON.parse(stored);
    } catch {
      // Invalid data, start fresh
    }
  }

  mappings[itemId] = {
    anonymousUserId,
    createdAt: Date.now(),
  };

  // Clean up old entries (older than 7 days)
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  Object.entries(mappings).forEach(([id, data]) => {
    if (data.createdAt < weekAgo) {
      delete mappings[id];
    }
  });

  localStorage.setItem(ANONYMOUS_ITEMS_KEY, JSON.stringify(mappings));
}

/**
 * Check if an anonymous user owns an item
 */
export function isAnonymousItemOwner(itemId: string, anonymousUserId: string): boolean {
  if (typeof window === "undefined") return false;

  const stored = localStorage.getItem(ANONYMOUS_ITEMS_KEY);
  if (!stored) return false;

  try {
    const mappings: AnonymousItemMapping = JSON.parse(stored);
    return mappings[itemId]?.anonymousUserId === anonymousUserId;
  } catch {
    return false;
  }
}

/**
 * Get all items owned by an anonymous user
 */
export function getAnonymousUserItems(anonymousUserId: string): string[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(ANONYMOUS_ITEMS_KEY);
  if (!stored) return [];

  try {
    const mappings: AnonymousItemMapping = JSON.parse(stored);
    return Object.entries(mappings)
      .filter(([, data]) => data.anonymousUserId === anonymousUserId)
      .map(([itemId]) => itemId);
  } catch {
    return [];
  }
}

/**
 * Clear anonymous item ownership data
 */
export function clearAnonymousItemOwnership(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ANONYMOUS_ITEMS_KEY);
  }
}