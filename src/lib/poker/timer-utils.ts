// Timer utilities for Planning Poker discussion timers

/**
 * Format seconds into MM:SS format
 * @param seconds - Total seconds to format
 * @returns Formatted time string (MM:SS)
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate progress percentage
 * @param elapsed - Seconds elapsed
 * @param total - Total seconds
 * @returns Progress as percentage (0-100)
 */
export function calculateProgress(elapsed: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

/**
 * Determine warning level based on time elapsed
 * @param elapsed - Seconds elapsed
 * @param total - Total seconds
 * @returns Warning level: 'none' | 'low' | 'medium' | 'high' | 'critical'
 */
export function getWarningLevel(
  elapsed: number,
  total: number
): 'none' | 'low' | 'medium' | 'high' | 'critical' {
  if (total === 0) return 'none';
  const percentage = (elapsed / total) * 100;

  if (percentage >= 100) return 'critical';
  if (percentage >= 90) return 'high';
  if (percentage >= 75) return 'medium';
  if (percentage >= 50) return 'low';
  return 'none';
}

/**
 * Get color classes for warning level
 * @param level - Warning level
 * @returns Tailwind color classes
 */
export function getWarningColors(level: 'none' | 'low' | 'medium' | 'high' | 'critical'): {
  bg: string;
  text: string;
  border: string;
  progress: string;
} {
  switch (level) {
    case 'critical':
      return {
        bg: 'bg-red-50 dark:bg-red-950/20',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        progress: 'bg-red-500',
      };
    case 'high':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/20',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        progress: 'bg-orange-500',
      };
    case 'medium':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        progress: 'bg-amber-500',
      };
    case 'low':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-950/20',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800',
        progress: 'bg-yellow-500',
      };
    default:
      return {
        bg: 'bg-green-50 dark:bg-green-950/20',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        progress: 'bg-green-500',
      };
  }
}

/**
 * Convert minutes to seconds
 * @param minutes - Minutes to convert
 * @returns Total seconds
 */
export function minutesToSeconds(minutes: number): number {
  return minutes * 60;
}

/**
 * Preset timer durations in minutes
 */
export const TIMER_PRESETS = {
  discussion: [2, 5, 10],
  break: [5, 10, 15],
} as const;

/**
 * Play audio notification
 * @param type - Type of notification sound
 * @param enabled - Whether audio is enabled
 */
export function playNotificationSound(
  type: 'warning' | 'complete',
  enabled: boolean = true
): void {
  if (!enabled || typeof window === 'undefined') return;

  try {
    // Use Web Audio API to generate simple beep sounds
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different notification types
    if (type === 'warning') {
      oscillator.frequency.value = 800; // Higher pitch for warning
      gainNode.gain.value = 0.3;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } else {
      // Complete sound: two-tone beep
      oscillator.frequency.value = 600;
      gainNode.gain.value = 0.3;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);

      // Second tone
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.frequency.value = 800;
        gainNode2.gain.value = 0.3;
        oscillator2.start();
        oscillator2.stop(audioContext.currentTime + 0.2);
      }, 250);
    }
  } catch (error) {
    // Silently fail if audio is not supported
    console.warn('Audio notification failed:', error);
  }
}
