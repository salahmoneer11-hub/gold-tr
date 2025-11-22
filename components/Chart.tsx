
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Customized } from 'recharts';
import { Candle, ChartType } from '../types';

interface ChartProps {
  data: Candle[];
  type: ChartType;
}

// A robust Custom Component to render Candles that safely accesses axis scales
const CandleStickLayer = (props: any) => {
  const { data, xAxis, yAxis, width } = props;

  // CRITICAL FIX: Explicitly check for scales availability. 
  // Recharts can sometimes render this component before scales are fully calculated.
  if (!xAxis || !yAxis || !xAxis.scale || !yAxis.scale || !data || data.length === 0) return null;

  const xScale = xAxis.scale;
  const yScale = yAxis.scale;
  
  // Calculate dynamic bandwidth for candles
  let bandwidth = 10;
  try {
      if (xScale.bandwidth) {
          // If using a categorical axis (BandScale)
          bandwidth = xScale.bandwidth();
      } else {
          // Estimate bandwidth for time/linear axis
          bandwidth = width / data.length * 0.7;
      }
  } catch (e) {
      return null;
  }
  
  // Clamp bandwidth for better visuals
  bandwidth = Math.max(Math.min(bandwidth, 15), 4);
  const halfBand = bandwidth / 2;

  return (
    <g>
      {data.map((entry: Candle, index: number) => {
         // Safely calculate X position
         let x = xScale(entry.time);
         
         // If using BandScale, center the candle
         if (xScale.bandwidth) {
             x = x + (xScale.bandwidth() - bandwidth) / 2;
         }

         // Skip if coordinates are invalid
         if (x === undefined || x === null || isNaN(x)) return null;

         const open = yScale(entry.open);
         const close = yScale(entry.close);
         const high = yScale(entry.high);
         const low = yScale(entry.low);

         if (isNaN(open) || isNaN(close) || isNaN(high) || isNaN(low)) return null;
         
         const isUp = entry.close >= entry.open;
         const color = isUp ? '#22c55e' : '#ef4444';
         
         const bodyTop = Math.min(open, close);
         const bodyHeight = Math.max(Math.abs(open - close), 1); // Ensure at least 1px visibility

         return (
            <g key={`candle-${index}`}>
              {/* Wick (High to Low) */}
              <line 
                x1={x + halfBand} 
                y1={high} 
                x2={x + halfBand} 
                y2={low} 
                stroke={color} 
                strokeWidth={1} 
              />
              {/* Body (Open to Close) */}
              <rect 
                x={x} 
                y={bodyTop} 
                width={bandwidth} 
                height={bodyHeight} 
                fill={color} 
                stroke="none"
              />
            </g>
         );
      })}
    </g>
  );
};

const Chart: React.FC<ChartProps> = ({ data, type }) => {
  if (type === 'CANDLE') {
    return (
      <div className="w-full h-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
             <defs>
                <linearGradient id="colorCandle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              tick={{fontSize: 10}}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              orientation="right" 
              stroke="#94a3b8"
              tick={{fontSize: 11}}
              tickFormatter={(value) => value.toFixed(2)}
              scale="linear" 
              width={60}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f8fafc' }}
              cursor={{stroke: 'rgba(255,255,255,0.1)'}}
              labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
              formatter={(value: any, name: string, props: any) => {
                  if (name === 'close') return [value, 'Price'];
                  return [value, name];
              }}
            />
            {/* We pass the data explicitly to the Customized component */}
            <Customized component={CandleStickLayer} data={data} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8" 
            tick={{fontSize: 10}}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            orientation="right" 
            stroke="#94a3b8"
            tick={{fontSize: 11}}
            tickFormatter={(value) => value.toFixed(2)}
            width={60}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fbbf24' }}
            itemStyle={{ color: '#fbbf24' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Area 
            type="monotone" 
            dataKey="close" 
            stroke="#fbbf24" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorGold)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
