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

            // Map database fields to Fabric interface expected by components
            return (data || []).map(fabric => ({
                id: fabric.id,
                name: fabric.name || '',
                brand: fabric.brand || '',
                collection: fabric.collection || '',
                description: fabric.description || '',
                priceCFA: fabric.price_cfa || 0,
                image: fabric.image_url || '',
                gallery: fabric.additional_images || [],
                category: fabric.fabric_categories?.slug || fabric.category || 'ankara',
                inStock: fabric.in_stock ?? true,
                tags: fabric.tags || [],
                featured: fabric.featured || false,
                // Also keep original database fields for compatibility
                price_cfa: fabric.price_cfa || 0,
                price_ngn: fabric.price_ngn || 0,
                image_url: fabric.image_url || '',
                in_stock: fabric.in_stock ?? true,
            }));
        },
        staleTime: 1000 * 60 * 2, // 2 minutes - refresh more frequently for admin changes
    });
};
