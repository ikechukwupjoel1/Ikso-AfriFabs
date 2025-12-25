import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface FabricCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const useCategories = () => {
    return useQuery({
        queryKey: ['fabric_categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('fabric_categories')
                .select('*')
                .eq('is_active', true)
                .order('display_order');

            if (error) {
                throw new Error(`Error fetching categories: ${error.message}`);
            }

            return data as FabricCategory[];
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
};
