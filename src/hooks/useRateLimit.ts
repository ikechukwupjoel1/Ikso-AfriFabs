import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    reset_in_seconds: number;
    message?: string;
}

/**
 * Hook for checking order rate limits
 * Prevents spam orders by limiting to 5 per IP per hour
 */
export const useRateLimit = () => {
    const [checking, setChecking] = useState(false);
    const [rateLimitError, setRateLimitError] = useState<string | null>(null);

    /**
     * Check if the current client can place an order
     * Returns true if allowed, false if rate limited
     */
    const checkRateLimit = async (): Promise<RateLimitResult> => {
        setChecking(true);
        setRateLimitError(null);

        try {
            // Get client IP (in production, this would come from a server header)
            // For client-side, we use a fingerprint approach
            const clientIp = await getClientIdentifier();

            const { data, error } = await supabase.rpc('check_order_rate_limit', {
                p_client_ip: clientIp
            });

            if (error) {
                console.error('Rate limit check error:', error);
                // On error, allow the order to proceed (fail open)
                return { allowed: true, remaining: 5, reset_in_seconds: 0 };
            }

            const result = data as RateLimitResult;

            if (!result.allowed) {
                setRateLimitError(result.message || 'Too many orders. Please try again later.');
            }

            return result;
        } catch (err) {
            console.error('Rate limit check failed:', err);
            // Fail open - allow order if check fails
            return { allowed: true, remaining: 5, reset_in_seconds: 0 };
        } finally {
            setChecking(false);
        }
    };

    const clearRateLimitError = () => {
        setRateLimitError(null);
    };

    return {
        checkRateLimit,
        checking,
        rateLimitError,
        clearRateLimitError
    };
};

/**
 * Generate a client identifier for rate limiting
 * Uses a combination of browser fingerprinting for anonymous users
 */
async function getClientIdentifier(): Promise<string> {
    // Try to get a consistent identifier
    const components: string[] = [];

    // User agent
    components.push(navigator.userAgent);

    // Screen resolution
    components.push(`${screen.width}x${screen.height}`);

    // Timezone
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Language
    components.push(navigator.language);

    // Create a simple hash of the components
    const identifier = components.join('|');

    // Use a simple hash function
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
        const char = identifier.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return `client_${Math.abs(hash).toString(16)}`;
}

export default useRateLimit;
