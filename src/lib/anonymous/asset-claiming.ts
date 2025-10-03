/**
 * Generic Anonymous Asset Claiming System
 *
 * This module provides a centralized, type-safe system for claiming anonymous assets
 * when a user creates an account. It's designed to be extensible for future asset types.
 *
 * Architecture:
 * - Define asset types and their configuration
 * - Client-side localStorage tracking
 * - Server-side cookie validation
 * - Database updates to associate assets with user profile
 *
 * Currently supports:
 * - Retrospective boards
 * - Planning poker sessions
 *
 * To add a new asset type:
 * 1. Add type to AssetType union
 * 2. Add configuration to ASSET_CONFIG
 * 3. Implement localStorage tracking in creation function
 * 4. No changes to claiming logic needed!
 */

/**
 * Supported anonymous asset types
 */
export type AssetType = "retrospective" | "poker_session";

/**
 * Configuration for a claimable asset type
 */
export interface AssetConfig {
  /** Key for storing asset IDs in localStorage */
  localStorageKey: string;
  /** Key for storing asset URLs in cookies (server-side) */
  cookieKey: string;
  /** Database table name */
  tableName: string;
  /** Primary key field name */
  idField: string;
  /** Field to set to user ID when claiming */
  ownerField: string;
  /** Field to set to false when claiming */
  anonymousField: string;
  /** Human-readable name for display */
  displayName: string;
  /** Plural form for display */
  displayNamePlural: string;
}

/**
 * Configuration for all supported asset types
 *
 * This centralized configuration makes it easy to add new asset types.
 */
export const ASSET_CONFIG: Record<AssetType, AssetConfig> = {
  retrospective: {
    localStorageKey: "scrumkit_anonymous_boards",
    cookieKey: "scrumkit_boards",
    tableName: "retrospectives",
    idField: "id",
    ownerField: "created_by",
    anonymousField: "is_anonymous",
    displayName: "board",
    displayNamePlural: "boards",
  },
  poker_session: {
    localStorageKey: "scrumkit_anonymous_poker_sessions",
    cookieKey: "scrumkit_poker_sessions",
    tableName: "poker_sessions",
    idField: "id",
    ownerField: "created_by",
    anonymousField: "is_anonymous",
    displayName: "poker session",
    displayNamePlural: "poker sessions",
  },
};

/**
 * Collection of asset IDs to be claimed
 */
export interface AssetCollection {
  retrospectives: string[];
  pokerSessions: string[];
}

/**
 * Result of claiming operation
 */
export interface ClaimResult {
  retrospectives: number;
  pokerSessions: number;
  total: number;
}

/**
 * Store an anonymous asset ID in localStorage
 *
 * @param assetType - Type of asset to store
 * @param assetId - ID of the asset
 */
export function storeAnonymousAsset(
  assetType: AssetType,
  assetId: string
): void {
  if (typeof window === "undefined") return;

  const config = ASSET_CONFIG[assetType];
  const stored = localStorage.getItem(config.localStorageKey);
  let assets: string[] = [];

  if (stored) {
    try {
      assets = JSON.parse(stored);
      if (!Array.isArray(assets)) {
        assets = [];
      }
    } catch {
      // Invalid data, start fresh
      assets = [];
    }
  }

  // Add asset if not already present
  if (!assets.includes(assetId)) {
    assets.push(assetId);
  }

  localStorage.setItem(config.localStorageKey, JSON.stringify(assets));
}

/**
 * Get all anonymous asset IDs for a specific type
 *
 * @param assetType - Type of assets to retrieve
 * @returns Array of asset IDs
 */
export function getAnonymousAssets(assetType: AssetType): string[] {
  if (typeof window === "undefined") return [];

  const config = ASSET_CONFIG[assetType];
  const stored = localStorage.getItem(config.localStorageKey);

  if (!stored) return [];

  try {
    const assets = JSON.parse(stored);
    return Array.isArray(assets) ? assets : [];
  } catch {
    return [];
  }
}

/**
 * Get all anonymous assets across all types
 *
 * @returns Collection of asset IDs grouped by type
 */
export function getAllAnonymousAssets(): AssetCollection {
  return {
    retrospectives: getAnonymousAssets("retrospective"),
    pokerSessions: getAnonymousAssets("poker_session"),
  };
}

/**
 * Clear all stored anonymous assets from localStorage
 *
 * Call this after successfully claiming assets.
 */
export function clearAllAnonymousAssets(): void {
  if (typeof window === "undefined") return;

  Object.values(ASSET_CONFIG).forEach((config) => {
    localStorage.removeItem(config.localStorageKey);
  });
}

/**
 * Clear anonymous assets for a specific type
 *
 * @param assetType - Type of assets to clear
 */
export function clearAnonymousAssets(assetType: AssetType): void {
  if (typeof window === "undefined") return;

  const config = ASSET_CONFIG[assetType];
  localStorage.removeItem(config.localStorageKey);
}

/**
 * Count total number of claimable assets
 *
 * @returns Total count of all anonymous assets
 */
export function getAnonymousAssetCount(): number {
  const assets = getAllAnonymousAssets();
  return assets.retrospectives.length + assets.pokerSessions.length;
}

/**
 * Format a claim result into a human-readable message
 *
 * @param result - Result of claiming operation
 * @returns Formatted message for display to user
 */
export function formatClaimResultMessage(result: ClaimResult): {
  title: string;
  description: string;
} {
  if (result.total === 0) {
    return {
      title: "No assets to claim",
      description: "You don't have any anonymous assets to save.",
    };
  }

  const parts: string[] = [];

  if (result.retrospectives > 0) {
    parts.push(
      `${result.retrospectives} ${
        result.retrospectives === 1 ? "board" : "boards"
      }`
    );
  }

  if (result.pokerSessions > 0) {
    parts.push(
      `${result.pokerSessions} ${
        result.pokerSessions === 1 ? "poker session" : "poker sessions"
      }`
    );
  }

  const description = parts.join(" and ");

  return {
    title: `Saved ${result.total} ${result.total === 1 ? "item" : "items"} to your account`,
    description: `Your ${description} ${result.total === 1 ? "is" : "are"} now permanently saved.`,
  };
}
