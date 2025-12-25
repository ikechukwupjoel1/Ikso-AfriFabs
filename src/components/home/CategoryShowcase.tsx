import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useFabrics } from '@/hooks/useFabrics';
import { useMemo } from 'react';

const CategoryShowcase = () => {
    const { data: categories = [], isLoading: categoriesLoading } = useCategories();
    const { data: fabrics = [], isLoading: fabricsLoading } = useFabrics();

    const isLoading = categoriesLoading || fabricsLoading;

    // Get a random image from each category's fabrics (changes on each render)
    const categoryImages = useMemo(() => {
        const images: Record<string, string | null> = {};
        categories.forEach(category => {
            const categoryFabrics = fabrics.filter(
                f => f.category === category.slug && f.image
            );
            if (categoryFabrics.length > 0) {
                // Pick a random fabric from the category
                const randomIndex = Math.floor(Math.random() * categoryFabrics.length);
                images[category.slug] = categoryFabrics[randomIndex].image;
            } else {
                images[category.slug] = null;
            }
        });
        return images;
    }, [categories, fabrics]);

    // Gradient colors for categories without images
    const gradientColors = [
        'from-orange-400 to-red-500',
        'from-amber-400 to-yellow-500',
        'from-emerald-400 to-teal-500',
        'from-blue-400 to-indigo-500',
        'from-purple-400 to-pink-500',
        'from-rose-400 to-red-500',
        'from-cyan-400 to-blue-500',
        'from-lime-400 to-green-500',
    ];

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
                        const image = categoryImages[category.slug];
                        const gradient = gradientColors[index % gradientColors.length];

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
                                    {/* Background - Image or Gradient */}
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={category.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                                    )}

                                    {/* Dark Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />

                                    {/* Content */}
                                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                        <h3 className="font-display text-xl md:text-2xl text-white mb-1">
                                            {category.name}
                                        </h3>
                                        <p className="text-white/70 text-sm hidden sm:block line-clamp-2">
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

