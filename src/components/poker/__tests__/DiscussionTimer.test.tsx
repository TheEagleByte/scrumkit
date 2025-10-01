import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DiscussionTimer } from '../DiscussionTimer';
import * as timerHook from '@/hooks/use-discussion-timer';

// Mock the timer hook
vi.mock('@/hooks/use-discussion-timer');

describe('DiscussionTimer', () => {
  const mockStart = vi.fn();
  const mockPause = vi.fn();
  const mockResume = vi.fn();
  const mockReset = vi.fn();
  const mockToggleSound = vi.fn();
  const mockAddTime = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    vi.mocked(timerHook.useDiscussionTimer).mockReturnValue({
      state: {
        totalSeconds: 0,
        elapsedSeconds: 0,
        isRunning: false,
        isPaused: false,
        isComplete: false,
      },
      remainingSeconds: 0,
      soundEnabled: true,
      start: mockStart,
      pause: mockPause,
      resume: mockResume,
      reset: mockReset,
      toggleSound: mockToggleSound,
      addTime: mockAddTime,
    });
  });

  describe('Initial State', () => {
    it('should render the timer component', () => {
      render(<DiscussionTimer />);
      expect(screen.getByText('Discussion Timer')).toBeInTheDocument();
    });

    it('should show preset buttons when timer is not running', () => {
      render(<DiscussionTimer />);
      expect(screen.getByText('2 min')).toBeInTheDocument();
      expect(screen.getByText('5 min')).toBeInTheDocument();
      expect(screen.getByText('10 min')).toBeInTheDocument();
    });

    it('should show custom time input', () => {
      render(<DiscussionTimer />);
      expect(screen.getByPlaceholderText('Custom')).toBeInTheDocument();
    });

    it('should show sound toggle button', () => {
      render(<DiscussionTimer />);
      const soundButton = screen.getByTitle('Mute notifications');
      expect(soundButton).toBeInTheDocument();
    });

    it('should show discussion/break mode toggle', () => {
      render(<DiscussionTimer />);
      expect(screen.getByText('Discussion')).toBeInTheDocument();
    });
  });

  describe('Preset Buttons', () => {
    it('should start timer with 2 minutes when 2 min button is clicked', () => {
      render(<DiscussionTimer />);
      fireEvent.click(screen.getByText('2 min'));
      expect(mockStart).toHaveBeenCalledWith(120);
    });

    it('should start timer with 5 minutes when 5 min button is clicked', () => {
      render(<DiscussionTimer />);
      fireEvent.click(screen.getByText('5 min'));
      expect(mockStart).toHaveBeenCalledWith(300);
    });

    it('should start timer with 10 minutes when 10 min button is clicked', () => {
      render(<DiscussionTimer />);
      fireEvent.click(screen.getByText('10 min'));
      expect(mockStart).toHaveBeenCalledWith(600);
    });
  });

  describe('Break Mode', () => {
    it('should toggle to break mode', () => {
      render(<DiscussionTimer />);
      const breakButton = screen.getByText('Discussion');
      fireEvent.click(breakButton);
      expect(screen.getByText('Break')).toBeInTheDocument();
    });

    it('should show break presets when in break mode', () => {
      render(<DiscussionTimer />);
      const breakButton = screen.getByText('Discussion');
      fireEvent.click(breakButton);

      // After clicking, button text changes to "Break"
      expect(screen.getByText('5 min')).toBeInTheDocument();
      expect(screen.getByText('10 min')).toBeInTheDocument();
      expect(screen.getByText('15 min')).toBeInTheDocument();
    });

    it('should disable break toggle when timer is running', () => {
      vi.mocked(timerHook.useDiscussionTimer).mockReturnValue({
        state: {
          totalSeconds: 300,
          elapsedSeconds: 60,
          isRunning: true,
          isPaused: false,
          isComplete: false,
        },
        remainingSeconds: 240,
        soundEnabled: true,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        toggleSound: mockToggleSound,
        addTime: mockAddTime,
      });

      render(<DiscussionTimer />);
      const breakButton = screen.getByText('Discussion');
      expect(breakButton).toBeDisabled();
    });
  });

  describe('Custom Time Input', () => {
    it('should start timer with custom time', () => {
      render(<DiscussionTimer />);
      const input = screen.getByPlaceholderText('Custom');
      const startButton = screen.getByRole('button', { name: /start/i });

      fireEvent.change(input, { target: { value: '7' } });
      fireEvent.click(startButton);

      expect(mockStart).toHaveBeenCalledWith(420); // 7 * 60
    });

    it('should start timer on Enter key', () => {
      render(<DiscussionTimer />);
      const input = screen.getByPlaceholderText('Custom');

      fireEvent.change(input, { target: { value: '3' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockStart).toHaveBeenCalledWith(180);
    });

    it('should disable start button when input is empty', () => {
      render(<DiscussionTimer />);
      const startButton = screen.getByRole('button', { name: /start/i });
      expect(startButton).toBeDisabled();
    });

    it('should clear input after starting', () => {
      render(<DiscussionTimer />);
      const input = screen.getByPlaceholderText('Custom') as HTMLInputElement;
      const startButton = screen.getByRole('button', { name: /start/i });

      fireEvent.change(input, { target: { value: '5' } });
      fireEvent.click(startButton);

      expect(input.value).toBe('');
    });
  });

  describe('Running Timer', () => {
    beforeEach(() => {
      vi.mocked(timerHook.useDiscussionTimer).mockReturnValue({
        state: {
          totalSeconds: 300,
          elapsedSeconds: 60,
          isRunning: true,
          isPaused: false,
          isComplete: false,
        },
        remainingSeconds: 240,
        soundEnabled: true,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        toggleSound: mockToggleSound,
        addTime: mockAddTime,
      });
    });

    it('should display remaining time', () => {
      render(<DiscussionTimer />);
      expect(screen.getByText('04:00')).toBeInTheDocument();
    });

    it('should show pause button', () => {
      render(<DiscussionTimer />);
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    it('should show reset button', () => {
      render(<DiscussionTimer />);
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should show add time button', () => {
      render(<DiscussionTimer />);
      expect(screen.getByText('+1 min')).toBeInTheDocument();
    });

    it('should call pause when pause button is clicked', () => {
      render(<DiscussionTimer />);
      fireEvent.click(screen.getByText('Pause'));
      expect(mockPause).toHaveBeenCalled();
    });

    it('should call reset when reset button is clicked', () => {
      render(<DiscussionTimer />);
      fireEvent.click(screen.getByText('Reset'));
      expect(mockReset).toHaveBeenCalled();
    });

    it('should call addTime when +1 min button is clicked', () => {
      render(<DiscussionTimer />);
      fireEvent.click(screen.getByText('+1 min'));
      expect(mockAddTime).toHaveBeenCalledWith(60);
    });

    it('should not show preset buttons when running', () => {
      render(<DiscussionTimer />);
      expect(screen.queryByText('2 min')).not.toBeInTheDocument();
    });
  });

  describe('Paused Timer', () => {
    beforeEach(() => {
      vi.mocked(timerHook.useDiscussionTimer).mockReturnValue({
        state: {
          totalSeconds: 300,
          elapsedSeconds: 60,
          isRunning: true,
          isPaused: true,
          isComplete: false,
        },
        remainingSeconds: 240,
        soundEnabled: true,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        toggleSound: mockToggleSound,
        addTime: mockAddTime,
      });
    });

    it('should show paused badge', () => {
      render(<DiscussionTimer />);
      expect(screen.getByText('Paused')).toBeInTheDocument();
    });

    it('should show resume button', () => {
      render(<DiscussionTimer />);
      expect(screen.getByText('Resume')).toBeInTheDocument();
    });

    it('should call resume when resume button is clicked', () => {
      render(<DiscussionTimer />);
      fireEvent.click(screen.getByText('Resume'));
      expect(mockResume).toHaveBeenCalled();
    });
  });

  describe('Completed Timer', () => {
    beforeEach(() => {
      vi.mocked(timerHook.useDiscussionTimer).mockReturnValue({
        state: {
          totalSeconds: 300,
          elapsedSeconds: 300,
          isRunning: true,
          isPaused: false,
          isComplete: true,
        },
        remainingSeconds: 0,
        soundEnabled: true,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        toggleSound: mockToggleSound,
        addTime: mockAddTime,
      });
    });

    it('should show time\'s up badge', () => {
      render(<DiscussionTimer />);
      expect(screen.getByText("Time's Up!")).toBeInTheDocument();
    });

    it('should display 00:00', () => {
      render(<DiscussionTimer />);
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });

    it('should disable add time button', () => {
      render(<DiscussionTimer />);
      const addButton = screen.getByText('+1 min').closest('button');
      expect(addButton).toBeDisabled();
    });
  });

  describe('Sound Control', () => {
    it('should toggle sound when sound button is clicked', () => {
      render(<DiscussionTimer />);
      const soundButton = screen.getByTitle('Mute notifications');
      fireEvent.click(soundButton);
      expect(mockToggleSound).toHaveBeenCalled();
    });

    it('should show muted icon when sound is disabled', () => {
      vi.mocked(timerHook.useDiscussionTimer).mockReturnValue({
        state: {
          totalSeconds: 0,
          elapsedSeconds: 0,
          isRunning: false,
          isPaused: false,
          isComplete: false,
        },
        remainingSeconds: 0,
        soundEnabled: false,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        toggleSound: mockToggleSound,
        addTime: mockAddTime,
      });

      render(<DiscussionTimer />);
      expect(screen.getByTitle('Enable notifications')).toBeInTheDocument();
    });
  });

  describe('Progress Display', () => {
    it('should show progress percentage', () => {
      vi.mocked(timerHook.useDiscussionTimer).mockReturnValue({
        state: {
          totalSeconds: 300,
          elapsedSeconds: 150,
          isRunning: true,
          isPaused: false,
          isComplete: false,
        },
        remainingSeconds: 150,
        soundEnabled: true,
        start: mockStart,
        pause: mockPause,
        resume: mockResume,
        reset: mockReset,
        toggleSound: mockToggleSound,
        addTime: mockAddTime,
      });

      render(<DiscussionTimer />);
      expect(screen.getByText('50% elapsed')).toBeInTheDocument();
    });
  });
});
