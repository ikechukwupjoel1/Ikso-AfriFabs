import { Currency } from '@/types/fabric';

/**
 * Calculate price in the selected currency
 * @param priceCFA Base price in CFA
 * @param currency Target currency
 * @param exchangeRate XOF to NGN exchange rate
 * @returns Calculated price
 */
export function calculatePrice(
    priceCFA: number,
    currency: Currency,
    exchangeRate: number
): number {
    if (currency === 'CFA') {
        return priceCFA;
    }
    // Convert CFA to NGN using live exchange rate
    return Math.round(priceCFA * exchangeRate);
}

/**
 * Format price with currency symbol
 * @param price Price value
 * @param currency Currency type
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: Currency): string {
    if (currency === 'NGN') {
        return `₦${price.toLocaleString()}`;
    }
    return `${price.toLocaleString()} CFA`;
}
