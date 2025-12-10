import React from 'react';
import { StockTicker } from '../types';

interface WatchlistProps {
  stocks: StockTicker[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

const Watchlist: React.FC<WatchlistProps> = ({ stocks, selectedSymbol, onSelect }) => {
  return (
    <div className="bg-nse-panel border-r border-nse-border w-64 flex flex-col h-full">
      <div className="p-4 border-b border-nse-border bg-nse-dark/50">
        <h1 className="text-xl font-bold text-white tracking-tight">IndiAlgo<span className="text-nse-green">Trade</span></h1>
        <p className="text-xs text-gray-500 mt-1">NSE Real-time Simulator</p>
      </div>
      
      <div className="overflow-y-auto flex-1">
        <div className="p-2 space-y-1">
          {stocks.map((stock) => (
            <div 
              key={stock.symbol}
              onClick={() => onSelect(stock.symbol)}
              className={`p-3 rounded-md cursor-pointer transition-all ${
                selectedSymbol === stock.symbol 
                  ? 'bg-[#21262d] border-l-4 border-nse-green' 
                  : 'hover:bg-[#21262d] border-l-4 border-transparent'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-white">{stock.symbol}</span>
                <span className={`text-xs font-mono ${stock.change >= 0 ? 'text-nse-green' : 'text-nse-red'}`}>
                  {stock.change > 0 ? '+' : ''}{stock.change}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 truncate max-w-[100px]">{stock.name}</span>
                <span className="text-xs font-medium text-gray-300">₹{stock.lastPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-nse-border text-[10px] text-gray-600 text-center">
        Market data is simulated for demo purposes.
      </div>
    </div>
  );
};

export default Watchlist;