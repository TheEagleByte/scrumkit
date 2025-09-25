import { render, screen } from '@testing-library/react'
import { Skeleton } from '../skeleton'

describe('Skeleton', () => {
  it('renders skeleton element', () => {
    render(<Skeleton data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton.tagName).toBe('DIV')
  })

  it('applies data-slot attribute', () => {
    render(<Skeleton data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveAttribute('data-slot', 'skeleton')
  })

  it('applies default classes', () => {
    render(<Skeleton data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass(
      'bg-accent',
      'animate-pulse',
      'rounded-md'
    )
  })

  it('accepts custom className', () => {
    render(<Skeleton className="custom-class" data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('custom-class')
  })

  it('merges custom className with default classes', () => {
    render(<Skeleton className="w-full h-4" data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md', 'w-full', 'h-4')
  })

  it('forwards all props to div element', () => {
    render(
      <Skeleton
        id="test-skeleton"
        role="presentation"
        aria-label="Loading content"
        data-testid="skeleton"
        style={{ width: '100px', height: '20px' }}
      />
    )
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveAttribute('id', 'test-skeleton')
    expect(skeleton).toHaveAttribute('role', 'presentation')
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content')
    expect(skeleton).toHaveStyle({ width: '100px', height: '20px' })
  })

  it('supports accessibility attributes', () => {
    render(
      <Skeleton
        aria-busy="true"
        aria-live="polite"
        data-testid="accessible-skeleton"
      />
    )
    const skeleton = screen.getByTestId('accessible-skeleton')
    expect(skeleton).toHaveAttribute('aria-busy', 'true')
    expect(skeleton).toHaveAttribute('aria-live', 'polite')
  })

  it('can render with content inside', () => {
    render(
      <Skeleton data-testid="skeleton-with-content">
        <span>Hidden content</span>
      </Skeleton>
    )
    const skeleton = screen.getByTestId('skeleton-with-content')
    const content = screen.getByText('Hidden content')

    expect(skeleton).toBeInTheDocument()
    expect(content).toBeInTheDocument()
  })

  it('works as text skeleton', () => {
    render(
      <Skeleton className="h-4 w-[250px]" data-testid="text-skeleton" />
    )
    const skeleton = screen.getByTestId('text-skeleton')
    expect(skeleton).toHaveClass('h-4', 'w-[250px]')
  })

  it('works as avatar skeleton', () => {
    render(
      <Skeleton className="h-12 w-12 rounded-full" data-testid="avatar-skeleton" />
    )
    const skeleton = screen.getByTestId('avatar-skeleton')
    expect(skeleton).toHaveClass('h-12', 'w-12', 'rounded-full')
  })

  it('works as card skeleton', () => {
    render(
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" data-testid="card-avatar" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" data-testid="card-title" />
          <Skeleton className="h-4 w-[200px]" data-testid="card-subtitle" />
        </div>
      </div>
    )

    const avatar = screen.getByTestId('card-avatar')
    const title = screen.getByTestId('card-title')
    const subtitle = screen.getByTestId('card-subtitle')

    expect(avatar).toHaveClass('h-12', 'w-12', 'rounded-full')
    expect(title).toHaveClass('h-4', 'w-[250px]')
    expect(subtitle).toHaveClass('h-4', 'w-[200px]')
  })

  it('supports different border radius variations', () => {
    const { rerender } = render(
      <Skeleton className="rounded-none" data-testid="skeleton" />
    )
    let skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('rounded-none')

    rerender(<Skeleton className="rounded-full" data-testid="skeleton" />)
    skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('rounded-full')

    rerender(<Skeleton className="rounded-lg" data-testid="skeleton" />)
    skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('rounded-lg')
  })

  it('supports different sizes', () => {
    const sizes = [
      { class: 'h-2 w-2', testId: 'tiny' },
      { class: 'h-4 w-4', testId: 'small' },
      { class: 'h-8 w-8', testId: 'medium' },
      { class: 'h-12 w-12', testId: 'large' },
      { class: 'h-16 w-16', testId: 'xl' }
    ]

    render(
      <div>
        {sizes.map(size => (
          <Skeleton
            key={size.testId}
            className={size.class}
            data-testid={size.testId}
          />
        ))}
      </div>
    )

    sizes.forEach(size => {
      const skeleton = screen.getByTestId(size.testId)
      const classes = size.class.split(' ')
      classes.forEach(cls => {
        expect(skeleton).toHaveClass(cls)
      })
    })
  })

  it('supports custom background colors', () => {
    render(
      <Skeleton className="bg-gray-200" data-testid="custom-bg-skeleton" />
    )
    const skeleton = screen.getByTestId('custom-bg-skeleton')
    expect(skeleton).toHaveClass('bg-gray-200')
  })

  it('can override animation', () => {
    render(
      <Skeleton className="animate-bounce" data-testid="custom-animation-skeleton" />
    )
    const skeleton = screen.getByTestId('custom-animation-skeleton')
    expect(skeleton).toHaveClass('animate-bounce')
  })

  it('works in lists for repeated content', () => {
    render(
      <div className="space-y-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton
            key={i}
            className="h-4 w-full"
            data-testid={`list-skeleton-${i}`}
          />
        ))}
      </div>
    )

    for (let i = 0; i < 3; i++) {
      const skeleton = screen.getByTestId(`list-skeleton-${i}`)
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('h-4', 'w-full')
    }
  })

  it('supports complex layouts', () => {
    render(
      <div className="space-y-4" data-testid="complex-layout">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[160px]" />
          </div>
        </div>
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )

    const layout = screen.getByTestId('complex-layout')
    expect(layout).toBeInTheDocument()

    // Check that all skeleton elements are rendered with pulse animation
    const skeletons = layout.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons).toHaveLength(7)

    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('animate-pulse')
    })
  })

  it('works with responsive classes', () => {
    render(
      <Skeleton
        className="h-4 w-full md:h-6 md:w-1/2 lg:h-8 lg:w-1/3"
        data-testid="responsive-skeleton"
      />
    )
    const skeleton = screen.getByTestId('responsive-skeleton')
    expect(skeleton).toHaveClass(
      'h-4',
      'w-full',
      'md:h-6',
      'md:w-1/2',
      'lg:h-8',
      'lg:w-1/3'
    )
  })

  it('maintains accessibility for screen readers', () => {
    render(
      <Skeleton
        role="status"
        aria-label="Loading content"
        className="sr-only"
        data-testid="accessible-skeleton"
      >
        Loading...
      </Skeleton>
    )

    const skeleton = screen.getByTestId('accessible-skeleton')
    expect(skeleton).toHaveAttribute('role', 'status')
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content')
    expect(skeleton).toHaveTextContent('Loading...')
  })

  it('can be used for table skeleton', () => {
    render(
      <table>
        <tbody>
          {Array.from({ length: 3 }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: 4 }, (_, cellIndex) => (
                <td key={cellIndex} className="p-2">
                  <Skeleton
                    className="h-4 w-full"
                    data-testid={`table-cell-${rowIndex}-${cellIndex}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )

    // Check that all table cell skeletons are rendered
    for (let row = 0; row < 3; row++) {
      for (let cell = 0; cell < 4; cell++) {
        const skeleton = screen.getByTestId(`table-cell-${row}-${cell}`)
        expect(skeleton).toBeInTheDocument()
        expect(skeleton).toHaveClass('h-4', 'w-full')
      }
    }
  })

  it('supports gradient backgrounds', () => {
    render(
      <Skeleton
        className="bg-gradient-to-r from-gray-200 to-gray-300"
        data-testid="gradient-skeleton"
      />
    )
    const skeleton = screen.getByTestId('gradient-skeleton')
    expect(skeleton).toHaveClass(
      'bg-gradient-to-r',
      'from-gray-200',
      'to-gray-300'
    )
  })

  it('can be used in grid layouts', () => {
    render(
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton
            key={i}
            className="h-20 w-full rounded-lg"
            data-testid={`grid-skeleton-${i}`}
          />
        ))}
      </div>
    )

    for (let i = 0; i < 6; i++) {
      const skeleton = screen.getByTestId(`grid-skeleton-${i}`)
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('h-20', 'w-full', 'rounded-lg')
    }
  })

  it('preserves event handlers when passed', () => {
    const handleClick = jest.fn()
    render(
      <Skeleton
        onClick={handleClick}
        data-testid="clickable-skeleton"
        className="cursor-pointer"
      />
    )

    const skeleton = screen.getByTestId('clickable-skeleton')
    expect(skeleton).toHaveClass('cursor-pointer')

    // While clicking a skeleton isn't typical UX, the component should support it
    skeleton.click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})