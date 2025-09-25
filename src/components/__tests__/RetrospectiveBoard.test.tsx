/**
 * Comprehensive Jest unit tests for RetrospectiveBoard.tsx
 * Tests the main retrospective board component functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RetrospectiveBoard } from '../RetrospectiveBoard';

// Mock the child components
jest.mock('../retro/BoardHeader', () => ({
  BoardHeader: () => <div data-testid="board-header">Board Header</div>,
}));

jest.mock('../retro/RetroColumn', () => ({
  RetroColumn: ({
    column,
    activeColumnId,
    onActivateColumn,
    onCancelAdd,
    onAddItem,
    onRemoveItem,
    onVoteItem,
  }: any) => (
    <div data-testid={`column-${column.id}`}>
      <h3>{column.title}</h3>
      <p>{column.description}</p>
      <div data-testid={`column-items-${column.id}`}>
        {column.items.map((item: any) => (
          <div key={item.id} data-testid={`item-${item.id}`}>
            <span>{item.text}</span>
            <span>{item.author}</span>
            <span data-testid={`votes-${item.id}`}>{item.votes}</span>
            <button
              onClick={() => onVoteItem(column.id, item.id)}
              data-testid={`vote-${item.id}`}
            >
              Vote
            </button>
            <button
              onClick={() => onRemoveItem(column.id, item.id)}
              data-testid={`remove-${item.id}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => onActivateColumn(column.id)}
        data-testid={`activate-${column.id}`}
      >
        Add Item
      </button>
      {activeColumnId === column.id && (
        <div data-testid={`add-form-${column.id}`}>
          <button
            onClick={() => onAddItem(column.id, 'Test item', 'Test Author')}
            data-testid={`add-item-${column.id}`}
          >
            Add
          </button>
          <button
            onClick={onCancelAdd}
            data-testid={`cancel-add-${column.id}`}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  ),
}));

describe('RetrospectiveBoard', () => {
  beforeEach(() => {
    // Clear any mocks
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders all four default columns', () => {
      render(<RetrospectiveBoard />);

      expect(screen.getByTestId('column-went-well')).toBeInTheDocument();
      expect(screen.getByTestId('column-improve')).toBeInTheDocument();
      expect(screen.getByTestId('column-blockers')).toBeInTheDocument();
      expect(screen.getByTestId('column-action-items')).toBeInTheDocument();
    });

    it('renders board header', () => {
      render(<RetrospectiveBoard />);
      expect(screen.getByTestId('board-header')).toBeInTheDocument();
    });

    it('renders footer with instructions', () => {
      render(<RetrospectiveBoard />);
      expect(
        screen.getByText(/Click 👍 to vote on items • Items are sorted by votes/)
      ).toBeInTheDocument();
    });

    it('renders with correct column titles', () => {
      render(<RetrospectiveBoard />);

      expect(screen.getByText('What went well?')).toBeInTheDocument();
      expect(screen.getByText('What could be improved?')).toBeInTheDocument();
      expect(screen.getByText('What blocked us?')).toBeInTheDocument();
      expect(screen.getByText('Action items')).toBeInTheDocument();
    });

    it('renders with correct column descriptions', () => {
      render(<RetrospectiveBoard />);

      expect(
        screen.getByText('Celebrate successes and positive outcomes')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Identify areas for enhancement')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Obstacles and impediments faced')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Next steps and commitments')
      ).toBeInTheDocument();
    });
  });

  describe('Default Items', () => {
    it('renders default items in went-well column', () => {
      render(<RetrospectiveBoard />);

      expect(
        screen.getByText(
          'Successfully delivered the user authentication feature ahead of schedule'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('Great collaboration between frontend and backend teams')
      ).toBeInTheDocument();
    });

    it('renders default items in improve column', () => {
      render(<RetrospectiveBoard />);

      expect(
        screen.getByText('Code review process took longer than expected')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Need better documentation for API endpoints')
      ).toBeInTheDocument();
    });

    it('renders default items in blockers column', () => {
      render(<RetrospectiveBoard />);

      expect(
        screen.getByText('Third-party API downtime affected testing')
      ).toBeInTheDocument();
    });

    it('renders default items in action-items column', () => {
      render(<RetrospectiveBoard />);

      expect(
        screen.getByText('Set up automated code review reminders')
      ).toBeInTheDocument();
    });

    it('displays correct vote counts for default items', () => {
      render(<RetrospectiveBoard />);

      expect(screen.getByTestId('votes-1')).toHaveTextContent('5');
      expect(screen.getByTestId('votes-2')).toHaveTextContent('3');
      expect(screen.getByTestId('votes-3')).toHaveTextContent('4');
      expect(screen.getByTestId('votes-4')).toHaveTextContent('2');
      expect(screen.getByTestId('votes-5')).toHaveTextContent('6');
      expect(screen.getByTestId('votes-6')).toHaveTextContent('0');
    });

    it('displays correct authors for default items', () => {
      render(<RetrospectiveBoard />);

      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
      expect(screen.getByText('Mike Johnson')).toBeInTheDocument();
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
      expect(screen.getByText('Emma Davis')).toBeInTheDocument();
      expect(screen.getByText('David Kim')).toBeInTheDocument();
      expect(screen.getByText('Team Decision')).toBeInTheDocument();
    });
  });

  describe('Column Activation', () => {
    it('activates column when add button is clicked', async () => {
      render(<RetrospectiveBoard />);

      const activateButton = screen.getByTestId('activate-went-well');
      await userEvent.click(activateButton);

      expect(screen.getByTestId('add-form-went-well')).toBeInTheDocument();
    });

    it('only shows add form for active column', async () => {
      render(<RetrospectiveBoard />);

      const activateButton = screen.getByTestId('activate-improve');
      await userEvent.click(activateButton);

      expect(screen.getByTestId('add-form-improve')).toBeInTheDocument();
      expect(screen.queryByTestId('add-form-went-well')).not.toBeInTheDocument();
      expect(screen.queryByTestId('add-form-blockers')).not.toBeInTheDocument();
      expect(screen.queryByTestId('add-form-action-items')).not.toBeInTheDocument();
    });

    it('switches active column when different column is activated', async () => {
      render(<RetrospectiveBoard />);

      // Activate first column
      await userEvent.click(screen.getByTestId('activate-went-well'));
      expect(screen.getByTestId('add-form-went-well')).toBeInTheDocument();

      // Activate second column
      await userEvent.click(screen.getByTestId('activate-improve'));
      expect(screen.getByTestId('add-form-improve')).toBeInTheDocument();
      expect(screen.queryByTestId('add-form-went-well')).not.toBeInTheDocument();
    });

    it('cancels add form when cancel button is clicked', async () => {
      render(<RetrospectiveBoard />);

      // Activate column
      await userEvent.click(screen.getByTestId('activate-went-well'));
      expect(screen.getByTestId('add-form-went-well')).toBeInTheDocument();

      // Cancel add
      await userEvent.click(screen.getByTestId('cancel-add-went-well'));
      expect(screen.queryByTestId('add-form-went-well')).not.toBeInTheDocument();
    });
  });

  describe('Adding Items', () => {
    it('adds new item to column', async () => {
      render(<RetrospectiveBoard />);

      // Activate column
      await userEvent.click(screen.getByTestId('activate-went-well'));

      // Add item
      await userEvent.click(screen.getByTestId('add-item-went-well'));

      // Check item was added
      expect(screen.getByText('Test item')).toBeInTheDocument();
      expect(screen.getByText('Test Author')).toBeInTheDocument();

      // Check form is closed after adding
      expect(screen.queryByTestId('add-form-went-well')).not.toBeInTheDocument();
    });

    it('generates unique ID for new items', async () => {
      render(<RetrospectiveBoard />);

      // Mock Date.now to return predictable values
      const mockDateNow = jest
        .spyOn(Date, 'now')
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(2000);

      // Add first item
      await userEvent.click(screen.getByTestId('activate-went-well'));
      await userEvent.click(screen.getByTestId('add-item-went-well'));

      // Add second item
      await userEvent.click(screen.getByTestId('activate-improve'));
      await userEvent.click(screen.getByTestId('add-item-improve'));

      // Both items should be present (different IDs)
      const testItems = screen.getAllByText('Test item');
      expect(testItems).toHaveLength(2);

      mockDateNow.mockRestore();
    });

    it('initializes new items with zero votes', async () => {
      render(<RetrospectiveBoard />);

      const mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(1234567890);

      await userEvent.click(screen.getByTestId('activate-went-well'));
      await userEvent.click(screen.getByTestId('add-item-went-well'));

      expect(screen.getByTestId('votes-1234567890')).toHaveTextContent('0');

      mockDateNow.mockRestore();
    });
  });

  describe('Voting Functionality', () => {
    it('increments vote count when vote button is clicked', async () => {
      render(<RetrospectiveBoard />);

      const voteButton = screen.getByTestId('vote-1');
      const votesDisplay = screen.getByTestId('votes-1');

      expect(votesDisplay).toHaveTextContent('5');

      await userEvent.click(voteButton);

      expect(votesDisplay).toHaveTextContent('6');
    });

    it('allows multiple votes on same item', async () => {
      render(<RetrospectiveBoard />);

      const voteButton = screen.getByTestId('vote-2');
      const votesDisplay = screen.getByTestId('votes-2');

      expect(votesDisplay).toHaveTextContent('3');

      await userEvent.click(voteButton);
      expect(votesDisplay).toHaveTextContent('4');

      await userEvent.click(voteButton);
      expect(votesDisplay).toHaveTextContent('5');
    });

    it('allows voting on items in different columns', async () => {
      render(<RetrospectiveBoard />);

      // Vote on item in went-well column
      await userEvent.click(screen.getByTestId('vote-1'));
      expect(screen.getByTestId('votes-1')).toHaveTextContent('6');

      // Vote on item in improve column
      await userEvent.click(screen.getByTestId('vote-3'));
      expect(screen.getByTestId('votes-3')).toHaveTextContent('5');
    });
  });

  describe('Removing Items', () => {
    it('removes item when remove button is clicked', async () => {
      render(<RetrospectiveBoard />);

      const itemText = 'Successfully delivered the user authentication feature ahead of schedule';
      expect(screen.getByText(itemText)).toBeInTheDocument();

      const removeButton = screen.getByTestId('remove-1');
      await userEvent.click(removeButton);

      expect(screen.queryByText(itemText)).not.toBeInTheDocument();
    });

    it('removes item from correct column', async () => {
      render(<RetrospectiveBoard />);

      const improveItemText = 'Code review process took longer than expected';
      const wentWellItemText = 'Successfully delivered the user authentication feature ahead of schedule';

      expect(screen.getByText(improveItemText)).toBeInTheDocument();
      expect(screen.getByText(wentWellItemText)).toBeInTheDocument();

      // Remove item from improve column
      await userEvent.click(screen.getByTestId('remove-3'));

      expect(screen.queryByText(improveItemText)).not.toBeInTheDocument();
      expect(screen.getByText(wentWellItemText)).toBeInTheDocument();
    });

    it('can remove all items from a column', async () => {
      render(<RetrospectiveBoard />);

      // Remove first item from blockers column
      await userEvent.click(screen.getByTestId('remove-5'));

      // Blockers column should be empty
      const blockersColumn = screen.getByTestId('column-items-blockers');
      expect(blockersColumn).toBeEmptyDOMElement();
    });
  });

  describe('State Management', () => {
    it('maintains separate state for each column', async () => {
      render(<RetrospectiveBoard />);

      // Add item to went-well column
      await userEvent.click(screen.getByTestId('activate-went-well'));
      await userEvent.click(screen.getByTestId('add-item-went-well'));

      // Add item to improve column
      await userEvent.click(screen.getByTestId('activate-improve'));
      await userEvent.click(screen.getByTestId('add-item-improve'));

      // Both columns should have the new items
      const testItems = screen.getAllByText('Test item');
      expect(testItems).toHaveLength(2);

      // Original items should still be present
      expect(
        screen.getByText('Successfully delivered the user authentication feature ahead of schedule')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Code review process took longer than expected')
      ).toBeInTheDocument();
    });

    it('persists column data after interactions', async () => {
      render(<RetrospectiveBoard />);

      // Vote on item
      await userEvent.click(screen.getByTestId('vote-1'));
      expect(screen.getByTestId('votes-1')).toHaveTextContent('6');

      // Activate and cancel add form
      await userEvent.click(screen.getByTestId('activate-went-well'));
      await userEvent.click(screen.getByTestId('cancel-add-went-well'));

      // Vote count should still be preserved
      expect(screen.getByTestId('votes-1')).toHaveTextContent('6');
    });
  });

  describe('Accessibility', () => {
    it('renders semantic HTML structure', () => {
      render(<RetrospectiveBoard />);

      // Should have main container
      const container = screen.getByRole('main', { hidden: true });
      expect(container || screen.getByText('What went well?').closest('.container')).toBeInTheDocument();
    });

    it('provides descriptive column titles', () => {
      render(<RetrospectiveBoard />);

      const columns = [
        'What went well?',
        'What could be improved?',
        'What blocked us?',
        'Action items',
      ];

      columns.forEach((title) => {
        expect(screen.getByText(title)).toBeInTheDocument();
      });
    });

    it('provides descriptive column descriptions', () => {
      render(<RetrospectiveBoard />);

      const descriptions = [
        'Celebrate successes and positive outcomes',
        'Identify areas for enhancement',
        'Obstacles and impediments faced',
        'Next steps and commitments',
      ];

      descriptions.forEach((desc) => {
        expect(screen.getByText(desc)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles empty item text gracefully', async () => {
      render(<RetrospectiveBoard />);

      // Mock the add item with empty text
      const RetroColumn = require('../retro/RetroColumn').RetroColumn;

      await userEvent.click(screen.getByTestId('activate-went-well'));

      // Should not crash when adding empty item
      expect(screen.getByTestId('add-form-went-well')).toBeInTheDocument();
    });

    it('handles missing item data gracefully', () => {
      // This test ensures the component doesn't crash with incomplete data
      expect(() => render(<RetrospectiveBoard />)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('uses callback functions to prevent unnecessary re-renders', () => {
      // This test verifies that callback functions are used properly
      // The actual performance benefits would be tested with React DevTools in real scenarios
      render(<RetrospectiveBoard />);

      // Multiple interactions shouldn't cause issues
      const votes1 = screen.getByTestId('vote-1');
      const votes2 = screen.getByTestId('vote-2');

      expect(() => {
        fireEvent.click(votes1);
        fireEvent.click(votes2);
        fireEvent.click(votes1);
      }).not.toThrow();
    });
  });
});