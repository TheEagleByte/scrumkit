import { render } from '@testing-library/react';
import { GlassCard } from '../glass-card';

describe('GlassCard', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<GlassCard>Card Content</GlassCard>);
    expect(getByText('Card Content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<GlassCard>Test</GlassCard>);
    const card = container.firstChild;
    expect(card).toHaveClass('relative', 'overflow-hidden', 'rounded-xl', 'border');
  });

  it('applies custom className', () => {
    const { container } = render(<GlassCard className="custom-class">Test</GlassCard>);
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('has glass effect background', () => {
    const { container } = render(<GlassCard>Test</GlassCard>);
    const glassEffect = container.querySelector('.absolute.inset-0');
    expect(glassEffect).toBeInTheDocument();
  });

  it('passes through other props', () => {
    const { container } = render(<GlassCard data-testid="glass">Test</GlassCard>);
    const card = container.firstChild;
    expect(card).toHaveAttribute('data-testid', 'glass');
  });
});