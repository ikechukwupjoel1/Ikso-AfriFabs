import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Heart, Check, Minus, Plus, MessageCircle } from 'lucide-react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/hooks/useCurrency';
import { useFabrics } from '@/hooks/useFabrics';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { cn } from '@/lib/utils';
import { calculatePrice, formatPrice } from '@/lib/currency';

const FabricDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { currency, toggleCurrency } = useCurrency();
    const { data: fabrics = [], isLoading } = useFabrics();
    const { addToCart, isInCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();

    const [pieces, setPieces] = useState(1); // 1 piece = 6 yards
    const [justAdded, setJustAdded] = useState(false);

    const fabric = fabrics.find(f => f.id === id);
    const isLiked = fabric ? isFavorite(fabric.id) : false;
    const inCart = fabric ? isInCart(fabric.id) : false;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header currency={currency} onToggleCurrency={toggleCurrency} />
                <div className="min-h-screen pt-24 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading fabric details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!fabric) {
        return (
            <div className="min-h-screen bg-background">
                <Header currency={currency} onToggleCurrency={toggleCurrency} />
                <div className="min-h-screen pt-24 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="font-display text-3xl mb-4">Fabric Not Found</h1>
                        <p className="text-muted-foreground mb-6">The fabric you're looking for doesn't exist.</p>
                        <Button asChild>
                            <Link to="/gallery">Browse Fabrics</Link>
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const { rate } = useExchangeRate();

    const price = calculatePrice(fabric.priceCFA, currency, rate);
    const totalPrice = price * pieces; // Price per piece × number of pieces

    const handleAddToCart = () => {
        addToCart(fabric, pieces);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
    };

    const handleWhatsAppOrder = () => {
        const whatsappNumber = '2348165715235';
        const message = encodeURIComponent(
            `Hello! I'd like to order:\n\n` +
            `Fabric: ${fabric.name}\n` +
            `Brand: ${fabric.brand}\n` +
            `Quantity: ${pieces} piece${pieces > 1 ? 's' : ''} (${pieces * 6} yards)\n` +
            `Price: ${formatPrice(totalPrice, currency)}\n\n` +
            `Please confirm availability.`
        );
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-background">
            <Header currency={currency} onToggleCurrency={toggleCurrency} />

            <main className="pt-24 pb-12">
                <div className="container mx-auto px-4">
                    <Link to="/gallery" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Shop
                    </Link>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Image Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="bg-secondary rounded-3xl overflow-hidden aspect-square shadow-elevated">
                                <img
                                    src={fabric.image}
                                    alt={fabric.name}
                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                                />
                            </div>

                            {/* Stock Status */}
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-3 h-3 rounded-full",
                                    fabric.inStock ? "bg-green-500" : "bg-red-500"
                                )} />
                                <span className={cn(
                                    "text-sm font-medium",
                                    fabric.inStock ? "text-green-600" : "text-red-600"
                                )}>
                                    {fabric.inStock ? "In Stock" : "Out of Stock"}
                                </span>
                            </div>
                        </motion.div>

                        {/* Content Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div>
                                <Badge variant="secondary" className="mb-4 capitalize">{fabric.category}</Badge>
                                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl mb-2">{fabric.name}</h1>
                                <p className="text-xl text-muted-foreground">{fabric.brand}</p>
                            </div>

                            {/* Price */}
                            <div className="bg-card rounded-2xl p-6 border border-border">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-3xl font-display text-primary">
                                        {formatPrice(price, currency)}
                                    </span>
                                    <span className="text-muted-foreground">per piece (6 yards)</span>
                                </div>

                                {/* Pieces Selector */}
                                <div className="flex items-center gap-4 mt-4">
                                    <span className="text-sm font-medium">Quantity:</span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="w-9 h-9"
                                            onClick={() => setPieces(Math.max(1, pieces - 1))}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <span className="w-20 text-center font-medium">{pieces} piece{pieces > 1 ? 's' : ''}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="w-9 h-9"
                                            onClick={() => setPieces(pieces + 1)}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <span className="text-xs text-muted-foreground">({pieces * 6} yards total)</span>
                                </div>

                                {pieces > 1 && (
                                    <div className="mt-4 pt-4 border-t border-border">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total:</span>
                                            <span className="font-display text-xl text-primary">
                                                {formatPrice(totalPrice, currency)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-lg leading-relaxed text-muted-foreground">
                                {fabric.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {fabric.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-muted-foreground">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        size="lg"
                                        className="w-full gap-2"
                                        onClick={handleAddToCart}
                                        disabled={justAdded || !fabric.inStock}
                                    >
                                        {justAdded ? (
                                            <>
                                                <Check className="w-5 h-5" />
                                                Added to Cart!
                                            </>
                                        ) : inCart ? (
                                            <>
                                                <Check className="w-5 h-5" />
                                                In Cart
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-5 h-5" />
                                                Add to Cart
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full gap-2"
                                        onClick={() => toggleFavorite(fabric.id)}
                                    >
                                        <Heart className={cn(
                                            "w-5 h-5",
                                            isLiked && "fill-red-500 text-red-500"
                                        )} />
                                        {isLiked ? 'Saved' : 'Save'}
                                    </Button>
                                </div>

                                <Button
                                    size="lg"
                                    variant="whatsapp"
                                    className="w-full gap-2"
                                    onClick={handleWhatsAppOrder}
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Order via WhatsApp
                                </Button>

                                <Link to={`/studio?fabric=${fabric.id}`}>
                                    <Button size="lg" variant="secondary" className="w-full">
                                        Preview in 3D Studio
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default FabricDetails;
