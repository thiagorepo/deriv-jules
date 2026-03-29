import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wallet | DerivOpus',
  description: 'Wallet and billing management',
};

export default function WalletPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallet & Billing</h1>
        <p className="mt-2 text-gray-600">
          Manage your funds and payment methods
        </p>
      </div>

      {/* Balance Overview */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Account Balance</h2>
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Balance</span>
            <span className="text-2xl font-bold text-gray-900">$10,234.56</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Available</span>
            <span className="font-semibold text-gray-900">$8,234.56</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">In Positions</span>
            <span className="font-semibold text-gray-900">$2,000.00</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <button className="rounded-lg border border-blue-200 bg-blue-50 px-6 py-4 font-semibold text-blue-900 hover:bg-blue-100">
          + Deposit
        </button>
        <button className="rounded-lg border border-gray-200 bg-white px-6 py-4 font-semibold text-gray-900 hover:bg-gray-50">
          Withdraw
        </button>
      </div>

      {/* Payment Methods */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Methods
          </h2>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            + Add Method
          </button>
        </div>
        <div className="mt-6 space-y-4">
          {[
            { type: 'Visa', last4: '4242', exp: '12/25' },
            { type: 'Bank Account', last4: '6789', exp: 'Active' },
          ].map((method) => (
            <div
              key={method.last4}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
            >
              <div>
                <p className="font-medium text-gray-900">{method.type}</p>
                <p className="text-sm text-gray-600">•••• {method.last4}</p>
              </div>
              <p className="text-sm text-gray-600">{method.exp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Transaction History
        </h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm text-gray-900">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 text-left font-medium">Date</th>
                <th className="py-2 text-left font-medium">Type</th>
                <th className="py-2 text-right font-medium">Amount</th>
                <th className="py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3">2024-03-{20 + i}</td>
                  <td className="py-3">Deposit</td>
                  <td className="py-3 text-right font-semibold">+$500.00</td>
                  <td className="py-3 text-green-600">Completed</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
