import { Card, Button } from '@org/ui';
import { ThemeProvider } from '@org/theme';
import { cookies } from 'next/headers';
import { createServerClient } from '@org/supabase';

export default async function TenantPage() {
  const cookieStore = cookies();

  // Initialize supabase to ensure environment vars are picked up or pass client tests
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key',
      cookieStore
    );
  }

  const tenantConfig = {
    theme: process.env.NEXT_PUBLIC_THEME || 'dark',
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#10b981',
    tenantName: process.env.NEXT_PUBLIC_TENANT_NAME || 'Default Platform',
  };

  const resolvedTheme = {
    colors: {
      primary: tenantConfig.primaryColor,
    },
    tenantName: tenantConfig.tenantName,
  };

  return (
    <ThemeProvider initialTheme={resolvedTheme}>
      <main className="min-h-screen bg-background text-foreground p-8">
        <header className="flex justify-between items-center mb-16">
          <img
            src={`https://dummyimage.com/200x50/000/fff&text=${encodeURIComponent(
              tenantConfig.tenantName
            )}+Logo`}
            alt="Logo"
            className="rounded"
          />
          <a href="/login" className="no-underline">
            <Button variant="secondary">Login</Button>
          </a>
        </header>

        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-foreground">
            Dashboard
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            Welcome to the{' '}
            <strong className="text-foreground">
              {tenantConfig.tenantName}
            </strong>{' '}
            isolated platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <h2 className="text-2xl font-bold mb-4 tracking-tight">
                Deriv API Connection
              </h2>
              <p className="text-muted-foreground">
                Connection logic will go here.
              </p>
            </Card>

            <Card>
              <h2 className="text-2xl font-bold mb-4 tracking-tight">
                Isolated Environment
              </h2>
              <p className="text-muted-foreground mb-4">
                This UI is statically rendered by the Next.js Server App Router
                using isolated environment variables (`.env.local`).
              </p>
              <ul className="space-y-2 list-none p-0 text-sm">
                <li>
                  <span className="font-semibold text-foreground">Tenant:</span>{' '}
                  {tenantConfig.tenantName}
                </li>
                <li>
                  <span className="font-semibold text-foreground">Theme:</span>{' '}
                  {tenantConfig.theme}
                </li>
                <li>
                  <span className="font-semibold text-foreground">Color:</span>{' '}
                  <span className="text-primary font-mono bg-muted px-1.5 py-0.5 rounded-md">
                    {tenantConfig.primaryColor}
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </ThemeProvider>
  );
}
