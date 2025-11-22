
import React from 'react';
import { LanguageCode, UserSubscription } from '../types';
import { translations } from '../utils/translations';

interface SubscriptionManagementProps {
  subscription: UserSubscription;
  onRenew: () => void;
  onCancel: () => void;
  onClose: () => void;
  lang: LanguageCode;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ subscription, onRenew, onCancel, onClose, lang }) => {
  const t = translations[lang];
  
  const now = Date.now();
  const remainingMs = subscription.expiryDate - now;
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  const isExpired = remainingDays <= 0;

  return (
    <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-800 p-6 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl animate-fadeIn relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
            ✕
        </button>

        <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-2">{t.manage_sub}</h3>
        
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">{t.select_plan}:</span>
                <span className="text-amber-400 font-bold uppercase">{subscription.planId}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">{t.market_status}:</span>
                <span className={`font-bold ${!isExpired ? 'text-green-400' : 'text-red-400'}`}>
                    {!isExpired ? t.sub_active : t.sub_expired}
                </span>
            </div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mb-6 text-center">
            <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">{t.remaining_days}</span>
            <span className={`text-4xl font-bold ${remainingDays < 3 ? 'text-red-500' : 'text-white'}`}>
                {remainingDays > 0 ? remainingDays : 0}
            </span>
        </div>

        <div className="space-y-3">
            <button 
                onClick={onRenew}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold rounded-xl transition shadow-lg shadow-amber-900/20"
            >
                {t.renew_now}
            </button>
            
            <button 
                onClick={onCancel}
                className="w-full py-3 bg-slate-700 hover:bg-red-900/50 text-gray-300 hover:text-red-400 border border-slate-600 hover:border-red-700 font-bold rounded-xl transition"
            >
                {t.cancel_sub}
            </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
