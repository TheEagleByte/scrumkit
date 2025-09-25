import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '../checkbox'

// Mock lucide-react CheckIcon
jest.mock('lucide-react', () => ({
  CheckIcon: () => <svg data-testid="check-icon" className="size-3.5" />,
}))

// Mock Radix UI Checkbox
jest.mock('@radix-ui/react-checkbox', () => ({
  Root: ({ children, ...props }: any) => (
    <div role="checkbox" {...props}>
      {children}
    </div>
  ),
  Indicator: ({ children, ...props }: any) => (
    <div data-testid="checkbox-indicator" {...props}>
      {children}
    </div>
  ),
}))

describe('Checkbox', () => {
  it('renders checkbox with correct role', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('data-slot', 'checkbox')
  })

  it('applies default classes', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass(
      'peer',
      'border-input',
      'size-4',
      'shrink-0',
      'rounded-[4px]',
      'border',
      'shadow-xs',
      'transition-shadow',
      'outline-none'
    )
  })

  it('accepts custom className', () => {
    render(<Checkbox className="custom-class" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('custom-class')
  })

  it('forwards all props to Radix Root', () => {
    render(
      <Checkbox
        id="test-checkbox"
        name="test"
        value="test-value"
        data-testid="checkbox"
        aria-label="Test checkbox"
      />
    )
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toHaveAttribute('id', 'test-checkbox')
    expect(checkbox).toHaveAttribute('name', 'test')
    expect(checkbox).toHaveAttribute('value', 'test-value')
    expect(checkbox).toHaveAttribute('aria-label', 'Test checkbox')
  })

  it('renders checkbox indicator', () => {
    render(<Checkbox />)
    const indicator = screen.getByTestId('checkbox-indicator')
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveAttribute('data-slot', 'checkbox-indicator')
  })

  it('indicator has correct classes', () => {
    render(<Checkbox />)
    const indicator = screen.getByTestId('checkbox-indicator')
    expect(indicator).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'text-current',
      'transition-none'
    )
  })

  it('renders CheckIcon inside indicator', () => {
    render(<Checkbox />)
    const checkIcon = screen.getByTestId('check-icon')
    expect(checkIcon).toBeInTheDocument()
    expect(checkIcon).toHaveClass('size-3.5')
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<Checkbox onClick={handleClick} />)
    const checkbox = screen.getByRole('checkbox')

    await user.click(checkbox)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('accepts checked prop', () => {
    render(<Checkbox checked={true} data-testid="controlled-checkbox" />)
    const checkbox = screen.getByTestId('controlled-checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('accepts defaultChecked prop', () => {
    render(<Checkbox defaultChecked={true} data-testid="default-checkbox" />)
    const checkbox = screen.getByTestId('default-checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('can be disabled', () => {
    render(<Checkbox disabled />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('disabled')
    expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('supports focus styles', () => {
    render(<Checkbox data-testid="focusable-checkbox" />)
    const checkbox = screen.getByTestId('focusable-checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toHaveClass('focus-visible:ring-[3px]')
  })

  it('supports focus-visible styles', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass(
      'focus-visible:border-ring',
      'focus-visible:ring-ring/50',
      'focus-visible:ring-[3px]'
    )
  })

  it('applies checked state styles', () => {
    render(<Checkbox checked={true} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass(
      'data-[state=checked]:bg-primary',
      'data-[state=checked]:text-primary-foreground',
      'data-[state=checked]:border-primary'
    )
  })

  it('applies dark mode styles', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass(
      'dark:bg-input/30',
      'dark:data-[state=checked]:bg-primary'
    )
  })

  it('applies aria-invalid styles when invalid', () => {
    render(<Checkbox aria-invalid="true" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass(
      'aria-invalid:ring-destructive/20',
      'dark:aria-invalid:ring-destructive/40',
      'aria-invalid:border-destructive'
    )
  })

  it('works with state management', () => {
    const TestComponent = () => {
      const [checked, setChecked] = React.useState(false)

      return (
        <div>
          <Checkbox
            checked={checked}
            onClick={() => setChecked(!checked)}
            data-testid="controlled-checkbox"
          />
          <span data-testid="status">{checked ? 'checked' : 'unchecked'}</span>
        </div>
      )
    }

    render(<TestComponent />)
    const status = screen.getByTestId('status')
    expect(status).toHaveTextContent('unchecked')
  })

  it('supports form integration with name and value', () => {
    render(
      <form>
        <Checkbox name="agreement" value="accepted" />
      </form>
    )
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('name', 'agreement')
    expect(checkbox).toHaveAttribute('value', 'accepted')
  })

  it('handles required attribute', () => {
    render(<Checkbox required />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('required')
  })

  it('supports custom id for labeling', () => {
    render(
      <div>
        <Checkbox id="custom-checkbox" />
        <label htmlFor="custom-checkbox">Custom Label</label>
      </div>
    )
    const checkbox = screen.getByRole('checkbox')
    const label = screen.getByText('Custom Label')

    expect(checkbox).toHaveAttribute('id', 'custom-checkbox')
    expect(label).toHaveAttribute('for', 'custom-checkbox')
  })

  it('maintains peer class for CSS peer selectors', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('peer')
  })

  it('forwards click events properly', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<Checkbox onClick={handleClick} data-testid="clickable-checkbox" />)
    const checkbox = screen.getByTestId('clickable-checkbox')

    await user.click(checkbox)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders multiple checkboxes correctly', () => {
    render(
      <div>
        <Checkbox data-testid="unchecked" />
        <Checkbox data-testid="checked" checked={true} />
        <Checkbox data-testid="disabled" disabled />
      </div>
    )

    const unchecked = screen.getByTestId('unchecked')
    const checked = screen.getByTestId('checked')
    const disabled = screen.getByTestId('disabled')

    expect(unchecked).toBeInTheDocument()
    expect(checked).toBeInTheDocument()
    expect(disabled).toBeInTheDocument()
    expect(disabled).toHaveAttribute('disabled')
  })
})