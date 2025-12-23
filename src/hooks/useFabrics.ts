import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Fabric } from '@/types/fabric';

// Type definition matching the database implementation
interface FabricDB {
    id: string;
    name: string;
    brand: string;
    description: string;
    price_ngn: number;
    price_cfa: number;
    image_url: string;
    category: 'ankara' | 'kente' | 'adire' | 'aso-oke';
    in_stock: boolean;
    yardage: number;
    tags: string[];
}

export const useFabrics = () => {
    return useQuery({
        queryKey: ['fabrics'],
        queryFn: async (): Promise<Fabric[]> => {
            const { data, error } = await supabase
                .from('fabrics')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            // Map DB snake_case to frontend camelCase
            return (data as FabricDB[]).map((item) => ({
                id: item.id,
                name: item.name,
                brand: item.brand,
                description: item.description,
                priceNGN: item.price_ngn,
                priceCFA: item.price_cfa,
                image: item.image_url, // map image_url to image
                category: item.category,
                inStock: item.in_stock,
                yardage: item.yardage,
                tags: item.tags,
            }));
        },
    });
};
