import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | DerivOpus',
  description: 'Admin dashboard',
};

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Platform administration and monitoring
        </p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', value: '2,345', change: '+12%' },
          { label: 'Active Traders', value: '892', change: '+8%' },
          { label: 'Total Volume', value: '$5.2M', change: '+25%' },
          { label: 'System Health', value: '99.9%', change: '✓' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-200 bg-white p-6"
          >
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-green-600">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {[
          {
            title: 'User Management',
            description: 'Manage users and permissions',
          },
          {
            title: 'Transaction Monitoring',
            description: 'Monitor transactions and settlements',
          },
          { title: 'System Logs', description: 'View system and API logs' },
          { title: 'Reports', description: 'Generate and view reports' },
          { title: 'Settings', description: 'Configure platform settings' },
          {
            title: 'Compliance',
            description: 'Regulatory and compliance tools',
          },
        ].map((section) => (
          <div
            key={section.title}
            className="rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-300"
          >
            <h3 className="font-semibold text-gray-900">{section.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{section.description}</p>
            <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">
              Access →
            </button>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent System Activity
        </h2>
        <div className="mt-6 space-y-4">
          {[
            {
              action: 'User Registration',
              user: 'user@example.com',
              time: '5 min ago',
            },
            {
              action: 'Large Withdrawal',
              user: 'trader@example.com',
              time: '15 min ago',
            },
            {
              action: 'System Health Check',
              user: 'System',
              time: '1 hour ago',
            },
            { action: 'API Sync', user: 'System', time: '2 hours ago' },
          ].map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-gray-100 pb-4"
            >
              <div>
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.user}</p>
              </div>
              <p className="text-sm text-gray-600">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
