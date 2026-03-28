import { redirect } from 'next/navigation';
import { createServerClient } from '@org/supabase';
import { cookies } from 'next/headers';
import React from 'react';

export function withAuth<P = {}>(
  Component: React.ComponentType<P>,
  redirectTo: string = '/login'
) {
  return async function AuthenticatedComponent(props: P) {
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
    }

    return <Component {...props as any} user={user} />;
  };
}
