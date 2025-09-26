import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '../card'

describe('Card', () => {
  it('renders card with default classes', () => {
    render(<Card data-testid="card">Card content</Card>)
    const card = screen.getByTestId('card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass(
      'bg-card',
      'text-card-foreground',
      'flex',
      'flex-col',
      'gap-6',
      'rounded-xl',
      'border',
      'py-6',
      'shadow-sm'
    )
  })

  it('applies data-slot attribute', () => {
    render(<Card data-testid="card" />)
    const card = screen.getByTestId('card')
    expect(card).toHaveAttribute('data-slot', 'card')
  })

  it('accepts custom className', () => {
    render(<Card data-testid="card" className="custom-class" />)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('custom-class')
  })

  it('forwards all props to div element', () => {
    render(
      <Card
        data-testid="card"
        id="test-card"
        role="region"
        aria-label="Test card"
      >
        Content
      </Card>
    )
    const card = screen.getByTestId('card')
    expect(card).toHaveAttribute('id', 'test-card')
    expect(card).toHaveAttribute('role', 'region')
    expect(card).toHaveAttribute('aria-label', 'Test card')
    expect(card).toHaveTextContent('Content')
  })
})

describe('CardHeader', () => {
  it('renders card header with default classes', () => {
    render(<CardHeader data-testid="card-header">Header content</CardHeader>)
    const header = screen.getByTestId('card-header')
    expect(header).toBeInTheDocument()
    expect(header).toHaveClass(
      '@container/card-header',
      'grid',
      'auto-rows-min',
      'grid-rows-[auto_auto]',
      'items-start',
      'gap-1.5',
      'px-6'
    )
  })

  it('applies data-slot attribute', () => {
    render(<CardHeader data-testid="card-header" />)
    const header = screen.getByTestId('card-header')
    expect(header).toHaveAttribute('data-slot', 'card-header')
  })

  it('accepts custom className', () => {
    render(<CardHeader data-testid="card-header" className="custom-header" />)
    const header = screen.getByTestId('card-header')
    expect(header).toHaveClass('custom-header')
  })

  it('renders with CardAction to create two-column layout', () => {
    render(
      <CardHeader data-testid="card-header">
        <CardTitle>Title</CardTitle>
        <CardAction>Action</CardAction>
      </CardHeader>
    )
    const header = screen.getByTestId('card-header')
    expect(header).toHaveClass('has-data-[slot=card-action]:grid-cols-[1fr_auto]')
  })
})

describe('CardTitle', () => {
  it('renders card title with default classes', () => {
    render(<CardTitle data-testid="card-title">Card Title</CardTitle>)
    const title = screen.getByTestId('card-title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('leading-none', 'font-semibold')
    expect(title).toHaveTextContent('Card Title')
  })

  it('applies data-slot attribute', () => {
    render(<CardTitle data-testid="card-title" />)
    const title = screen.getByTestId('card-title')
    expect(title).toHaveAttribute('data-slot', 'card-title')
  })

  it('accepts custom className', () => {
    render(<CardTitle data-testid="card-title" className="custom-title" />)
    const title = screen.getByTestId('card-title')
    expect(title).toHaveClass('custom-title')
  })

  it('can render as different elements', () => {
    render(<CardTitle as="h1" data-testid="card-title">Title</CardTitle>)
    const title = screen.getByTestId('card-title')
    expect(title.tagName).toBe('DIV') // Component always renders as div
  })
})

describe('CardDescription', () => {
  it('renders card description with default classes', () => {
    render(<CardDescription data-testid="card-description">Card description</CardDescription>)
    const description = screen.getByTestId('card-description')
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('text-muted-foreground', 'text-sm')
    expect(description).toHaveTextContent('Card description')
  })

  it('applies data-slot attribute', () => {
    render(<CardDescription data-testid="card-description" />)
    const description = screen.getByTestId('card-description')
    expect(description).toHaveAttribute('data-slot', 'card-description')
  })

  it('accepts custom className', () => {
    render(<CardDescription data-testid="card-description" className="custom-description" />)
    const description = screen.getByTestId('card-description')
    expect(description).toHaveClass('custom-description')
  })
})

describe('CardAction', () => {
  it('renders card action with default classes', () => {
    render(<CardAction data-testid="card-action">Action</CardAction>)
    const action = screen.getByTestId('card-action')
    expect(action).toBeInTheDocument()
    expect(action).toHaveClass(
      'col-start-2',
      'row-span-2',
      'row-start-1',
      'self-start',
      'justify-self-end'
    )
    expect(action).toHaveTextContent('Action')
  })

  it('applies data-slot attribute', () => {
    render(<CardAction data-testid="card-action" />)
    const action = screen.getByTestId('card-action')
    expect(action).toHaveAttribute('data-slot', 'card-action')
  })

  it('accepts custom className', () => {
    render(<CardAction data-testid="card-action" className="custom-action" />)
    const action = screen.getByTestId('card-action')
    expect(action).toHaveClass('custom-action')
  })
})

describe('CardContent', () => {
  it('renders card content with default classes', () => {
    render(<CardContent data-testid="card-content">Main content</CardContent>)
    const content = screen.getByTestId('card-content')
    expect(content).toBeInTheDocument()
    expect(content).toHaveClass('px-6')
    expect(content).toHaveTextContent('Main content')
  })

  it('applies data-slot attribute', () => {
    render(<CardContent data-testid="card-content" />)
    const content = screen.getByTestId('card-content')
    expect(content).toHaveAttribute('data-slot', 'card-content')
  })

  it('accepts custom className', () => {
    render(<CardContent data-testid="card-content" className="custom-content" />)
    const content = screen.getByTestId('card-content')
    expect(content).toHaveClass('custom-content')
  })
})

describe('CardFooter', () => {
  it('renders card footer with default classes', () => {
    render(<CardFooter data-testid="card-footer">Footer content</CardFooter>)
    const footer = screen.getByTestId('card-footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('flex', 'items-center', 'px-6')
    expect(footer).toHaveTextContent('Footer content')
  })

  it('applies data-slot attribute', () => {
    render(<CardFooter data-testid="card-footer" />)
    const footer = screen.getByTestId('card-footer')
    expect(footer).toHaveAttribute('data-slot', 'card-footer')
  })

  it('accepts custom className', () => {
    render(<CardFooter data-testid="card-footer" className="custom-footer" />)
    const footer = screen.getByTestId('card-footer')
    expect(footer).toHaveClass('custom-footer')
  })

  it('applies border-t styling when needed', () => {
    render(<CardFooter data-testid="card-footer" className="border-t" />)
    const footer = screen.getByTestId('card-footer')
    expect(footer).toHaveClass('[.border-t]:pt-6')
  })
})

describe('Card - Full Integration', () => {
  it('renders a complete card with all components', () => {
    render(
      <Card data-testid="complete-card">
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>This is a test card</CardDescription>
          <CardAction>
            <button>Action</button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p>This is the main content of the card.</p>
        </CardContent>
        <CardFooter>
          <button>Footer Action</button>
        </CardFooter>
      </Card>
    )

    const card = screen.getByTestId('complete-card')
    const title = screen.getByText('Test Card')
    const description = screen.getByText('This is a test card')
    const content = screen.getByText('This is the main content of the card.')
    const actionButton = screen.getByRole('button', { name: 'Action' })
    const footerButton = screen.getByRole('button', { name: 'Footer Action' })

    expect(card).toBeInTheDocument()
    expect(title).toBeInTheDocument()
    expect(description).toBeInTheDocument()
    expect(content).toBeInTheDocument()
    expect(actionButton).toBeInTheDocument()
    expect(footerButton).toBeInTheDocument()
  })

  it('maintains proper semantic structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Accessible Card</CardTitle>
          <CardDescription>Description for accessibility</CardDescription>
        </CardHeader>
        <CardContent>Content goes here</CardContent>
      </Card>
    )

    const card = screen.getByText('Accessible Card').closest('[data-slot="card"]')
    expect(card).toBeInTheDocument()

    const header = screen.getByText('Accessible Card').closest('[data-slot="card-header"]')
    expect(header).toBeInTheDocument()

    const content = screen.getByText('Content goes here').closest('[data-slot="card-content"]')
    expect(content).toBeInTheDocument()
  })
})