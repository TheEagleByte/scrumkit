import { render } from '@testing-library/react';
import { GlassCard } from '../glass-card';

// Mock motion from motion/react
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

describe('GlassCard', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<GlassCard>Card Content</GlassCard>);
    expect(getByText('Card Content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<GlassCard>Test</GlassCard>);
    const card = container.firstChild;
    expect(card).toHaveClass('relative', 'rounded-xl', 'border', 'border-white/10');
  });

  it('applies custom className', () => {
    const { container } = render(<GlassCard className="custom-class">Test</GlassCard>);
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('has glass effect styles', () => {
    const { container } = render(<GlassCard>Test</GlassCard>);
    const card = container.firstChild;
    expect(card).toHaveClass('bg-white/5', 'backdrop-blur-md');
  });

  it('accepts delay prop', () => {
    const { container } = render(<GlassCard delay={0.5}>Delayed</GlassCard>);
    const card = container.firstChild;
    expect(card).toBeInTheDocument();
  });
});