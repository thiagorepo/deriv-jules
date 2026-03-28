import React from 'react';
import { Button } from '@org/ui';

export function DiscoverTraders() {
  const traders = [
    { id: 1, name: 'TraderAlpha', roi: '+45%', risk: 'Medium' },
    { id: 2, name: 'SafeBet', roi: '+12%', risk: 'Low' },
  ];

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow">
      <h2 className="text-xl font-bold mb-4">Discover Top Traders</h2>
      <div className="space-y-4">
        {traders.map((trader) => (
          <div key={trader.id} className="flex justify-between items-center p-4 border rounded">
            <div>
              <div className="font-bold">{trader.name}</div>
              <div className="text-sm text-muted-foreground">ROI: {trader.roi} | Risk: {trader.risk}</div>
            </div>
            <Button>Copy</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
