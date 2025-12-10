import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { CandleData, TradeSignal } from '../types';

interface StockChartProps {
  data: CandleData[];
  signals: TradeSignal[];
  symbol: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-nse-panel border border-nse-border p-3 rounded shadow-xl font-mono text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="text-white">Close: <span className="text-nse-green">₹{data.close}</span></p>
        <p className="text-gray-400">Open: ₹{data.open}</p>
        <p className="text-gray-400">High: ₹{data.high}</p>
        <p className="text-gray-400">Low:  ₹{data.low}</p>
        <p className="text-nse-accent mt-1">SMA(F): {data.smaFast?.toFixed(2) || 'N/A'}</p>
        <p className="text-purple-400">SMA(S): {data.smaSlow?.toFixed(2) || 'N/A'}</p>
        <p className="text-orange-400">RSI: {data.rsi?.toFixed(1) || 'N/A'}</p>
      </div>
    );
  }
  return null;
};

const StockChart: React.FC<StockChartProps> = ({ data, signals, symbol }) => {
  return (
    <div className="h-full w-full flex flex-col bg-nse-panel rounded-lg border border-nse-border overflow-hidden">
      <div className="p-4 border-b border-nse-border flex justify-between items-center bg-nse-dark/50">
        <div>
          <h2 className="text-lg font-bold text-white">{symbol}</h2>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Technical Chart (1D)</span>
        </div>
        <div className="flex space-x-4 text-xs">
           <div className="flex items-center"><div className="w-3 h-3 bg-nse-green rounded-sm mr-2"></div>Price</div>
           <div className="flex items-center"><div className="w-3 h-3 bg-nse-accent rounded-sm mr-2"></div>Fast SMA</div>
           <div className="flex items-center"><div className="w-3 h-3 bg-purple-500 rounded-sm mr-2"></div>Slow SMA</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#30363D" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#30363D" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: '#8b949e' }} 
              minTickGap={30}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              yAxisId="left" 
              orientation="right" 
              domain={['auto', 'auto']} 
              tick={{ fontSize: 10, fill: '#8b949e' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `₹${val}`}
            />
            <YAxis 
              yAxisId="right" 
              orientation="left" 
              tick={false} 
              axisLine={false} 
              width={0}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Volume Bar */}
            <Bar dataKey="volume" yAxisId="right" fill="url(#colorVolume)" barSize={20} opacity={0.5} />

            {/* Price Line (Using Line for simplicity in this demo, though Candles are preferred in real algo apps) */}
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="close" 
              stroke="#00D09C" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 4, fill: '#fff' }}
            />

            {/* Moving Averages */}
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="smaFast" 
              stroke="#58A6FF" 
              strokeWidth={1.5} 
              dot={false} 
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="smaSlow" 
              stroke="#a855f7" 
              strokeWidth={1.5} 
              dot={false} 
            />

            {/* Trade Signals Markers */}
            {signals.map((sig, idx) => (
              <ReferenceLine
                key={sig.id}
                yAxisId="left"
                x={sig.time}
                stroke={sig.type === 'BUY' ? '#00D09C' : '#EB5B3C'}
                strokeDasharray="3 3"
                label={{
                  position: 'top',
                  value: sig.type === 'BUY' ? 'B' : 'S',
                  fill: sig.type === 'BUY' ? '#00D09C' : '#EB5B3C',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* RSI Sub-chart */}
      <div className="h-32 border-t border-nse-border p-2">
         <ResponsiveContainer width="100%" height="100%">
           <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
              <YAxis 
                orientation="right" 
                domain={[0, 100]} 
                ticks={[30, 70]} 
                tick={{ fontSize: 9, fill: '#8b949e' }}
                axisLine={false}
                tickLine={false}
              />
              <XAxis dataKey="time" hide />
              <ReferenceLine y={70} stroke="#EB5B3C" strokeDasharray="3 3" opacity={0.5} />
              <ReferenceLine y={30} stroke="#00D09C" strokeDasharray="3 3" opacity={0.5} />
              <Line type="monotone" dataKey="rsi" stroke="#fb923c" strokeWidth={1} dot={false} />
           </ComposedChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;