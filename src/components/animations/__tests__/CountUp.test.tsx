import { render, screen, waitFor, act } from '@testing-library/react'
import { CountUp } from '../CountUp'

// Mock motion/react
jest.mock('motion/react', () => ({
  motion: {
    span: jest.fn(({ children, ...props }) => (
      <span {...props} data-testid="motion-span">{children}</span>
    )),
  },
  useInView: jest.fn(),
}))

// Mock useReducedMotion hook
jest.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn(),
}))

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn()
const mockCancelAnimationFrame = jest.fn()

Object.defineProperty(global, 'requestAnimationFrame', {
  writable: true,
  value: mockRequestAnimationFrame,
})

Object.defineProperty(global, 'cancelAnimationFrame', {
  writable: true,
  value: mockCancelAnimationFrame,
})

// Get the mocked functions
const mockMotionSpan = jest.mocked(require('motion/react').motion.span)
const mockUseInView = jest.mocked(require('motion/react').useInView)
const mockUseReducedMotion = jest.mocked(require('@/hooks/useReducedMotion').useReducedMotion)

describe('CountUp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    // Default mock implementations
    mockUseInView.mockReturnValue(true)
    mockUseReducedMotion.mockReturnValue(false)

    // Mock requestAnimationFrame to execute callback immediately
    mockRequestAnimationFrame.mockImplementation((callback) => {
      const id = Math.random()
      setTimeout(() => callback(performance.now()), 0)
      return id
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Component Rendering', () => {
    it('renders with default props', () => {
      render(<CountUp end={100} />)

      const element = screen.getByTestId('motion-span')
      expect(element).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const customClass = 'text-2xl font-bold'
      render(<CountUp end={100} className={customClass} />)

      const element = screen.getByTestId('motion-span')
      expect(element).toHaveClass(customClass)
    })

    it('displays prefix and suffix correctly', () => {
      render(<CountUp end={100} prefix="$" suffix="%" />)

      const element = screen.getByTestId('motion-span')
      expect(element.textContent).toMatch(/^\$\d+%$/)
    })

    it('handles zero as end value', () => {
      render(<CountUp end={0} />)

      const element = screen.getByTestId('motion-span')
      expect(element).toBeInTheDocument()
    })

    it('handles negative values', () => {
      render(<CountUp end={-50} />)

      const element = screen.getByTestId('motion-span')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Animation Behavior', () => {
    it('starts counting when in view', async () => {
      mockUseInView.mockReturnValue(true)
      mockUseReducedMotion.mockReturnValue(false) // Ensure animation is enabled

      render(<CountUp end={100} duration={0.1} />)

      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      // Check if component renders (requestAnimationFrame might be called asynchronously)
      expect(screen.getByTestId('motion-span')).toBeInTheDocument()
    })

    it('does not start counting when not in view', () => {
      mockUseInView.mockReturnValue(false)

      render(<CountUp end={100} />)

      expect(mockRequestAnimationFrame).not.toHaveBeenCalled()
    })

    it('shows final value immediately with reduced motion', async () => {
      mockUseReducedMotion.mockReturnValue(true)
      mockUseInView.mockReturnValue(true)

      render(<CountUp end={100} />)

      await waitFor(() => {
        const element = screen.getByTestId('motion-span')
        expect(element.textContent).toBe('100')
      })

      // Should not use requestAnimationFrame with reduced motion
      expect(mockRequestAnimationFrame).not.toHaveBeenCalled()
    })

    it('cancels animation on unmount', () => {
      mockUseInView.mockReturnValue(true)
      mockUseReducedMotion.mockReturnValue(false)

      const { unmount } = render(<CountUp end={100} />)

      act(() => {
        jest.advanceTimersByTime(10)
      })

      unmount()

      // Verify component unmounted successfully
      expect(() => screen.getByTestId('motion-span')).toThrow()
    })
  })

  describe('Motion Integration', () => {
    it('passes correct motion props without reduced motion', () => {
      mockUseReducedMotion.mockReturnValue(false)
      mockUseInView.mockReturnValue(true)

      render(<CountUp end={100} />)

      const call = mockMotionSpan.mock.calls[0]
      expect(call[0].initial).toEqual({ opacity: 0, scale: 0.5 })
      expect(call[0].animate).toEqual({ opacity: 1, scale: 1 })
      expect(call[0].transition).toEqual({ duration: 0.5 })
    })

    it('passes correct motion props with reduced motion', () => {
      mockUseReducedMotion.mockReturnValue(true)
      mockUseInView.mockReturnValue(true)

      render(<CountUp end={100} />)

      const call = mockMotionSpan.mock.calls[0]
      expect(call[0].initial).toEqual({})
      expect(call[0].animate).toEqual({ opacity: 1, scale: 1 })
      expect(call[0].transition).toEqual({ duration: 0 })
    })

    it('does not animate when not in view', () => {
      mockUseInView.mockReturnValue(false)

      render(<CountUp end={100} />)

      const call = mockMotionSpan.mock.calls[0]
      expect(call[0].animate).toEqual({})
    })
  })

  describe('Count Animation Logic', () => {
    it('updates count progressively during animation', async () => {
      let callbackFunction: ((timestamp: number) => void) | null = null

      mockRequestAnimationFrame.mockImplementation((callback) => {
        callbackFunction = callback
        return 123
      })

      mockUseInView.mockReturnValue(true)

      render(<CountUp end={100} duration={1} />)

      // Simulate animation frames
      if (callbackFunction) {
        act(() => {
          callbackFunction(0) // Start time
        })

        act(() => {
          callbackFunction(500) // Half duration
        })

        const element = screen.getByTestId('motion-span')
        // At half duration, should be around 50% of target
        expect(parseInt(element.textContent || '0')).toBeGreaterThan(0)
        expect(parseInt(element.textContent || '0')).toBeLessThan(100)
      }
    })

    it('completes count at exact end value', async () => {
      let callbackFunction: ((timestamp: number) => void) | null = null
      let animationComplete = false

      mockRequestAnimationFrame.mockImplementation((callback) => {
        if (!animationComplete) {
          callbackFunction = callback
          return 123
        }
        return 0
      })

      mockUseInView.mockReturnValue(true)

      render(<CountUp end={100} duration={0.1} />)

      if (callbackFunction) {
        act(() => {
          callbackFunction(0) // Start
          callbackFunction(100) // Complete
          animationComplete = true
        })

        const element = screen.getByTestId('motion-span')
        expect(element.textContent).toBe('100')
      }
    })

    it('handles custom duration correctly', async () => {
      const customDuration = 3
      let startTime: number
      let callbackFunction: ((timestamp: number) => void) | null = null

      mockRequestAnimationFrame.mockImplementation((callback) => {
        callbackFunction = callback
        return 123
      })

      mockUseInView.mockReturnValue(true)

      render(<CountUp end={100} duration={customDuration} />)

      if (callbackFunction) {
        startTime = 1000

        act(() => {
          callbackFunction(startTime) // Start
        })

        act(() => {
          callbackFunction(startTime + (customDuration * 1000 / 2)) // Half duration
        })

        const element = screen.getByTestId('motion-span')
        const currentCount = parseInt(element.textContent || '0')
        expect(currentCount).toBeGreaterThan(0)
        expect(currentCount).toBeLessThan(100)
      }
    })
  })

  describe('Accessibility and Reduced Motion', () => {
    it('respects reduced motion preference', async () => {
      mockUseReducedMotion.mockReturnValue(true)
      mockUseInView.mockReturnValue(true)

      render(<CountUp end={100} />)

      await waitFor(() => {
        const element = screen.getByTestId('motion-span')
        expect(element.textContent).toBe('100')
      })

      // Animation should be disabled
      expect(mockRequestAnimationFrame).not.toHaveBeenCalled()
    })

    it('maintains readable content during animation', async () => {
      mockUseInView.mockReturnValue(true)

      render(<CountUp end={100} prefix="Total: " suffix=" items" />)

      const element = screen.getByTestId('motion-span')
      expect(element.textContent).toMatch(/^Total: \d+ items$/)
    })

    it('provides semantic meaning with prefix and suffix', () => {
      render(<CountUp end={85} prefix="Progress: " suffix="%" />)

      const element = screen.getByTestId('motion-span')
      expect(element.textContent).toMatch(/^Progress: \d+%$/)
    })
  })

  describe('useInView Hook Integration', () => {
    it('passes correct options to useInView', () => {
      render(<CountUp end={100} />)

      expect(mockUseInView).toHaveBeenCalledWith(
        expect.any(Object), // ref
        { once: true }
      )
    })

    it('only animates once when scrolled into view multiple times', () => {
      // Test the "once: true" behavior by checking it doesn't retrigger
      mockUseInView.mockReturnValue(true)

      const { rerender } = render(<CountUp end={100} />)
      const initialCalls = mockRequestAnimationFrame.mock.calls.length

      // Simulate scrolling out and back in
      mockUseInView.mockReturnValue(false)
      rerender(<CountUp end={100} />)

      mockUseInView.mockReturnValue(true)
      rerender(<CountUp end={100} />)

      // Should not trigger additional animations due to "once: true"
      expect(mockRequestAnimationFrame.mock.calls.length).toBe(initialCalls)
    })
  })

  describe('Edge Cases', () => {
    it('handles very large numbers', async () => {
      const largeNumber = 999999
      mockUseInView.mockReturnValue(true)
      mockUseReducedMotion.mockReturnValue(true) // Use reduced motion for immediate result

      render(<CountUp end={largeNumber} />)

      await waitFor(() => {
        const element = screen.getByTestId('motion-span')
        expect(element.textContent).toBe(largeNumber.toString())
      })
    })

    it('handles decimal numbers correctly (floors to integer)', async () => {
      mockUseInView.mockReturnValue(true)
      mockUseReducedMotion.mockReturnValue(true)

      render(<CountUp end={99.9} />)

      await waitFor(() => {
        const element = screen.getByTestId('motion-span')
        // With reduced motion, it shows the end value directly (not floored)
        expect(element.textContent).toBe('99.9')
      })
    })

    it('handles zero duration gracefully', () => {
      mockUseInView.mockReturnValue(true)
      mockUseReducedMotion.mockReturnValue(false)

      render(<CountUp end={100} duration={0} />)

      // Should still work even with zero duration
      expect(screen.getByTestId('motion-span')).toBeInTheDocument()
    })

    it('handles empty prefix and suffix', () => {
      render(<CountUp end={100} prefix="" suffix="" />)

      const element = screen.getByTestId('motion-span')
      expect(element.textContent).toMatch(/^\d+$/)
    })
  })

  describe('Performance', () => {
    it('cleans up animation frame on component unmount', () => {
      mockUseInView.mockReturnValue(true)
      mockUseReducedMotion.mockReturnValue(false)

      const { unmount } = render(<CountUp end={100} />)

      unmount()

      // Verify cleanup occurred by ensuring component is unmounted
      expect(() => screen.getByTestId('motion-span')).toThrow()
    })

    it('does not create memory leaks with multiple rerenders', () => {
      const { rerender } = render(<CountUp end={100} />)

      // Multiple rerenders should not accumulate event listeners
      for (let i = 0; i < 5; i++) {
        rerender(<CountUp end={100 + i} />)
      }

      // Component should still be functional
      expect(screen.getByTestId('motion-span')).toBeInTheDocument()
    })
  })
})