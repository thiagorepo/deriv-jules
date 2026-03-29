import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '../../utils/response';
import { createLogger } from '../../utils/logger';

interface Trade {
  tradeId: string;
  symbol: string;
  amount: number;
  direction: 'BUY' | 'SELL';
  openPrice: number;
  closePrice?: number;
  pnl?: number;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  closedAt?: string;
}

interface TradeHistoryResponse {
  trades: Trade[];
  total: number;
  page: number;
  pageSize: number;
}

export async function GET(request: NextRequest) {
  const logger = createLogger({
    endpoint: '/api/trading/history',
    method: 'GET',
    timestamp: new Date().toISOString(),
  });

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const symbol = searchParams.get('symbol');

    if (page < 1 || pageSize < 1 || pageSize > 100) {
      logger.warn('Invalid pagination params', { page, pageSize });
      return errorResponse(
        'INVALID_PAGINATION',
        'Page must be >= 1, pageSize must be between 1 and 100',
        400,
      );
    }

    logger.info('Fetching trade history', { page, pageSize, symbol });

    // TODO: Implement actual database query for trade history
    const trades: Trade[] = [
      {
        tradeId: 'TRADE_001',
        symbol: symbol || 'EUR/USD',
        amount: 1000,
        direction: 'BUY',
        openPrice: 1.105,
        closePrice: 1.1075,
        pnl: 250,
        status: 'CLOSED',
        openedAt: new Date(Date.now() - 3600000).toISOString(),
        closedAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ];

    const response: TradeHistoryResponse = {
      trades,
      total: trades.length,
      page,
      pageSize,
    };

    return successResponse(response);
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to fetch trade history', err);
    return errorResponse(
      'HISTORY_FETCH_ERROR',
      'Failed to fetch trade history',
      500,
    );
  }
}
