import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    showCount?: boolean;
    count?: number;
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
}

const StarRating = ({
    rating,
    maxRating = 5,
    size = 'md',
    showValue = false,
    showCount = false,
    count = 0,
    interactive = false,
    onRatingChange
}: StarRatingProps) => {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    const handleClick = (index: number) => {
        if (interactive && onRatingChange) {
            onRatingChange(index + 1);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {[...Array(maxRating)].map((_, index) => {
                    const filled = index < Math.floor(rating);
                    const halfFilled = index === Math.floor(rating) && rating % 1 >= 0.5;

                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleClick(index)}
                            disabled={!interactive}
                            className={cn(
                                "transition-transform",
                                interactive && "hover:scale-110 cursor-pointer",
                                !interactive && "cursor-default"
                            )}
                        >
                            <Star
                                className={cn(
                                    sizeClasses[size],
                                    filled || halfFilled
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                )}
                            />
                        </button>
                    );
                })}
            </div>
            {showValue && rating > 0 && (
                <span className="text-sm font-medium text-muted-foreground ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
            {showCount && count > 0 && (
                <span className="text-xs text-muted-foreground ml-1">
                    ({count})
                </span>
            )}
        </div>
    );
};

export default StarRating;
