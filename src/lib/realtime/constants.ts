/**
 * Real-time infrastructure configuration constants
 */

// Connection and retry configuration
export const CONNECTION_CONFIG = {
  MAX_RETRY_ATTEMPTS: 10, // Increased for better resilience
  INITIAL_RETRY_DELAY: 1000, // 1 second
  MAX_RETRY_DELAY: 60000, // 60 seconds
  CONNECTION_CHECK_INTERVAL: 30000, // 30 seconds
} as const;

// Presence and activity tracking
export const PRESENCE_CONFIG = {
  RECENTLY_ACTIVE_THRESHOLD: 60000, // 1 minute
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  PRESENCE_DEBOUNCE_MS: 200,
} as const;

// Cursor tracking configuration
export const CURSOR_CONFIG = {
  BROADCAST_THROTTLE: 100, // Increased from 50ms for better network performance
  MIN_MOVEMENT_DISTANCE: 5, // Minimum pixels before broadcasting
  CURSOR_HIDE_POSITION: -100,
} as const;

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  MAX_ACTIONS_PER_MINUTE: 30,
  VOTE_COOLDOWN_MS: 500,
  ITEM_CREATION_COOLDOWN_MS: 1000,
} as const;

// UI configuration
export const UI_CONFIG = {
  MAX_PRESENCE_AVATARS_DISPLAY: 5,
  TOAST_DURATION: 4000,
  ANIMATION_DURATION: 150,
} as const;

// Color palette for user identification
export const USER_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA07A", // Light Salmon
  "#98D8C8", // Mint
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#85C1E2", // Sky Blue
  "#F8B739", // Orange
  "#52B788", // Green
  "#FA7268", // Coral
  "#6C5CE7", // Violet
  "#00B894", // Turquoise
  "#FDCB6E", // Mustard
  "#6AB04C", // Lime
  "#C44569", // Rose
  "#3742FA", // Royal Blue
  "#F8B500", // Amber
  "#786FA6", // Lavender
  "#EA8685", // Pink
] as const;