
import React, { useState } from 'react';
import { MeltedGoldLogo } from './Logo';
import { LanguageCode } from '../types';
import { translations } from '../utils/translations';
import LanguageSelector from './LanguageSelector';

interface AuthContainerProps {
  children: React.ReactNode;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-black"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[80%] bg-amber-500/5 rounded-full filter blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[80%] bg-blue-500/5 rounded-full filter blur-3xl animate-pulse-slow animation-delay-4000"></div>
        </div>
        <div className="w-full max-w-5xl bg-slate-900/50 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl z-10 grid md:grid-cols-2 overflow-hidden min-h-[70vh]">
            {children}
        </div>
        <style>{`
          @keyframes pulse-slow {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.1); opacity: 1; }
          }
          .animate-pulse-slow {
              animation: pulse-slow 8s infinite ease-in-out;
          }
          .animation-delay-4000 {
              animation-delay: -4s;
          }
        `}</style>
    </div>
  );
};


interface LoginProps {
  onLogin: (email: string, password: string) => boolean;
  onRegisterClick: () => void;
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onRegisterClick, lang, setLang }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
        const success = onLogin(email, password);
        if (!success) {
            setError(t.login_error_message);
        }
        setLoading(false);
    }, 1000);
  };

  return (
    <AuthContainer>
        {/* Left Branding Panel */}
        <div className="hidden md:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-slate-800/20 to-transparent text-center border-r border-slate-700/50">
           <MeltedGoldLogo className="w-32 h-32 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
           <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent mb-2">
             {t.welcome_back_title}
           </h1>
           <p className="text-slate-400 max-w-xs">{t.welcome_back_subtitle}</p>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white">{t.login_to_account}</h2>
                    <p className="text-sm text-slate-400">{t.app_title}</p>
                </div>
                <LanguageSelector currentLang={lang} onSelect={setLang} label="" />
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg mb-4 animate-pulse">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                    </span>
                    <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl pl-12 pr-4 py-3.5 text-white focus:ring-2 focus:ring-amber-500 outline-none transition" placeholder={t.email} />
                </div>
                
                {/* Password Input */}
                <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </span>
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl pl-12 pr-12 py-3.5 text-white focus:ring-2 focus:ring-amber-500 outline-none transition" placeholder={t.password} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {showPassword 
                            ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59" /></svg>
                        }
                    </button>
                </div>

                <div className="text-right">
                    <a href="#" className="text-sm text-slate-400 hover:text-amber-400 transition">{t.forgot_password}</a>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold py-4 rounded-xl transition shadow-lg shadow-amber-500/20 flex justify-center items-center h-[54px] text-lg">
                    {loading ? <span className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span> : t.login_btn}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
                <button onClick={onRegisterClick} className="hover:text-white transition">
                    {t.create_account}
                </button>
            </div>
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
    <AuthContainer>
        <div className="p-8 sm:p-12 flex flex-col justify-center col-span-full">
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
        </div>
    </AuthContainer>
  );
};