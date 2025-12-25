import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { createOrder, OrderData } from '@/services/orderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice, calculatePrice } from '@/lib/currency';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Checkout = () => {
    const navigate = useNavigate();
    const { items, getCartTotal, clearCart, currency } = useCart();
    const { user, profile } = useAuth();
    const { rate } = useExchangeRate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<OrderData>({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        address: '',
        city: '',
        state: '',
        country: 'Nigeria',
        currency: 'NGN',
        delivery_method: 'shipping'
    });

    // Prefill user data if logged in
    useEffect(() => {
        if (user && profile) {
            setFormData(prev => ({
                ...prev,
                customer_name: profile.display_name || '',
                customer_email: user.email || '',
                customer_phone: profile.phone || ''
            }));
        }
    }, [user, profile]);

    // Redirect if cart is empty
    useEffect(() => {
        if (items.length === 0) {
            navigate('/gallery');
        }
    }, [items, navigate]);

    // Update form currency when context currency changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, currency }));
    }, [currency]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create Order in DB
            const order = await createOrder(formData, items, rate, user?.id);

            // 2. Clear Cart
            clearCart();

            // 3. Construct WhatsApp Message
            const total = getCartTotal(currency, rate);
            const whatsappNumber = '2348165715235';
            let message = `*Hi, I just placed Order #${ordersIdShort(order.id)} on Ikso AfriFabs!*\n\n`;
            message += `*Customer:* ${formData.customer_name}\n`;
            message += `*Phone:* ${formData.customer_phone}\n`;
            message += `*Total:* ${formatPrice(total, currency)}\n\n`;
            message += `*Items:*\n`;

            items.forEach((item, index) => {
                message += `${index + 1}. ${item.fabric.name} (${item.pieces} pcs)\n`;
            });

            if (formData.delivery_method === 'shipping') {
                message += `\n*Delivery Address:*\n${formData.address}, ${formData.city}, ${formData.state}`;
            } else {
                message += `\n*Delivery Method:* Local Pickup`;
            }

            message += `\n\nI'm ready to make payment.`;

            // 4. Redirect to WhatsApp
            const encodedMessage = encodeURIComponent(message);
            window.location.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        } catch (error: any) {
            console.error('Checkout error:', error);
            toast({
                title: "Error",
                description: "Failed to place order. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const ordersIdShort = (id: string) => id.split('-')[0].toUpperCase();

    const total = getCartTotal(currency, rate);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header currency={currency} toggleCurrency={() => { }} />

            <main className="flex-1 container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    className="mb-8 pl-0 hover:bg-transparent"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column: Form */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-display font-medium text-primary mb-2">Checkout</h1>
                            <p className="text-muted-foreground">Please enter your details to complete your order.</p>
                        </div>

                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
                            {/* Contact Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_name">Full Name</Label>
                                        <Input
                                            id="customer_name"
                                            name="customer_name"
                                            required
                                            value={formData.customer_name}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="customer_email">Email</Label>
                                            <Input
                                                id="customer_email"
                                                name="customer_email"
                                                type="email"
                                                required
                                                value={formData.customer_email}
                                                onChange={handleInputChange}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="customer_phone">Phone (WhatsApp)</Label>
                                            <Input
                                                id="customer_phone"
                                                name="customer_phone"
                                                type="tel"
                                                required
                                                value={formData.customer_phone}
                                                onChange={handleInputChange}
                                                placeholder="+234..."
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Delivery Method */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Delivery Method</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <RadioGroup
                                        defaultValue="shipping"
                                        onValueChange={(val: 'shipping' | 'pickup') =>
                                            setFormData(prev => ({ ...prev, delivery_method: val }))
                                        }
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <div>
                                            <RadioGroupItem value="shipping" id="shipping" className="peer sr-only" />
                                            <Label
                                                htmlFor="shipping"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                            >
                                                <span>Ship to Address</span>
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                                            <Label
                                                htmlFor="pickup"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                            >
                                                <span>Local Pickup</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>

                                    {formData.delivery_method === 'shipping' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-4 pt-2"
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="address">Street Address</Label>
                                                <Input
                                                    id="address"
                                                    name="address"
                                                    required
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    placeholder="123 Fabric Lane"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="city">City</Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        required
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        placeholder="Lagos"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="state">State</Label>
                                                    <Input
                                                        id="state"
                                                        name="state"
                                                        required
                                                        value={formData.state}
                                                        onChange={handleInputChange}
                                                        placeholder="Lagos State"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="country">Country</Label>
                                                <Input
                                                    id="country"
                                                    name="country"
                                                    disabled
                                                    value={formData.country}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>
                        </form>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:pl-8">
                        <div className="sticky top-24">
                            <Card className="bg-muted/30 border-none shadow-none">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                    <CardDescription>{items.length} Items in cart</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                        {items.map((item) => (
                                            <div key={item.fabricId} className="flex gap-4">
                                                <div className="w-16 h-16 rounded-md overflow-hidden bg-white shrink-0">
                                                    <img
                                                        src={item.fabric.image}
                                                        alt={item.fabric.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm">{item.fabric.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{item.pieces} piece(s)</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-sm">
                                                        {formatPrice(
                                                            calculatePrice(item.fabric.priceCFA, currency, rate) * item.pieces,
                                                            currency
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{formatPrice(total, currency)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span>Calculated later</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-lg">Total</span>
                                        <span className="font-bold text-xl text-primary">
                                            {formatPrice(total, currency)}
                                        </span>
                                    </div>

                                    <Button
                                        className="w-full"
                                        size="lg"
                                        type="submit"
                                        form="checkout-form"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Place Order via WhatsApp
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-xs text-center text-muted-foreground">
                                        By clicking the button, stock will be reserved and you'll be redirected to WhatsApp to complete payment.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Checkout;
