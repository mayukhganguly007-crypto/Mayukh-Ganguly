import React, { useState, useEffect, useCallback } from 'react';
import Watchlist from './components/Watchlist';
import StockChart from './components/StockChart';
import StrategyPanel from './components/StrategyPanel';
import { STOCK_LIST, generateMockData, calculateIndicators } from './constants';
import { StockTicker, CandleData, StrategyParams, BacktestResult, TradeSignal } from './types';
import { getMarketAnalysis } from './services/geminiService';
import { Sparkles, BarChart2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeStock, setActiveStock] = useState<StockTicker>(STOCK_LIST[0]);
  const [marketData, setMarketData] = useState<CandleData[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Strategy State
  const [strategyParams, setStrategyParams] = useState<StrategyParams>({
    fastPeriod: 9,
    slowPeriod: 21,
    rsiPeriod: 14,
    rsiOverbought: 70,
    rsiOversold: 30,
    capital: 100000
  });
  
  const [backtestResults, setBacktestResults] = useState<BacktestResult | null>(null);
  const [chartSignals, setChartSignals] = useState<TradeSignal[]>([]);

  // Initialize Data on Stock Change
  useEffect(() => {
    // Simulate fetching new data
    const rawData = generateMockData(activeStock.lastPrice, 150);
    // Initial Calc with default indicators
    const processedData = calculateIndicators(rawData, strategyParams.fastPeriod, strategyParams.slowPeriod, strategyParams.rsiPeriod);
    setMarketData(processedData);
    setBacktestResults(null);
    setChartSignals([]);
    setAnalysis(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStock]);

  const runBacktest = useCallback(() => {
    if (marketData.length === 0) return;

    // Recalculate indicators based on current params
    const processedData = calculateIndicators(
      marketData.map(d => ({...d, smaFast: undefined, smaSlow: undefined, rsi: undefined})), // reset
      strategyParams.fastPeriod, 
      strategyParams.slowPeriod, 
      strategyParams.rsiPeriod
    );
    
    // Update chart with new indicator lines
    setMarketData(processedData);

    const trades: TradeSignal[] = [];
    let position: 'NONE' | 'LONG' = 'NONE';
    let entryPrice = 0;
    let cash = strategyParams.capital;
    let shares = 0;
    let wins = 0;
    let totalTradesCount = 0;
    let maxDD = 0;
    let peakCapital = cash;

    // Simple SMA Crossover + RSI Filter Strategy logic
    for (let i = Math.max(strategyParams.slowPeriod, strategyParams.rsiPeriod); i < processedData.length; i++) {
      const cur = processedData[i];
      const prev = processedData[i-1];
      
      if (!cur.smaFast || !cur.smaSlow || !prev.smaFast || !prev.smaSlow || !cur.rsi) continue;

      const crossoverBullish = prev.smaFast <= prev.smaSlow && cur.smaFast > cur.smaSlow;
      const crossoverBearish = prev.smaFast >= prev.smaSlow && cur.smaFast < cur.smaSlow;
      
      // BUY CONDITION: SMA Crossover AND RSI not overbought
      if (position === 'NONE' && crossoverBullish && cur.rsi < strategyParams.rsiOverbought) {
        position = 'LONG';
        entryPrice = cur.close;
        // Buy max shares
        shares = Math.floor(cash / cur.close);
        cash -= shares * cur.close;
        
        trades.push({
          id: `trade-${i}-buy`,
          type: 'BUY',
          price: cur.close,
          time: cur.time,
          reason: `SMA Cross & RSI ${cur.rsi.toFixed(0)}`
        });
      }
      
      // SELL CONDITION: SMA Crossover OR RSI Oversold (Panic sell) - Keeping it simple
      else if (position === 'LONG') {
         if (crossoverBearish || cur.rsi > strategyParams.rsiOverbought) {
            position = 'NONE';
            const exitPrice = cur.close;
            const proceed = shares * exitPrice;
            const pnl = proceed - (shares * entryPrice);
            cash += proceed;
            
            if (pnl > 0) wins++;
            totalTradesCount++;
            
            trades.push({
              id: `trade-${i}-sell`,
              type: 'SELL',
              price: cur.close,
              time: cur.time,
              reason: crossoverBearish ? 'SMA Cross' : 'RSI Overbought',
              pnl
            });
            shares = 0;
         }
      }

      // Track DD
      const currentVal = cash + (shares * cur.close);
      if (currentVal > peakCapital) peakCapital = currentVal;
      const dd = ((peakCapital - currentVal) / peakCapital) * 100;
      if (dd > maxDD) maxDD = dd;
    }

    const finalVal = cash + (shares * processedData[processedData.length - 1].close);
    
    setBacktestResults({
      totalTrades: totalTradesCount,
      winRate: totalTradesCount > 0 ? (wins / totalTradesCount) * 100 : 0,
      totalPnL: finalVal - strategyParams.capital,
      maxDrawdown: maxDD,
      trades: trades
    });
    
    setChartSignals(trades);
  }, [marketData, strategyParams]);

  const handleAIAnalysis = async () => {
    if (!backtestResults) {
      alert("Please run the backtest strategy first to provide data for the AI.");
      return;
    }
    setIsAnalyzing(true);
    const result = await getMarketAnalysis(activeStock.symbol, marketData, strategyParams, backtestResults);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex h-screen bg-nse-dark text-nse-text font-sans overflow-hidden">
      {/* Sidebar */}
      <Watchlist 
        stocks={STOCK_LIST} 
        selectedSymbol={activeStock.symbol} 
        onSelect={(sym) => {
          const stock = STOCK_LIST.find(s => s.symbol === sym);
          if (stock) setActiveStock(stock);
        }} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Area - could be expanded */}
        
        <div className="flex-1 p-3 grid grid-cols-12 gap-3 min-h-0">
           {/* Chart Area */}
           <div className="col-span-12 lg:col-span-9 flex flex-col gap-3 min-h-0">
              <div className="flex-1 min-h-0">
                <StockChart 
                  symbol={activeStock.symbol} 
                  data={marketData} 
                  signals={chartSignals} 
                />
              </div>
              
              {/* AI Analysis Panel */}
              <div className="h-48 bg-nse-panel border border-nse-border rounded-lg p-4 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-white flex items-center gap-2">
                     <Sparkles size={16} className="text-purple-400" /> 
                     AI Market Analyst (Gemini 2.5)
                   </h3>
                   {!analysis && (
                     <button 
                       onClick={handleAIAnalysis}
                       disabled={isAnalyzing}
                       className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                     >
                       {isAnalyzing ? 'Analyzing...' : 'Generate Insights'}
                     </button>
                   )}
                </div>
                
                <div className="flex-1 overflow-y-auto text-sm leading-relaxed text-gray-300 pr-2 custom-scrollbar">
                  {analysis ? (
                     <div className="prose prose-invert prose-sm max-w-none">
                       <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                       <button onClick={() => setAnalysis(null)} className="mt-4 text-xs text-purple-400 hover:text-purple-300 underline">Refresh Analysis</button>
                     </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-600 italic">
                      {isAnalyzing ? (
                        <span className="animate-pulse">Consulting advanced models...</span>
                      ) : (
                        "Run the Algo strategy above, then click 'Generate Insights' to get an AI breakdown of the setup."
                      )}
                    </div>
                  )}
                </div>
              </div>
           </div>

           {/* Right Strategy Panel */}
           <div className="col-span-12 lg:col-span-3 min-h-0">
              <StrategyPanel 
                params={strategyParams} 
                setParams={setStrategyParams} 
                onRunBacktest={runBacktest}
                results={backtestResults}
              />
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;