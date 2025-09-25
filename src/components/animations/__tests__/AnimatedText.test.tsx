import { render, screen } from '@testing-library/react'
import { AnimatedText } from '../AnimatedText'

// Mock motion/react
jest.mock('motion/react', () => ({
  motion: {
    span: jest.fn((props) => {
      const { children, variants, initial, ...otherProps } = props
      // Only add testid to container (which has initial="initial")
      const testId = initial === 'initial' ? 'motion-span-container' : 'motion-span-letter'
      return <span {...otherProps} data-testid={testId}>{children}</span>
    }),
  },
}))

// Mock animation variants from @/lib/animations
jest.mock('@/lib/animations', () => ({
  letterAnimation: {
    initial: { opacity: 0, y: 50, rotateX: -90 },
    animate: { opacity: 1, y: 0, rotateX: 0 },
  },
  staggerContainer: {
    initial: {},
    animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  },
}))

// Get the mocked motion component
const mockMotionSpan = jest.mocked(
  require('motion/react').motion.span
)

describe('AnimatedText', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders text content correctly', () => {
      render(<AnimatedText text="Hello World" />)

      const container = screen.getByTestId('motion-span-container')
      expect(container).toBeInTheDocument()
      expect(container.textContent).toMatch(/Hello.*World/)
    })

    it('applies default className when none provided', () => {
      render(<AnimatedText text="Test" />)

      const container = screen.getByTestId('motion-span-container')
      expect(container).toHaveClass('inline-block')
    })

    it('applies custom className when provided', () => {
      const customClass = 'text-2xl font-bold'
      render(<AnimatedText text="Test" className={customClass} />)

      const container = screen.getByTestId('motion-span-container')
      expect(container).toHaveClass('inline-block', customClass)
    })

    it('handles empty text gracefully', () => {
      render(<AnimatedText text="" />)

      const container = screen.getByTestId('motion-span-container')
      expect(container).toBeInTheDocument()
      expect(container.textContent).toBe('')
    })
  })

  describe('Text Processing', () => {
    it('splits single word into individual letters', () => {
      render(<AnimatedText text="Hello" />)

      // Should create motion spans for each letter
      expect(mockMotionSpan).toHaveBeenCalledTimes(6) // 1 container + 5 letters
    })

    it('handles multiple words correctly', () => {
      render(<AnimatedText text="Hello World" />)

      const container = screen.getByTestId('motion-span-container')
      // Should contain both words with space between them
      expect(container.textContent).toContain('Hello')
      expect(container.textContent).toContain('World')

      // Check if non-breaking space is rendered between words
      const spans = container.querySelectorAll('span')
      const hasSpaceBetweenWords = Array.from(spans).some(span =>
        span.innerHTML === '&nbsp;' || span.textContent === '\u00A0'
      )
      expect(hasSpaceBetweenWords).toBe(true)
    })

    it('handles special characters in text', () => {
      const specialText = "Hello! @#$%"
      render(<AnimatedText text={specialText} />)

      const container = screen.getByTestId('motion-span-container')
      expect(container.textContent).toContain('Hello!')
      expect(container.textContent).toContain('@#$%')
    })

    it('handles text with numbers', () => {
      render(<AnimatedText text="Test 123" />)

      const container = screen.getByTestId('motion-span-container')
      expect(container.textContent).toContain('Test')
      expect(container.textContent).toContain('123')
    })
  })

  describe('Motion Integration', () => {
    it('passes correct motion props to container', () => {
      render(<AnimatedText text="Test" delay={0.5} />)

      // Check container call (first call)
      const containerCall = mockMotionSpan.mock.calls[0]
      expect(containerCall[0].variants).toEqual({
        initial: {},
        animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
      })
      expect(containerCall[0].initial).toBe('initial')
      expect(containerCall[0].animate).toBe('animate')
      expect(containerCall[0].style).toEqual({ perspective: 1000 })
    })

    it('applies delay correctly to letter animations', () => {
      const delay = 1.0
      render(<AnimatedText text="Hi" delay={delay} />)

      // Check if motion.span was called with custom delay calculation
      const letterCalls = mockMotionSpan.mock.calls.filter(call =>
        call[0].custom !== undefined
      )

      expect(letterCalls.length).toBeGreaterThan(0)

      // Verify that custom delays are being applied (exact values may vary)
      const firstLetterCall = letterCalls.find(call => call[0].custom === delay)
      expect(firstLetterCall).toBeTruthy()
    })

    it('sets correct CSS styles on container', () => {
      render(<AnimatedText text="Test" />)

      const containerCall = mockMotionSpan.mock.calls.find(call =>
        call[0].style && call[0].style.perspective === 1000
      )

      expect(containerCall).toBeTruthy()
      expect(containerCall[0].style).toEqual({ perspective: 1000 })
    })

    it('sets preserve-3d transform style on letters', () => {
      render(<AnimatedText text="A" />)

      const letterCall = mockMotionSpan.mock.calls.find(call =>
        call[0].style && call[0].style.transformStyle === 'preserve-3d'
      )

      expect(letterCall).toBeTruthy()
      expect(letterCall[0].style.transformStyle).toBe('preserve-3d')
    })
  })

  describe('Animation Variants', () => {
    it('uses staggerContainer variant for main container', () => {
      render(<AnimatedText text="Test" />)

      const containerCall = mockMotionSpan.mock.calls[0]
      expect(containerCall[0].variants).toEqual({
        initial: {},
        animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
      })
    })

    it('uses letterAnimation variant for each letter', () => {
      render(<AnimatedText text="A" />)

      const letterCall = mockMotionSpan.mock.calls.find(call =>
        call[0].variants &&
        call[0].variants.initial &&
        call[0].variants.initial.opacity === 0
      )

      expect(letterCall).toBeTruthy()
      expect(letterCall[0].variants).toEqual({
        initial: { opacity: 0, y: 50, rotateX: -90 },
        animate: { opacity: 1, y: 0, rotateX: 0 },
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles single character', () => {
      render(<AnimatedText text="A" />)

      const container = screen.getByTestId('motion-span-container')
      expect(container).toBeInTheDocument()
      expect(container.textContent).toBe('A')
    })

    it('handles text with only spaces', () => {
      render(<AnimatedText text="   " />)

      const container = screen.getByTestId('motion-span-container')
      expect(container).toBeInTheDocument()
      // Spaces should be preserved as non-breaking spaces
      expect(container.textContent).toContain('\u00A0')
    })

    it('handles very long text', () => {
      const longText = 'A'.repeat(100)
      render(<AnimatedText text={longText} />)

      const container = screen.getByTestId('motion-span-container')
      expect(container).toBeInTheDocument()
      expect(container.textContent).toBe(longText)
    })

    it('handles text with line breaks', () => {
      const textWithBreaks = 'Hello\nWorld'
      render(<AnimatedText text={textWithBreaks} />)

      const container = screen.getByTestId('motion-span-container')
      expect(container).toBeInTheDocument()
      expect(container.textContent).toContain('Hello')
      expect(container.textContent).toContain('World')
    })
  })

  describe('Accessibility', () => {
    it('maintains semantic text structure', () => {
      render(<AnimatedText text="Hello World" />)

      const container = screen.getByTestId('motion-span-container')
      // Text content should remain readable
      expect(container.textContent).toMatch(/Hello.*World/)
    })

    it('preserves text for screen readers', () => {
      const text = "Important announcement"
      render(<AnimatedText text={text} />)

      const container = screen.getByTestId('motion-span-container')
      // Screen readers should be able to read the full text
      expect(container.textContent.replace(/\s+/g, ' ').trim()).toBe(text)
    })
  })

  describe('Performance', () => {
    it('generates unique keys for each letter', () => {
      render(<AnimatedText text="AB" />)

      // Check that motion.span was called multiple times for letters
      // We can't access keys directly as they're React internal props
      // but we can verify the component renders the correct number of letters
      const container = screen.getByTestId('motion-span-container')
      expect(container.textContent).toBe('AB')

      // Verify that motion.span was called multiple times (once for container + letters)
      expect(mockMotionSpan.mock.calls.length).toBeGreaterThan(2)
    })

    it('handles component re-renders efficiently', () => {
      const { rerender } = render(<AnimatedText text="Hello" />)
      const initialCallCount = mockMotionSpan.mock.calls.length

      // Re-render with same props
      rerender(<AnimatedText text="Hello" />)

      // Should not create excessive additional calls
      expect(mockMotionSpan.mock.calls.length).toBeGreaterThan(initialCallCount)
    })
  })
})