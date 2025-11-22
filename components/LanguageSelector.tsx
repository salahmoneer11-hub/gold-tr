
import React from 'react';
import { LanguageCode } from '../types';

interface LanguageSelectorProps {
  currentLang: LanguageCode;
  onSelect: (lang: LanguageCode) => void;
  label: string;
}

const languages: { code: LanguageCode; name: string; flag: string }[] = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLang, onSelect, label }) => {
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700 transition">
        <span>{languages.find(l => l.code === currentLang)?.flag}</span>
        <span className="hidden sm:inline">{languages.find(l => l.code === currentLang)?.name}</span>
        <span className="text-xs text-gray-500">▼</span>
      </button>
      
      <div className="absolute top-full right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden hidden group-hover:block z-50">
        <div className="max-h-60 overflow-y-auto">
            {languages.map((lang) => (
            <button
                key={lang.code}
                onClick={() => onSelect(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-700 transition
                ${currentLang === lang.code ? 'bg-slate-700 text-amber-400' : 'text-gray-300'}
                `}
            >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
            </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
