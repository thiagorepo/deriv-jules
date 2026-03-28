'use client';

import { useTheme } from '@org/theme';
import { Card, Button } from './ui';

export function AdminDashboard({ user }: any) {
  const theme: any = useTheme();

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center bg-card p-4 md:p-6 rounded-lg shadow-sm border border-border gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Admin Portal
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Managing the{' '}
            <strong className="text-primary">{theme.tenantName}</strong>{' '}
            platform.
          </p>
        </div>
        <div className="w-full md:w-auto md:text-right border-t md:border-none border-border pt-4 md:pt-0">
          <p className="text-xs md:text-sm font-medium text-foreground">
            Logged in as:
          </p>
          <p className="text-sm md:text-base font-semibold text-muted-foreground break-all">
            {user?.email}
          </p>
          <span className="inline-flex items-center rounded-md bg-destructive/10 px-2.5 py-1 text-xs md:text-sm font-semibold text-destructive mt-2 w-fit">
            Administrator
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="flex flex-col items-center justify-center p-6 md:p-8 text-center">
          <h3 className="text-lg md:text-xl font-bold mb-2">Total Users</h3>
          <p className="text-3xl md:text-4xl font-extrabold text-primary">
            1,204
          </p>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6 md:p-8 text-center">
          <h3 className="text-lg md:text-xl font-bold mb-2">Active Trades</h3>
          <p className="text-3xl md:text-4xl font-extrabold text-primary">
            342
          </p>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6 md:p-8 text-center sm:col-span-2 lg:col-span-1">
          <h3 className="text-lg md:text-xl font-bold mb-2">System Status</h3>
          <p className="text-lg md:text-xl font-bold text-green-500">
            Operational
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
          Recent Activity Logs
        </h2>
        <div className="space-y-3 md:space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-muted/30 rounded-md border border-border gap-3"
            >
              <div>
                <p className="text-sm md:text-base font-medium text-foreground">
                  User {i} updated profile
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  10 minutes ago
                </p>
              </div>
              <Button
                variant="secondary"
                className="w-full sm:w-auto text-sm py-1.5 md:py-2"
              >
                View Details
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function UserDashboard({ user }: any) {
  const theme: any = useTheme();

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center bg-card p-4 md:p-6 rounded-lg shadow-sm border border-border gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Welcome Back
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Trading on the{' '}
            <strong className="text-primary">{theme.tenantName}</strong>{' '}
            platform.
          </p>
        </div>
        <div className="w-full md:w-auto md:text-right border-t md:border-none border-border pt-4 md:pt-0">
          <p className="text-xs md:text-sm font-medium text-foreground">
            Logged in as:
          </p>
          <p className="text-sm md:text-base font-semibold text-muted-foreground break-all">
            {user?.email}
          </p>
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs md:text-sm font-semibold text-primary mt-2 w-fit">
            Standard User
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="p-5 md:p-6">
          <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-1">
            Account Balance
          </h3>
          <p className="text-xl md:text-2xl font-bold text-foreground">
            $10,450.00
          </p>
        </Card>
        <Card className="p-5 md:p-6">
          <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-1">
            Open Positions
          </h3>
          <p className="text-xl md:text-2xl font-bold text-foreground">4</p>
        </Card>
        <Card className="p-5 md:p-6">
          <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-1">
            Today's P&L
          </h3>
          <p className="text-xl md:text-2xl font-bold text-green-500">
            +$240.50
          </p>
        </Card>
        <Card className="p-5 md:p-6">
          <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-1">
            Available Margin
          </h3>
          <p className="text-xl md:text-2xl font-bold text-foreground">
            $4,200.00
          </p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 md:p-6 border-b border-border gap-4">
          <h2 className="text-xl md:text-2xl font-bold">Active Trades</h2>
          <Button variant="primary" className="w-full sm:w-auto">
            New Trade
          </Button>
        </div>

        {/* Horizontal scrollable wrapper for data tables on mobile */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 md:px-6 py-3">Symbol</th>
                <th className="px-4 md:px-6 py-3">Type</th>
                <th className="px-4 md:px-6 py-3">Entry Price</th>
                <th className="px-4 md:px-6 py-3">Current Price</th>
                <th className="px-4 md:px-6 py-3">P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="bg-card hover:bg-muted/20 transition-colors">
                <td className="px-4 md:px-6 py-4 font-semibold text-foreground">
                  EUR/USD
                </td>
                <td className="px-4 md:px-6 py-4">
                  <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold">
                    BUY
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4 tabular-nums">1.0850</td>
                <td className="px-4 md:px-6 py-4 tabular-nums">1.0875</td>
                <td className="px-4 md:px-6 py-4 text-green-500 font-bold tabular-nums">
                  +$25.00
                </td>
              </tr>
              <tr className="bg-card hover:bg-muted/20 transition-colors">
                <td className="px-4 md:px-6 py-4 font-semibold text-foreground">
                  BTC/USD
                </td>
                <td className="px-4 md:px-6 py-4">
                  <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs font-bold">
                    SELL
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4 tabular-nums">64,200.00</td>
                <td className="px-4 md:px-6 py-4 tabular-nums">64,500.00</td>
                <td className="px-4 md:px-6 py-4 text-red-500 font-bold tabular-nums">
                  -$300.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
