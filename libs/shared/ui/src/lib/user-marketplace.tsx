'use client';

import { useState } from 'react';
import { Card, Button } from './ui';
import { useTheme } from '@org/theme';

export function UserMarketplace() {
  const theme = useTheme();
  const [purchasing, setPurchasing] = useState<number | null>(null);

  const products = [
    {
      id: 1,
      name: 'Advanced AI Trading Bot',
      price: '$499.00',
      desc: 'Automate your trades based on technical indicators.',
      tag: 'Hot',
    },
    {
      id: 2,
      name: 'VIP Crypto Signals',
      price: '$99/mo',
      desc: 'Daily market analysis and buy/sell signals.',
      tag: 'Popular',
    },
    {
      id: 3,
      name: 'Forex Masterclass',
      price: '$199.00',
      desc: 'A 10-hour video course on currency pairs.',
      tag: 'New',
    },
    {
      id: 4,
      name: 'Custom Strategy Script',
      price: '$49.99',
      desc: 'Pine Script indicator for TradingView.',
      tag: 'Utility',
    },
  ];

  const handlePurchase = (id: number) => {
    setPurchasing(id);
    setTimeout(() => {
      setPurchasing(null);
      globalThis.alert?.(
        'Purchase Successful! You can find this in your Purchases tab.'
      );
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-4 md:p-6 rounded-lg shadow-sm border border-border gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Marketplace
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Discover tools to enhance your trading on{' '}
            <strong className="text-primary">{theme.tenantName}</strong>.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-muted-foreground">
            Available Balance
          </p>
          <p className="text-xl font-extrabold text-foreground">$10,450.00</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className="flex flex-col relative overflow-hidden group hover:border-primary transition-colors border border-border"
          >
            <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-bl-lg">
              {product.tag}
            </span>
            <div className="flex-1 p-4 md:p-6">
              <h3 className="text-lg font-bold text-foreground mb-2 pr-8">
                {product.name}
              </h3>
              <p className="text-2xl font-extrabold text-primary mb-4">
                {product.price}
              </p>
              <p className="text-sm text-muted-foreground">{product.desc}</p>
            </div>
            <div className="p-4 md:p-6 pt-0 border-t border-border mt-auto">
              <Button
                variant="primary"
                className="w-full mt-4"
                onClick={() => handlePurchase(product.id)}
                disabled={purchasing === product.id}
              >
                {purchasing === product.id ? 'Processing...' : 'Buy Now'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
