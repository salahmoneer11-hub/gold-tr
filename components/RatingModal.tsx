
import React, { useState } from 'react';
import { LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface RatingModalProps {
  onRate: (rating: number, comment: string) => void;
  onClose: () => void;
  lang: LanguageCode;
}

const RatingModal: React.FC<RatingModalProps> = ({ onRate, onClose, lang }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const t = translations[lang];

  const handleSubmit = () => {
    if (rating === 0) return;
    onRate(rating, comment);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-800 p-6 rounded-2xl max-w-sm w-full border border-slate-700 shadow-2xl relative">
         <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
         >
            ✕
         </button>

         <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">{t.rate_us}</h3>
            <p className="text-xs text-gray-400 mb-6">Your feedback helps us improve the AI accuracy.</p>
            
            <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-4xl transition transform hover:scale-110 focus:outline-none ${rating >= star ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'text-slate-600'}`}
                    >
                        ★
                    </button>
                ))}
            </div>

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={lang === 'ar' ? "أكتب ملاحظاتك هنا للأدمن..." : "Write your feedback for the Admin here..."}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none resize-none mb-4 h-24 placeholder-gray-600"
            />

            <button 
                onClick={handleSubmit}
                disabled={rating === 0}
                className={`w-full py-3 rounded-xl font-bold transition shadow-lg
                    ${rating > 0 
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-900/20' 
                        : 'bg-slate-700 text-gray-500 cursor-not-allowed'}
                `}
            >
                {lang === 'ar' ? "إرسال التقييم" : "Submit Review"}
            </button>
         </div>
      </div>
    </div>
  );
};

export default RatingModal;
