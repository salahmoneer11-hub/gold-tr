
import React, { useState } from 'react';
import { MeltedGoldLogo } from './Logo';
import { LanguageCode } from '../types';
import { translations } from '../utils/translations';
import LanguageSelector from './LanguageSelector';

interface AuthContainerProps {
  children: React.ReactNode;
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ children, lang, setLang }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
        <div className="absolute top-6 right-6 z-20">
            <LanguageSelector currentLang={lang} onSelect={setLang} label="" />
        </div>
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <MeltedGoldLogo className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  GOLD AI PRO
                </h1>
            </div>
            <div className="glass-panel p-8 rounded-2xl border border-slate-700 shadow-2xl">
                {children}
            </div>
        </div>
    </div>
  );
};


interface LoginProps {
  onLogin: (email: string) => boolean;
  onRegisterClick: () => void;
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onRegisterClick, lang, setLang }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        onLogin(email);
        setLoading(false);
    }, 1000);
  };

  return (
    <AuthContainer lang={lang} setLang={setLang}>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">{t.login_title}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.email}</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition" placeholder="user@example.com" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.password}</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold py-3.5 rounded-xl transition shadow-lg shadow-amber-500/20 flex justify-center items-center h-[50px]">
                {loading ? <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span> : t.login_btn}
            </button>
        </form>
        <div className="mt-6 text-center">
            <button onClick={onRegisterClick} className="text-sm text-slate-400 hover:text-white transition">
                {t.create_account}
            </button>
        </div>
    </AuthContainer>
  );
};

interface RegisterProps {
  onRegister: (email: string) => void;
  onLoginClick: () => void;
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, onLoginClick, lang, setLang }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(password !== confirmPassword) { return; }
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        onRegister(email);
    }, 1000);
  };

  return (
    <AuthContainer lang={lang} setLang={setLang}>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">{t.register_title}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.email}</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.password}</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.confirm_password}</label>
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl transition flex justify-center items-center h-[50px]">
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : t.register_btn}
            </button>
        </form>
        <div className="mt-6 text-center">
            <button onClick={onLoginClick} className="text-sm text-slate-400 hover:text-white transition">
                {t.have_account}
            </button>
        </div>
    </AuthContainer>
  );
};
