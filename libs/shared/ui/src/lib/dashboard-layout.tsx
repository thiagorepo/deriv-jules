'use client';

import { ReactNode, useState } from 'react';
import { useTheme } from '@org/theme';
import { Sidebar } from './sidebar';
import { MenuIcon } from './icons';
import type { UserRole } from '@org/shared-types';

interface FeatureFlags {
  [key: string]: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: UserRole;
  featureFlags?: FeatureFlags;
}

export function DashboardLayout({
  children,
  userRole,
  featureFlags,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const theme = useTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-background w-full">
      {/* Sidebar Area */}
      <Sidebar
        userRole={userRole}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        featureFlags={featureFlags}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden relative">
        {/* Mobile Header (Visible only < lg) */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-background border-b border-border z-50 shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 mr-2 text-foreground rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-label="Open sidebar"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg text-foreground truncate">
              {theme.tenantName}
            </span>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
