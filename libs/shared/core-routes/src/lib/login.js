'use client';

import React, { useState, useEffect } from 'react';
import { LoginForm } from '@org/ui';
import { ThemeProvider } from '@org/theme';
import { authenticateUser } from './actions';
import { createBrowserClient } from '@org/supabase';
import { useRouter } from 'next/navigation';

const getTenantConfig = () => ({
  theme: process.env.NEXT_PUBLIC_THEME || 'dark',
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#10b981',
  tenantName: process.env.NEXT_PUBLIC_TENANT_NAME || 'Default Platform',
  loginRedirect: process.env.NEXT_PUBLIC_LOGIN_REDIRECT || '/',
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const tenantConfig = getTenantConfig();

  const resolvedTheme = {
    colors: { primary: tenantConfig.primaryColor },
    tenantName: tenantConfig.tenantName,
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check for existing session in localStorage
  useEffect(() => {
    if (supabaseUrl && supabaseKey) {
      const supabase = createBrowserClient(supabaseUrl, supabaseKey);

      const checkSession = async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          // Already logged in! Redirect based on email domain
          const email = session.user.email;
          if (email && email.endsWith('@admin.com')) {
            router.push('/admin');
          } else {
            router.push(tenantConfig.loginRedirect || '/user');
          }
        }
      };

      checkSession();
    }
  }, [router, supabaseUrl, supabaseKey, tenantConfig.loginRedirect]);

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    setError('');

    // Auth happens via server action (sets httpOnly cookies AND Supabase tokens if using SSR client properly)
    // Supabase JS SDK stores the session automatically in localStorage via createBrowserClient if we login from CSR,
    // but here we are using a Server Action `authenticateUser` to set cookies for the middleware.

    // We should also let Supabase client know about the login to populate localStorage
    if (supabaseUrl && supabaseKey) {
      const supabase = createBrowserClient(supabaseUrl, supabaseKey);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    }

    // Call the Server Action to set HttpOnly cookies for SSR RBAC
    const result = await authenticateUser(
      email,
      password,
      tenantConfig.loginRedirect
    );

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
