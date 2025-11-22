
import React, { useState } from 'react';
import { LanguageCode } from '../types';
import { translations } from '../utils/translations';
import LanguageSelector from './LanguageSelector';
import { MeltedGoldLogo } from './Logo';

interface TermsModalProps {
  onAccept: () => void;
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onAccept, lang, setLang }) => {
  const [isChecked, setIsChecked] = useState(false);
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
               <MeltedGoldLogo className="w-full h-full" />
            </div>
            <h2 className="text-2xl font-bold text-amber-500">{t.terms_title}</h2>
          </div>
          <LanguageSelector currentLang={lang} onSelect={setLang} label={t.lang_select} />
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-800/30">
          <div className="prose prose-invert max-w-none text-sm leading-relaxed text-gray-300 whitespace-pre-line">
            {t.terms_body}
          </div>
        </div>

        {/* Footer & Actions */}
        <div className="p-6 border-t border-slate-700 bg-slate-900 rounded-b-2xl">
          <div className="flex items-center gap-3 mb-4 p-3 bg-amber-900/20 border border-amber-900/50 rounded-lg">
            <input 
              type="checkbox" 
              id="accept-terms"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-5 h-5 accent-amber-500 cursor-pointer"
            />
            <label htmlFor="accept-terms" className="text-sm font-bold text-amber-100 cursor-pointer select-none">
              {t.terms_accept}
            </label>
          </div>

          <button
            onClick={onAccept}
            disabled={!isChecked}
            className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg
              ${isChecked 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 cursor-pointer shadow-amber-900/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
          >
            {t.terms_btn}
          </button>
        </div>

      </div>
    </div>
  );
};

export default TermsModal;
