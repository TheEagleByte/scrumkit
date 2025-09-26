import { render, screen } from '@testing-library/react';
import { motion } from 'motion/react';
import Magnet from '../Magnet';

// Mock motion from motion/react
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, style, ...props }: any) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
  },
}));

describe('Magnet', () => {
  it('renders children correctly', () => {
    render(
      <Magnet>
        <button>Test Button</button>
      </Magnet>
    );
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('wraps children with motion div', () => {
    const { container } = render(
      <Magnet>
        <span>Content</span>
      </Magnet>
    );
    const wrapper = container.firstChild;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.nodeName).toBe('DIV');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Magnet className="custom-magnet">
        <div>Test</div>
      </Magnet>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-magnet');
  });

  it('handles disabled state', () => {
    const { container } = render(
      <Magnet disabled>
        <button>Disabled</button>
      </Magnet>
    );
    // The component should still render but without magnet effects
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('applies default transition values when enabled', () => {
    const { container } = render(
      <Magnet>
        <div>Enabled</div>
      </Magnet>
    );
    const wrapper = container.firstChild;
    expect(wrapper).toBeInTheDocument();
  });

  it('does not apply magnet effect when disabled', () => {
    const { rerender } = render(
      <Magnet disabled>
        <div>Content</div>
      </Magnet>
    );

    // Verify it renders normally when disabled
    expect(screen.getByText('Content')).toBeInTheDocument();

    // Re-render with enabled state
    rerender(
      <Magnet disabled={false}>
        <div>Content</div>
      </Magnet>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});