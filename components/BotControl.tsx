
import React, { useState } from 'react';
import { TradingMode, LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface BotControlProps {
  isRunning: boolean;
  onToggle: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  lotSize: number;
  setLotSize: (size: number) => void;
  avoidNews: boolean;
  setAvoidNews: (avoid: boolean) => void;
  tradingMode: TradingMode;
  setTradingMode: (mode: TradingMode) => void;
  lang: LanguageCode;
}

const BotControl: React.FC<BotControlProps> = ({ 
  isRunning, 
  onToggle, 
  apiKey, 
  setApiKey,
  lotSize,
  setLotSize,
  avoidNews,
  setAvoidNews,
  tradingMode,
  setTradingMode,
  lang
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const t = translations[lang];

  return (
    <div className="glass-panel p-4 rounded-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className={`w-4 h-4 rounded-full animate-pulse ${isRunning ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
        <div>
          <h2 className="text-lg font-bold text-white">{t.market_status}: {isRunning ? t.status_active : t.status_stopped}</h2>
          <p className="text-xs text-gray-400">MT5: {isRunning ? t.status_active : t.status_stopped}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition border border-slate-600"
        >
          ⚙️ {t.settings}
        </button>
        <button 
          onClick={onToggle}
          className={`px-6 py-2 rounded-lg font-bold text-white transition shadow-lg ${
            isRunning 
            ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' 
            : 'bg-green-600 hover:bg-green-700 shadow-green-900/20'
          }`}
        >
          {isRunning ? t.stop_bot : t.start_bot}
        </button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-800 p-6 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl animate-fadeIn relative">
            {/* Close Button */}
            <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
                ✕
            </button>

            <h3 className="text-xl font-bold text-amber-400 mb-4">{t.settings}</h3>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">{t.trading_mode}</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {(['REGULAR', 'SAFE', 'ULTRA_SAFE'] as TradingMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setTradingMode(m)}
                    className={`px-2 py-2 rounded-lg text-xs font-bold border transition ${
                      tradingMode === m 
                        ? 'bg-amber-500 text-black border-amber-500' 
                        : 'bg-slate-900 text-gray-400 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {m === 'REGULAR' && t.mode_regular}
                    {m === 'SAFE' && t.mode_safe}
                    {m === 'ULTRA_SAFE' && t.mode_ultra}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">{t.lot_size}</label>
              <input 
                type="number" 
                step="0.01"
                min="0.01"
                value={lotSize}
                onChange={(e) => setLotSize(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                placeholder="1.0"
              />
            </div>

            <div className="mb-5 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-bold text-white">{t.news_filter}</label>
                </div>
                <button 
                  onClick={() => setAvoidNews(!avoidNews)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${avoidNews ? 'bg-green-500' : 'bg-slate-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${avoidNews ? 'translate-x-1' : 'translate-x-6'}`} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Google Gemini {t.api_key}</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="API Key..."
              />
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotControl;
