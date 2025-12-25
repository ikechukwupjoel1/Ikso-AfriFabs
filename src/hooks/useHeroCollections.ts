import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface HeroCollection {
    id: string;
    title: string;
    description: string | null;
    tag: string | null;
    fabric_ids: string[];
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const useHeroCollections = () => {
    return useQuery({
        queryKey: ['hero_collections'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('hero_collections')
                .select('*')
                .eq('is_active', true)
                .order('display_order');

            if (error) {
                throw new Error(`Error fetching hero collections: ${error.message}`);
            }

            return data as HeroCollection[];
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
};
