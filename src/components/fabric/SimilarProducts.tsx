import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Fabric, Currency } from '@/types/fabric';
import { calculatePrice, formatPrice } from '@/lib/currency';
import { useExchangeRate } from '@/hooks/useExchangeRate';

interface SimilarProductsProps {
    fabrics: Fabric[];
    currency: Currency;
}

const SimilarProducts = ({ fabrics, currency }: SimilarProductsProps) => {
    const { rate } = useExchangeRate();

    if (fabrics.length === 0) return null;

    return (
        <section className="mt-16">
            <h2 className="font-display text-2xl mb-6">Similar Designs You'll Love</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {fabrics.map((fabric, index) => {
                    const price = calculatePrice(fabric.priceCFA, currency, rate);
                    return (
                        <motion.div
                            key={fabric.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                to={`/fabric/${fabric.id}`}
                                className="group block bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-elevated transition-all"
                            >
                                <div className="aspect-square overflow-hidden">
                                    <img
                                        src={fabric.image}
                                        alt={fabric.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-3">
                                    <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                        {fabric.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">{fabric.brand}</p>
                                    <p className="text-primary font-semibold text-sm mt-1">
                                        {formatPrice(price, currency)}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
};

export default SimilarProducts;
