import { render, screen } from '@testing-library/react'
import { GradientBlob } from '../GradientBlob'

// Mock motion/react
jest.mock('motion/react', () => ({
  motion: {
    div: jest.fn(({ children, ...props }) => (
      <div {...props} data-testid="motion-div">{children}</div>
    )),
  },
}))

// Get the mocked motion component
const mockMotionDiv = jest.mocked(require('motion/react').motion.div)

describe('GradientBlob', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders with default props', () => {
      render(<GradientBlob />)

      const element = screen.getByTestId('motion-div')
      expect(element).toBeInTheDocument()
    })

    it('applies default className', () => {
      render(<GradientBlob />)

      const element = screen.getByTestId('motion-div')
      expect(element).toHaveClass('absolute', 'rounded-full', 'blur-3xl', 'opacity-20')
    })

    it('applies custom className when provided', () => {
      const customClass = 'w-32 h-32 top-0 left-0'
      render(<GradientBlob className={customClass} />)

      const element = screen.getByTestId('motion-div')
      expect(element).toHaveClass(
        'absolute',
        'rounded-full',
        'blur-3xl',
        'opacity-20',
        ...customClass.split(' ')
      )
    })

    it('handles empty className gracefully', () => {
      render(<GradientBlob className="" />)

      const element = screen.getByTestId('motion-div')
      expect(element).toHaveClass('absolute', 'rounded-full', 'blur-3xl', 'opacity-20')
    })
  })

  describe('Motion Animation Props', () => {
    it('applies correct animate properties with default duration', () => {
      render(<GradientBlob />)

      const call = mockMotionDiv.mock.calls[0]
      expect(call[0]).toEqual(
        expect.objectContaining({
          animate: {
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          },
          transition: {
            duration: 20,
            delay: 0,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        })
      )
    })

    it('applies custom delay correctly', () => {
      const customDelay = 2.5
      render(<GradientBlob delay={customDelay} />)

      const call = mockMotionDiv.mock.calls[0]
      expect(call[0].transition.delay).toBe(customDelay)
    })

    it('applies custom duration correctly', () => {
      const customDuration = 10
      render(<GradientBlob duration={customDuration} />)

      const call = mockMotionDiv.mock.calls[0]
      expect(call[0].transition.duration).toBe(customDuration)
    })

    it('applies both custom delay and duration', () => {
      const customDelay = 1.5
      const customDuration = 30
      render(<GradientBlob delay={customDelay} duration={customDuration} />)

      const call = mockMotionDiv.mock.calls[0]
      expect(call[0].transition.delay).toBe(customDelay)
      expect(call[0].transition.duration).toBe(customDuration)
    })

    it('uses infinite repeat and easeInOut easing', () => {
      render(<GradientBlob />)

      const call = mockMotionDiv.mock.calls[0]
      expect(call[0].transition.repeat).toBe(Infinity)
      expect(call[0].transition.ease).toBe('easeInOut')
    })
  })

  describe('Animation Movement Patterns', () => {
    it('defines correct x-axis movement pattern', () => {
      render(<GradientBlob />)

      const animateCall = mockMotionDiv.mock.calls[0][0].animate
      expect(animateCall.x).toEqual([0, 100, 0])
    })

    it('defines correct y-axis movement pattern', () => {
      render(<GradientBlob />)

      const animateCall = mockMotionDiv.mock.calls[0][0].animate
      expect(animateCall.y).toEqual([0, -100, 0])
    })

    it('defines correct scale animation pattern', () => {
      render(<GradientBlob />)

      const animateCall = mockMotionDiv.mock.calls[0][0].animate
      expect(animateCall.scale).toEqual([1, 1.2, 1])
    })
  })

  describe('Gradient Styling', () => {
    it('applies correct gradient background style', () => {
      render(<GradientBlob />)

      const call = mockMotionDiv.mock.calls[0]
      expect(call[0].style.background).toBe('radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 100%)')
    })

    it('maintains consistent gradient styling across renders', () => {
      const { rerender } = render(<GradientBlob />)

      const firstCallStyle = mockMotionDiv.mock.calls[0][0].style

      rerender(<GradientBlob delay={1} />)

      const secondCallStyle = mockMotionDiv.mock.calls[1][0].style
      expect(secondCallStyle.background).toBe(firstCallStyle.background)
    })
  })

  describe('Default Values', () => {
    it('uses default delay of 0 when not specified', () => {
      render(<GradientBlob />)

      const call = mockMotionDiv.mock.calls[0]
      expect(call[0].transition.delay).toBe(0)
    })

    it('uses default duration of 20 when not specified', () => {
      render(<GradientBlob />)

      const call = mockMotionDiv.mock.calls[0]
      expect(call[0].transition.duration).toBe(20)
    })

    it('uses empty string as default className', () => {
      render(<GradientBlob />)

      const call = mockMotionDiv.mock.calls[0]
      expect(call[0].className).toBe('absolute rounded-full blur-3xl opacity-20 ')
    })
  })

  describe('Edge Cases', () => {
    it('handles zero delay', () => {
      render(<GradientBlob delay={0} />)

      const call = mockMotionDiv.mock.calls[0]
      expect(call[0].transition.delay).toBe(0)
    })

    it('handles zero duration', () => {
      render(<GradientBlob duration={0} />)

      const call = mockMotionDiv.mock.calls[0]
      expect(call[0].transition.duration).toBe(0)
    })

    it('handles negative delay gracefully', () => {
      render(<GradientBlob delay={-1} />)

      const call = mockMotionDiv.mock.calls[0]
      expect(call[0].transition.delay).toBe(-1)
    })

    it('handles very large duration values', () => {
      const largeDuration = 999
      render(<GradientBlob duration={largeDuration} />)

      const call = mockMotionDiv.mock.calls[0]
      expect(call[0].transition.duration).toBe(largeDuration)
    })

    it('handles fractional delay and duration values', () => {
      const fractionalDelay = 1.5
      const fractionalDuration = 20.7
      render(<GradientBlob delay={fractionalDelay} duration={fractionalDuration} />)

      const call = mockMotionDiv.mock.calls[0]
      expect(call[0].transition.delay).toBe(fractionalDelay)
      expect(call[0].transition.duration).toBe(fractionalDuration)
    })
  })

  describe('Accessibility and Performance', () => {
    it('uses appropriate blur and opacity for non-intrusive background animation', () => {
      render(<GradientBlob />)

      const element = screen.getByTestId('motion-div')
      expect(element).toHaveClass('blur-3xl', 'opacity-20')
    })

    it('positions absolutely to avoid layout interference', () => {
      render(<GradientBlob />)

      const element = screen.getByTestId('motion-div')
      expect(element).toHaveClass('absolute')
    })

    it('applies rounded corners for smooth appearance', () => {
      render(<GradientBlob />)

      const element = screen.getByTestId('motion-div')
      expect(element).toHaveClass('rounded-full')
    })

    it('does not interfere with document flow', () => {
      render(
        <div>
          <span>Content before</span>
          <GradientBlob />
          <span>Content after</span>
        </div>
      )

      expect(screen.getByText('Content before')).toBeInTheDocument()
      expect(screen.getByText('Content after')).toBeInTheDocument()
      expect(screen.getByTestId('motion-div')).toBeInTheDocument()
    })
  })

  describe('Component Reusability', () => {
    it('allows multiple instances with different props', () => {
      render(
        <div>
          <GradientBlob className="blob-1" delay={0} duration={10} />
          <GradientBlob className="blob-2" delay={1} duration={20} />
          <GradientBlob className="blob-3" delay={2} duration={30} />
        </div>
      )

      const elements = screen.getAllByTestId('motion-div')
      expect(elements).toHaveLength(3)

      expect(elements[0]).toHaveClass('blob-1')
      expect(elements[1]).toHaveClass('blob-2')
      expect(elements[2]).toHaveClass('blob-3')
    })

    it('maintains independent animation states for multiple instances', () => {
      render(
        <div>
          <GradientBlob delay={1} duration={10} />
          <GradientBlob delay={2} duration={20} />
        </div>
      )

      expect(mockMotionDiv).toHaveBeenCalledTimes(2)

      // First blob
      const firstCall = mockMotionDiv.mock.calls[0]
      expect(firstCall[0].transition.delay).toBe(1)
      expect(firstCall[0].transition.duration).toBe(10)

      // Second blob
      const secondCall = mockMotionDiv.mock.calls[1]
      expect(secondCall[0].transition.delay).toBe(2)
      expect(secondCall[0].transition.duration).toBe(20)
    })
  })

  describe('Gradient Colors', () => {
    it('uses consistent purple to blue gradient colors', () => {
      render(<GradientBlob />)

      const style = mockMotionDiv.mock.calls[0][0].style
      expect(style.background).toContain('rgba(139, 92, 246, 0.4)') // Purple
      expect(style.background).toContain('rgba(59, 130, 246, 0.2)') // Blue
    })

    it('defines radial gradient from center', () => {
      render(<GradientBlob />)

      const style = mockMotionDiv.mock.calls[0][0].style
      expect(style.background).toContain('radial-gradient(circle')
    })

    it('has appropriate alpha values for background effect', () => {
      render(<GradientBlob />)

      const style = mockMotionDiv.mock.calls[0][0].style
      // Purple center with higher opacity
      expect(style.background).toContain('0.4')
      // Blue edge with lower opacity
      expect(style.background).toContain('0.2')
    })
  })
})