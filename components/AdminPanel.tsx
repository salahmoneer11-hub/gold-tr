
import React from 'react';
import { SignalType, LanguageCode, VisitorLog } from '../types';
import { translations } from '../utils/translations';

interface AdminPanelProps {
  onPump: () => void;
  onDump: () => void;
  onForceSignal: (type: SignalType) => void;
  onResetBalance: () => void;
  onSetNews: (impact: 'HIGH' | 'MEDIUM' | 'NONE', event: string) => void;
  visitCount: number;
  visitors: VisitorLog[];
  lang: LanguageCode;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onPump, onDump, onForceSignal, onResetBalance, onSetNews, visitCount, visitors, lang }) => {
  const t = translations[lang];
  
  return (
    <div className="glass-panel rounded-xl p-4 border-2 border-red-900/50 bg-slate-900/90 shadow-[0_0_20px_rgba(220,38,38,0.2)] mb-6">
      <div className="flex items-center justify-between mb-4 border-b border-red-900/30 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <h3 className="font-bold text-lg text-red-400 tracking-wider">{t.admin_panel} (ADMIN MODE)</h3>
        </div>
        <span className="text-xs bg-red-900/50 text-red-200 px-2 py-1 rounded border border-red-700/50">Super Admin: salahmoneer11</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Stats Card */}
        <div className="bg-slate-800/50 p-3 rounded border border-slate-700 md:col-span-4 lg:col-span-1">
             <p className="text-xs text-gray-400 font-bold uppercase mb-1">{t.total_visits}</p>
             <p className="text-2xl font-bold text-white">{visitCount.toLocaleString()}</p>
        </div>

        {/* Market Manipulation */}
        <div className="space-y-2 md:col-span-2 lg:col-span-1">
          <p className="text-xs text-gray-400 font-bold uppercase">Market Control</p>
          <div className="flex gap-2">
            <button 
              onClick={onPump}
              className="flex-1 bg-green-900/40 hover:bg-green-800 text-green-400 border border-green-700/50 rounded py-2 font-bold text-sm transition"
            >
              🚀 {t.pump} (+10)
            </button>
            <button 
              onClick={onDump}
              className="flex-1 bg-red-900/40 hover:bg-red-800 text-red-400 border border-red-700/50 rounded py-2 font-bold text-sm transition"
            >
              📉 {t.dump} (-10)
            </button>
          </div>
        </div>

        {/* Force Signals */}
        <div className="space-y-2 md:col-span-2 lg:col-span-1">
          <p className="text-xs text-gray-400 font-bold uppercase">Force Execution</p>
          <div className="flex gap-2">
            <button 
              onClick={() => onForceSignal(SignalType.BUY)}
              className="flex-1 bg-blue-900/40 hover:bg-blue-800 text-blue-400 border border-blue-700/50 rounded py-2 font-bold text-sm transition"
            >
              {t.force_buy}
            </button>
            <button 
              onClick={() => onForceSignal(SignalType.SELL)}
              className="flex-1 bg-orange-900/40 hover:bg-orange-800 text-orange-400 border border-orange-700/50 rounded py-2 font-bold text-sm transition"
            >
              {t.force_sell}
            </button>
          </div>
        </div>

        {/* System Control */}
        <div className="space-y-2 md:col-span-4 lg:col-span-1">
          <p className="text-xs text-gray-400 font-bold uppercase">System</p>
          <div className="flex gap-2">
             <button 
              onClick={onResetBalance}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded py-2 text-xs font-bold transition"
            >
              ♻️ {t.reset}
            </button>
          </div>
        </div>
      </div>

      {/* Visitors List */}
      <div className="border-t border-red-900/30 pt-4">
         <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">{t.visitor_list}</h4>
         <div className="bg-slate-900 rounded border border-slate-700 overflow-hidden max-h-48 overflow-y-auto">
            <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-gray-400">
                    <tr>
                        <th className="p-2">{t.email}</th>
                        <th className="p-2">{t.select_plan}</th>
                        <th className="p-2">{t.ip_address}</th>
                        <th className="p-2">{t.last_visit}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-gray-300">
                    {visitors.map(v => (
                        <tr key={v.id} className="hover:bg-slate-800/50">
                            <td className="p-2 font-mono">{v.email}</td>
                            <td className="p-2 text-amber-400">{v.plan}</td>
                            <td className="p-2 text-gray-500">{v.ip}</td>
                            <td className="p-2">{new Date(v.lastVisit).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AdminPanel;