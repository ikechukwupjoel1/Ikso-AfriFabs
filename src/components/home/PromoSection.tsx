import { motion } from 'framer-motion';
import { ArrowRight, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PromoSection = () => {
    return (
        <section className="py-8">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative bg-gradient-to-r from-primary via-primary to-accent rounded-2xl p-6 md:p-8 overflow-hidden"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='%23fff' fill-opacity='1'/%3E%3C/svg%3E")`,
                            backgroundSize: '30px 30px'
                        }} />
                    </div>

                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                                <Percent className="w-7 h-7 text-white" />
                            </div>
                            <div className="text-white">
                                <h3 className="font-display text-xl md:text-2xl">New Arrivals Special</h3>
                                <p className="text-white/80 text-sm md:text-base">
                                    Free delivery on orders over ₦50,000 or 50,000 CFA
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="secondary"
                            size="lg"
                            className="whitespace-nowrap"
                            asChild
                        >
                            <Link to="/gallery">
                                Shop Now
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default PromoSection;
