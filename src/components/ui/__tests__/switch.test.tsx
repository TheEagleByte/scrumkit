import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '../switch';

describe('Switch', () => {
  it('renders switch component', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('[data-slot="switch"]');
    expect(switchElement).toBeInTheDocument();
  });

  it('renders unchecked by default', () => {
    const { container } = render(<Switch />);
    const switchElement = container.querySelector('[data-slot="switch"]');
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');
  });

  it('renders checked when checked prop is true', () => {
    const { container } = render(<Switch checked />);
    const switchElement = container.querySelector('[data-slot="switch"]');
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });

  it('toggles when clicked', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    const { container } = render(<Switch onCheckedChange={onCheckedChange} />);
    const switchElement = container.querySelector('[data-slot="switch"]') as HTMLElement;

    await user.click(switchElement);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('applies custom className', () => {
    const { container } = render(<Switch className="custom-switch" />);
    const switchElement = container.querySelector('[data-slot="switch"]');
    expect(switchElement).toHaveClass('custom-switch');
  });

  it('can be disabled', () => {
    const { container } = render(<Switch disabled />);
    const switchElement = container.querySelector('[data-slot="switch"]');
    expect(switchElement).toBeDisabled();
  });

  it('renders thumb element', () => {
    const { container } = render(<Switch />);
    const thumbElement = container.querySelector('[data-slot="switch-thumb"]');
    expect(thumbElement).toBeInTheDocument();
  });
});