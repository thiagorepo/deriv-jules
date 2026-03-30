import { redirect } from 'next/navigation';
import { createServerClient } from '@org/supabase';
import { cookies } from 'next/headers';
import React from 'react';
import type { AppUser } from '@org/shared-types';

interface WithTenantProps {
  user: AppUser;
  tenantId: string;
}

export function withTenant<P extends WithTenantProps>(
  Component: React.ComponentType<P>,
  redirectTo: string = '/login'
) {
  return async function TenantComponent(props: Omit<P, keyof WithTenantProps>) {
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;

    if (!tenantId) {
      console.error('NEXT_PUBLIC_TENANT_ID is not defined');
      redirect(redirectTo);
    }

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
    }

    const { data: membership, error } = await supabase
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('user_id', user?.id ?? '')
      .eq('tenant_id', tenantId)
      .single();

    if (error || !membership) {
      redirect(redirectTo);
    }

    const appUser: AppUser = {
      id: user!.id,
      email: user!.email ?? '',
      role: (user!.app_metadata?.role ?? user!.user_metadata?.role ?? 'user') as AppUser['role'],
      tenantId: tenantId!,
      createdAt: user!.created_at ?? '',
      updatedAt: user!.updated_at ?? '',
    };

    return <Component {...(props as P)} user={appUser} tenantId={tenantId!} />;
  };
}
