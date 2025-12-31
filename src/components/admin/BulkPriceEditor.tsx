import { useState, useEffect, useMemo } from 'react';
import { Loader2, DollarSign, Package, RefreshCw } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logAdminAction } from '@/utils/auditLog';
import { getCfaToNgnRateSync, cfaToNgnSync, ngnToCfaSync } from '@/lib/exchangeRate';

interface BulkPriceEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fabrics: any[];
    onSuccess: () => void;
}

interface FabricGroup {
    name: string;
    count: number;
    currentPriceCfa: number;
    currentPriceNgn: number;
    ids: string[];
}

export function BulkPriceEditor({
    open,
    onOpenChange,
    fabrics,
    onSuccess,
}: BulkPriceEditorProps) {
    const [loading, setLoading] = useState(false);
    const [selectedName, setSelectedName] = useState<string>('');
    const [newPriceNgn, setNewPriceNgn] = useState<string>('');
    const [newPriceCfa, setNewPriceCfa] = useState<string>('');
    const [lastEdited, setLastEdited] = useState<'ngn' | 'cfa' | null>(null);
    const [autoConvert, setAutoConvert] = useState(true);

    // Group fabrics by name
    const fabricGroups = useMemo(() => {
        const groups: Record<string, FabricGroup> = {};

        fabrics.forEach(fabric => {
            const name = fabric.name || 'Unknown';
            if (!groups[name]) {
                groups[name] = {
                    name,
                    count: 0,
                    currentPriceCfa: fabric.price_cfa || fabric.priceCFA || 0,
                    currentPriceNgn: fabric.price_ngn || 0,
                    ids: [],
                };
            }
            groups[name].count++;
            groups[name].ids.push(fabric.id);
        });

        // Sort by name
        return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
    }, [fabrics]);

    // Get selected group
    const selectedGroup = useMemo(() => {
        return fabricGroups.find(g => g.name === selectedName);
    }, [fabricGroups, selectedName]);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!open) {
            setSelectedName('');
            setNewPriceNgn('');
            setNewPriceCfa('');
            setLastEdited(null);
            setAutoConvert(true);
        }
    }, [open]);

    // Populate current prices when a name is selected
    useEffect(() => {
        if (selectedGroup) {
            setNewPriceCfa(selectedGroup.currentPriceCfa.toString());
            setNewPriceNgn(selectedGroup.currentPriceNgn.toString());
        }
    }, [selectedGroup]);

    // Auto-convert prices (only if autoConvert is enabled)
    useEffect(() => {
        if (!autoConvert) return;

        if (lastEdited === 'ngn' && newPriceNgn) {
            const ngn = parseFloat(newPriceNgn);
            if (!isNaN(ngn) && ngn > 0) {
                setNewPriceCfa(ngnToCfaSync(ngn).toString());
            }
        } else if (lastEdited === 'cfa' && newPriceCfa) {
            const cfa = parseFloat(newPriceCfa);
            if (!isNaN(cfa) && cfa > 0) {
                setNewPriceNgn(cfaToNgnSync(cfa).toString());
            }
        }
    }, [newPriceNgn, newPriceCfa, lastEdited, autoConvert]);

    const handleNgnChange = (value: string) => {
        setNewPriceNgn(value);
        setLastEdited('ngn');
    };

    const handleCfaChange = (value: string) => {
        setNewPriceCfa(value);
        setLastEdited('cfa');
    };

    const handleSubmit = async () => {
        if (!selectedGroup) {
            toast.error('Please select a fabric name');
            return;
        }

        if (!newPriceNgn && !newPriceCfa) {
            toast.error('Please enter at least one price');
            return;
        }

        setLoading(true);

        try {
            const priceNgn = parseFloat(newPriceNgn) || 0;
            const priceCfa = parseFloat(newPriceCfa) || 0;

            // Update all fabrics with the selected name
            const { error } = await supabase
                .from('fabrics')
                .update({
                    price_ngn: priceNgn,
                    price_cfa: priceCfa,
                    updated_at: new Date().toISOString(),
                })
                .in('id', selectedGroup.ids);

            if (error) throw error;

            // Log audit action for bulk update
            await logAdminAction({
                action: 'BULK_UPDATE',
                tableName: 'fabrics',
                recordId: `bulk_${selectedGroup.ids.length}_items`,
                oldValues: {
                    fabric_name: selectedGroup.name,
                    count: selectedGroup.count,
                    old_price_ngn: selectedGroup.currentPriceNgn,
                    old_price_cfa: selectedGroup.currentPriceCfa,
                },
                newValues: {
                    fabric_name: selectedGroup.name,
                    count: selectedGroup.count,
                    new_price_ngn: priceNgn,
                    new_price_cfa: priceCfa,
                    affected_ids: selectedGroup.ids,
                },
            });

            toast.success(
                `Updated prices for ${selectedGroup.count} "${selectedGroup.name}" fabric(s)`,
                { duration: 4000 }
            );

            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            console.error('Bulk price update error:', err);
            toast.error(err.message || 'Failed to update prices');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Bulk Price Update
                    </DialogTitle>
                    <DialogDescription>
                        Update prices for all fabrics with the same name. Changes will reflect on the gallery immediately.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Fabric Name Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="fabric-name">Select Fabric Name</Label>
                        <Select value={selectedName} onValueChange={setSelectedName}>
                            <SelectTrigger id="fabric-name">
                                <SelectValue placeholder="Choose a fabric name..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {fabricGroups.map((group) => (
                                    <SelectItem key={group.name} value={group.name}>
                                        <div className="flex items-center justify-between w-full gap-4">
                                            <span>{group.name}</span>
                                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                                {group.count} item{group.count !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Selected Group Info */}
                    {selectedGroup && (
                        <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    This will update <strong className="text-foreground">{selectedGroup.count}</strong> fabric(s)
                                </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Current prices: ₦{selectedGroup.currentPriceNgn.toLocaleString()} / {selectedGroup.currentPriceCfa.toLocaleString()} CFA
                            </div>
                        </div>
                    )}

                    {/* Auto-Convert Toggle */}
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <Label htmlFor="auto-convert" className="text-sm font-medium cursor-pointer">
                                    Auto-convert prices
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Automatically calculate the other currency
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="auto-convert"
                            checked={autoConvert}
                            onCheckedChange={setAutoConvert}
                            disabled={!selectedName}
                        />
                    </div>

                    {/* Price Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price-ngn">Price (NGN)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                                <Input
                                    id="price-ngn"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={newPriceNgn}
                                    onChange={(e) => handleNgnChange(e.target.value)}
                                    placeholder="0"
                                    className="pl-7"
                                    disabled={!selectedName}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price-cfa">Price (CFA)</Label>
                            <div className="relative">
                                <Input
                                    id="price-cfa"
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={newPriceCfa}
                                    onChange={(e) => handleCfaChange(e.target.value)}
                                    placeholder="0"
                                    className="pr-12"
                                    disabled={!selectedName}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">CFA</span>
                            </div>
                        </div>
                    </div>

                    {autoConvert && (
                        <p className="text-xs text-muted-foreground">
                            💡 Tip: Enter either NGN or CFA price - the other will be auto-calculated using the current exchange rate.
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !selectedName}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            `Update ${selectedGroup?.count || 0} Fabric(s)`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
