import { render, screen } from '@testing-library/react';
import { HeroSection } from '../HeroSection';

// Mock motion/react
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    p: ({ children, className, ...props }: any) => <p className={className} {...props}>{children}</p>,
    h1: ({ children, className, ...props }: any) => <h1 className={className} {...props}>{children}</h1>,
  },
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, className, onClick }: any) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
});

// Mock AnimatedText component
jest.mock('@/components/animations/AnimatedText', () => ({
  AnimatedText: ({ text, className }: { text: string; className?: string }) => (
    <span className={className}>{text}</span>
  ),
}));

// Mock GradientBlob component
jest.mock('@/components/animations/GradientBlob', () => ({
  GradientBlob: ({ className, delay }: { className?: string; delay?: number }) => (
    <div className={className} data-testid="gradient-blob" data-delay={delay} />
  ),
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, className, size, variant, ...props }: any) => (
    <button className={className} data-size={size} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

// Mock animations
jest.mock('@/lib/animations', () => ({
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="arrow-right-icon">→</span>,
  Sparkles: () => <span data-testid="sparkles-icon">✨</span>,
  Users: () => <span data-testid="users-icon">👥</span>,
}));

describe('HeroSection', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<HeroSection />);
    expect(screen.getByText('Sprint Retrospectives')).toBeInTheDocument();
  });

  it('displays the main headline correctly', () => {
    render(<HeroSection />);

    expect(screen.getByText('Sprint Retrospectives')).toBeInTheDocument();
    expect(screen.getByText('That Teams Love')).toBeInTheDocument();
  });

  it('displays the description text', () => {
    render(<HeroSection />);

    const description = screen.getByText(/Run engaging retrospectives that drive continuous improvement/);
    expect(description).toBeInTheDocument();
  });

  it('renders the new feature badge with correct link', () => {
    render(<HeroSection />);

    const newFeatureBadge = screen.getByText('New: AI-Powered Insights');
    expect(newFeatureBadge).toBeInTheDocument();

    const link = newFeatureBadge.closest('a');
    expect(link).toHaveAttribute('href', '/retro');
  });

  it('renders CTA buttons with correct links', () => {
    render(<HeroSection />);

    const startRetroButton = screen.getByText('Start Free Retro');
    expect(startRetroButton).toBeInTheDocument();

    const viewDemoButton = screen.getByText('View Demo');
    expect(viewDemoButton).toBeInTheDocument();

    // Check links
    const startRetroLink = startRetroButton.closest('a');
    const viewDemoLink = viewDemoButton.closest('a');

    expect(startRetroLink).toHaveAttribute('href', '/retro');
    expect(viewDemoLink).toHaveAttribute('href', '#features');
  });

  it('displays trust indicators', () => {
    render(<HeroSection />);

    expect(screen.getByText('500+ Teams')).toBeInTheDocument();
    expect(screen.getByText('Free Forever')).toBeInTheDocument();
    expect(screen.getByText('4.9/5 Rating')).toBeInTheDocument();
  });

  it('renders preview card with retrospective columns', () => {
    render(<HeroSection />);

    expect(screen.getByText('What went well')).toBeInTheDocument();
    expect(screen.getByText('What could be improved')).toBeInTheDocument();
    expect(screen.getByText('Action items')).toBeInTheDocument();
  });

  it('renders gradient blob components with different delays', () => {
    render(<HeroSection />);

    const gradientBlobs = screen.getAllByTestId('gradient-blob');
    expect(gradientBlobs).toHaveLength(3);

    expect(gradientBlobs[0]).toHaveAttribute('data-delay', '0');
    expect(gradientBlobs[1]).toHaveAttribute('data-delay', '2');
    expect(gradientBlobs[2]).toHaveAttribute('data-delay', '4');
  });

  it('renders all required icons', () => {
    render(<HeroSection />);

    expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
    expect(screen.getAllByTestId('arrow-right-icon')).toHaveLength(2); // New feature badge + View Demo button
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    render(<HeroSection />);

    // Should have proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();

    // Should have buttons with proper roles
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders trust indicator avatars', () => {
    render(<HeroSection />);

    // Find the container with trust indicators
    const trustSection = screen.getByText('500+ Teams').closest('div');

    // Check that we have 5 avatar elements (based on the map with [1,2,3,4,5])
    const avatarElements = trustSection?.querySelectorAll('.w-8.h-8.rounded-full');
    expect(avatarElements?.length).toBe(5);
  });

  it('renders preview card placeholder content', () => {
    render(<HeroSection />);

    // The preview card should contain placeholder content bars
    // We can't easily test the exact div structure, but we can verify the column titles are present
    const columns = ['What went well', 'What could be improved', 'Action items'];

    columns.forEach(column => {
      expect(screen.getByText(column)).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes for responsive design', () => {
    render(<HeroSection />);

    const section = screen.getByText('Sprint Retrospectives').closest('section');
    expect(section).toHaveClass('min-h-screen');

    const mainHeading = screen.getByText('Sprint Retrospectives').closest('h1');
    expect(mainHeading).toHaveClass('text-5xl', 'md:text-7xl');
  });

  it('renders with proper section structure', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('relative', 'min-h-screen', 'flex', 'items-center', 'justify-center', 'overflow-hidden');
  });
});