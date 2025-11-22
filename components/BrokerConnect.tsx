
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

  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
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

  const addLog = (msg: string, type: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN' = 'INFO') => {
      const time = new Date().toLocaleTimeString('en-US', {
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit', 
          fractionalSecondDigits: 3
      } as any);
      
      let prefix = 'ℹ';
      if (type === 'SUCCESS') prefix = '✔';
      if (type === 'ERROR') prefix = '✖';
      if (type === 'WARN') prefix = '⚠';

      setLogs(prev => [...prev, `[${time}] ${prefix} ${msg}`]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'CONNECTING') return;

    setStatus('CONNECTING');
    setErrorDetails(null);
    setLogs([]);
    
    // Determine if we should fail based on input
    const shouldFail = password.toLowerCase().includes('fail') || 
                       password.toLowerCase().includes('error') ||
                       secretKey.toLowerCase().includes('fail') ||
                       secretKey.toLowerCase().includes('error');

    // Connection Simulation Steps - PRO HACKER STYLE
    addLog(`${t.handshake_init} ${selectedBroker}...`);

    setTimeout(() => {
        const host = isCryptoOrExness ? 'api.binance.com' : 'mt5-real.server.com';
        addLog(`Resolving DNS: ${server || host}...`);
    }, 500);

    setTimeout(() => {
        const ip = `104.22.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
        addLog(`Host resolved: ${ip}`, 'SUCCESS');
        addLog(`Initiating TLS 1.3 Handshake...`);
    }, 1000);

    setTimeout(() => {
        addLog(`Cipher Suite: TLS_AES_256_GCM_SHA384`, 'INFO');
        addLog(`Certificate verified. Secure Tunnel Established.`, 'SUCCESS');
    }, 1800);

    setTimeout(() => {
        if (shouldFail) {
             addLog(`${t.connection_failed}: Error 10060 (Connection Timed Out)`, 'ERROR');
             setStatus('ERROR');
             setErrorDetails(t.check_credentials);
        } else {
             addLog(`Authenticating user ${login || 'API_KEY'}...`, 'INFO');
             const latency = Math.floor(Math.random() * 20) + 5;
             addLog(`Auth Success. Session Token: ${Math.random().toString(36).substr(2, 12).toUpperCase()}`, 'SUCCESS');
             addLog(`Ping: ${latency}ms (Low Latency Mode Active)`, 'SUCCESS');
             addLog(`${t.verifying_creds}`);
        }
    }, 3000);

    if (!shouldFail) {
        setTimeout(() => {
            addLog(`Subscribing to market data streams (WSS)...`, 'INFO');
            addLog(`Stream open: XAUUSD, EURUSD, BTCUSDT`, 'INFO');
        }, 4000);

        setTimeout(() => {
             addLog(`System Ready. AI Engine Attached.`, 'SUCCESS');
             setStatus('SUCCESS');
             setTimeout(() => {
                 onConnect(selectedBroker, server || 'Real-Server-Primary', login || apiKey);
             }, 800);
        }, 5000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-5 border-b border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${status === 'CONNECTING' ? 'bg-amber-500 animate-ping' : status === 'SUCCESS' ? 'bg-green-500' : status === 'ERROR' ? 'bg-red-500' : 'bg-slate-600'}`}></div>
            <div>
              <h2 className="text-lg font-bold text-white">{t.broker_connect_title}</h2>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{t.secure_gateway}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl transition">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
           
           {/* Error Banner */}
           {status === 'ERROR' && errorDetails && (
               <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3 animate-fadeIn">
                   <span className="text-xl">⛔</span>
                   <div>
                       <h4 className="text-red-400 font-bold text-sm">{t.connection_failed}</h4>
                       <p className="text-red-300 text-xs mt-1">{errorDetails}</p>
                   </div>
               </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.platform}</label>
              <div className="grid grid-cols-3 gap-2">
                {(['META_TRADER_5', 'EXNESS', 'BINANCE', 'OKX', 'BYBIT'] as BrokerName[]).map((b) => (
                  <button
                    key={b}
                    type="button"
                    disabled={status === 'CONNECTING'}
                    onClick={() => setSelectedBroker(b)}
                    className={`px-2 py-2 rounded border text-[10px] font-bold transition flex flex-col items-center justify-center gap-1 h-16
                      ${selectedBroker === b 
                        ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20' 
                        : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-500'}
                      ${status === 'CONNECTING' ? 'opacity-50 cursor-not-allowed' : ''}  
                    `}
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
                        disabled={status === 'CONNECTING'}
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
                                disabled={status === 'CONNECTING'}
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
                                disabled={status === 'CONNECTING'}
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
                            disabled={status === 'CONNECTING'}
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
                            disabled={status === 'CONNECTING'}
                        />
                    </div>
                </>
            )}

            {/* Terminal Log */}
            {logs.length > 0 && (
                <div className="bg-black rounded-lg p-3 font-mono text-[10px] h-32 overflow-y-auto border border-slate-700 shadow-inner">
                    {logs.map((log, i) => (
                        <div key={i} className={`mb-1 ${log.includes('ERROR') || log.includes('✖') ? 'text-red-400' : log.includes('SUCCESS') || log.includes('✔') ? 'text-green-400' : 'text-gray-300'}`}>
                            {log}
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            )}

            <button 
              type="submit" 
              disabled={status === 'CONNECTING'}
              className={`w-full font-bold py-4 rounded-xl transition flex justify-center items-center gap-2
                ${status === 'CONNECTING' 
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                  : status === 'ERROR'
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg shadow-green-900/20'}`}
            >
              {status === 'CONNECTING' ? t.processing : status === 'ERROR' ? t.connect_btn : t.connect_btn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BrokerConnect;
