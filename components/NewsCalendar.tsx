
import React from 'react';
import { EconomicEvent, LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface NewsCalendarProps {
  events: EconomicEvent[];
  lang: LanguageCode;
}

const NewsCalendar: React.FC<NewsCalendarProps> = ({ events, lang }) => {
  const t = translations[lang];

  return (
    <div className="glass-panel rounded-xl p-4 overflow-hidden flex flex-col h-full">
      <h3 className="font-bold text-lg text-gray-300 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
        <span>📅</span> {t.economic_calendar}
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-900 z-10 text-xs uppercase text-gray-500">
            <tr>
              <th className="pb-2 font-normal">{t.event_time}</th>
              <th className="pb-2 font-normal text-center">{t.currency}</th>
              <th className="pb-2 font-normal">Event</th>
              <th className="pb-2 font-normal text-right">{t.forecast}</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-300">
            {events.map((event) => (
              <tr key={event.id} className="border-b border-slate-800/50 last:border-0 group hover:bg-slate-800/30 transition">
                <td className="py-3 font-mono text-xs text-gray-400 whitespace-nowrap">
                    {event.time}
                </td>
                <td className="py-3 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                        event.currency === 'USD' ? 'bg-green-900/30 text-green-400 border-green-900/50' : 
                        event.currency === 'EUR' ? 'bg-blue-900/30 text-blue-400 border-blue-900/50' : 
                        'bg-slate-700 text-gray-300'
                    }`}>
                        {event.currency}
                    </span>
                </td>
                <td className="py-3 pl-2">
                    <div className="flex flex-col">
                        <span className="font-bold text-xs leading-tight">{event.event}</span>
                        <div className="mt-1 flex items-center gap-1">
                            {event.impact === 'HIGH' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                            {event.impact === 'MEDIUM' && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                            {event.impact === 'LOW' && <span className="w-2 h-2 rounded-full bg-yellow-200"></span>}
                            <span className={`text-[9px] uppercase ${
                                event.impact === 'HIGH' ? 'text-red-400' : 
                                event.impact === 'MEDIUM' ? 'text-amber-400' : 'text-yellow-200'
                            }`}>{t[`impact_${event.impact.toLowerCase()}`]}</span>
                        </div>
                    </div>
                </td>
                <td className="py-3 text-right">
                    <div className="flex flex-col items-end text-[10px] font-mono">
                        <span className="text-gray-300" title="Forecast">{event.forecast}</span>
                        <span className="text-gray-600" title="Previous">{event.previous}</span>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewsCalendar;
