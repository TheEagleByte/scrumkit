import { useRef, useEffect, useCallback } from "react";

export interface TouchGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  threshold?: number; // Minimum distance for a swipe (px)
  longPressDelay?: number; // Duration for long press (ms)
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  isLongPress: boolean;
}

const DEFAULT_THRESHOLD = 50; // 50px minimum swipe distance
const DEFAULT_LONG_PRESS_DELAY = 500; // 500ms for long press

/**
 * Hook for detecting touch gestures
 * @param config - Configuration for gesture callbacks and thresholds
 */
export function useTouch(config: TouchGestureConfig) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    threshold = DEFAULT_THRESHOLD,
    longPressDelay = DEFAULT_LONG_PRESS_DELAY,
  } = config;

  const touchState = useRef<TouchState | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      touchState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        isLongPress: false,
      };

      // Start long press timer
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          if (touchState.current) {
            touchState.current.isLongPress = true;
            onLongPress();
          }
        }, longPressDelay);
      }
    },
    [onLongPress, longPressDelay]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (!touchState.current) return;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const { startX, startY, startTime, isLongPress } = touchState.current;
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const duration = endTime - startTime;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // If it was a long press, don't process other gestures
      if (isLongPress) {
        touchState.current = null;
        return;
      }

      // Check if it's a tap (short duration, minimal movement)
      if (duration < 300 && absX < 10 && absY < 10) {
        if (onTap) {
          onTap();
        }
        touchState.current = null;
        return;
      }

      // Check for swipe gestures
      if (absX > threshold || absY > threshold) {
        // Determine swipe direction (horizontal or vertical)
        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }

      touchState.current = null;
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, threshold]
  );

  const handleTouchCancel = useCallback(() => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    touchState.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return {
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
  };
}

/**
 * Hook for detecting swipe gestures on a specific element
 * @param ref - Ref to the element to attach listeners to
 * @param config - Configuration for gesture callbacks
 */
export function useSwipe<T extends HTMLElement>(
  ref: React.RefObject<T>,
  config: TouchGestureConfig
) {
  const { handleTouchStart, handleTouchEnd, handleTouchCancel } =
    useTouch(config);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });
    element.addEventListener("touchcancel", handleTouchCancel, {
      passive: true,
    });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [ref, handleTouchStart, handleTouchEnd, handleTouchCancel]);
}
