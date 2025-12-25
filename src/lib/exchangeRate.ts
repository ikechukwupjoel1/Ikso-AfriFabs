// Exchange rate service - fetches live NGN/CFA rates
// Using abokifx API for Nigerian black market rates

const CACHE_KEY = 'exchange_rate_cache';
const CACHE_DURATION_MS = 1000 * 60 * 60; // 1 hour cache

interface ExchangeRateCache {
    rate: number;
    timestamp: number;
}

// Fallback rate if API fails (1 CFA = 2500 NGN as of Dec 2025)
const FALLBACK_CFA_TO_NGN = 2500;

/**
 * Get cached exchange rate
 */
function getCachedRate(): ExchangeRateCache | null {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const data = JSON.parse(cached) as ExchangeRateCache;
            if (Date.now() - data.timestamp < CACHE_DURATION_MS) {
                return data;
            }
        }
    } catch {
        // Ignore cache errors
    }
    return null;
}

/**
 * Save rate to cache
 */
function setCachedRate(rate: number): void {
    try {
        const data: ExchangeRateCache = {
            rate,
            timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
        // Ignore cache errors
    }
}

/**
 * Fetch live CFA to NGN exchange rate from API
 * Falls back to hardcoded rate if API fails
 */
export async function getCfaToNgnRate(): Promise<number> {
    // Check cache first
    const cached = getCachedRate();
    if (cached) {
        return cached.rate;
    }

    try {
        // Try to fetch from exchange rate API
        // Using exchangerate-api.com (free tier available)
        const response = await fetch(
            'https://api.exchangerate-api.com/v4/latest/XOF'
        );

        if (response.ok) {
            const data = await response.json();
            // XOF to NGN rate
            const rate = data.rates?.NGN || FALLBACK_CFA_TO_NGN;
            setCachedRate(rate);
            return rate;
        }
    } catch (error) {
        console.warn('Failed to fetch exchange rate, using fallback:', error);
    }

    // Return fallback rate
    return FALLBACK_CFA_TO_NGN;
}

/**
 * Convert CFA to NGN
 */
export async function cfaToNgn(cfaAmount: number): Promise<number> {
    const rate = await getCfaToNgnRate();
    return Math.round(cfaAmount * rate);
}

/**
 * Convert NGN to CFA
 */
export async function ngnToCfa(ngnAmount: number): Promise<number> {
    const rate = await getCfaToNgnRate();
    return Math.round(ngnAmount / rate);
}

/**
 * Synchronous version using cached or fallback rate
 * Use this for immediate UI updates
 */
export function getCfaToNgnRateSync(): number {
    const cached = getCachedRate();
    return cached?.rate || FALLBACK_CFA_TO_NGN;
}

export function cfaToNgnSync(cfaAmount: number): number {
    const rate = getCfaToNgnRateSync();
    return Math.round(cfaAmount * rate);
}

export function ngnToCfaSync(ngnAmount: number): number {
    const rate = getCfaToNgnRateSync();
    return Math.round(ngnAmount / rate);
}
