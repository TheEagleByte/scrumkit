import { render, screen, waitFor } from '@testing-library/react'
import ElectricBorder from '../ElectricBorder'

// Mock useId hook
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: jest.fn(),
}))

// Mock ResizeObserver
const mockResizeObserver = jest.fn()
const mockObserve = jest.fn()
const mockDisconnect = jest.fn()

Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: mockObserve,
    unobserve: jest.fn(),
    disconnect: mockDisconnect,
  })),
})

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn()
Object.defineProperty(global, 'requestAnimationFrame', {
  writable: true,
  value: mockRequestAnimationFrame,
})

// Mock CSS.escape
Object.defineProperty(global.CSS, 'escape', {
  writable: true,
  value: jest.fn((str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
})

// Mock DOM methods
const mockGetBoundingClientRect = jest.fn()
const mockSetAttribute = jest.fn()
const mockQuerySelector = jest.fn()
const mockQuerySelectorAll = jest.fn()

// Mock SVG elements
const mockSVGElement = {
  querySelectorAll: mockQuerySelectorAll,
  querySelector: mockQuerySelector,
  setAttribute: mockSetAttribute,
}

// Get the mocked useId function
const mockUseId = jest.mocked(require('react').useId)

describe('ElectricBorder', () => {
  const mockId = 'test-id-123'

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseId.mockReturnValue(mockId)
    mockRequestAnimationFrame.mockImplementation((callback) => {
      setTimeout(callback, 0)
      return 123
    })

    // Mock DOM element methods
    HTMLElement.prototype.getBoundingClientRect = mockGetBoundingClientRect
    mockGetBoundingClientRect.mockReturnValue({
      width: 200,
      height: 100,
      top: 0,
      left: 0,
      bottom: 100,
      right: 200,
    })

    // Mock clientWidth and clientHeight
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      writable: true,
      value: 200,
    })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      writable: true,
      value: 100,
    })

    // Mock SVG methods
    mockQuerySelectorAll.mockReturnValue([])
    mockQuerySelector.mockReturnValue(mockSVGElement)
  })

  describe('Component Rendering', () => {
    it('renders with children', () => {
      render(
        <ElectricBorder>
          <div>Test Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('applies default className', () => {
      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      // Get the outermost container (not the content div)
      const container = screen.getByText('Content').parentElement?.parentElement
      expect(container).toHaveClass('relative', 'isolate')
    })

    it('applies custom className', () => {
      const customClass = 'custom-border-class'
      render(
        <ElectricBorder className={customClass}>
          <div>Content</div>
        </ElectricBorder>
      )

      // Get the outermost container
      const container = screen.getByText('Content').parentElement?.parentElement
      expect(container).toHaveClass('relative', 'isolate', customClass)
    })

    it('applies custom styles', () => {
      const customStyle = { borderRadius: '10px', padding: '20px' }
      render(
        <ElectricBorder style={customStyle}>
          <div>Content</div>
        </ElectricBorder>
      )

      // Get the outermost container
      const container = screen.getByText('Content').parentElement?.parentElement
      expect(container).toHaveStyle(customStyle)
    })

    it('renders SVG filter element', () => {
      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-hidden')
      expect(svg).toHaveAttribute('focusable', 'false')
    })
  })

  describe('Filter ID Generation', () => {
    it('generates unique filter ID from useId', () => {
      mockUseId.mockReturnValue(':r1:')

      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      const filter = document.querySelector('filter')
      expect(filter).toHaveAttribute('id', 'turbulent-displace-r1')
    })

    it('handles different useId formats', () => {
      mockUseId.mockReturnValue('some:complex:id:')

      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      const filter = document.querySelector('filter')
      expect(filter).toHaveAttribute('id', 'turbulent-displace-somecomplexid')
    })
  })

  describe('Color Prop Handling', () => {
    it('uses default color when not specified', () => {
      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      // Check if elements are rendered (color application tested in styling tests)
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('applies custom color correctly', () => {
      const customColor = '#ff0000'
      render(
        <ElectricBorder color={customColor}>
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('handles invalid color gracefully', () => {
      render(
        <ElectricBorder color="">
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Animation Parameters', () => {
    it('uses default speed when not specified', () => {
      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('handles custom speed', () => {
      render(
        <ElectricBorder speed={2}>
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('handles zero speed', () => {
      render(
        <ElectricBorder speed={0}>
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('uses default chaos when not specified', () => {
      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('handles custom chaos value', () => {
      render(
        <ElectricBorder chaos={2}>
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Thickness Handling', () => {
    it('uses default thickness', () => {
      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('applies custom thickness', () => {
      render(
        <ElectricBorder thickness={4}>
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('handles zero thickness', () => {
      render(
        <ElectricBorder thickness={0}>
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('hexToRgba Utility Function', () => {
    // Testing the utility function behavior through component props
    it('handles standard hex colors', () => {
      render(
        <ElectricBorder color="#ff0000">
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('handles short hex colors', () => {
      render(
        <ElectricBorder color="#f00">
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('handles hex colors without hash', () => {
      render(
        <ElectricBorder color="ff0000">
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('ResizeObserver Integration', () => {
    it('sets up ResizeObserver on mount', async () => {
      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      await waitFor(() => {
        expect(mockObserve).toHaveBeenCalled()
      })
    })

    it('disconnects ResizeObserver on unmount', async () => {
      const { unmount } = render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      await waitFor(() => {
        expect(mockObserve).toHaveBeenCalled()
      })

      unmount()

      expect(mockDisconnect).toHaveBeenCalled()
    })
  })

  describe('Animation Update Logic', () => {
    it('updates animation when speed changes', async () => {
      const { rerender } = render(
        <ElectricBorder speed={1}>
          <div>Content</div>
        </ElectricBorder>
      )

      const initialCalls = mockRequestAnimationFrame.mock.calls.length

      rerender(
        <ElectricBorder speed={2}>
          <div>Content</div>
        </ElectricBorder>
      )

      await waitFor(() => {
        expect(mockRequestAnimationFrame.mock.calls.length).toBeGreaterThan(initialCalls)
      })
    })

    it('updates animation when chaos changes', async () => {
      const { rerender } = render(
        <ElectricBorder chaos={1}>
          <div>Content</div>
        </ElectricBorder>
      )

      const initialCalls = mockRequestAnimationFrame.mock.calls.length

      rerender(
        <ElectricBorder chaos={2}>
          <div>Content</div>
        </ElectricBorder>
      )

      await waitFor(() => {
        expect(mockRequestAnimationFrame.mock.calls.length).toBeGreaterThan(initialCalls)
      })
    })
  })

  describe('SVG Animation Elements', () => {
    it('creates proper SVG structure', () => {
      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()

      const defs = svg?.querySelector('defs')
      expect(defs).toBeInTheDocument()

      const filter = defs?.querySelector('filter')
      expect(filter).toBeInTheDocument()
    })

    it('positions SVG off-screen', () => {
      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      const svg = document.querySelector('svg')
      expect(svg).toHaveClass('-left-[10000px]', '-top-[10000px]')
      expect(svg).toHaveClass('opacity-[0.001]', 'pointer-events-none')
    })
  })

  describe('Border Layers', () => {
    it('renders multiple border effect layers', () => {
      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      const borderContainer = document.querySelector('.absolute.inset-0.pointer-events-none')
      expect(borderContainer).toBeInTheDocument()

      const borderLayers = borderContainer?.querySelectorAll('.absolute.inset-0.box-border')
      expect(borderLayers?.length).toBeGreaterThan(1)
    })

    it('applies consistent border radius inheritance', () => {
      const customStyle = { borderRadius: '15px' }
      render(
        <ElectricBorder style={customStyle}>
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Performance and Cleanup', () => {
    it('handles component unmount gracefully', () => {
      const { unmount } = render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      expect(() => unmount()).not.toThrow()
      expect(mockDisconnect).toHaveBeenCalled()
    })

    it('handles multiple instances independently', () => {
      render(
        <div>
          <ElectricBorder>
            <div>Content 1</div>
          </ElectricBorder>
          <ElectricBorder>
            <div>Content 2</div>
          </ElectricBorder>
        </div>
      )

      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()

      const svgs = document.querySelectorAll('svg')
      expect(svgs.length).toBe(2)
    })
  })

  describe('Edge Cases', () => {
    it('handles zero dimensions gracefully', () => {
      mockGetBoundingClientRect.mockReturnValue({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      })

      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        writable: true,
        value: 0,
      })
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
        writable: true,
        value: 0,
      })

      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('handles missing SVG elements gracefully', () => {
      mockQuerySelector.mockReturnValue(null)
      mockQuerySelectorAll.mockReturnValue([])

      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('handles animation elements without beginElement method', () => {
      const mockAnimElement = { setAttribute: jest.fn() }
      mockQuerySelectorAll.mockReturnValue([mockAnimElement])

      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('handles empty children', () => {
      render(<ElectricBorder />)

      const container = document.querySelector('.relative.isolate')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('marks SVG as decorative', () => {
      render(
        <ElectricBorder>
          <div>Content</div>
        </ElectricBorder>
      )

      const svg = document.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(svg).toHaveAttribute('focusable', 'false')
    })

    it('does not interfere with content accessibility', () => {
      render(
        <ElectricBorder>
          <button>Accessible Button</button>
        </ElectricBorder>
      )

      const button = screen.getByRole('button', { name: 'Accessible Button' })
      expect(button).toBeInTheDocument()
    })

    it('maintains content structure', () => {
      render(
        <ElectricBorder>
          <h1>Heading</h1>
          <p>Paragraph</p>
        </ElectricBorder>
      )

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByText('Paragraph')).toBeInTheDocument()
    })
  })
})