import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('applies default data-slot attribute', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('data-slot', 'input')
  })

  it('applies default classes', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass(
      'border-input',
      'flex',
      'h-9',
      'w-full',
      'rounded-md',
      'border',
      'bg-transparent',
      'px-3',
      'py-1'
    )
  })

  it('accepts custom className', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('forwards all props to input element', () => {
    render(
      <Input
        placeholder="Enter text"
        name="test-input"
        id="test-id"
        maxLength={10}
      />
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', 'Enter text')
    expect(input).toHaveAttribute('name', 'test-input')
    expect(input).toHaveAttribute('id', 'test-id')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  it('handles different input types', () => {
    render(<Input type="password" data-testid="password-input" />)
    const input = screen.getByTestId('password-input')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('handles email input type', () => {
    render(<Input type="email" placeholder="Enter email" />)
    const input = screen.getByRole('textbox', { name: '' })
    expect(input).toHaveAttribute('type', 'email')
  })

  it('handles number input type', () => {
    render(<Input type="number" placeholder="Enter number" />)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('handles user input correctly', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Type here" />)
    const input = screen.getByRole('textbox')

    await user.type(input, 'Hello World')
    expect(input).toHaveValue('Hello World')
  })

  it('calls onChange handler when value changes', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')

    await user.type(input, 'a')
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:pointer-events-none', 'disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('supports readonly attribute', () => {
    render(<Input readOnly value="Read only value" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('readonly')
    expect(input).toHaveValue('Read only value')
  })

  it('supports required attribute', () => {
    render(<Input required />)
    const input = screen.getByRole('textbox')
    expect(input).toBeRequired()
  })

  it('handles focus and blur events', async () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    const user = userEvent.setup()

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
    const input = screen.getByRole('textbox')

    await user.click(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)

    await user.tab()
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('applies focus-visible styles when focused', async () => {
    const user = userEvent.setup()
    render(<Input />)
    const input = screen.getByRole('textbox')

    await user.click(input)
    expect(input).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50')
  })

  it('applies aria-invalid styles when invalid', () => {
    render(<Input aria-invalid="true" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveClass('aria-invalid:ring-destructive/20', 'aria-invalid:border-destructive')
  })

  it('supports controlled input pattern', () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('')
      return (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          data-testid="controlled-input"
        />
      )
    }

    render(<TestComponent />)
    const input = screen.getByTestId('controlled-input')
    expect(input).toHaveValue('')
  })

  it('handles file input type with proper styling', () => {
    render(<Input type="file" data-testid="file-input" />)
    const input = screen.getByTestId('file-input')
    expect(input).toHaveAttribute('type', 'file')
    expect(input).toHaveClass('file:inline-flex', 'file:h-7', 'file:border-0')
  })

  it('applies default value when provided', () => {
    render(<Input defaultValue="Default text" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('Default text')
  })

  it('handles min and max attributes for number inputs', () => {
    render(<Input type="number" min={0} max={100} />)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '100')
  })

  it('handles step attribute for number inputs', () => {
    render(<Input type="number" step={0.1} />)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('step', '0.1')
  })

  it('supports autoComplete attribute', () => {
    render(<Input autoComplete="email" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('autoComplete', 'email')
  })

  it('supports autoFocus attribute', () => {
    render(<Input autoFocus data-testid="autofocus-input" />)
    const input = screen.getByTestId('autofocus-input')
    expect(input).toBeInTheDocument()
  })
})