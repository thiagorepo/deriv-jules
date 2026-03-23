'use client';

import React, { useState } from 'react';
import { LoginForm } from '@org/ui';
import { ThemeProvider } from '@org/theme';
import { authenticateUser } from './actions';

const getTenantConfig = () => ({
  theme: process.env.NEXT_PUBLIC_THEME || 'dark',
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#10b981',
  tenantName: process.env.NEXT_PUBLIC_TENANT_NAME || 'Default Platform',
  loginRedirect: process.env.NEXT_PUBLIC_LOGIN_REDIRECT || '/'
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const tenantConfig = getTenantConfig();
  
  const resolvedTheme = {
    colors: { primary: tenantConfig.primaryColor },
    tenantName: tenantConfig.tenantName,
  };

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    setError('');
    
    // Call the Server Action
    const result = await authenticateUser(email, password, tenantConfig.loginRedirect);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <ThemeProvider initialTheme={resolvedTheme}>
      <main className="min-h-screen bg-background flex items-center justify-center p-8">
        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
      </main>
    </ThemeProvider>
  );
}
