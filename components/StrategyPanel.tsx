import React from 'react';
import { StrategyParams, BacktestResult, TradeSignal } from '../types';
import { Settings, Play, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface StrategyPanelProps {
  params: StrategyParams;
  setParams: (p: StrategyParams) => void;
  onRunBacktest: () => void;
  results: BacktestResult | null;
}

const StrategyPanel: React.FC<StrategyPanelProps> = ({ params, setParams, onRunBacktest, results }) => {
  const handleChange = (key: keyof StrategyParams, value: number) => {
    setParams({ ...params, [key]: value });
  };

  return (
    <div className="bg-nse-panel border border-nse-border rounded-lg h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-nse-border bg-nse-dark/50 flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Settings size={18} className="text-nse-text" />
          Strategy Config
        </h3>
        <button 
          onClick={onRunBacktest}
          className="bg-nse-green hover:bg-green-600 text-black font-bold py-1.5 px-4 rounded text-sm flex items-center gap-2 transition-colors"
        >
          <Play size={14} /> Run Algo
        </button>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
        {/* Moving Averages */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-nse-accent uppercase tracking-wide">SMA Crossover</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fast Period</label>
              <input 
                type="number" 
                value={params.fastPeriod}
                onChange={(e) => handleChange('fastPeriod', parseInt(e.target.value))}
                className="w-full bg-nse-dark border border-nse-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-nse-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Slow Period</label>
              <input 
                type="number" 
                value={params.slowPeriod}
                onChange={(e) => handleChange('slowPeriod', parseInt(e.target.value))}
                className="w-full bg-nse-dark border border-nse-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-nse-accent"
              />
            </div>
          </div>
        </div>

        {/* RSI */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-nse-accent uppercase tracking-wide">RSI Filters</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Period</label>
              <input 
                type="number" 
                value={params.rsiPeriod}
                onChange={(e) => handleChange('rsiPeriod', parseInt(e.target.value))}
                className="w-full bg-nse-dark border border-nse-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-nse-accent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs text-gray-500 mb-1">Overbought</label>
                  <input 
                    type="number" 
                    value={params.rsiOverbought}
                    onChange={(e) => handleChange('rsiOverbought', parseInt(e.target.value))}
                    className="w-full bg-nse-dark border border-nse-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-nse-accent"
                  />
               </div>
               <div>
                  <label className="block text-xs text-gray-500 mb-1">Oversold</label>
                  <input 
                    type="number" 
                    value={params.rsiOversold}
                    onChange={(e) => handleChange('rsiOversold', parseInt(e.target.value))}
                    className="w-full bg-nse-dark border border-nse-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-nse-accent"
                  />
               </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-nse-border">
          <h4 className="text-xs font-semibold text-gray-400 mb-4">BACKTEST RESULTS</h4>
          
          {results ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-nse-dark p-3 rounded border border-nse-border">
                    <p className="text-xs text-gray-500">Net P&L</p>
                    <p className={`text-lg font-mono font-bold ${results.totalPnL >= 0 ? 'text-nse-green' : 'text-nse-red'}`}>
                      {results.totalPnL >= 0 ? '+' : ''}₹{results.totalPnL.toFixed(0)}
                    </p>
                 </div>
                 <div className="bg-nse-dark p-3 rounded border border-nse-border">
                    <p className="text-xs text-gray-500">Win Rate</p>
                    <p className="text-lg font-mono font-bold text-white">
                      {results.winRate.toFixed(1)}%
                    </p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="flex items-center gap-2">
                    <Activity size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-300">Trades: {results.totalTrades}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <TrendingDown size={14} className="text-nse-red" />
                    <span className="text-sm text-gray-300">DD: {results.maxDrawdown.toFixed(1)}%</span>
                 </div>
              </div>

              {/* Trade Log */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Recent Signals</p>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {results.trades.slice().reverse().slice(0, 5).map((t) => (
                    <div key={t.id} className="flex justify-between items-center text-xs p-2 bg-nse-dark rounded border border-nse-border/50">
                      <span className={t.type === 'BUY' ? 'text-nse-green' : 'text-nse-red font-bold'}>{t.type}</span>
                      <span className="text-gray-400">@ ₹{t.price}</span>
                      <span className="text-gray-600 font-mono text-[10px]">{t.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
             <div className="text-center py-8 text-gray-600 text-sm">
               Press "Run Algo" to execute strategy
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyPanel;