import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Heart, Package, Settings, LogOut, ChevronRight, Edit2, Save, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useFabrics } from '@/hooks/useFabrics';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FabricCard from '@/components/fabric/FabricCard';
import { Currency } from '@/types/fabric';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { generateInvoice } from '@/utils/invoiceGenerator';

const Account = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, signOut } = useAuth();
    const { favorites } = useFavorites();
    const { data: fabrics = [] } = useFabrics();

    const [currency, setCurrency] = useState<Currency>('NGN');
    const [isEditing, setIsEditing] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profile, setProfile] = useState({
        full_name: '',
        phone: '',
        preferred_currency: 'NGN',
    });
    const [orders, setOrders] = useState<any[]>([]);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login', { state: { from: '/account' } });
        }
    }, [user, authLoading, navigate]);

    // Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching profile:', error);
                }

                if (data) {
                    setProfile({
                        full_name: data.full_name || user.user_metadata?.full_name || '',
                        phone: data.phone || '',
                        preferred_currency: data.preferred_currency || 'NGN',
                    });
                } else {
                    // Use auth metadata as fallback
                    setProfile({
                        full_name: user.user_metadata?.full_name || '',
                        phone: '',
                        preferred_currency: 'NGN',
                    });
                }
            } catch (err) {
                console.error('Profile fetch error:', err);
            } finally {
                setProfileLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    // Fetch orders
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching orders:', error);
                } else {
                    setOrders(data || []);
                }
            } catch (err) {
                console.error('Orders fetch error:', err);
            }
        };

        fetchOrders();
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    user_id: user.id,
                    full_name: profile.full_name,
                    phone: profile.phone,
                    preferred_currency: profile.preferred_currency,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'user_id',
                });

            if (error) throw error;

            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            console.error('Save profile error:', err);
            toast.error('Failed to save profile');
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const favoriteFabrics = fabrics.filter(f => favorites.includes(f.id));

    const toggleCurrency = () => {
        setCurrency(prev => prev === 'NGN' ? 'CFA' : 'NGN');
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

    const handleDownloadInvoice = (order: any) => {
        // Parse items from the order
        const items = Array.isArray(order.items) ? order.items : [];

        generateInvoice({
            orderId: order.id,
            orderDate: order.created_at,
            customerName: order.customer_name || profile.full_name || user?.email?.split('@')[0] || 'Customer',
            customerEmail: order.customer_email || user?.email || '',
            customerPhone: order.customer_phone || profile.phone,
            address: order.address,
            city: order.city,
            state: order.state,
            country: order.country,
            items: items.map((item: any) => ({
                fabric_name: item.fabric_name || 'Fabric',
                fabric_image: item.fabric_image,
                quantity: item.quantity || 1,
                unit_price: item.unit_price || item.price || 0,
            })),
            subtotal: order.total_amount || 0,
            discount: order.discount_amount,
            discountCode: order.discount_code,
            total: order.total_amount || 0,
            currency: order.currency || 'NGN',
            status: order.status || 'pending',
            notes: order.notes,
        });
    };

    if (authLoading || profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) return null;

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
                        <h1 className="text-3xl md:text-4xl font-display mb-2">My Account</h1>
                        <p className="text-muted-foreground">
                            Welcome back, {profile.full_name || user.email?.split('@')[0]}
                        </p>
                    </motion.div>

                    {/* Tabs */}
                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
                            <TabsTrigger value="profile" className="gap-2">
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">Profile</span>
                            </TabsTrigger>
                            <TabsTrigger value="favorites" className="gap-2">
                                <Heart className="w-4 h-4" />
                                <span className="hidden sm:inline">Favorites</span>
                                {favorites.length > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full">
                                        {favorites.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="orders" className="gap-2">
                                <Package className="w-4 h-4" />
                                <span className="hidden sm:inline">Orders</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile">
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Personal Information</CardTitle>
                                                <CardDescription>Update your profile details</CardDescription>
                                            </div>
                                            <Button
                                                variant={isEditing ? "default" : "outline"}
                                                size="sm"
                                                onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                                            >
                                                {isEditing ? (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save
                                                    </>
                                                ) : (
                                                    <>
                                                        <Edit2 className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" value={user.email || ''} disabled className="bg-muted" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="full_name">Full Name</Label>
                                            <Input
                                                id="full_name"
                                                value={profile.full_name}
                                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="+234 XXX XXX XXXX"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account Actions</CardTitle>
                                        <CardDescription>Manage your account settings</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button variant="outline" className="w-full justify-between" asChild>
                                            <Link to="/gallery?filter=favorites">
                                                <span className="flex items-center gap-2">
                                                    <Heart className="w-4 h-4" />
                                                    View Favorites
                                                </span>
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="w-full justify-between" asChild>
                                            <Link to="/gallery">
                                                <span className="flex items-center gap-2">
                                                    <Settings className="w-4 h-4" />
                                                    Browse Gallery
                                                </span>
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="w-full justify-between"
                                            onClick={handleSignOut}
                                        >
                                            <span className="flex items-center gap-2">
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </span>
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Favorites Tab */}
                        <TabsContent value="favorites">
                            <Card>
                                <CardHeader>
                                    <CardTitle>My Favorites</CardTitle>
                                    <CardDescription>
                                        {favorites.length > 0
                                            ? `You have ${favorites.length} fabric${favorites.length > 1 ? 's' : ''} saved`
                                            : 'No favorites yet. Start exploring our collection!'
                                        }
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {favorites.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {favoriteFabrics.map((fabric) => (
                                                <FabricCard
                                                    key={fabric.id}
                                                    fabric={fabric}
                                                    currency={currency}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Heart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                                            <p className="text-muted-foreground mb-4">No favorites yet</p>
                                            <Button asChild>
                                                <Link to="/gallery">Browse Fabrics</Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Orders Tab */}
                        <TabsContent value="orders">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order History</CardTitle>
                                    <CardDescription>
                                        {orders.length > 0
                                            ? `You have ${orders.length} order${orders.length > 1 ? 's' : ''}`
                                            : 'No orders yet'
                                        }
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {orders.length > 0 ? (
                                        <div className="space-y-4">
                                            {orders.map((order) => (
                                                <div
                                                    key={order.id}
                                                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium">
                                                            Order #{order.id.substring(0, 8).toUpperCase()}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mb-2">
                                                        {new Date(order.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">
                                                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                                                        </span>
                                                        <span className="font-semibold">
                                                            {order.currency === 'NGN' ? '₦' : 'CFA'} {order.total_amount?.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full mt-3"
                                                        onClick={() => handleDownloadInvoice(order)}
                                                    >
                                                        <FileDown className="w-4 h-4 mr-2" />
                                                        Download Invoice
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                                            <p className="text-muted-foreground mb-4">No orders yet</p>
                                            <Button asChild>
                                                <Link to="/gallery">Start Shopping</Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Account;
