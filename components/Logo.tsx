import React from 'react';

export const MeltedGoldLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gold-melt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FCD34D" /> {/* Light Gold */}
        <stop offset="40%" stopColor="#F59E0B" /> {/* Standard Gold */}
        <stop offset="80%" stopColor="#B45309" /> {/* Dark Gold */}
        <stop offset="100%" stopColor="#78350F" /> {/* Deep Brown/Gold */}
      </linearGradient>
      <filter id="gold-glow">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="coin-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    
    {/* Main Melting Shape */}
    <path 
      d="M20,35 
         Q20,10 50,10 
         Q80,10 80,35 
         Q80,55 70,65 
         Q65,70 65,85 
         Q65,95 60,90 
         Q55,80 50,75
         Q45,80 40,92
         Q38,98 35,92
         Q30,80 25,70
         Q20,60 20,35 Z" 
      fill="url(#gold-melt-grad)" 
      stroke="#92400E" 
      strokeWidth="1"
      style={{ filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.3))' }}
    />
    
    {/* Shine/Highlight */}
    <ellipse cx="35" cy="25" rx="10" ry="5" transform="rotate(-45 35 25)" fill="white" opacity="0.4" />
    <circle cx="70" cy="30" r="3" fill="white" opacity="0.3" />

    {/* Dripping Coin 1 */}
    <circle cx="65" cy="96" r="3" fill="url(#coin-grad)" />
    
    {/* Dripping Coin 2 */}
    <circle cx="40" cy="102" r="2.5" fill="url(#coin-grad)" />

    {/* Dollar Sign embedded in the gold blob */}
    <text 
      x="50" 
      y="55" 
      textAnchor="middle" 
      fill="#78350F" 
      fontSize="30" 
      fontWeight="900" 
      fontFamily="serif" 
      style={{ opacity: 0.7 }}
    >
      $
    </text>
  </svg>
);