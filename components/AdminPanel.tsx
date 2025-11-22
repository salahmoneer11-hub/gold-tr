
import React from 'react';
import { LanguageCode, UserEntity } from '../types';
import { translations } from '../utils/translations';

interface AdminPanelProps {
  onResetBalance: () => void;
  users: UserEntity[];
  onUpdateUserStatus: (email: string, status: 'ACTIVE' | 'BANNED' | 'PENDING') => void;
  onDeleteUser: (email: string) => void;
  lang: LanguageCode;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    onResetBalance, 
    users, onUpdateUserStatus, onDeleteUser,
    lang 
}) => {
  const t = translations[lang];
  
  const onlineCount = users.filter(u => u.isOnline).length;
  const totalUsers = users.length;

  return (
    <div className="glass-panel rounded-xl p-6 border-2 border-red-900/50 bg-slate-900/95 shadow-[0_0_20px_rgba(220,38,38,0.2)] mb-8">
      <div className="flex items-center justify-between mb-6 border-b border-red-900/30 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👑</span>
          <div>
            <h3 className="font-bold text-xl text-red-400 tracking-wider">{t.admin_panel}</h3>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Authorized: salahmoneer11@gmail.com</p>
          </div>
        </div>
        <div className="flex gap-3">
             <div className="bg-green-900/30 px-3 py-1 rounded border border-green-900/50 text-center">
                <span className="block text-xs text-green-400 font-bold uppercase">{t.online}</span>
                <span className="text-xl font-bold text-white">{onlineCount}</span>
             </div>
             <div className="bg-slate-800/50 px-3 py-1 rounded border border-slate-700 text-center">
                <span className="block text-xs text-gray-400 font-bold uppercase">{t.total_visits}</span>
                <span className="text-xl font-bold text-white">{totalUsers}</span>
             </div>
             <button onClick={onResetBalance} className="bg-slate-700 hover:bg-red-700 text-white px-4 rounded transition font-bold" title={t.reset}>♻️ Reset</button>
        </div>
      </div>

      {/* User Management Table */}
      <div className="border-t border-red-900/30 pt-4">
         <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">👥 {t.user_management}</h4>
            <span className="text-[10px] text-gray-500">Live P/L Monitoring</span>
         </div>
         
         <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden shadow-inner">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-gray-400 uppercase font-bold tracking-wider">
                        <tr>
                            <th className="p-3 border-b border-slate-800">{t.email}</th>
                            <th className="p-3 border-b border-slate-800 text-center">{t.user_status}</th>
                            <th className="p-3 border-b border-slate-800 text-right">{t.user_balance}</th>
                            <th className="p-3 border-b border-slate-800 text-right">{t.user_profit}</th>
                            <th className="p-3 border-b border-slate-800 text-center">Last Seen</th>
                            <th className="p-3 border-b border-slate-800 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-gray-300">
                        {users.map(u => (
                            <tr key={u.id} className={`hover:bg-slate-900/50 transition ${u.email === 'salahmoneer11@gmail.com' ? 'bg-amber-900/10' : ''}`}>
                                <td className="p-3 font-mono">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${u.isOnline ? 'bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]' : 'bg-slate-600'}`} title={u.isOnline ? 'Online' : 'Offline'}></div>
                                        <span className={u.email === 'salahmoneer11@gmail.com' ? 'text-amber-400 font-bold' : ''}>{u.email}</span>
                                        {u.plan !== 'free' && <span className="text-[9px] px-1 rounded bg-blue-900 text-blue-200">{u.plan}</span>}
                                    </div>
                                    <div className="text-[9px] text-gray-600 ml-4">{u.ip} • {u.location}</div>
                                </td>
                                <td className="p-3 text-center">
                                    <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase border ${
                                        u.status === 'ACTIVE' ? 'bg-green-900/20 text-green-400 border-green-900/50' :
                                        u.status === 'PENDING' ? 'bg-amber-900/20 text-amber-400 border-amber-900/50' :
                                        'bg-red-900/20 text-red-400 border-red-900/50'
                                    }`}>
                                        {t[`status_${u.status.toLowerCase()}`] || u.status}
                                    </span>
                                </td>
                                <td className="p-3 text-right font-mono text-gray-400">
                                    ${u.balance.toLocaleString()}
                                </td>
                                <td className="p-3 text-right font-mono font-bold">
                                    <span className={u.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                                        {u.totalProfit >= 0 ? '+' : ''}{u.totalProfit.toFixed(2)}$
                                    </span>
                                </td>
                                <td className="p-3 text-center text-gray-500 text-[10px]">
                                    {u.isOnline ? <span className="text-green-500">Now</span> : new Date(u.lastLogin).toLocaleTimeString()}
                                </td>
                                <td className="p-3">
                                    {u.email !== 'salahmoneer11@gmail.com' && (
                                        <div className="flex items-center justify-center gap-1">
                                            {u.status === 'PENDING' && (
                                                <button 
                                                    onClick={() => onUpdateUserStatus(u.email, 'ACTIVE')}
                                                    className="px-2 py-1 bg-green-700 hover:bg-green-600 text-white text-[9px] rounded font-bold shadow"
                                                    title="Approve User"
                                                >
                                                    ✅ {t.action_approve}
                                                </button>
                                            )}
                                            {u.status !== 'BANNED' ? (
                                                <button 
                                                    onClick={() => onUpdateUserStatus(u.email, 'BANNED')}
                                                    className="px-2 py-1 bg-red-900/50 hover:bg-red-800 text-red-300 text-[9px] rounded border border-red-800"
                                                    title="Ban User"
                                                >
                                                    🚫 {t.action_ban}
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => onUpdateUserStatus(u.email, 'ACTIVE')}
                                                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-gray-300 text-[9px] rounded border border-slate-600"
                                                    title="Unban User"
                                                >
                                                    🔓 Unban
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => onDeleteUser(u.email)}
                                                className="px-2 py-1 bg-slate-800 hover:bg-red-950 text-gray-500 hover:text-red-500 text-[9px] rounded"
                                                title="Kick/Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminPanel;
