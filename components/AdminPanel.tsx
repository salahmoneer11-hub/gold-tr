
import React from 'react';
import { LanguageCode, UserEntity, UserFeedback } from '../types';
import { translations } from '../utils/translations';

interface AdminPanelProps {
  onResetBalance: () => void;
  users: UserEntity[];
  feedbacks: UserFeedback[];
  onUpdateUserStatus: (email: string, status: 'ACTIVE' | 'BANNED' | 'PENDING') => void;
  onDeleteUser: (email: string) => void;
  lang: LanguageCode;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    onResetBalance, 
    users, 
    feedbacks,
    onUpdateUserStatus, 
    onDeleteUser,
    lang 
}) => {
  const t = translations[lang];
  
  const onlineCount = users.filter(u => u.isOnline).length;
  const totalUsers = users.length;

  return (
    <div className="glass-panel rounded-xl p-6 border-2 border-red-900/50 bg-slate-900/95 shadow-[0_0_20px_rgba(220,38,38,0.2)] mb-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 border-b border-red-900/30 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👑</span>
          <div>
            <h3 className="font-bold text-xl text-red-400 tracking-wider">{t.admin_panel}</h3>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Authorized: salahmoneer11@gmail.com</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
             <div className="bg-green-900/30 px-3 py-1 rounded border border-green-900/50 text-center min-w-[80px]">
                <span className="block text-xs text-green-400 font-bold uppercase">{t.online}</span>
                <span className="text-xl font-bold text-white">{onlineCount}</span>
             </div>
             <div className="bg-slate-800/50 px-3 py-1 rounded border border-slate-700 text-center min-w-[80px]">
                <span className="block text-xs text-gray-400 font-bold uppercase">{t.total_visits}</span>
                <span className="text-xl font-bold text-white">{totalUsers}</span>
             </div>
             <button onClick={onResetBalance} className="bg-slate-700 hover:bg-red-700 text-white px-4 rounded transition font-bold" title={t.reset}>♻️ Reset</button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Top Section: Feedbacks */}
        <div className="w-full">
            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span>💬</span> User Feedback ({feedbacks.length})
            </h4>
            
            <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-4 max-h-[250px] overflow-y-auto custom-scrollbar">
                {feedbacks.length === 0 ? (
                    <div className="text-center text-gray-600 opacity-50 py-8">
                        <span className="text-2xl block mb-2">📨</span>
                        <span className="text-xs">No reviews yet</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {feedbacks.map(fb => (
                            <div key={fb.id} className="bg-slate-900 p-3 rounded-lg border border-slate-800 hover:border-blue-500/30 transition relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="text-xs font-bold text-gray-300 truncate max-w-[150px]" title={fb.userEmail}>{fb.userEmail}</div>
                                        <div className="text-[9px] text-gray-600">{new Date(fb.timestamp).toLocaleString()}</div>
                                    </div>
                                    <div className="flex gap-0.5 text-amber-500 text-xs bg-slate-950 px-1.5 py-0.5 rounded-full border border-slate-800">
                                        {[...Array(fb.rating)].map((_, i) => <span key={i}>★</span>)}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 italic bg-black/20 p-2 rounded border-l-2 border-slate-700 line-clamp-3 hover:line-clamp-none transition-all">
                                    "{fb.comment}"
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Bottom Section: User Management Table */}
        <div className="w-full">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                    <span>👥</span> {t.user_management}
                </h4>
                <span className="text-[10px] text-gray-500 bg-slate-800 px-2 py-1 rounded">Live DB Monitor</span>
            </div>
            
            <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden shadow-xl max-h-[500px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-gray-400 uppercase font-bold tracking-wider sticky top-0 z-10 shadow-md">
                        <tr>
                            <th className="p-4 border-b border-slate-800">{t.email}</th>
                            <th className="p-4 border-b border-slate-800 text-center">{t.user_status}</th>
                            <th className="p-4 border-b border-slate-800 text-right">{t.user_balance}</th>
                            <th className="p-4 border-b border-slate-800 text-right">{t.user_profit}</th>
                            <th className="p-4 border-b border-slate-800 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-gray-300">
                        {users.map(u => (
                            <tr key={u.id} className={`hover:bg-slate-900/50 transition group ${u.email === 'salahmoneer11@gmail.com' ? 'bg-amber-900/5' : ''}`}>
                                <td className="p-4 font-mono">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${u.isOnline ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-slate-600'}`} title={u.isOnline ? 'Online' : 'Offline'}></div>
                                        <div>
                                            <div className={`font-medium ${u.email === 'salahmoneer11@gmail.com' ? 'text-amber-400' : 'text-gray-200'}`}>{u.email}</div>
                                            <div className="text-[9px] text-gray-600 mt-0.5 flex gap-2">
                                                <span>📍 {u.location}</span>
                                                <span>🏷️ {u.plan}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border shadow-sm ${
                                        u.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        u.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-mono text-gray-300">
                                    ${u.balance.toLocaleString()}
                                </td>
                                <td className="p-4 text-right font-mono font-bold">
                                    <span className={`px-2 py-0.5 rounded ${u.totalProfit >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {u.totalProfit >= 0 ? '+' : ''}{u.totalProfit.toFixed(2)}$
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    {u.email !== 'salahmoneer11@gmail.com' && (
                                        <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition">
                                            {u.status === 'PENDING' && (
                                                <button onClick={() => onUpdateUserStatus(u.email, 'ACTIVE')} className="p-1.5 hover:bg-green-500/20 rounded text-green-500 transition" title="Approve">✅</button>
                                            )}
                                            {u.status !== 'BANNED' ? (
                                                <button onClick={() => onUpdateUserStatus(u.email, 'BANNED')} className="p-1.5 hover:bg-red-500/20 rounded text-red-500 transition" title="Ban">🚫</button>
                                            ) : (
                                                <button onClick={() => onUpdateUserStatus(u.email, 'ACTIVE')} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition" title="Unban">🔓</button>
                                            )}
                                            <button onClick={() => onDeleteUser(u.email)} className="p-1.5 hover:bg-red-900/30 rounded text-slate-500 hover:text-red-500 transition" title="Delete">🗑️</button>
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
    