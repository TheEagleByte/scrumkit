import { render, screen } from '@testing-library/react';
import { GithubIcon } from '../GithubIcon';

describe('GithubIcon', () => {
  it('renders SVG icon', () => {
    const { container } = render(<GithubIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has correct dimensions', () => {
    const { container } = render(<GithubIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '25');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('has correct viewBox', () => {
    const { container } = render(<GithubIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 25 24');
  });

  it('contains path element', () => {
    const { container } = render(<GithubIcon />);
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('fill', 'currentColor');
  });

  it('applies custom className', () => {
    const { container } = render(<GithubIcon className="custom-icon" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-icon');
  });

  it('passes through other props', () => {
    const { container } = render(<GithubIcon data-testid="github-icon" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('data-testid', 'github-icon');
  });
});