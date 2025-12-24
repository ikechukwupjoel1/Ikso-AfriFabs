import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Fabric, Currency } from '@/types/fabric';
import { calculatePrice } from '@/lib/currency';

export interface CartItem {
    fabricId: string;
    fabric: Fabric;
    pieces: number; // Number of 6-yard pieces
    addedAt: Date;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (fabric: Fabric, pieces?: number) => void;
    removeFromCart: (fabricId: string) => void;
    updateQuantity: (fabricId: string, pieces: number) => void;
    clearCart: () => void;
    getCartTotal: (currency: Currency, exchangeRate: number) => number;
    cartCount: number;
    isInCart: (fabricId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ikso-afrifabs-cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    return parsed.map((item: any) => ({
                        ...item,
                        addedAt: new Date(item.addedAt)
                    }));
                } catch {
                    return [];
                }
            }
        }
        return [];
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addToCart = (fabric: Fabric, pieces: number = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.fabricId === fabric.id);
            if (existing) {
                return prev.map(item =>
                    item.fabricId === fabric.id
                        ? { ...item, pieces: item.pieces + pieces }
                        : item
                );
            }
            return [...prev, {
                fabricId: fabric.id,
                fabric,
                pieces,
                addedAt: new Date()
            }];
        });
    };

    const removeFromCart = (fabricId: string) => {
        setItems(prev => prev.filter(item => item.fabricId !== fabricId));
    };

    const updateQuantity = (fabricId: string, pieces: number) => {
        if (pieces <= 0) {
            removeFromCart(fabricId);
            return;
        }
        setItems(prev =>
            prev.map(item =>
                item.fabricId === fabricId ? { ...item, pieces } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const getCartTotal = (currency: Currency, exchangeRate: number) => {
        return items.reduce((total, item) => {
            const price = calculatePrice(item.fabric.priceCFA, currency, exchangeRate);
            return total + (price * item.pieces); // Price per piece × number of pieces
        }, 0);
    };

    const cartCount = items.reduce((count, item) => count + 1, 0);

    const isInCart = (fabricId: string) => {
        return items.some(item => item.fabricId === fabricId);
    };

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            cartCount,
            isInCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
