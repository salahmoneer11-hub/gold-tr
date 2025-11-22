import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Candle } from '../types';

interface ChartProps {
  data: Candle[];
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8" 
            tick={{fontSize: 12}}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={['auto', 'auto']} 
            orientation="right" 
            stroke="#94a3b8"
            tick={{fontSize: 12}}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fbbf24' }}
            itemStyle={{ color: '#fbbf24' }}
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