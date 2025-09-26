import { render, screen } from '@testing-library/react';
import StarBorder from '../StarBorder';

describe('StarBorder', () => {
  it('renders with default props', () => {
    render(<StarBorder>Test Content</StarBorder>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('relative', 'inline-block', 'overflow-hidden');
  });

  it('renders children correctly', () => {
    render(<StarBorder>Click Me</StarBorder>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<StarBorder className="custom-class">Test</StarBorder>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders as different component when "as" prop is provided', () => {
    render(<StarBorder as="div">Content</StarBorder>);
    const div = screen.getByText('Content').closest('div.relative');
    expect(div).toBeInTheDocument();
    expect(div).toHaveClass('relative', 'inline-block');
  });

  it('applies custom color prop', () => {
    const { container } = render(<StarBorder color="blue">Test</StarBorder>);
    const animatedElements = container.querySelectorAll('.animate-star-movement-bottom, .animate-star-movement-top');
    expect(animatedElements).toHaveLength(2);
  });

  it('applies custom speed prop', () => {
    const { container } = render(<StarBorder speed="10s">Test</StarBorder>);
    const animatedElements = container.querySelectorAll('[style*="animation-duration"]');
    expect(animatedElements.length).toBeGreaterThan(0);
  });

  it('applies custom thickness prop', () => {
    render(<StarBorder thickness={2}>Test</StarBorder>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle('padding: 2px 0');
  });
});