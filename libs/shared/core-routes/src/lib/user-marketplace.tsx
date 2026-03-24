import React from 'react';
import { UserMarketplace, Button, DashboardLayout } from '@org/ui';
import { ThemeProvider } from '@org/theme';
import { logoutUser } from './actions';

const getTenantConfig = () => ({
  theme: process.env.NEXT_PUBLIC_THEME || 'dark',
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#10b981',
  tenantName: process.env.NEXT_PUBLIC_TENANT_NAME || 'Default Platform',
});

export default async function UserMarketplacePage() {
  const tenantConfig = getTenantConfig();

  const resolvedTheme = {
    colors: { primary: tenantConfig.primaryColor },
    tenantName: tenantConfig.tenantName,
  };

  const handleLogout = async () => {
    'use server';
    await logoutUser();
  };

  return (
    <ThemeProvider initialTheme={resolvedTheme}>
      <DashboardLayout userRole="user">
        <header className="flex justify-between items-center mb-8 border-b border-border pb-4 mt-8 lg:mt-0">
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold tracking-tight text-primary">
              Trading Platform
            </span>
          </div>
          <form action={handleLogout}>
            <Button variant="secondary" type="submit">
              Log Out
            </Button>
          </form>
        </header>

        <UserMarketplace />
      </DashboardLayout>
    </ThemeProvider>
  );
}
