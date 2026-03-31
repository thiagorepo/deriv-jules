'use client';

import { ChangeEvent, useState } from 'react';
import { Card, Button } from './ui';
import { useTheme } from '@org/theme';

export function AdminUsers() {
  const theme = useTheme();

  // Mock Data
  const [users] = useState([
    {
      id: 'USR-001',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'User',
      plan: 'Pro',
      status: 'Active',
      joined: 'Oct 15, 2023',
    },
    {
      id: 'USR-002',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'Admin',
      plan: 'Enterprise',
      status: 'Active',
      joined: 'Nov 01, 2023',
    },
    {
      id: 'USR-003',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'User',
      plan: 'Basic',
      status: 'Suspended',
      joined: 'Dec 10, 2023',
    },
    {
      id: 'USR-004',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      role: 'User',
      plan: 'Pro',
      status: 'Active',
      joined: 'Jan 20, 2024',
    },
    {
      id: 'USR-005',
      name: 'Diana Prince',
      email: 'diana@example.com',
      role: 'User',
      plan: 'Basic',
      status: 'Pending Verification',
      joined: 'Feb 14, 2024',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-4 md:p-6 rounded-lg shadow-sm border border-border gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            User Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage all registered users on the{' '}
            <strong className="text-primary">{theme.tenantName}</strong>{' '}
            platform.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="p-2 min-h-[44px] text-base rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-64"
          />
          <Button variant="primary" className="whitespace-nowrap">
            Invite User
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[900px]">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 md:px-6 py-4 font-semibold tracking-wider">
                  User
                </th>
                <th className="px-4 md:px-6 py-4 font-semibold tracking-wider">
                  Role & Plan
                </th>
                <th className="px-4 md:px-6 py-4 font-semibold tracking-wider">
                  Status
                </th>
                <th className="px-4 md:px-6 py-4 font-semibold tracking-wider">
                  Joined Date
                </th>
                <th className="px-4 md:px-6 py-4 font-semibold tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="bg-card hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 md:px-6 py-4">
                      <div className="font-semibold text-foreground">
                        {user.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="font-medium text-foreground">
                        {user.role}
                      </div>
                      <div className="text-xs text-primary font-semibold">
                        {user.plan}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          user.status === 'Active'
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : user.status === 'Suspended'
                              ? 'bg-destructive/10 text-destructive border-destructive/20'
                              : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-muted-foreground tabular-nums">
                      {user.joined}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right space-x-2">
                      <button className="text-primary hover:underline text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1">
                        Edit
                      </button>
                      <button className="text-destructive hover:underline text-sm font-medium focus:outline-none focus:ring-2 focus:ring-destructive rounded px-2 py-1">
                        Suspend
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">
              {filteredUsers.length}
            </span>{' '}
            of{' '}
            <span className="font-medium text-foreground">{users.length}</span>{' '}
            users
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="py-1 px-3 text-xs min-h-[36px]"
              disabled
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              className="py-1 px-3 text-xs min-h-[36px]"
              disabled
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
