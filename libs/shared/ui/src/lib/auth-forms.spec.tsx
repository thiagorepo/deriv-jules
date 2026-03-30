/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm, RegisterForm, InputField } from './auth-forms';

// Mock @org/theme
jest.mock('@org/theme', () => ({
  useTheme: () => ({ tenantName: 'Test Platform', colors: { primary: '#10b981' } }),
}));

// Mock @org/ui card/button
jest.mock('./ui', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

describe('InputField', () => {
  it('renders label and input', () => {
    const onChange = jest.fn();
    render(
      <InputField label="Email" value="" onChange={onChange} placeholder="test@example.com" />
    );
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('test@example.com')).toBeTruthy();
  });

  it('calls onChange when typing', () => {
    const onChange = jest.fn();
    render(<InputField label="Name" value="" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Alice' } });
    expect(onChange).toHaveBeenCalled();
  });
});

describe('LoginForm', () => {
  it('renders sign in heading with tenant name', () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    expect(screen.getByText(/Sign In to Test Platform/i)).toBeTruthy();
  });

  it('displays error message when error prop is set', () => {
    render(<LoginForm onSubmit={jest.fn()} error="Invalid credentials" />);
    expect(screen.getByText('Invalid credentials')).toBeTruthy();
  });

  it('calls onSubmit with email and password', () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'user@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(screen.getByRole('form') ?? document.querySelector('form')!);
    expect(onSubmit).toHaveBeenCalledWith({ email: 'user@test.com', password: 'password123' });
  });

  it('shows loading state', () => {
    render(<LoginForm onSubmit={jest.fn()} loading={true} />);
    expect(screen.getByText('Signing in...')).toBeTruthy();
  });
});

describe('RegisterForm', () => {
  it('renders join heading with tenant name', () => {
    render(<RegisterForm onSubmit={jest.fn()} />);
    expect(screen.getByText(/Join Test Platform/i)).toBeTruthy();
  });

  it('shows loading state', () => {
    render(<RegisterForm onSubmit={jest.fn()} loading={true} />);
    expect(screen.getByText('Creating account...')).toBeTruthy();
  });

  it('calls onSubmit with name, email, and password', () => {
    const onSubmit = jest.fn();
    render(<RegisterForm onSubmit={onSubmit} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Alice' } });   // Full Name
    fireEvent.change(inputs[1], { target: { value: 'alice@test.com' } }); // Email
    // password input (type="password") not in getByRole('textbox')
    const form = document.querySelector('form')!;
    fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Alice', email: 'alice@test.com' })
    );
  });
});
