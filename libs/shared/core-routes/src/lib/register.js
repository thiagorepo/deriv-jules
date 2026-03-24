'use client';

import React, { useState } from 'react';
import { RegisterForm } from '@org/ui';
import { ThemeProvider } from '@org/theme';
import { authenticateUser } from './actions';

const getTenantConfig = () => ({
  theme: process.env.NEXT_PUBLIC_THEME || 'dark',
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#10b981',
  tenantName: process.env.NEXT_PUBLIC_TENANT_NAME || 'Default Platform',
  loginRedirect: process.env.NEXT_PUBLIC_LOGIN_REDIRECT || '/'
});

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const tenantConfig = getTenantConfig();
  
  const resolvedTheme = {
    colors: { primary: tenantConfig.primaryColor },
    tenantName: tenantConfig.tenantName,
  };

  const handleRegister = async ({ email, password }) => {
    setLoading(true);
    setError('');
    
    // Mock: just log them in for the demo
    const result = await authenticateUser(email, password, tenantConfig.loginRedirect);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <ThemeProvider initialTheme={resolvedTheme}>
      <main className="min-h-screen bg-background flex items-center justify-center p-8">
        <RegisterForm onSubmit={handleRegister} loading={loading} error={error} />
      </main>
    </ThemeProvider>
  );
}
