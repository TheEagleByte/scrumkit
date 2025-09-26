import { render, screen } from '@testing-library/react';
import NewBoardPage from '../page';

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: any) => {
    MockLink.displayName = 'MockLink';
    return <a href={href}>{children}</a>;
  };
  return MockLink;
});

// Mock BoardCreationForm
jest.mock('@/components/BoardCreationForm', () => ({
  BoardCreationForm: () => <div data-testid="board-creation-form">Board Creation Form</div>,
}));

describe('New Board Page', () => {
  it('renders page heading', () => {
    render(<NewBoardPage />);
    expect(screen.getByText('Create New Board')).toBeInTheDocument();
  });

  it('renders page description', () => {
    render(<NewBoardPage />);
    expect(screen.getByText(/Start your team.*s retrospective in seconds/)).toBeInTheDocument();
  });

  it('renders back button with correct link', () => {
    render(<NewBoardPage />);
    const backLink = screen.getByText('Back to Boards').closest('a');
    expect(backLink).toHaveAttribute('href', '/boards');
  });

  it('renders BoardCreationForm component', () => {
    render(<NewBoardPage />);
    expect(screen.getByTestId('board-creation-form')).toBeInTheDocument();
  });
});