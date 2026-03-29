import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trading | DerivOpus',
  description: 'Trading interface',
};

export default function TradingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trading Interface</h1>
        <p className="mt-2 text-gray-600">
          Execute trades and manage positions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart placeholder */}
        <div className="col-span-1 lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Price Chart</h2>
          <div className="mt-6 flex h-96 items-center justify-center bg-gray-50">
            <p className="text-gray-500">Chart visualization</p>
          </div>
        </div>

        {/* Order panel */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Place Order</h2>
          <form className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Symbol
              </label>
              <select className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900">
                <option>EUR/USD</option>
                <option>GBP/USD</option>
                <option>USD/JPY</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Type</label>
              <select className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900">
                <option>Market</option>
                <option>Limit</option>
                <option>Stop</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">
                Amount
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Place Order
            </button>
          </form>
        </div>
      </div>

      {/* Open Positions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Open Positions</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm text-gray-900">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 text-left font-medium">Symbol</th>
                <th className="py-2 text-left font-medium">Type</th>
                <th className="py-2 text-right font-medium">Size</th>
                <th className="py-2 text-right font-medium">Entry</th>
                <th className="py-2 text-right font-medium">Current</th>
                <th className="py-2 text-right font-medium">P&L</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2].map((i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3">EUR/USD</td>
                  <td className="py-3">Buy</td>
                  <td className="py-3 text-right">1.00</td>
                  <td className="py-3 text-right">1.0850</td>
                  <td className="py-3 text-right">1.0865</td>
                  <td className="py-3 text-right text-green-600">+$150.00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
