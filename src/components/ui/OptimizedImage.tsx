import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
    src: string | undefined | null;
    alt: string;
    className?: string;
    fallbackClassName?: string;
    aspectRatio?: 'square' | '3/4' | '4/3' | '16/9' | 'auto';
    priority?: boolean;
}

/**
 * Optimized image component with:
 * - Lazy loading by default
 * - Error handling with fallback
 * - Loading state with skeleton
 * - Responsive sizing
 */
const OptimizedImage = ({
    src,
    alt,
    className,
    fallbackClassName,
    aspectRatio = 'auto',
    priority = false,
}: OptimizedImageProps) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const aspectClasses = {
        'square': 'aspect-square',
        '3/4': 'aspect-[3/4]',
        '4/3': 'aspect-[4/3]',
        '16/9': 'aspect-video',
        'auto': '',
    };

    // If no src or error, show fallback
    if (!src || error) {
        return (
            <div
                className={cn(
                    "bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center",
                    aspectClasses[aspectRatio],
                    fallbackClassName || className
                )}
            >
                <span className="text-muted-foreground text-xs">{alt}</span>
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden", aspectClasses[aspectRatio])}>
            {/* Loading skeleton */}
            {loading && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
            )}

            <img
                src={src}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                onLoad={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setError(true);
                }}
                className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    loading ? "opacity-0" : "opacity-100",
                    className
                )}
            />
        </div>
    );
};

export default OptimizedImage;
