import { render } from '@testing-library/react';
import Page from '../page';

// Mock the RetrospectiveBoard component
jest.mock('@/components/RetrospectiveBoard', () => ({
  __esModule: true,
  default: function MockRetrospectiveBoard() {
    return <div>Mocked Retrospective Board</div>;
  },
}));

describe('Retro Page', () => {
  it('renders RetrospectiveBoard component', () => {
    const { getByText } = render(<Page />);
    expect(getByText('Mocked Retrospective Board')).toBeInTheDocument();
  });
});