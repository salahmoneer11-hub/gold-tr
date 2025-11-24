
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
    <div className="glass-panel p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:bg-slate-800/40 transition-all duration-300 border border-slate-700/50 hover:border-amber-500/30">
      
      {/* Background Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{title}</span>
        {icon && <span className="text-xl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 grayscale group-hover:grayscale-0">{icon}</span>}
      </div>
      
      <div className="relative z-10 mt-1">
        <div className={`text-2xl font-bold font-mono tracking-tight ${color} drop-shadow-sm`}>
            {value}
        </div>
        {subValue && (
            <div className="text-[10px] text-slate-500 font-medium mt-1 border-t border-slate-700/50 pt-1">
                {subValue}
            </div>
        )}
      </div>
      
      {/* Glow orb */}
      <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors duration-500"></div>
    </div>
  );
};

export default MetricCard;
