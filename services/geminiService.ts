import { GoogleGenAI } from "@google/genai";
import { CandleData, StrategyParams, BacktestResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMarketAnalysis = async (
  symbol: string,
  data: CandleData[],
  strategy: StrategyParams,
  results: BacktestResult
) => {
  try {
    // Summarize data to avoid token limits, take last 20 candles
    const recentData = data.slice(-20);
    const currentPrice = data[data.length - 1].close;
    
    const prompt = `
      You are an expert algorithmic trading analyst for the Indian Stock Market (NSE).
      Analyze the following stock data for ${symbol}.
      
      Current Price: ₹${currentPrice.toFixed(2)}
      
      Strategy Configuration:
      - Fast SMA: ${strategy.fastPeriod}
      - Slow SMA: ${strategy.slowPeriod}
      - RSI Period: ${strategy.rsiPeriod} (OB: ${strategy.rsiOverbought}, OS: ${strategy.rsiOversold})
      
      Backtest Performance Summary:
      - Total Return: ₹${results.totalPnL.toFixed(2)}
      - Win Rate: ${results.winRate.toFixed(1)}%
      - Trades Executed: ${results.totalTrades}
      
      Recent Market Data (Last 20 candles):
      ${JSON.stringify(recentData.map(c => ({ 
        t: c.time, 
        c: c.close, 
        vol: c.volume, 
        rsi: c.rsi?.toFixed(1),
        smaF: c.smaFast?.toFixed(1),
        smaS: c.smaSlow?.toFixed(1)
      })))}
      
      Provide a concise, professional analysis in 3 bullet points:
      1. Trend Assessment (Bullish/Bearish/Neutral based on SMA and Price Action).
      2. Momentum Analysis (RSI context).
      3. Strategy Critique (Is the current strategy working well for this volatility?).
      
      Use Indian market terminology where appropriate. Keep it under 200 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a professional NSE/BSE technical analyst. Be concise, data-driven, and objective.",
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Analysis unavailable at the moment. Please check your API connection.";
  }
};