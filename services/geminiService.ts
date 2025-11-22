
import { GoogleGenAI } from "@google/genai";
import { Candle, MarketAnalysis, SignalType, NewsStatus, Indicators, LanguageCode } from '../types';

// NOTE: In a real scenario, this would be server-side to protect the key.
// For this frontend-only demo, we use the env var or user input.

export const analyzeMarket = async (
  apiKey: string,
  symbol: string,
  candles: Candle[],
  indicators: Indicators,
  news: NewsStatus,
  language: LanguageCode = 'ar'
): Promise<MarketAnalysis> => {
  
  // Helper: Perform fallback technical analysis when AI is unavailable
  const performFallbackAnalysis = (errorReason: string): MarketAnalysis => {
      const currentPrice = candles[candles.length - 1].close;
      const isUptrend = indicators.ema20 > indicators.ema50;
      
      let score = 0;
      
      // 1. RSI Scoring
      if (indicators.rsi < 30) score += 2;       // Oversold -> Buy
      else if (indicators.rsi > 70) score -= 2;  // Overbought -> Sell
      
      // 2. MACD Scoring
      if (indicators.macd.histogram > 0 && indicators.macd.macd > indicators.macd.signal) score += 1;
      else if (indicators.macd.histogram < 0 && indicators.macd.macd < indicators.macd.signal) score -= 1;
      
      // 3. Trend Scoring
      if (isUptrend) score += 1;
      else score -= 1;

      // 4. StochRSI Scoring
      if (indicators.stochRsi.k < 20) score += 1;
      if (indicators.stochRsi.k > 80) score -= 1;

      let signal = SignalType.HOLD;
      if (score >= 3) signal = SignalType.BUY;
      if (score <= -3) signal = SignalType.SELL;

      // Construct a friendly message
      const reasonPrefix = language === 'ar' 
          ? `⚠️ تنبيه: ${errorReason}. تم التحول للتحليل الفني التلقائي: ` 
          : `⚠️ Warning: ${errorReason}. Switched to Auto-Technical Analysis: `;
          
      const reasonDetail = language === 'ar'
          ? `الاتجاه ${isUptrend ? 'صاعد' : 'هابط'}. مؤشر RSI عند ${indicators.rsi.toFixed(1)}. تقاطع MACD ${indicators.macd.histogram > 0 ? 'إيجابي' : 'سلبي'}.`
          : `Trend is ${isUptrend ? 'Up' : 'Down'}. RSI at ${indicators.rsi.toFixed(1)}. MACD Crossover is ${indicators.macd.histogram > 0 ? 'Positive' : 'Negative'}.`;

      return {
        signal,
        confidence: 60, // Lower confidence for fallback logic
        reasoning: reasonPrefix + reasonDetail,
        trend: isUptrend ? 'UP' : 'DOWN',
        support: parseFloat((currentPrice * 0.992).toFixed(2)),
        resistance: parseFloat((currentPrice * 1.008).toFixed(2))
      };
  };

  // If no API key is provided, immediately use fallback
  if (!apiKey) {
    return performFallbackAnalysis(language === 'ar' ? "مفتاح API مفقود" : "Missing API Key");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const recentData = candles.slice(-10).map(c => 
    `[${c.time}] O:${c.open} H:${c.high} L:${c.low} C:${c.close}`
  ).join('\n');

  const langMap: Record<string, string> = {
      'ar': 'Arabic (اللغة العربية)',
      'en': 'English',
      'fr': 'French',
      'es': 'Spanish',
      'de': 'German',
      'ru': 'Russian',
      'zh': 'Chinese (Simplified)',
      'tr': 'Turkish',
      'hi': 'Hindi'
  };

  const isCrypto = symbol.includes('USDT') || symbol.includes('BTC') || symbol.includes('ETH');
  const contextType = isCrypto ? "Binance Futures (Crypto)" : "Forex/Commodities (Gold)";

  const prompt = `
    You are a world-class expert trader specialized in ${symbol} on ${contextType}.
    Analyze the following market data and make an immediate trading decision.
    
    **IMPORTANT**: The output JSON 'reasoning' field MUST be in ${langMap[language] || 'English'}.

    Economic News Context:
    - Status: ${news.event}
    - Impact: ${news.impact}
    
    Alert: If Impact is HIGH, be extremely cautious. Only signal entry if confidence > 90%.

    Technical Data & Indicators for ${symbol}:
    - Current Price: ${candles[candles.length - 1].close}
    - RSI: ${indicators.rsi.toFixed(2)} (Overbought > 70, Oversold < 30)
    - Moving Averages:
      * EMA 20: ${indicators.ema20.toFixed(2)}
      * EMA 50: ${indicators.ema50.toFixed(2)}
      * MA 50: ${indicators.ma50.toFixed(2)}
    - MACD:
      * Line: ${indicators.macd.macd.toFixed(4)}
      * Signal: ${indicators.macd.signal.toFixed(4)}
      * Histogram: ${indicators.macd.histogram.toFixed(4)}
    - StochRSI:
      * %K: ${indicators.stochRsi.k.toFixed(2)}
      * %D: ${indicators.stochRsi.d.toFixed(2)}
    
    Recent Candles (Last 10 mins):
    ${recentData}
    
    Request:
    1. Decision: BUY (Long), SELL (Short), or HOLD.
    2. Confidence (0-100).
    3. Trend (UP/DOWN/SIDEWAYS).
    4. Support & Resistance levels.
    5. Short, convincing reasoning in ${langMap[language]}.

    Output JSON format only:
    {
      "signal": "BUY" | "SELL" | "HOLD",
      "confidence": number,
      "trend": "UP" | "DOWN" | "SIDEWAYS",
      "support": number,
      "resistance": number,
      "reasoning": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    
    // Map string signal to Enum
    let signalEnum = SignalType.HOLD;
    if (data.signal === 'BUY') signalEnum = SignalType.BUY;
    if (data.signal === 'SELL') signalEnum = SignalType.SELL;

    return {
      signal: signalEnum,
      confidence: data.confidence,
      reasoning: data.reasoning,
      trend: data.trend,
      support: data.support,
      resistance: data.resistance
    };

  } catch (error: any) {
    console.error("AI Analysis Failed:", error);
    
    // Detect Quota Limit or other errors
    const errorStr = error?.message || String(error);
    const isQuota = errorStr.includes("429") || errorStr.toLowerCase().includes("quota");
    
    const reasonAr = isQuota ? "تم تجاوز حد الاستخدام (Quota)" : "تعذر الاتصال بالخادم";
    const reasonEn = isQuota ? "AI Quota Exceeded" : "Server Connection Failed";

    return performFallbackAnalysis(language === 'ar' ? reasonAr : reasonEn);
  }
};
