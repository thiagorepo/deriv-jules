import { redirect } from 'next/navigation';
import { createServerClient } from '@org/supabase';
import { cookies } from 'next/headers';
import React from 'react';

export function withTenant<P = {}>(
  Component: React.ComponentType<P>,
  redirectTo: string = '/login'
) {
  return async function TenantComponent(props: P) {
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
    } = await supabase.auth.getUser() as any;

    if (!user) {
      redirect(redirectTo);
    }

    // Example logic to check if user belongs to the tenant
    const { data: membership, error } = await supabase
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('user_id', user?.id || '')
      .eq('tenant_id', tenantId)
      .single();

    if (error || !membership) {
      redirect(redirectTo); // Or redirect to unauthorized page
    }

    return <Component {...props as any} user={user} tenantId={tenantId} />;
  };
}
