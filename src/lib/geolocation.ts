// Geolocation service - detect visitor's country for location-based pricing
// Uses free IP geolocation API to detect country

const GEO_CACHE_KEY = 'user_country';
const GEO_CACHE_DURATION_MS = 1000 * 60 * 60 * 24; // 24 hours

interface GeoCache {
    country: string;
    countryCode: string;
    timestamp: number;
}

/**
 * Get cached country
 */
function getCachedCountry(): GeoCache | null {
    try {
        const cached = localStorage.getItem(GEO_CACHE_KEY);
        if (cached) {
            const data = JSON.parse(cached) as GeoCache;
            if (Date.now() - data.timestamp < GEO_CACHE_DURATION_MS) {
                return data;
            }
        }
    } catch {
        // Ignore cache errors
    }
    return null;
}

/**
 * Save country to cache
 */
function setCachedCountry(country: string, countryCode: string): void {
    try {
        const data: GeoCache = {
            country,
            countryCode,
            timestamp: Date.now(),
        };
        localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(data));
    } catch {
        // Ignore cache errors
    }
}

/**
 * Detect visitor's country using IP geolocation
 * Returns country code (e.g., 'NG' for Nigeria, 'BJ' for Benin)
 */
export async function detectCountry(): Promise<{ country: string; countryCode: string }> {
    // Check cache first
    const cached = getCachedCountry();
    if (cached) {
        return { country: cached.country, countryCode: cached.countryCode };
    }

    try {
        // Using ipapi.co (free, HTTPS, no API key required)
        const response = await fetch('https://ipapi.co/json/', {
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.country_code) {
                setCachedCountry(data.country_name || data.country, data.country_code);
                return { country: data.country_name || data.country, countryCode: data.country_code };
            }
        }
    } catch (error) {
        console.warn('Failed to detect country, using default:', error);
    }

    // Fallback to Benin as default (for CFA pricing)
    return { country: 'Benin', countryCode: 'BJ' };
}

/**
 * Get preferred currency based on country
 * Nigeria (NG) = NGN, All other West African countries = CFA
 */
export function getCurrencyForCountry(countryCode: string): 'NGN' | 'CFA' {
    // Nigeria uses NGN
    if (countryCode === 'NG') {
        return 'NGN';
    }

    // West African CFA countries: Benin, Burkina Faso, Ivory Coast, Guinea-Bissau, 
    // Mali, Niger, Senegal, Togo
    // Central African CFA countries: Cameroon, CAR, Chad, Congo, Equatorial Guinea, Gabon
    // Default to CFA for all others
    return 'CFA';
}

/**
 * Detect country and get appropriate currency
 */
export async function detectCurrency(): Promise<'NGN' | 'CFA'> {
    const { countryCode } = await detectCountry();
    return getCurrencyForCountry(countryCode);
}

/**
 * Synchronous version using cached location
 */
export function detectCurrencySync(): 'NGN' | 'CFA' {
    const cached = getCachedCountry();
    if (cached) {
        return getCurrencyForCountry(cached.countryCode);
    }
    // Default to CFA if no cache
    return 'CFA';
}
