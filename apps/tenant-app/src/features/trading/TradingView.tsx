import React from 'react';
import { TradingForm } from './TradingForm.tsx';

export function TradingView({ tenantConfig }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="p-4 border rounded-lg bg-card text-card-foreground shadow h-[400px] flex items-center justify-center">
          Chart Placeholder
        </div>
      </div>
      <div>
        <TradingForm tenantConfig={tenantConfig} />
      </div>
    </div>
  );
}
