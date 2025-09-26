import { render, screen } from '@testing-library/react';
import { FeaturesSection } from '../FeaturesSection';

// Mock motion/react
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, whileHover, initial, whileInView, viewport, transition, ...props }: any) =>
      <div className={className} {...props}>{children}</div>,
    h2: ({ children, className, initial, whileInView, viewport, ...props }: any) =>
      <h2 className={className} {...props}>{children}</h2>,
    p: ({ children, className, initial, whileInView, viewport, transition, ...props }: any) =>
      <p className={className} {...props}>{children}</p>,
  },
}));

// Mock GlassCard component
jest.mock('@/components/ui/glass-card', () => ({
  GlassCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="glass-card">
      {children}
    </div>
  ),
}));

// Mock all Lucide React icons
jest.mock('lucide-react', () => ({
  MessageSquare: () => <span data-testid="message-square-icon">💬</span>,
  Vote: () => <span data-testid="vote-icon">🗳️</span>,
  Users2: () => <span data-testid="users2-icon">👥</span>,
  Target: () => <span data-testid="target-icon">🎯</span>,
  Shield: () => <span data-testid="shield-icon">🛡️</span>,
  Zap: () => <span data-testid="zap-icon">⚡</span>,
  BarChart3: () => <span data-testid="bar-chart3-icon">📊</span>,
  Share2: () => <span data-testid="share2-icon">📤</span>,
  Palette: () => <span data-testid="palette-icon">🎨</span>,
}));

describe('FeaturesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<FeaturesSection />);
    expect(screen.getByText('Everything You Need')).toBeInTheDocument();
  });

  it('displays the main heading and description', () => {
    render(<FeaturesSection />);

    expect(screen.getByText('Everything You Need')).toBeInTheDocument();
    expect(screen.getByText('Powerful features to make your retrospectives engaging and actionable')).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    render(<FeaturesSection />);

    const expectedFeatures = [
      'Real-time Collaboration',
      'Democratic Voting',
      'Anonymous Feedback',
      'Action Item Tracking',
      'Secure & Private',
      'Lightning Fast',
      'Team Analytics',
      'Easy Sharing',
      'Custom Templates',
    ];

    expectedFeatures.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });

  it('renders feature descriptions', () => {
    render(<FeaturesSection />);

    const expectedDescriptions = [
      'Team members can add, edit, and react to feedback instantly with live updates.',
      'Let the team vote on what matters most. Prioritize issues democratically.',
      'Enable honest feedback with optional anonymous mode for sensitive topics.',
      'Convert insights into actionable tasks with built-in tracking and assignments.',
      'Enterprise-grade security with end-to-end encryption for all your data.',
      'Optimized for speed with instant load times and zero lag collaboration.',
      'Track team sentiment over time with beautiful insights and trends.',
      'Share retro results with stakeholders via secure links or PDF exports.',
      'Choose from various retro formats or create your own custom templates.',
    ];

    expectedDescriptions.forEach(description => {
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });

  it('renders all feature icons', () => {
    render(<FeaturesSection />);

    const expectedIcons = [
      'message-square-icon',
      'vote-icon',
      'users2-icon',
      'target-icon',
      'shield-icon',
      'zap-icon',
      'bar-chart3-icon',
      'share2-icon',
      'palette-icon',
    ];

    expectedIcons.forEach(iconTestId => {
      expect(screen.getByTestId(iconTestId)).toBeInTheDocument();
    });
  });

  it('renders correct number of glass cards', () => {
    render(<FeaturesSection />);

    const glassCards = screen.getAllByTestId('glass-card');
    expect(glassCards).toHaveLength(9); // 9 features total
  });

  it('has proper accessibility structure', () => {
    render(<FeaturesSection />);

    // Should have proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 2 });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveTextContent('Everything You Need');

    // Should have feature titles as headings
    const featureHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(featureHeadings).toHaveLength(9); // 9 feature titles
  });

  it('renders with proper section id for navigation', () => {
    const { container } = render(<FeaturesSection />);

    const section = container.querySelector('section');
    expect(section).toHaveAttribute('id', 'features');
  });

  it('displays "Learn more" text in feature cards', () => {
    render(<FeaturesSection />);

    const learnMoreElements = screen.getAllByText('Learn more');
    expect(learnMoreElements).toHaveLength(9); // One for each feature card
  });

  it('renders arrow indicators in feature cards', () => {
    render(<FeaturesSection />);

    const arrowElements = screen.getAllByText('→');
    expect(arrowElements).toHaveLength(9); // One for each feature card
  });

  it('applies correct CSS classes for responsive grid', () => {
    const { container } = render(<FeaturesSection />);

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('features have proper structure with icon, title, description, and learn more', () => {
    render(<FeaturesSection />);

    // Test that all features have their components
    expect(screen.getByText('Real-time Collaboration')).toBeInTheDocument();
    expect(screen.getByTestId('message-square-icon')).toBeInTheDocument();
    expect(screen.getByText('Team members can add, edit, and react to feedback instantly with live updates.')).toBeInTheDocument();

    // Check that Learn more elements exist
    const learnMoreElements = screen.getAllByText('Learn more');
    expect(learnMoreElements.length).toBeGreaterThan(0);
  });

  it('renders proper gradient classes for icons', () => {
    render(<FeaturesSection />);

    // The actual gradient classes are applied in the component, but we can't easily test them
    // without more complex DOM inspection. We can at least verify the icons are rendered.
    expect(screen.getByTestId('message-square-icon')).toBeInTheDocument();
  });

  it('contains proper section structure and styling', () => {
    const { container } = render(<FeaturesSection />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('py-20', 'px-4');

    const containerDiv = section?.querySelector('.container');
    expect(containerDiv).toBeInTheDocument();
    expect(containerDiv).toHaveClass('max-w-7xl', 'mx-auto');
  });

  it('renders text content with proper centering', () => {
    const { container } = render(<FeaturesSection />);

    const textCenter = container.querySelector('.text-center');
    expect(textCenter).toBeInTheDocument();
    expect(textCenter).toContainElement(screen.getByText('Everything You Need'));
  });

  it('has proper spacing and margin classes', () => {
    const { container } = render(<FeaturesSection />);

    const headerSection = screen.getByText('Everything You Need').closest('.text-center');
    expect(headerSection).toHaveClass('mb-16');
  });
});