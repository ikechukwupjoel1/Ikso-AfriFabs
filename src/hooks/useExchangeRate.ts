import { useState, useEffect } from 'react';

const EXCHANGE_RATE_API_KEY = 'f8c4e8a0e8f8c4e8a0e8f8c4'; // Free tier key
const API_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/pair/XOF/NGN`;
const CACHE_KEY = 'xof_ngn_exchange_rate';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const BLACK_MARKET_MARKUP = 1.07; // 7% markup for black market rate
const FALLBACK_RATE = 2.75; // Fallback if API fails

interface CachedRate {
    rate: number;
    timestamp: number;
}

export function useExchangeRate() {
    const [rate, setRate] = useState<number>(FALLBACK_RATE);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRate = async () => {
            try {
                // Check cache first
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { rate: cachedRate, timestamp }: CachedRate = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_DURATION) {
                        setRate(cachedRate);
                        setLoading(false);
                        return;
                    }
                }

                // Fetch fresh rate from API
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error('Failed to fetch exchange rate');
                }

                const data = await response.json();
                if (data.result === 'success') {
                    const officialRate = data.conversion_rate;
                    const blackMarketRate = Number((officialRate * BLACK_MARKET_MARKUP).toFixed(2));

                    // Cache the rate
                    const cacheData: CachedRate = {
                        rate: blackMarketRate,
                        timestamp: Date.now(),
                    };
                    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

                    setRate(blackMarketRate);
                } else {
                    throw new Error('Invalid API response');
                }
            } catch (err) {
                console.error('Exchange rate fetch error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                // Use fallback rate
                setRate(FALLBACK_RATE);
            } finally {
                setLoading(false);
            }
        };

        fetchRate();
    }, []);

    return { rate, loading, error };
}
