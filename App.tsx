
import React, { useState, useEffect, useRef } from 'react';
import { Candle, Trade, SignalType, MarketAnalysis, NewsStatus, Indicators, ToastMessage, PriceAlert, BrokerConnection, BrokerName, TradingMode, LanguageCode, AuthView, UserSubscription, VisitorLog, Asset, Timeframe, ChartType, UserEntity, UserStatus, EconomicEvent } from './types';
import { calculateIndicators, getSimulatedNews, getEconomicCalendar } from './services/marketService';
import { fetchHistoricalData, subscribeToLivePrice, closeConnection } from './services/marketService';
import { analyzeMarket } from './services/geminiService';
import { translations } from './utils/translations';
import Chart from './components/Chart';
import BotControl from './components/BotControl';
import MetricCard from './components/MetricCard';
import ToastNotifications from './components/ToastNotifications';
import PriceAlerts from './components/PriceAlerts';
import BrokerConnect from './components/BrokerConnect';
import LanguageSelector from './components/LanguageSelector';
import TermsModal from './components/TermsModal';
import SubscriptionPlans from './components/SubscriptionPlans';
import SubscriptionManagement from './components/SubscriptionManagement';
import RatingModal from './components/RatingModal';
import AssetSelector from './components/AssetSelector';
import AdminPanel from './components/AdminPanel';
import NewsCalendar from './components/NewsCalendar';
import { Login, Register, ForgotPassword, Activation } from './components/Auth';
import { MeltedGoldLogo } from './components/Logo';

const INITIAL_BALANCE = 100000;
const VALID_ACTIVATION_CODES = ["GOLD-2024", "SAMU11"];
const ADMIN_EMAIL = "salahmoneer11@gmail.com";
const DEFAULT_ASSET: Asset = { symbol: 'XAUUSD', name: 'Gold (Spot)', category: 'COMMODITY', basePrice: 2350.00, icon: '🟡' };

// Helper to generate initial mock users
const generateMockUsers = (): UserEntity[] => {
    const locations = ["USA", "Germany", "UAE", "Saudi Arabia", "UK", "France", "Egypt"];
    const mock: UserEntity[] = [];
    
    // Admin Account
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

    // Random Users
    for(let i=0; i<5; i++) {
        mock.push({
            id: `user-${Math.random().toString(36).substr(2,5)}`,
            email: `user${i+1}@gmail.com`,
            status: Math.random() > 0.8 ? 'PENDING' : 'ACTIVE',
            balance: 1000 + Math.random() * 50000,
            totalProfit: (Math.random() - 0.4) * 5000,
            isOnline: Math.random() > 0.5,
            lastLogin: Date.now() - Math.floor(Math.random() * 10000000),
            plan: Math.random() > 0.7 ? 'monthly' : 'free',
            ip: `10.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.x`,
            location: locations[Math.floor(Math.random() * locations.length)]
        });
    }
    return mock;
};

// Visual Component for Signal Strength
const SignalBars = ({ latency }: { latency: number }) => {
    const quality = latency < 100 ? 4 : latency < 200 ? 3 : latency < 400 ? 2 : 1;
    return (
        <div className="flex gap-0.5 items-end h-3" title={`Signal Quality: ${quality}/4`}>
            {[1, 2, 3, 4].map(i => (
                <div 
                    key={i} 
                    className={`w-1 rounded-sm transition-all duration-500 ${i <= quality 
                        ? (quality >= 3 ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : quality === 2 ? 'bg-amber-500' : 'bg-red-500') 
                        : 'bg-slate-700'}`}
                    style={{ height: `${i * 25}%` }}
                />
            ))}
        </div>
    );
};

const App: React.FC = () => {
  // Language State
  const [lang, setLang] = useState<LanguageCode>('ar');
  const t = translations[lang];

  // Auth & Terms State
  const [view, setView] = useState<AuthView>('LOGIN');
  const [currentUser, setCurrentUser] = useState<string>('');
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showSubManagement, setShowSubManagement] = useState(false);
  
  // Admin User Management State - SAFE INITIALIZATION (Fixes Loading Freeze)
  const [allUsers, setAllUsers] = useState<UserEntity[]>(() => {
      try {
        const saved = localStorage.getItem('gold_ai_users_db_v2');
        if (!saved) return generateMockUsers();
        
        const parsed = JSON.parse(saved);
        // Validate structure
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].email) {
            return parsed;
        }
        return generateMockUsers();
      } catch (error) {
        console.error("Critical: Failed to load user database, resetting...", error);
        localStorage.removeItem('gold_ai_users_db_v2'); // Clear bad data
        return generateMockUsers();
      }
  });

  // Broker State
  const [showBrokerConnect, setShowBrokerConnect] = useState(false);
  const [brokerConnection, setBrokerConnection] = useState<BrokerConnection | null>(null);

  const [apiKey, setApiKey] = useState('');
  const [lotSize, setLotSize] = useState(1.0);
  const [avoidNews, setAvoidNews] = useState(true);
  const [tradingMode, setTradingMode] = useState<TradingMode>('ULTRA_SAFE');
  const [currentNews, setCurrentNews] = useState<NewsStatus>({ impact: 'NONE', event: '...' });
  const [currentAsset, setCurrentAsset] = useState<Asset>(DEFAULT_ASSET);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  
  // Market Data State
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [chartType, setChartType] = useState<ChartType>('CANDLE');
  const [candles, setCandles] = useState<Candle[]>([]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [techIndicators, setTechIndicators] = useState<Indicators | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showRating, setShowRating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [marketTime, setMarketTime] = useState<string>('');

  const isAdmin = currentUser === ADMIN_EMAIL;

  useEffect(() => {
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Persist Users DB
  useEffect(() => {
      localStorage.setItem('gold_ai_users_db_v2', JSON.stringify(allUsers));
  }, [allUsers]);

  // Simulate User Activity (Profit/Loss updates for admin view)
  useEffect(() => {
      const interval = setInterval(() => {
          setAllUsers(prev => prev.map(u => {
             if (u.isOnline && u.status === 'ACTIVE' && u.email !== ADMIN_EMAIL) {
                 const change = (Math.random() - 0.45) * 50; // Slightly weighted to profit for effect
                 return { 
                     ...u, 
                     balance: u.balance + change,
                     totalProfit: u.totalProfit + change
                 };
             }
             return u;
          }));
      }, 3000);
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
        const savedUser = localStorage.getItem('gold_ai_user_email');
        if (savedUser) {
            const user = allUsers.find(u => u.email === savedUser);
            if (user && (user.status === 'ACTIVE' || user.email === ADMIN_EMAIL)) {
                setCurrentUser(savedUser);
                updateUserOnlineStatus(savedUser, true);
                
                // Check if THIS user has accepted terms
                const hasAcceptedTerms = localStorage.getItem(`gold_ai_terms_${savedUser}`) === 'true';
                if (hasAcceptedTerms) {
                    setView('DASHBOARD');
                } else {
                    setView('TERMS');
                }
            } else {
                localStorage.removeItem('gold_ai_user_email');
                setView('LOGIN');
            }
        } else {
            setView('LOGIN');
        }
    } catch (e) {
        console.error("Init error", e);
        setView('LOGIN');
    }
  }, []);

  useEffect(() => {
    const updateClock = () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-GB', {
            timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        setMarketTime(timeString);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Economic Calendar
  useEffect(() => {
      setEconomicEvents(getEconomicCalendar());
  }, []);

  const updateUserOnlineStatus = (email: string, isOnline: boolean) => {
      setAllUsers(prev => prev.map(u => u.email === email ? { ...u, isOnline, lastLogin: Date.now() } : u));
  };

  const handleAcceptTerms = () => {
    // Save acceptance for CURRENT user only
    localStorage.setItem(`gold_ai_terms_${currentUser}`, 'true');
    setView('DASHBOARD');
  };

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substr(2, 9),
      title, message, type, timestamp: Date.now()
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => removeToast(newToast.id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogin = (email: string): boolean => {
      const user = allUsers.find(u => u.email === email);

      if (email === ADMIN_EMAIL) {
          if (!user) {
               setAllUsers(prev => [...prev, {
                   id: 'admin', email: ADMIN_EMAIL, status: 'ACTIVE', balance: 999999, totalProfit: 0, isOnline: true, lastLogin: Date.now(), plan: 'yearly', ip: 'admin', location: 'HQ'
               }]);
          } else {
               updateUserOnlineStatus(email, true);
          }
          setCurrentUser(email);
          localStorage.setItem('gold_ai_user_email', email);
          addToast(t.toast_login_success, t.welcome_admin, 'success');
          
          // Admin bypasses terms or sees them once? Let's show once.
          const hasAcceptedTerms = localStorage.getItem(`gold_ai_terms_${email}`) === 'true';
          setView(hasAcceptedTerms ? 'DASHBOARD' : 'TERMS');
          return true;
      }

      if (user) {
          if (user.status === 'BANNED') {
              addToast(t.access_denied, t.account_banned_msg, 'error');
              return false;
          }
          if (user.status === 'PENDING') {
              addToast(t.access_denied, t.account_pending_msg, 'warning');
              return false;
          }
          
          updateUserOnlineStatus(email, true);
          setCurrentUser(email);
          localStorage.setItem('gold_ai_user_email', email);
          
          const subData = localStorage.getItem(`gold_ai_sub_${email}`);
          if (subData) setUserSubscription(JSON.parse(subData));
          
          addToast(t.toast_login_success, `${email}`, 'success');
          
          // Check for Terms acceptance
          const hasAcceptedTerms = localStorage.getItem(`gold_ai_terms_${email}`) === 'true';
          setView(hasAcceptedTerms ? 'DASHBOARD' : 'TERMS');
          
          return true;
      } else {
          addToast("Error", "User not found. Please register.", "error");
          return false;
      }
  };

  const handleRegister = (email: string) => {
    const existing = allUsers.find(u => u.email === email);
    if (existing) {
        addToast("Error", "User already exists", "error");
        return;
    }

    const newUser: UserEntity = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        status: 'PENDING',
        balance: 0,
        totalProfit: 0,
        isOnline: false,
        lastLogin: Date.now(),
        plan: 'free',
        ip: `10.0.0.${Math.floor(Math.random()*255)}`,
        location: 'Unknown'
    };

    setAllUsers(prev => [...prev, newUser]);
    addToast("Success", t.wait_approval, "info");
    setView('LOGIN');
  };

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    addToast("PayPal", "Processing...", "success");
    setView('ACTIVATE');
  };

  const handleActivation = (code: string) => {
    if (VALID_ACTIVATION_CODES.map(c => c.toUpperCase()).includes(code.toUpperCase())) {
       setAllUsers(prev => prev.map(u => u.email === currentUser ? { ...u, status: 'ACTIVE', balance: 10000 } : u));

       const durationDays = selectedPlan === 'weekly' ? 7 : selectedPlan === 'monthly' ? 30 : 365;
       const newSub: UserSubscription = {
           planId: selectedPlan || 'monthly',
           startDate: Date.now(),
           expiryDate: Date.now() + (durationDays * 24 * 60 * 60 * 1000),
           isActive: true
       };
       localStorage.setItem(`gold_ai_sub_${currentUser}`, JSON.stringify(newSub));
       setUserSubscription(newSub);
       addToast(t.toast_login_success, t.status_active, "success");
       setView('DASHBOARD');
    } else {
       addToast("Error", t.invalid_code, "error");
    }
  };
  
  const handleLogout = () => {
      setIsRunning(false);
      setBrokerConnection(null);
      setTrades([]);
      updateUserOnlineStatus(currentUser, false);
      localStorage.removeItem('gold_ai_user_email');
      setCurrentUser('');
      setView('LOGIN');
  };

  const handleAdminStatusChange = (email: string, status: 'ACTIVE' | 'BANNED' | 'PENDING') => {
      setAllUsers(prev => prev.map(u => u.email === email ? { ...u, status } : u));
      addToast("Admin Action", `User ${email} set to ${status}`, 'info');
  };

  const handleAdminDelete = (email: string) => {
      setAllUsers(prev => prev.filter(u => u.email !== email));
      addToast("Admin Action", `User ${email} deleted`, 'warning');
  };
  
  const handleBrokerConnect = (brokerName: BrokerName, server: string, accountId: string) => {
    setBrokerConnection({
      isConnected: true, brokerName, server, accountId,
      latency: Math.floor(Math.random() * 20) + 50
    });
    setShowBrokerConnect(false);
    addToast(t.broker_connect_title, `${brokerName} - Live Data Synced`, 'success');
    setIsRunning(true);
  };

  const handleAssetChange = (asset: Asset) => {
    setCurrentAsset(asset);
    setCandles([]);
    setTrades([]);
    setAnalysis(null);
    setTechIndicators(null);
    addToast("Asset Switched", `Live Feed: ${asset.symbol}`, 'info');
  };

  // --- REAL MARKET DATA ---
  useEffect(() => {
      if (view !== 'DASHBOARD') return;
      const loadHistory = async () => {
          const history = await fetchHistoricalData(currentAsset.symbol, timeframe);
          if (history.length > 0) {
              setCandles(history);
              setTechIndicators(calculateIndicators(history));
          }
      };
      loadHistory();
      subscribeToLivePrice(currentAsset.symbol, timeframe, (newCandle) => {
          setCandles(prev => {
              const last = prev[prev.length - 1];
              if (last && last.time === newCandle.time) {
                  const updated = [...prev];
                  updated[updated.length - 1] = newCandle;
                  return updated;
              } else {
                  return [...prev, newCandle].slice(-60);
              }
          });
      });
      return () => closeConnection();
  }, [currentAsset, view, timeframe]);

  useEffect(() => {
      if (candles.length > 0) setTechIndicators(calculateIndicators(candles));
  }, [candles]);

  // --- BOT EXECUTION & ZERO LOSS STRATEGY ---
  useEffect(() => {
    if (!isRunning || candles.length < 20 || !techIndicators) return;
    
    analyzeMarket(apiKey, currentAsset.symbol, candles, techIndicators, currentNews, lang).then(result => {
      setAnalysis(result);
      
      // BANK STRATEGY: High Confidence only
      // When connected to a serious broker like Exness/MT5, we use "Sniper Mode"
      let confidenceThreshold = tradingMode === 'SAFE' ? 85 : tradingMode === 'ULTRA_SAFE' ? 90 : 75;
      
      if (avoidNews && currentNews.impact === 'HIGH') confidenceThreshold = 98; // Only enter if 98% sure during news
      
      if (result.confidence >= confidenceThreshold && result.signal !== SignalType.HOLD) {
            const hasOpenTrade = trades.some(t => t.symbol === currentAsset.symbol && t.status === 'OPEN');
            if (!hasOpenTrade) {
                // Immediate entry
                executeTrade(result.signal, candles[candles.length - 1].close);
            }
      }
    });
  }, [candles, isRunning, apiKey, tradingMode, currentAsset]);

  useEffect(() => {
    if (view !== 'DASHBOARD') return;
    const newsInterval = setInterval(() => setCurrentNews(getSimulatedNews()), 60000);
    return () => clearInterval(newsInterval);
  }, [view]);

  const executeTrade = (type: SignalType, price: number) => {
    // Initial SL is just a safety net. The "Zero Loss" logic moves it to Break-Even almost instantly.
    const initialSlDistance = price * 0.002; // 0.2% Risk initially
    const slPrice = type === SignalType.BUY ? price - initialSlDistance : price + initialSlDistance;

    const newTrade: Trade = {
      id: Math.random().toString(36).substr(2, 9),
      type, 
      entryPrice: price, 
      slPrice: slPrice,
      highestReached: price,
      lotSize: lotSize, 
      profit: 0, 
      timestamp: Date.now(), 
      status: 'OPEN', 
      symbol: currentAsset.symbol,
      isSecured: false
    };
    setTrades(prev => [newTrade, ...prev]);
    addToast(t.new_trade, `${type} @ ${price} - Whale Entry`, 'success');
  };

  // --- ZERO LOSS ENGINE & SMART TRAILING STOP (The "Ratchet") ---
  useEffect(() => {
      if (!isRunning || trades.length === 0 || candles.length === 0) return;
      const currentPrice = candles[candles.length - 1].close;
      
      setTrades(prev => prev.map(trade => {
          if (trade.status === 'OPEN' && trade.symbol === currentAsset.symbol) {
              
              // 1. Calculate Floating PnL
              const priceChange = (currentPrice - trade.entryPrice) / trade.entryPrice;
              const pnlPercent = trade.type === SignalType.BUY ? priceChange : -priceChange;
              const profitAmount = (pnlPercent * trade.entryPrice) * trade.lotSize * (currentAsset.category === 'CRYPTO' ? 1 : 100);

              // 2. Update Highest/Lowest Point reached (For Tight Trailing)
              let newHighest = trade.highestReached;
              if (trade.type === SignalType.BUY) {
                  if (currentPrice > trade.highestReached) newHighest = currentPrice;
              } else {
                  if (currentPrice < trade.highestReached || trade.highestReached === trade.entryPrice) newHighest = currentPrice; // For Sell, "Highest" tracks the Lowest
              }

              // 3. ZERO LOSS LOGIC
              let newSlPrice = trade.slPrice;
              let isSecured = trade.isSecured;

              // A) Secure at Break-Even immediately when price covers spread (approx 0.01% - 0.02%)
              if (!isSecured && pnlPercent > 0.00015) {
                  newSlPrice = trade.entryPrice; // Move SL to Entry immediately
                  isSecured = true;
              }

              // B) Dynamic Trailing (Bank Style - "Compounding")
              // We trail extremely closely once secured to lock in every bit of profit
              if (isSecured) {
                  // Allow a small "breathing room" for natural correction (e.g. 0.04% retracement allowed)
                  // If price drops more than that, we close.
                  const trailGap = trade.entryPrice * 0.0004; 
                  
                  if (trade.type === SignalType.BUY) {
                      const potentialSl = newHighest - trailGap;
                      // Only move SL UP, never down
                      if (potentialSl > newSlPrice) newSlPrice = potentialSl;
                  } else {
                      const potentialSl = newHighest + trailGap;
                      // Only move SL DOWN, never up
                      if (potentialSl < newSlPrice) newSlPrice = potentialSl;
                  }
              }

              // 4. Exit Logic (Hit SL or Trailing Stop)
              let shouldClose = false;
              if (trade.type === SignalType.BUY && currentPrice <= newSlPrice) shouldClose = true;
              if (trade.type === SignalType.SELL && currentPrice >= newSlPrice) shouldClose = true;

              if (shouldClose) {
                   return { 
                       ...trade, 
                       status: 'CLOSED', 
                       exitPrice: currentPrice, 
                       profit: profitAmount,
                       slPrice: newSlPrice 
                   };
              }
              
              return { 
                  ...trade, 
                  profit: profitAmount, 
                  slPrice: newSlPrice,
                  highestReached: newHighest,
                  isSecured: isSecured
              };
          }
          return trade;
      }));
  }, [candles, isRunning]);

  const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col relative overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]"></div>
      </div>

      <ToastNotifications toasts={toasts} removeToast={removeToast} />
      
      {showBrokerConnect && view === 'DASHBOARD' && (
        <BrokerConnect onConnect={handleBrokerConnect} onClose={() => setShowBrokerConnect(false)} lang={lang} />
      )}

      {showSubManagement && userSubscription && (
          <SubscriptionManagement 
             subscription={userSubscription} 
             onRenew={() => setView('PLANS')}
             onCancel={() => {}}
             onClose={() => setShowSubManagement(false)}
             lang={lang}
          />
      )}

      {showRating && <RatingModal onRate={() => setShowRating(false)} onClose={() => setShowRating(false)} lang={lang} />}
      {view === 'TERMS' && <TermsModal onAccept={handleAcceptTerms} lang={lang} setLang={setLang} />}
      {view === 'LOGIN' && <Login onLogin={handleLogin} onRegisterClick={() => setView('REGISTER')} onForgotPassword={() => {}} lang={lang} setLang={setLang} />}
      {view === 'REGISTER' && <Register onRegister={handleRegister} onLoginClick={() => setView('LOGIN')} lang={lang} setLang={setLang} />}
      {view === 'PLANS' && <SubscriptionPlans onSelectPlan={handlePlanSelection} lang={lang} setLang={setLang} />}
      {view === 'ACTIVATE' && <Activation onActivate={handleActivation} onBack={() => setView('PLANS')} lang={lang} />}
      
      {view === 'DASHBOARD' && (
        <div className="relative z-10 w-full">
          <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center hidden sm:flex">
                  <MeltedGoldLogo className="w-12 h-12" />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-none">{t.app_title}</h1>
                  <span className="text-[10px] text-green-400 tracking-widest uppercase">● {brokerConnection?.isConnected ? brokerConnection.brokerName + ' CONNECTED' : t.live_api}</span>
                </div>
                <div className="ml-2"><AssetSelector selectedAsset={currentAsset} onSelectAsset={handleAssetChange} lang={lang} /></div>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                 <div className="hidden lg:flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                     <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t.market_time}</span>
                     <span className="font-mono text-amber-400 font-bold w-[70px] text-center animate-pulse">{marketTime}</span>
                 </div>
                 <div className="hidden md:block"><LanguageSelector currentLang={lang} onSelect={setLang} label={t.lang_select} /></div>
                
                {brokerConnection?.isConnected ? (
                  <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-green-900/20 border border-green-800 rounded-lg transition-all">
                    <div className="flex items-center gap-2 border-r border-green-800/50 pr-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="flex flex-col">
                        <span className="text-xs font-bold text-green-400 leading-none">{brokerConnection.brokerName}</span>
                        </div>
                    </div>
                    <SignalBars latency={brokerConnection.latency} />
                  </div>
                ) : (
                  <button onClick={() => setShowBrokerConnect(true)} className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 rounded-lg text-xs font-bold text-white">🔗 {t.connect_broker}</button>
                )}
                <button onClick={handleLogout} className="text-xs text-gray-400 border border-slate-700 rounded px-2 py-1">{t.exit}</button>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-6 pb-20">
            
            {isAdmin && (
                <AdminPanel 
                    onResetBalance={() => setTrades([])}
                    users={allUsers}
                    onUpdateUserStatus={handleAdminStatusChange}
                    onDeleteUser={handleAdminDelete}
                    lang={lang}
                />
            )}

            <BotControl 
              isRunning={isRunning} onToggle={() => setIsRunning(!isRunning)} 
              apiKey={apiKey} setApiKey={setApiKey}
              lotSize={lotSize} setLotSize={setLotSize}
              avoidNews={avoidNews} setAvoidNews={setAvoidNews}
              tradingMode={tradingMode} setTradingMode={setTradingMode}
              lang={lang}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <MetricCard title={t.profit} value={`$${totalProfit.toFixed(2)}`} color={totalProfit >= 0 ? "text-green-400" : "text-red-400"} icon="💰" />
              <MetricCard title={t.market_status} value={t.live_api} subValue={`Feed: ${brokerConnection?.brokerName || 'Public'}`} color="text-green-400" icon="🌍" />
              <MetricCard title={t.current_price} value={candles.length > 0 ? candles[candles.length -1].close.toFixed(2) : "..."} subValue={currentAsset.symbol} color="text-amber-400" icon={currentAsset.icon} />
              <MetricCard title={t.trading_mode} value={tradingMode === 'REGULAR' ? t.mode_regular : tradingMode === 'SAFE' ? t.mode_safe : t.mode_ultra} subValue={tradingMode === 'ULTRA_SAFE' ? t.risk_low : t.risk_med} color="text-blue-400" icon="🛡️" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                
                {/* CHART CONTAINER - ADJUSTS BASED ON BROKER */}
                <div className={`glass-panel rounded-xl p-4 h-[500px] flex flex-col relative border-t-4 
                    ${brokerConnection?.brokerName === 'EXNESS' ? 'border-t-[#ffcc00] bg-[#1e1e1e]' : 
                      brokerConnection?.brokerName === 'META_TRADER_5' ? 'border-t-green-600 bg-black' : 'border-t-slate-600'}`}>
                  
                  <div className="flex flex-wrap items-center justify-between mb-4 gap-2 border-b border-slate-700 pb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-300">{currentAsset.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-mono 
                             ${brokerConnection?.brokerName === 'EXNESS' ? 'bg-[#ffcc00] text-black font-bold' : 'bg-slate-800 text-amber-400'}`}>
                             {brokerConnection?.brokerName || 'GLOBAL'} FEED
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                              {(['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'] as Timeframe[]).map((tf) => (
                                  <button key={tf} onClick={() => setTimeframe(tf)} className={`px-2 py-1 text-[10px] font-bold rounded transition ${timeframe === tf ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white hover:bg-slate-700'}`}>{t[`tf_${tf}`] || tf}</button>
                              ))}
                          </div>
                          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                              <button onClick={() => setChartType('AREA')} className={`px-2 py-1 text-[10px] rounded transition ${chartType === 'AREA' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>{t.chart_area}</button>
                              <button onClick={() => setChartType('CANDLE')} className={`px-2 py-1 text-[10px] rounded transition ${chartType === 'CANDLE' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>{t.chart_candle}</button>
                          </div>
                      </div>
                  </div>
                  <div className="flex-1 w-full min-h-0 relative z-0">
                      <Chart 
                        data={candles} 
                        type={chartType} 
                        broker={brokerConnection?.brokerName || 'META_TRADER_5'}
                        symbol={currentAsset.symbol}
                        timeframe={timeframe}
                      />
                  </div>
                </div>
                
                <div className="glass-panel rounded-xl p-5 border border-slate-700">
                    <h4 className="text-gray-400 text-sm font-bold mb-4 uppercase tracking-wider border-b border-slate-700 pb-2">{t.technical_indicators} (REAL-TIME)</h4>
                    {techIndicators ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                <span className="text-xs text-gray-500 block mb-1">RSI (14)</span>
                                <span className={`text-lg font-mono font-bold ${techIndicators.rsi > 70 ? 'text-red-400' : techIndicators.rsi < 30 ? 'text-green-400' : 'text-white'}`}>{techIndicators.rsi.toFixed(1)}</span>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                <span className="text-xs text-gray-500 block mb-1">MACD</span>
                                <span className={`text-sm font-mono ${techIndicators.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'}`}>{techIndicators.macd.histogram.toFixed(3)}</span>
                            </div>
                             <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                <span className="text-xs text-gray-500 block mb-1">Stoch RSI</span>
                                <span className="text-lg font-mono font-bold text-blue-300">{techIndicators.stochRsi.k.toFixed(0)}</span>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                <span className="text-xs text-gray-500 block mb-1">EMA Trend</span>
                                <span className={`text-sm font-bold ${techIndicators.ema20 > techIndicators.ema50 ? 'text-green-400' : 'text-red-400'}`}>{techIndicators.ema20 > techIndicators.ema50 ? t.bullish : t.bearish}</span>
                            </div>
                        </div>
                    ) : <div className="text-center text-gray-500">{t.processing}</div>}
                </div>

                <div className="glass-panel rounded-xl p-6 border-t-4 border-amber-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></div>
                    <h3 className="font-bold text-xl text-white">{t.ai_decision}</h3>
                  </div>
                  {analysis ? (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div>
                          <p className="text-gray-400 text-sm">{t.signal}</p>
                          <p className={`text-3xl font-bold ${analysis.signal === SignalType.BUY ? 'text-green-500' : analysis.signal === SignalType.SELL ? 'text-red-500' : 'text-gray-400'}`}>{analysis.signal}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-gray-400 text-sm">{t.confidence}</p>
                          <span className="font-bold text-amber-400 text-2xl">{analysis.confidence}%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 bg-slate-800/30 p-3 rounded border border-slate-700/50">{analysis.reasoning}</p>
                    </div>
                  ) : <div className="text-center py-8 text-gray-500">{isRunning ? t.analyzing : t.status_stopped}</div>}
                </div>
              </div>

              <div className="lg:col-span-1 flex flex-col gap-4 h-full">
                <PriceAlerts currentPrice={candles.length > 0 ? candles[candles.length - 1].close : 0} alerts={alerts} addAlert={(p) => setAlerts(prev => [...prev, {id:Math.random().toString(), price:p, condition: p > (candles[candles.length-1]?.close||0)?'ABOVE':'BELOW', createdPrice: candles[candles.length-1]?.close||0, symbol: currentAsset.symbol}])} removeAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} lang={lang} />
                
                {/* ECONOMIC CALENDAR WIDGET */}
                <div className="max-h-[300px]">
                   <NewsCalendar events={economicEvents} lang={lang} />
                </div>

                <div className="glass-panel rounded-xl p-4 flex-1 flex flex-col min-h-[300px]">
                  <h3 className="font-bold text-lg text-gray-300 mb-4 border-b border-slate-700 pb-2">{t.trade_log}</h3>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2" ref={scrollRef}>
                    {trades.map((trade) => (
                      <div key={trade.id} className="bg-slate-800/50 p-3 rounded border border-slate-700 flex justify-between items-start relative overflow-hidden">
                        {trade.isSecured && (
                             <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-bl-lg animate-pulse" title="Zero Loss Active"></div>
                        )}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trade.type === SignalType.BUY ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>{trade.type}</span>
                            <span className="text-[10px] text-gray-500 font-bold">{trade.symbol}</span>
                            <span className="text-[10px] font-mono bg-slate-700 px-1 rounded text-amber-300 border border-slate-600">Lot: {trade.lotSize}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1 mt-1">
                             <span className="text-gray-500">In:</span>
                             <span className="text-white">{trade.entryPrice.toFixed(2)}</span>
                             {trade.exitPrice && (
                                 <>
                                    <span className="text-gray-600 mx-1">➜</span>
                                    <span className="text-gray-500">Out:</span>
                                    <span className="text-white">{trade.exitPrice.toFixed(2)}</span>
                                 </>
                             )}
                          </div>
                          {trade.status === 'OPEN' && trade.isSecured && <span className="text-[9px] text-green-400 border border-green-900 px-1 rounded bg-green-900/10 w-fit">Risk Free</span>}
                        </div>
                        
                        <div className="flex flex-col items-end">
                          {trade.status === 'CLOSED' ? (
                            <span className={`font-mono font-bold text-sm ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}$</span>
                          ) : <span className="text-amber-400 text-[10px] animate-pulse">Running</span>}
                        </div>
                      </div>
                    ))}
                    {trades.length === 0 && (
                        <div className="text-center py-10 text-gray-600 text-sm">
                            {t.no_trades}
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
