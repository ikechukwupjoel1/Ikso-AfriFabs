import { useState, useEffect } from 'react';
import { Currency } from '@/types/fabric';

export const useCurrency = () => {
  const [currency, setCurrency] = useState<Currency>('NGN');

  useEffect(() => {
    // Simple detection based on timezone or could use geolocation API
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('Porto-Novo') || timezone.includes('Cotonou')) {
      setCurrency('CFA');
    }
  }, []);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'NGN' ? 'CFA' : 'NGN');
  };

  return { currency, setCurrency, toggleCurrency };
};
