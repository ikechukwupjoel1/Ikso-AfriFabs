import { Currency } from '@/types/fabric';

/**
 * Calculate price in the selected currency
 * @param priceCFA Base price in CFA
 * @param currency Target currency
 * @param exchangeRate XOF to NGN exchange rate
 * @param priceNGN Optional stored NGN price (preferred when available)
 * @returns Calculated price
 */
export function calculatePrice(
    priceCFA: number,
    currency: Currency,
    exchangeRate: number,
    priceNGN?: number
): number {
    if (currency === 'CFA') {
        return priceCFA || 0;
    }
    // Use stored NGN price if available, otherwise convert from CFA
    if (priceNGN && priceNGN > 0) {
        return priceNGN;
    }
    // Fallback: Convert CFA to NGN using live exchange rate
    return Math.round((priceCFA || 0) * (exchangeRate || 1));
}

/**
 * Format price with currency symbol
 * @param price Price value
 * @param currency Currency type
 * @returns Formatted price string
 */
export function formatPrice(price: number | undefined | null, currency: Currency): string {
    const safePrice = price ?? 0;
    if (currency === 'NGN') {
        return `₦${safePrice.toLocaleString()}`;
    }
    return `${safePrice.toLocaleString()} CFA`;
}
