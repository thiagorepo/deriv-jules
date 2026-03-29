/**
 * Navigation configuration for Deriv Opus
 */

import type { NavItem } from '@org/shared-types';

export const mainNavigation: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['user', 'admin', 'tenant_admin'],
  },
  {
    id: 'trading',
    label: 'Trading',
    href: '/trading',
    icon: 'TrendingUp',
    roles: ['user', 'admin', 'tenant_admin'],
  },
  {
    id: 'admin',
    label: 'Admin',
    href: '/admin',
    icon: 'Settings',
    roles: ['admin', 'tenant_admin'],
    children: [
      {
        id: 'users',
        label: 'Users',
        href: '/admin/users',
        roles: ['admin', 'tenant_admin'],
      },
      {
        id: 'tenants',
        label: 'Tenants',
        href: '/admin/tenants',
        roles: ['admin'],
      },
    ],
  },
];

export const userNavigation: NavItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: 'User',
    roles: ['user', 'admin', 'tenant_admin'],
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: 'Cog',
    roles: ['user', 'admin', 'tenant_admin'],
  },
];
