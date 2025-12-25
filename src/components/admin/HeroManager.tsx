import { useState, useEffect } from 'react';
import { GripVertical, Edit2, Trash2, Plus, Save, X } from 'lucide-react';
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

interface HeroCollection {
    id: string;
    title: string;
    description: string | null;
    tag: string | null;
    fabric_ids: string[];
    display_order: number;
    is_active: boolean;
    created_at: string;
}

interface Fabric {
    id: string;
    name: string;
    image_url: string;
}

interface HeroFormData {
    title: string;
    description: string;
    tag: string;
    fabric_ids: string[];
}

export const HeroManager = () => {
    const [collections, setCollections] = useState<HeroCollection[]>([]);
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingCollection, setEditingCollection] = useState<HeroCollection | null>(null);
    const [formData, setFormData] = useState<HeroFormData>({
        title: '',
        description: '',
        tag: '',
        fabric_ids: [],
    });

    useEffect(() => {
        fetchCollections();
        fetchFabrics();
    }, []);

    const fetchCollections = async () => {
        try {
            const { data, error } = await supabase
                .from('hero_collections')
                .select('*')
                .order('display_order');

            if (error) throw error;
            setCollections(data || []);
        } catch (err) {
            console.error('Error fetching hero collections:', err);
            toast.error('Failed to load hero collections');
        } finally {
            setLoading(false);
        }
    };

    const fetchFabrics = async () => {
        try {
            const { data, error } = await supabase
                .from('fabrics')
                .select('id, name, image_url')
                .eq('in_stock', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFabrics(data || []);
        } catch (err) {
            console.error('Error fetching fabrics:', err);
        }
    };

    const handleOpenDialog = (collection?: HeroCollection) => {
        if (collection) {
            setEditingCollection(collection);
            setFormData({
                title: collection.title,
                description: collection.description || '',
                tag: collection.tag || '',
                fabric_ids: collection.fabric_ids || [],
            });
        } else {
            setEditingCollection(null);
            setFormData({
                title: '',
                description: '',
                tag: '',
                fabric_ids: [],
            });
        }
        setShowDialog(true);
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
        setEditingCollection(null);
        setFormData({ title: '', description: '', tag: '', fabric_ids: [] });
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            toast.error('Collection title is required');
            return;
        }

        if (formData.fabric_ids.length !== 5) {
            toast.error('Please select exactly 5 fabrics for the rollup display');
            return;
        }

        try {
            if (editingCollection) {
                // Update existing collection
                const { error } = await supabase
                    .from('hero_collections')
                    .update({
                        title: formData.title,
                        description: formData.description || null,
                        tag: formData.tag || null,
                        fabric_ids: formData.fabric_ids,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingCollection.id);

                if (error) throw error;
                toast.success('Collection updated successfully');
            } else {
                // Create new collection
                const maxOrder = Math.max(...collections.map((c) => c.display_order), 0);
                const { error } = await supabase
                    .from('hero_collections')
                    .insert({
                        title: formData.title,
                        description: formData.description || null,
                        tag: formData.tag || null,
                        fabric_ids: formData.fabric_ids,
                        display_order: maxOrder + 1,
                        is_active: true,
                    });

                if (error) throw error;
                toast.success('Collection added successfully');
            }

            fetchCollections();
            handleCloseDialog();
        } catch (err: any) {
            console.error('Save error:', err);
            toast.error(err.message || 'Failed to save collection');
        }
    };

    const handleToggleActive = async (collection: HeroCollection) => {
        try {
            const { error } = await supabase
                .from('hero_collections')
                .update({
                    is_active: !collection.is_active,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', collection.id);

            if (error) throw error;

            toast.success(
                `Collection ${!collection.is_active ? 'activated' : 'deactivated'}`
            );
            fetchCollections();
        } catch (err: any) {
            console.error('Toggle error:', err);
            toast.error(err.message || 'Failed to update collection');
        }
    };

    const handleDelete = async (collection: HeroCollection) => {
        if (!confirm(`Are you sure you want to delete "${collection.title}"?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('hero_collections')
                .delete()
                .eq('id', collection.id);

            if (error) throw error;

            toast.success('Collection deleted successfully');
            fetchCollections();
        } catch (err: any) {
            console.error('Delete error:', err);
            toast.error(err.message || 'Failed to delete collection');
        }
    };

    const handleReorder = async (collectionId: string, direction: 'up' | 'down') => {
        const currentIndex = collections.findIndex((c) => c.id === collectionId);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= collections.length) return;

        const newCollections = [...collections];
        const [movedCollection] = newCollections.splice(currentIndex, 1);
        newCollections.splice(newIndex, 0, movedCollection);

        try {
            const updates = newCollections.map((cat, index) => ({
                id: cat.id,
                display_order: index + 1,
            }));

            for (const update of updates) {
                await supabase
                    .from('hero_collections')
                    .update({ display_order: update.display_order })
                    .eq('id', update.id);
            }

            toast.success('Collection order updated');
            fetchCollections();
        } catch (err) {
            console.error('Reorder error:', err);
            toast.error('Failed to reorder collections');
        }
    };

    const toggleFabricSelection = (fabricId: string) => {
        setFormData((prev) => {
            const current = prev.fabric_ids || [];
            if (current.includes(fabricId)) {
                return { ...prev, fabric_ids: current.filter((id) => id !== fabricId) };
            } else if (current.length < 5) {
                return { ...prev, fabric_ids: [...current, fabricId] };
            } else {
                toast.error('Maximum 5 fabrics allowed');
                return prev;
            }
        });
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
                            <CardTitle>Hero Section Management</CardTitle>
                            <CardDescription>
                                Manage hero collections displayed on the homepage banner
                            </CardDescription>
                        </div>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Collection
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">Order</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Tag</TableHead>
                                <TableHead>Fabrics</TableHead>
                                <TableHead className="w-24">Status</TableHead>
                                <TableHead className="w-32">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {collections.map((collection, index) => (
                                <TableRow key={collection.id}>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleReorder(collection.id, 'up')}
                                                disabled={index === 0}
                                            >
                                                <GripVertical className="w-3 h-3" />
                                            </Button>
                                            <span className="text-xs text-center text-muted-foreground">
                                                {collection.display_order}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleReorder(collection.id, 'down')}
                                                disabled={index === collections.length - 1}
                                            >
                                                <GripVertical className="w-3 h-3 rotate-180" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{collection.title}</TableCell>
                                    <TableCell>
                                        {collection.tag && (
                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                {collection.tag}
                                            </code>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {collection.fabric_ids?.length || 0} / 5
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={collection.is_active}
                                            onCheckedChange={() => handleToggleActive(collection)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDialog(collection)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => handleDelete(collection)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {collections.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No hero collections yet. Add your first collection to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCollection ? 'Edit Hero Collection' : 'Add New Hero Collection'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCollection
                                ? 'Update collection details and select 5 fabrics for the rollup banner'
                                : 'Create a new hero collection with 5 fabric selections'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Title <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., The Fabric of Royalty"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tag">Tag</Label>
                                <Input
                                    id="tag"
                                    value={formData.tag}
                                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                    placeholder="e.g., New Collection"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Brief description of this collection..."
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Select Fabrics (5 required) - Selected: {formData.fabric_ids.length}/5
                            </Label>
                            <div className="grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto border rounded-lg p-2">
                                {fabrics.map((fabric) => {
                                    const isSelected = formData.fabric_ids.includes(fabric.id);
                                    const selectionIndex = formData.fabric_ids.indexOf(fabric.id);
                                    return (
                                        <button
                                            key={fabric.id}
                                            type="button"
                                            onClick={() => toggleFabricSelection(fabric.id)}
                                            className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${isSelected
                                                ? 'border-primary ring-2 ring-primary/20'
                                                : 'border-transparent hover:border-muted-foreground/20'
                                                }`}
                                        >
                                            <img
                                                src={fabric.image_url}
                                                alt={fabric.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {isSelected && (
                                                <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                                    {selectionIndex + 1}
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                <p className="text-white text-xs truncate">{fabric.name}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            {editingCollection ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
