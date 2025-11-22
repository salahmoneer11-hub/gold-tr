import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../types';

interface ToastNotificationsProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastNotifications: React.FC<ToastNotificationsProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto transform transition-all duration-300 ease-in-out animate-slide-in-left 
            flex items-start gap-3 p-4 rounded-lg shadow-2xl border backdrop-blur-md
            ${toast.type === 'success' ? 'bg-green-900/80 border-green-500/50 text-green-50' : ''}
            ${toast.type === 'error' ? 'bg-red-900/80 border-red-500/50 text-red-50' : ''}
            ${toast.type === 'warning' ? 'bg-amber-900/80 border-amber-500/50 text-amber-50' : ''}
            ${toast.type === 'info' ? 'bg-blue-900/80 border-blue-500/50 text-blue-50' : ''}
          `}
        >
          <div className="text-2xl">
            {toast.type === 'success' && '💰'}
            {toast.type === 'error' && '🔻'}
            {toast.type === 'warning' && '⚠️'}
            {toast.type === 'info' && '🚀'}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm mb-1">{toast.title}</h4>
            <p className="text-xs opacity-90 leading-relaxed">{toast.message}</p>
          </div>
          <button 
            onClick={() => removeToast(toast.id)}
            className="text-white/50 hover:text-white transition p-1"
          >
            ✕
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slide-in-left {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ToastNotifications;
