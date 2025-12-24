import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from './ImageUpload';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FabricCategory {
    id: string;
    name: string;
    slug: string;
}

interface FabricFormData {
    name: string;
    brand: string;
    category_id: string;
    collection: string;
    description: string;
    price_ngn: string;
    price_cfa: string;
    yardage: string;
    stock_quantity: string;
    sku: string;
    tags: string;
    in_stock: boolean;
    featured: boolean;
    image_url: string;
    additional_images: string[];
}

interface FabricDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fabric?: any; // Existing fabric for edit mode
    onSuccess: () => void;
}

export const FabricDialog = ({
    open,
    onOpenChange,
    fabric,
    onSuccess,
}: FabricDialogProps) => {
    const isEdit = !!fabric;
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<FabricCategory[]>([]);
    const [formData, setFormData] = useState<FabricFormData>({
        name: '',
        brand: '',
        category_id: '',
        collection: '',
        description: '',
        price_ngn: '',
        price_cfa: '',
        yardage: '6',
        stock_quantity: '0',
        sku: '',
        tags: '',
        in_stock: true,
        featured: false,
        image_url: '',
        additional_images: [],
    });

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from('fabric_categories')
                .select('id, name, slug')
                .eq('is_active', true)
                .order('display_order');

            if (error) {
                console.error('Error fetching categories:', error);
                toast.error('Failed to load categories');
            } else {
                setCategories(data || []);
            }
        };

        if (open) {
            fetchCategories();
        }
    }, [open]);

    // Populate form when editing
    useEffect(() => {
        if (fabric && open) {
            setFormData({
                name: fabric.name || '',
                brand: fabric.brand || '',
                category_id: fabric.category_id || '',
                collection: fabric.collection || '',
                description: fabric.description || '',
                price_ngn: fabric.price_ngn?.toString() || '',
                price_cfa: fabric.price_cfa?.toString() || '',
                yardage: fabric.yardage?.toString() || '6',
                stock_quantity: fabric.stock_quantity?.toString() || '0',
                sku: fabric.sku || '',
                tags: Array.isArray(fabric.tags) ? fabric.tags.join(', ') : '',
                in_stock: fabric.in_stock ?? true,
                featured: fabric.featured ?? false,
                image_url: fabric.image_url || '',
                additional_images: [], // TODO: Fetch from fabric_images table
            });
        } else if (!open) {
            // Reset form when dialog closes
            setFormData({
                name: '',
                brand: '',
                category_id: '',
                collection: '',
                description: '',
                price_ngn: '',
                price_cfa: '',
                yardage: '6',
                stock_quantity: '0',
                sku: '',
                tags: '',
                in_stock: true,
                featured: false,
                image_url: '',
                additional_images: [],
            });
        }
    }, [fabric, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.name || !formData.brand || !formData.category_id) {
                toast.error('Please fill in all required fields');
                setLoading(false);
                return;
            }

            if (!formData.price_ngn || !formData.price_cfa) {
                toast.error('Please enter both NGN and CFA prices');
                setLoading(false);
                return;
            }

            if (!formData.image_url) {
                toast.error('Please upload at least one image');
                setLoading(false);
                return;
            }

            // Parse tags
            const tagsArray = formData.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);

            // Prepare data for database
            const fabricData = {
                name: formData.name,
                brand: formData.brand,
                category_id: formData.category_id,
                collection: formData.collection || null,
                description: formData.description || null,
                price_ngn: parseFloat(formData.price_ngn),
                price_cfa: parseFloat(formData.price_cfa),
                yardage: parseFloat(formData.yardage),
                stock_quantity: parseInt(formData.stock_quantity),
                sku: formData.sku || null,
                tags: tagsArray.length > 0 ? tagsArray : null,
                in_stock: formData.in_stock,
                featured: formData.featured,
                image_url: formData.image_url,
                updated_at: new Date().toISOString(),
            };

            if (isEdit) {
                // Update existing fabric
                const { error } = await supabase
                    .from('fabrics')
                    .update(fabricData)
                    .eq('id', fabric.id);

                if (error) throw error;

                toast.success('Fabric updated successfully');
            } else {
                // Generate SKU if not provided
                if (!fabricData.sku) {
                    const { data: skuData } = await supabase.rpc('generate_fabric_sku');
                    fabricData.sku = skuData;
                }

                // Insert new fabric
                const { error } = await supabase
                    .from('fabrics')
                    .insert({
                        ...fabricData,
                        created_at: new Date().toISOString(),
                    });

                if (error) throw error;

                toast.success('Fabric added successfully');
            }

            // TODO: Handle additional images (fabric_images table)

            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            console.error('Save error:', err);
            toast.error(err.message || 'Failed to save fabric');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof FabricFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Fabric' : 'Add New Fabric'}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Update fabric details and images'
                            : 'Fill in the details to add a new fabric to your catalog'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Fabric Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="e.g., Ankara Supreme"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="brand">
                                Brand <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="brand"
                                value={formData.brand}
                                onChange={(e) => handleChange('brand', e.target.value)}
                                placeholder="e.g., Vlisco"
                                required
                            />
                        </div>
                    </div>

                    {/* Category & Collection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">
                                Category <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(value) => handleChange('category_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="collection">Collection</Label>
                            <Input
                                id="collection"
                                value={formData.collection}
                                onChange={(e) => handleChange('collection', e.target.value)}
                                placeholder="e.g., Spring 2024"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Describe the fabric pattern, material, and uses..."
                            rows={3}
                        />
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price_ngn">
                                Price (NGN) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="price_ngn"
                                type="number"
                                step="0.01"
                                value={formData.price_ngn}
                                onChange={(e) => handleChange('price_ngn', e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price_cfa">
                                Price (CFA) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="price_cfa"
                                type="number"
                                step="0.01"
                                value={formData.price_cfa}
                                onChange={(e) => handleChange('price_cfa', e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="yardage">Yardage</Label>
                            <Input
                                id="yardage"
                                type="number"
                                step="0.1"
                                value={formData.yardage}
                                onChange={(e) => handleChange('yardage', e.target.value)}
                                placeholder="6"
                            />
                        </div>
                    </div>

                    {/* SKU & Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU (auto-generated if empty)</Label>
                            <Input
                                id="sku"
                                value={formData.sku}
                                onChange={(e) => handleChange('sku', e.target.value)}
                                placeholder="FAB-20241224-1234"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock_quantity">Stock Quantity</Label>
                            <Input
                                id="stock_quantity"
                                type="number"
                                value={formData.stock_quantity}
                                onChange={(e) => handleChange('stock_quantity', e.target.value)}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                            id="tags"
                            value={formData.tags}
                            onChange={(e) => handleChange('tags', e.target.value)}
                            placeholder="e.g., traditional, vibrant, wedding"
                        />
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-8">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="in_stock"
                                checked={formData.in_stock}
                                onCheckedChange={(checked) => handleChange('in_stock', checked)}
                            />
                            <Label htmlFor="in_stock" className="cursor-pointer">
                                In Stock
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="featured"
                                checked={formData.featured}
                                onCheckedChange={(checked) => handleChange('featured', checked)}
                            />
                            <Label htmlFor="featured" className="cursor-pointer">
                                Featured
                            </Label>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>
                            Primary Image <span className="text-destructive">*</span>
                        </Label>
                        <ImageUpload
                            value={formData.image_url}
                            onChange={(url) => handleChange('image_url', url as string)}
                            multiple={false}
                            folder="fabrics"
                        />
                    </div>

                    {/* Additional Images (TODO) */}
                    {/* <div className="space-y-2">
            <Label>Additional Images (up to 5)</Label>
            <ImageUpload
              value={formData.additional_images}
              onChange={(urls) => handleChange('additional_images', urls as string[])}
              multiple={true}
              maxFiles={5}
              folder="fabrics"
            />
          </div> */}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEdit ? 'Update Fabric' : 'Add Fabric'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
