import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge } from '../badge'

// Mock lucide-react icons if needed
jest.mock('lucide-react', () => ({
  CheckIcon: () => <svg data-testid="check-icon" />,
}))

describe('Badge', () => {
  it('renders badge with default variant', () => {
    render(<Badge>Default Badge</Badge>)
    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-md',
      'border',
      'px-2',
      'py-0.5',
      'text-xs',
      'font-medium'
    )
  })

  it('applies data-slot attribute', () => {
    render(<Badge>Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toHaveAttribute('data-slot', 'badge')
  })

  it('applies default variant classes', () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText('Default')
    expect(badge).toHaveClass(
      'border-transparent',
      'bg-primary',
      'text-primary-foreground'
    )
  })

  it('applies secondary variant classes', () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    const badge = screen.getByText('Secondary')
    expect(badge).toHaveClass(
      'border-transparent',
      'bg-secondary',
      'text-secondary-foreground'
    )
  })

  it('applies destructive variant classes', () => {
    render(<Badge variant="destructive">Destructive</Badge>)
    const badge = screen.getByText('Destructive')
    expect(badge).toHaveClass(
      'border-transparent',
      'bg-destructive',
      'text-white'
    )
  })

  it('applies outline variant classes', () => {
    render(<Badge variant="outline">Outline</Badge>)
    const badge = screen.getByText('Outline')
    expect(badge).toHaveClass('text-foreground')
  })

  it('accepts custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-class')
  })

  it('renders as span by default', () => {
    render(<Badge>Span Badge</Badge>)
    const badge = screen.getByText('Span Badge')
    expect(badge.tagName).toBe('SPAN')
  })

  it('renders as child component when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="/test" data-testid="badge-link">
          Link Badge
        </a>
      </Badge>
    )
    const badge = screen.getByTestId('badge-link')
    expect(badge.tagName).toBe('A')
    expect(badge).toHaveAttribute('href', '/test')
    expect(badge).toHaveTextContent('Link Badge')
  })

  it('forwards all props to the element', () => {
    render(
      <Badge
        id="test-badge"
        role="status"
        aria-label="Status badge"
        data-testid="props-badge"
      >
        Props Test
      </Badge>
    )
    const badge = screen.getByTestId('props-badge')
    expect(badge).toHaveAttribute('id', 'test-badge')
    expect(badge).toHaveAttribute('role', 'status')
    expect(badge).toHaveAttribute('aria-label', 'Status badge')
  })

  it('supports hover effects for anchor variants', () => {
    render(
      <Badge asChild>
        <a href="/test">Hoverable Badge</a>
      </Badge>
    )
    const badge = screen.getByRole('link', { name: 'Hoverable Badge' })
    expect(badge).toHaveClass('[a&]:hover:bg-primary/90')
  })

  it('supports focus-visible styles', () => {
    render(<Badge tabIndex={0}>Focusable Badge</Badge>)
    const badge = screen.getByText('Focusable Badge')
    expect(badge).toHaveClass(
      'focus-visible:border-ring',
      'focus-visible:ring-ring/50',
      'focus-visible:ring-[3px]'
    )
  })

  it('applies aria-invalid styles when invalid', () => {
    render(<Badge aria-invalid="true">Invalid Badge</Badge>)
    const badge = screen.getByText('Invalid Badge')
    expect(badge).toHaveAttribute('aria-invalid', 'true')
    expect(badge).toHaveClass(
      'aria-invalid:ring-destructive/20',
      'aria-invalid:border-destructive'
    )
  })

  it('handles click events when interactive', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(
      <Badge onClick={handleClick} tabIndex={0} role="button">
        Clickable Badge
      </Badge>
    )
    const badge = screen.getByRole('button', { name: 'Clickable Badge' })

    await user.click(badge)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('supports keyboard interaction when focusable', async () => {
    const handleKeyDown = jest.fn()
    const user = userEvent.setup()

    render(
      <Badge onKeyDown={handleKeyDown} tabIndex={0}>
        Keyboard Badge
      </Badge>
    )
    const badge = screen.getByText('Keyboard Badge')

    await user.type(badge, '{enter}')
    expect(handleKeyDown).toHaveBeenCalled()
  })

  it('renders with icons and maintains proper spacing', () => {
    const CheckIcon = () => <svg data-testid="check-icon" />
    render(
      <Badge>
        <CheckIcon />
        Badge with Icon
      </Badge>
    )
    const badge = screen.getByText('Badge with Icon')
    const icon = screen.getByTestId('check-icon')

    expect(badge).toBeInTheDocument()
    expect(icon).toBeInTheDocument()
    expect(badge).toHaveClass('gap-1', '[&>svg]:size-3', '[&>svg]:pointer-events-none')
  })

  it('maintains whitespace handling', () => {
    render(<Badge>Multi Word Badge</Badge>)
    const badge = screen.getByText('Multi Word Badge')
    expect(badge).toHaveClass('whitespace-nowrap')
    expect(badge).toHaveTextContent('Multi Word Badge')
  })

  it('handles overflow properly', () => {
    render(<Badge>Very Long Badge Text That Might Overflow</Badge>)
    const badge = screen.getByText('Very Long Badge Text That Might Overflow')
    expect(badge).toHaveClass('overflow-hidden')
  })

  it('supports shrink behavior in flex containers', () => {
    render(
      <div className="flex">
        <Badge>Shrinkable Badge</Badge>
      </div>
    )
    const badge = screen.getByText('Shrinkable Badge')
    expect(badge).toHaveClass('shrink-0')
  })

  it('applies width fit properly', () => {
    render(<Badge>Fit Width Badge</Badge>)
    const badge = screen.getByText('Fit Width Badge')
    expect(badge).toHaveClass('w-fit')
  })

  it('handles transition effects', () => {
    render(<Badge>Animated Badge</Badge>)
    const badge = screen.getByText('Animated Badge')
    expect(badge).toHaveClass('transition-[color,box-shadow]')
  })

  describe('Badge Variants Comprehensive Testing', () => {
    const variants = ['default', 'secondary', 'destructive', 'outline'] as const

    variants.forEach((variant) => {
      it(`applies correct classes for ${variant} variant`, () => {
        render(<Badge variant={variant}>{variant} Badge</Badge>)
        const badge = screen.getByText(`${variant} Badge`)

        // All variants should have base classes
        expect(badge).toHaveClass(
          'inline-flex',
          'items-center',
          'justify-center',
          'rounded-md',
          'border',
          'px-2',
          'py-0.5',
          'text-xs',
          'font-medium'
        )

        // Check variant-specific classes
        switch (variant) {
          case 'default':
            expect(badge).toHaveClass('bg-primary', 'text-primary-foreground')
            break
          case 'secondary':
            expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground')
            break
          case 'destructive':
            expect(badge).toHaveClass('bg-destructive', 'text-white')
            break
          case 'outline':
            expect(badge).toHaveClass('text-foreground')
            break
        }
      })
    })
  })
})