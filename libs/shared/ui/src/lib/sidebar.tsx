'use client';

import { Dispatch, SetStateAction } from 'react';
import { useTheme } from '@org/theme';
import { XMarkIcon } from './icons';
import type { UserRole } from '@org/shared-types';

interface FeatureFlags {
  [key: string]: boolean;
}

interface SidebarProps {
  userRole: UserRole;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  featureFlags?: FeatureFlags;
}

export function Sidebar({ userRole, isOpen, setIsOpen, featureFlags }: SidebarProps) {
  const theme = useTheme();

  const adminLinks: Array<{name: string, href: string, flag?: string}> = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'User Management', href: '/admin/users' },
    { name: 'Products & Store', href: '/admin/products' },
    { name: 'Subscription Plans', href: '/admin/plans' },
    { name: 'System Logs', href: '/admin/logs' },
    { name: 'Settings', href: '/admin/settings' },
  ];

  const userLinks: Array<{name: string, href: string, flag?: string}> = [
    { name: 'Trading Platform', href: '/user', flag: 'trading' },
    { name: 'Marketplace', href: '/user/marketplace' },
    { name: 'My Purchases', href: '/user/purchases' },
    { name: 'My Plan', href: '/user/plans' },
    { name: 'Portfolio', href: '/user/portfolio' },
    { name: 'Transaction History', href: '/user/history' },
    { name: 'Wallet', href: '/user/wallet', flag: 'wallet' },
    { name: 'Automation', href: '/user/automation', flag: 'automation' },
    { name: 'Copy Trading', href: '/user/copy-trading', flag: 'copy_trading' },
  ];

  let links = userRole === 'admin' ? adminLinks : userLinks;

  if (featureFlags) {
      links = links.filter(link => {
          if (!link.flag) return true;
          return featureFlags[link.flag] === true;
      });
  }

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Added z-[60] so the sidebar is above the mobile header which is z-50
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-[60] w-72 bg-sidebar text-sidebar-foreground
    border-r border-sidebar-border transform transition-transform duration-300 ease-in-out
    lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col lg:h-screen lg:w-72
    ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Overlay for mobile - only visible below lg breakpoint */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[55] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside className={sidebarClasses}>
        <div className="flex-1 flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground">
            <span className="font-bold text-lg truncate tracking-tight">
              {theme.tenantName}
            </span>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 -mr-2 rounded-md text-sidebar-primary-foreground/80 hover:text-sidebar-primary-foreground hover:bg-sidebar-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="group flex items-center px-4 py-3 text-base font-medium rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground transition-colors"
                onClick={() => setIsOpen(false)} // Close on navigate for mobile
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-sidebar-border text-sm text-sidebar-foreground/60 text-center">
            &copy; {new Date().getFullYear()} {theme.tenantName}
          </div>
        </div>
      </aside>
    </>
  );
}
