import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles, Palette, Globe, Heart, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Collection of interesting facts about African fabrics
const africaFabricFacts = [
    {
        icon: Sparkles,
        title: "Did You Know?",
        fact: "Ankara fabric originated from the Dutch who were actually trying to replicate Indonesian Batik for the Indonesian market, but Africans embraced it more!",
        color: "from-amber-500 to-orange-600"
    },
    {
        icon: Palette,
        title: "Kente Cloth",
        fact: "Kente cloth from Ghana was originally reserved only for royalty. Each color and pattern has a specific meaning - gold represents wealth and royalty.",
        color: "from-yellow-500 to-amber-600"
    },
    {
        icon: Globe,
        title: "Global Influence",
        fact: "African prints have influenced major fashion houses like Dolce & Gabbana, Burberry, and Louis Vuitton in their runway collections.",
        color: "from-purple-500 to-pink-600"
    },
    {
        icon: Heart,
        title: "Cultural Heritage",
        fact: "The Adire fabric of the Yoruba people uses resist-dyeing techniques that have been passed down for over 1,000 years.",
        color: "from-red-500 to-rose-600"
    },
    {
        icon: Leaf,
        title: "Sustainable Fashion",
        fact: "Many traditional African fabrics use natural dyes from plants like indigo, kola nuts, and camwood - making them eco-friendly choices.",
        color: "from-green-500 to-emerald-600"
    },
    {
        icon: Sparkles,
        title: "Aso-Oke Tradition",
        fact: "Aso-Oke, handwoven by the Yoruba people, takes skilled artisans weeks to create a single piece. It's considered a family heirloom.",
        color: "from-blue-500 to-indigo-600"
    },
    {
        icon: Palette,
        title: "Symbolic Patterns",
        fact: "In African textiles, geometric patterns often represent proverbs. A zigzag might mean 'wisdom lies in learning' or 'life's path is not straight'.",
        color: "from-teal-500 to-cyan-600"
    },
    {
        icon: Globe,
        title: "Mudcloth Magic",
        fact: "Bògòlanfini (mudcloth) from Mali is dyed using fermented mud and leaves. The process can take weeks and each cloth tells a story.",
        color: "from-orange-500 to-red-600"
    },
    {
        icon: Heart,
        title: "Unity Symbol",
        fact: "The Sankofa pattern, common in African fabrics, means 'go back and get it' - reminding us to learn from our past to build the future.",
        color: "from-violet-500 to-purple-600"
    },
    {
        icon: Leaf,
        title: "Economic Impact",
        fact: "The African textile industry employs over 1 million people across the continent and contributes billions to local economies.",
        color: "from-lime-500 to-green-600"
    }
];

const AfricanFabricFacts = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const whatsappNumber = '2348165715235';
    const message = encodeURIComponent('Hello! I\'m interested in ordering fabrics from IksoTech AfriFabs.');

    // Auto-rotate facts every 8 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % africaFabricFacts.length);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const currentFact = africaFabricFacts[currentIndex];
    const IconComponent = currentFact.icon;

    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative bg-gradient-hero rounded-3xl p-8 md:p-12 lg:p-16 overflow-hidden"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L45 15H15L30 0zM30 60L15 45H45L30 60zM0 30L15 15V45L0 30zM60 30L45 45V15L60 30z' fill='%23fff' fill-opacity='0.3'/%3E%3C/svg%3E")`,
                            backgroundSize: '60px 60px'
                        }} />
                    </div>

                    <div className="relative grid lg:grid-cols-2 gap-8 items-center">
                        {/* Left Content - Dynamic Facts */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex gap-1">
                                    {africaFabricFacts.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex
                                                    ? 'bg-primary-foreground w-6'
                                                    : 'bg-primary-foreground/40 hover:bg-primary-foreground/60'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentFact.color} flex items-center justify-center shadow-lg`}>
                                            <IconComponent className="w-6 h-6 text-white" />
                                        </div>
                                        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-primary-foreground">
                                            {currentFact.title}
                                        </h2>
                                    </div>

                                    <p className="text-primary-foreground/90 text-lg leading-relaxed mb-8 min-h-[80px]">
                                        {currentFact.fact}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex flex-wrap gap-4">
                                <Button
                                    variant="whatsapp"
                                    size="xl"
                                    onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')}
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Order Authentic Fabrics
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                                    onClick={() => setCurrentIndex((prev) => (prev + 1) % africaFabricFacts.length)}
                                >
                                    Next Fact →
                                </Button>
                            </div>
                        </div>

                        {/* Right - Visual with rotating icons */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="hidden lg:flex justify-center"
                        >
                            <div className="relative">
                                <motion.div
                                    className="w-64 h-64 rounded-full bg-primary-foreground/10 flex items-center justify-center"
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                                >
                                    <div className="w-48 h-48 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={currentIndex}
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.5, opacity: 0 }}
                                                className={`w-32 h-32 rounded-full bg-gradient-to-br ${currentFact.color} flex items-center justify-center shadow-2xl`}
                                            >
                                                <IconComponent className="w-16 h-16 text-white" />
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </motion.div>

                                {/* Floating fact counter */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="absolute top-0 right-0 bg-primary-foreground text-primary px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                                >
                                    {currentIndex + 1} / {africaFabricFacts.length}
                                </motion.div>

                                {/* Decorative elements */}
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                                    className="absolute bottom-4 left-0 w-4 h-4 rounded-full bg-primary-foreground/60"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ repeat: Infinity, duration: 2.5 }}
                                    className="absolute top-1/2 -left-4 w-3 h-3 rounded-full bg-primary-foreground/40"
                                />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default AfricanFabricFacts;
