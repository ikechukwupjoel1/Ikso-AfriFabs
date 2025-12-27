import { useState, useEffect } from 'react';
import { Currency } from '@/types/fabric';
import { detectCurrency, detectCurrencySync, detectCountry } from '@/lib/geolocation';

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
  const [country, setCountry] = useState<string>('');

  useEffect(() => {
    // Only auto-detect if user hasn't set a manual preference
    const savedPreference = localStorage.getItem(CURRENCY_PREFERENCE_KEY);
    if (savedPreference) {
      setDetected(true);
      // Still detect country for display purposes
      detectCountry().then(({ country }) => setCountry(country));
      return;
    }

    // Detect currency and country based on IP location
    Promise.all([detectCurrency(), detectCountry()]).then(([detectedCurrency, { country }]) => {
      setCurrency(detectedCurrency);
      setCountry(country);
      setDetected(true);
    });
  }, []);

  const toggleCurrency = () => {
    setCurrency((prev) => {
      const newCurrency = prev === 'NGN' ? 'CFA' : 'NGN';
      // Save manual preference
      localStorage.setItem(CURRENCY_PREFERENCE_KEY, newCurrency);
      // Update country display based on new currency
      setCountry(newCurrency === 'NGN' ? 'Nigeria' : 'West Africa');
      return newCurrency;
    });
  };

  return { currency, setCurrency, toggleCurrency, detected, country };
};
