import { redirect } from 'next/navigation';
import { createServerClient } from '@org/supabase';
import { cookies } from 'next/headers';
import React from 'react';

export function withAdmin<P = {}>(
  Component: React.ComponentType<P>,
  redirectTo: string = '/login'
) {
  return async function AdminComponent(props: P) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      cookieStore
    );

    const {
      data: { user },
    } = await supabase.auth.getUser() as any;

    if (!user) {
      redirect(redirectTo);
      return null;
    }

    // Assuming role is in user metadata or a specific table, simplistic check for now
    const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';

    if (!isAdmin) {
      redirect('/'); // Redirect to a generic error or home page if not admin
      return null;
    }

    return <Component {...props as any} user={user} />;
  };
}
