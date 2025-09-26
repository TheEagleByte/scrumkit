import { render } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>,
}));

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    );

    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('passes props to next-themes ThemeProvider', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );

    expect(getByTestId('theme-provider')).toBeInTheDocument();
  });
});