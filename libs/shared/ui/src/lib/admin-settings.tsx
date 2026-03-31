'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { Card, Button } from './ui';
import { useTheme } from '@org/theme';
import { InputField } from './auth-forms';

export function AdminSettings() {
  const theme = useTheme();

  // Mock form state based on current environment variables
  const [platformName, setPlatformName] = useState(theme.tenantName ?? '');
  const [primaryColor, setPrimaryColor] = useState(
    theme.colors?.primary ?? '#000000',
  );
  const [themeMode, setThemeMode] = useState('dark');
  const [derivAppId, setDerivAppId] = useState('1089');
  const [webhookUrl, setWebhookUrl] = useState(
    'https://api.example.com/webhooks/stripe',
  );
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    // Simulate API request to save tenant config
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage(
        'Tenant settings updated successfully. Changes will apply on the next page reload.',
      );

      // In a real scenario, this would trigger a revalidation of the Server Components
      // or update the global state/context if doing CSR.
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="bg-card p-4 md:p-6 rounded-lg shadow-sm border border-border">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Tenant Settings
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Configure branding and third-party integrations for the{' '}
          <strong className="text-primary">{theme.tenantName}</strong>{' '}
          white-label instance.
        </p>
      </div>

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-md font-medium flex items-center justify-between shadow-sm">
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-green-500 hover:bg-green-500/20 p-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 md:space-y-8">
        {/* Branding Section */}
        <Card className="space-y-4">
          <div className="border-b border-border pb-4 mb-4">
            <h2 className="text-xl font-bold text-foreground">
              Branding Configuration
            </h2>
            <p className="text-sm text-muted-foreground">
              Customize the look and feel of your trading platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Platform Name"
              value={platformName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPlatformName(e.target.value)
              }
              placeholder="e.g. My Brokerage"
            />

            <div className="w-full mb-5">
              <label className="block mb-2 font-bold text-sm text-foreground">
                Primary Brand Color (Hex)
              </label>
              <div className="flex gap-3 items-center">
                <div
                  className="w-12 h-12 rounded-md border border-border shadow-sm shrink-0"
                  style={{ backgroundColor: primaryColor }}
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPrimaryColor(e.target.value)
                  }
                  className="w-full p-3 min-h-[48px] text-base rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary uppercase font-mono"
                  required
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                />
              </div>
            </div>

            <div className="w-full mb-5">
              <label className="block mb-2 font-bold text-sm text-foreground">
                Default Theme Mode
              </label>
              <select
                value={themeMode}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setThemeMode(e.target.value)
                }
                className="w-full p-3 min-h-[48px] text-base rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
              </select>
            </div>

            <div className="w-full mb-5">
              <label className="block mb-2 font-bold text-sm text-foreground">
                Logo URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                className="w-full p-3 min-h-[48px] text-base rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </Card>

        {/* Integrations Section */}
        <Card className="space-y-4">
          <div className="border-b border-border pb-4 mb-4">
            <h2 className="text-xl font-bold text-foreground">
              API & Integrations
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage connections to third-party services like Deriv and Stripe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Deriv App ID"
              type="number"
              value={derivAppId}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setDerivAppId(e.target.value)
              }
              placeholder="e.g. 1089"
            />

            <InputField
              label="Payment Webhook URL"
              type="url"
              value={webhookUrl}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setWebhookUrl(e.target.value)
              }
              placeholder="https://..."
            />
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-border">
          <Button
            variant="secondary"
            type="button"
            onClick={() => globalThis.window?.location.reload()}
          >
            Discard Changes
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving Configuration...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
