import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  color?: string;
  icon?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subValue, color = "text-white", icon }) => {
  return (
    <div className="glass-panel p-4 rounded-xl flex flex-col relative overflow-hidden group hover:bg-slate-800/50 transition">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        {icon && <span className="text-2xl opacity-50 group-hover:opacity-100 transition">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}
      </div>
      {subValue && <div className="text-xs text-gray-500 mt-1">{subValue}</div>}
      
      {/* Decorative glow */}
      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
    </div>
  );
};

export default MetricCard;