-- =====================================================
-- STEP 016: Order Rate Limiting
-- Run this in Supabase SQL Editor
-- Prevents spam orders by limiting to 5 per IP per hour
-- =====================================================

-- SECTION 1: Create rate limit tracking table
CREATE TABLE IF NOT EXISTS order_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_ip TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 2: Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_time 
ON order_rate_limits(client_ip, created_at DESC);

-- SECTION 3: Enable RLS
ALTER TABLE order_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for tracking)
CREATE POLICY "Anyone can insert rate limits"
ON order_rate_limits FOR INSERT
WITH CHECK (true);

-- Allow anyone to read their own IP's limits (for checking)
CREATE POLICY "Anyone can read rate limits"
ON order_rate_limits FOR SELECT
USING (true);

-- SECTION 4: Cleanup function for old records (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM order_rate_limits 
    WHERE created_at < NOW() - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECTION 5: Check rate limit function
-- Returns TRUE if allowed, FALSE if rate limited
CREATE OR REPLACE FUNCTION check_order_rate_limit(p_client_ip TEXT)
RETURNS JSONB AS $$
DECLARE
    order_count INTEGER;
    oldest_order TIMESTAMPTZ;
    seconds_until_reset INTEGER;
BEGIN
    -- Count orders from this IP in the last hour
    SELECT COUNT(*), MIN(created_at)
    INTO order_count, oldest_order
    FROM order_rate_limits
    WHERE client_ip = p_client_ip
    AND created_at > NOW() - INTERVAL '1 hour';
    
    -- If under limit (5 orders per hour), allow
    IF order_count < 5 THEN
        -- Record this attempt
        INSERT INTO order_rate_limits (client_ip) VALUES (p_client_ip);
        
        RETURN jsonb_build_object(
            'allowed', true,
            'remaining', 5 - order_count - 1,
            'reset_in_seconds', 0
        );
    ELSE
        -- Calculate time until oldest order expires
        seconds_until_reset := EXTRACT(EPOCH FROM (oldest_order + INTERVAL '1 hour' - NOW()))::INTEGER;
        
        RETURN jsonb_build_object(
            'allowed', false,
            'remaining', 0,
            'reset_in_seconds', GREATEST(seconds_until_reset, 0),
            'message', 'Too many orders. Please try again in ' || 
                       CEIL(seconds_until_reset / 60.0)::TEXT || ' minutes.'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECTION 6: Grant execute permission
GRANT EXECUTE ON FUNCTION check_order_rate_limit(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_rate_limits() TO service_role;

-- SECTION 7: Verify
SELECT 'Rate limiting migration complete!' AS status;
