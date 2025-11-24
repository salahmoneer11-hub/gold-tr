
import React from 'react';
import { TradingMode, LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface BotControlProps {
  isRunning: boolean;
  onToggle: () => void;
  lotSize: number;
  setLotSize: (size: number) => void;
  tradingMode: TradingMode;
  setTradingMode: (mode: TradingMode) => void;
  lang: LanguageCode;
}

const BotControl: React.FC<BotControlProps> = ({ 
  isRunning, 
  onToggle, 
  lotSize,
  setLotSize,
  tradingMode,
  setTradingMode,
  lang
}) => {
  const t = translations[lang];

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-5 relative z-30 border-t-4 border-amber-500/50 shadow-lg">
      
      {/* Power Button */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onToggle}
          className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300
            ${isRunning 
              ? 'bg-green-500 shadow-[0_0_20px_theme(colors.green.500),inset_0_0_10px_rgba(255,255,255,0.3)] border-4 border-green-300' 
              : 'bg-slate-700 shadow-[inset_0_5px_10px_rgba(0,0,0,0.5)] border-4 border-slate-600'
            }`}
        >
          <span className="font-black text-5xl text-white drop-shadow-lg">
            {isRunning ? '||' : '▶'}
          </span>
        </button>
        <div className="text-center">
            <h2 className="text-lg font-bold text-gray-200 tracking-wide uppercase">{t.bot_status}</h2>
            <div className={`font-mono font-bold text-xs ${isRunning ? 'text-green-400' : 'text-slate-400'}`}>
              {isRunning ? t.status_active : t.status_stopped}
            </div>
        </div>
      </div>
      
      {/* Settings Section */}
      <div className="space-y-4 pt-4 border-t border-slate-700/50">
        
        {/* Lot Size */}
        <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.lot_size}</label>
            <div className="relative">
                <input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    max="200.00"
                    value={lotSize}
                    onChange={(e) => setLotSize(Math.max(0.01, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono text-lg text-center"
                />
            </div>
        </div>

        {/* Trading Mode */}
        <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.trading_mode}</label>
            <div className="bg-slate-900 p-1 rounded-xl grid grid-cols-3 gap-1">
                {(['SCALPING', 'SWING', 'SAFE'] as TradingMode[]).map((m) => (
                <button
                    key={m}
                    onClick={() => setTradingMode(m)}
                    className={`py-2 px-1 rounded-lg text-xs font-bold transition-all duration-200
                    ${tradingMode === m 
                        ? 'bg-amber-500 text-slate-900 shadow-md' 
                        : 'text-gray-400 hover:bg-slate-700/50'
                    }`}
                >
                    {m === 'SCALPING' && t.mode_scalping}
                    {m === 'SWING' && t.mode_swing}
                    {m === 'SAFE' && t.mode_safe}
                </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BotControl;
