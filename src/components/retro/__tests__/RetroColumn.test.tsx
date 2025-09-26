import { render, screen, fireEvent } from '@testing-library/react';
import { RetroColumn, ColumnData } from '../RetroColumn';
import { RetroItemData } from '../RetroItem';

// Mock child components
jest.mock('../RetroItem', () => ({
  RetroItem: ({ item, onRemove, onVote }: any) => (
    <div data-testid={`retro-item-${item.id}`}>
      <span>{item.text}</span>
      <span>{item.votes} votes</span>
      <button onClick={() => onRemove(item.id)}>Remove</button>
      <button onClick={() => onVote(item.id)}>Vote</button>
    </div>
  ),
}));

jest.mock('../AddItemForm', () => ({
  AddItemForm: ({ isActive, onActivate, onCancel, onAdd }: any) => (
    <div data-testid="add-item-form">
      {!isActive ? (
        <button onClick={onActivate}>Add Item</button>
      ) : (
        <>
          <button onClick={() => onAdd('Test item', 'Test author')}>Submit</button>
          <button onClick={onCancel}>Cancel</button>
        </>
      )}
    </div>
  ),
}));

describe('RetroColumn', () => {
  const mockItems: RetroItemData[] = [
    {
      id: '1',
      text: 'First item',
      author: 'Alice',
      votes: 3,
      timestamp: new Date('2024-01-01T10:00:00Z'),
    },
    {
      id: '2',
      text: 'Second item',
      author: 'Bob',
      votes: 5,
      timestamp: new Date('2024-01-01T11:00:00Z'),
    },
    {
      id: '3',
      text: 'Third item',
      author: 'Charlie',
      votes: 1,
      timestamp: new Date('2024-01-01T12:00:00Z'),
    },
  ];

  const mockColumn: ColumnData = {
    id: 'col-1',
    title: 'What went well',
    description: 'Positive things from the sprint',
    icon: <span>👍</span>,
    color: 'border-green-500',
    items: mockItems,
  };

  const defaultProps = {
    column: mockColumn,
    activeColumnId: null,
    onActivateColumn: jest.fn(),
    onCancelAdd: jest.fn(),
    onAddItem: jest.fn(),
    onRemoveItem: jest.fn(),
    onVoteItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders column title and icon', () => {
      render(<RetroColumn {...defaultProps} />);
      expect(screen.getByText('What went well')).toBeInTheDocument();
      expect(screen.getByText('👍')).toBeInTheDocument();
    });

    it('renders column description', () => {
      render(<RetroColumn {...defaultProps} />);
      expect(screen.getByText('Positive things from the sprint')).toBeInTheDocument();
    });

    it('renders all items in the column', () => {
      render(<RetroColumn {...defaultProps} />);
      expect(screen.getByTestId('retro-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('retro-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('retro-item-3')).toBeInTheDocument();
    });

    it('sorts items by votes in descending order', () => {
      render(<RetroColumn {...defaultProps} />);
      const items = screen.getAllByTestId(/retro-item-/);

      // Check that items are sorted by votes (5, 3, 1)
      expect(items[0]).toHaveAttribute('data-testid', 'retro-item-2'); // 5 votes
      expect(items[1]).toHaveAttribute('data-testid', 'retro-item-1'); // 3 votes
      expect(items[2]).toHaveAttribute('data-testid', 'retro-item-3'); // 1 vote
    });

    it('applies column color class', () => {
      const { container } = render(<RetroColumn {...defaultProps} />);
      const card = container.querySelector('.border-green-500');
      expect(card).toBeInTheDocument();
    });

    it('renders AddItemForm component', () => {
      render(<RetroColumn {...defaultProps} />);
      expect(screen.getByTestId('add-item-form')).toBeInTheDocument();
    });
  });

  describe('Item interactions', () => {
    it('calls onRemoveItem with correct parameters when item is removed', () => {
      render(<RetroColumn {...defaultProps} />);
      const removeButtons = screen.getAllByText('Remove');

      fireEvent.click(removeButtons[0]); // Click remove on first sorted item (id: 2)

      expect(defaultProps.onRemoveItem).toHaveBeenCalledTimes(1);
      expect(defaultProps.onRemoveItem).toHaveBeenCalledWith('col-1', '2');
    });

    it('calls onVoteItem with correct parameters when item is voted', () => {
      render(<RetroColumn {...defaultProps} />);
      const voteButtons = screen.getAllByText('Vote');

      fireEvent.click(voteButtons[1]); // Click vote on second sorted item (id: 1)

      expect(defaultProps.onVoteItem).toHaveBeenCalledTimes(1);
      expect(defaultProps.onVoteItem).toHaveBeenCalledWith('col-1', '1');
    });
  });

  describe('Add item form interactions', () => {
    it('calls onActivateColumn when add button is clicked', () => {
      render(<RetroColumn {...defaultProps} />);
      const addButton = screen.getByText('Add Item');

      fireEvent.click(addButton);

      expect(defaultProps.onActivateColumn).toHaveBeenCalledTimes(1);
      expect(defaultProps.onActivateColumn).toHaveBeenCalledWith('col-1');
    });

    it('shows active form when column is active', () => {
      render(<RetroColumn {...defaultProps} activeColumnId="col-1" />);

      expect(screen.getByText('Submit')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('calls onAddItem with correct parameters when item is added', () => {
      render(<RetroColumn {...defaultProps} activeColumnId="col-1" />);
      const submitButton = screen.getByText('Submit');

      fireEvent.click(submitButton);

      expect(defaultProps.onAddItem).toHaveBeenCalledTimes(1);
      expect(defaultProps.onAddItem).toHaveBeenCalledWith('col-1', 'Test item', 'Test author');
    });

    it('calls onCancelAdd when cancel is clicked', () => {
      render(<RetroColumn {...defaultProps} activeColumnId="col-1" />);
      const cancelButton = screen.getByText('Cancel');

      fireEvent.click(cancelButton);

      expect(defaultProps.onCancelAdd).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    it('renders correctly with empty items list', () => {
      const emptyColumn = { ...mockColumn, items: [] };
      render(<RetroColumn {...defaultProps} column={emptyColumn} />);

      expect(screen.getByText('What went well')).toBeInTheDocument();
      expect(screen.getByTestId('add-item-form')).toBeInTheDocument();
      expect(screen.queryByTestId(/retro-item-/)).not.toBeInTheDocument();
    });

    it('handles single item correctly', () => {
      const singleItemColumn = { ...mockColumn, items: [mockItems[0]] };
      render(<RetroColumn {...defaultProps} column={singleItemColumn} />);

      expect(screen.getByTestId('retro-item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('retro-item-2')).not.toBeInTheDocument();
    });

    it('maintains sort order with equal votes', () => {
      const equalVotesItems = [
        { ...mockItems[0], votes: 3 },
        { ...mockItems[1], votes: 3 },
        { ...mockItems[2], votes: 3 },
      ];
      const equalVotesColumn = { ...mockColumn, items: equalVotesItems };

      render(<RetroColumn {...defaultProps} column={equalVotesColumn} />);

      const items = screen.getAllByTestId(/retro-item-/);
      expect(items).toHaveLength(3);
    });

    it('handles column with no icon', () => {
      const noIconColumn = { ...mockColumn, icon: null };
      render(<RetroColumn {...defaultProps} column={noIconColumn} />);

      expect(screen.getByText('What went well')).toBeInTheDocument();
    });

    it('handles column with no description', () => {
      const noDescColumn = { ...mockColumn, description: '' };
      render(<RetroColumn {...defaultProps} column={noDescColumn} />);

      expect(screen.getByText('What went well')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not re-sort when props other than items change', () => {
      const { rerender } = render(<RetroColumn {...defaultProps} />);

      const initialItems = screen.getAllByTestId(/retro-item-/);
      const initialOrder = initialItems.map(item => item.getAttribute('data-testid'));

      // Change activeColumnId but keep items the same
      rerender(<RetroColumn {...defaultProps} activeColumnId="different-id" />);

      const afterItems = screen.getAllByTestId(/retro-item-/);
      const afterOrder = afterItems.map(item => item.getAttribute('data-testid'));

      expect(initialOrder).toEqual(afterOrder);
    });
  });
});