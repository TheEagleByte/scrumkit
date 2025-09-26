import { render } from '@testing-library/react';
import { Separator } from '../separator';

describe('Separator', () => {
  it('renders horizontal separator by default', () => {
    const { container } = render(<Separator />);
    const separator = container.querySelector('[role="none"]');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('h-px', 'w-full');
  });

  it('renders vertical separator', () => {
    const { container } = render(<Separator orientation="vertical" />);
    const separator = container.querySelector('[role="none"]');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('h-full', 'w-px');
  });

  it('applies decorative role when decorative prop is true', () => {
    const { container } = render(<Separator decorative />);
    const separator = container.querySelector('[role="none"]');
    expect(separator).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Separator className="custom-separator" />);
    const separator = container.querySelector('[role="none"]');
    expect(separator).toHaveClass('custom-separator');
  });
});