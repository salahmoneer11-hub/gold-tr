
import React, { useState } from 'react';
import { Asset, LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface AssetSelectorProps {
  selectedAsset: Asset;
  onSelectAsset: (asset: Asset) => void;
  lang: LanguageCode;
}

const assets: Asset[] = [
  { symbol: 'XAUUSD', name: 'Gold (Spot)', category: 'COMMODITY', basePrice: 2350.00, icon: '🟡' },
  { symbol: 'BTCUSDT', name: 'Bitcoin Futures', category: 'CRYPTO', basePrice: 64200.00, icon: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum Futures', category: 'CRYPTO', basePrice: 3450.00, icon: 'Ξ' },
  { symbol: 'SOLUSDT', name: 'Solana Futures', category: 'CRYPTO', basePrice: 145.00, icon: '◎' },
  { symbol: 'BNBUSDT', name: 'BNB Futures', category: 'CRYPTO', basePrice: 590.00, icon: '🔶' },
  { symbol: 'XRPUSDT', name: 'XRP Futures', category: 'CRYPTO', basePrice: 0.60, icon: '✕' },
  { symbol: 'ADAUSDT', name: 'Cardano Futures', category: 'CRYPTO', basePrice: 0.45, icon: '₳' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin Futures', category: 'CRYPTO', basePrice: 0.16, icon: '🐶' },
];

const AssetSelector: React.FC<AssetSelectorProps> = ({ selectedAsset, onSelectAsset, lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[lang];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (asset: Asset) => {
    onSelectAsset(asset);
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
      <button 
        onClick={toggleDropdown}
        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg transition min-w-[160px] justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{selectedAsset.icon}</span>
          <div className="flex flex-col items-start leading-none">
            <span className="font-bold text-sm">{selectedAsset.symbol}</span>
            <span className="text-[10px] text-gray-400">{selectedAsset.category === 'CRYPTO' ? 'Binance Fut' : 'Spot Market'}</span>
          </div>
        </div>
        <span className="text-xs text-gray-500">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
          <div className="p-2 bg-slate-900/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
             {t.select_asset}
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {/* Commodities Group */}
            <div className="px-3 py-1.5 text-[10px] text-amber-500 font-bold bg-slate-900/30">{t.category_commodity}</div>
            {assets.filter(a => a.category === 'COMMODITY').map(asset => (
              <button
                key={asset.symbol}
                onClick={() => handleSelect(asset)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition border-b border-slate-700/50 last:border-0
                  ${selectedAsset.symbol === asset.symbol ? 'bg-slate-700/80 border-l-4 border-l-amber-500' : ''}
                `}
              >
                <span className="text-xl">{asset.icon}</span>
                <div className="text-left">
                   <div className="font-bold text-gray-200 text-sm">{asset.name}</div>
                   <div className="text-xs text-gray-500">{asset.symbol}</div>
                </div>
              </button>
            ))}

            {/* Crypto Group */}
            <div className="px-3 py-1.5 text-[10px] text-blue-400 font-bold bg-slate-900/30">{t.category_crypto}</div>
            {assets.filter(a => a.category === 'CRYPTO').map(asset => (
              <button
                key={asset.symbol}
                onClick={() => handleSelect(asset)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition border-b border-slate-700/50 last:border-0
                  ${selectedAsset.symbol === asset.symbol ? 'bg-slate-700/80 border-l-4 border-l-blue-500' : ''}
                `}
              >
                <span className="text-xl">{asset.icon}</span>
                <div className="text-left">
                   <div className="font-bold text-gray-200 text-sm">{asset.name}</div>
                   <div className="text-xs text-gray-500">{asset.symbol}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetSelector;
