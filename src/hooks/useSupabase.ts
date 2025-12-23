import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Example hook showing how to fetch data from Supabase
 * 
 * @example
 * ```tsx
 * const { data, loading, error } = useSupabase('your_table_name');
 * ```
 */
export function useSupabase<T = any>(tableName: string) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const { data: results, error: fetchError } = await supabase
                    .from(tableName)
                    .select('*');

                if (fetchError) throw fetchError;
                setData(results || []);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [tableName]);

    return { data, loading, error };
}

/**
 * Example hook for Supabase authentication
 */
export function useSupabaseAuth() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    };

    const signUp = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    return { user, loading, signIn, signUp, signOut };
}
