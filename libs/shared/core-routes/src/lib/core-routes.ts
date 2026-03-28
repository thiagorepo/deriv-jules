import { createServerClient } from '@org/supabase';
import { cookies } from 'next/headers';

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  roles?: string[];
  permissions?: string[];
}

export const MAIN_NAVIGATION: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', roles: ['user', 'admin'] },
  { title: 'Trading', href: '/trading', roles: ['user', 'admin'] },
  { title: 'Wallet', href: '/wallet', roles: ['user', 'admin'] },
  { title: 'Automation', href: '/automation', roles: ['user', 'admin'] },
  { title: 'Copy Trading', href: '/copy-trading', roles: ['user', 'admin'] },
  { title: 'Admin', href: '/admin', roles: ['admin'] },
];

export async function getTenantFeatureFlags(tenantId: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cookieStore
  );

  const { data, error } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('tenant_id', tenantId)
    .single();

  if (error) {
    console.error('Error fetching feature flags:', error);
    return null;
  }

  return data;
}

export function filterNavByRole(nav: NavItem[], userRole: string): NavItem[] {
  return nav.filter((item) => !item.roles || item.roles.includes(userRole));
}
