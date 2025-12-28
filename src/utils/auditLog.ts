import { supabase } from '@/lib/supabase';

interface LogActionParams {
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    tableName: string;
    recordId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
}

/**
 * Log an admin action to the audit log
 * Call this after successful admin operations
 */
export const logAdminAction = async ({
    action,
    tableName,
    recordId,
    oldValues,
    newValues
}: LogActionParams): Promise<void> => {
    try {
        const { error } = await supabase.rpc('log_admin_action', {
            p_action: action,
            p_table_name: tableName,
            p_record_id: recordId || null,
            p_old_values: oldValues || null,
            p_new_values: newValues || null
        });

        if (error) {
            console.error('Failed to log admin action:', error);
        }
    } catch (err) {
        // Don't throw - audit logging should not block operations
        console.error('Audit log error:', err);
    }
};

export default logAdminAction;
