'use client';

import React, { useState } from 'react';
import { useDerivBalance, useDerivConnection } from '@org/deriv-api';
import { Button } from '@org/ui';

interface TradingFormProps {
  tenantConfig?: Record<string, unknown>;
}

export function TradingForm({ tenantConfig }: TradingFormProps) {
  const [amount, setAmount] = useState('10');
  const [symbol, setSymbol] = useState('R_100');
  const { status, api } = useDerivConnection('1089');
  const { balance } = useDerivBalance('YOUR_DEMO_TOKEN'); // Mock token

  const executeTrade = async (type: 'CALL' | 'PUT') => {
    if (status !== 'Connected') return alert('Not connected');

    // Simple placeholder for executing trade
    api.send({
      buy: 1,
      price: Number(amount),
      parameters: {
        contract_type: type,
        symbol: symbol,
        duration: 5,
        duration_unit: 't',
        basis: 'stake',
        amount: Number(amount),
        currency: 'USD',
      },
    });

    alert(`Executed ${type} for ${amount} on ${symbol}`);
  };

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow">
      <h2 className="text-xl font-bold mb-4">Trade Execution</h2>
      <div className="mb-4">Status: {status}</div>
      <div className="mb-4">
        Balance: {balance ? `$${balance.balance}` : 'Loading...'}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Symbol</label>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full p-2 border rounded bg-background"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Amount ($)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded bg-background"
          />
        </div>

        <div className="flex gap-4">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => executeTrade('CALL')}
          >
            Higher (Call)
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => executeTrade('PUT')}
          >
            Lower (Put)
          </Button>
        </div>
      </div>
    </div>
  );
}
