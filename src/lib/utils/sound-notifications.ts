/**
 * Sound notification utilities for retrospective facilitation
 * Uses Web Audio API to generate simple notification sounds
 */

// Sound preferences stored in localStorage
const SOUND_ENABLED_KEY = 'scrumkit:sound-enabled';

/**
 * Check if sound notifications are enabled
 */
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(SOUND_ENABLED_KEY);
  return stored === null ? true : stored === 'true'; // Default to enabled
}

/**
 * Set sound notification preference
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_ENABLED_KEY, enabled.toString());
}

// Shared AudioContext instance to avoid exhausting browser limits
let sharedAudioContext: AudioContext | null = null;

/**
 * Get or create the shared AudioContext
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioContext) {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('AudioContext not supported');
      return null;
    }
    try {
      sharedAudioContext = new AudioContextClass();
    } catch (error) {
      console.error('Failed to create AudioContext:', error);
      return null;
    }
  }

  // Resume context if it's suspended (e.g., due to browser autoplay policies)
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(err => {
      console.error('Failed to resume AudioContext:', err);
    });
  }

  return sharedAudioContext;
}

/**
 * Play a simple beep sound using Web Audio API
 */
function playBeep(frequency: number, duration: number, volume: number = 0.3): void {
  if (!isSoundEnabled()) return;

  const audioContext = getAudioContext();
  if (!audioContext) return;

  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.error('Failed to play sound:', error);
  }
}

/**
 * Play timer completion notification
 * Double beep to indicate timer has finished
 */
export function playTimerComplete(): void {
  playBeep(800, 0.2, 0.4);
  setTimeout(() => playBeep(1000, 0.3, 0.4), 250);
}

/**
 * Play phase change notification
 * Single higher-pitched beep
 */
export function playPhaseChange(): void {
  playBeep(600, 0.15, 0.3);
}

/**
 * Play focus mode toggle notification
 * Quick low beep
 */
export function playFocusToggle(): void {
  playBeep(400, 0.1, 0.25);
}

/**
 * Play timer warning notification (1 minute remaining)
 * Three quick beeps
 */
export function playTimerWarning(): void {
  playBeep(700, 0.1, 0.3);
  setTimeout(() => playBeep(700, 0.1, 0.3), 150);
  setTimeout(() => playBeep(700, 0.1, 0.3), 300);
}
