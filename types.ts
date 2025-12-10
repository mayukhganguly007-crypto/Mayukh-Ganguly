export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  smaFast?: number;
  smaSlow?: number;
  rsi?: number;
}

export interface StockTicker {
  symbol: string;
  name: string;
  sector: string;
  lastPrice: number;
  change: number;
}

export interface StrategyParams {
  fastPeriod: number;
  slowPeriod: number;
  rsiPeriod: number;
  rsiOverbought: number;
  rsiOversold: number;
  capital: number;
}

export interface TradeSignal {
  id: string;
  type: 'BUY' | 'SELL';
  price: number;
  time: string;
  reason: string;
  pnl?: number; // Realized PnL for sell signals
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  maxDrawdown: number;
  trades: TradeSignal[];
}