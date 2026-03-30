/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, Card, Header } from './ui';

// Mock @org/theme
jest.mock('@org/theme', () => ({
  useTheme: () => ({ tenantName: 'Test Broker', colors: { primary: '#10b981' } }),
}));

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('calls onClick handler', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Press</Button>);
    fireEvent.click(screen.getByText('Press'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant classes by default', () => {
    render(<Button>Primary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-primary');
  });

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('border-primary');
  });

  it('is disabled when disabled prop set', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('Card', () => {
  it('renders children inside a div', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeTruthy();
  });

  it('applies custom className', () => {
    render(<Card className="extra-class">Content</Card>);
    const div = screen.getByText('Content').parentElement!;
    expect(div.className).toContain('extra-class');
  });
});

describe('Header', () => {
  it('renders tenant name from theme when no title given', () => {
    render(<Header />);
    expect(screen.getByText('Test Broker')).toBeTruthy();
  });

  it('renders custom title when given', () => {
    render(<Header title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeTruthy();
  });

  it('renders a login link', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /login/i })).toBeTruthy();
  });
});
