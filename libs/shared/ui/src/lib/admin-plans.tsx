'use client';

import { useState } from 'react';
import { Card, Button } from './ui';
import { useTheme } from '@org/theme';

export function AdminPlans() {
  const theme = useTheme();
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: 'Basic',
      price: '$0/mo',
      users: 1042,
      features: ['Real-time Quotes', '1 Demo Account'],
    },
    {
      id: 2,
      name: 'Pro',
      price: '$49/mo',
      users: 453,
      features: ['Premium Support', 'Unlimited Accounts', 'API Access'],
    },
    {
      id: 3,
      name: 'Enterprise',
      price: '$199/mo',
      users: 12,
      features: ['Dedicated Account Manager', 'Custom API Limits'],
    },
  ]);

  const handleAddPlan = () => {
    const newPlan = {
      id: Date.now(),
      name: 'Custom Team',
      price: '$99/mo',
      users: 0,
      features: ['Shared Workspace', 'Priority Support'],
    };
    setPlans([newPlan, ...plans]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-4 md:p-6 rounded-lg shadow-sm border border-border gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Subscription Plans
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Configure the user tiers for{' '}
            <strong className="text-primary">{theme.tenantName}</strong>.
          </p>
        </div>
        <Button variant="primary" onClick={handleAddPlan}>
          + Add New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className="flex flex-col h-full border border-border p-6 shadow-md transition-shadow hover:shadow-lg"
          >
            <h3 className="text-2xl font-bold text-primary mb-2">
              {plan.name}
            </h3>
            <p className="text-3xl font-extrabold text-foreground mb-6">
              {plan.price}
            </p>
            <div className="flex-grow">
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center text-sm text-muted-foreground"
                  >
                    <span className="mr-2 text-green-500">✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t border-border mt-auto">
              <p className="text-sm text-muted-foreground mb-4">
                Active Users:{' '}
                <strong className="text-foreground">{plan.users}</strong>
              </p>
              <Button variant="secondary" className="w-full">
                Edit Plan
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
