import { generateAnonymousUserName } from "./utils";
import { v4 as uuidv4 } from "uuid";

const ANONYMOUS_USER_KEY = "scrumkit_anonymous_user";

export interface AnonymousUser {
  id: string;
  name: string;
  createdAt: number;
}

/**
 * Get or create a persistent anonymous user for the browser session
 */
export function getOrCreateAnonymousUser(): AnonymousUser {
  if (typeof window === "undefined") {
    // Server-side: generate temporary user
    return {
      id: `anon-${uuidv4()}`,
      name: generateAnonymousUserName(),
      createdAt: Date.now(),
    };
  }

  // Client-side: check localStorage for existing user
  const stored = localStorage.getItem(ANONYMOUS_USER_KEY);

  if (stored) {
    try {
      const user = JSON.parse(stored) as AnonymousUser;
      // Validate the stored data
      if (user.id && user.name && user.createdAt) {
        return user;
      }
    } catch {
      // Invalid data, create new
    }
  }

  // Create new anonymous user
  const newUser: AnonymousUser = {
    id: `anon-${uuidv4()}`,
    name: generateAnonymousUserName(),
    createdAt: Date.now(),
  };

  // Store in localStorage
  localStorage.setItem(ANONYMOUS_USER_KEY, JSON.stringify(newUser));

  return newUser;
}

/**
 * Clear the stored anonymous user (useful for "sign out" functionality)
 */
export function clearAnonymousUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ANONYMOUS_USER_KEY);
  }
}

/**
 * Check if a user ID is an anonymous user
 */
export function isAnonymousUser(userId: string): boolean {
  return userId.startsWith("anon-");
}