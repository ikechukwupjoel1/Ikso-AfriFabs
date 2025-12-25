import { useState, useEffect } from 'react';
import { Currency } from '@/types/fabric';
import { detectCurrency, detectCurrencySync } from '@/lib/geolocation';

const CURRENCY_PREFERENCE_KEY = 'user_currency_preference';

export const useCurrency = () => {
  // Start with cached preference or sync detection
  const [currency, setCurrency] = useState<Currency>(() => {
    // Check if user has a manual preference saved
    const saved = localStorage.getItem(CURRENCY_PREFERENCE_KEY);
    if (saved === 'NGN' || saved === 'CFA') {
      return saved;
    }
    // Use sync detection (from geo cache if available)
    return detectCurrencySync();
  });
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    // Only auto-detect if user hasn't set a manual preference
    const savedPreference = localStorage.getItem(CURRENCY_PREFERENCE_KEY);
    if (savedPreference) {
      setDetected(true);
      return;
    }

    // Detect currency based on IP location
    detectCurrency().then((detectedCurrency) => {
      setCurrency(detectedCurrency);
      setDetected(true);
    });
  }, []);

  const toggleCurrency = () => {
    setCurrency((prev) => {
      const newCurrency = prev === 'NGN' ? 'CFA' : 'NGN';
      // Save manual preference
      localStorage.setItem(CURRENCY_PREFERENCE_KEY, newCurrency);
      return newCurrency;
    });
  };

  return { currency, setCurrency, toggleCurrency, detected };
};
