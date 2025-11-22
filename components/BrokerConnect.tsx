
import React, { useState, useEffect, useRef } from 'react';
import { BrokerName, LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface BrokerConnectProps {
  onConnect: (broker: BrokerName, server: string, accountId: string) => void;
  onClose: () => void;
  lang: LanguageCode;
}

const BrokerConnect: React.FC<BrokerConnectProps> = ({ onConnect, onClose, lang }) => {
  const [selectedBroker, setSelectedBroker] = useState<BrokerName>('META_TRADER_5');
  const [server, setServer] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  
  // For Crypto/Exness APIs
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const [isConnecting, setIsConnecting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const isCryptoOrExness = ['BINANCE', 'OKX', 'BYBIT', 'EXNESS'].includes(selectedBroker);

  const addLog = (msg: string) => {
      // Cast options to any to avoid TS error about fractionalSecondDigits in older lib definitions
      const time = new Date().toLocaleTimeString('en-US', {
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit', 
          fractionalSecondDigits: 3
      } as any);
      setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setLogs([]);
    
    // Simulate connection steps
    addLog(`Initializing connection to ${selectedBroker}...`);
    
    setTimeout(() => {
        addLog(`POST /api/v1/auth/handshake`);
        addLog(`Payload: { client_id: "${login || apiKey.substr(0,6)+'...'}" }`);
    }, 500);

    setTimeout(() => {
        addLog(`Response: 200 OK (Latency: ${Math.floor(Math.random() * 20) + 5}ms)`);
        addLog(`Verifying credentials...`);
    }, 1200);

    setTimeout(() => {
        addLog(`Secure Tunnel Established (TLS 1.3)`);
        addLog(`Subscribing to XAUUSD WebSocket stream...`);
    }, 2000);

    setTimeout(() => {
      setIsConnecting(false);
      onConnect(selectedBroker, server || 'Real-Server-Primary', login || apiKey);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-5 border-b border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnecting ? 'bg-amber-500 animate-ping' : 'bg-slate-600'}`}></div>
            <div>
              <h2 className="text-lg font-bold text-white">{t.broker_connect_title}</h2>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{t.secure_gateway}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl transition">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
           <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.platform}</label>
              <div className="grid grid-cols-3 gap-2">
                {(['META_TRADER_5', 'EXNESS', 'BINANCE', 'OKX', 'BYBIT'] as BrokerName[]).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBroker(b)}
                    className={`px-2 py-2 rounded border text-[10px] font-bold transition flex flex-col items-center justify-center gap-1 h-16
                      ${selectedBroker === b 
                        ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20' 
                        : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-500'}`}
                  >
                    <span className="text-base">
                       {b === 'META_TRADER_5' && '🟢'}
                       {b === 'EXNESS' && '🟡'}
                       {b === 'BINANCE' && '🟡'}
                       {b === 'OKX' && '⚫'}
                       {b === 'BYBIT' && '⚫'}
                    </span>
                    {b.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {!isCryptoOrExness ? (
                // MT5 Fields
                <>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">{t.server}</label>
                        <input 
                        type="text" 
                        value={server}
                        onChange={(e) => setServer(e.target.value)}
                        placeholder="Exness-Real14"
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none font-mono text-sm"
                        required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">{t.account_id}</label>
                            <input 
                                type="text" 
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none font-mono text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">{t.password}</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none font-mono text-sm"
                                required
                            />
                        </div>
                    </div>
                </>
            ) : (
                // Crypto/Exness API Fields
                <>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">{t.api_key}</label>
                        <input 
                            type="text" 
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="vmPU...9d8f"
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-3 text-amber-400 focus:ring-1 focus:ring-amber-500 outline-none font-mono text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">{t.secret_key}</label>
                        <input 
                            type="password" 
                            value={secretKey}
                            onChange={(e) => setSecretKey(e.target.value)}
                            placeholder="••••••••••••••••••••••••••••••"
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none font-mono text-sm"
                            required
                        />
                    </div>
                </>
            )}

            {/* Simulated Terminal Log */}
            {isConnecting && (
                <div className="bg-black rounded-lg p-3 font-mono text-[10px] text-green-400 h-32 overflow-y-auto border border-slate-700 shadow-inner">
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1">{log}</div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            )}

            <button 
              type="submit" 
              disabled={isConnecting}
              className={`w-full font-bold py-4 rounded-xl transition flex justify-center items-center gap-2
                ${isConnecting 
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                  : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg shadow-green-900/20'}`}
            >
              {isConnecting ? t.processing : t.connect_btn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BrokerConnect;
