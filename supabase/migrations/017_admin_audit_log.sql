-- =====================================================
-- STEP 017: Admin Audit Logging
-- Run this in Supabase SQL Editor
-- Tracks all admin actions for security and accountability
-- =====================================================

-- SECTION 1: Create audit log table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 2: Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON admin_audit_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON admin_audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON admin_audit_logs(table_name, record_id);

-- SECTION 3: Enable RLS
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view audit logs"
ON admin_audit_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND role = 'super_admin'
    )
);

-- Only authenticated users can insert (via function)
CREATE POLICY "System can insert audit logs"
ON admin_audit_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- SECTION 4: Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    p_action TEXT,
    p_table_name TEXT,
    p_record_id TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    admin_email_val TEXT;
    log_id UUID;
BEGIN
    -- Get current user's email from JWT claim (avoids permission issues with auth.users)
    admin_email_val := auth.jwt() ->> 'email';
    
    -- If no email found, return null
    IF admin_email_val IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Only log if user is an admin
    IF NOT EXISTS (SELECT 1 FROM admin_users WHERE email = admin_email_val) THEN
        RETURN NULL;
    END IF;
    
    -- Insert audit log
    INSERT INTO admin_audit_logs (
        admin_email,
        action,
        table_name,
        record_id,
        old_values,
        new_values
    ) VALUES (
        admin_email_val,
        p_action,
        p_table_name,
        p_record_id,
        p_old_values,
        p_new_values
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECTION 5: Grant execute permission
GRANT EXECUTE ON FUNCTION log_admin_action(TEXT, TEXT, TEXT, JSONB, JSONB) TO authenticated;

-- SECTION 6: Create helper function to get recent audit logs
CREATE OR REPLACE FUNCTION get_recent_audit_logs(
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_table_filter TEXT DEFAULT NULL,
    p_admin_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    admin_email TEXT,
    action TEXT,
    table_name TEXT,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.admin_email,
        al.action,
        al.table_name,
        al.record_id,
        al.old_values,
        al.new_values,
        al.created_at
    FROM admin_audit_logs al
    WHERE 
        (p_table_filter IS NULL OR al.table_name = p_table_filter)
        AND (p_admin_filter IS NULL OR al.admin_email = p_admin_filter)
    ORDER BY al.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_recent_audit_logs(INTEGER, INTEGER, TEXT, TEXT) TO authenticated;

-- SECTION 7: Verify
SELECT 'Admin audit logging migration complete!' AS status;
