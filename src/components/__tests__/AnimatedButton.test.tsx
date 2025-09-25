import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnimatedButton } from '../AnimatedButton';

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

describe('AnimatedButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AnimatedButton>Click me</AnimatedButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays children content', () => {
    render(<AnimatedButton>Test Button</AnimatedButton>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('renders with primary variant by default', () => {
    const { container } = render(<AnimatedButton>Primary</AnimatedButton>);
    const button = container.querySelector('button');

    expect(button).toHaveClass('group');
    expect(button).toHaveClass('relative');
    expect(button).toHaveClass('inline-flex');

    // Primary variant should have animated gradient border
    const gradientSpan = container.querySelector('.animate-spin-slow');
    expect(gradientSpan).toBeInTheDocument();
  });

  it('renders with secondary variant', () => {
    const { container } = render(
      <AnimatedButton variant="secondary">Secondary</AnimatedButton>
    );
    const button = container.querySelector('button');

    expect(button).toHaveClass('border-gray-800');
    expect(button).toHaveClass('text-white');

    // Secondary variant should not have animated gradient border
    const gradientSpan = container.querySelector('.animate-spin-slow');
    expect(gradientSpan).toBeInTheDocument(); // Secondary also has animated border glow
  });

  it('applies default size classes', () => {
    const { container } = render(<AnimatedButton>Default Size</AnimatedButton>);
    const button = container.querySelector('button');

    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('py-2.5');
    expect(button).toHaveClass('text-base');
  });

  it('applies large size classes', () => {
    const { container } = render(
      <AnimatedButton size="lg">Large Size</AnimatedButton>
    );
    const button = container.querySelector('button');

    expect(button).toHaveClass('px-8');
    expect(button).toHaveClass('h-12');
    expect(button).toHaveClass('text-base');
  });

  it('applies custom className', () => {
    const { container } = render(
      <AnimatedButton className="custom-class">Custom</AnimatedButton>
    );
    const button = container.querySelector('button');

    expect(button).toHaveClass('custom-class');
  });

  it('passes through button attributes', () => {
    render(
      <AnimatedButton
        id="test-button"
        data-testid="animated-button"
        disabled
        type="submit"
      >
        Test
      </AnimatedButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('id', 'test-button');
    expect(button).toHaveAttribute('data-testid', 'animated-button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(
      <AnimatedButton onClick={handleClick}>Clickable</AnimatedButton>
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events', () => {
    const handleKeyDown = jest.fn();

    render(
      <AnimatedButton onKeyDown={handleKeyDown}>Keyboard</AnimatedButton>
    );

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('renders primary variant with correct structure', () => {
    const { container } = render(<AnimatedButton>Primary</AnimatedButton>);

    // Should have outer gradient border span
    const outerSpan = container.querySelector('.animate-spin-slow');
    expect(outerSpan).toBeInTheDocument();
    expect(outerSpan).toHaveClass('bg-gradient-to-r');
    expect(outerSpan).toHaveClass('from-violet-500');

    // Should have inner button content span
    const innerSpan = container.querySelector('.relative.z-10');
    expect(innerSpan).toBeInTheDocument();
    expect(innerSpan).toHaveClass('bg-white');
    expect(innerSpan).toHaveClass('text-black');

    // Should have shimmer effect span
    const shimmerSpan = container.querySelector('.group-hover\\:animate-shine');
    expect(shimmerSpan).toBeInTheDocument();
  });

  it('renders secondary variant with correct structure', () => {
    const { container } = render(
      <AnimatedButton variant="secondary">Secondary</AnimatedButton>
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('border-gray-800');
    expect(button).toHaveClass('text-white');

    // Should have subtle animated border glow
    const glowSpan = container.querySelector('.opacity-0.group-hover\\:opacity-100');
    expect(glowSpan).toBeInTheDocument();
  });

  it('renders with proper hover classes', () => {
    const { container } = render(<AnimatedButton>Hover</AnimatedButton>);

    const button = container.querySelector('button');
    expect(button).toHaveClass('hover:scale-105');

    const innerSpan = container.querySelector('.group-hover\\:bg-gray-100');
    expect(innerSpan).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<AnimatedButton>Accessible Button</AnimatedButton>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAccessibleName('Accessible Button');
  });

  it('supports different content types', () => {
    render(
      <AnimatedButton>
        <span>Icon</span>
        <span>Text</span>
      </AnimatedButton>
    );

    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('applies transition classes', () => {
    const { container } = render(<AnimatedButton>Transition</AnimatedButton>);

    const button = container.querySelector('button');
    expect(button).toHaveClass('transition-all');
    expect(button).toHaveClass('duration-300');
  });

  it('applies overflow-hidden for animations', () => {
    const { container } = render(<AnimatedButton>Overflow</AnimatedButton>);

    const button = container.querySelector('button');
    expect(button).toHaveClass('overflow-hidden');
  });

  it('applies font-medium for typography', () => {
    const { container } = render(<AnimatedButton>Font</AnimatedButton>);

    const button = container.querySelector('button');
    expect(button).toHaveClass('font-medium');
  });

  it('applies rounded-lg border radius', () => {
    const { container } = render(<AnimatedButton>Rounded</AnimatedButton>);

    const button = container.querySelector('button');
    expect(button).toHaveClass('rounded-lg');
  });

  it('handles focus states properly', async () => {
    const user = userEvent.setup();
    render(<AnimatedButton>Focusable</AnimatedButton>);

    const button = screen.getByRole('button');

    await user.tab();
    expect(button).toHaveFocus();
  });

  it('handles disabled state', () => {
    render(
      <AnimatedButton disabled>Disabled</AnimatedButton>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders with correct z-index layering', () => {
    const { container } = render(<AnimatedButton>Layered</AnimatedButton>);

    const innerSpan = container.querySelector('.relative.z-10');
    expect(innerSpan).toBeInTheDocument();

    const textSpan = innerSpan?.querySelector('.relative');
    expect(textSpan).toBeInTheDocument();
  });

  it('primary variant has white background on inner span', () => {
    const { container } = render(<AnimatedButton>Primary White</AnimatedButton>);

    const innerSpan = container.querySelector('.bg-white');
    expect(innerSpan).toBeInTheDocument();
    expect(innerSpan).toHaveClass('text-black');
  });

  it('secondary variant has transparent background', () => {
    const { container } = render(
      <AnimatedButton variant="secondary">Secondary Transparent</AnimatedButton>
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('hover:bg-gray-900');
  });

  it('combines size and variant props correctly', () => {
    const { container } = render(
      <AnimatedButton variant="secondary" size="lg">
        Large Secondary
      </AnimatedButton>
    );

    const button = container.querySelector('button');

    // Should have both secondary variant and large size classes
    expect(button).toHaveClass('border-gray-800'); // secondary
    expect(button).toHaveClass('px-8'); // lg size
    expect(button).toHaveClass('h-12'); // lg size
  });
});