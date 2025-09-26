import { render, screen } from '@testing-library/react';
import { Progress } from '../progress';

describe('Progress', () => {
  it('renders progress bar', () => {
    const { container } = render(<Progress value={50} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('applies correct value', () => {
    const { container } = render(<Progress value={75} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute('data-value', '75');
  });

  it('applies max value', () => {
    const { container } = render(<Progress value={50} max={200} />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute('data-max', '200');
  });

  it('calculates percentage correctly', () => {
    const { container } = render(<Progress value={25} />);
    const indicator = container.querySelector('.h-full');
    expect(indicator).toHaveStyle({ transform: 'translateX(-75%)' });
  });

  it('applies custom className', () => {
    const { container } = render(<Progress value={50} className="custom-progress" />);
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveClass('custom-progress');
  });

  it('handles value of 0', () => {
    const { container } = render(<Progress value={0} />);
    const indicator = container.querySelector('.h-full');
    expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
  });

  it('handles value of 100', () => {
    const { container } = render(<Progress value={100} />);
    const indicator = container.querySelector('.h-full');
    expect(indicator).toHaveStyle({ transform: 'translateX(0%)' });
  });
});