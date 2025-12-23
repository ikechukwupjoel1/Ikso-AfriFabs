import { useQuery } from '@tanstack/react-query';
// import { supabase } from '@/lib/supabase';
import { Fabric } from '@/types/fabric';
import { fabrics as localFabrics } from '@/data/fabrics';

export const useFabrics = () => {
    return useQuery({
        queryKey: ['fabrics'],
        queryFn: async (): Promise<Fabric[]> => {
            // For now, return local data which has the correct Cloth Gallery images
            // In a real production app with image hosting, we would switch back to Supabase
            // const { data, error } = await supabase
            //     .from('fabrics')
            //     .select('*')
            //     .order('created_at', { ascending: false });

            // if (error) throw error;

            // Simulating API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            return localFabrics;
        },
    });
};
