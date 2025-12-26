import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface FavoritesContextType {
    favorites: string[];
    toggleFavorite: (fabricId: string) => void;
    isFavorite: (fabricId: string) => boolean;
    favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'ikso-afrifabs-favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch {
                    return [];
                }
            }
        }
        return [];
    });

    // Debounced localStorage write to prevent UI blocking
    const saveTimeoutRef = useRef<NodeJS.Timeout>();
    useEffect(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
        }, 100);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [favorites]);

    const toggleFavorite = (fabricId: string) => {
        setFavorites(prev => {
            if (prev.includes(fabricId)) {
                return prev.filter(id => id !== fabricId);
            }
            return [...prev, fabricId];
        });
    };

    const isFavorite = (fabricId: string) => {
        return favorites.includes(fabricId);
    };

    const favoritesCount = favorites.length;

    return (
        <FavoritesContext.Provider value={{
            favorites,
            toggleFavorite,
            isFavorite,
            favoritesCount
        }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
