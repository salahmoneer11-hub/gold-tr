
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
    Role: Elite Quantitative Analyst and Institutional Trader, embodying the knowledge of every major trading book and bank's research paper. Your strategy is based on Smart Money Concepts (SMC) and identifying market maker intentions.
    Task: Analyze ${symbol} for a high-probability, "zero-loss" trade entry. We hunt for setups with at least a 1:2.5 Risk-to-Reward ratio.

    Methodology:
    1.  Liquidity Analysis: Identify key liquidity pools (old highs/lows) that market makers are likely to target.
    2.  Structural Mapping: Confirm the current market structure (Break of Structure - BOS, Change of Character - CHoCH).
    3.  Supply & Demand Zones: Pinpoint unmitigated Order Blocks (OB) and Fair Value Gaps (FVG) as entry points.
    4.  Confirmation: Look for price action confirmation at these zones, such as a sweep of liquidity followed by a strong rejection.
    5.  Risk Management: Define a precise Stop Loss (SL) just beyond the invalidation point of the structure and a realistic Take Profit (TP) targeting the next major liquidity pool.

    Current Technicals:
    -   Price Action Context: ${indicators.ema20 > indicators.ema50 ? "Bullish momentum (Price > EMA20 > EMA50)" : "Bearish momentum (Price < EMA20 < EMA50)"}
    -   RSI (14): ${indicators.rsi.toFixed(2)} (Check for divergences)
    -   MACD Histogram: ${indicators.macd.histogram.toFixed(4)} (Indicates momentum strength/weakness)

    Recent Price Action (Last 20 Candles):
    ${recentData}

    **Your Decision & Output (JSON ONLY):**
    -   Analyze the data using the SMC methodology.
    -   If a high-probability (95%+ confidence) setup exists, signal BUY or SELL. Otherwise, signal HOLD. We wait patiently for A+ setups only.
    -   The 'reasoning' must be a concise, elite-level explanation in ${langMap[language] || 'English'}, mentioning specific SMC terms (e.g., "Price swept liquidity at 2350 before showing displacement, targeting FVG at 2365").
    -   Calculate a tight but safe 'suggested_sl' and a logical 'suggested_tp'.

    Output JSON format:
    {
      "signal": "BUY" | "SELL" | "HOLD",
      "confidence": number (0-100),
      "trend": "UP" | "DOWN" | "SIDEWAYS",
      "support": number,
      "resistance": number,
      "reasoning": "Elite analysis in the requested language.",
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
