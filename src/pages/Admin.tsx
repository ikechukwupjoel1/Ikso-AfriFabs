import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Shield, Users, Package, Layers, Plus, Edit2, Trash2,
    Save, X, ChevronDown, Search, RefreshCw, UserPlus, FolderTree, Sparkles, Check, Copy, TrendingUp, Tag, FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Currency } from '@/types/fabric';
import { FabricDialog } from '@/components/admin/FabricDialog';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { HeroManager } from '@/components/admin/HeroManager';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { fabrics as localFabrics } from '@/data/fabrics';
import { generateInvoice } from '@/utils/invoiceGenerator';

// Super admin email
const SUPER_ADMIN_EMAIL = 'iksotech@gmail.com';

// Admin roles with descriptions
const ADMIN_ROLES = [
    { value: 'super_admin', label: 'Super Admin', description: 'Full access to all features' },
    { value: 'product_manager', label: 'Product Manager', description: 'Manage fabrics and inventory' },
    { value: 'order_manager', label: 'Order Manager', description: 'View and update orders' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

const Admin = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [currency, setCurrency] = useState<Currency>('NGN');
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminRole, setAdminRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Data states
    const [fabrics, setFabrics] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [admins, setAdmins] = useState<any[]>([]);
    const [discounts, setDiscounts] = useState<any[]>([]);

    // UI states
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminRole, setNewAdminRole] = useState('viewer');
    const [showFabricDialog, setShowFabricDialog] = useState(false);
    const [selectedFabric, setSelectedFabric] = useState<any>(null);
    const [selectedFabrics, setSelectedFabrics] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Discount dialog states
    const [showDiscountDialog, setShowDiscountDialog] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<any>(null);
    const [discountForm, setDiscountForm] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: 10,
        min_order_amount: 0,
        max_uses: null as number | null,
        valid_from: '',
        valid_until: '',
        is_active: true
    });

    // Create Order dialog states
    const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false);
    const [createOrderForm, setCreateOrderForm] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        address: '',
        city: '',
        state: '',
        country: 'Nigeria',
        currency: 'NGN' as 'NGN' | 'CFA',
        items: [{ fabric_name: '', quantity: 1, unit_price: 0 }],
        notes: '',
        status: 'confirmed' as string,
    });

    // Check admin access
    useEffect(() => {
        const checkAdminAccess = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Check if user is the super admin by email
                if (user.email === SUPER_ADMIN_EMAIL) {
                    setIsAdmin(true);
                    setAdminRole('super_admin');
                    setLoading(false);
                    return;
                }

                // Check admin_users table by email
                const { data, error } = await supabase
                    .from('admin_users')
                    .select('role')
                    .eq('email', user.email)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Admin check error:', error);
                }

                if (data) {
                    setIsAdmin(true);
                    setAdminRole(data.role);
                }
            } catch (err) {
                console.error('Admin access check failed:', err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            checkAdminAccess();
        }
    }, [user, authLoading]);

    // Redirect if not admin
    useEffect(() => {
        if (!loading && !authLoading) {
            if (!user) {
                navigate('/login', { state: { from: '/admin' } });
            } else if (!isAdmin) {
                toast.error('Access denied. Admin privileges required.');
                navigate('/');
            }
        }
    }, [loading, authLoading, user, isAdmin, navigate]);

    // Fetch data
    useEffect(() => {
        if (isAdmin) {
            fetchFabrics();
            fetchOrders();
            fetchDiscounts();
            if (adminRole === 'super_admin') {
                fetchAdmins();
            }
        }
    }, [isAdmin, adminRole]);

    // Realtime subscription for new orders
    useEffect(() => {
        if (!isAdmin) return;

        // Subscribe to orders table changes
        const ordersSubscription = supabase
            .channel('orders_changes')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    // Add new order to the list
                    setOrders(prev => [payload.new as any, ...prev]);
                    toast.success(`🔔 New order from ${(payload.new as any).customer_name || 'Customer'}!`, {
                        duration: 5000,
                    });
                }
            )
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                (payload) => {
                    // Update existing order
                    setOrders(prev => prev.map(order =>
                        order.id === (payload.new as any).id ? payload.new as any : order
                    ));
                }
            )
            .subscribe();

        // Cleanup on unmount
        return () => {
            supabase.removeChannel(ordersSubscription);
        };
    }, [isAdmin]);

    const fetchFabrics = async () => {
        try {
            // Try to fetch from Supabase first
            const { data, error } = await supabase
                .from('fabrics')
                .select('*')
                .order('created_at', { ascending: false });

            // If database has fabrics, use them; otherwise use local data
            if (data && data.length > 0) {
                setFabrics(data);
            } else {
                // Use local fabrics data
                setFabrics(localFabrics);
            }
        } catch (err) {
            console.error('Error fetching fabrics:', err);
            // Fallback to local data on error
            setFabrics(localFabrics);
        }
    };

    const fetchOrders = async () => {
        try {
            // Fetch orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            // Fetch order items
            const { data: orderItemsData } = await supabase
                .from('order_items')
                .select('*');

            // Merge order items into orders
            const ordersWithItems = (ordersData || []).map(order => ({
                ...order,
                order_items: (orderItemsData || []).filter(item => item.order_id === order.id)
            }));

            setOrders(ordersWithItems);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const fetchAdmins = async () => {
        try {
            const { data, error } = await supabase
                .from('admin_users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAdmins(data || []);
        } catch (err) {
            console.error('Error fetching admins:', err);
        }
    };

    const fetchDiscounts = async () => {
        try {
            const { data, error } = await supabase
                .from('discount_codes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDiscounts(data || []);
        } catch (err) {
            console.error('Error fetching discounts:', err);
        }
    };

    const handleSaveDiscount = async () => {
        try {
            const discountData = {
                code: discountForm.code.toUpperCase(),
                discount_type: discountForm.discount_type,
                discount_value: discountForm.discount_value,
                min_order_amount: discountForm.min_order_amount || 0,
                max_uses: discountForm.max_uses,
                valid_from: discountForm.valid_from || null,
                valid_until: discountForm.valid_until || null,
                is_active: discountForm.is_active
            };

            if (editingDiscount) {
                const { error } = await supabase
                    .from('discount_codes')
                    .update(discountData)
                    .eq('id', editingDiscount.id);
                if (error) throw error;
                toast.success('Discount code updated!');
            } else {
                const { error } = await supabase
                    .from('discount_codes')
                    .insert(discountData);
                if (error) throw error;
                toast.success('Discount code created!');
            }

            setShowDiscountDialog(false);
            setEditingDiscount(null);
            setDiscountForm({
                code: '',
                discount_type: 'percentage',
                discount_value: 10,
                min_order_amount: 0,
                max_uses: null,
                valid_from: '',
                valid_until: '',
                is_active: true
            });
            fetchDiscounts();
        } catch (err: any) {
            toast.error(err.message || 'Failed to save discount');
        }
    };

    const handleDeleteDiscount = async (id: string) => {
        if (!confirm('Delete this discount code?')) return;
        try {
            const { error } = await supabase
                .from('discount_codes')
                .delete()
                .eq('id', id);
            if (error) throw error;
            toast.success('Discount deleted');
            fetchDiscounts();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete');
        }
    };

    const openEditDiscount = (discount: any) => {
        setEditingDiscount(discount);
        setDiscountForm({
            code: discount.code,
            discount_type: discount.discount_type,
            discount_value: discount.discount_value,
            min_order_amount: discount.min_order_amount || 0,
            max_uses: discount.max_uses,
            valid_from: discount.valid_from || '',
            valid_until: discount.valid_until || '',
            is_active: discount.is_active
        });
        setShowDiscountDialog(true);
    };

    const handleAddAdmin = async () => {
        if (!newAdminEmail.trim()) {
            toast.error('Please enter an email address');
            return;
        }

        try {
            // Insert admin by email only (no user_id needed)
            const { error } = await supabase
                .from('admin_users')
                .insert({
                    email: newAdminEmail.toLowerCase(),
                    role: newAdminRole,
                    created_by: user?.id,
                });

            if (error) throw error;

            toast.success(`Admin ${newAdminEmail} added successfully!`);
            setShowAddAdminDialog(false);
            setNewAdminEmail('');
            setNewAdminRole('viewer');
            fetchAdmins();
        } catch (err: any) {
            console.error('Error adding admin:', err);
            toast.error(err.message || 'Failed to add admin');
        }
    };

    const handleUpdateAdminRole = async (adminId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('admin_users')
                .update({ role: newRole, updated_at: new Date().toISOString() })
                .eq('id', adminId);

            if (error) throw error;

            toast.success('Admin role updated');
            fetchAdmins();
        } catch (err: any) {
            console.error('Error updating admin:', err);
            toast.error(err.message || 'Failed to update admin');
        }
    };

    const handleRemoveAdmin = async (adminId: string, adminEmail: string) => {
        if (adminEmail === SUPER_ADMIN_EMAIL) {
            toast.error('Cannot remove super admin');
            return;
        }

        if (!confirm('Are you sure you want to remove this admin?')) return;

        try {
            const { error } = await supabase
                .from('admin_users')
                .delete()
                .eq('id', adminId);

            if (error) throw error;

            toast.success('Admin removed');
            fetchAdmins();
        } catch (err: any) {
            console.error('Error removing admin:', err);
            toast.error(err.message || 'Failed to remove admin');
        }
    };

    // Download receipt for admin
    const handleDownloadReceipt = (order: any) => {
        // Parse items from order_items or notes
        let items: any[] = [];

        if (order.order_items && order.order_items.length > 0) {
            items = order.order_items.map((item: any) => ({
                fabric_name: item.fabric_name || 'Fabric',
                fabric_image: item.fabric_image,
                quantity: item.quantity || 1,
                unit_price: item.unit_price || (order.total_amount / (item.quantity || 1)),
            }));
        }

        generateInvoice({
            orderId: order.id,
            orderDate: order.created_at,
            customerName: order.customer_name || 'Customer',
            customerEmail: order.customer_email || '',
            customerPhone: order.customer_phone,
            address: order.address,
            city: order.city,
            state: order.state,
            country: order.country,
            items: items,
            subtotal: order.total_amount || 0,
            discount: order.discount_amount,
            discountCode: order.discount_code,
            total: order.total_amount || 0,
            currency: order.currency || 'NGN',
            status: order.status || 'pending',
            notes: order.notes,
        });
    };

    const handleDeleteFabric = async (fabricId: string, fabricName: string) => {
        if (!confirm(`Are you sure you want to delete "${fabricName}" ? This action cannot be undone.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('fabrics')
                .delete()
                .eq('id', fabricId);

            if (error) throw error;

            toast.success('Fabric deleted successfully');
            fetchFabrics();
        } catch (err: any) {
            console.error('Error deleting fabric:', err);
            toast.error(err.message || 'Failed to delete fabric');
        }
    };

    // Create offline order
    const handleCreateOrder = async () => {
        if (!createOrderForm.customer_name.trim()) {
            toast.error('Please enter customer name');
            return;
        }
        if (createOrderForm.items.length === 0 || !createOrderForm.items[0].fabric_name) {
            toast.error('Please add at least one item');
            return;
        }

        try {
            // Calculate total
            const total = createOrderForm.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

            // Build notes from items
            const itemsText = createOrderForm.items.map(item =>
                `${item.fabric_name} x${item.quantity} pcs`
            ).join(', ');

            const { data, error } = await supabase
                .from('orders')
                .insert({
                    customer_name: createOrderForm.customer_name,
                    customer_email: createOrderForm.customer_email || null,
                    customer_phone: createOrderForm.customer_phone || null,
                    address: createOrderForm.address || null,
                    city: createOrderForm.city || null,
                    state: createOrderForm.state || null,
                    country: createOrderForm.country || 'Nigeria',
                    currency: createOrderForm.currency,
                    total_amount: total,
                    status: createOrderForm.status,
                    notes: `Items: ${itemsText}${createOrderForm.notes ? ` | Notes: ${createOrderForm.notes}` : ''}`,
                    user_id: user?.id || null,
                })
                .select()
                .single();

            if (error) throw error;

            // Add order items
            if (data && createOrderForm.items.length > 0) {
                const orderItems = createOrderForm.items.map(item => ({
                    order_id: data.id,
                    fabric_name: item.fabric_name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    yardage: item.quantity * 6, // Default 6 yards per piece
                }));

                await supabase.from('order_items').insert(orderItems);
            }

            toast.success('Order created successfully!');
            setShowCreateOrderDialog(false);
            setCreateOrderForm({
                customer_name: '',
                customer_email: '',
                customer_phone: '',
                address: '',
                city: '',
                state: '',
                country: 'Nigeria',
                currency: 'NGN',
                items: [{ fabric_name: '', quantity: 1, unit_price: 0 }],
                notes: '',
                status: 'confirmed',
            });
            fetchOrders();
        } catch (err: any) {
            console.error('Error creating order:', err);
            toast.error(err.message || 'Failed to create order');
        }
    };

    // Add item to order form
    const addOrderItem = () => {
        setCreateOrderForm(prev => ({
            ...prev,
            items: [...prev.items, { fabric_name: '', quantity: 1, unit_price: 0 }]
        }));
    };

    // Remove item from order form
    const removeOrderItem = (index: number) => {
        setCreateOrderForm(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    // Update order item
    const updateOrderItem = (index: number, field: string, value: any) => {
        setCreateOrderForm(prev => ({
            ...prev,
            items: prev.items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const toggleSelectAllFabrics = () => {
        const filtered = fabrics.filter(f => f.name?.toLowerCase().includes(searchTerm.toLowerCase()));
        if (selectedFabrics.size === filtered.length) {
            setSelectedFabrics(new Set());
        } else {
            setSelectedFabrics(new Set(filtered.map(f => f.id)));
        }
    };

    const toggleSelectFabric = (id: string) => {
        const newSelected = new Set(selectedFabrics);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedFabrics(newSelected);
    };

    const handleBulkDeleteFabrics = async () => {
        if (selectedFabrics.size === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedFabrics.size} fabrics? This action cannot be undone.`)) {
            return;
        }

        try {
            for (const id of selectedFabrics) {
                const { error } = await supabase
                    .from('fabrics')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
            }

            toast.success(`${selectedFabrics.size} fabrics deleted successfully`);
            setSelectedFabrics(new Set());
            fetchFabrics();
        } catch (err: any) {
            console.error('Bulk delete error:', err);
            toast.error(err.message || 'Failed to delete fabrics');
        }
    };

    const handleBulkUpdateStock = async (inStock: boolean) => {
        if (selectedFabrics.size === 0) return;

        try {
            for (const id of selectedFabrics) {
                const { error } = await supabase
                    .from('fabrics')
                    .update({ in_stock: inStock, updated_at: new Date().toISOString() })
                    .eq('id', id);

                if (error) throw error;
            }

            toast.success(`${selectedFabrics.size} fabrics marked as ${inStock ? 'in stock' : 'out of stock'}`);
            setSelectedFabrics(new Set());
            fetchFabrics();
        } catch (err: any) {
            console.error('Bulk stock update error:', err);
            toast.error(err.message || 'Failed to update stock status');
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', orderId);

            if (error) throw error;

            toast.success('Order status updated');
            fetchOrders();
        } catch (err: any) {
            console.error('Error updating order:', err);
            toast.error(err.message || 'Failed to update order');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const toggleCurrency = () => {
        setCurrency(prev => prev === 'NGN' ? 'CFA' : 'NGN');
    };

    // Filter fabrics based on search term
    const filteredFabrics = fabrics.filter(f =>
        f.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const canManageProducts = adminRole === 'super_admin' || adminRole === 'product_manager';
    const canManageOrders = adminRole === 'super_admin' || adminRole === 'order_manager';
    const canManageAdmins = adminRole === 'super_admin';

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-background">
            <Header currency={currency} onToggleCurrency={toggleCurrency} />

            <main className="pt-28 md:pt-32 pb-16">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl md:text-4xl font-display">Admin Dashboard</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Logged in as <span className="font-medium">{user?.email}</span> •
                            Role: <span className="font-medium capitalize">{adminRole?.replace('_', ' ')}</span>
                        </p>
                    </motion.div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{fabrics.length}</p>
                                        <p className="text-sm text-muted-foreground">Fabrics</p>
                                    </div>
                                    <Layers className="w-8 h-8 text-primary/20" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{orders.length}</p>
                                        <p className="text-sm text-muted-foreground">Orders</p>
                                    </div>
                                    <Package className="w-8 h-8 text-primary/20" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {orders.filter(o => o.status === 'pending').length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Pending</p>
                                    </div>
                                    <RefreshCw className="w-8 h-8 text-yellow-500/20" />
                                </div>
                            </CardContent>
                        </Card>
                        {canManageAdmins && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold">{admins.length}</p>
                                            <p className="text-sm text-muted-foreground">Admins</p>
                                        </div>
                                        <Users className="w-8 h-8 text-primary/20" />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="orders" className="space-y-6">
                        <TabsList>
                            {canManageOrders && (
                                <TabsTrigger value="orders" className="gap-2">
                                    <Package className="w-4 h-4" />
                                    Orders
                                </TabsTrigger>
                            )}
                            {canManageProducts && (
                                <TabsTrigger value="fabrics" className="gap-2">
                                    <Layers className="w-4 h-4" />
                                    Fabrics
                                </TabsTrigger>
                            )}
                            {canManageProducts && (
                                <TabsTrigger value="categories" className="gap-2">
                                    <FolderTree className="w-4 h-4" />
                                    Categories
                                </TabsTrigger>
                            )}
                            {canManageProducts && (
                                <TabsTrigger value="hero" className="gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Hero Sections
                                </TabsTrigger>
                            )}
                            {canManageProducts && (
                                <TabsTrigger value="discounts" className="gap-2">
                                    <Tag className="w-4 h-4" />
                                    Discounts
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="analytics" className="gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Analytics
                            </TabsTrigger>
                            {canManageAdmins && (
                                <TabsTrigger value="admins" className="gap-2">
                                    <Users className="w-4 h-4" />
                                    Admins
                                </TabsTrigger>
                            )}
                        </TabsList>

                        {/* Orders Tab */}
                        {canManageOrders && (
                            <TabsContent value="orders">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Order Management</CardTitle>
                                                <CardDescription>View and manage customer orders</CardDescription>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={fetchOrders}>
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    Refresh
                                                </Button>
                                                <Button size="sm" onClick={() => setShowCreateOrderDialog(true)}>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Create Order
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {orders.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Order ID</TableHead>
                                                        <TableHead>Customer</TableHead>
                                                        <TableHead>Items</TableHead>
                                                        <TableHead>Total</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                        <TableHead>Receipt</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {orders.map((order) => (
                                                        <TableRow key={order.id}>
                                                            <TableCell className="font-mono text-xs">
                                                                #{order.id.substring(0, 8).toUpperCase()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div>
                                                                    <p className="font-medium">{order.customer_name || 'N/A'}</p>
                                                                    <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="max-w-[250px]">
                                                                    {/* Show order_items with images if available */}
                                                                    {order.order_items?.length > 0 ? (
                                                                        <div className="flex flex-col gap-2">
                                                                            {order.order_items.map((item: any, idx: number) => (
                                                                                <div key={idx} className="flex items-center gap-2">
                                                                                    {item.fabric_image && (
                                                                                        <img
                                                                                            src={item.fabric_image}
                                                                                            alt={item.fabric_name}
                                                                                            className="w-10 h-10 rounded object-cover border"
                                                                                        />
                                                                                    )}
                                                                                    <div className="text-xs">
                                                                                        <p className="font-medium">{item.fabric_name || 'Unknown'}</p>
                                                                                        <p className="text-muted-foreground">
                                                                                            {item.quantity || 1} pcs ({item.yardage || (item.quantity || 1) * 6} yards)
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : order.notes ? (
                                                                        <span className="text-xs text-muted-foreground">{order.notes}</span>
                                                                    ) : (
                                                                        <span className="text-xs text-muted-foreground">No details</span>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {order.currency === 'NGN' ? '₦' : 'CFA'} {order.total_amount?.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className={`px - 2 py - 1 rounded - full text - xs font - medium ${getStatusColor(order.status)} `}>
                                                                    {order.status}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">
                                                                {new Date(order.created_at).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Select
                                                                    value={order.status}
                                                                    onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                                                                >
                                                                    <SelectTrigger className="w-[130px] h-8">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="pending">Pending</SelectItem>
                                                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                                                        <SelectItem value="shipped">Shipped</SelectItem>
                                                                        <SelectItem value="delivered">Delivered</SelectItem>
                                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell>
                                                                {(order.status === 'confirmed' || order.status === 'delivered') ? (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleDownloadReceipt(order)}
                                                                        className="gap-1"
                                                                    >
                                                                        <FileDown className="w-4 h-4" />
                                                                        Receipt
                                                                    </Button>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground">-</span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-center py-12 text-muted-foreground">
                                                <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                <p>No orders yet</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}

                        {/* Fabrics Tab */}
                        {canManageProducts && (
                            <TabsContent value="fabrics">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Fabric Management</CardTitle>
                                                <CardDescription>Manage your fabric inventory</CardDescription>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="relative">
                                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Search fabrics..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="pl-9 w-[200px]"
                                                    />
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedFabric(null);
                                                        setShowFabricDialog(true);
                                                    }}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add Fabric
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Bulk Actions Toolbar */}
                                        {selectedFabrics.size > 0 && (
                                            <div className="mb-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    {selectedFabrics.size} selected
                                                </span>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleBulkUpdateStock(true)}
                                                    >
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Mark In Stock
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleBulkUpdateStock(false)}
                                                    >
                                                        <X className="w-4 h-4 mr-2" />
                                                        Mark Out of Stock
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={handleBulkDeleteFabrics}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        <div className="mb-4 flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredFabrics.length)} of {filteredFabrics.length} fabrics
                                            </p>
                                        </div>
                                        {fabrics.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-12">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedFabrics.size === filteredFabrics.length && filteredFabrics.length > 0}
                                                                onChange={toggleSelectAllFabrics}
                                                                className="cursor-pointer"
                                                            />
                                                        </TableHead>
                                                        <TableHead>Image</TableHead>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Collection</TableHead>
                                                        <TableHead>Price (CFA)</TableHead>
                                                        <TableHead>Stock</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {fabrics
                                                        .filter(f => f.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                                                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                                        .map((fabric) => (
                                                            <TableRow key={fabric.id}>
                                                                <TableCell>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedFabrics.has(fabric.id)}
                                                                        onChange={() => toggleSelectFabric(fabric.id)}
                                                                        className="cursor-pointer"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <img
                                                                        src={fabric.image_url}
                                                                        alt={fabric.name}
                                                                        className="w-12 h-12 object-cover rounded"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="font-medium">{fabric.name}</TableCell>
                                                                <TableCell>{fabric.collection}</TableCell>
                                                                <TableCell>CFA {fabric.price?.toLocaleString()}</TableCell>
                                                                <TableCell>
                                                                    <span className={`px - 2 py - 1 rounded - full text - xs ${fabric.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                        } `}>
                                                                        {fabric.in_stock ? 'In Stock' : 'Out of Stock'}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            title="Duplicate fabric"
                                                                            onClick={() => {
                                                                                // Create duplicate with modified name
                                                                                const duplicateFabric = {
                                                                                    ...fabric,
                                                                                    id: undefined,
                                                                                    name: `${fabric.name} (Copy)`,
                                                                                    sku: '',
                                                                                };
                                                                                setSelectedFabric(duplicateFabric);
                                                                                setShowFabricDialog(true);
                                                                            }}
                                                                        >
                                                                            <Copy className="w-4 h-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => {
                                                                                setSelectedFabric(fabric);
                                                                                setShowFabricDialog(true);
                                                                            }}
                                                                        >
                                                                            <Edit2 className="w-4 h-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="text-destructive"
                                                                            onClick={() => handleDeleteFabric(fabric.id, fabric.name)}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-center py-12 text-muted-foreground">
                                                <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                <p>No fabrics found.</p>
                                            </div>
                                        )}

                                        {/* Pagination Controls */}
                                        {filteredFabrics.length > itemsPerPage && (
                                            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </Button>
                                                <span className="text-sm text-muted-foreground">
                                                    Page {currentPage} of {Math.ceil(filteredFabrics.length / itemsPerPage)}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredFabrics.length / itemsPerPage), prev + 1))}
                                                    disabled={currentPage >= Math.ceil(filteredFabrics.length / itemsPerPage)}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}

                        {/* Categories Tab */}
                        {canManageProducts && (
                            <TabsContent value="categories">
                                <CategoryManager />
                            </TabsContent>
                        )}

                        {/* Hero Sections Tab */}
                        {canManageProducts && (
                            <TabsContent value="hero">
                                <HeroManager />
                            </TabsContent>
                        )}

                        {/* Discounts Tab */}
                        {canManageProducts && (
                            <TabsContent value="discounts">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Discount Codes</CardTitle>
                                                <CardDescription>Create and manage discount codes for customers</CardDescription>
                                            </div>
                                            <Button size="sm" onClick={() => {
                                                setEditingDiscount(null);
                                                setDiscountForm({
                                                    code: '',
                                                    discount_type: 'percentage',
                                                    discount_value: 10,
                                                    min_order_amount: 0,
                                                    max_uses: null,
                                                    valid_from: '',
                                                    valid_until: '',
                                                    is_active: true
                                                });
                                                setShowDiscountDialog(true);
                                            }}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Discount
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {discounts.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Code</TableHead>
                                                        <TableHead>Type</TableHead>
                                                        <TableHead>Value</TableHead>
                                                        <TableHead>Min Order</TableHead>
                                                        <TableHead>Uses</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {discounts.map((discount) => (
                                                        <TableRow key={discount.id}>
                                                            <TableCell className="font-mono font-bold">{discount.code}</TableCell>
                                                            <TableCell className="capitalize">{discount.discount_type}</TableCell>
                                                            <TableCell>
                                                                {discount.discount_type === 'percentage'
                                                                    ? `${discount.discount_value}%`
                                                                    : `₦${discount.discount_value.toLocaleString()}`}
                                                            </TableCell>
                                                            <TableCell>₦{(discount.min_order_amount || 0).toLocaleString()}</TableCell>
                                                            <TableCell>
                                                                {discount.times_used || 0} / {discount.max_uses || '∞'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className={`px-2 py-1 rounded-full text-xs ${discount.is_active
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {discount.is_active ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-2">
                                                                    <Button size="sm" variant="ghost" onClick={() => openEditDiscount(discount)}>
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteDiscount(discount.id)}>
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-center py-12 text-muted-foreground">
                                                <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                <p>No discount codes yet</p>
                                                <p className="text-sm">Create your first discount code above</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Discount Dialog */}
                                <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{editingDiscount ? 'Edit Discount Code' : 'Create Discount Code'}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Code</Label>
                                                <Input
                                                    value={discountForm.code}
                                                    onChange={(e) => setDiscountForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                                    placeholder="WELCOME10"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Type</Label>
                                                    <Select value={discountForm.discount_type} onValueChange={(v) => setDiscountForm(prev => ({ ...prev, discount_type: v }))}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Value</Label>
                                                    <Input
                                                        type="number"
                                                        value={discountForm.discount_value}
                                                        onChange={(e) => setDiscountForm(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Min Order Amount (₦)</Label>
                                                    <Input
                                                        type="number"
                                                        value={discountForm.min_order_amount}
                                                        onChange={(e) => setDiscountForm(prev => ({ ...prev, min_order_amount: Number(e.target.value) }))}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Max Uses (empty = unlimited)</Label>
                                                    <Input
                                                        type="number"
                                                        value={discountForm.max_uses || ''}
                                                        onChange={(e) => setDiscountForm(prev => ({ ...prev, max_uses: e.target.value ? Number(e.target.value) : null }))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={discountForm.is_active}
                                                    onChange={(e) => setDiscountForm(prev => ({ ...prev, is_active: e.target.checked }))}
                                                    className="w-4 h-4"
                                                />
                                                <Label>Active</Label>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setShowDiscountDialog(false)}>Cancel</Button>
                                            <Button onClick={handleSaveDiscount}>
                                                <Save className="w-4 h-4 mr-2" />
                                                {editingDiscount ? 'Update' : 'Create'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </TabsContent>
                        )}

                        {/* Admins Tab */}
                        {canManageAdmins && (
                            <TabsContent value="admins">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Admin Management</CardTitle>
                                                <CardDescription>Manage admin users and their roles</CardDescription>
                                            </div>
                                            <Button size="sm" onClick={() => setShowAddAdminDialog(true)}>
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Add Admin
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead>Added</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {/* Super Admin (hardcoded) */}
                                                <TableRow>
                                                    <TableCell className="font-medium">
                                                        {SUPER_ADMIN_EMAIL}
                                                        <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full">
                                                            Owner
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                                                            Super Admin
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">—</TableCell>
                                                    <TableCell className="text-muted-foreground">—</TableCell>
                                                </TableRow>
                                                {admins.map((admin) => (
                                                    <TableRow key={admin.id}>
                                                        <TableCell className="font-medium">{admin.email}</TableCell>
                                                        <TableCell>
                                                            <Select
                                                                value={admin.role}
                                                                onValueChange={(value) => handleUpdateAdminRole(admin.id, value)}
                                                            >
                                                                <SelectTrigger className="w-[160px] h-8">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {ADMIN_ROLES.map((role) => (
                                                                        <SelectItem key={role.value} value={role.value}>
                                                                            {role.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {new Date(admin.created_at).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive"
                                                                onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}

                        {/* Analytics Tab */}
                        <TabsContent value="analytics">
                            <AnalyticsDashboard />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            {/* Add Admin Dialog */}
            <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Admin</DialogTitle>
                        <DialogDescription>
                            Enter the email address of the user you want to add as an admin.
                            They must have an existing account.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="admin-email">Email Address</Label>
                            <Input
                                id="admin-email"
                                type="email"
                                placeholder="admin@example.com"
                                value={newAdminEmail}
                                onChange={(e) => setNewAdminEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admin-role">Role</Label>
                            <Select value={newAdminRole} onValueChange={setNewAdminRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ADMIN_ROLES.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            <div>
                                                <p className="font-medium">{role.label}</p>
                                                <p className="text-xs text-muted-foreground">{role.description}</p>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddAdminDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddAdmin}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Admin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Fabric Dialog */}
            <FabricDialog
                open={showFabricDialog}
                onOpenChange={setShowFabricDialog}
                fabric={selectedFabric}
                onSuccess={fetchFabrics}
            />

            {/* Create Order Dialog */}
            <Dialog open={showCreateOrderDialog} onOpenChange={setShowCreateOrderDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Offline Order</DialogTitle>
                        <DialogDescription>
                            Create a new order for offline/manual transactions
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="customer_name">Customer Name *</Label>
                                <Input
                                    id="customer_name"
                                    value={createOrderForm.customer_name}
                                    onChange={(e) => setCreateOrderForm(prev => ({ ...prev, customer_name: e.target.value }))}
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customer_phone">Phone</Label>
                                <Input
                                    id="customer_phone"
                                    value={createOrderForm.customer_phone}
                                    onChange={(e) => setCreateOrderForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                                    placeholder="+234..."
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="customer_email">Email</Label>
                                <Input
                                    id="customer_email"
                                    type="email"
                                    value={createOrderForm.customer_email}
                                    onChange={(e) => setCreateOrderForm(prev => ({ ...prev, customer_email: e.target.value }))}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="order_currency">Currency</Label>
                                <Select
                                    value={createOrderForm.currency}
                                    onValueChange={(value: 'NGN' | 'CFA') => setCreateOrderForm(prev => ({ ...prev, currency: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NGN">NGN (₦)</SelectItem>
                                        <SelectItem value="CFA">CFA</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={createOrderForm.address}
                                onChange={(e) => setCreateOrderForm(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Street address"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={createOrderForm.city}
                                    onChange={(e) => setCreateOrderForm(prev => ({ ...prev, city: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    value={createOrderForm.state}
                                    onChange={(e) => setCreateOrderForm(prev => ({ ...prev, state: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    value={createOrderForm.country}
                                    onChange={(e) => setCreateOrderForm(prev => ({ ...prev, country: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Order Items *</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Item
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {createOrderForm.items.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-end p-3 border rounded-lg bg-muted/30">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs">Fabric Name</Label>
                                            <Input
                                                value={item.fabric_name}
                                                onChange={(e) => updateOrderItem(index, 'fabric_name', e.target.value)}
                                                placeholder="e.g. Super VIP Collection"
                                            />
                                        </div>
                                        <div className="w-20 space-y-1">
                                            <Label className="text-xs">Qty (pcs)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                        <div className="w-28 space-y-1">
                                            <Label className="text-xs">Unit Price</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={item.unit_price}
                                                onChange={(e) => updateOrderItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                placeholder="0"
                                            />
                                        </div>
                                        {createOrderForm.items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => removeOrderItem(index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="text-right font-semibold">
                                Total: {createOrderForm.currency === 'NGN' ? '₦' : 'CFA '}
                                {createOrderForm.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toLocaleString()}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="order_status">Order Status</Label>
                            <Select
                                value={createOrderForm.status}
                                onValueChange={(value) => setCreateOrderForm(prev => ({ ...prev, status: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed (Payment Received)</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes</Label>
                            <Input
                                id="notes"
                                value={createOrderForm.notes}
                                onChange={(e) => setCreateOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Any additional notes..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateOrderDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateOrder}>
                            <Save className="w-4 h-4 mr-2" />
                            Create Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
};

export default Admin;
