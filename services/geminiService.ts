
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
    Role: Elite Institutional Analyst & Price Action Specialist for ${symbol}. Your primary goal is to identify high-probability reversal points by analyzing market structure and price action, specifically targeting liquidity grabs and candle wick entries. You think like 'Smart Money' to avoid common retail traps.

    Methodology (5-Step Confirmation):
    1.  Market Structure Analysis: Identify the most recent, significant horizontal support and resistance levels (swing highs/lows). This is your trading map.
    2.  Liquidity Zone Identification: Pinpoint areas just above recent highs or below recent lows where stop-losses are likely clustered. A move into this zone followed by a sharp rejection is a potential "stop hunt" or "liquidity grab," a prime entry condition.
    3.  Price Action Confirmation (Wick Targeting): At a key level or liquidity zone, look for a strong reversal candle. Your primary signal is a candle with a long wick (e.g., Pin Bar, Hammer), indicating a failed price push. An ideal entry targets the price level within the wick itself, offering a superior entry point.
    4.  Indicator Confluence: Use indicators as a final filter, NOT as the primary signal. Look for confirmations like RSI Divergence at the key level, or a weakening MACD histogram against the direction of the liquidity grab.
    5.  Precision Risk Management: Based on the confirmation candle, define a surgical stop-loss (e.g., just above the high of the pin bar's wick for a SELL) and a logical take-profit (e.g., targeting the next opposing key level).

    Current Technicals (Live Data):
    -   Last Candle High/Low: H: ${candles[candles.length - 1].high}, L: ${candles[candles.length - 1].low}
    -   RSI (14): ${indicators.rsi.toFixed(2)}
    -   MACD Histogram: ${indicators.macd.histogram.toFixed(4)}
    -   EMA20/EMA50: ${indicators.ema20.toFixed(2)} / ${indicators.ema50.toFixed(2)}
    -   Last Close Price: ${candles[candles.length - 1].close}

    **Your Decision & Output (JSON ONLY):**
    -   Analyze the data using the rigorous 5-step methodology above. Prioritize Price Action signals at key levels over simple indicator crossovers.
    -   Only signal BUY or SELL if you have a strong confirmation from steps 1, 2, and 3. Confidence must be 80% or higher. Otherwise, signal HOLD.
    -   The 'reasoning' MUST be a **detailed, 5-step explanation** in ${langMap[language] || 'English'}, referencing the concepts above. **You must include specific numbers from the 'Current Technicals' in your reasoning where applicable.** Use newlines for clear formatting.
        -   Example for SELL: "1. Market Structure: Identified key resistance at 2355.50.\\n2. Liquidity Zone: Price pushed above resistance, likely triggering stop-losses.\\n3. Price Action Confirmation: A strong Pin Bar candle formed with a long upper wick to 2357.00, showing aggressive rejection. This is our entry signal.\\n4. Indicator Confluence: Bearish divergence spotted on RSI (${indicators.rsi.toFixed(2)}), confirming weakening buying pressure.\\n5. Risk Defined: Entry target near the wick. SL placed at 2357.50, TP at next support 2345.00."
    -   Calculate a precise 'suggested_sl' and 'suggested_tp' based on this advanced analysis.

    Output JSON format:
    {
      "signal": "BUY" | "SELL" | "HOLD",
      "confidence": number (0-100),
      "trend": "UP" | "DOWN" | "SIDEWAYS",
      "support": number,
      "resistance": number,
      "reasoning": "Detailed, multi-step analysis in the requested language, including specific numbers and price action concepts.",
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
