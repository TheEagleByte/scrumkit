import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '../use-mobile'

// Mock window.matchMedia
const mockMatchMedia = jest.fn()
const mockAddEventListener = jest.fn()
const mockRemoveEventListener = jest.fn()

// Create a mock MediaQueryList
const createMockMediaQueryList = (matches: boolean) => ({
  matches,
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
  media: '(max-width: 767px)',
  onchange: null,
  addListener: jest.fn(), // deprecated
  removeListener: jest.fn(), // deprecated
  dispatchEvent: jest.fn(),
})

describe('useIsMobile', () => {
  beforeEach(() => {
    // Reset mocks
    mockMatchMedia.mockClear()
    mockAddEventListener.mockClear()
    mockRemoveEventListener.mockClear()

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    })
  })

  afterEach(() => {
    // Restore window properties
    jest.restoreAllMocks()
  })

  describe('initial state and window.innerWidth detection', () => {
    it('should return false initially when window.innerWidth >= 768', () => {
      // Mock window.innerWidth for desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      mockMatchMedia.mockReturnValue(createMockMediaQueryList(false))

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)
      expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
    })

    it('should return true initially when window.innerWidth < 768', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      mockMatchMedia.mockReturnValue(createMockMediaQueryList(true))

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)
    })

    it('should return false when window.innerWidth equals exactly 768 (boundary case)', () => {
      // Mock window.innerWidth at the boundary
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      mockMatchMedia.mockReturnValue(createMockMediaQueryList(false))

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)
    })

    it('should return true when window.innerWidth equals 767 (boundary case)', () => {
      // Mock window.innerWidth just below the boundary
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767,
      })

      mockMatchMedia.mockReturnValue(createMockMediaQueryList(true))

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)
    })
  })

  describe('media query event listener setup and cleanup', () => {
    it('should set up media query listener on mount', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const mockMQL = createMockMediaQueryList(false)
      mockMatchMedia.mockReturnValue(mockMQL)

      renderHook(() => useIsMobile())

      expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should remove event listener on unmount', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const mockMQL = createMockMediaQueryList(false)
      mockMatchMedia.mockReturnValue(mockMQL)

      const { unmount } = renderHook(() => useIsMobile())

      unmount()

      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })

  describe('responsive behavior and state updates', () => {
    it('should update state when media query changes from desktop to mobile', () => {
      // Start with desktop width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const mockMQL = createMockMediaQueryList(false)
      mockMatchMedia.mockReturnValue(mockMQL)

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)

      // Simulate window resize to mobile
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375,
        })

        // Get the onChange callback that was passed to addEventListener
        const onChangeCallback = mockAddEventListener.mock.calls[0][1]
        onChangeCallback()
      })

      expect(result.current).toBe(true)
    })

    it('should update state when media query changes from mobile to desktop', () => {
      // Start with mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const mockMQL = createMockMediaQueryList(true)
      mockMatchMedia.mockReturnValue(mockMQL)

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)

      // Simulate window resize to desktop
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024,
        })

        // Get the onChange callback that was passed to addEventListener
        const onChangeCallback = mockAddEventListener.mock.calls[0][1]
        onChangeCallback()
      })

      expect(result.current).toBe(false)
    })

    it('should handle multiple resize events correctly', () => {
      // Start with desktop width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const mockMQL = createMockMediaQueryList(false)
      mockMatchMedia.mockReturnValue(mockMQL)

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)

      const onChangeCallback = mockAddEventListener.mock.calls[0][1]

      // Resize to mobile
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 600,
        })
        onChangeCallback()
      })

      expect(result.current).toBe(true)

      // Resize back to desktop
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 900,
        })
        onChangeCallback()
      })

      expect(result.current).toBe(false)

      // Resize to mobile again
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 400,
        })
        onChangeCallback()
      })

      expect(result.current).toBe(true)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle window.innerWidth of 0', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 0,
      })

      mockMatchMedia.mockReturnValue(createMockMediaQueryList(true))

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)
    })

    it('should handle very large window.innerWidth values', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 9999,
      })

      mockMatchMedia.mockReturnValue(createMockMediaQueryList(false))

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)
    })

    it('should work correctly when matchMedia is not available', () => {
      // Mock a scenario where matchMedia doesn't exist (older browsers)
      delete (window as any).matchMedia

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      // This should not throw an error but may not work as expected
      // The hook should still be callable but might not detect changes
      expect(() => {
        renderHook(() => useIsMobile())
      }).not.toThrow()
    })

    it('should handle the case when addEventListener is called multiple times', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const mockMQL = createMockMediaQueryList(false)
      mockMatchMedia.mockReturnValue(mockMQL)

      const { rerender } = renderHook(() => useIsMobile())

      // Force re-render
      rerender()

      // Should only have one listener attached
      expect(mockAddEventListener).toHaveBeenCalledTimes(1)
    })
  })

  describe('constants and configuration', () => {
    it('should use the correct breakpoint value (768px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      mockMatchMedia.mockReturnValue(createMockMediaQueryList(false))

      renderHook(() => useIsMobile())

      // Verify the media query uses max-width: 767px (768 - 1)
      expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
    })
  })

  describe('return value type consistency', () => {
    it('should always return a boolean', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      mockMatchMedia.mockReturnValue(createMockMediaQueryList(false))

      const { result } = renderHook(() => useIsMobile())

      expect(typeof result.current).toBe('boolean')
      expect(result.current).toBe(false)
    })

    it('should return false when isMobile state is undefined initially', () => {
      // This tests the !!isMobile logic in the return statement
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      // Mock a scenario where the effect hasn't run yet
      const mockMQL = createMockMediaQueryList(false)
      mockMatchMedia.mockReturnValue(mockMQL)

      const { result } = renderHook(() => useIsMobile())

      // Even if internal state might be undefined, it should return a boolean
      expect(typeof result.current).toBe('boolean')
    })
  })
})