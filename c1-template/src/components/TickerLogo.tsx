'use client';

import { useEffect, useState } from 'react';
import { getLogoUrl } from '@/lib/data/logo-client';

interface TickerLogoProps {
  ticker: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: React.ReactNode;
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export function TickerLogo({ ticker, size = 'md', className = '', fallback }: TickerLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchLogo() {
      try {
        setLoading(true);
        setError(false);
        const url = await getLogoUrl(ticker);
        
        if (mounted) {
          if (url) {
            setLogoUrl(url);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        console.error(`Failed to load logo for ${ticker}:`, err);
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchLogo();

    return () => {
      mounted = false;
    };
  }, [ticker]);

  const sizeClass = sizeMap[size];

  // Loading state
  if (loading) {
    return (
      <div className={`${sizeClass} ${className} rounded-full bg-gray-700 animate-pulse`} />
    );
  }

  // Error state or no logo - show fallback or ticker initial
  if (error || !logoUrl) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default fallback: show first letter of ticker in a circle
    const initial = ticker.replace('-USD', '').charAt(0).toUpperCase();
    return (
      <div 
        className={`${sizeClass} ${className} rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold`}
        style={{ fontSize: size === 'sm' ? '0.75rem' : size === 'md' ? '1rem' : size === 'lg' ? '1.5rem' : '2rem' }}
      >
        {initial}
      </div>
    );
  }

  // Success - show logo
  return (
    <img
      src={logoUrl}
      alt={`${ticker} logo`}
      className={`${sizeClass} ${className} rounded-full object-contain bg-white/5 p-1`}
      onError={() => setError(true)}
    />
  );
}
