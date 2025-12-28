-- =====================================================
-- STEP 018: Rate Limit Cleanup Cron Job
-- Run this in Supabase SQL Editor
-- Sets up automatic cleanup of old rate limit records
-- =====================================================

-- SECTION 1: Enable pg_cron extension (if not already enabled)
-- Note: This requires Supabase Pro plan or self-hosted Supabase
-- If on free tier, skip this step and run cleanup manually

-- Uncomment the following line if you have pg_cron available:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- SECTION 2: Create improved cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM order_rate_limits 
    WHERE created_at < NOW() - INTERVAL '2 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION cleanup_old_rate_limits() TO service_role;

-- SECTION 3: Schedule hourly cleanup (requires pg_cron)
-- Uncomment if you have pg_cron enabled:
/*
SELECT cron.schedule(
    'cleanup-rate-limits',           -- Job name
    '0 * * * *',                     -- Every hour at minute 0
    'SELECT cleanup_old_rate_limits()'
);
*/

-- SECTION 4: Alternative - Manual cleanup command
-- Run this periodically via Supabase scheduled functions or external cron:
-- SELECT cleanup_old_rate_limits();

-- SECTION 5: View scheduled jobs (if pg_cron is enabled)
-- Uncomment to view:
-- SELECT * FROM cron.job;

-- =====================================================
-- ALTERNATIVE: Supabase Edge Function for Cleanup
-- =====================================================
-- If pg_cron is not available, you can create a Supabase Edge Function
-- and schedule it via an external service (e.g., Vercel Cron, GitHub Actions)
--
-- Edge Function example (create in supabase/functions/cleanup-rate-limits):
/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data, error } = await supabaseClient.rpc('cleanup_old_rate_limits')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }

  return new Response(JSON.stringify({ 
    success: true, 
    deleted_count: data,
    timestamp: new Date().toISOString()
  }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  })
})
*/

-- SECTION 6: Verify
SELECT 'Rate limit cleanup migration complete!' AS status;
SELECT 'Run: SELECT cleanup_old_rate_limits(); periodically to clean old records' AS instruction;
