import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

// Featured fabric images for the hero slideshow
const heroFabrics = [
  {
    id: 1,
    images: [
      '/Cloth Gallery/Supreme VIP Satin (1).webp',
      '/Cloth Gallery/Kente Gold (1).webp',
      '/Cloth Gallery/Super Gandaho (1).webp',
      '/Cloth Gallery/AK Gold (1).webp',
      '/Cloth Gallery/Cihgany (1).webp',
    ],
    title: 'New Collection',
    subtitle: 'Premium African Textiles',
  },
  {
    id: 2,
    images: [
      '/Cloth Gallery/Top Hollandais (1).webp',
      '/Cloth Gallery/Super Mwunva (1).webp',
      '/Cloth Gallery/Antiquity Wax (1).webp',
      '/Cloth Gallery/Artist Wax (1).webp',
      '/Cloth Gallery/Super Ruvuma (1).webp',
    ],
    title: 'Heritage Collection',
    subtitle: 'Stories Woven in Every Thread',
  },
  {
    id: 3,
    images: [
      '/Cloth Gallery/FABULOUS DYNASTY (1).webp',
      '/Cloth Gallery/Egnonhou Chigan (1).webp',
      '/Cloth Gallery/Super VIP Collection (1).webp',
      '/Cloth Gallery/U & JB (1).webp',
      '/Cloth Gallery/Velldam (1).webp',
    ],
    title: 'Royal Collection',
    subtitle: 'Fit for Royalty',
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroFabrics.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroFabrics.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroFabrics.length) % heroFabrics.length);

  const currentFabric = heroFabrics[currentSlide];

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
      {/* Gradient Background - Purple to Deep Blue like Vlisco */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-900" />

      {/* Stars overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-[10%] w-1 h-1 bg-white rounded-full animate-pulse" />
        <div className="absolute top-20 left-[25%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-16 left-[40%] w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-8 left-[55%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
        <div className="absolute top-24 left-[70%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
        <div className="absolute top-12 left-[85%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-32 left-[15%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.9s' }} />
        <div className="absolute top-28 left-[60%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>

      {/* Reflective floor gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Horizontal reflection line */}
      <div className="absolute bottom-24 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Fabric Images - Centered Row like Vlisco */}
      <div className="absolute inset-0 flex items-center justify-center pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-end justify-center gap-2 md:gap-4 px-4"
          >
            {currentFabric.images.map((image, index) => {
              // Create varying heights for dramatic effect
              const heights = ['h-[280px]', 'h-[340px]', 'h-[380px]', 'h-[340px]', 'h-[280px]'];
              const delays = [0.1, 0.2, 0, 0.2, 0.1];

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delays[index], duration: 0.6 }}
                  className={`relative ${heights[index]} w-[120px] md:w-[160px] lg:w-[180px] rounded-t-full overflow-hidden`}
                  style={{
                    boxShadow: '0 0 60px rgba(139, 92, 246, 0.3)',
                  }}
                >
                  <img
                    src={image}
                    alt={`Fabric ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Reflection below images */}
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden opacity-30">
        <div className="flex items-start justify-center gap-2 md:gap-4 px-4 transform scale-y-[-1] blur-sm">
          {currentFabric.images.map((image, index) => {
            const heights = ['h-[80px]', 'h-[100px]', 'h-[120px]', 'h-[100px]', 'h-[80px]'];
            return (
              <div
                key={index}
                className={`${heights[index]} w-[120px] md:w-[160px] lg:w-[180px] rounded-t-full overflow-hidden`}
              >
                <img
                  src={image}
                  alt=""
                  className="w-full h-full object-cover object-bottom"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroFabrics.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                ? 'w-8 bg-white'
                : 'bg-white/40 hover:bg-white/60'
              }`}
          />
        ))}
      </div>

      {/* CTA Buttons - Bottom Right like Vlisco */}
      <div className="absolute bottom-8 right-8 flex gap-3 z-20">
        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
        >
          <Link to="/gallery">
            New Collection
          </Link>
        </Button>
        <Button
          variant="outline"
          asChild
          className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-6"
        >
          <Link to="/gallery">
            Discover Lookbook
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Title Overlay - Center Bottom */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-36 left-1/2 -translate-x-1/2 text-center z-10"
        >
          <h2 className="font-display text-white text-lg md:text-xl tracking-widest uppercase mb-1">
            {currentFabric.title}
          </h2>
          <p className="text-white/70 text-sm">
            {currentFabric.subtitle}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Logo/Brand in top center */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <h1 className="font-display text-white text-3xl md:text-4xl tracking-wider">
          IKSO AFRIFABS
        </h1>
        <p className="text-white/60 text-xs text-center tracking-[0.3em] mt-1">
          THE FABRIC OF US
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
