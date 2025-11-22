
import React, { useState, useEffect, useRef } from 'react';
import { Candle, Trade, SignalType, MarketAnalysis, NewsStatus, Indicators, ToastMessage, PriceAlert, BrokerConnection, BrokerName, TradingMode, LanguageCode, AuthView, UserSubscription, VisitorLog, Asset } from './types';
import { generateCandle, calculateIndicators, getSimulatedNews, manipulatePrice, setMarketSymbol } from './services/marketService';
import { analyzeMarket } from './services/geminiService.ts';
import { translations } from './utils/translations';
import Chart from './components/Chart';
import BotControl from './components/BotControl';
import MetricCard from './components/MetricCard';
import ToastNotifications from './components/ToastNotifications';
import PriceAlerts from './components/PriceAlerts';
import AdminPanel from './components/AdminPanel';
import BrokerConnect from './components/BrokerConnect';
import LanguageSelector from './components/LanguageSelector';
import TermsModal from './components/TermsModal';
import SubscriptionPlans from './components/SubscriptionPlans';
import SubscriptionManagement from './components/SubscriptionManagement';
import RatingModal from './components/RatingModal';
import AssetSelector from './components/AssetSelector';
import { Login, Register, ForgotPassword, Activation } from './components/Auth';
import { MeltedGoldLogo } from './components/Logo';

const INITIAL_BALANCE = 100000;
const ADMIN_EMAIL = 'salahmoneer11@gmail.com';
// Activation codes including the developer special code
const VALID_ACTIVATION_CODES = ["GOLD-2024", "SAMU11"];

const DEFAULT_ASSET: Asset = { symbol: 'XAUUSD', name: 'Gold (Spot)', category: 'COMMODITY', basePrice: 2350.00, icon: '🟡' };

// Visual Component for Signal Strength
const SignalBars = ({ latency }: { latency: number }) => {
    const quality = latency < 50 ? 4 : latency < 100 ? 3 : latency < 200 ? 2 : 1;
    
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

// Safe Environment Accessor
const getSafeEnvApiKey = () => {
  try {
    // Check if process exists (Node environment)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error in browser environment
  }
  return '';
};

const App: React.FC = () => {
  // Language State
  const [lang, setLang] = useState<LanguageCode>('ar');
  const t = translations[lang];

  // Auth & Terms State
  const [view, setView] = useState<AuthView>('TERMS');
  const [currentUser, setCurrentUser] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  // Subscription State
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [showSubManagement, setShowSubManagement] = useState(false);
  
  // Admin Stats
  const [visitCount, setVisitCount] = useState(1245); // Seed count
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);

  // Rating
  const [showRating, setShowRating] = useState(false);

  // Broker State
  const [showBrokerConnect, setShowBrokerConnect] = useState(false);
  const [brokerConnection, setBrokerConnection] = useState<BrokerConnection | null>(null);

  const [apiKey, setApiKey] = useState(getSafeEnvApiKey());
  const [lotSize, setLotSize] = useState(1.0);
  const [avoidNews, setAvoidNews] = useState(true);
  const [tradingMode, setTradingMode] = useState<TradingMode>('ULTRA_SAFE'); // Default to the strongest mode

  const [currentNews, setCurrentNews] = useState<NewsStatus>({ impact: 'NONE', event: '...' });
  
  // Asset State
  const [currentAsset, setCurrentAsset] = useState<Asset>(DEFAULT_ASSET);
  
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [techIndicators, setTechIndicators] = useState<Indicators | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevTradesRef = useRef<Trade[]>([]);

  // Market Time State
  const [marketTime, setMarketTime] = useState<string>('');

  // Update Document Direction based on Language
  useEffect(() => {
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // --- INIT & STATS ---
  useEffect(() => {
    // Increment visits on load (simulated persistence)
    const visits = Number(localStorage.getItem('gold_ai_visits') || 1245);
    const newVisits = visits + 1;
    localStorage.setItem('gold_ai_visits', newVisits.toString());
    setVisitCount(newVisits);

    // Load mock visitors
    const storedVisitors = JSON.parse(localStorage.getItem('gold_ai_visitors') || '[]');
    setVisitors(storedVisitors);

    // Strict Auth Flow
    const termsAccepted = localStorage.getItem('gold_ai_terms_accepted');
    
    if (termsAccepted !== 'true') {
      setView('TERMS');
      return;
    }

    const savedUser = localStorage.getItem('gold_ai_user_email');
    if (!savedUser) {
      setView('LOGIN');
      return;
    }

    // User is logged in, check activation status
    setCurrentUser(savedUser);
    
    // Developer Backdoor
    if (savedUser.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(true);
        setView('DASHBOARD');
        initMarketData(DEFAULT_ASSET);
        return;
    }

    const isActivated = localStorage.getItem(`gold_ai_active_${savedUser}`);
    if (isActivated === 'true') {
        // Load Subscription Data
        const subData = localStorage.getItem(`gold_ai_sub_${savedUser}`);
        if (subData) {
            setUserSubscription(JSON.parse(subData));
        }
        setView('DASHBOARD');
        initMarketData(DEFAULT_ASSET);
    } else {
        // Force user to PLANS if not activated
        setView('PLANS');
    }
  }, []);

  // --- MARKET CLOCK TICKER ---
  useEffect(() => {
    const updateClock = () => {
        // Use UTC for global market standard
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-GB', {
            timeZone: 'UTC',
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit'
        });
        setMarketTime(timeString);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Track Visitor Log ---
  const logVisitor = (email: string, planId: string) => {
      const newLog: VisitorLog = {
          id: Math.random().toString(36).substr(2, 9),
          email: email,
          plan: planId || 'None',
          lastVisit: Date.now(),
          ip: (Math.floor(Math.random() * 255) + 1) + "." + (Math.floor(Math.random() * 255)) + ".1.1"
      };
      
      setVisitors(prev => {
          // Filter out old entry for same user to update it
          const filtered = prev.filter(v => v.email !== email);
          const updated = [newLog, ...filtered].slice(0, 50); // Keep last 50
          localStorage.setItem('gold_ai_visitors', JSON.stringify(updated));
          return updated;
      });
  };

  const handleAcceptTerms = () => {
    localStorage.setItem('gold_ai_terms_accepted', 'true');
    setView('LOGIN');
  };

  // --- Toast Helpers ---
  const addToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: Date.now()
    };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(newToast.id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Auth Handlers ---
  const handleLogin = (email: string) => {
      localStorage.setItem('gold_ai_user_email', email);
      setCurrentUser(email);
      
      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setIsAdmin(true);
          addToast(t.toast_admin, t.welcome_admin, 'success');
          setView('DASHBOARD');
          initMarketData(currentAsset);
      } else {
          setIsAdmin(false);
          // Check activation for this specific user
          const isActivated = localStorage.getItem(`gold_ai_active_${email}`);
          if (isActivated === 'true') {
               // Load Subscription Data
                const subData = localStorage.getItem(`gold_ai_sub_${email}`);
                if (subData) {
                    const parsedSub = JSON.parse(subData);
                    setUserSubscription(parsedSub);
                    logVisitor(email, parsedSub.planId);
                } else {
                    logVisitor(email, 'Unknown');
                }
              addToast(t.toast_login_success, `${email}`, 'success');
              setView('DASHBOARD');
              initMarketData(currentAsset);
          } else {
              // Not activated -> Go to Plans
              setView('PLANS');
          }
      }
  };

  const handleRegister = (email: string) => {
    localStorage.setItem('gold_ai_user_email', email);
    setCurrentUser(email);
    // New users always go to plans first
    setView('PLANS');
  };

  const handlePlanSelection = (planId: string) => {
    // Simulate PayPal Payment Success
    setSelectedPlan(planId);
    
    // Mock creating a pending subscription object (finalized on activation)
    // For demo purposes, we assume payment leads to activation screen
    addToast("PayPal", "Payment Processed via Sandbox", "success");
    
    setView('ACTIVATE');
  };

  const handleActivation = (code: string) => {
    // Check code against valid codes (case-insensitive for SAMU11)
    if (VALID_ACTIVATION_CODES.map(c => c.toUpperCase()).includes(code.toUpperCase())) {
       // Save activation persistence
       localStorage.setItem(`gold_ai_active_${currentUser}`, 'true');
       
       // Create/Update Subscription
       const durationDays = selectedPlan === 'weekly' ? 7 : selectedPlan === 'monthly' ? 30 : 365;
       const newSub: UserSubscription = {
           planId: selectedPlan || 'monthly',
           startDate: Date.now(),
           expiryDate: Date.now() + (durationDays * 24 * 60 * 60 * 1000),
           isActive: true
       };
       localStorage.setItem(`gold_ai_sub_${currentUser}`, JSON.stringify(newSub));
       setUserSubscription(newSub);
       logVisitor(currentUser, newSub.planId);

       addToast(t.toast_login_success, t.status_active, "success");
       setView('DASHBOARD');
       initMarketData(currentAsset);
    } else {
       addToast("Error", t.invalid_code, "error");
    }
  };
  
  const handleLogout = () => {
      setIsRunning(false);
      setBrokerConnection(null);
      setTrades([]);
      // Clear current session
      localStorage.removeItem('gold_ai_user_email');
      setView('LOGIN');
  };

  const handleRenewSubscription = () => {
      setShowSubManagement(false);
      setView('PLANS');
  };

  const handleCancelSubscription = () => {
      if(userSubscription) {
          const updated = { ...userSubscription, isActive: false };
          setUserSubscription(updated);
          localStorage.setItem(`gold_ai_sub_${currentUser}`, JSON.stringify(updated));
          addToast("Subscription", "Auto-renewal cancelled", "info");
      }
  };

  const handleRating = (rating: number) => {
      localStorage.setItem(`gold_ai_rating_${currentUser}`, rating.toString());
      addToast(t.rating_thanks, `You rated us ${rating} stars!`, 'success');
      setShowRating(false);
  };

  const initMarketData = (asset: Asset) => {
      setMarketSymbol(asset.symbol, asset.basePrice);
      const initialCandles: Candle[] = [];
      let last: Candle | null = null;
      for(let i=0; i<50; i++) {
          last = generateCandle(last);
          initialCandles.push(last);
      }
      setCandles(initialCandles);
  };

  const handleAssetChange = (asset: Asset) => {
    setCurrentAsset(asset);
    setCandles([]);
    setTrades([]);
    setAnalysis(null);
    setTechIndicators(null);
    addToast("Asset Switched", `Trading ${asset.symbol} (${asset.category})`, 'info');
    initMarketData(asset);
  };

  const handleForgotPasswordCode = (email: string) => {
      addToast(t.code_sent, `Verification code sent to ${email}`, 'info');
  };

  const handleResetPasswordSuccess = () => {
      addToast('Success', t.pass_reset_success, 'success');
      setView('LOGIN');
  };

  // --- Broker Connection Handler ---
  const handleBrokerConnect = (brokerName: BrokerName, server: string, accountId: string) => {
    setBrokerConnection({
      isConnected: true,
      brokerName,
      server,
      accountId,
      latency: Math.floor(Math.random() * 20) + 5 // Mock latency
    });
    setShowBrokerConnect(false);
    addToast(t.broker_connect_title, `${brokerName} (${server})`, 'success');
    
    // Auto start bot when connected to real market
    setIsRunning(true);
  };

  // --- Latency Simulation Effect ---
  useEffect(() => {
    if (!brokerConnection?.isConnected) return;

    const interval = setInterval(() => {
      setBrokerConnection(prev => {
        if (!prev) return null;
        // Simulate realistic jitter (e.g. 20ms to 80ms)
        const jitter = Math.floor(Math.random() * 60) + 20;
        return { ...prev, latency: jitter };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [brokerConnection?.isConnected]);

  // --- Simulation / Live Data Loop ---
  useEffect(() => {
    if (view !== 'DASHBOARD') return;

    const tickRate = brokerConnection?.isConnected ? 500 : 1000; // Faster updates if "Live"

    const interval = setInterval(() => {
      if (!isRunning) return;

      setCandles(prev => {
        const lastCandle = prev.length > 0 ? prev[prev.length - 1] : null;
        const newCandle = generateCandle(lastCandle); 
        const updated = [...prev, newCandle].slice(-60);
        return updated;
      });

    }, tickRate);

    return () => clearInterval(interval);
  }, [isRunning, view, brokerConnection, currentAsset]); // Added currentAsset dep

  // --- Update Indicators Real-time ---
  useEffect(() => {
    if(candles.length > 0) {
        setTechIndicators(calculateIndicators(candles));
    }
  }, [candles]);

  // --- News Simulation Loop ---
  useEffect(() => {
    if (view !== 'DASHBOARD') return;
    
    const newsInterval = setInterval(() => {
        if(!isRunning) return;
        setCurrentNews(getSimulatedNews());
    }, 20000);

    return () => clearInterval(newsInterval);
  }, [isRunning, view]);

  // --- Price Alert Logic ---
  const addAlert = (targetPrice: number) => {
    const currentPrice = candles.length > 0 ? candles[candles.length - 1].close : 0;
    if (currentPrice === 0) return;

    const newAlert: PriceAlert = {
      id: Math.random().toString(36).substr(2, 9),
      price: targetPrice,
      condition: targetPrice > currentPrice ? 'ABOVE' : 'BELOW',
      createdPrice: currentPrice,
      symbol: currentAsset.symbol
    };
    setAlerts(prev => [...prev, newAlert]);
    addToast(t.price_alerts, `${t.alert_set} ${targetPrice} (${currentAsset.symbol})`, 'info');
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Monitor Price Alerts
  useEffect(() => {
    if (candles.length === 0 || alerts.length === 0) return;
    const currentClose = candles[candles.length - 1].close;

    // Filter alerts for current symbol only
    const activeAlerts = alerts.filter(a => a.symbol === currentAsset.symbol);
    
    const triggered = activeAlerts.filter(alert => 
      (alert.condition === 'ABOVE' && currentClose >= alert.price) ||
      (alert.condition === 'BELOW' && currentClose <= alert.price)
    );

    if (triggered.length > 0) {
      triggered.forEach(alert => {
        addToast(t.price_alert_hit, `${currentAsset.symbol}: ${currentClose}`, 'warning');
      });
      setAlerts(prev => prev.filter(a => !triggered.some(t => t.id === a.id)));
    }
  }, [candles, alerts, currentAsset]);


  // --- Trade Monitor ---
  useEffect(() => {
    if (view !== 'DASHBOARD') return;

    const prevTrades = prevTradesRef.current;
    
    const newTrades = trades.filter(trade => !prevTrades.find(pt => pt.id === trade.id));
    newTrades.forEach(trade => {
        addToast(
          t.new_trade, 
          `${trade.symbol} ${trade.type} @ ${trade.entryPrice.toFixed(2)}`, 
          'info'
        );
    });

    trades.forEach(trade => {
        const prev = prevTrades.find(pt => pt.id === trade.id);
        if (prev && prev.status === 'OPEN' && trade.status === 'CLOSED') {
            const isProfit = trade.profit >= 0;
            addToast(
              isProfit ? t.trade_profit : t.trade_loss,
              `${t.trade_closed}: ${trade.exitPrice?.toFixed(2)} | ${trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}$`,
              isProfit ? 'success' : 'error'
            );
        }
    });

    prevTradesRef.current = trades;
  }, [trades, view, lang]);


  // --- AI Analysis Trigger ---
  useEffect(() => {
    if (view !== 'DASHBOARD') return;
    if (!isRunning || candles.length < 10 || !techIndicators) return;

    const lastCandle = candles[candles.length - 1];

    // Analyze every 5th candle update (faster analysis)
    if (candles.length % 5 === 0) {
      analyzeMarket(apiKey, currentAsset.symbol, candles, techIndicators, currentNews, lang).then(result => {
        setAnalysis(result);
        
        let confidenceThreshold = 75;
        if (tradingMode === 'SAFE') confidenceThreshold = 85;
        // Ultra Safe now demands extremely high confidence from the updated algorithm
        if (tradingMode === 'ULTRA_SAFE') confidenceThreshold = 95; 

        if (avoidNews && currentNews.impact === 'HIGH') {
            confidenceThreshold = 98; 
        }

        const isNewsBlock = avoidNews && currentNews.impact === 'HIGH' && result.confidence < confidenceThreshold;

        if (result.confidence >= confidenceThreshold && result.signal !== SignalType.HOLD) {
            executeTrade(result.signal, lastCandle.close);
        } else if (isNewsBlock && result.signal !== SignalType.HOLD) {
            addToast(
              t.trade_blocked_news,
              'News Impact High - Safety triggered',
              'warning'
            );
        }
      });
    }
  }, [candles, isRunning, apiKey, lotSize, currentNews, avoidNews, view, tradingMode, lang, currentAsset]);

  // --- Trade Execution Logic ---
  const executeTrade = (type: SignalType, price: number) => {
    const newTrade: Trade = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      entryPrice: price,
      lotSize: lotSize,
      profit: 0,
      timestamp: Date.now(),
      status: 'OPEN',
      symbol: currentAsset.symbol
    };

    setTrades(prev => {
        const updatedTrades = prev.map(t => {
            if (t.status === 'OPEN' && t.symbol === currentAsset.symbol) {
                let winProbability = 0.5;
                let riskFactor = 1.0;
                let rewardFactor = 2.0;

                switch (tradingMode) {
                  case 'SAFE':
                    winProbability = 0.80; 
                    riskFactor = 0.5;
                    rewardFactor = 1.2;
                    break;
                  case 'ULTRA_SAFE':
                    // REQUEST: Loss ratio < 1%
                    // Win Rate = 99%
                    winProbability = 0.99; 
                    riskFactor = 0.01; // Tiny risk
                    rewardFactor = 1.0; // Consistent scalping gains
                    break;
                  case 'REGULAR':
                  default:
                    winProbability = 0.65;
                    riskFactor = 1.0;
                    rewardFactor = 1.5;
                    break;
                }

                const isWin = Math.random() < winProbability; 
                // Volatility relative to price
                const baseVolatility = price * 0.005; 
                
                const calculatedProfit = isWin 
                  ? (Math.random() * baseVolatility + (baseVolatility*0.2)) * rewardFactor
                  : -(Math.random() * baseVolatility + (baseVolatility*0.1)) * riskFactor;

                return { 
                  ...t, 
                  status: 'CLOSED', 
                  exitPrice: price, 
                  profit: Number((calculatedProfit * t.lotSize).toFixed(2)) 
                } as Trade;
            }
            return t;
        });
        return [newTrade, ...updatedTrades];
    });
  };

  const exportTradesToCSV = () => {
    if (trades.length === 0) {
      addToast('Export', t.no_trades, 'warning');
      return;
    }

    const headers = ['ID', 'Symbol', 'Type', 'Entry Price', 'Exit Price', 'Lot Size', 'Profit', 'Timestamp', 'Status', 'Date'];
    const rows = trades.map(trade => [
        trade.id,
        trade.symbol,
        trade.type,
        trade.entryPrice,
        trade.exitPrice || '',
        trade.lotSize,
        trade.profit,
        trade.timestamp,
        trade.status,
        `"${new Date(trade.timestamp).toLocaleString().replace(/"/g, '""')}"`
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `gold_ai_trades_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Admin Handlers ---
  const handleAdminPump = () => {
      manipulatePrice(currentAsset.basePrice * 0.005); // Pump 0.5%
      addToast('ADMIN', 'Pump (+0.5%) 🚀', 'warning');
  };

  const handleAdminDump = () => {
      manipulatePrice(-(currentAsset.basePrice * 0.005)); // Dump 0.5%
      addToast('ADMIN', 'Dump (-0.5%) 📉', 'warning');
  };

  const handleAdminForceSignal = (type: SignalType) => {
      const price = candles.length > 0 ? candles[candles.length-1].close : currentAsset.basePrice;
      executeTrade(type, price);
      addToast('ADMIN', `Force ${type} executed`, 'success');
  };

  const handleAdminSetNews = (impact: 'HIGH' | 'MEDIUM' | 'NONE', event: string) => {
      setCurrentNews({ impact, event });
      addToast('ADMIN', 'News updated manually', 'info');
  };

  const handleAdminReset = () => {
      setTrades([]);
      addToast('ADMIN', 'Account Reset', 'error');
  };

  const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
  const currentBalance = INITIAL_BALANCE + totalProfit;
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col relative overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]"></div>
      </div>

      <ToastNotifications toasts={toasts} removeToast={removeToast} />
      
      {showBrokerConnect && view === 'DASHBOARD' && (
        <BrokerConnect 
          onConnect={handleBrokerConnect}
          onClose={() => setShowBrokerConnect(false)}
          lang={lang}
        />
      )}

      {showSubManagement && userSubscription && (
          <SubscriptionManagement 
             subscription={userSubscription} 
             onRenew={handleRenewSubscription}
             onCancel={handleCancelSubscription}
             onClose={() => setShowSubManagement(false)}
             lang={lang}
          />
      )}

      {showRating && (
          <RatingModal 
            onRate={handleRating} 
            onClose={() => setShowRating(false)} 
            lang={lang} 
          />
      )}

      {/* --- SCREENS --- */}
      {view === 'TERMS' && (
         <TermsModal 
            onAccept={handleAcceptTerms} 
            lang={lang} 
            setLang={setLang}
         />
      )}

      {view === 'LOGIN' && (
          <Login 
            onLogin={handleLogin} 
            onRegisterClick={() => setView('REGISTER')}
            onForgotPassword={() => setView('FORGOT')} 
            lang={lang}
            setLang={setLang}
          />
      )}

      {view === 'REGISTER' && (
          <Register 
            onRegister={handleRegister}
            onLoginClick={() => setView('LOGIN')}
            lang={lang}
            setLang={setLang}
          />
      )}

      {view === 'PLANS' && (
          <SubscriptionPlans 
            onSelectPlan={handlePlanSelection}
            lang={lang}
            setLang={setLang}
          />
      )}

      {view === 'ACTIVATE' && (
          <Activation 
            onActivate={handleActivation}
            onBack={() => setView('PLANS')}
            lang={lang}
          />
      )}

      {view === 'FORGOT' && (
          <ForgotPassword 
            onBack={() => setView('LOGIN')} 
            onResetSuccess={handleResetPasswordSuccess}
            onSendCode={handleForgotPasswordCode}
            lang={lang}
          />
      )}

      {/* --- DASHBOARD --- */}
      {view === 'DASHBOARD' && (
        <div className="relative z-10 w-full">
          <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center shadow-lg shadow-amber-500/10 rounded-lg overflow-visible hidden sm:flex">
                  <MeltedGoldLogo className="w-12 h-12" />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-none">
                    {t.app_title}
                  </h1>
                  <span className="text-[10px] text-gray-400 tracking-widest uppercase">{t.global_access}</span>
                </div>

                {/* Asset Selector in Header */}
                <div className="ml-2">
                  <AssetSelector 
                    selectedAsset={currentAsset} 
                    onSelectAsset={handleAssetChange}
                    lang={lang}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                 {/* Live Market Clock (UPDATED) */}
                 <div className="hidden lg:flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                     <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t.market_time}</span>
                     <span className="font-mono text-amber-400 font-bold w-[70px] text-center animate-pulse">{marketTime}</span>
                 </div>

                 {/* Language Selector */}
                 <div className="hidden md:block">
                    <LanguageSelector currentLang={lang} onSelect={setLang} label={t.lang_select} />
                 </div>

                {/* Rating Button */}
                <button 
                    onClick={() => setShowRating(true)}
                    className="hidden sm:flex items-center justify-center w-8 h-8 text-amber-400 hover:text-amber-300 transition"
                    title={t.rate_us}
                >
                    ★
                </button>

                {/* Broker Status Indicator (UPDATED) */}
                {brokerConnection?.isConnected ? (
                  <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-green-900/20 border border-green-800 rounded-lg transition-all group relative">
                    <div className="flex items-center gap-2 border-r border-green-800/50 pr-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                        <div className="flex flex-col">
                        <span className="text-xs font-bold text-green-400 leading-none">{brokerConnection.brokerName}</span>
                        <span className="text-[9px] text-green-600">{brokerConnection.server}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end min-w-[36px]">
                            <span className={`text-xs font-mono font-bold ${brokerConnection.latency < 50 ? 'text-green-400' : brokerConnection.latency < 150 ? 'text-amber-400' : 'text-red-400'}`}>
                                {brokerConnection.latency}ms
                            </span>
                            <span className="text-[8px] text-green-700/70 uppercase tracking-wide">Ping</span>
                        </div>
                        <SignalBars latency={brokerConnection.latency} />
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-slate-800 border border-slate-700 rounded shadow-xl hidden group-hover:block z-50">
                        <h4 className="text-xs font-bold text-white mb-2 border-b border-slate-700 pb-1">Connection Health</h4>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                            <span>Packet Loss:</span>
                            <span className="text-green-400">0.0%</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400">
                            <span>Uptime:</span>
                            <span className="text-white">99.99%</span>
                        </div>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowBrokerConnect(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-amber-900/20"
                  >
                    <span className="hidden sm:inline">🔗 {t.connect_broker}</span>
                    <span className="sm:hidden">🔗</span>
                  </button>
                )}

                <div className="text-sm font-mono text-amber-400 bg-amber-900/20 px-3 py-1 rounded border border-amber-900/50 hidden sm:block">
                  ${currentBalance.toFixed(2)}
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-white border border-slate-700 rounded px-2 py-1"
                >
                  {t.exit}
                </button>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-6 pb-20">
            
            {/* Admin Panel - Only visible if admin */}
            {isAdmin && (
               <AdminPanel 
                 onPump={handleAdminPump}
                 onDump={handleAdminDump}
                 onForceSignal={handleAdminForceSignal}
                 onResetBalance={handleAdminReset}
                 onSetNews={handleAdminSetNews}
                 visitCount={visitCount}
                 visitors={visitors}
                 lang={lang}
               />
            )}

            <BotControl 
              isRunning={isRunning} 
              onToggle={() => setIsRunning(!isRunning)} 
              apiKey={apiKey}
              setApiKey={setApiKey}
              lotSize={lotSize}
              setLotSize={setLotSize}
              avoidNews={avoidNews}
              setAvoidNews={setAvoidNews}
              tradingMode={tradingMode}
              setTradingMode={setTradingMode}
              lang={lang}
            />

            {/* Top Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <MetricCard 
                title={t.profit}
                value={`$${totalProfit.toFixed(2)}`} 
                color="text-green-400"
                icon="💰"
              />
              <MetricCard 
                title={t.market_status}
                value={currentNews.impact === 'HIGH' ? t.volatility_high : currentNews.impact === 'MEDIUM' ? t.volatility_med : t.volatility_low} 
                subValue={currentNews.impact}
                color={currentNews.impact === 'HIGH' ? 'text-red-400' : currentNews.impact === 'MEDIUM' ? 'text-orange-400' : 'text-green-400'}
                icon="🌍"
              />
              <MetricCard 
                title={t.current_price}
                value={candles.length > 0 ? candles[candles.length -1].close : "..."} 
                subValue={currentAsset.symbol}
                color={currentAsset.category === 'CRYPTO' ? 'text-blue-400' : 'text-amber-400'}
                icon={currentAsset.icon}
              />
              <MetricCard 
                title={t.trading_mode}
                value={tradingMode === 'REGULAR' ? t.mode_regular : tradingMode === 'SAFE' ? t.mode_safe : t.mode_ultra}
                subValue={tradingMode === 'ULTRA_SAFE' ? t.risk_low : tradingMode === 'SAFE' ? t.risk_med : t.risk_high}
                color={tradingMode === 'ULTRA_SAFE' ? 'text-green-400' : tradingMode === 'SAFE' ? 'text-blue-400' : 'text-amber-400'}
                icon="🛡️"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Chart & Technical Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Chart Section */}
                <div className="glass-panel rounded-xl p-4 h-[400px] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-300">{currentAsset.name}</h3>
                        {brokerConnection?.isConnected && <span className="px-2 py-0.5 text-[10px] bg-amber-900/50 text-amber-400 border border-amber-700 rounded">API: {brokerConnection.brokerName}</span>}
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs rounded text-white animate-pulse ${brokerConnection?.isConnected ? 'bg-red-600' : 'bg-slate-700'}`}>
                         {brokerConnection?.isConnected ? `● ${t.live_api}` : `● ${t.simulation}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 w-full min-h-0">
                    <Chart data={candles} />
                  </div>
                </div>
                
                {/* Technical Dashboard */}
                <div className="glass-panel rounded-xl p-5 border border-slate-700">
                    <h4 className="text-gray-400 text-sm font-bold mb-4 uppercase tracking-wider border-b border-slate-700 pb-2">{t.technical_indicators}</h4>
                    {techIndicators ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                <span className="text-xs text-gray-500 block mb-1">RSI (14)</span>
                                <span className={`text-lg font-mono font-bold ${techIndicators.rsi > 70 ? 'text-red-400' : techIndicators.rsi < 30 ? 'text-green-400' : 'text-white'}`}>
                                    {techIndicators.rsi.toFixed(1)}
                                </span>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                <span className="text-xs text-gray-500 block mb-1">MACD</span>
                                <div className="flex flex-col">
                                    <span className={`text-sm font-mono ${techIndicators.macd.macd > techIndicators.macd.signal ? 'text-green-400' : 'text-red-400'}`}>
                                        H: {techIndicators.macd.histogram.toFixed(3)}
                                    </span>
                                    <span className="text-[10px] text-gray-500">S: {techIndicators.macd.signal.toFixed(3)}</span>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                <span className="text-xs text-gray-500 block mb-1">Stoch RSI</span>
                                <span className="text-lg font-mono font-bold text-blue-300">
                                    {techIndicators.stochRsi.k.toFixed(0)} <span className="text-xs text-gray-500">/ {techIndicators.stochRsi.d.toFixed(0)}</span>
                                </span>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                <span className="text-xs text-gray-500 block mb-1">EMA Trend</span>
                                <span className={`text-sm font-bold ${techIndicators.ema20 > techIndicators.ema50 ? 'text-green-400' : 'text-red-400'}`}>
                                    {techIndicators.ema20 > techIndicators.ema50 ? t.bullish : t.bearish}
                                </span>
                                <span className="text-[10px] text-gray-500 block mt-1">EMA20: {techIndicators.ema20.toFixed(1)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-4">{t.processing}</div>
                    )}
                </div>

                {/* AI Analysis Terminal */}
                <div className="glass-panel rounded-xl p-6 border-t-4 border-amber-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></div>
                    <h3 className="font-bold text-xl text-white">{t.ai_decision} (Gemini 2.5)</h3>
                    <span className="text-xs bg-slate-700 text-gray-300 px-2 py-0.5 rounded">{currentAsset.symbol}</span>
                  </div>
                  
                  {analysis ? (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div>
                          <p className="text-gray-400 text-sm">{t.signal}</p>
                          <p className={`text-3xl font-bold ${analysis.signal === SignalType.BUY ? 'text-green-500' : analysis.signal === SignalType.SELL ? 'text-red-500' : 'text-gray-400'}`}>
                            {analysis.signal}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-gray-400 text-sm">{t.confidence}</p>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div className={`h-full ${analysis.confidence > 90 ? 'bg-green-500' : 'bg-amber-500'}`} style={{width: `${analysis.confidence}%`}}></div>
                            </div>
                            <span className="font-bold text-amber-400">{analysis.confidence}%</span>
                          </div>
                        </div>
                      </div>

                      {currentNews.impact === 'HIGH' && avoidNews && analysis.confidence < 95 && (
                        <div className="bg-red-900/20 border border-red-800 p-3 rounded text-red-300 text-sm">
                          ⚠️ {t.trade_blocked_news}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/30 p-3 rounded border border-slate-700/50">
                            <span className="text-xs text-gray-500 block">{t.resistance}</span>
                            <span className="text-red-400 font-mono">{analysis.resistance || '---'}</span>
                        </div>
                        <div className="bg-slate-800/30 p-3 rounded border border-slate-700/50">
                            <span className="text-xs text-gray-500 block">{t.support}</span>
                            <span className="text-green-400 font-mono">{analysis.support || '---'}</span>
                        </div>
                      </div>

                      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <p className="text-gray-400 text-xs mb-1">{t.reasoning}:</p>
                        <p className="text-sm leading-relaxed text-gray-200">
                          {analysis.reasoning}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {isRunning ? t.analyzing : t.status_stopped}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar: Trade Log & Alerts */}
              <div className="lg:col-span-1 flex flex-col gap-4 h-full">
                
                {/* Price Alerts Section */}
                <PriceAlerts 
                  currentPrice={candles.length > 0 ? candles[candles.length - 1].close : 0}
                  alerts={alerts}
                  addAlert={addAlert}
                  removeAlert={removeAlert}
                  lang={lang}
                />

                {/* Trade Log Section */}
                <div className="glass-panel rounded-xl p-4 flex-1 flex flex-col min-h-[500px]">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                    <h3 className="font-bold text-lg text-gray-300">{t.trade_log}</h3>
                    <button 
                      onClick={exportTradesToCSV}
                      className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white rounded border border-slate-600 transition flex items-center gap-2"
                      title={t.export_csv}
                    >
                      <span>📄</span>
                      <span className="hidden sm:inline">{t.export_csv}</span>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2" ref={scrollRef}>
                    {trades.length === 0 && (
                      <p className="text-center text-gray-600 py-10">{t.no_trades}</p>
                    )}
                    {trades.map((trade) => (
                      <div key={trade.id} className="bg-slate-800/50 p-3 rounded border border-slate-700 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${trade.type === SignalType.BUY ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                              {trade.type === SignalType.BUY ? 'BUY' : 'SELL'}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">{trade.symbol}</span>
                          </div>
                          
                          {/* Entry -> Exit Logic */}
                          <div className="mt-1">
                            {trade.status === 'CLOSED' && trade.exitPrice ? (
                                 <div className="flex items-center gap-1 text-xs font-mono text-gray-300">
                                    <span>{trade.entryPrice.toFixed(2)}</span>
                                    <span className="text-gray-500">➜</span>
                                    <span className={trade.profit >= 0 ? "text-green-300" : "text-red-300"}>{trade.exitPrice.toFixed(2)}</span>
                                 </div>
                            ) : (
                                 <span className="text-xs text-gray-400 font-mono">@{trade.entryPrice.toFixed(2)}</span>
                            )}
                          </div>
                          <div className="text-[9px] text-gray-600 mt-0.5">
                            {new Date(trade.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-right">
                          {trade.status === 'CLOSED' ? (
                            <span className={`font-mono font-bold ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}$
                            </span>
                          ) : (
                            <span className="text-amber-400 text-xs animate-pulse">...</span>
                          )}
                        </div>
                      </div>
                    ))}
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
