import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Currency } from '@/types/fabric';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import CartDrawer from '@/components/cart/CartDrawer';

interface HeaderProps {
  currency: Currency;
  onToggleCurrency: () => void;
}

const Header = ({ currency, onToggleCurrency }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/gallery', label: 'Shop' },
    { href: '/studio', label: 'Studio' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Ikso AfriFabs"
                className="h-10 md:h-12 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors relative py-2",
                    isActive(link.href)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Currency Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCurrency}
                className="text-xs font-semibold"
              >
                {currency === 'NGN' ? '₦ NGN' : 'CFA'}
              </Button>

              <div className="hidden md:flex items-center gap-1">
                {/* Favorites */}
                <Button variant="ghost" size="icon" className="relative" asChild>
                  <Link to="/gallery?filter=favorites">
                    <Heart className="h-5 w-5" />
                    {favoritesCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {favoritesCount}
                      </span>
                    )}
                  </Link>
                </Button>

                {/* User */}
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>

                {/* Cart */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-medium"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Button>
              </div>

              {/* Mobile Cart Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-b border-border overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-lg font-medium transition-colors",
                      isActive(link.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex gap-2 pt-2 border-t border-border mt-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/gallery?filter=favorites" onClick={() => setIsOpen(false)}>
                      <Heart className="h-4 w-4 mr-2" />
                      Favorites ({favoritesCount})
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        currency={currency}
      />
    </>
  );
};

export default Header;
