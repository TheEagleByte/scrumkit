import { render, screen } from '@testing-library/react'
import RootLayout, { metadata } from '../layout'

// Mock external dependencies
jest.mock('next/font/google', () => ({
  Geist: jest.fn(() => ({
    variable: '--font-geist-sans',
    className: 'font-geist-sans',
  })),
  Geist_Mono: jest.fn(() => ({
    variable: '--font-geist-mono',
    className: 'font-geist-mono',
  })),
}))

jest.mock('@vercel/analytics/next', () => ({
  Analytics: () => <div data-testid="analytics" />,
}))

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }: any) => (
    <div data-testid="theme-provider" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}))

jest.mock('@/providers/query-provider', () => ({
  QueryProvider: ({ children }: any) => (
    <div data-testid="query-provider">{children}</div>
  ),
}))

// Mock React Suspense for testing environments
jest.mock('react', () => {
  const React = jest.requireActual('react')
  return {
    ...React,
    Suspense: ({ children, fallback }: any) => children || fallback,
  }
})

describe('RootLayout', () => {
  const mockChildren = <div data-testid="test-content">Test Content</div>

  beforeEach(() => {
    // Clear any previous DOM
    document.body.innerHTML = ''
  })

  it('renders the root HTML structure', () => {
    render(<RootLayout>{mockChildren}</RootLayout>)

    // Check for html and body elements
    const htmlElement = document.documentElement
    expect(htmlElement).toHaveAttribute('lang', 'en')

    const bodyElement = document.body
    expect(bodyElement).toBeInTheDocument()
  })

  it('applies font variables to body element', () => {
    render(<RootLayout>{mockChildren}</RootLayout>)

    const bodyElement = document.body
    expect(bodyElement).toHaveClass('font-sans', 'antialiased')
    expect(bodyElement.className).toContain('--font-geist-sans')
    expect(bodyElement.className).toContain('--font-geist-mono')
  })

  it('renders all required providers', () => {
    render(<RootLayout>{mockChildren}</RootLayout>)

    // Check for QueryProvider
    expect(screen.getByTestId('query-provider')).toBeInTheDocument()

    // Check for ThemeProvider
    const themeProvider = screen.getByTestId('theme-provider')
    expect(themeProvider).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(<RootLayout>{mockChildren}</RootLayout>)

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders Toaster component', () => {
    render(<RootLayout>{mockChildren}</RootLayout>)

    expect(screen.getByTestId('toaster')).toBeInTheDocument()
  })

  it('renders Analytics component', () => {
    render(<RootLayout>{mockChildren}</RootLayout>)

    expect(screen.getByTestId('analytics')).toBeInTheDocument()
  })

  it('has correct provider nesting order', () => {
    render(<RootLayout>{mockChildren}</RootLayout>)

    const queryProvider = screen.getByTestId('query-provider')
    const themeProvider = screen.getByTestId('theme-provider')
    const content = screen.getByTestId('test-content')

    // QueryProvider should contain ThemeProvider
    expect(queryProvider).toContainElement(themeProvider)
    // ThemeProvider should contain the content
    expect(themeProvider).toContainElement(content)
  })

  it('renders with Suspense wrapper', () => {
    render(<RootLayout>{mockChildren}</RootLayout>)

    // Content should be rendered (Suspense should not block it)
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  it('handles multiple children', () => {
    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </>
    )

    render(<RootLayout>{multipleChildren}</RootLayout>)

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })

  it('handles null or empty children', () => {
    render(<RootLayout>{null}</RootLayout>)

    // Layout should still render providers even with null children
    expect(screen.getByTestId('query-provider')).toBeInTheDocument()
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
    expect(screen.getByTestId('toaster')).toBeInTheDocument()
    expect(screen.getByTestId('analytics')).toBeInTheDocument()
  })

  it('has correct TypeScript types for children prop', () => {
    // This test ensures the component accepts React.ReactNode
    const validChildren = [
      <div key="1">String child</div>,
      'Plain string',
      123,
      null,
      undefined,
      [<span key="2">Array item</span>],
    ]

    validChildren.forEach((child, index) => {
      const { unmount } = render(<RootLayout>{child}</RootLayout>)
      unmount()
    })

    // If we reach here, all children types are accepted
    expect(true).toBe(true)
  })
})

describe('RootLayout Metadata', () => {
  it('exports correct metadata object', () => {
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('ScrumKit - Open Source Tools for Better Sprints')
    expect(metadata.description).toBe(
      'All essential scrum ceremony tools in one unified platform. Retrospectives, planning poker, daily standups, and team health checks—completely free and open source. Self-hostable with one-click deploy.'
    )
  })

  it('has SEO-friendly metadata', () => {
    expect(metadata.title).toContain('ScrumKit')
    expect(metadata.title).toContain('Open Source')
    expect(metadata.description).toContain('Retrospectives')
    expect(metadata.description).toContain('planning poker')
    expect(metadata.description).toContain('open source')
  })

  it('metadata follows best practices', () => {
    // Title should be reasonable length (typically under 60 characters for SEO)
    expect(metadata.title?.length).toBeLessThan(70)

    // Description should be reasonable length (typically under 200 characters for SEO)
    expect(metadata.description?.length).toBeLessThan(250)

    // Should have keywords field
    expect(metadata.keywords).toBeDefined()
    expect(Array.isArray(metadata.keywords)).toBe(true)

    // Should have Open Graph metadata
    expect(metadata.openGraph).toBeDefined()
    expect(metadata.openGraph?.title).toContain('ScrumKit')

    // Should have Twitter metadata
    expect(metadata.twitter).toBeDefined()
    expect(metadata.twitter?.card).toBe('summary_large_image')
  })
})