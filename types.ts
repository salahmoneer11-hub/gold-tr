
export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export enum SignalType {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD',
}

export interface Trade {
  id: string;
  type: SignalType;
  entryPrice: number;
  exitPrice?: number;
  slPrice: number; // The current (potentially trailing) SL price
  initialSlPrice: number; // The original SL price when the trade was opened
  tpPrice?: number; // Take Profit price suggested by AI
  lotSize: number;
  profit: number;
  timestamp: number;
  status: 'OPEN' | 'CLOSED';
  symbol: string;
  breakevenTriggered?: boolean;
}

export interface Indicators {
  rsi: number;
  ma50: number;
  ema20: number;
  ema50: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  stochRsi: {
    k: number;
    d: number;
  };
}

export interface MarketAnalysis {
  signal: SignalType;
  confidence: number;
  reasoning: string;
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  support: number;
  resistance: number;
  suggested_sl: number; // Renamed for clarity
  suggested_tp: number; // Renamed for clarity
}

export type TradingMode = 'SCALPING' | 'SWING' | 'SAFE';

export interface BotConfig {
  riskPerTrade: number;
  lotSize: number;
  takeProfitPoints: number;
  stopLossPoints: number;
  aiModel: string;
  tradingMode: TradingMode;
}

export interface NewsStatus {
  impact: 'NONE' | 'MEDIUM' | 'HIGH';
  event: string;
}

export interface EconomicEvent {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  actual?: string;
  forecast: string;
  previous: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: number;
}

export interface PriceAlert {
  id: string;
  price: number;
  condition: 'ABOVE' | 'BELOW';
  createdPrice: number;
  symbol: string;
}

export type BrokerName = 'META_TRADER_5' | 'EXNESS' | 'BINANCE' | 'OKX' | 'BYBIT' | 'OANDA' | 'INTERACTIVE_BROKERS' | 'FOREX_COM';

export interface BrokerConnection {
  isConnected: boolean;
  brokerName: BrokerName;
  server: string;
  accountId: string;
  latency: number;
}

export type LanguageCode = 'ar' | 'en';

export type AuthView = 'TERMS' | 'LOGIN' | 'REGISTER' | 'PLANS' | 'ACTIVATE' | 'FORGOT' | 'DASHBOARD';

export interface SubscriptionPlan {
  id: string;
  price: number;
  period: string;
  savings?: string;
  isPopular?: boolean;
  features: string[];
}

export interface UserSubscription {
  planId: string;
  startDate: number; // Timestamp
  expiryDate: number; // Timestamp
  isActive: boolean;
}

export interface VisitorLog {
  id: string;
  email: string;
  plan: string;
  lastVisit: number;
  ip: string;
}

export type AssetCategory = 'COMMODITY' | 'CRYPTO';

export interface Asset {
  symbol: string;
  name: string;
  category: AssetCategory;
  basePrice: number;
  icon: string;
}

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';
export type ChartType = 'AREA' | 'CANDLE';

export type UserStatus = 'ACTIVE' | 'PENDING' | 'BANNED';

export interface UserEntity {
  id: string;
  email: string;
  status: UserStatus;
  balance: number;
  totalProfit: number;
  isOnline: boolean;
  lastLogin: number;
  plan: string;
  ip: string;
  location: string;
}

export interface UserFeedback {
  id: string;
  userEmail: string;
  rating: number;
  comment: string;
  timestamp: number;
}