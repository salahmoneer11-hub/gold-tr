
import { Candle, NewsStatus, Indicators } from '../types';

// Default: Gold
let currentSymbol = 'XAUUSD';
let currentPrice = 2350.00;
let trendDirection = 1;
let tickCount = 0;

export const setMarketSymbol = (symbol: string, basePrice: number) => {
  if (currentSymbol !== symbol) {
      currentSymbol = symbol;
      currentPrice = basePrice;
      // Add some random noise to the start so it doesn't look static
      currentPrice += (Math.random() - 0.5) * (basePrice * 0.002); 
  }
};

// --- ADMIN FUNCTION ---
export const manipulatePrice = (delta: number) => {
  currentPrice += delta;
};
// ----------------------

export const generateCandle = (lastCandle: Candle | null): Candle => {
  const now = new Date();
  
  // USE UTC TIME to match Global Platforms (Binance/MT5 Server Time)
  const timeString = now.toLocaleTimeString('en-GB', { 
    timeZone: 'UTC',
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  let open = lastCandle ? lastCandle.close : currentPrice;
  
  // INCREASED Volatility for faster signal generation
  const volatility = currentPrice * 0.0008; 
  const drift = trendDirection * (volatility * 0.3);
  
  // Change trend occasionally
  tickCount++;
  if (tickCount > 15) {
    trendDirection = Math.random() > 0.5 ? 1 : -1;
    tickCount = 0;
  }

  const change = (Math.random() - 0.5) * (volatility * 2.5) + drift;
  let close = open + change;
  
  // Ensure realistic High/Low
  let high = Math.max(open, close) + Math.random() * volatility;
  let low = Math.min(open, close) - Math.random() * volatility;

  // Update global reference
  currentPrice = close;

  const decimals = currentPrice < 10 ? 4 : 2;

  return {
    time: timeString,
    open: Number(open.toFixed(decimals)),
    high: Number(high.toFixed(decimals)),
    low: Number(low.toFixed(decimals)),
    close: Number(close.toFixed(decimals)),
    volume: Math.floor(Math.random() * 500) + 100,
  };
};

// Helper: Calculate EMA Array
const calculateEMAArray = (values: number[], period: number): number[] => {
  const k = 2 / (period + 1);
  const emaArray: number[] = [];
  
  // Initialize with SMA
  let sum = 0;
  for(let i = 0; i < Math.min(values.length, period); i++) {
    sum += values[i];
  }
  let prevEma = sum / Math.min(values.length, period);
  if (values.length < period) return values; // Not enough data

  // Fill initial empty spots or handle logic to align with array length
  let currentEma = values[0]; 
  
  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      emaArray.push(values[0]);
    } else {
      currentEma = (values[i] * k) + (emaArray[i - 1] * (1 - k));
      emaArray.push(currentEma);
    }
  }
  return emaArray;
};

export const calculateIndicators = (data: Candle[]): Indicators => {
  const closes = data.map(c => c.close);
  const len = closes.length;
  const price = closes[len - 1] || currentPrice;

  // Defaults
  const defaultInd = { 
    rsi: 50, 
    ma50: price, 
    ema20: price, 
    ema50: price,
    macd: { macd: 0, signal: 0, histogram: 0 },
    stochRsi: { k: 50, d: 50 }
  };

  if (len < 14) return defaultInd;

  // 1. RSI
  let gains = 0;
  let losses = 0;
  // Calculate initial RSI over 14 periods
  for (let i = 1; i < 14; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
  }
  let avgGain = gains / 14;
  let avgLoss = losses / 14;
  
  // Calculate RSI series for StochRSI
  const rsiSeries: number[] = [];
  // Fill first 13 with approx
  for(let i=0; i<13; i++) rsiSeries.push(50); 

  for (let i = 14; i < len; i++) {
      const diff = closes[i] - closes[i - 1];
      const currentGain = diff > 0 ? diff : 0;
      const currentLoss = diff < 0 ? -diff : 0;
      
      avgGain = ((avgGain * 13) + currentGain) / 14;
      avgLoss = ((avgLoss * 13) + currentLoss) / 14;
      
      const rs = avgGain / avgLoss;
      const rsiVal = 100 - (100 / (1 + rs));
      rsiSeries.push(rsiVal);
  }
  const currentRSI = rsiSeries[rsiSeries.length - 1] || 50;

  // 2. MA & EMA
  const ma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / Math.min(len, 50);
  const ema20Array = calculateEMAArray(closes, 20);
  const ema50Array = calculateEMAArray(closes, 50);
  const ema12Array = calculateEMAArray(closes, 12);
  const ema26Array = calculateEMAArray(closes, 26);

  // 3. MACD
  const macdLine = ema12Array[len - 1] - ema26Array[len - 1];
  // Calculate MACD Signal (9-period EMA of MACD Line)
  const macdHistory: number[] = [];
  for(let i=0; i<len; i++) {
      macdHistory.push(ema12Array[i] - ema26Array[i]);
  }
  const signalLineArray = calculateEMAArray(macdHistory, 9);
  const signalLine = signalLineArray[len - 1];
  const histogram = macdLine - signalLine;

  // 4. Stochastic RSI
  const stochPeriod = 14;
  const rsiSlice = rsiSeries.slice(-stochPeriod);
  const minRsi = Math.min(...rsiSlice);
  const maxRsi = Math.max(...rsiSlice);
  const stochRaw = rsiSlice.length > 0 && maxRsi !== minRsi 
      ? (rsiSlice[rsiSlice.length - 1] - minRsi) / (maxRsi - minRsi) 
      : 0.5;
  
  const k = stochRaw * 100; 
  const d = k * 0.7 + 30 * 0.3; 

  return {
    rsi: isNaN(currentRSI) ? 50 : currentRSI,
    ma50,
    ema20: ema20Array[len - 1],
    ema50: ema50Array[len - 1],
    macd: {
        macd: macdLine,
        signal: signalLine,
        histogram: histogram
    },
    stochRsi: {
        k,
        d
    }
  };
};

export const getSimulatedNews = (): NewsStatus => {
  const rand = Math.random();
  if (rand > 0.85) return { impact: 'HIGH', event: '🔴 BREAKING: High Volatility Expected' };
  if (rand > 0.65) return { impact: 'MEDIUM', event: '🟠 Market Update: Medium Impact News' };
  return { impact: 'NONE', event: '🟢 Market Stable' };
};
