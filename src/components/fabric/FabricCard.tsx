import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Fabric, Currency } from '@/types/fabric';
import { calculatePrice, formatPrice } from '@/lib/currency';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { cn } from '@/lib/utils';

interface FabricCardProps {
  fabric: Fabric;
  currency: Currency;
}

const FabricCard = ({ fabric, currency }: FabricCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const { addToCart, isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { rate } = useExchangeRate();

  const price = calculatePrice(fabric.priceCFA, currency, rate);
  const formattedPrice = formatPrice(price, currency);
  const isLiked = isFavorite(fabric.id);
  const inCart = isInCart(fabric.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(fabric);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(fabric.id);
  };

  return (
    <motion.div
      className="group relative bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/fabric/${fabric.id}`}>
          <motion.img
            src={fabric.image}
            alt={fabric.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.4 }}
          />
        </Link>

        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Quick Add Button - Center */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="pointer-events-auto">
            <Button
              variant="hero"
              size="sm"
              onClick={handleAddToCart}
              disabled={justAdded}
              className="gap-2"
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Like Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background hover:scale-110 z-10"
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
            )}
          />
        </button>

        {/* Stock Status */}
        {!fabric.inStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-muted-foreground font-medium">Out of Stock</span>
          </div>
        )}

        {/* Brand Badge */}
        <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/80 pointer-events-none">
          {fabric.brand}
        </Badge>

        {/* In Cart Indicator */}
        {inCart && !justAdded && (
          <div className="absolute bottom-3 left-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            In Cart
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/fabric/${fabric.id}`}>
          <h3 className="font-display text-lg mb-1 line-clamp-1 hover:text-primary transition-colors">
            {fabric.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
          {fabric.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-primary text-lg">
              {formattedPrice}
            </div>
            <div className="text-xs text-muted-foreground">
              per piece (6 yards)
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9"
              onClick={handleAddToCart}
              disabled={justAdded || !fabric.inStock}
            >
              {inCart ? <Check className="w-4 h-4 text-primary" /> : <ShoppingCart className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="w-9 h-9" asChild>
              <Link to={`/fabric/${fabric.id}`}>
                <Eye className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FabricCard;
