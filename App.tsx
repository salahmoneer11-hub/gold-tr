
import React, { useState, useEffect, useRef } from 'react';
import { Candle, Trade, SignalType, MarketAnalysis, NewsStatus, Indicators, ToastMessage, PriceAlert, BrokerConnection, BrokerName, TradingMode, LanguageCode, AuthView, UserSubscription, VisitorLog, Asset, Timeframe, ChartType, UserEntity, UserStatus, EconomicEvent, UserFeedback } from './types';
import { calculateIndicators, getSimulatedNews, getEconomicCalendar } from './services/marketService';
import { fetchHistoricalData, subscribeToLivePrice, closeConnection } from './services/marketService';
import { analyzeMarket } from './services/geminiService';
import { translations } from './utils/translations';
import Chart from './components/Chart';
import BotControl from './components/BotControl';
import MetricCard from './components/MetricCard';
import ToastNotifications from './components/ToastNotifications';
import BrokerConnect from './components/BrokerConnect';
import LanguageSelector from './components/LanguageSelector';
import TermsModal from './components/TermsModal';
import SubscriptionPlans from './components/SubscriptionPlans';
import SubscriptionManagement from './components/SubscriptionManagement';
import RatingModal from './components/RatingModal';
import AssetSelector from './components/AssetSelector';
import AdminPanel from './components/AdminPanel';
import { Login, Register } from './components/Auth';
import { MeltedGoldLogo } from './components/Logo';

const INITIAL_BALANCE = 100000;
const ADMIN_EMAIL = "salahmoneer11@gmail.com";
const DEFAULT_ASSET: Asset = { symbol: 'XAUUSD', name: 'Gold (Spot)', category: 'COMMODITY', basePrice: 2350.00, icon: '🟡' };

const generateMockUsers = (): UserEntity[] => {
    const mock: UserEntity[] = [];
    mock.push({
        id: 'admin-001',
        email: ADMIN_EMAIL,
        status: 'ACTIVE',
        balance: 500000,
        totalProfit: 124500.50,
        isOnline: true,
        lastLogin: Date.now(),
        plan: 'yearly',
        ip: '192.168.1.1',
        location: 'Admin HQ'
    });
    return mock;
};

// AI Analysis Panel Component
const AIAnalysisPanel: React.FC<{ analysis: MarketAnalysis | null, lang: LanguageCode }> = ({ analysis, lang }) => {
    const t = translations[lang];
    if (!analysis) {
        return (
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-center items-center h-full border-t-4 border-t-purple-500/50">
                <div className="animate-pulse text-4xl mb-4">🧠</div>
                <h3 className="font-bold text-gray-300">{t.analyzing}</h3>
                <p className="text-xs text-gray-500">Waiting for market data...</p>
            </div>
        );
    }

    const { signal, confidence, reasoning, trend, support, resistance, suggested_sl, suggested_tp } = analysis;

    const signalColor = signal === 'BUY' ? 'text-green-400' : signal === 'SELL' ? 'text-red-400' : 'text-gray-400';
    const signalBg = signal === 'BUY' ? 'bg-green-900/30 border-green-500/30' : signal === 'SELL' ? 'bg-red-900/30 border-red-500/30' : 'bg-slate-700/30 border-slate-600/30';

    return (
        <div className="glass-panel p-4 rounded-2xl flex flex-col gap-4 border-t-4 border-t-purple-500/50 h-full">
            <h3 className="font-bold text-gray-200 text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                    <span>🧠</span> {t.ai_analysis}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded-md border border-slate-700">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_5px_theme(colors.green.400)]"></div>
                    <span className="text-[10px] text-green-300 font-mono font-bold">{t.live_update}</span>
                </span>
            </h3>
            <div className={`text-center p-3 rounded-lg border ${signalBg}`}>
                <div className="text-xs text-gray-400 uppercase tracking-widest">{t.signal}</div>
                <div className={`text-3xl font-black tracking-wider ${signalColor}`}>{signal}</div>
            </div>
            
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-gray-400 font-bold">{t.confidence}</label>
                    <span className="text-sm font-mono text-white">{confidence}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${confidence}%` }}></div>
                </div>
            </div>

            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 max-h-28 overflow-y-auto custom-scrollbar flex-1">
                <p className="text-xs text-gray-300 italic">{reasoning}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800 p-2 rounded">
                    <div className="text-gray-500">{t.suggested_sl}</div>
                    <div className="font-mono text-red-400">{suggested_sl?.toFixed(2) || 'N/A'}</div>
                </div>
                 <div className="bg-slate-800 p-2 rounded">
                    <div className="text-gray-500">{t.suggested_tp}</div>
                    <div className="font-mono text-green-400">{suggested_tp?.toFixed(2) || 'N/A'}</div>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<LanguageCode>('ar');
  const t = translations[lang];

  const [view, setView] = useState<AuthView>('LOGIN');
  const [currentUser, setCurrentUser] = useState<string>('');
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  
  const [allUsers, setAllUsers] = useState<UserEntity[]>(generateMockUsers);
  const [userFeedbacks, setUserFeedbacks] = useState<UserFeedback[]>([]);

  const [brokerConnection, setBrokerConnection] = useState<BrokerConnection | null>(null);

  const [lotSize, setLotSize] = useState(1.0);
  const [tradingMode, setTradingMode] = useState<TradingMode>('SAFE');
  const [currentAsset, setCurrentAsset] = useState<Asset>(DEFAULT_ASSET);
  
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [candles, setCandles] = useState<Candle[]>([]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [techIndicators, setTechIndicators] = useState<Indicators | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const [showRating, setShowRating] = useState(false);

  const isAdmin = currentUser === ADMIN_EMAIL;
  const activeUser = allUsers.find(u => u.email === currentUser);

  const openTrades = trades.filter(t => t.status === 'OPEN');
  const closedTrades = trades.filter(t => t.status === 'CLOSED');
  const openProfit = openTrades.reduce((sum, trade) => sum + trade.profit, 0);
  const accountEquity = (activeUser?.balance || 0) + openProfit;
  const wonTrades = closedTrades.filter(t => t.profit > 0);
  const winRate = closedTrades.length > 0 ? (wonTrades.length / closedTrades.length) * 100 : 0;
  
  useEffect(() => {
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const savedUser = localStorage.getItem('gold_ai_user_email');
    if (savedUser) {
        setCurrentUser(savedUser);
        setView('DASHBOARD');
    }
  }, []);

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const newToast: ToastMessage = { id: Math.random().toString(36).substr(2, 9), title, message, type, timestamp: Date.now() };
    setToasts(prev => [...prev, newToast].slice(-5));
  };

  const handleLogin = (email: string, password?: string): boolean => {
      if (email.toLowerCase() !== ADMIN_EMAIL && password !== 'password') {
        return false;
      }
      setCurrentUser(email);
      localStorage.setItem('gold_ai_user_email', email);
      addToast(t.toast_login_success, t.welcome_back, 'success');
      setView('DASHBOARD');
      return true;
  };

  const handleRegister = (email: string) => {
    addToast(t.register_success, t.login_now, "success");
    setView('LOGIN');
  };

  const handleLogout = () => {
    localStorage.removeItem('gold_ai_user_email');
    setCurrentUser('');
    setIsRunning(false);
    setView('LOGIN');
  };
  
  useEffect(() => {
    fetchHistoricalData(currentAsset.symbol, timeframe).then(data => {
        if(data.length > 0) {
            setCandles(data);
            setTechIndicators(calculateIndicators(data));
        }
    });

    subscribeToLivePrice(currentAsset.symbol, timeframe, (newCandle) => {
        setCandles(prev => {
            const updated = [...prev];
            if (prev.length > 0 && prev[prev.length - 1].time === newCandle.time) {
                updated[updated.length - 1] = newCandle;
            } else {
                updated.push(newCandle);
                if (updated.length > 100) updated.shift();
            }
            return updated;
        });

        const currentPrice = newCandle.close;
        setTrades(prevTrades => prevTrades.map(trade => {
            if (trade.status === 'CLOSED') return trade;

            let updatedTrade = { ...trade };
            const profitPoints = trade.type === 'BUY' ? (currentPrice - trade.entryPrice) : (trade.entryPrice - currentPrice);
            updatedTrade.profit = profitPoints * trade.lotSize * 100;
            
            const initialSlDistance = Math.abs(trade.entryPrice - trade.initialSlPrice);

            // Step 1: Secure at Breakeven
            if (!trade.breakevenTriggered && profitPoints > initialSlDistance * 0.5) {
                updatedTrade.slPrice = trade.entryPrice;
                updatedTrade.breakevenTriggered = true;
                addToast(t.breakeven_title, `${t.breakeven_msg} #${trade.id.slice(0,4)}`, 'info');
            }
            
            // Step 2: Trail Stop in Profit (after breakeven)
            if (updatedTrade.breakevenTriggered) {
                let newSlPrice;
                if (trade.type === 'BUY') {
                    // Potential new SL is the current price minus the initial risk distance.
                    const potentialNewSl = currentPrice - initialSlDistance;
                    // Only move the SL up, never down.
                    if (potentialNewSl > updatedTrade.slPrice) {
                        newSlPrice = potentialNewSl;
                    }
                } else { // SELL
                    // For a sell, potential new SL is current price PLUS the distance.
                    const potentialNewSl = currentPrice + initialSlDistance;
                    // Only move the SL down, never up.
                    if (potentialNewSl < updatedTrade.slPrice) {
                        newSlPrice = potentialNewSl;
                    }
                }

                if (newSlPrice !== undefined) {
                    updatedTrade.slPrice = newSlPrice;
                    addToast(t.profit_lock_title, `${t.profit_lock_msg} #${trade.id.slice(0,4)} @ ${newSlPrice.toFixed(2)}`, 'success');
                }
            }


            // Check for SL/TP hit
            if (trade.type === 'BUY') {
                if (currentPrice <= updatedTrade.slPrice) { 
                    updatedTrade.status = 'CLOSED'; 
                    updatedTrade.exitPrice = updatedTrade.slPrice; 
                }
                if (trade.tpPrice && currentPrice >= trade.tpPrice) { 
                    updatedTrade.status = 'CLOSED'; 
                    updatedTrade.exitPrice = trade.tpPrice; 
                }
            } else { // SELL
                if (currentPrice >= updatedTrade.slPrice) { 
                    updatedTrade.status = 'CLOSED'; 
                    updatedTrade.exitPrice = updatedTrade.slPrice; 
                }
                if (trade.tpPrice && currentPrice <= trade.tpPrice) { 
                    updatedTrade.status = 'CLOSED'; 
                    updatedTrade.exitPrice = trade.tpPrice; 
                }
            }

            // Finalize profit if closed
            if (updatedTrade.status === 'CLOSED' && trade.status === 'OPEN') {
                const finalProfitPoints = trade.type === 'BUY' 
                    ? (updatedTrade.exitPrice! - trade.entryPrice) 
                    : (trade.entryPrice - updatedTrade.exitPrice!);
                updatedTrade.profit = finalProfitPoints * trade.lotSize * 100;
            }

            return updatedTrade;
        }));
    });

    return () => closeConnection();
  }, [currentAsset, timeframe]);

  useEffect(() => {
    if (!isRunning || !candles.length || !techIndicators) return;

    const botLoop = setInterval(async () => {
        if (openTrades.length >= 5) return;

        const currentPrice = candles[candles.length - 1].close;
        const analysisResult = await analyzeMarket(process.env.API_KEY || '', currentAsset.symbol, candles, techIndicators, getSimulatedNews(), lang);
        setAnalysis(analysisResult);

        if (analysisResult.signal !== SignalType.HOLD && analysisResult.confidence >= 70) { // Confidence threshold lowered to 70 for more aggressive trading
            const newTrade: Trade = {
                id: Math.random().toString(36).substr(2, 9),
                type: analysisResult.signal,
                entryPrice: currentPrice,
                initialSlPrice: analysisResult.suggested_sl,
                slPrice: analysisResult.suggested_sl,
                tpPrice: analysisResult.suggested_tp,
                lotSize,
                profit: 0,
                timestamp: Date.now(),
                status: 'OPEN',
                symbol: currentAsset.symbol,
                breakevenTriggered: false
            };
            setTrades(prev => [newTrade, ...prev]);
            addToast(t.new_trade, `${analysisResult.signal} @ ${currentPrice.toFixed(2)}`, 'info');
        }
    }, 1000); // Increased frequency to 1 second for instant market analysis

    return () => clearInterval(botLoop);
  }, [isRunning, candles, techIndicators, trades, lotSize, lang, currentAsset]);

  useEffect(() => {
      if (candles.length > 0) {
          setTechIndicators(calculateIndicators(candles));
      }
  }, [candles]);

  const toggleBot = () => setIsRunning(!isRunning);

  if (view !== 'DASHBOARD') {
      const AuthViewComponent = {
        LOGIN: <Login onLogin={handleLogin} onRegisterClick={() => setView('REGISTER')} lang={lang} setLang={setLang} />,
        REGISTER: <Register onRegister={handleRegister} onLoginClick={() => setView('LOGIN')} lang={lang} setLang={setLang} />,
      }[view] || <Login onLogin={handleLogin} onRegisterClick={() => setView('REGISTER')} lang={lang} setLang={setLang} />;
      
      return <div className="bg-slate-950 min-h-screen">{AuthViewComponent}</div>;
  }
  
  return (
    <div className="min-h-screen text-slate-50 font-sans selection:bg-amber-500/30">
      <header className="h-16 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between px-6 fixed top-0 w-full z-50 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-3">
          <MeltedGoldLogo className="w-8 h-8 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent tracking-tight cursor-default">
            GOLD AI <span className="text-[10px] font-mono text-slate-400 align-top border border-slate-700 rounded px-1 ml-1 bg-slate-800">PRO</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <AssetSelector selectedAsset={currentAsset} onSelectAsset={setCurrentAsset} lang={lang} />
          <LanguageSelector currentLang={lang} onSelect={setLang} label="" />
          <div className="relative group">
             <button className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center font-bold text-slate-900 text-xs shadow-lg shadow-amber-500/20 border-2 border-slate-800">
                 {currentUser.substring(0, 2).toUpperCase()}
             </button>
             <div className="absolute top-full right-0 mt-3 w-56 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl overflow-hidden hidden group-hover:block backdrop-blur-md">
                 <div className="px-4 py-4 border-b border-slate-700 bg-slate-800/50">
                     <p className="text-sm text-white font-bold truncate">{currentUser}</p>
                 </div>
                 <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition flex items-center gap-2"><span>🚪</span> {t.logout}</button>
             </div>
          </div>
        </div>
      </header>

      <main className="pt-20 px-2 sm:px-4 md:px-6 pb-8 w-full max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title={t.equity} value={`$${accountEquity.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} subValue={`${t.open_trades}: ${openTrades.length}`} icon="💰" />
            <MetricCard title={t.open_profit} value={`${openProfit >= 0 ? '+' : ''}$${openProfit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} color={openProfit >= 0 ? 'text-green-400' : 'text-red-400'} icon="📈" />
            <MetricCard title={t.win_rate} value={`${winRate.toFixed(1)}%`} subValue={`${wonTrades.length}/${closedTrades.length} Won`} color="text-blue-400" icon="🎯" />
            <MetricCard title={t.user_balance} value={`$${activeUser?.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} icon="🏦" />
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Main Content: Chart */}
            <div className="lg:col-span-9 col-span-1 glass-panel p-1 rounded-2xl relative flex flex-col min-h-[500px] shadow-2xl">
                <div className="absolute top-3 left-3 z-10 flex gap-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                    {(['1m', '5m', '15m', '1h'] as Timeframe[]).map(tf => (<button key={tf} onClick={() => setTimeframe(tf)} className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-200 ${timeframe === tf ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-gray-400 hover:text-white hover:bg-slate-700'}`}>{t[`tf_${tf}`] || tf}</button>))}
                </div>
                <Chart data={candles} type={'CANDLE'} symbol={currentAsset.symbol} timeframe={timeframe} />
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-3 col-span-1 flex flex-col gap-4">
                <BotControl isRunning={isRunning} onToggle={toggleBot} lotSize={lotSize} setLotSize={setLotSize} tradingMode={tradingMode} setTradingMode={setTradingMode} lang={lang} />
                <AIAnalysisPanel analysis={analysis} lang={lang} />
            </div>

            {/* Trade Log at the bottom */}
            <div className="lg:col-span-12 col-span-1 glass-panel p-3 rounded-2xl flex flex-col min-h-[300px] max-h-[60vh] border-t-4 border-t-blue-500/20">
                <h3 className="font-bold text-gray-200 mb-2 border-b border-white/5 pb-2 flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">📜 {t.trade_log}</span>
                     <span className="text-[9px] text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-500/30">Live</span>
                </h3>
                <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
                    {trades.length === 0 ? (<div className="text-center text-gray-500 py-10 flex flex-col items-center justify-center h-full"><div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-2 text-2xl opacity-50">⚡</div><span className="text-xs">{t.no_trades}</span></div>) : (
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-slate-500 uppercase text-[10px] font-bold">
                                    <th className="p-2 text-left">{t.log_asset}</th>
                                    <th className="p-2 text-left">{t.log_type}</th>
                                    <th className="p-2 text-center">{t.lot_size}</th>
                                    <th className="p-2 text-left">{t.log_price}</th>
                                    <th className="p-2 text-right">{t.log_pl}</th>
                                    <th className="p-2 text-center">{t.log_status}</th>
                                </tr>
                            </thead>
                            <tbody>
                            {trades.map(trade => (
                                <tr key={trade.id} className="border-t border-slate-800/50 hover:bg-slate-800/30 transition">
                                    <td className="p-2 font-bold text-slate-300">{trade.symbol}</td>
                                    <td className="p-2">
                                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${trade.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{trade.type}</span>
                                    </td>
                                    <td className="p-2 text-center font-mono text-slate-400">{trade.lotSize.toFixed(2)}</td>
                                    <td className="p-2 font-mono text-slate-300">
                                        {trade.entryPrice.toFixed(2)}
                                        {trade.exitPrice ? <span className="text-slate-500"> → {trade.exitPrice.toFixed(2)}</span> : ''}
                                    </td>
                                    <td className={`p-2 text-right font-mono font-bold ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}$
                                    </td>
                                    <td className="p-2 text-center">
                                       <div className="flex items-center justify-center gap-1.5">
                                         <span className={`w-2 h-2 rounded-full ${trade.status === 'OPEN' ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'}`}></span>
                                         <span className="text-[10px] text-gray-400">{trade.status}</span>
                                       </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
      </main>
      
      <ToastNotifications toasts={toasts} removeToast={(id) => setToasts(p => p.filter(t => t.id !== id))} />
      <div className="fixed bottom-6 right-6 z-40"><button onClick={() => setShowRating(true)} className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-amber-500 border border-slate-600 hover:scale-110 transition-all duration-300 shadow-xl flex items-center justify-center text-lg hover:rotate-12 hover:shadow-amber-500/20" title={t.rate_us}>★</button></div>
      {showRating && <RatingModal onRate={(rating, comment) => { setUserFeedbacks(prev => [{ id: Date.now().toString(), userEmail: currentUser, rating, comment, timestamp: Date.now() }, ...prev]); addToast(t.rating_thanks, "", "success"); setShowRating(false); }} onClose={() => setShowRating(false)} lang={lang} />}
    </div>
  );
};

export default App;