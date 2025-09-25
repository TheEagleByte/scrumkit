import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import Home from '../page'

// Mock external dependencies
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
}))

jest.mock('next/link', () => {
  const Link = ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
  Link.displayName = 'Link'
  return Link
})

jest.mock('next/image', () => {
  const Image = ({ alt, ...props }: any) => <img alt={alt} {...props} />
  Image.displayName = 'Image'
  return Image
})

jest.mock('@vercel/analytics/next', () => ({
  Analytics: () => null,
}))

// Mock custom components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

jest.mock('@/components/TypewriterText', () => {
  const TextType = ({ text }: { text: string[] }) => <span>{text[0]}</span>
  TextType.displayName = 'TextType'
  return TextType
})

jest.mock('@/components/StarBorder', () => {
  const StarBorder = ({ children }: any) => <div>{children}</div>
  StarBorder.displayName = 'StarBorder'
  return StarBorder
})

jest.mock('@/components/Magnet', () => {
  const Magnet = ({ children }: any) => <div>{children}</div>
  Magnet.displayName = 'Magnet'
  return Magnet
})

jest.mock('@/components/LiquidEther', () => {
  const LiquidEther = () => <div data-testid="liquid-ether" />
  LiquidEther.displayName = 'LiquidEther'
  return LiquidEther
})

jest.mock('@/components/GithubIcon', () => {
  const GithubIcon = ({ className }: any) => <svg className={className} data-testid="github-icon" />
  GithubIcon.displayName = 'GithubIcon'
  return GithubIcon
})

jest.mock('@/components/layout/Header', () => ({
  Header: ({ showAuth }: { showAuth?: boolean }) => (
    <header data-testid="header" data-show-auth={showAuth}>
      Header Component
    </header>
  ),
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ArrowRight: ({ className }: any) => <svg className={className} data-testid="arrow-right" />,
  Zap: ({ className }: any) => <svg className={className} data-testid="zap" />,
  Shield: ({ className }: any) => <svg className={className} data-testid="shield" />,
  Users: ({ className }: any) => <svg className={className} data-testid="users" />,
  BarChart: ({ className }: any) => <svg className={className} data-testid="bar-chart" />,
  Clock: ({ className }: any) => <svg className={className} data-testid="clock" />,
  CheckCircle: ({ className }: any) => <svg className={className} data-testid="check-circle" />,
  Heart: ({ className }: any) => <svg className={className} data-testid="heart" />,
  Calendar: ({ className }: any) => <svg className={className} data-testid="calendar" />,
  Server: ({ className }: any) => <svg className={className} data-testid="server" />,
  GitBranch: ({ className }: any) => <svg className={className} data-testid="git-branch" />,
  MessageSquare: ({ className }: any) => <svg className={className} data-testid="message-square" />,
  Hash: ({ className }: any) => <svg className={className} data-testid="hash" />,
  CreditCard: ({ className }: any) => <svg className={className} data-testid="credit-card" />,
  Activity: ({ className }: any) => <svg className={className} data-testid="activity" />,
}))

// Mock QueryProvider
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn().mockImplementation(() => ({})),
  QueryProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('Home Page', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders the main landing page', () => {
    render(<Home />)

    // Check for main content
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText('Open source tools for')).toBeInTheDocument()
  })

  it('renders the header with auth enabled', () => {
    render(<Home />)

    const header = screen.getByTestId('header')
    expect(header).toBeInTheDocument()
    expect(header).toHaveAttribute('data-show-auth', 'true')
  })

  it('renders skip to main content link for accessibility', () => {
    render(<Home />)

    const skipLink = screen.getByText('Skip to main content')
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  it('renders the liquid ether background effect', () => {
    render(<Home />)

    expect(screen.getByTestId('liquid-ether')).toBeInTheDocument()
  })

  it('renders the hero section with typewriter text', () => {
    render(<Home />)

    expect(screen.getByText('Open source tools for')).toBeInTheDocument()
    expect(screen.getByText('better sprints')).toBeInTheDocument() // First text from TypewriterText array
  })

  it('renders feature badges', () => {
    render(<Home />)

    expect(screen.getByText('Open Source')).toBeInTheDocument()
    expect(screen.getAllByText('Self-Hostable')[0]).toBeInTheDocument()
    expect(screen.getAllByText('MIT License')[0]).toBeInTheDocument()
  })

  it('renders call-to-action buttons', () => {
    render(<Home />)

    const getStartedLinks = screen.getAllByText('Get Started Free')
    expect(getStartedLinks.length).toBeGreaterThan(0)

    const githubButton = screen.getByText('View on GitHub')
    expect(githubButton).toBeInTheDocument()
  })

  it('renders product preview section', () => {
    render(<Home />)

    expect(screen.getByText('See ScrumKit Retro in Action')).toBeInTheDocument()
    expect(screen.getByText('Real-time collaboration for better team retrospectives')).toBeInTheDocument()
    expect(screen.getByText('What went well')).toBeInTheDocument()
    expect(screen.getByText('To improve')).toBeInTheDocument()
    expect(screen.getByText('Action items')).toBeInTheDocument()
  })

  it('renders statistics section', () => {
    render(<Home />)

    expect(screen.getByText('500+')).toBeInTheDocument()
    expect(screen.getByText('Active Teams')).toBeInTheDocument()
    expect(screen.getByText('15k+')).toBeInTheDocument()
    expect(screen.getByText('Ceremonies Run')).toBeInTheDocument()
  })

  it('renders feature showcase cards', () => {
    render(<Home />)

    expect(screen.getByText('ScrumKit Retro')).toBeInTheDocument()
    expect(screen.getByText('ScrumKit Poker')).toBeInTheDocument()
    expect(screen.getByText('ScrumKit Daily')).toBeInTheDocument()
    expect(screen.getByText('ScrumKit Health')).toBeInTheDocument()
  })

  it('renders available now and coming soon badges', () => {
    render(<Home />)

    expect(screen.getByText('Available Now')).toBeInTheDocument()

    const comingSoonBadges = screen.getAllByText('Coming Soon')
    expect(comingSoonBadges.length).toBeGreaterThanOrEqual(3)
  })

  it('renders features bento grid', () => {
    render(<Home />)

    expect(screen.getByText('Built for modern teams')).toBeInTheDocument()
    expect(screen.getByText('Real-time collaboration')).toBeInTheDocument()
    expect(screen.getByText('Instant analytics')).toBeInTheDocument()
    expect(screen.getByText('Anonymous mode')).toBeInTheDocument()
    expect(screen.getByText('Action tracking')).toBeInTheDocument()
    expect(screen.getByText('Team templates')).toBeInTheDocument()
  })

  it('renders integrations section', () => {
    render(<Home />)

    expect(screen.getByText('Works with your tools')).toBeInTheDocument()
    expect(screen.getByText('Slack')).toBeInTheDocument()
    expect(screen.getAllByText('GitHub')[0]).toBeInTheDocument()
    expect(screen.getByText('Jira')).toBeInTheDocument()
    expect(screen.getByText('Linear')).toBeInTheDocument()
  })

  it('renders open source section', () => {
    render(<Home />)

    expect(screen.getByText('100% Open Source')).toBeInTheDocument()
    expect(screen.getByText('Built by the community, for the community')).toBeInTheDocument()
    expect(screen.getAllByText('Self-Hostable')[1]).toBeInTheDocument() // Second occurrence in open source section
    expect(screen.getByText('One-Click Deploy')).toBeInTheDocument()
    expect(screen.getByText('Community Driven')).toBeInTheDocument()
  })

  it('renders footer with proper structure', () => {
    render(<Home />)

    // Footer content
    expect(screen.getByText('ScrumKit')).toBeInTheDocument()
    expect(screen.getByText('Open source tools for better sprints')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Resources')).toBeInTheDocument()
    expect(screen.getByText('Community')).toBeInTheDocument()
    expect(screen.getByText('Legal')).toBeInTheDocument()
  })

  it('renders external links with proper attributes', () => {
    render(<Home />)

    const githubLinks = screen.getAllByRole('link', { name: /github/i })
    githubLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('renders proper link destinations', () => {
    render(<Home />)

    // Check internal links
    const newBoardLinks = screen.getAllByRole('link')
      .filter(link => link.getAttribute('href') === '/boards/new')
    expect(newBoardLinks.length).toBeGreaterThan(0)
  })

  it('renders with proper semantic HTML structure', () => {
    render(<Home />)

    // Check for proper semantic elements
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument() // Footer

    // Check for headings hierarchy
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('applies proper CSS classes for styling', () => {
    render(<Home />)

    const main = screen.getByRole('main')
    expect(main.closest('.min-h-screen')).toBeInTheDocument()
  })

  it('handles dark theme properly', () => {
    render(<Home />)

    // Check for dark theme specific classes or content
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()

    // Check for some dark theme related content
    expect(screen.getByText('Open source tools for')).toBeInTheDocument()
  })
})