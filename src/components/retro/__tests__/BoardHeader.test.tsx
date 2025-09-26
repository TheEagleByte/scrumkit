import { render, screen } from '@testing-library/react';
import { BoardHeader } from '../BoardHeader';

describe('BoardHeader', () => {
  it('renders default title when no props provided', () => {
    render(<BoardHeader />);
    expect(screen.getByText('Sprint Retrospective Board')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<BoardHeader title="Sprint 23 Retrospective" />);
    expect(screen.getByText('Sprint 23 Retrospective')).toBeInTheDocument();
  });

  it('renders custom description', () => {
    render(<BoardHeader description="Custom description text" />);
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });

  it('renders default description', () => {
    render(<BoardHeader />);
    expect(screen.getByText(/Reflect on your team's performance/)).toBeInTheDocument();
  });

  it('renders custom sprint name', () => {
    render(<BoardHeader sprintName="Sprint 42" />);
    expect(screen.getByText('Sprint 42')).toBeInTheDocument();
  });

  it('renders default sprint name', () => {
    render(<BoardHeader />);
    expect(screen.getByText('Sprint 24')).toBeInTheDocument();
  });

  it('renders custom team name', () => {
    render(<BoardHeader teamName="Backend Team" />);
    expect(screen.getByText('Backend Team')).toBeInTheDocument();
  });

  it('renders default team name', () => {
    render(<BoardHeader />);
    expect(screen.getByText('Development Team Alpha')).toBeInTheDocument();
  });

  it('renders both badges', () => {
    render(<BoardHeader sprintName="Sprint 1" teamName="Team A" />);
    expect(screen.getByText('Sprint 1')).toBeInTheDocument();
    expect(screen.getByText('Team A')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<BoardHeader />);
    const header = container.firstChild;
    expect(header).toHaveClass('mb-8', 'text-center');

    const title = screen.getByText('Sprint Retrospective Board');
    expect(title).toHaveClass('text-4xl', 'font-bold');
  });

  it('renders all elements with custom props', () => {
    render(
      <BoardHeader
        title="Custom Title"
        description="Custom Description"
        sprintName="Sprint 99"
        teamName="Custom Team"
      />
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Description')).toBeInTheDocument();
    expect(screen.getByText('Sprint 99')).toBeInTheDocument();
    expect(screen.getByText('Custom Team')).toBeInTheDocument();
  });
});