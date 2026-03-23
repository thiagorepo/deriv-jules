import React from 'react';
import { useTheme } from '@org/theme';

export function Button({ onClick, children, variant = 'primary', className = '', ...props }) {
  const variantStyles = variant === 'primary' 
    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
    : 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10';

  // Added min-h-[44px] for better touch target areas on mobile devices
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 min-h-[44px] rounded-md font-bold transition-colors flex items-center justify-center ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`p-4 md:p-6 lg:p-8 rounded-lg shadow-sm bg-card text-card-foreground border border-border ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Header({ title }) {
    const theme = useTheme();
    // Flex row for tablet/desktop, stacked column for very small screens
    return (
        <header className="p-4 md:p-6 border-b border-primary/20 flex flex-col sm:flex-row justify-between items-center sm:items-center space-y-4 sm:space-y-0 mb-8 w-full">
            <h2 className="text-2xl font-bold tracking-tight text-center sm:text-left">{title || theme.tenantName}</h2>
            <nav className="w-full sm:w-auto flex justify-center sm:justify-end">
                <a href="/login" className="no-underline w-full sm:w-auto">
                  <Button variant="secondary" className="w-full sm:w-auto">Login</Button>
                </a>
            </nav>
        </header>
    )
}
