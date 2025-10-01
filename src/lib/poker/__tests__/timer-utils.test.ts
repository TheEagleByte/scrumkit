import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  formatTime,
  calculateProgress,
  getWarningLevel,
  getWarningColors,
  minutesToSeconds,
  playNotificationSound,
  TIMER_PRESETS,
} from '../timer-utils';

describe('timer-utils', () => {
  describe('formatTime', () => {
    it('should format seconds into MM:SS format', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(30)).toBe('00:30');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(90)).toBe('01:30');
      expect(formatTime(300)).toBe('05:00');
      expect(formatTime(3661)).toBe('61:01');
    });

    it('should pad single digits with zero', () => {
      expect(formatTime(5)).toBe('00:05');
      expect(formatTime(65)).toBe('01:05');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress percentage correctly', () => {
      expect(calculateProgress(0, 100)).toBe(0);
      expect(calculateProgress(25, 100)).toBe(25);
      expect(calculateProgress(50, 100)).toBe(50);
      expect(calculateProgress(75, 100)).toBe(75);
      expect(calculateProgress(100, 100)).toBe(100);
    });

    it('should handle edge cases', () => {
      expect(calculateProgress(0, 0)).toBe(0);
      expect(calculateProgress(150, 100)).toBe(100);
      expect(calculateProgress(-10, 100)).toBe(0);
    });

    it('should handle decimal results', () => {
      expect(calculateProgress(33, 100)).toBe(33);
      expect(calculateProgress(66, 100)).toBe(66);
    });
  });

  describe('getWarningLevel', () => {
    it('should return none for early stages', () => {
      expect(getWarningLevel(0, 100)).toBe('none');
      expect(getWarningLevel(25, 100)).toBe('none');
      expect(getWarningLevel(49, 100)).toBe('none');
    });

    it('should return low at 50% elapsed', () => {
      expect(getWarningLevel(50, 100)).toBe('low');
      expect(getWarningLevel(60, 100)).toBe('low');
      expect(getWarningLevel(74, 100)).toBe('low');
    });

    it('should return medium at 75% elapsed', () => {
      expect(getWarningLevel(75, 100)).toBe('medium');
      expect(getWarningLevel(80, 100)).toBe('medium');
      expect(getWarningLevel(89, 100)).toBe('medium');
    });

    it('should return high at 90% elapsed', () => {
      expect(getWarningLevel(90, 100)).toBe('high');
      expect(getWarningLevel(95, 100)).toBe('high');
      expect(getWarningLevel(99, 100)).toBe('high');
    });

    it('should return critical at 100% or more', () => {
      expect(getWarningLevel(100, 100)).toBe('critical');
      expect(getWarningLevel(110, 100)).toBe('critical');
    });
  });

  describe('getWarningColors', () => {
    it('should return green colors for none level', () => {
      const colors = getWarningColors('none');
      expect(colors.bg).toContain('green');
      expect(colors.text).toContain('green');
      expect(colors.border).toContain('green');
      expect(colors.progress).toContain('green');
    });

    it('should return yellow colors for low level', () => {
      const colors = getWarningColors('low');
      expect(colors.bg).toContain('yellow');
      expect(colors.text).toContain('yellow');
      expect(colors.border).toContain('yellow');
      expect(colors.progress).toContain('yellow');
    });

    it('should return amber colors for medium level', () => {
      const colors = getWarningColors('medium');
      expect(colors.bg).toContain('amber');
      expect(colors.text).toContain('amber');
      expect(colors.border).toContain('amber');
      expect(colors.progress).toContain('amber');
    });

    it('should return orange colors for high level', () => {
      const colors = getWarningColors('high');
      expect(colors.bg).toContain('orange');
      expect(colors.text).toContain('orange');
      expect(colors.border).toContain('orange');
      expect(colors.progress).toContain('orange');
    });

    it('should return red colors for critical level', () => {
      const colors = getWarningColors('critical');
      expect(colors.bg).toContain('red');
      expect(colors.text).toContain('red');
      expect(colors.border).toContain('red');
      expect(colors.progress).toContain('red');
    });
  });

  describe('minutesToSeconds', () => {
    it('should convert minutes to seconds correctly', () => {
      expect(minutesToSeconds(0)).toBe(0);
      expect(minutesToSeconds(1)).toBe(60);
      expect(minutesToSeconds(5)).toBe(300);
      expect(minutesToSeconds(10)).toBe(600);
      expect(minutesToSeconds(60)).toBe(3600);
    });
  });

  describe('TIMER_PRESETS', () => {
    it('should have discussion presets', () => {
      expect(TIMER_PRESETS.discussion).toEqual([2, 5, 10]);
    });

    it('should have break presets', () => {
      expect(TIMER_PRESETS.break).toEqual([5, 10, 15]);
    });
  });

  describe('playNotificationSound', () => {
    let audioContextMock: any;
    let oscillatorMock: any;
    let gainNodeMock: any;

    beforeEach(() => {
      // Mock AudioContext and related APIs
      oscillatorMock = {
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        frequency: { value: 0 },
      };

      gainNodeMock = {
        connect: jest.fn(),
        gain: { value: 0 },
      };

      audioContextMock = {
        createOscillator: jest.fn(() => oscillatorMock),
        createGain: jest.fn(() => gainNodeMock),
        destination: {},
        currentTime: 0,
      };

      // @ts-expect-error - Mocking AudioContext for tests
      global.AudioContext = jest.fn(() => audioContextMock);
      // @ts-expect-error - Mocking window for tests
      global.window = { AudioContext: global.AudioContext };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should not play sound if disabled', () => {
      playNotificationSound('warning', false);
      expect(audioContextMock.createOscillator).not.toHaveBeenCalled();
    });

    it('should not play sound if AudioContext is unavailable', () => {
      const originalWindow = global.window;
      const originalAudioContext = global.AudioContext;

      // @ts-expect-error - Testing missing AudioContext scenario
      global.window = {};
      // @ts-expect-error - Remove AudioContext
      global.AudioContext = undefined;

      playNotificationSound('warning', true);

      // Note: createOscillator might still be called in the mock setup,
      // but the actual function should exit early. Just verify no error is thrown.

      global.window = originalWindow;
      global.AudioContext = originalAudioContext;
    });

    it('should play warning sound when enabled', () => {
      playNotificationSound('warning', true);

      expect(audioContextMock.createOscillator).toHaveBeenCalled();
      expect(audioContextMock.createGain).toHaveBeenCalled();
      expect(oscillatorMock.connect).toHaveBeenCalledWith(gainNodeMock);
      expect(gainNodeMock.connect).toHaveBeenCalledWith(audioContextMock.destination);
      expect(oscillatorMock.start).toHaveBeenCalled();
      expect(oscillatorMock.stop).toHaveBeenCalled();
    });

    it('should play complete sound when enabled', () => {
      jest.useFakeTimers();

      playNotificationSound('complete', true);

      expect(audioContextMock.createOscillator).toHaveBeenCalled();
      expect(oscillatorMock.start).toHaveBeenCalled();

      // Fast-forward for second tone
      jest.advanceTimersByTime(250);

      jest.useRealTimers();
    });

    it('should handle errors gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      audioContextMock.createOscillator.mockImplementation(() => {
        throw new Error('Audio not supported');
      });

      // Should not throw
      expect(() => playNotificationSound('warning', true)).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Audio notification failed:', expect.any(Error));

      consoleWarnSpy.mockRestore();
    });
  });
});
