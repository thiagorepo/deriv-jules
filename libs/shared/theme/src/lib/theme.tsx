'use client';

import { createContext, useContext, CSSProperties } from 'react';

// Theme Context allows components to read dynamic tenant configuration
// (like the tenant name or specific primary color) even if they aren't server rendered.
const ThemeContext = createContext({});

export function ThemeProvider({ initialTheme, children }: any) {
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

export function useTheme() {
  return useContext(ThemeContext);
}
