import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '../alert'

// Mock lucide-react icons for testing
const MockIcon = () => <svg data-testid="alert-icon" />

describe('Alert', () => {
  it('renders alert with default variant', () => {
    render(<Alert data-testid="alert">Alert content</Alert>)
    const alert = screen.getByTestId('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveClass(
      'relative',
      'w-full',
      'rounded-lg',
      'border',
      'px-4',
      'py-3',
      'text-sm',
      'grid'
    )
  })

  it('applies role="alert" attribute', () => {
    render(<Alert data-testid="alert" />)
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveAttribute('role', 'alert')
  })

  it('applies data-slot attribute', () => {
    render(<Alert data-testid="alert" />)
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveAttribute('data-slot', 'alert')
  })

  it('applies default variant classes', () => {
    render(<Alert data-testid="alert">Default alert</Alert>)
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveClass('bg-card', 'text-card-foreground')
  })

  it('applies destructive variant classes', () => {
    render(
      <Alert variant="destructive" data-testid="alert">
        Destructive alert
      </Alert>
    )
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveClass('text-destructive', 'bg-card')
  })

  it('accepts custom className', () => {
    render(<Alert className="custom-class" data-testid="alert" />)
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveClass('custom-class')
  })

  it('forwards all props to div element', () => {
    render(
      <Alert
        id="test-alert"
        data-custom="value"
        data-testid="alert"
        aria-live="polite"
      >
        Test content
      </Alert>
    )
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveAttribute('id', 'test-alert')
    expect(alert).toHaveAttribute('data-custom', 'value')
    expect(alert).toHaveAttribute('aria-live', 'polite')
    expect(alert).toHaveTextContent('Test content')
  })

  it('handles icon layout with proper grid columns', () => {
    render(
      <Alert data-testid="alert">
        <MockIcon />
        Alert with icon
      </Alert>
    )
    const alert = screen.getByTestId('alert')
    const icon = screen.getByTestId('alert-icon')

    expect(alert).toHaveClass('has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr]')
    expect(alert).toHaveClass('[&>svg]:size-4', '[&>svg]:translate-y-0.5', '[&>svg]:text-current')
    expect(icon).toBeInTheDocument()
  })

  it('uses different grid layout without icon', () => {
    render(<Alert data-testid="alert">Alert without icon</Alert>)
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveClass('grid-cols-[0_1fr]')
  })

  it('applies gap spacing correctly', () => {
    render(<Alert data-testid="alert">Content</Alert>)
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveClass('has-[>svg]:gap-x-3', 'gap-y-0.5')
  })

  it('maintains items-start alignment', () => {
    render(<Alert data-testid="alert">Content</Alert>)
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveClass('items-start')
  })
})

describe('AlertTitle', () => {
  it('renders alert title with default classes', () => {
    render(<AlertTitle data-testid="alert-title">Alert Title</AlertTitle>)
    const title = screen.getByTestId('alert-title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass(
      'col-start-2',
      'line-clamp-1',
      'min-h-4',
      'font-medium',
      'tracking-tight'
    )
    expect(title).toHaveTextContent('Alert Title')
  })

  it('applies data-slot attribute', () => {
    render(<AlertTitle data-testid="alert-title" />)
    const title = screen.getByTestId('alert-title')
    expect(title).toHaveAttribute('data-slot', 'alert-title')
  })

  it('accepts custom className', () => {
    render(<AlertTitle className="custom-title" data-testid="alert-title" />)
    const title = screen.getByTestId('alert-title')
    expect(title).toHaveClass('custom-title')
  })

  it('forwards all props to div element', () => {
    render(
      <AlertTitle
        id="test-title"
        role="heading"
        aria-level="2"
        data-testid="alert-title"
      >
        Title with props
      </AlertTitle>
    )
    const title = screen.getByTestId('alert-title')
    expect(title).toHaveAttribute('id', 'test-title')
    expect(title).toHaveAttribute('role', 'heading')
    expect(title).toHaveAttribute('aria-level', '2')
    expect(title).toHaveTextContent('Title with props')
  })

  it('handles text truncation', () => {
    render(
      <AlertTitle data-testid="alert-title">
        Very long alert title that should be truncated
      </AlertTitle>
    )
    const title = screen.getByTestId('alert-title')
    expect(title).toHaveClass('line-clamp-1')
  })

  it('maintains minimum height', () => {
    render(<AlertTitle data-testid="alert-title" />)
    const title = screen.getByTestId('alert-title')
    expect(title).toHaveClass('min-h-4')
  })
})

describe('AlertDescription', () => {
  it('renders alert description with default classes', () => {
    render(
      <AlertDescription data-testid="alert-description">
        Alert description
      </AlertDescription>
    )
    const description = screen.getByTestId('alert-description')
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass(
      'text-muted-foreground',
      'col-start-2',
      'grid',
      'justify-items-start',
      'gap-1',
      'text-sm'
    )
    expect(description).toHaveTextContent('Alert description')
  })

  it('applies data-slot attribute', () => {
    render(<AlertDescription data-testid="alert-description" />)
    const description = screen.getByTestId('alert-description')
    expect(description).toHaveAttribute('data-slot', 'alert-description')
  })

  it('accepts custom className', () => {
    render(
      <AlertDescription className="custom-description" data-testid="alert-description" />
    )
    const description = screen.getByTestId('alert-description')
    expect(description).toHaveClass('custom-description')
  })

  it('forwards all props to div element', () => {
    render(
      <AlertDescription
        id="test-description"
        role="note"
        data-testid="alert-description"
      >
        Description with props
      </AlertDescription>
    )
    const description = screen.getByTestId('alert-description')
    expect(description).toHaveAttribute('id', 'test-description')
    expect(description).toHaveAttribute('role', 'note')
    expect(description).toHaveTextContent('Description with props')
  })

  it('handles paragraph text with proper styling', () => {
    render(
      <AlertDescription data-testid="alert-description">
        <p>First paragraph</p>
        <p>Second paragraph</p>
      </AlertDescription>
    )
    const description = screen.getByTestId('alert-description')
    const paragraphs = description.querySelectorAll('p')

    expect(description).toHaveClass('[&_p]:leading-relaxed')
    expect(paragraphs).toHaveLength(2)
    expect(paragraphs[0]).toHaveTextContent('First paragraph')
    expect(paragraphs[1]).toHaveTextContent('Second paragraph')
  })

  it('applies destructive variant styling in context', () => {
    render(
      <Alert variant="destructive" data-testid="alert">
        <AlertDescription data-testid="alert-description">
          Destructive description
        </AlertDescription>
      </Alert>
    )
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveClass('*:data-[slot=alert-description]:text-destructive/90')
  })
})

describe('Alert - Full Integration', () => {
  it('renders complete alert with all components', () => {
    render(
      <Alert data-testid="complete-alert">
        <MockIcon />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          <p>This is an important alert message.</p>
          <p>Please pay attention to this information.</p>
        </AlertDescription>
      </Alert>
    )

    const alert = screen.getByTestId('complete-alert')
    const icon = screen.getByTestId('alert-icon')
    const title = screen.getByText('Important Notice')
    const description = screen.getByText('This is an important alert message.')

    expect(alert).toBeInTheDocument()
    expect(icon).toBeInTheDocument()
    expect(title).toBeInTheDocument()
    expect(description).toBeInTheDocument()
    expect(alert).toHaveAttribute('role', 'alert')
  })

  it('renders destructive alert with proper styling', () => {
    render(
      <Alert variant="destructive" data-testid="destructive-alert">
        <MockIcon />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong.</AlertDescription>
      </Alert>
    )

    const alert = screen.getByTestId('destructive-alert')
    const title = screen.getByText('Error')
    const description = screen.getByText('Something went wrong.')

    expect(alert).toHaveClass('text-destructive')
    expect(title).toBeInTheDocument()
    expect(description).toBeInTheDocument()
  })

  it('maintains semantic structure for accessibility', () => {
    render(
      <Alert role="alert" aria-labelledby="alert-title" aria-describedby="alert-desc">
        <AlertTitle id="alert-title">Accessible Alert</AlertTitle>
        <AlertDescription id="alert-desc">
          This alert follows accessibility best practices.
        </AlertDescription>
      </Alert>
    )

    const alert = screen.getByRole('alert')
    const title = screen.getByText('Accessible Alert')
    const description = screen.getByText(
      'This alert follows accessibility best practices.'
    )

    expect(alert).toHaveAttribute('aria-labelledby', 'alert-title')
    expect(alert).toHaveAttribute('aria-describedby', 'alert-desc')
    expect(title).toHaveAttribute('id', 'alert-title')
    expect(description).toHaveAttribute('id', 'alert-desc')
  })

  it('works without icon', () => {
    render(
      <Alert data-testid="no-icon-alert">
        <AlertTitle>No Icon Alert</AlertTitle>
        <AlertDescription>This alert has no icon.</AlertDescription>
      </Alert>
    )

    const alert = screen.getByTestId('no-icon-alert')
    const title = screen.getByText('No Icon Alert')
    const description = screen.getByText('This alert has no icon.')

    expect(alert).toBeInTheDocument()
    expect(title).toBeInTheDocument()
    expect(description).toBeInTheDocument()
    expect(alert).toHaveClass('grid-cols-[0_1fr]')
  })

  it('supports complex content in description', () => {
    render(
      <Alert data-testid="complex-alert">
        <AlertTitle>Complex Content</AlertTitle>
        <AlertDescription>
          <p>This is the first paragraph.</p>
          <ul>
            <li>First item</li>
            <li>Second item</li>
          </ul>
          <p>This is the second paragraph with a <a href="/link">link</a>.</p>
        </AlertDescription>
      </Alert>
    )

    const alert = screen.getByTestId('complex-alert')
    const title = screen.getByText('Complex Content')
    const list = screen.getByText('First item').closest('ul')
    const link = screen.getByRole('link', { name: 'link' })

    expect(alert).toBeInTheDocument()
    expect(title).toBeInTheDocument()
    expect(list).toBeInTheDocument()
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/link')
  })
})