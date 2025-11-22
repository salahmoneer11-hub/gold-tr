
import React, { useState } from 'react';
import { MeltedGoldLogo } from './Logo';
import { LanguageCode } from '../types';
import { translations } from '../utils/translations';
import LanguageSelector from './LanguageSelector';

interface LoginProps {
  onLogin: (email: string) => boolean; // Changed to return boolean
  onRegisterClick: () => void;
  onForgotPassword: () => void;
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onRegisterClick, onForgotPassword, lang, setLang }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        const success = onLogin(email);
        setLoading(false);
        // If success, parent handles view change. If fail, we stay here.
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full relative z-10 flex-col">
      <div className="absolute top-6 right-6">
         <LanguageSelector currentLang={lang} onSelect={setLang} label={t.lang_select} />
      </div>
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl relative">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full mb-4 shadow-xl shadow-amber-500/10 border border-slate-700">
              <MeltedGoldLogo className="w-20 h-20" />
           </div>
           <h1 className="text-3xl font-bold text-white mb-2">{t.app_title}</h1>
           <p className="text-slate-400">{t.login_title}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.email}</label>
                <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                    placeholder="user@example.com"
                />
            </div>
            
            <div>
                <div className="flex justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-300">{t.password}</label>
                    <button type="button" onClick={onForgotPassword} className="text-sm text-amber-400 hover:text-amber-300 transition">{t.forgot_pass}</button>
                </div>
                <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                    placeholder="••••••••"
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold py-3.5 rounded-xl transition shadow-lg shadow-amber-500/20 flex justify-center items-center"
            >
                {loading ? (
                    <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                ) : t.login_btn}
            </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={onRegisterClick}
            className="text-sm text-slate-400 hover:text-white transition border-b border-transparent hover:border-white pb-0.5"
          >
            {t.create_account}
          </button>
        </div>
      </div>
    </div>
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
    if(password !== confirmPassword) {
      return;
    }
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        onRegister(email);
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full relative z-10 flex-col">
       <div className="absolute top-6 right-6">
         <LanguageSelector currentLang={lang} onSelect={setLang} label={t.lang_select} />
      </div>
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl relative">
        <div className="text-center mb-8">
           <h1 className="text-2xl font-bold text-white mb-2">{t.register_title}</h1>
           <p className="text-slate-400">Join Gold AI Pro</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.email}</label>
                <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.password}</label>
                <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.confirm_password}</label>
                <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl transition flex justify-center items-center"
            >
                {loading ? '...' : t.register_btn}
            </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={onLoginClick}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            {t.have_account}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ActivationProps {
  onActivate: (code: string) => void;
  onBack: () => void;
  lang: LanguageCode;
}

export const Activation: React.FC<ActivationProps> = ({ onActivate, onBack, lang }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        onActivate(code);
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full relative z-10">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl relative">
         <button onClick={onBack} className="absolute top-6 left-6 text-slate-400 hover:text-white transition flex items-center gap-1 text-sm font-bold">
            <span>🡸</span>
         </button>

         <div className="text-center mb-8 mt-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4 text-3xl">
              🔐
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t.activation_title}</h2>
            <p className="text-sm text-slate-400 px-4">{t.activation_desc}</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
             <div>
                <label className="block text-sm font-medium text-amber-400 mb-2 uppercase tracking-wider text-center">{t.activation_code_label}</label>
                <input 
                    type="text" 
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-4 text-white text-center tracking-[0.2em] focus:ring-2 focus:ring-amber-500 outline-none transition font-mono text-xl shadow-inner"
                    placeholder="XXXX-XXXX-XXXX"
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition flex justify-center shadow-lg shadow-green-900/20"
            >
                 {loading ? '...' : t.activate_btn}
            </button>
         </form>
      </div>
    </div>
  );
};

interface ForgotPasswordProps {
  onBack: () => void;
  onResetSuccess: () => void;
  onSendCode: (email: string) => void;
  lang: LanguageCode;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onResetSuccess, onSendCode, lang }) => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        onSendCode(email);
        setStep(2);
    }, 1500);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        onResetSuccess();
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full relative z-10">
       <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl relative">
         <button onClick={onBack} className="absolute top-6 left-6 text-slate-400 hover:text-white transition flex items-center gap-1 text-sm font-bold">
            <span>🡸</span>
         </button>
         
         <div className="text-center mb-8 mt-4">
            <h2 className="text-2xl font-bold text-white mb-2">{t.forgot_pass}</h2>
         </div>

         {step === 1 ? (
             <form onSubmit={handleSendCode} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.email}</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 rounded-xl transition flex justify-center"
                >
                    {loading ? '...' : 'Send Code'}
                </button>
             </form>
         ) : (
             <form onSubmit={handleReset} className="space-y-5 animate-fadeIn">
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">OTP</label>
                    <input 
                        type="text" 
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white text-center tracking-[0.5em] focus:ring-2 focus:ring-amber-500 outline-none transition font-mono text-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.password}</label>
                    <input 
                        type="password" 
                        required
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition flex justify-center"
                >
                     {loading ? '...' : 'Reset Password'}
                </button>
             </form>
         )}
       </div>
    </div>
  );
};
