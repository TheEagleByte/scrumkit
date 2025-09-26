import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Label } from '../label'

// Mock Radix UI Label
jest.mock('@radix-ui/react-label', () => ({
  Root: ({ children, ...props }: any) => (
    <label {...props}>
      {children}
    </label>
  ),
}))

describe('Label', () => {
  it('renders label element', () => {
    render(<Label>Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label).toBeInTheDocument()
    expect(label.tagName).toBe('LABEL')
  })

  it('applies data-slot attribute', () => {
    render(<Label>Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label).toHaveAttribute('data-slot', 'label')
  })

  it('applies default classes', () => {
    render(<Label>Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label).toHaveClass(
      'flex',
      'items-center',
      'gap-2',
      'text-sm',
      'leading-none',
      'font-medium',
      'select-none'
    )
  })

  it('accepts custom className', () => {
    render(<Label className="custom-class">Custom Label</Label>)
    const label = screen.getByText('Custom Label')
    expect(label).toHaveClass('custom-class')
  })

  it('forwards all props to Radix Root', () => {
    render(
      <Label
        id="test-label"
        htmlFor="test-input"
        data-testid="label"
        aria-describedby="helper-text"
      >
        Label with Props
      </Label>
    )
    const label = screen.getByTestId('label')
    expect(label).toHaveAttribute('id', 'test-label')
    expect(label).toHaveAttribute('for', 'test-input')
    expect(label).toHaveAttribute('aria-describedby', 'helper-text')
    expect(label).toHaveTextContent('Label with Props')
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(
      <Label onClick={handleClick} data-testid="clickable-label">
        Clickable Label
      </Label>
    )
    const label = screen.getByTestId('clickable-label')

    await user.click(label)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('associates with form controls via htmlFor', () => {
    render(
      <div>
        <Label htmlFor="test-input">Input Label</Label>
        <input id="test-input" type="text" />
      </div>
    )

    const label = screen.getByText('Input Label')
    const input = screen.getByRole('textbox')

    expect(label).toHaveAttribute('for', 'test-input')
    expect(input).toHaveAttribute('id', 'test-input')
  })

  it('supports disabled state styling via group data attributes', () => {
    render(
      <div data-disabled="true" className="group">
        <Label>Disabled Label</Label>
      </div>
    )
    const label = screen.getByText('Disabled Label')
    expect(label).toHaveClass(
      'group-data-[disabled=true]:pointer-events-none',
      'group-data-[disabled=true]:opacity-50'
    )
  })

  it('supports peer disabled styling', () => {
    render(
      <div>
        <input disabled className="peer" />
        <Label>Peer Label</Label>
      </div>
    )
    const label = screen.getByText('Peer Label')
    expect(label).toHaveClass(
      'peer-disabled:cursor-not-allowed',
      'peer-disabled:opacity-50'
    )
  })

  it('renders with icons and maintains proper alignment', () => {
    const TestIcon = () => <svg data-testid="label-icon" />
    render(
      <Label>
        <TestIcon />
        Label with Icon
      </Label>
    )

    const label = screen.getByText('Label with Icon')
    const icon = screen.getByTestId('label-icon')

    expect(label).toBeInTheDocument()
    expect(icon).toBeInTheDocument()
    expect(label).toHaveClass('flex', 'items-center', 'gap-2')
  })

  it('maintains proper text styling', () => {
    render(<Label>Styled Label</Label>)
    const label = screen.getByText('Styled Label')
    expect(label).toHaveClass('text-sm', 'leading-none', 'font-medium')
  })

  it('supports select-none for better UX', () => {
    render(<Label>Non-selectable Label</Label>)
    const label = screen.getByText('Non-selectable Label')
    expect(label).toHaveClass('select-none')
  })

  it('works with checkbox components', async () => {
    const user = userEvent.setup()
    render(
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="checkbox-with-label"
          className="peer"
          data-testid="checkbox"
        />
        <Label
          htmlFor="checkbox-with-label"
          data-testid="checkbox-label"
        >
          Accept terms and conditions
        </Label>
      </div>
    )

    const checkbox = screen.getByTestId('checkbox')
    const label = screen.getByTestId('checkbox-label')

    expect(label).toHaveAttribute('for', 'checkbox-with-label')
    expect(checkbox).toHaveAttribute('id', 'checkbox-with-label')

    // Clicking the label should focus/toggle the checkbox
    await user.click(label)
    expect(checkbox).toBeChecked()
  })

  it('works with radio button components', () => {
    render(
      <div>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="radio-1"
            name="options"
            value="option1"
            className="peer"
          />
          <Label htmlFor="radio-1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="radio-2"
            name="options"
            value="option2"
            className="peer"
          />
          <Label htmlFor="radio-2">Option 2</Label>
        </div>
      </div>
    )

    const label1 = screen.getByText('Option 1')
    const label2 = screen.getByText('Option 2')
    const radio1 = screen.getByDisplayValue('option1')
    const radio2 = screen.getByDisplayValue('option2')

    expect(label1).toHaveAttribute('for', 'radio-1')
    expect(label2).toHaveAttribute('for', 'radio-2')
    expect(radio1).toHaveAttribute('id', 'radio-1')
    expect(radio2).toHaveAttribute('id', 'radio-2')
  })

  it('supports required field indicators', () => {
    render(
      <Label htmlFor="required-field">
        Email Address
        <span className="text-destructive">*</span>
      </Label>
    )

    const label = screen.getByText('Email Address')
    const asterisk = screen.getByText('*')

    expect(label).toBeInTheDocument()
    expect(asterisk).toBeInTheDocument()
    expect(asterisk).toHaveClass('text-destructive')
  })

  it('handles complex content and maintains layout', () => {
    render(
      <Label htmlFor="complex-input">
        <div className="flex flex-col">
          <span>Main Label</span>
          <span className="text-xs text-muted-foreground">Helper text</span>
        </div>
      </Label>
    )

    const mainLabel = screen.getByText('Main Label')
    const helperText = screen.getByText('Helper text')

    expect(mainLabel).toBeInTheDocument()
    expect(helperText).toBeInTheDocument()
    expect(helperText).toHaveClass('text-xs', 'text-muted-foreground')
  })

  it('supports accessibility attributes', () => {
    render(
      <Label
        htmlFor="accessible-input"
        aria-describedby="help-text"
        data-testid="accessible-label"
      >
        Accessible Label
      </Label>
    )

    const label = screen.getByTestId('accessible-label')
    expect(label).toHaveAttribute('aria-describedby', 'help-text')
    expect(label).toHaveAttribute('for', 'accessible-input')
  })

  it('maintains proper styling with different content types', () => {
    render(
      <div>
        <Label data-testid="text-only">Text Only</Label>
        <Label data-testid="with-emphasis">
          <em>Emphasized</em> Label
        </Label>
        <Label data-testid="with-strong">
          <strong>Strong</strong> Label
        </Label>
      </div>
    )

    const textOnly = screen.getByTestId('text-only')
    const withEmphasis = screen.getByTestId('with-emphasis')
    const withStrong = screen.getByTestId('with-strong')

    expect(textOnly).toHaveClass('font-medium')
    expect(withEmphasis).toHaveClass('font-medium')
    expect(withStrong).toHaveClass('font-medium')
  })

  it('works in form validation contexts', () => {
    render(
      <form>
        <div className="group" data-invalid="true">
          <Label htmlFor="invalid-input" className="text-destructive">
            Invalid Field
          </Label>
          <input
            id="invalid-input"
            type="text"
            aria-invalid="true"
            className="peer border-destructive"
          />
        </div>
      </form>
    )

    const label = screen.getByText('Invalid Field')
    const input = screen.getByRole('textbox')

    expect(label).toHaveClass('text-destructive')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(label).toHaveAttribute('for', 'invalid-input')
  })

  it('handles keyboard navigation properly', async () => {
    const handleFocus = jest.fn()
    const user = userEvent.setup()

    render(
      <div>
        <Label htmlFor="keyboard-input">Keyboard Label</Label>
        <input
          id="keyboard-input"
          type="text"
          onFocus={handleFocus}
          data-testid="keyboard-input"
        />
      </div>
    )

    const input = screen.getByTestId('keyboard-input')

    // Tab to the input
    await user.tab()
    expect(handleFocus).toHaveBeenCalledTimes(1)
    expect(input).toHaveFocus()
  })

  it('supports multiple labels for single input', () => {
    render(
      <div>
        <Label htmlFor="multi-label-input" id="label-1">
          Primary Label
        </Label>
        <Label htmlFor="multi-label-input" id="label-2">
          Secondary Label
        </Label>
        <input
          id="multi-label-input"
          type="text"
          aria-labelledby="label-1 label-2"
        />
      </div>
    )

    const primaryLabel = screen.getByText('Primary Label')
    const secondaryLabel = screen.getByText('Secondary Label')
    const input = screen.getByRole('textbox')

    expect(primaryLabel).toHaveAttribute('for', 'multi-label-input')
    expect(secondaryLabel).toHaveAttribute('for', 'multi-label-input')
    expect(input).toHaveAttribute('aria-labelledby', 'label-1 label-2')
  })
})