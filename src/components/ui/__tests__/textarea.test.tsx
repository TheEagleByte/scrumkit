import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '../textarea'

describe('Textarea', () => {
  it('renders textarea element', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('applies data-slot attribute', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('data-slot', 'textarea')
  })

  it('applies default classes', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass(
      'border-input',
      'placeholder:text-muted-foreground',
      'flex',
      'field-sizing-content',
      'min-h-16',
      'w-full',
      'rounded-md',
      'border',
      'bg-transparent',
      'px-3',
      'py-2',
      'text-base',
      'shadow-xs',
      'transition-[color,box-shadow]',
      'outline-none'
    )
  })

  it('accepts custom className', () => {
    render(<Textarea className="custom-class" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('custom-class')
  })

  it('forwards all props to textarea element', () => {
    render(
      <Textarea
        placeholder="Enter text"
        name="test-textarea"
        id="test-id"
        rows={5}
        cols={50}
        maxLength={100}
        data-testid="textarea"
      />
    )
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('placeholder', 'Enter text')
    expect(textarea).toHaveAttribute('name', 'test-textarea')
    expect(textarea).toHaveAttribute('id', 'test-id')
    expect(textarea).toHaveAttribute('rows', '5')
    expect(textarea).toHaveAttribute('cols', '50')
    expect(textarea).toHaveAttribute('maxLength', '100')
  })

  it('handles user input correctly', async () => {
    const user = userEvent.setup()
    render(<Textarea placeholder="Type here" />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'Hello World\nThis is a new line')
    expect(textarea).toHaveValue('Hello World\nThis is a new line')
  })

  it('calls onChange handler when value changes', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    render(<Textarea onChange={handleChange} />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'a')
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Textarea disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('supports readonly attribute', () => {
    render(<Textarea readOnly value="Read only value" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('readonly')
    expect(textarea).toHaveValue('Read only value')
  })

  it('supports required attribute', () => {
    render(<Textarea required />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeRequired()
  })

  it('handles focus and blur events', async () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    const user = userEvent.setup()

    render(<Textarea onFocus={handleFocus} onBlur={handleBlur} />)
    const textarea = screen.getByRole('textbox')

    await user.click(textarea)
    expect(handleFocus).toHaveBeenCalledTimes(1)

    await user.tab()
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('applies focus-visible styles when focused', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    await user.click(textarea)
    expect(textarea).toHaveClass(
      'focus-visible:border-ring',
      'focus-visible:ring-ring/50',
      'focus-visible:ring-[3px]'
    )
  })

  it('applies aria-invalid styles when invalid', () => {
    render(<Textarea aria-invalid="true" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveClass(
      'aria-invalid:ring-destructive/20',
      'dark:aria-invalid:ring-destructive/40',
      'aria-invalid:border-destructive'
    )
  })

  it('supports controlled input pattern', async () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('')
      return (
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          data-testid="controlled-textarea"
        />
      )
    }

    const user = userEvent.setup()
    render(<TestComponent />)
    const textarea = screen.getByTestId('controlled-textarea')

    expect(textarea).toHaveValue('')
    await user.type(textarea, 'Controlled text')
    expect(textarea).toHaveValue('Controlled text')
  })

  it('applies default value when provided', () => {
    render(<Textarea defaultValue="Default text content" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('Default text content')
  })

  it('supports autoComplete attribute', () => {
    render(<Textarea autoComplete="off" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('autoComplete', 'off')
  })

  it('supports autoFocus attribute', () => {
    render(<Textarea autoFocus data-testid="autofocus-textarea" />)
    const textarea = screen.getByTestId('autofocus-textarea')
    expect(textarea).toBeInTheDocument()
  })

  it('supports spellCheck attribute', () => {
    render(<Textarea spellCheck={false} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('spellCheck', 'false')
  })

  it('handles resize behavior with field-sizing-content', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('field-sizing-content')
  })

  it('maintains minimum height', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('min-h-16')
  })

  it('supports custom rows and cols attributes', () => {
    render(<Textarea rows={10} cols={80} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '10')
    expect(textarea).toHaveAttribute('cols', '80')
  })

  it('handles wrap attribute', () => {
    render(<Textarea wrap="hard" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('wrap', 'hard')
  })

  it('supports form integration', () => {
    render(
      <form>
        <Textarea name="description" form="test-form" />
      </form>
    )
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('name', 'description')
    expect(textarea).toHaveAttribute('form', 'test-form')
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    // Tab to focus
    await user.tab()
    expect(textarea).toHaveFocus()

    // Type some text
    await user.type(textarea, 'Line 1{enter}Line 2')
    expect(textarea).toHaveValue('Line 1\nLine 2')
  })

  it('supports multiple validation states', () => {
    const { rerender } = render(<Textarea aria-invalid="false" />)
    let textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('aria-invalid', 'false')

    rerender(<Textarea aria-invalid="true" />)
    textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveClass('aria-invalid:border-destructive')
  })

  it('applies dark mode styles', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('dark:bg-input/30')
  })

  it('supports responsive text sizing', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('text-base', 'md:text-sm')
  })

  it('handles long text content correctly', async () => {
    const user = userEvent.setup()
    const longText = 'This is a very long text that should be handled properly by the textarea component. '.repeat(10)

    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, longText)
    expect(textarea).toHaveValue(longText)
  })

  it('works with labels correctly', () => {
    render(
      <div>
        <label htmlFor="textarea-with-label">Description</label>
        <Textarea id="textarea-with-label" />
      </div>
    )

    const label = screen.getByText('Description')
    const textarea = screen.getByRole('textbox')

    expect(label).toHaveAttribute('for', 'textarea-with-label')
    expect(textarea).toHaveAttribute('id', 'textarea-with-label')
  })

  it('supports accessibility attributes', () => {
    render(
      <Textarea
        aria-describedby="help-text"
        aria-labelledby="textarea-label"
        role="textbox"
        data-testid="accessible-textarea"
      />
    )

    const textarea = screen.getByTestId('accessible-textarea')
    expect(textarea).toHaveAttribute('aria-describedby', 'help-text')
    expect(textarea).toHaveAttribute('aria-labelledby', 'textarea-label')
    expect(textarea).toHaveAttribute('role', 'textbox')
  })

  it('handles copy and paste operations', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')

    // Type some text
    await user.type(textarea, 'Copy this text')
    expect(textarea).toHaveValue('Copy this text')

    // Select all text
    await user.keyboard('{Control>}a{/Control}')
    expect(textarea.selectionStart).toBe(0)
    expect(textarea.selectionEnd).toBe(14)
  })

  it('maintains proper styling with different content types', async () => {
    const user = userEvent.setup()
    render(<Textarea placeholder="Enter structured content" />)
    const textarea = screen.getByRole('textbox')

    const structuredText = `Title: Test Document

Content:
- Point 1
- Point 2
- Point 3

Conclusion: This is the end.`

    await user.type(textarea, structuredText)
    expect(textarea).toHaveValue(structuredText)
  })

  it('supports onKeyDown and other keyboard events', async () => {
    const handleKeyDown = jest.fn()
    const handleKeyUp = jest.fn()
    const user = userEvent.setup()

    render(
      <Textarea
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      />
    )
    const textarea = screen.getByRole('textbox')

    await user.type(textarea, 'a')
    expect(handleKeyDown).toHaveBeenCalled()
    expect(handleKeyUp).toHaveBeenCalled()
  })

  it('works in uncontrolled mode with ref', () => {
    const TestComponent = () => {
      const textareaRef = React.useRef<HTMLTextAreaElement>(null)

      return (
        <div>
          <Textarea ref={textareaRef} defaultValue="Initial value" />
          <button
            onClick={() => {
              if (textareaRef.current) {
                textareaRef.current.focus()
              }
            }}
          >
            Focus Textarea
          </button>
        </div>
      )
    }

    render(<TestComponent />)
    const textarea = screen.getByRole('textbox')
    const button = screen.getByText('Focus Textarea')

    expect(textarea).toHaveValue('Initial value')
    expect(button).toBeInTheDocument()
  })
})