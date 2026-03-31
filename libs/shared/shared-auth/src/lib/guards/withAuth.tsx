import { redirect } from 'next/navigation';
import { createServerClient } from '@org/supabase';
import { cookies } from 'next/headers';
import React from 'react';
import type { AppUser } from '@org/shared-types';

export interface WithAuthProps {
  user: AppUser;
}

export function withAuth<P extends WithAuthProps>(
  Component: React.ComponentType<P>,
  redirectTo = '/login',
) {
  return async function AuthenticatedComponent(
    props: Omit<P, keyof WithAuthProps>,
  ) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      cookieStore,
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(redirectTo);
    }

    const appUser: AppUser = {
      id: user!.id,
      email: user!.email ?? '',
      role: (user!.app_metadata?.role ??
        user!.user_metadata?.role ??
        'user') as AppUser['role'],
      tenantId: user!.app_metadata?.tenant_id,
      createdAt: user!.created_at,
      updatedAt: user!.updated_at ?? user!.created_at,
    };

    return <Component {...(props as P)} user={appUser} />;
  };
}
