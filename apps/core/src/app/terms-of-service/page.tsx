import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | DerivOpus',
  description: 'DerivOpus Terms of Service',
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mt-12 space-y-8 text-gray-600">
          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              1. Agreement to Terms
            </h2>
            <p className="mt-4">
              By accessing and using DerivOpus, you accept and agree to be bound
              by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">2. Use License</h2>
            <p className="mt-4">
              Permission is granted to temporarily download one copy of the
              materials (information or software) on DerivOpus for personal,
              non-commercial transitory viewing only. This is the grant of a
              license, not a transfer of title, and under this license you may
              not:
            </p>
            <ul className="mt-4 list-inside space-y-2">
              <li>• Modify or copy the materials</li>
              <li>
                • Use the materials for any commercial purpose or for any public
                display
              </li>
              <li>
                • Attempt to decompile or reverse engineer any software
                contained on the site
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">3. Disclaimer</h2>
            <p className="mt-4">
              The materials on DerivOpus are provided on an 'as is' basis.
              DerivOpus makes no warranties, expressed or implied, and hereby
              disclaims and negates all other warranties including, without
              limitation, implied warranties or conditions of merchantability,
              fitness for a particular purpose, or non-infringement of
              intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">4. Limitations</h2>
            <p className="mt-4">
              In no event shall DerivOpus or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the materials on DerivOpus.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              5. Accuracy of Materials
            </h2>
            <p className="mt-4">
              The materials appearing on DerivOpus could include technical,
              typographical, or photographic errors. DerivOpus does not warrant
              that any of the materials on the site are accurate, complete, or
              current.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">6. Links</h2>
            <p className="mt-4">
              DerivOpus has not reviewed all of the sites linked to its website
              and is not responsible for the contents of any such linked site.
              The inclusion of any link does not imply endorsement by DerivOpus
              of the site. Use of any such linked website is at the user's own
              risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              7. Modifications
            </h2>
            <p className="mt-4">
              DerivOpus may revise these terms of service for its website at any
              time without notice. By using this website, you are agreeing to be
              bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              8. Governing Law
            </h2>
            <p className="mt-4">
              These terms and conditions are governed by and construed in
              accordance with the laws of the jurisdiction in which DerivOpus
              operates, and you irrevocably submit to the exclusive jurisdiction
              of the courts in that location.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
