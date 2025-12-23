import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categories = [
    {
        id: 'ankara',
        name: 'Ankara',
        description: 'Vibrant African wax prints',
        image: '/Cloth Gallery/Super Wax (1).webp',
        color: 'from-orange-500/20 to-red-500/20',
    },
    {
        id: 'kente',
        name: 'Kente',
        description: 'Traditional Ghanaian weave',
        image: '/Cloth Gallery/Kente Gold (1).webp',
        color: 'from-yellow-500/20 to-amber-500/20',
    },
    {
        id: 'adire',
        name: 'Adire',
        description: 'Yoruba tie-dye artistry',
        image: '/Cloth Gallery/Artist Wax (1).webp',
        color: 'from-blue-500/20 to-indigo-500/20',
    },
    {
        id: 'aso-oke',
        name: 'Aso-Oke',
        description: 'Premium hand-woven fabric',
        image: '/Cloth Gallery/Supreme VIP Satin (1).webp',
        color: 'from-purple-500/20 to-pink-500/20',
    },
];

const CategoryShowcase = () => {
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
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                to={`/gallery?category=${category.id}`}
                                className="group block relative aspect-[3/4] rounded-2xl overflow-hidden bg-card shadow-soft hover:shadow-elevated transition-all"
                            >
                                {/* Background Image */}
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} via-transparent to-transparent`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />

                                {/* Content */}
                                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                    <h3 className="font-display text-xl md:text-2xl text-white mb-1">
                                        {category.name}
                                    </h3>
                                    <p className="text-white/70 text-sm hidden sm:block">
                                        {category.description}
                                    </p>
                                </div>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryShowcase;
