import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Share2, Heart } from 'lucide-react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/hooks/useCurrency';
import { useFabrics } from '@/hooks/useFabrics'; // Reusing the hook for now, or fetch single
import { cn } from '@/lib/utils';
import { formatPrice } from '@/data/fabrics';

const FabricDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { currency, toggleCurrency } = useCurrency();
    const { data: fabrics = [], isLoading } = useFabrics();

    const fabric = fabrics.find(f => f.id === id);

    if (isLoading) return <div className="min-h-screen pt-24 text-center">Loading...</div>;
    if (!fabric) return <div className="min-h-screen pt-24 text-center">Fabric not found</div>;

    const price = currency === 'NGN' ? fabric.priceNGN : fabric.priceCFA;

    return (
        <div className="min-h-screen bg-background">
            <Header currency={currency} onToggleCurrency={toggleCurrency} />

            <main className="pt-24 pb-12">
                <div className="container mx-auto px-4">
                    <Link to="/gallery" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Gallery
                    </Link>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Image Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-secondary rounded-3xl overflow-hidden aspect-square md:aspect-[4/5] shadow-soft"
                        >
                            <img
                                src={fabric.image}
                                alt={fabric.name}
                                className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                            />
                        </motion.div>

                        {/* Content Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div>
                                <Badge variant="secondary" className="mb-4">{fabric.category}</Badge>
                                <h1 className="font-display text-4xl md:text-5xl mb-2">{fabric.name}</h1>
                                <p className="text-xl text-muted-foreground">{fabric.brand}</p>
                            </div>

                            <div className="text-3xl font-semibold text-primary">
                                {formatPrice(price, currency)}
                            </div>

                            <p className="text-lg leading-relaxed text-muted-foreground">
                                {fabric.description || "Authentic high-quality fabric suitable for all your fashion needs."}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {fabric.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-muted-foreground">#{tag}</Badge>
                                ))}
                            </div>

                            <div className="pt-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Button size="lg" className="w-full">
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        Add to Cart
                                    </Button>
                                    <Button size="lg" variant="outline" className="w-full">
                                        <Heart className="w-5 h-5 mr-2" />
                                        Save
                                    </Button>
                                </div>

                                <Link to={`/studio?fabric=${fabric.id}`}>
                                    <Button size="lg" variant="secondary" className="w-full">
                                        View in 3D Studio
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default FabricDetails;
