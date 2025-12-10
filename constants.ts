import { StockTicker, CandleData } from "./types";

export const STOCK_LIST: StockTicker[] = [
  { symbol: "NIFTY 50", name: "Nifty 50 Index", sector: "Index", lastPrice: 22450.30, change: 0.45 },
  { symbol: "BANKNIFTY", name: "Nifty Bank", sector: "Index", lastPrice: 47800.10, change: -0.12 },
  { symbol: "RELIANCE.NS", name: "Reliance Industries", sector: "Energy", lastPrice: 2980.50, change: 1.2 },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", sector: "Financials", lastPrice: 1450.20, change: -0.5 },
  { symbol: "TCS.NS", name: "Tata Consultancy Svcs", sector: "Technology", lastPrice: 3890.00, change: 0.8 },
  { symbol: "INFY.NS", name: "Infosys Ltd", sector: "Technology", lastPrice: 1620.45, change: 0.3 },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", sector: "Financials", lastPrice: 1080.15, change: 0.1 },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors", sector: "Auto", lastPrice: 980.60, change: 2.1 },
];

// Helper to generate realistic random walk stock data
export const generateMockData = (basePrice: number, periods: number = 100): CandleData[] => {
  let price = basePrice;
  const data: CandleData[] = [];
  const now = new Date();
  
  // Go back 'periods' days (simulated)
  now.setDate(now.getDate() - periods);

  for (let i = 0; i < periods; i++) {
    // Random volatility between -2% and +2%
    const changePercent = (Math.random() - 0.48) * 0.04; 
    const open = price;
    const close = price * (1 + changePercent);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(Math.random() * 1000000) + 500000;

    const dateStr = new Date(now.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    data.push({
      time: dateStr,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });

    price = close;
  }
  return data;
};

// Technical Indicators Calculation Helpers
export const calculateIndicators = (data: CandleData[], fast: number, slow: number, rsiP: number): CandleData[] => {
  const newData = [...data];

  // SMA
  for (let i = 0; i < newData.length; i++) {
    if (i >= fast - 1) {
      const sum = newData.slice(i - fast + 1, i + 1).reduce((a, b) => a + b.close, 0);
      newData[i].smaFast = sum / fast;
    }
    if (i >= slow - 1) {
      const sum = newData.slice(i - slow + 1, i + 1).reduce((a, b) => a + b.close, 0);
      newData[i].smaSlow = sum / slow;
    }
  }

  // RSI
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i < newData.length; i++) {
    const change = newData[i].close - newData[i - 1].close;
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }

    if (i >= rsiP) {
      // Simple RSI calculation for demo (Wilder's smoothing is better but complex for this snippet)
      const avgGain = gains / rsiP;
      const avgLoss = losses / rsiP;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      newData[i].rsi = 100 - (100 / (1 + rs));

      // Rolling window adjustment (simplification)
      const prevChange = newData[i - rsiP + 1].close - newData[i - rsiP].close;
      if (prevChange > 0) gains -= prevChange;
      else losses -= (prevChange * -1);
    }
  }

  return newData;
};