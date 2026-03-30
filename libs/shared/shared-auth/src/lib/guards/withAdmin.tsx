import { redirect } from 'next/navigation';
import { createServerClient } from '@org/supabase';
import { cookies } from 'next/headers';
import React from 'react';
import type { AppUser } from '@org/shared-types';

interface WithAdminProps {
  user: AppUser;
}

export function withAdmin<P extends WithAdminProps>(
  Component: React.ComponentType<P>,
  redirectTo: string = '/login'
) {
  return async function AdminComponent(props: Omit<P, keyof WithAdminProps>) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      cookieStore
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(redirectTo);
      return null;
    }

    const role = user.app_metadata?.role ?? user.user_metadata?.role;
    if (role !== 'admin') {
      redirect('/');
      return null;
    }

    const appUser: AppUser = {
      id: user.id,
      email: user.email ?? '',
      role: 'admin',
      createdAt: user.created_at ?? '',
      updatedAt: user.updated_at ?? '',
    };

    return <Component {...(props as P)} user={appUser} />;
  };
}
