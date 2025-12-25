import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Fabric } from '@/types/fabric';

export const useFabrics = () => {
    return useQuery({
        queryKey: ['fabrics'],
        queryFn: async (): Promise<Fabric[]> => {
            const { data, error } = await supabase
                .from('fabrics')
                .select(`
                    *,
                    fabric_categories (
                        name,
                        slug
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map the data to include category slug for filtering
            return (data || []).map(fabric => ({
                ...fabric,
                category: fabric.fabric_categories?.slug || fabric.category || 'ankara',
            }));
        },
        staleTime: 1000 * 60 * 2, // 2 minutes - refresh more frequently for admin changes
    });
};
