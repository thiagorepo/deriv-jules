// CSS imported at tenant level

import React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use a sensible default, this could later be wired up to be dynamic on the server
  const themeClass =
    process.env.NEXT_PUBLIC_THEME === 'light' ? 'light' : 'dark';

  return (
    <html lang="en" className={themeClass}>
      <body className="bg-background text-foreground m-0 min-h-screen font-sans">
        {/* The children will be wrapped by the ThemeProvider at the page level */}
        {children}
      </body>
    </html>
  );
}
