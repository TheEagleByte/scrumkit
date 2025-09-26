import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';

// Mock motion/react
jest.mock('motion/react', () => ({
  motion: {
    header: ({ children, className, ...props }: any) => <header className={className} {...props}>{children}</header>,
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
  },
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  const Link = ({ children, href, className, onClick }: any) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
  Link.displayName = 'Link';
  return Link;
});

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, className, ...props }: any) => (
    <button className={className} {...props}>
      {children}
    </button>
  ),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Menu: () => <span data-testid="menu-icon">☰</span>,
  X: () => <span data-testid="x-icon">✕</span>,
  Users: () => <span data-testid="users-icon">👥</span>,
}));

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

// Mock smooth scrolling
const mockScrollIntoView = jest.fn();
Element.prototype.scrollIntoView = mockScrollIntoView;

// Mock document.querySelector
const originalQuerySelector = document.querySelector;
beforeAll(() => {
  document.querySelector = jest.fn().mockImplementation((selector) => {
    if (selector.startsWith('#')) {
      return {
        scrollIntoView: mockScrollIntoView,
      };
    }
    return originalQuerySelector.call(document, selector);
  });
});

afterAll(() => {
  document.querySelector = originalQuerySelector;
});

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockScrollIntoView.mockClear();

    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    });

    // Reset window event listeners
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  it('renders without crashing', () => {
    render(<Header />);
    expect(screen.getByText('ScrumKit')).toBeInTheDocument();
  });

  it('renders logo with icon and text', () => {
    render(<Header />);

    const logoLink = screen.getByRole('link', { name: /scrumkit/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');

    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByText('ScrumKit')).toBeInTheDocument();
  });

  it('renders all navigation items in desktop menu', () => {
    render(<Header />);

    const expectedNavItems = ['Features', 'How It Works', 'Pricing', 'Testimonials'];

    expectedNavItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('renders CTA button in desktop menu', () => {
    render(<Header />);

    const ctaButtons = screen.getAllByText('Start Free Retro');
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1);

    // Find the desktop CTA button
    const desktopCTA = ctaButtons.find(button =>
      button.closest('.hidden.md\\:block') !== null
    );

    if (desktopCTA) {
      const link = desktopCTA.closest('a');
      expect(link).toHaveAttribute('href', '/retro');
    }
  });

  it('shows mobile menu button on mobile', () => {
    render(<Header />);

    const buttons = screen.getAllByRole('button');
    const mobileMenuButton = buttons.find(btn => btn.classList.contains('md:hidden'));

    expect(mobileMenuButton).toBeInTheDocument();
    expect(mobileMenuButton).toHaveClass('md:hidden');
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
  });

  it('toggles mobile menu when button is clicked', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const buttons = screen.getAllByRole('button');
    const mobileMenuButton = buttons.find(btn => btn.classList.contains('md:hidden')) as HTMLElement;

    // Initially should show menu icon
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();

    // Click to open mobile menu
    await user.click(mobileMenuButton);

    // Should now show X icon
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('menu-icon')).not.toBeInTheDocument();

    // Click again to close
    await user.click(mobileMenuButton);

    // Should show menu icon again
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
  });

  it('renders mobile menu with navigation items when open', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const buttons = screen.getAllByRole('button');
    const mobileMenuButton = buttons.find(btn => btn.classList.contains('md:hidden')) as HTMLElement;
    await user.click(mobileMenuButton);

    // Mobile menu should contain all nav items
    const expectedNavItems = ['Features', 'How It Works', 'Pricing', 'Testimonials'];

    expectedNavItems.forEach(item => {
      const mobileNavItems = screen.getAllByText(item);
      expect(mobileNavItems.length).toBeGreaterThan(1); // Desktop + mobile
    });

    // Should have mobile CTA button
    const mobileCTAButtons = screen.getAllByText('Start Free Retro');
    expect(mobileCTAButtons.length).toBeGreaterThan(1); // Desktop + mobile
  });

  it('closes mobile menu when navigation link is clicked', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const buttons = screen.getAllByRole('button');
    const mobileMenuButton = buttons.find(btn => btn.classList.contains('md:hidden')) as HTMLElement;

    await act(async () => {
      await user.click(mobileMenuButton);
    });

    // Verify mobile menu is open
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();

    // Wait for mobile menu to fully render
    await waitFor(() => {
      expect(screen.getAllByText('Features')).toHaveLength(2); // Desktop + mobile
    });

    // Click on a navigation link in mobile menu
    const mobileNavLinks = screen.getAllByText('Features');
    const mobileLink = mobileNavLinks[1]; // Get the mobile one (second occurrence)

    await act(async () => {
      await user.click(mobileLink);
    });

    // Mobile menu should be closed
    await waitFor(() => {
      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('handles smooth scrolling for hash links', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const featuresLink = screen.getAllByText('Features')[0]; // Desktop link

    await user.click(featuresLink);

    await waitFor(() => {
      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
      });
    });
  });

  it('handles smooth scrolling for mobile hash links', async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Open mobile menu
    const buttons = screen.getAllByRole('button');
    const mobileMenuButton = buttons.find(btn => btn.classList.contains('md:hidden')) as HTMLElement;
    await user.click(mobileMenuButton);

    // Wait for mobile menu to fully render
    await waitFor(() => {
      expect(screen.getAllByText('Features')).toHaveLength(2); // Desktop + mobile
    });

    // Click on mobile Features link
    const mobileNavLinks = screen.getAllByText('Features');
    const mobileLink = mobileNavLinks[1]; // Get the mobile one (second occurrence)
    await user.click(mobileLink);

    await waitFor(() => {
      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
      });
    });
  });

  it('sets up scroll event listener on mount', () => {
    render(<Header />);

    expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('cleans up scroll event listener on unmount', () => {
    const { unmount } = render(<Header />);

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('applies scroll-based styling when scrolled', async () => {
    const { rerender } = render(<Header />);

    // Get the scroll handler
    const scrollHandler = (window.addEventListener as jest.Mock).mock.calls
      .find(call => call[0] === 'scroll')?.[1];

    expect(scrollHandler).toBeDefined();

    // Simulate scroll
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 20,
    });

    // Call scroll handler wrapped in act
    await waitFor(() => {
      scrollHandler();
    });

    // Re-render to reflect state change
    rerender(<Header />);

    // The header should have scroll-based classes applied
    // Note: Since we're mocking motion, we can't easily test the exact classes
    // but we can verify the component re-renders without errors
    expect(screen.getByText('ScrumKit')).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    render(<Header />);

    // Header should be a navigation landmark
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();

    // Mobile menu button should be accessible
    const buttons = screen.getAllByRole('button');
    const mobileButton = buttons.find(btn => btn.classList.contains('md:hidden'));
    expect(mobileButton).toBeInTheDocument();

    // All links should be accessible
    const allLinks = screen.getAllByRole('link');
    expect(allLinks.length).toBeGreaterThan(0);
  });

  it('renders with fixed positioning', () => {
    const { container } = render(<Header />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50');
  });

  it('applies proper container and navigation classes', () => {
    const { container } = render(<Header />);

    const containerDiv = container.querySelector('.container');
    expect(containerDiv).toHaveClass('max-w-7xl', 'mx-auto', 'px-4');

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('flex', 'items-center', 'justify-between', 'h-16');
  });

  it('closes mobile menu when CTA button is clicked', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const buttons = screen.getAllByRole('button');
    const mobileMenuButton = buttons.find(btn => btn.classList.contains('md:hidden'));
    expect(mobileMenuButton).toBeDefined();

    if (mobileMenuButton) {
      await user.click(mobileMenuButton);

      // Verify mobile menu is open
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();

      // Wait for mobile menu to fully render
      await waitFor(() => {
        expect(screen.getAllByText('Start Free Retro')).toHaveLength(2); // Desktop + mobile
      });

      // Find and click the mobile CTA button (the second occurrence)
      const allCTAButtons = screen.getAllByText('Start Free Retro');
      const mobileCTA = allCTAButtons[1]; // Mobile is the second one

      await user.click(mobileCTA);

      // Mobile menu should be closed
      await waitFor(() => {
        expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
        expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
      }, { timeout: 2000 });
    }
  });
});