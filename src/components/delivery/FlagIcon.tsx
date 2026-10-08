import React from 'react';

interface FlagIconProps {
  countryCode: string;
  className?: string;
}

export function FlagIcon({ countryCode, className = 'w-4 h-4' }: FlagIconProps) {
  const code = (countryCode || '').toUpperCase().trim();

  // Switzerland (White cross on red)
  if (code === 'CH') {
    return (
      <svg
        viewBox="0 0 32 32"
        className={`inline-block rounded-xs overflow-hidden shrink-0 ${className}`}
        aria-label="Drapeau Suisse"
      >
        <rect width="32" height="32" fill="#D52B1E" />
        <rect x="13" y="6" width="6" height="20" fill="#FFFFFF" />
        <rect x="6" y="13" width="20" height="6" fill="#FFFFFF" />
      </svg>
    );
  }

  // Portugal (Green and red with shield)
  if (code === 'PT') {
    return (
      <svg
        viewBox="0 0 32 21"
        className={`inline-block rounded-xs overflow-hidden shrink-0 ${className}`}
        aria-label="Drapeau Portugal"
      >
        <rect width="13" height="21" fill="#006600" />
        <rect x="13" width="19" height="21" fill="#FF0000" />
        <circle cx="13" cy="10.5" r="4.5" fill="#FFFF00" />
        <circle cx="13" cy="10.5" r="3.2" fill="#FFFFFF" stroke="#003399" strokeWidth="0.8" />
      </svg>
    );
  }

  // France
  if (code === 'FR') {
    return (
      <svg viewBox="0 0 30 20" className={`inline-block rounded-xs overflow-hidden shrink-0 ${className}`} aria-label="Drapeau France">
        <rect width="10" height="20" fill="#0055A4" />
        <rect x="10" width="10" height="20" fill="#FFFFFF" />
        <rect x="20" width="10" height="20" fill="#EF4135" />
      </svg>
    );
  }

  // Germany
  if (code === 'DE') {
    return (
      <svg viewBox="0 0 30 20" className={`inline-block rounded-xs overflow-hidden shrink-0 ${className}`} aria-label="Drapeau Allemagne">
        <rect width="30" height="6.6" fill="#000000" />
        <rect y="6.6" width="30" height="6.6" fill="#DD0000" />
        <rect y="13.2" width="30" height="6.6" fill="#FFCE00" />
      </svg>
    );
  }

  // European Union (Default for other European destinations)
  return (
    <svg
      viewBox="0 0 30 20"
      className={`inline-block rounded-xs overflow-hidden shrink-0 ${className}`}
      aria-label="Drapeau Europe"
    >
      <rect width="30" height="20" fill="#003399" />
      <g fill="#FFCC00">
        <circle cx="15" cy="4" r="1" />
        <circle cx="19.5" cy="5.5" r="1" />
        <circle cx="21" cy="10" r="1" />
        <circle cx="19.5" cy="14.5" r="1" />
        <circle cx="15" cy="16" r="1" />
        <circle cx="10.5" cy="14.5" r="1" />
        <circle cx="9" cy="10" r="1" />
        <circle cx="10.5" cy="5.5" r="1" />
      </g>
    </svg>
  );
}
