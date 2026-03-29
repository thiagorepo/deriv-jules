import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '../../utils/response';
import { createLogger } from '../../utils/logger';

interface OpenTrade {
  tradeId: string;
  symbol: string;
  amount: number;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  openedAt: string;
}

interface OpenTradesResponse {
  trades: OpenTrade[];
  totalPnl: number;
  count: number;
}

export async function GET(request: NextRequest) {
  const logger = createLogger({
    endpoint: '/api/trading/open',
    method: 'GET',
    timestamp: new Date().toISOString(),
  });

  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    logger.info('Fetching open trades', { symbol });

    // TODO: Implement actual database query for open trades
    const trades: OpenTrade[] = [
      {
        tradeId: 'TRADE_OPEN_001',
        symbol: symbol || 'BTC/USD',
        amount: 0.5,
        direction: 'BUY',
        entryPrice: 45000,
        currentPrice: 45500,
        pnl: 250,
        pnlPercent: 0.56,
        stopLoss: 44000,
        takeProfit: 47000,
        openedAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);

    const response: OpenTradesResponse = {
      trades,
      totalPnl,
      count: trades.length,
    };

    return successResponse(response);
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to fetch open trades', err);
    return errorResponse(
      'OPEN_TRADES_ERROR',
      'Failed to fetch open trades',
      500,
    );
  }
}
