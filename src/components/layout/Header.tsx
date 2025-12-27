import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, User, Heart, LogOut, ChevronDown, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Currency } from '@/types/fabric';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import CartDrawer from '@/components/cart/CartDrawer';
import { supabase } from '@/lib/supabase';

const SUPER_ADMIN_EMAIL = 'iksotech@gmail.com';

interface HeaderProps {
  currency: Currency;
  onToggleCurrency: () => void;
  country?: string;
}

const Header = ({ currency, onToggleCurrency, country }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();
  const { user, signOut, loading } = useAuth();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Check super admin
      if (user.email === SUPER_ADMIN_EMAIL) {
        setIsAdmin(true);
        return;
      }

      // Check admin_users table
      const { data } = await supabase
        .from('admin_users')
        .select('role')
        .eq('email', user.email?.toLowerCase())
        .single();

      setIsAdmin(!!data);
    };

    checkAdmin();
  }, [user]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/gallery', label: 'Shop' },
    { href: '/studio', label: 'Studio' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-20 md:h-24 transition-all duration-300">
        <div className="container mx-auto px-4 h-full">
          <div className="grid grid-cols-3 items-center h-full">
            {/* Left: Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-xs uppercase tracking-widest font-semibold transition-colors relative py-1",
                    isActive(link.href)
                      ? "text-primary"
                      : "text-foreground/60 hover:text-foreground"
                  )}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Toggle (Left on Mobile) */}
            <div className="flex md:hidden items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            {/* Center: Logo */}
            <div className="flex justify-center">
              <Link to="/" className="transition-transform duration-300 hover:scale-105">
                <img
                  src="/Ikso AfriFabs Logo Horizontal .webp"
                  alt="Ikso AfriFabs"
                  className="h-8 md:h-12 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-1 md:gap-4">
              {/* Currency Selector with Country Indicator */}
              <button
                onClick={onToggleCurrency}
                className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold tracking-tighter hover:text-primary transition-colors pr-2 md:pr-4 border-r border-gray-100 group"
                title={`Prices in ${currency === 'NGN' ? 'Nigerian Naira' : 'West African CFA'}${country ? ` (${country})` : ''}\nClick to change`}
              >
                <MapPin className="w-3 h-3 text-primary/60 group-hover:text-primary" />
                <span className="hidden sm:inline text-muted-foreground">
                  {country || (currency === 'NGN' ? 'Nigeria' : 'West Africa')}
                </span>
                <span className="font-bold">
                  {currency === 'NGN' ? '₦ NGN' : 'CFA'}
                </span>
              </button>

              <div className="flex items-center gap-1 md:gap-2">
                {/* Search / Favorites (Hidden on small mobile) */}
                <Button variant="ghost" size="icon" className="hidden sm:flex relative" asChild>
                  <Link to="/gallery?filter=favorites">
                    <Heart className="h-5 w-5 text-foreground/80" />
                    {favoritesCount > 0 && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-primary-foreground text-[8px] rounded-full flex items-center justify-center font-bold">
                        {favoritesCount}
                      </span>
                    )}
                  </Link>
                </Button>

                {/* Account */}
                {!loading && (
                  user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <User className="h-5 w-5 text-foreground/80" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 mt-2">
                        <div className="px-3 py-2 border-b border-gray-50 mb-1">
                          <p className="text-sm font-semibold truncate">{getUserDisplayName()}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <DropdownMenuItem asChild className="cursor-pointer py-2 px-3">
                          <Link to={isAdmin ? "/admin" : "/account"} className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="text-xs font-medium">My Account</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer py-2 px-3">
                          <Link to="/gallery?filter=favorites" className="flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            <span className="text-xs font-medium">Favorites</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer py-2 px-3">
                          <LogOut className="h-4 w-4 mr-2" />
                          <span className="text-xs font-medium">Log Out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link to="/login" className="hidden md:block text-[10px] uppercase font-bold tracking-widest hover:text-primary transition-colors">
                      Log In
                    </Link>
                  )
                )}

                {/* Cart Toggle */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 hover:text-primary transition-colors"
                >
                  <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-4 h-4 md:w-5 md:h-5 bg-black text-white text-[8px] md:text-[10px] rounded-full flex items-center justify-center font-bold"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu (Sliding overlay) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-100 shadow-2xl overflow-hidden z-40"
            >
              <nav className="container mx-auto px-6 py-8 flex flex-col gap-6">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-sm uppercase tracking-[0.2em] font-bold transition-all",
                      isActive(link.href) ? "text-primary pl-4 border-l-2 border-primary" : "text-foreground/60"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                  {user ? (
                    <div className="flex flex-col gap-1 flex-1">
                      <p className="text-xs font-bold truncate">{getUserDisplayName()}</p>
                      <button onClick={handleSignOut} className="text-[10px] text-destructive font-bold uppercase tracking-widest text-left">
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-4 w-full">
                      <Link to="/login" onClick={() => setIsOpen(false)} className="text-xs font-bold uppercase tracking-widest flex-1 py-3 text-center border border-black">
                        Log In
                      </Link>
                      <Link to="/signup" onClick={() => setIsOpen(false)} className="text-xs font-bold uppercase tracking-widest flex-1 py-3 text-center bg-black text-white">
                        Sign Up
                      </Link>
                    </div>
                  )}
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
