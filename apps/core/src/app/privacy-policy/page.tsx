import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | DerivOpus',
  description: 'DerivOpus Privacy Policy',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mt-12 space-y-8 text-gray-600">
          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              1. Introduction
            </h2>
            <p className="mt-4">
              DerivOpus ("we", "us", or "our") operates as a trading platform.
              This Privacy Policy explains how we collect, use, disclose, and
              otherwise handle your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              2. Information We Collect
            </h2>
            <p className="mt-4">
              We collect information you provide directly to us, such as:
            </p>
            <ul className="mt-4 list-inside space-y-2">
              <li>• Account registration information</li>
              <li>• Trading activity and history</li>
              <li>• Payment and wallet information</li>
              <li>• Communication records</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              3. How We Use Your Information
            </h2>
            <p className="mt-4">We use the information we collect to:</p>
            <ul className="mt-4 list-inside space-y-2">
              <li>• Provide and improve our services</li>
              <li>• Process transactions</li>
              <li>• Comply with legal obligations</li>
              <li>• Communicate with you</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              4. Data Security
            </h2>
            <p className="mt-4">
              We implement appropriate security measures to protect your
              information. However, no method of transmission over the Internet
              is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">5. Contact Us</h2>
            <p className="mt-4">
              If you have questions about this Privacy Policy, please contact us
              at support@derivopus.com
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
