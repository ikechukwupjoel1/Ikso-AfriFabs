import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

const CategoryShowcase = () => {
    const { data: categories = [], isLoading } = useCategories();

    // Default images for categories (fallbacks)
    const defaultImages: Record<string, string> = {
        'ankara': '/Cloth Gallery/Super Wax (1).webp',
        'kente': '/Cloth Gallery/Kente Gold (1).webp',
        'adire': '/Cloth Gallery/Artist Wax (1).webp',
        'aso-oke': '/Cloth Gallery/Supreme VIP Satin (1).webp',
    };

    // Default gradient colors for categories
    const defaultColors: Record<string, string> = {
        'ankara': 'from-orange-500/20 to-red-500/20',
        'kente': 'from-yellow-500/20 to-amber-500/20',
        'adire': 'from-blue-500/20 to-indigo-500/20',
        'aso-oke': 'from-purple-500/20 to-pink-500/20',
    };

    if (isLoading) {
        return (
            <section className="py-12 bg-secondary/30">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                </div>
            </section>
        );
    }

    if (!categories || categories.length === 0) {
        return null;
    }
    return (
        <section className="py-12 bg-secondary/30">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                >
                    <p className="text-primary font-medium mb-2">Browse by Category</p>
                    <h2 className="font-display text-3xl sm:text-4xl">
                        Explore Our Collections
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {categories.map((category, index) => {
                        const image = defaultImages[category.slug] || '/Cloth Gallery/Super Wax (1).webp';
                        const color = defaultColors[category.slug] || 'from-primary/20 to-primary/10';

                        return (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    to={`/gallery?category=${category.slug}`}
                                    className="group block relative aspect-[3/4] rounded-2xl overflow-hidden bg-card shadow-soft hover:shadow-elevated transition-all"
                                >
                                    {/* Background Image */}
                                    <img
                                        src={image}
                                        alt={category.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-t ${color} via-transparent to-transparent`} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />

                                    {/* Content */}
                                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                        <h3 className="font-display text-xl md:text-2xl text-white mb-1">
                                            {category.name}
                                        </h3>
                                        <p className="text-white/70 text-sm hidden sm:block">
                                            {category.description || 'Explore our collection'}
                                        </p>
                                    </div>

                                    {/* Hover Effect */}
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CategoryShowcase;
