import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Currency } from '@/types/fabric';

interface WelcomeModalProps {
    onSelectCurrency: (currency: Currency) => void;
    detectedCountry: string;
    detectedCurrency: Currency;
}

const WELCOME_SHOWN_KEY = 'ikso_welcome_shown';

const WelcomeModal = ({ onSelectCurrency, detectedCountry, detectedCurrency }: WelcomeModalProps) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if welcome has been shown before
        const hasShown = localStorage.getItem(WELCOME_SHOWN_KEY);
        if (!hasShown) {
            // Show modal after a short delay for better UX
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleSelectCurrency = (currency: Currency) => {
        localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
        onSelectCurrency(currency);
        setIsOpen(false);
    };

    const handleClose = () => {
        localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
        onSelectCurrency(detectedCurrency);
        setIsOpen(false);
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>

                            {/* Header with gradient */}
                            <div className="bg-gradient-to-br from-primary/10 via-amber-50 to-orange-50 px-6 pt-8 pb-6 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4"
                                >
                                    <Sparkles className="w-8 h-8 text-primary" />
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="font-display text-2xl md:text-3xl text-primary mb-2"
                                >
                                    Welcome to Ikso AfriFabs
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-muted-foreground text-sm md:text-base"
                                >
                                    Premium African fabrics, curated with love from West Africa
                                </motion.p>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-6">
                                {/* Location detected */}
                                {detectedCountry && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4"
                                    >
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span>We detected you're browsing from <strong className="text-foreground">{detectedCountry}</strong></span>
                                    </motion.div>
                                )}

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-center text-sm text-muted-foreground mb-6"
                                >
                                    Select your preferred currency for the best shopping experience:
                                </motion.p>

                                {/* Currency options */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="grid grid-cols-2 gap-3"
                                >
                                    <button
                                        onClick={() => handleSelectCurrency('NGN')}
                                        className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${detectedCurrency === 'NGN'
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">🇳🇬</div>
                                        <div className="font-bold text-lg">₦ NGN</div>
                                        <div className="text-xs text-muted-foreground">Nigerian Naira</div>
                                        {detectedCurrency === 'NGN' && (
                                            <div className="text-[10px] text-primary font-medium mt-1">Recommended</div>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleSelectCurrency('CFA')}
                                        className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${detectedCurrency === 'CFA'
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">🌍</div>
                                        <div className="font-bold text-lg">CFA</div>
                                        <div className="text-xs text-muted-foreground">West African CFA</div>
                                        {detectedCurrency === 'CFA' && (
                                            <div className="text-[10px] text-primary font-medium mt-1">Recommended</div>
                                        )}
                                    </button>
                                </motion.div>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-center text-xs text-muted-foreground mt-4"
                                >
                                    You can change this anytime from the header
                                </motion.p>
                            </div>

                            {/* Footer */}
                            <div className="px-6 pb-6">
                                <Button
                                    onClick={() => handleSelectCurrency(detectedCurrency)}
                                    className="w-full"
                                    size="lg"
                                >
                                    Continue with {detectedCurrency === 'NGN' ? '₦ Naira' : 'CFA'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default WelcomeModal;
