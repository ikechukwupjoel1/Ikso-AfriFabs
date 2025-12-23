import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Fabric, Currency } from '@/types/fabric';
import { formatPrice } from '@/data/fabrics';
import { cn } from '@/lib/utils';

interface FabricCardProps {
  fabric: Fabric;
  currency: Currency;
}

const FabricCard = ({ fabric, currency }: FabricCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const price = currency === 'NGN' ? fabric.priceNGN : fabric.priceCFA;

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

        {/* Quick Actions */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="pointer-events-auto">
            <Button
              variant="hero"
              size="sm"
              asChild
            >
              <Link to={`/studio?fabric=${fabric.id}`}>
                <Sparkles className="w-4 h-4" />
                Try in Studio
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsLiked(!isLiked);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background z-10"
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              isLiked ? "fill-primary text-primary" : "text-muted-foreground"
            )}
          />
        </button>

        {/* Brand Badge */}
        <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/80 pointer-events-none">
          {fabric.brand}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/fabric/${fabric.id}`}>
          <h3 className="font-display text-lg mb-1 line-clamp-1 hover:text-primary transition-colors">{fabric.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {fabric.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-primary">
              {formatPrice(price, currency)}
            </div>
            <div className="text-xs text-muted-foreground">
              per {fabric.yardage} yards
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/fabric/${fabric.id}`}>
              <Eye className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default FabricCard;
