
import { Candle, Indicators, NewsStatus, Timeframe } from '../types';

// Binance API Endpoints
const BASE_URL = 'https://api.binance.com/api/v3';
const WS_URL = 'wss://stream.binance.com:9443/ws';

// Mapping standard symbols to Binance pairs
// XAUUSD is mapped to PAXGUSDT (Gold backed token) for real-time free public data
const SYMBOL_MAP: Record<string, string> = {
  'XAUUSD': 'PAXGUSDT', 
  'BTCUSDT': 'BTCUSDT',
  'ETHUSDT': 'ETHUSDT',
  'SOLUSDT': 'SOLUSDT',
  'BNBUSDT': 'BNBUSDT',
  'XRPUSDT': 'XRPUSDT',
  'ADAUSDT': 'ADAUSDT',
  'DOGEUSDT': 'DOGEUSDT'
};

let ws: WebSocket | null = null;
let isExplicitClose = false;

// Helper: Calculate EMA Array
const calculateEMAArray = (values: number[], period: number): number[] => {
  const k = 2 / (period + 1);
  const emaArray: number[] = [];
  
  let sum = 0;
  const initialSlice = values.slice(0, period);
  if (initialSlice.length < period) return values;

  sum = initialSlice.reduce((a, b) => a + b, 0);
  let currentEma = sum / period;
  
  // Push initial SMA as first EMA
  for(let i=0; i<period-1; i++) emaArray.push(values[i]);
  emaArray.push(currentEma);

  for (let i = period; i < values.length; i++) {
    currentEma = (values[i] - currentEma) * k + currentEma;
    emaArray.push(currentEma);
  }
  return emaArray;
};

export const calculateIndicators = (data: Candle[]): Indicators => {
  const closes = data.map(c => c.close);
  const len = closes.length;
  
  if (len < 50) {
     // Return basic placeholder if not enough data
     return { 
        rsi: 50, ma50: closes[len-1] || 0, ema20: closes[len-1] || 0, ema50: closes[len-1] || 0,
        macd: { macd: 0, signal: 0, histogram: 0 },
        stochRsi: { k: 50, d: 50 }
     };
  }

  // 1. RSI
  const rsiPeriod = 14;
  let gains = 0;
  let losses = 0;
  
  // First average
  for (let i = 1; i <= rsiPeriod; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
  }
  let avgGain = gains / rsiPeriod;
  let avgLoss = losses / rsiPeriod;

  // Smoothed RSI
  const rsiSeries = [];
  for (let i = rsiPeriod + 1; i < len; i++) {
      const diff = closes[i] - closes[i - 1];
      const currentGain = diff > 0 ? diff : 0;
      const currentLoss = diff < 0 ? -diff : 0;
      
      avgGain = ((avgGain * 13) + currentGain) / 14;
      avgLoss = ((avgLoss * 13) + currentLoss) / 14;
      
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      rsiSeries.push(rsi);
  }
  const currentRSI = rsiSeries[rsiSeries.length - 1] || 50;

  // 2. MA & EMA
  const ma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / 50;
  const ema20Array = calculateEMAArray(closes, 20);
  const ema50Array = calculateEMAArray(closes, 50);
  const ema12Array = calculateEMAArray(closes, 12);
  const ema26Array = calculateEMAArray(closes, 26);

  // 3. MACD
  const macdLine = ema12Array[len - 1] - ema26Array[len - 1];
  const macdHistory: number[] = [];
  for(let i=0; i<len; i++) {
      macdHistory.push(ema12Array[i] - ema26Array[i]);
  }
  const signalLineArray = calculateEMAArray(macdHistory, 9);
  const signalLine = signalLineArray[len - 1];
  const histogram = macdLine - signalLine;

  // 4. StochRSI
  const stochSlice = rsiSeries.slice(-14);
  const minRsi = Math.min(...stochSlice);
  const maxRsi = Math.max(...stochSlice);
  const stochRaw = (rsiSeries[rsiSeries.length-1] - minRsi) / (maxRsi - minRsi || 1);
  const k = stochRaw * 100;
  const d = k; // Simplified

  return {
    rsi: currentRSI,
    ma50,
    ema20: ema20Array[len - 1],
    ema50: ema50Array[len - 1],
    macd: {
        macd: macdLine,
        signal: signalLine,
        histogram: histogram
    },
    stochRsi: {
        k: isNaN(k) ? 50 : k,
        d: isNaN(d) ? 50 : d
    }
  };
};

// --- REAL DATA FETCHING ---

export const fetchHistoricalData = async (symbol: string, interval: Timeframe = '1m'): Promise<Candle[]> => {
    const binanceSymbol = SYMBOL_MAP[symbol] || 'BTCUSDT';
    try {
        // Fetch 100 candles, interval dynamic
        const response = await fetch(`${BASE_URL}/klines?symbol=${binanceSymbol}&interval=${interval}&limit=100`);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        
        if (!Array.isArray(data)) throw new Error("Invalid API response");

        return data.map((d: any) => ({
            time: formatCandleTime(d[0], interval),
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
            volume: parseFloat(d[5])
        }));
    } catch (error) {
        console.warn("Failed to fetch historical data, retrying in simulated mode...", error);
        return [];
    }
};

const formatCandleTime = (timestamp: number, interval: Timeframe): string => {
    const date = new Date(timestamp);
    if (['1d', '1w', '1M'].includes(interval)) {
        return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });
}

export const subscribeToLivePrice = (symbol: string, interval: Timeframe = '1m', onUpdate: (candle: Candle) => void) => {
    const binanceSymbol = (SYMBOL_MAP[symbol] || 'BTCUSDT').toLowerCase();
    
    if (ws) {
        isExplicitClose = true;
        ws.close();
    }

    try {
        ws = new WebSocket(`${WS_URL}/${binanceSymbol}@kline_${interval}`);
        isExplicitClose = false;

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.e === 'kline') {
                    const k = message.k;
                    const candle: Candle = {
                        time: formatCandleTime(k.t, interval),
                        open: parseFloat(k.o),
                        high: parseFloat(k.h),
                        low: parseFloat(k.l),
                        close: parseFloat(k.c),
                        volume: parseFloat(k.v)
                    };
                    onUpdate(candle);
                }
            } catch (err) {
                // Ignore parse errors from heartbeat
            }
        };

        ws.onerror = (e) => {
            if (!isExplicitClose) {
                console.warn("WebSocket connection issue (retrying internally)");
            }
        };
    } catch (e) {
        console.error("Failed to establish WebSocket", e);
    }
};

export const closeConnection = () => {
    if (ws) {
        isExplicitClose = true;
        ws.close();
    }
};

export const getSimulatedNews = (): NewsStatus => {
  const events = [
    "No significant news",
    "Market stabilizing",
    "Low volatility expected",
    "Minor economic data release",
    "Waiting for market open",
    "Tech sector earnings report",
    "Global supply chain update",
    "Crypto regulation news"
  ];

  const highImpactEvents = [
    "Fed Interest Rate Decision",
    "Unemployment Rate Surprise",
    "CPI Inflation Data",
    "Geopolitical Tension Escalation",
    "Major Bank Collapse",
    "SEC Lawsuit Announcement"
  ];

  const rand = Math.random();

  if (rand > 0.95) {
    return {
      impact: 'HIGH',
      event: highImpactEvents[Math.floor(Math.random() * highImpactEvents.length)]
    };
  } else if (rand > 0.8) {
    return {
      impact: 'MEDIUM',
      event: "Volatile trading conditions detected"
    };
  }

  return {
    impact: 'NONE',
    event: events[Math.floor(Math.random() * events.length)]
  };
};
