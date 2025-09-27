import { render, screen, fireEvent } from '@testing-library/react';
import { RetroItem, RetroItemData } from '../RetroItem';

describe('RetroItem', () => {
  const mockItem: RetroItemData = {
    id: 'test-id-123',
    text: 'This is a test retrospective item that we should discuss in detail',
    author: 'John Smith',
    votes: 5,
    timestamp: new Date('2024-01-01T10:00:00Z'),
  };

  const defaultProps = {
    item: mockItem,
    onRemove: jest.fn(),
    onVote: jest.fn(),
    isAuthor: true, // Set to true to test author features
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the item text', () => {
      render(<RetroItem {...defaultProps} />);
      expect(screen.getByText(mockItem.text)).toBeInTheDocument();
    });

    it('renders the author name', () => {
      render(<RetroItem {...defaultProps} />);
      expect(screen.getByText(mockItem.author)).toBeInTheDocument();
    });

    it('renders the vote count', () => {
      render(<RetroItem {...defaultProps} />);
      // The vote count is now displayed as just the number in VoteIndicator
      expect(screen.getByText(mockItem.votes.toString())).toBeInTheDocument();
    });

    it('renders remove button with X icon', () => {
      render(<RetroItem {...defaultProps} />);
      const removeButton = screen.getByLabelText('Remove item');
      expect(removeButton).toBeInTheDocument();
      expect(removeButton.querySelector('svg')).toBeInTheDocument();
    });

    it('renders vote button', () => {
      render(<RetroItem {...defaultProps} />);
      // VoteIndicator now shows just the number
      const voteButton = screen.getByText(mockItem.votes.toString());
      expect(voteButton).toBeInTheDocument();
      expect(voteButton.closest('button')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onRemove with correct ID when remove button is clicked', () => {
      render(<RetroItem {...defaultProps} />);
      const removeButton = screen.getByLabelText('Remove item');

      fireEvent.click(removeButton);

      expect(defaultProps.onRemove).toHaveBeenCalledTimes(1);
      expect(defaultProps.onRemove).toHaveBeenCalledWith(mockItem.id);
    });

    it('calls onVote with correct ID when vote button is clicked', () => {
      render(<RetroItem {...defaultProps} />);
      const voteButton = screen.getByText(mockItem.votes.toString()).closest('button') as HTMLElement;

      fireEvent.click(voteButton);

      expect(defaultProps.onVote).toHaveBeenCalledTimes(1);
      expect(defaultProps.onVote).toHaveBeenCalledWith(mockItem.id);
    });

    it('does not call onRemove when clicking outside remove button', () => {
      render(<RetroItem {...defaultProps} />);
      const itemText = screen.getByText(mockItem.text);

      fireEvent.click(itemText);

      expect(defaultProps.onRemove).not.toHaveBeenCalled();
    });

    it('does not call onVote when clicking outside vote button', () => {
      render(<RetroItem {...defaultProps} />);
      const itemText = screen.getByText(mockItem.text);

      fireEvent.click(itemText);

      expect(defaultProps.onVote).not.toHaveBeenCalled();
    });
  });

  describe('Different data states', () => {
    it('handles zero votes', () => {
      const itemWithZeroVotes = { ...mockItem, votes: 0 };
      render(<RetroItem {...defaultProps} item={itemWithZeroVotes} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles large vote counts', () => {
      const itemWithManyVotes = { ...mockItem, votes: 999 };
      render(<RetroItem {...defaultProps} item={itemWithManyVotes} />);

      expect(screen.getByText('999')).toBeInTheDocument();
    });

    it('handles long text content', () => {
      const itemWithLongText = {
        ...mockItem,
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'
      };
      render(<RetroItem {...defaultProps} item={itemWithLongText} />);

      expect(screen.getByText(itemWithLongText.text)).toBeInTheDocument();
    });

    it('handles short text content', () => {
      const itemWithShortText = { ...mockItem, text: 'OK' };
      render(<RetroItem {...defaultProps} item={itemWithShortText} />);

      expect(screen.getByText('OK')).toBeInTheDocument();
    });

    it('handles special characters in text', () => {
      const itemWithSpecialChars = {
        ...mockItem,
        text: 'Test with "quotes" & <symbols> and émojis 🎉'
      };
      render(<RetroItem {...defaultProps} item={itemWithSpecialChars} />);

      expect(screen.getByText(itemWithSpecialChars.text)).toBeInTheDocument();
    });

    it('handles different author names', () => {
      const itemWithDifferentAuthor = { ...mockItem, author: 'Jane Doe-Smith' };
      render(<RetroItem {...defaultProps} item={itemWithDifferentAuthor} />);

      expect(screen.getByText('Jane Doe-Smith')).toBeInTheDocument();
    });
  });

  describe('Component styling', () => {
    it('applies correct CSS classes to the card', () => {
      const { container } = render(<RetroItem {...defaultProps} />);
      const card = container.querySelector('.bg-card\\/50');

      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('border-border/50', 'border');
    });

    it('applies correct styling to remove button', () => {
      render(<RetroItem {...defaultProps} />);
      const removeButton = screen.getByLabelText('Remove item');

      expect(removeButton).toHaveClass('h-6', 'w-6', 'p-0');
    });

    it('applies correct styling to vote button', () => {
      render(<RetroItem {...defaultProps} />);
      const voteButton = screen.getByText(mockItem.votes.toString()).closest('button');

      // VoteIndicator button has different classes now
      expect(voteButton).toHaveClass('h-auto', 'px-2', 'py-1');
    });

    it('applies muted color to author text', () => {
      render(<RetroItem {...defaultProps} />);
      const authorText = screen.getByText(mockItem.author);

      expect(authorText).toHaveClass('text-muted-foreground', 'text-xs');
    });
  });
});