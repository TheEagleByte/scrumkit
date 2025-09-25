import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  );
});

// Mock Lucide React Users icon
jest.mock('lucide-react', () => ({
  Users: () => <span data-testid="users-icon">👥</span>,
}));

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Footer />);
    expect(screen.getByText('ScrumKit')).toBeInTheDocument();
  });

  it('renders the logo with icon and text', () => {
    render(<Footer />);

    const logoLink = screen.getByRole('link', { name: /scrumkit/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');

    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByText('ScrumKit')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Footer />);

    const expectedLinks = [
      { text: 'Features', href: '#features' },
      { text: 'Pricing', href: '#pricing' },
      { text: 'Privacy', href: '#' },
      { text: 'Terms', href: '#' },
      { text: 'Contact', href: '#' },
    ];

    expectedLinks.forEach(({ text, href }) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('displays copyright information', () => {
    render(<Footer />);

    expect(screen.getByText('© 2024 ScrumKit. All rights reserved.')).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    render(<Footer />);

    // Footer should be rendered as a footer element
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();

    // All links should be accessible
    const allLinks = screen.getAllByRole('link');
    expect(allLinks).toHaveLength(6); // Logo + 5 navigation links
  });

  it('applies correct CSS classes for responsive design', () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('py-12', 'px-4', 'border-t', 'border-white/10');

    const flexContainer = footer?.querySelector('.flex');
    expect(flexContainer).toHaveClass('flex-col', 'md:flex-row', 'items-center', 'justify-between');
  });

  it('renders links with hover styles', () => {
    render(<Footer />);

    const featureLink = screen.getByRole('link', { name: 'Features' });
    expect(featureLink).toHaveClass('hover:text-white', 'transition-colors');
  });

  it('has proper container structure', () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector('footer');
    const containerDiv = footer?.querySelector('.container');

    expect(containerDiv).toBeInTheDocument();
    expect(containerDiv).toHaveClass('max-w-7xl', 'mx-auto');
  });

  it('renders logo with gradient background', () => {
    const { container } = render(<Footer />);

    const logoIcon = container.querySelector('.w-8.h-8.rounded-lg');
    expect(logoIcon).toHaveClass('bg-gradient-to-br', 'from-purple-500', 'to-blue-500');
  });

  it('applies correct text styling', () => {
    render(<Footer />);

    const brandName = screen.getByText('ScrumKit');
    expect(brandName).toHaveClass('font-bold', 'text-xl', 'text-white');

    const copyright = screen.getByText('© 2024 ScrumKit. All rights reserved.');
    expect(copyright).toHaveClass('text-sm', 'text-muted-foreground');
  });

  it('renders navigation links with proper styling', () => {
    render(<Footer />);

    const expectedNavLinks = ['Features', 'Pricing', 'Privacy', 'Terms', 'Contact'];

    expectedNavLinks.forEach(linkText => {
      const link = screen.getByRole('link', { name: linkText });
      expect(link).toHaveClass('hover:text-white', 'transition-colors');
    });
  });

  it('groups navigation links in flex wrapper', () => {
    const { container } = render(<Footer />);

    const navLinksWrapper = container.querySelector('.flex.flex-wrap.gap-6');
    expect(navLinksWrapper).toBeInTheDocument();
  });

  it('handles missing href gracefully', () => {
    render(<Footer />);

    // Links with href="#" should still render properly
    const privacyLink = screen.getByRole('link', { name: 'Privacy' });
    expect(privacyLink).toHaveAttribute('href', '#');
  });

  it('renders all elements in correct order', () => {
    const { container } = render(<Footer />);

    const mainContainer = container.querySelector('.flex-col.md\\:flex-row');
    const children = Array.from(mainContainer?.children || []);

    expect(children).toHaveLength(3);

    // First child should contain the logo
    expect(children[0].textContent).toContain('ScrumKit');

    // Second child should contain navigation links
    expect(children[1].textContent).toContain('Features');

    // Third child should contain copyright
    expect(children[2].textContent).toContain('© 2024');
  });
});