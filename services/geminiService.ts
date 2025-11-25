
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
    Role: Elite Multi-Timeframe Institutional Strategist for ${symbol}. Your sole purpose is to execute sniper entries based on a strict, top-down analysis protocol. You must combine High-Timeframe (HTF) context with Low-Timeframe (LTF) precision. You trade based on Smart Money Concepts (SMC).

    Institutional Execution Protocol (6-Step Confirmation):
    1.  High-Timeframe (HTF) Context (The "Thesis"): First, establish the dominant trend and key market structure on a higher timeframe (e.g., 1-Hour). This determines your bias. Are we bullish or bearish? Only seek trades aligned with this HTF bias.
    2.  Point of Interest (POI) Identification (The "Hunting Ground"): Within the HTF context, identify a precise, high-probability POI. This must be an institutional zone like an Order Block (the last opposing candle before a strong move) or a Fair Value Gap (FVG - an inefficient price gap). This is where you will wait for price.
    3.  Low-Timeframe (LTF) Confirmation (The "Trigger"): Once price enters your HTF POI, you MUST see a confirmation on a lower timeframe (e.g., 1-Minute or 5-Minute). The primary confirmation is a "Change of Character" (CHoCH) - a break of the most recent minor swing high/low against the LTF trend. This signals a reversal is starting.
    4.  Entry Refinement (The "Sniper Entry"): After the LTF CHoCH, you do not enter immediately. You wait for a small pullback to a newly formed LTF Order Block or FVG that was created by the CHoCH move. This is your precise, refined entry point.
    5.  Indicator Confluence (The "Final Check"): Use indicators as a final check. For example, LTF RSI divergence during the CHoCH can add significant confidence. This is a secondary confirmation.
    6.  Surgical Risk & Target Definition (The "Plan"): The Stop-Loss (SL) must be placed just below the LTF swing low (for a BUY) that initiated the CHoCH. The Take-Profit (TP) should target the next opposing HTF liquidity zone or structural point.

    Current Technicals (Live Data):
    -   Last Candle High/Low: H: ${candles[candles.length - 1].high}, L: ${candles[candles.length - 1].low}
    -   RSI (14): ${indicators.rsi.toFixed(2)}
    -   MACD Histogram: ${indicators.macd.histogram.toFixed(4)}
    -   EMA20/EMA50: ${indicators.ema20.toFixed(2)} / ${indicators.ema50.toFixed(2)}
    -   Last Close Price: ${candles[candles.length - 1].close}

    **Your Decision & Output (JSON ONLY):**
    -   Analyze the market using the rigorous 6-step protocol. You MUST conceptually perform a multi-timeframe analysis.
    -   Only signal BUY or SELL if all steps (1 through 4) are strongly confirmed. Confidence must be 85% or higher. Otherwise, signal HOLD.
    -   The 'reasoning' MUST be a **detailed, 6-step explanation** in ${langMap[language] || 'English'}, referencing the concepts above. **You must include specific numbers from the 'Current Technicals' where relevant.** Use newlines for clear formatting.
        -   Example for BUY: "1. HTF Context: Market is in a clear 1H uptrend, forming higher highs and higher lows. Bias is bullish.\\n2. POI Identification: Identified a key 1H Order Block at the 2345.00 support level.\\n3. LTF Confirmation: Price tapped the 2345.00 POI, and on the 1M chart, we saw a clear Change of Character by breaking the minor swing high at 2346.50.\\n4. Entry Refinement: The CHoCH created a new 1M Order Block. Waiting for a pullback to this refined entry zone around 2345.80.\\n5. Indicator Confluence: Bullish RSI divergence was present on the 1M chart leading into the CHoCH, confirming seller exhaustion.\\n6. Risk Defined: SL placed at 2344.80 (below the 1M swing low). TP targets next HTF resistance at 2360.00."
    -   Calculate a precise 'suggested_sl' and 'suggested_tp' based on this advanced analysis.

    Output JSON format:
    {
      "signal": "BUY" | "SELL" | "HOLD",
      "confidence": number (0-100),
      "trend": "UP" | "DOWN" | "SIDEWAYS",
      "support": number,
      "resistance": number,
      "reasoning": "Detailed, multi-step analysis in the requested language, following the Institutional Execution Protocol and including specific numbers.",
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
