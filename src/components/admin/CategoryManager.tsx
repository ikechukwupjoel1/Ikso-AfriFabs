import { useState, useEffect } from 'react';
import { GripVertical, Edit2, Trash2, Plus, Save, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
}

interface CategoryFormData {
    name: string;
    slug: string;
    description: string;
}

export const CategoryManager = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        slug: '',
        description: '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('fabric_categories')
                .select('*')
                .order('display_order');

            if (error) throw error;
            setCategories(data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                slug: category.slug,
                description: category.description || '',
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                slug: '',
                description: '',
            });
        }
        setShowDialog(true);
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
        setEditingCategory(null);
        setFormData({ name: '', slug: '', description: '' });
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleNameChange = (name: string) => {
        setFormData({
            ...formData,
            name,
            slug: generateSlug(name),
        });
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        try {
            if (editingCategory) {
                // Update existing category
                const { error } = await supabase
                    .from('fabric_categories')
                    .update({
                        name: formData.name,
                        slug: formData.slug,
                        description: formData.description || null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingCategory.id);

                if (error) throw error;
                toast.success('Category updated successfully');
            } else {
                // Create new category
                const maxOrder = Math.max(...categories.map((c) => c.display_order), 0);
                const { error } = await supabase
                    .from('fabric_categories')
                    .insert({
                        name: formData.name,
                        slug: formData.slug,
                        description: formData.description || null,
                        display_order: maxOrder + 1,
                        is_active: true,
                    });

                if (error) throw error;
                toast.success('Category added successfully');
            }

            fetchCategories();
            handleCloseDialog();
        } catch (err: any) {
            console.error('Save error:', err);
            toast.error(err.message || 'Failed to save category');
        }
    };

    const handleToggleActive = async (category: Category) => {
        try {
            const { error } = await supabase
                .from('fabric_categories')
                .update({
                    is_active: !category.is_active,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', category.id);

            if (error) throw error;

            toast.success(
                `Category ${!category.is_active ? 'activated' : 'deactivated'}`
            );
            fetchCategories();
        } catch (err: any) {
            console.error('Toggle error:', err);
            toast.error(err.message || 'Failed to update category');
        }
    };

    const handleDelete = async (category: Category) => {
        // Check if category has fabrics
        const { count } = await supabase
            .from('fabrics')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', category.id);

        if (count && count > 0) {
            toast.error(
                `Cannot delete category with ${count} fabric${count > 1 ? 's' : ''}. Please reassign or delete the fabrics first.`
            );
            return;
        }

        if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('fabric_categories')
                .delete()
                .eq('id', category.id);

            if (error) throw error;

            toast.success('Category deleted successfully');
            fetchCategories();
        } catch (err: any) {
            console.error('Delete error:', err);
            toast.error(err.message || 'Failed to delete category');
        }
    };

    const toggleSelectAll = () => {
        if (selectedCategories.size === categories.length) {
            setSelectedCategories(new Set());
        } else {
            setSelectedCategories(new Set(categories.map(c => c.id)));
        }
    };

    const toggleSelectCategory = (id: string) => {
        const newSelected = new Set(selectedCategories);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedCategories(newSelected);
    };

    const handleBulkDelete = async () => {
        if (selectedCategories.size === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedCategories.size} categories? This action cannot be undone.`)) {
            return;
        }

        try {
            for (const id of selectedCategories) {
                const { error } = await supabase
                    .from('fabric_categories')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
            }

            toast.success(`${selectedCategories.size} categories deleted successfully`);
            setSelectedCategories(new Set());
            fetchCategories();
        } catch (err: any) {
            console.error('Bulk delete error:', err);
            toast.error(err.message || 'Failed to delete categories');
        }
    };

    const handleBulkToggleActive = async (active: boolean) => {
        if (selectedCategories.size === 0) return;

        try {
            for (const id of selectedCategories) {
                const { error } = await supabase
                    .from('fabric_categories')
                    .update({ is_active: active, updated_at: new Date().toISOString() })
                    .eq('id', id);

                if (error) throw error;
            }

            toast.success(`${selectedCategories.size} categories ${active ? 'activated' : 'deactivated'}`);
            setSelectedCategories(new Set());
            fetchCategories();
        } catch (err: any) {
            console.error('Bulk toggle error:', err);
            toast.error(err.message || 'Failed to update categories');
        }
    };

    const handleReorder = async (categoryId: string, direction: 'up' | 'down') => {
        const currentIndex = categories.findIndex((c) => c.id === categoryId);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= categories.length) return;

        const newCategories = [...categories];
        const [movedCategory] = newCategories.splice(currentIndex, 1);
        newCategories.splice(newIndex, 0, movedCategory);

        // Update display_order for all affected categories
        try {
            const updates = newCategories.map((cat, index) => ({
                id: cat.id,
                display_order: index + 1,
            }));

            for (const update of updates) {
                await supabase
                    .from('fabric_categories')
                    .update({ display_order: update.display_order })
                    .eq('id', update.id);
            }

            toast.success('Category order updated');
            fetchCategories();
        } catch (err) {
            console.error('Reorder error:', err);
            toast.error('Failed to reorder categories');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Category Management</CardTitle>
                            <CardDescription>
                                Manage fabric categories, reorder, and toggle visibility
                            </CardDescription>
                        </div>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Bulk Actions Toolbar */}
                    {selectedCategories.size > 0 && (
                        <div className="mb-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                            <span className="text-sm font-medium">
                                {selectedCategories.size} selected
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBulkToggleActive(true)}
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Activate
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBulkToggleActive(false)}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Deactivate
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleBulkDelete}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.size === categories.length && categories.length > 0}
                                        onChange={toggleSelectAll}
                                        className="cursor-pointer"
                                    />
                                </TableHead>
                                <TableHead className="w-12">Order</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-24">Status</TableHead>
                                <TableHead className="w-32">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category, index) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.has(category.id)}
                                            onChange={() => toggleSelectCategory(category.id)}
                                            className="cursor-pointer"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleReorder(category.id, 'up')}
                                                disabled={index === 0}
                                            >
                                                <GripVertical className="w-3 h-3" />
                                            </Button>
                                            <span className="text-xs text-center text-muted-foreground">
                                                {category.display_order}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleReorder(category.id, 'down')}
                                                disabled={index === categories.length - 1}
                                            >
                                                <GripVertical className="w-3 h-3 rotate-180" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>
                                        <code className="text-xs bg-muted px-2 py-1 rounded">
                                            {category.slug}
                                        </code>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {category.description || '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={category.is_active}
                                            onCheckedChange={() => handleToggleActive(category)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDialog(category)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => handleDelete(category)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {categories.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No categories yet. Add your first category to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory
                                ? 'Update category details'
                                : 'Create a new fabric category'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Category Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="e.g., Ankara"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">
                                Slug <span className="text-xs text-muted-foreground">(auto-generated)</span>
                            </Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="e.g., ankara"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Brief description of this category..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            {editingCategory ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
