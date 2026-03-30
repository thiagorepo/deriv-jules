'use client';

import { createContext, useContext, CSSProperties } from 'react';

export interface ThemeConfig {
  tenantName?: string;
  colors?: {
    primary?: string;
    secondary?: string;
  };
}

interface ThemeProviderProps {
  initialTheme: ThemeConfig;
  children: React.ReactNode;
}

const ThemeContext = createContext<ThemeConfig>({});

export function ThemeProvider({ initialTheme, children }: ThemeProviderProps) {
  // Apply dynamic CSS variables for the tenant's primary color, overriding the tailwind defaults
  // This allows Tailwind classes like `bg-primary` to still work while dynamically using the tenant color
  const dynamicStyles: CSSProperties = {
    '--primary': initialTheme?.colors?.primary
      ? `hsl(from ${initialTheme.colors.primary} h s l)`
      : undefined,
  } as React.CSSProperties;

  return (
    <ThemeContext.Provider value={initialTheme}>
      <div style={dynamicStyles} className="contents">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeConfig {
  return useContext(ThemeContext);
}
