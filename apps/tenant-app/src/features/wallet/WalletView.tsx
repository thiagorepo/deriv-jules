import React from 'react';
import { Button } from '@org/ui';

export function WalletView() {
  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow">
      <h2 className="text-xl font-bold mb-4">Wallet Balance</h2>
      <div className="text-3xl font-bold mb-6">$1,234.56</div>
      <div className="flex gap-4">
        <Button>Deposit</Button>
        <Button variant="outline">Withdraw</Button>
      </div>
    </div>
  );
}
