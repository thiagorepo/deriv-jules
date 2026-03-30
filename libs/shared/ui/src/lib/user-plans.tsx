'use client';

import { useState } from 'react';
import { Card, Button } from './ui';
import { useTheme } from '@org/theme';

export function UserPlans() {
  const theme = useTheme();

  const [currentPlan, setCurrentPlan] = useState('Pro');

  const plans = [
    {
      id: 1,
      name: 'Basic',
      price: '$0/mo',
      features: ['Real-time Quotes', '1 Demo Account'],
    },
    {
      id: 2,
      name: 'Pro',
      price: '$49/mo',
      features: ['Premium Support', 'Unlimited Accounts', 'API Access'],
    },
    {
      id: 3,
      name: 'Enterprise',
      price: '$199/mo',
      features: ['Dedicated Account Manager', 'Custom API Limits'],
    },
  ];

  const handleSubscribe = (name: string) => {
    globalThis.alert?.(`Successfully upgraded to the ${name} plan!`);
    setCurrentPlan(name);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-4 md:p-6 rounded-lg shadow-sm border border-border gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            My Subscription
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage your{' '}
            <strong className="text-primary">{theme.tenantName}</strong>{' '}
            membership tier.
          </p>
        </div>
        <div className="text-right p-3 bg-primary/10 rounded-md border border-primary/20">
          <p className="text-sm font-medium text-primary mb-1">Current Plan</p>
          <p className="text-xl font-extrabold text-foreground tracking-tight">
            {currentPlan}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col h-full border p-6 shadow-md transition-shadow hover:shadow-lg ${
              currentPlan === plan.name
                ? 'border-primary ring-2 ring-primary/50'
                : 'border-border'
            }`}
          >
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {plan.name}
            </h3>
            <p className="text-3xl font-extrabold text-primary mb-6">
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
              <Button
                variant={currentPlan === plan.name ? 'secondary' : 'primary'}
                className="w-full"
                onClick={() => handleSubscribe(plan.name)}
                disabled={currentPlan === plan.name}
              >
                {currentPlan === plan.name ? 'Active Plan' : 'Upgrade'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
