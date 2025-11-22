
import React, { useState } from 'react';
import { LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface RatingModalProps {
  onRate: (rating: number) => void;
  onClose: () => void;
  lang: LanguageCode;
}

const RatingModal: React.FC<RatingModalProps> = ({ onRate, onClose, lang }) => {
  const [rating, setRating] = useState(0);
  const t = translations[lang];

  const handleRate = (r: number) => {
    setRating(r);
    setTimeout(() => {
        onRate(r);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-800 p-6 rounded-2xl max-w-sm w-full border border-slate-700 shadow-2xl text-center">
         <h3 className="text-xl font-bold text-white mb-4">{t.rate_us}</h3>
         <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className={`text-4xl transition transform hover:scale-110 ${rating >= star ? 'text-amber-400' : 'text-slate-600'}`}
                >
                    ★
                </button>
            ))}
         </div>
         <button onClick={onClose} className="text-gray-500 hover:text-white text-sm">
             Close
         </button>
      </div>
    </div>
  );
};

export default RatingModal;
