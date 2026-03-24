'use client';

import { useState } from 'react';
import { Card, Button } from './ui.js';
import { useTheme } from '@org/theme';

export function AdminProducts() {
  const theme: any = useTheme();
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Advanced AI Bot',
      price: '$499.00',
      status: 'Active',
      sales: 124,
    },
    {
      id: 2,
      name: 'Crypto Signals',
      price: '$99/mo',
      status: 'Active',
      sales: 892,
    },
    {
      id: 3,
      name: 'Forex Masterclass',
      price: '$199.00',
      status: 'Draft',
      sales: 0,
    },
  ]);

  const handleAddProduct = () => {
    const newProduct = {
      id: Date.now(),
      name: 'New Custom Indicator',
      price: '$49.99',
      status: 'Active',
      sales: 0,
    };
    setProducts([newProduct, ...products]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-4 md:p-6 rounded-lg shadow-sm border border-border gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Product Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage the marketplace offerings for{' '}
            <strong className="text-primary">{theme.tenantName}</strong>.
          </p>
        </div>
        <Button variant="primary" onClick={handleAddProduct}>
          + Add New Product
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 md:px-6 py-3">Product Name</th>
                <th className="px-4 md:px-6 py-3">Price</th>
                <th className="px-4 md:px-6 py-3">Status</th>
                <th className="px-4 md:px-6 py-3">Total Sales</th>
                <th className="px-4 md:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="bg-card hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 md:px-6 py-4 font-semibold text-foreground">
                    {product.name}
                  </td>
                  <td className="px-4 md:px-6 py-4 tabular-nums">
                    {product.price}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        product.status === 'Active'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 tabular-nums">
                    {product.sales}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <Button
                      variant="secondary"
                      className="text-xs py-1 px-3 min-h-0"
                    >
                      Edit
                    </Button>
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
