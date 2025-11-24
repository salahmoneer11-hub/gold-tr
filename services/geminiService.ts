
import { GoogleGenAI } from "@google/genai";
import { Candle, MarketAnalysis, SignalType, NewsStatus, Indicators, LanguageCode } from '../types';

export const analyzeMarket = async (
  apiKey: string,
  symbol: string,
  candles: Candle[],
  indicators: Indicators,
  news: NewsStatus,
  language: LanguageCode = 'ar'
): Promise<MarketAnalysis> => {
  
  if (!candles || candles.length === 0) {
      return {
          signal: SignalType.HOLD,
          confidence: 0,
          reasoning: "Insufficient data for analysis",
          trend: 'SIDEWAYS',
          support: 0,
          resistance: 0,
          suggested_sl: 0,
          suggested_tp: 0,
      };
  }

  const performFallbackAnalysis = (errorReason: string): MarketAnalysis => {
      const currentPrice = candles[candles.length - 1].close;
      const volatility = (candles[candles.length - 1].high - candles[candles.length - 1].low);
      const isUptrend = indicators.ema20 > indicators.ema50;
      
      let signal = SignalType.HOLD;
      let reasonAr = "انتظار تأكيد من السوق.";
      let reasonEn = "Waiting for market confirmation.";

      if (isUptrend && indicators.rsi < 65) {
          signal = SignalType.BUY;
          reasonAr = "اتجاه صاعد مع مؤشر قوة نسبية معتدل. فرصة شراء.";
          en: "Uptrend with moderate RSI. Buy opportunity.";
      } else if (!isUptrend && indicators.rsi > 35) {
          signal = SignalType.SELL;
          reasonAr = "اتجاه هابط مع مؤشر قوة نسبية معتدل. فرصة بيع.";
          en: "Downtrend with moderate RSI. Sell opportunity.";
      }

      const slDistance = volatility * 1.5 || 2.0;
      const tpDistance = volatility * 2.5 || 3.5;

      return {
        signal,
        confidence: 75, 
        reasoning: language === 'ar' ? reasonAr : reasonEn,
        trend: isUptrend ? 'UP' : 'DOWN',
        support: parseFloat((currentPrice - volatility * 2).toFixed(2)),
        resistance: parseFloat((currentPrice + volatility * 2).toFixed(2)),
        suggested_sl: signal === SignalType.BUY ? parseFloat((currentPrice - slDistance).toFixed(2)) : parseFloat((currentPrice + slDistance).toFixed(2)),
        suggested_tp: signal === SignalType.BUY ? parseFloat((currentPrice + tpDistance).toFixed(2)) : parseFloat((currentPrice - tpDistance).toFixed(2)),
      };
  };

  if (!apiKey) {
    return performFallbackAnalysis(language === 'ar' ? "تحليل فني تلقائي" : "Automatic TA");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const recentData = candles.slice(-20).map(c => 
    `[${c.time}] O:${c.open} H:${c.high} L:${c.low} C:${c.close}`
  ).join('\n');

  const langMap: Record<string, string> = {
      'ar': 'Arabic', 'en': 'English'
  };

  const prompt = `
    Role: Aggressive High-Frequency AI Trader for ${symbol}. Your goal is to capture quick profits by identifying short-term momentum shifts. You must act decisively and quickly, generating more frequent trading signals when conditions are favorable.

    Methodology:
    1.  Momentum Check: Is the MACD histogram positive and growing (for BUY) or negative and growing (for SELL)?
    2.  Trend Confirmation: Is the price above the key EMAs (ema20 > ema50) for a BUY, or below for a SELL?
    3.  RSI Confirmation: Is RSI in a favorable range (e.g., not overbought >75 for a BUY, not oversold <25 for a SELL)?
    4.  Entry Point: Use the last candle's close price as the entry point.
    5.  Risk Management: Calculate a tight 'suggested_sl' based on recent volatility (e.g., the low of the last 3-5 candles for a BUY) and a 'suggested_tp' with a minimum 1:1.5 Risk-to-Reward ratio.

    Current Technicals:
    -   Price Action Context: ${indicators.ema20 > indicators.ema50 ? "Bullish momentum (Price > EMA20 > EMA50)" : "Bearish momentum (Price < EMA20 < EMA50)"}
    -   RSI (14): ${indicators.rsi.toFixed(2)} (Use this to avoid extreme conditions)
    -   MACD Histogram: ${indicators.macd.histogram.toFixed(4)} (Key indicator for momentum strength/weakness)
    -   Last Close Price: ${candles[candles.length - 1].close}

    Recent Price Action (Last 20 Candles):
    ${recentData}

    **Your Decision & Output (JSON ONLY):**
    -   Analyze the data using the methodology above. Be proactive in signaling BUY or SELL if momentum and trend align.
    -   A confidence level of 75% or higher is sufficient to enter a trade. If conditions are ambiguous or risky, signal HOLD.
    -   The 'reasoning' must be a concise, direct explanation in ${langMap[language] || 'English'}, mentioning key indicators (e.g., "MACD crossing up, RSI at 55, price holding above EMAs, signaling a BUY entry.").
    -   Calculate a precise 'suggested_sl' and 'suggested_tp'.

    Output JSON format:
    {
      "signal": "BUY" | "SELL" | "HOLD",
      "confidence": number (0-100),
      "trend": "UP" | "DOWN" | "SIDEWAYS",
      "support": number,
      "resistance": number,
      "reasoning": "Direct analysis in the requested language.",
      "suggested_sl": number,
      "suggested_tp": number
    }
  `;

  try {
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 8000)
    );

    const apiCall = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const response: any = await Promise.race([apiCall, timeoutPromise]);
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    const data = JSON.parse(text);
    
    let signalEnum = SignalType.HOLD;
    if (data.signal === 'BUY') signalEnum = SignalType.BUY;
    if (data.signal === 'SELL') signalEnum = SignalType.SELL;

    return {
      signal: signalEnum,
      confidence: data.confidence,
      reasoning: data.reasoning,
      trend: data.trend,
      support: data.support,
      resistance: data.resistance,
      suggested_sl: data.suggested_sl,
      suggested_tp: data.suggested_tp
    };

  } catch (error: any) {
    console.warn("AI Analysis switched to Fallback due to error:", error);
    return performFallbackAnalysis("AI Timeout - Institutional Fallback");
  }
};