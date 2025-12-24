import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, MessageCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { Currency } from '@/types/fabric';
import { calculatePrice, formatPrice } from '@/lib/currency';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    currency: Currency;
}

const CartDrawer = ({ isOpen, onClose, currency }: CartDrawerProps) => {
    const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { rate } = useExchangeRate();

    const total = getCartTotal(currency, rate);

    const handleWhatsAppCheckout = () => {
        const whatsappNumber = '2348165715235';

        let message = "Hello! I'd like to order the following fabrics from Ikso AfriFabs:\n\n";

        items.forEach((item, index) => {
            const price = calculatePrice(item.fabric.priceCFA, currency, rate);
            message += `${index + 1}. ${item.fabric.name}\n`;
            message += `   - Quantity: ${item.pieces} piece${item.pieces > 1 ? 's' : ''} (${item.pieces * 6} yards)\n`;
            message += `   - Price: ${formatPrice(price, currency)}\n\n`;
        });

        message += `\nTotal: ${formatPrice(total, currency)}`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-primary" />
                                <h2 className="font-display text-xl">Your Cart</h2>
                                <span className="text-sm text-muted-foreground">({items.length} items)</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
                                    <p className="text-muted-foreground mb-4">Your cart is empty</p>
                                    <Button variant="outline" onClick={onClose} asChild>
                                        <Link to="/gallery">Browse Fabrics</Link>
                                    </Button>
                                </div>
                            ) : (
                                items.map((item) => {
                                    const price = calculatePrice(item.fabric.priceCFA, currency, rate);
                                    return (
                                        <motion.div
                                            key={item.fabricId}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            className="flex gap-4 bg-card rounded-xl p-3"
                                        >
                                            {/* Image */}
                                            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                                                <img
                                                    src={item.fabric.image}
                                                    alt={item.fabric.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-sm line-clamp-1">{item.fabric.name}</h3>
                                                <p className="text-xs text-muted-foreground">{item.fabric.brand}</p>
                                                <p className="text-primary font-semibold text-sm mt-1">
                                                    {formatPrice(price, currency)}
                                                </p>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="w-7 h-7"
                                                        onClick={() => updateQuantity(item.fabricId, item.pieces - 1)}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>
                                                    <span className="text-sm w-16 text-center">{item.pieces} pc{item.pieces > 1 ? 's' : ''}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="w-7 h-7"
                                                        onClick={() => updateQuantity(item.fabricId, item.pieces + 1)}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Remove */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 text-destructive hover:text-destructive"
                                                onClick={() => removeFromCart(item.fabricId)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-border p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-display text-xl">{formatPrice(total, currency)}</span>
                                </div>

                                <Button
                                    variant="whatsapp"
                                    size="lg"
                                    className="w-full"
                                    onClick={handleWhatsAppCheckout}
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Checkout via WhatsApp
                                </Button>

                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" onClick={onClose}>
                                        Continue Shopping
                                    </Button>
                                    <Button variant="ghost" onClick={clearCart} className="text-destructive hover:text-destructive">
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
