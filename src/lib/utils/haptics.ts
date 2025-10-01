/**
 * Haptic Feedback Utilities
 *
 * Provides haptic feedback for touch interactions using the Vibration API.
 * Falls back gracefully on devices/browsers that don't support vibration.
 */

type HapticPattern = number | number[];

export enum HapticFeedbackType {
  LIGHT = "light", // 10ms - For subtle feedback
  MEDIUM = "medium", // 20ms - For standard interactions
  HEAVY = "heavy", // 40ms - For important actions
  SUCCESS = "success", // Pattern for successful actions
  ERROR = "error", // Pattern for errors
  SELECTION = "selection", // For card/option selection
}

const HAPTIC_PATTERNS: Record<HapticFeedbackType, HapticPattern> = {
  [HapticFeedbackType.LIGHT]: 10,
  [HapticFeedbackType.MEDIUM]: 20,
  [HapticFeedbackType.HEAVY]: 40,
  [HapticFeedbackType.SUCCESS]: [10, 50, 20],
  [HapticFeedbackType.ERROR]: [30, 50, 30, 50, 30],
  [HapticFeedbackType.SELECTION]: 15,
};

/**
 * Check if the Vibration API is supported
 */
export function isHapticSupported(): boolean {
  return typeof window !== "undefined" && "vibrate" in navigator;
}

/**
 * Trigger haptic feedback
 * @param type - The type of haptic feedback to trigger
 * @param enabled - Whether haptic feedback is enabled (default: true)
 */
export function triggerHaptic(
  type: HapticFeedbackType = HapticFeedbackType.MEDIUM,
  enabled: boolean = true
): void {
  if (!enabled || !isHapticSupported()) {
    return;
  }

  const pattern = HAPTIC_PATTERNS[type];

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    // Silently fail if vibration is not supported or permission is denied
    console.debug("Haptic feedback not available:", error);
  }
}

/**
 * Cancel any ongoing vibration
 */
export function cancelHaptic(): void {
  if (isHapticSupported()) {
    try {
      navigator.vibrate(0);
    } catch (error) {
      console.debug("Could not cancel haptic feedback:", error);
    }
  }
}

/**
 * Create a custom haptic pattern
 * @param pattern - Array of vibration durations and pauses [vibrate, pause, vibrate, pause, ...]
 * @param enabled - Whether haptic feedback is enabled (default: true)
 */
export function triggerCustomHaptic(
  pattern: number[],
  enabled: boolean = true
): void {
  if (!enabled || !isHapticSupported()) {
    return;
  }

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.debug("Custom haptic feedback not available:", error);
  }
}

/**
 * Hook for managing haptic feedback preferences
 * Can be extended to read from user preferences/local storage
 */
export function getHapticPreference(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    const stored = localStorage.getItem("haptic-feedback-enabled");
    return stored !== "false"; // Default to enabled
  } catch {
    return true;
  }
}

/**
 * Save haptic feedback preference
 */
export function setHapticPreference(enabled: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem("haptic-feedback-enabled", String(enabled));
  } catch (error) {
    console.debug("Could not save haptic preference:", error);
  }
}
