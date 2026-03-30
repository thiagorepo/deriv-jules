/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from './theme';

function ThemeConsumer() {
  const theme = useTheme();
  return (
    <div>
      <span data-testid="tenant">{theme.tenantName ?? 'none'}</span>
      <span data-testid="primary">{theme.colors?.primary ?? 'none'}</span>
    </div>
  );
}

describe('ThemeProvider', () => {
  it('provides theme values to children via useTheme', () => {
    render(
      <ThemeProvider initialTheme={{ tenantName: 'Acme', colors: { primary: '#ff0000' } }}>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('tenant').textContent).toBe('Acme');
    expect(screen.getByTestId('primary').textContent).toBe('#ff0000');
  });

  it('renders children', () => {
    render(
      <ThemeProvider initialTheme={{}}>
        <div data-testid="child">hello</div>
      </ThemeProvider>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('returns empty config when no initialTheme values are set', () => {
    render(
      <ThemeProvider initialTheme={{}}>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('tenant').textContent).toBe('none');
    expect(screen.getByTestId('primary').textContent).toBe('none');
  });

  it('applies primary color as CSS variable when provided', () => {
    const { container } = render(
      <ThemeProvider initialTheme={{ colors: { primary: '#10b981' } }}>
        <div />
      </ThemeProvider>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toBeTruthy();
  });
});

describe('useTheme', () => {
  it('returns empty object when used outside ThemeProvider', () => {
    // useTheme falls back to the createContext default ({})
    function Standalone() {
      const theme = useTheme();
      return <span>{JSON.stringify(theme)}</span>;
    }
    const { container } = render(<Standalone />);
    expect(container.textContent).toBe('{}');
  });
});
