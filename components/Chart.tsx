
import React, { useEffect, useRef } from 'react';
import { Candle, ChartType, BrokerName, Timeframe } from '../types';

interface ChartProps {
  data: Candle[]; // Kept for interface compatibility, but TV fetches its own data
  type: ChartType;
  broker?: BrokerName | string;
  symbol?: string; // Passed from parent
  timeframe?: Timeframe;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const Chart: React.FC<ChartProps> = ({ type, symbol = 'XAUUSD', timeframe = '1m' }) => {
  const containerId = useRef(`tv_chart_container_${Math.random().toString(36).substring(7)}`);

  // Map App Timeframe to TradingView Interval
  const mapTimeframe = (tf: string): string => {
    switch(tf) {
        case '1m': return '1';
        case '5m': return '5';
        case '15m': return '15';
        case '30m': return '30';
        case '1h': return '60';
        case '4h': return '240';
        case '1d': return 'D';
        case '1w': return 'W';
        case '1M': return 'M';
        default: return '1';
    }
  };

  // Map App Symbol to TradingView Symbol
  const mapSymbol = (sym: string): string => {
      // Crypto usually on BINANCE, Forex/Gold on OANDA or FXCM for general view
      if (sym.includes('USDT') || sym.includes('BTC') || sym.includes('ETH')) {
          return `BINANCE:${sym}`;
      }
      if (sym === 'XAUUSD') return 'OANDA:XAUUSD';
      return `FX:${sym}`; // Default fallback
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: mapSymbol(symbol),
          interval: mapTimeframe(timeframe),
          timezone: "Etc/UTC",
          theme: "dark",
          style: type === 'AREA' ? "3" : "1", // 1 = Candles, 3 = Area
          locale: "en",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: false, // Controlled by App
          container_id: containerId.current,
          toolbar_bg: "#0f172a",
          studies: [
             "RSI@tv-basicstudies",
             "MASimple@tv-basicstudies" // Moving Average
          ],
          overrides: {
            "mainSeriesProperties.candleStyle.upColor": "#22c55e",
            "mainSeriesProperties.candleStyle.downColor": "#ef4444",
            "mainSeriesProperties.candleStyle.borderUpColor": "#22c55e",
            "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
            "mainSeriesProperties.candleStyle.wickUpColor": "#22c55e",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
            "paneProperties.background": "#0f172a",
            "paneProperties.vertGridProperties.color": "#1e293b",
            "paneProperties.horzGridProperties.color": "#1e293b",
          }
        });
      }
    };
    document.head.appendChild(script);

    return () => {
        // Cleanup if needed, though TV widget replaces innerHTML usually
    };
  }, [symbol, type, timeframe]);

  return (
    <div className="w-full h-full min-h-[500px] relative bg-slate-900 rounded-lg overflow-hidden">
      <div id={containerId.current} className="w-full h-full absolute inset-0" />
    </div>
  );
};

export default Chart;
