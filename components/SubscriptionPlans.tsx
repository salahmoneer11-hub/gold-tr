
import React from 'react';
import { LanguageCode, SubscriptionPlan } from '../types';
import { translations } from '../utils/translations';
import { MeltedGoldLogo } from './Logo';
import LanguageSelector from './LanguageSelector';

interface SubscriptionPlansProps {
  onSelectPlan: (planId: string) => void;
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSelectPlan, lang, setLang }) => {
  const t = translations[lang];

  const plans: SubscriptionPlan[] = [
    {
      id: 'weekly',
      period: t.plan_weekly,
      price: 100,
      features: [t.feature_signals, t.feature_updates],
    },
    {
      id: 'monthly',
      period: t.plan_monthly,
      price: 200,
      savings: '50%',
      isPopular: true,
      features: [t.feature_ai, t.feature_signals, t.feature_news, t.feature_updates],
    },
    {
      id: 'yearly',
      period: t.plan_yearly,
      price: 1400,
      savings: '40%+',
      features: [t.feature_ai, t.feature_signals, t.feature_news, t.feature_support, t.feature_updates],
    }
  ];

  const handlePayPalClick = (planId: string, price: number) => {
    const businessEmail = "salahmoneer11@gmail.com";
    // Construct PayPal URL for "Buy Now"
    // cmd=_xclick: Buy Now button
    // business: Merchant email
    // item_name: Description
    // amount: Price
    // currency_code: USD
    const url = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${businessEmail}&item_name=GoldAI%20${planId}%20Subscription&amount=${price}&currency_code=USD`;

    // Open PayPal in a new window/popup to allow payment
    const width = 500;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    
    window.open(url, 'PayPal', `width=${width},height=${height},top=${top},left=${left}`);
    
    // In this demo/simulation flow, we proceed to the activation screen
    // assuming the user completes payment or closes the window.
    // Real app would use webhook/IPN to confirm.
    onSelectPlan(planId);
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] w-full relative z-10 flex-col py-10">
       <div className="absolute top-6 right-6">
         <LanguageSelector currentLang={lang} onSelect={setLang} label={t.lang_select} />
      </div>
      
      <div className="text-center mb-10">
         <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full mb-4 shadow-lg shadow-amber-500/10 border border-slate-700">
              <MeltedGoldLogo className="w-12 h-12" />
         </div>
         <h1 className="text-3xl font-bold text-white mb-2">{t.select_plan_title}</h1>
         <p className="text-slate-400">{t.app_title} - {t.global_access}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative glass-panel rounded-2xl p-6 flex flex-col transition-all duration-300 hover:transform hover:-translate-y-2
              ${plan.isPopular ? 'border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-gradient-to-b from-slate-800 to-slate-900' : 'border border-slate-700 hover:border-amber-500/50'}
            `}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-black font-bold px-4 py-1 rounded-full text-xs shadow-lg">
                {t.most_popular}
              </div>
            )}
            {plan.savings && (
               <div className="absolute top-4 right-4 bg-green-900/50 text-green-400 text-[10px] font-bold px-2 py-1 rounded border border-green-700">
                 {t.save_text} {plan.savings}
               </div>
            )}

            <h3 className="text-xl font-bold text-gray-300 mb-2">{plan.period}</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-bold text-white">${plan.price}</span>
              <span className="text-sm text-gray-500 mb-1">{t.usd_suffix || '/ USD'}</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="text-amber-500">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handlePayPalClick(plan.id, plan.price)}
              className={`w-full py-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2
                ${plan.isPopular 
                  ? 'bg-[#0070ba] hover:bg-[#005ea6] text-white shadow-blue-900/20' 
                  : 'bg-slate-700 hover:bg-slate-600 text-white'}
              `}
            >
              {/* PayPal Icon SVG */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20.067 8.478c.492.315.844.825.976 1.473.117.573.07 1.424-.238 2.466-.622 2.117-2.172 3.78-4.338 3.78h-.836c-.313 0-.588.225-.645.532l-.19.936-.34 1.665-.057.285c-.04.195-.21.336-.41.336h-2.685c-.28 0-.486-.26-.428-.532l.945-4.473.057-.262c.057-.26.28-.45.546-.45h1.35c2.137 0 3.69-1.002 4.194-2.77.203-.713.156-1.27-.036-1.653-.25-.494-.78-.78-1.64-.78h-2.79l-.07.306-.055.258-.836 3.953-.063.305c-.06.307-.33.522-.643.522h-2.64c-.292 0-.51-.252-.448-.538l1.625-7.672c.062-.286.315-.492.608-.492h4.56c2.056 0 3.67.73 4.164 2.14z"/>
              </svg>
              {t.pay_paypal}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
