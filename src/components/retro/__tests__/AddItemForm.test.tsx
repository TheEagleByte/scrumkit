import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddItemForm } from '../AddItemForm';

describe('AddItemForm', () => {
  const defaultProps = {
    isActive: false,
    onActivate: jest.fn(),
    onCancel: jest.fn(),
    onAdd: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Inactive state', () => {
    it('renders add button when inactive', () => {
      render(<AddItemForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
    });

    it('calls onActivate when add button is clicked', () => {
      render(<AddItemForm {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /add item/i });
      fireEvent.click(addButton);
      expect(defaultProps.onActivate).toHaveBeenCalledTimes(1);
    });

    it('displays plus icon in add button', () => {
      const { container } = render(<AddItemForm {...defaultProps} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Active state', () => {
    const activeProps = { ...defaultProps, isActive: true };

    it('renders form when active', () => {
      render(<AddItemForm {...activeProps} />);
      expect(screen.getByPlaceholderText('What would you like to share?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    });

    it('renders submit and cancel buttons', () => {
      render(<AddItemForm {...activeProps} />);
      expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('disables submit button when fields are empty', () => {
      render(<AddItemForm {...activeProps} />);
      const submitButton = screen.getByRole('button', { name: /add item/i });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when both fields have content', async () => {
      const user = userEvent.setup();
      render(<AddItemForm {...activeProps} />);

      const textArea = screen.getByPlaceholderText('What would you like to share?');
      const nameInput = screen.getByPlaceholderText('Your name');
      const submitButton = screen.getByRole('button', { name: /add item/i });

      await user.type(textArea, 'Test feedback');
      await user.type(nameInput, 'John Doe');

      expect(submitButton).toBeEnabled();
    });

    it('calls onAdd with correct values when submitted', async () => {
      const user = userEvent.setup();
      render(<AddItemForm {...activeProps} />);

      const textArea = screen.getByPlaceholderText('What would you like to share?');
      const nameInput = screen.getByPlaceholderText('Your name');
      const submitButton = screen.getByRole('button', { name: /add item/i });

      await user.type(textArea, 'Test feedback');
      await user.type(nameInput, 'John Doe');
      await user.click(submitButton);

      expect(activeProps.onAdd).toHaveBeenCalledWith('Test feedback', 'John Doe');
    });

    it('clears form after successful submission', async () => {
      const user = userEvent.setup();
      render(<AddItemForm {...activeProps} />);

      const textArea = screen.getByPlaceholderText('What would you like to share?');
      const nameInput = screen.getByPlaceholderText('Your name');
      const submitButton = screen.getByRole('button', { name: /add item/i });

      await user.type(textArea, 'Test feedback');
      await user.type(nameInput, 'John Doe');
      await user.click(submitButton);

      expect(textArea).toHaveValue('');
      expect(nameInput).toHaveValue('');
    });

    it('does not submit with only whitespace', async () => {
      const user = userEvent.setup();
      render(<AddItemForm {...activeProps} />);

      const textArea = screen.getByPlaceholderText('What would you like to share?');
      const nameInput = screen.getByPlaceholderText('Your name');
      const submitButton = screen.getByRole('button', { name: /add item/i });

      await user.type(textArea, '   ');
      await user.type(nameInput, '   ');

      expect(submitButton).toBeDisabled();
    });

    it('calls onCancel and clears form when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<AddItemForm {...activeProps} />);

      const textArea = screen.getByPlaceholderText('What would you like to share?');
      const nameInput = screen.getByPlaceholderText('Your name');
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      await user.type(textArea, 'Test feedback');
      await user.type(nameInput, 'John Doe');
      await user.click(cancelButton);

      expect(activeProps.onCancel).toHaveBeenCalledTimes(1);
      expect(textArea).toHaveValue('');
      expect(nameInput).toHaveValue('');
    });

    it('autofocuses the textarea when active', () => {
      render(<AddItemForm {...activeProps} />);
      const textArea = screen.getByPlaceholderText('What would you like to share?');
      expect(textArea).toHaveFocus();
    });
  });

  describe('State transitions', () => {
    it('transitions from inactive to active state', () => {
      const { rerender } = render(<AddItemForm {...defaultProps} />);

      // Initially inactive
      expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('What would you like to share?')).not.toBeInTheDocument();

      // Change to active
      rerender(<AddItemForm {...defaultProps} isActive={true} />);

      // Now active
      expect(screen.getByPlaceholderText('What would you like to share?')).toBeInTheDocument();
    });
  });
});