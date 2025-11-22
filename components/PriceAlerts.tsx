
import React, { useState } from 'react';
import { PriceAlert, LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface PriceAlertsProps {
  currentPrice: number;
  alerts: PriceAlert[];
  addAlert: (price: number) => void;
  removeAlert: (id: string) => void;
  lang: LanguageCode;
}

const PriceAlerts: React.FC<PriceAlertsProps> = ({ currentPrice, alerts, addAlert, removeAlert, lang }) => {
  const [inputValue, setInputValue] = useState('');
  const t = translations[lang];

  const handleAdd = () => {
    const price = parseFloat(inputValue);
    if (!isNaN(price) && price > 0) {
      addAlert(price);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4">
      <h3 className="font-bold text-lg text-gray-300 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
        <span>🔔</span> {t.price_alerts}
      </h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="2350.00"
          className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none placeholder-gray-600"
        />
        <button 
          onClick={handleAdd}
          className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded transition shadow-lg shadow-amber-900/20"
        >
          +
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {alerts.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-2">...</p>
        )}
        {alerts.map(alert => (
          <div key={alert.id} className="flex justify-between items-center bg-slate-800/50 p-2 rounded border border-slate-700 text-sm group hover:bg-slate-800 transition">
            <div className="flex flex-col">
              <span className="font-bold font-mono text-amber-400">{alert.price.toFixed(2)}</span>
              <span className="text-[10px] text-gray-500">
                {alert.condition === 'ABOVE' ? 'High' : 'Low'}
              </span>
            </div>
            <button 
              onClick={() => removeAlert(alert.id)}
              className="text-slate-500 hover:text-red-400 px-2 transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceAlerts;
