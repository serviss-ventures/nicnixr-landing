import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showTagline?: boolean;
}

export function Logo({ size = 'md', showText = true, showTagline = false }: LogoProps) {
  const sizeClasses = {
    sm: { icon: 'h-8 w-8', text: 'text-lg', tagline: 'text-xs' },
    md: { icon: 'h-10 w-10', text: 'text-xl', tagline: 'text-xs' },
    lg: { icon: 'h-12 w-12', text: 'text-2xl', tagline: 'text-sm' }
  };

  const { icon, text, tagline } = sizeClasses[size];

  return (
    <div className="flex items-center gap-3">
      {/* Icon */}
      <div className="relative group">
        <div className={`${icon} rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300 group-hover:shadow-primary/40 group-hover:scale-105`}>
          <span className="text-white font-bold text-lg">N</span>
        </div>
        {/* Subtle glow effect on hover */}
        <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${text} font-light tracking-wider text-white`}>
            NIXR
          </span>
          {showTagline && (
            <span className={`${tagline} font-light tracking-widest text-white/40 uppercase`}>
              Quit Nicotine for Good
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Alternative minimalist logo version
export function LogoMinimal() {
  return (
    <div className="relative">
      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
        <span className="text-white font-bold text-sm">N</span>
      </div>
    </div>
  );
}

// Text-only logo
export function LogoText({ className = '' }: { className?: string }) {
  return (
    <span className={`font-light tracking-wider text-white ${className}`}>
      NIXR
    </span>
  );
} 