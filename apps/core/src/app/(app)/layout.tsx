import type { ReactNode } from 'react';

/**
 * Main app layout with sidebar and header
 * Wraps all protected app pages
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white">
        <nav className="space-y-2 px-4 py-8">
          <div className="mb-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900">DerivOpus</h1>
          </div>
          <a
            href="/app/overview"
            className="block rounded-md px-4 py-2 text-gray-900 hover:bg-gray-100"
          >
            Overview
          </a>
          <a
            href="/app/trading"
            className="block rounded-md px-4 py-2 text-gray-900 hover:bg-gray-100"
          >
            Trading
          </a>
          <a
            href="/app/wallet"
            className="block rounded-md px-4 py-2 text-gray-900 hover:bg-gray-100"
          >
            Wallet
          </a>
          <a
            href="/app/admin"
            className="block rounded-md px-4 py-2 text-gray-900 hover:bg-gray-100"
          >
            Admin
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
            <div className="flex items-center gap-4">
              <button className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200">
                Profile
              </button>
              <button className="rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200">
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
