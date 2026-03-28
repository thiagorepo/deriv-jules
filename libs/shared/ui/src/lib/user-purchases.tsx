'use client';

import { Card, Button } from './ui';
import { useTheme } from '@org/theme';

export function UserPurchases() {
  const theme: any = useTheme();

  const mockPurchases = [
    {
      id: 'ORD-001',
      item: 'Advanced AI Trading Bot',
      date: '2023-10-15',
      amount: '$499.00',
      status: 'Completed',
    },
    {
      id: 'ORD-002',
      item: 'VIP Crypto Signals (1 mo)',
      date: '2023-11-01',
      amount: '$99.00',
      status: 'Completed',
    },
    {
      id: 'ORD-003',
      item: 'Forex Masterclass',
      date: '2023-12-10',
      amount: '$199.00',
      status: 'Pending',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-4 md:p-6 rounded-lg shadow-sm border border-border gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            My Purchases
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Your transaction history on the{' '}
            <strong className="text-primary">{theme.tenantName}</strong>{' '}
            platform.
          </p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 md:p-6 border-b border-border gap-4">
          <h2 className="text-xl md:text-2xl font-bold">Order History</h2>
          <Button variant="secondary" className="w-full sm:w-auto text-sm">
            Download Receipts
          </Button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 md:px-6 py-3">Order ID</th>
                <th className="px-4 md:px-6 py-3">Item</th>
                <th className="px-4 md:px-6 py-3">Date</th>
                <th className="px-4 md:px-6 py-3">Amount</th>
                <th className="px-4 md:px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockPurchases.map((order) => (
                <tr
                  key={order.id}
                  className="bg-card hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 md:px-6 py-4 font-mono text-muted-foreground">
                    {order.id}
                  </td>
                  <td className="px-4 md:px-6 py-4 font-semibold text-foreground">
                    {order.item}
                  </td>
                  <td className="px-4 md:px-6 py-4">{order.date}</td>
                  <td className="px-4 md:px-6 py-4 tabular-nums font-bold">
                    {order.amount}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        order.status === 'Completed'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
