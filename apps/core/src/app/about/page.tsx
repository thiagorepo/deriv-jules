import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | DerivOpus',
  description:
    'Learn about DerivOpus, the algorithmic trading platform powered by Deriv',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          About DerivOpus
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          DerivOpus is a multi-tenant algorithmic trading platform built on top
          of Deriv's API.
        </p>
        <div className="mt-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            <p className="mt-4 text-gray-600">
              To democratize algorithmic trading by providing tools and
              infrastructure for traders to build, test, and deploy trading
              strategies.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Key Features</h2>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>• Real-time trading interface</li>
              <li>• Multi-tenant support</li>
              <li>• Advanced analytics and reporting</li>
              <li>• Secure wallet management</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
