import React from 'react';
import { AdminDashboard, Button, DashboardLayout } from '@org/ui';
import { ThemeProvider } from '@org/theme';
import { logoutUser } from './actions';
import { withAdmin, withTenant } from '@org/shared-auth';

const getTenantConfig = () => ({
  theme: process.env.NEXT_PUBLIC_THEME || 'dark',
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#10b981',
  tenantName: process.env.NEXT_PUBLIC_TENANT_NAME || 'Default Platform',
});

// Notice we no longer have useEffect or router redirects here.
// If the user reaches this component, the Middleware has ALREADY guaranteed
// they are an authenticated Admin.
async function BaseAdminPage({ user }: any) {
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
      <DashboardLayout userRole="admin">
        <header className="flex justify-between items-center mb-8 border-b border-border pb-4 mt-8 lg:mt-0">
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold tracking-tight text-primary">
              Admin Console
            </span>
          </div>
          <form action={handleLogout}>
            <Button variant="secondary" type="submit">
              Log Out
            </Button>
          </form>
        </header>

        {/* Mock user object since we dropped localStorage. In reality, read from cookie or context */}
        <AdminDashboard user={user || { email: 'admin@platform.com' }} />
      </DashboardLayout>
    </ThemeProvider>
  );
}

export const AdminPage = withAdmin(withTenant(BaseAdminPage));
