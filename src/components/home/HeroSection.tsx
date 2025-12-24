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

// Animation variants for more fluid transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const fabricVariants = {
  hidden: (index: number) => ({
    opacity: 0,
    y: 100,
    scale: 0.8,
    rotateY: index < 2 ? -15 : index > 2 ? 15 : 0,
  }),
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotateY: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      delay: Math.abs(index - 2) * 0.1, // Center image first
    },
  }),
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.9,
    transition: { duration: 0.3 },
  },
  hover: {
    y: -20,
    scale: 1.05,
    transition: { type: 'spring', stiffness: 300 },
  },
};

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroFabrics.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % heroFabrics.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + heroFabrics.length) % heroFabrics.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentFabric = heroFabrics[currentSlide];

  // Responsive image sizes and heights
  const getImageStyles = (index: number) => {
    const baseHeights = {
      mobile: ['h-[140px]', 'h-[170px]', 'h-[200px]', 'h-[170px]', 'h-[140px]'],
      tablet: ['h-[200px]', 'h-[260px]', 'h-[300px]', 'h-[260px]', 'h-[200px]'],
      desktop: ['h-[280px]', 'h-[360px]', 'h-[420px]', 'h-[360px]', 'h-[280px]'],
    };
    return {
      mobile: baseHeights.mobile[index],
      tablet: baseHeights.tablet[index],
      desktop: baseHeights.desktop[index],
    };
  };

  return (
    <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] min-h-[400px] overflow-hidden">
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(180deg, #581c87 0%, #312e81 50%, #0f172a 100%)',
            'linear-gradient(180deg, #4c1d95 0%, #1e3a8a 50%, #0f172a 100%)',
            'linear-gradient(180deg, #581c87 0%, #312e81 50%, #0f172a 100%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Animated Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 40}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Animated Glow Effects */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full bg-purple-500/20 blur-[100px]"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full bg-blue-500/20 blur-[100px]"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Reflective floor gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 md:h-32 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Horizontal reflection line with shimmer */}
      <motion.div
        className="absolute bottom-16 md:bottom-24 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

      {/* Fabric Images */}
      <div className="absolute inset-0 flex items-center justify-center pt-8 md:pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-end justify-center gap-1 sm:gap-2 md:gap-4 px-2 sm:px-4"
          >
            {currentFabric.images.map((image, index) => {
              const styles = getImageStyles(index);

              return (
                <motion.div
                  key={index}
                  custom={index}
                  variants={fabricVariants}
                  whileHover="hover"
                  className={`relative cursor-pointer overflow-hidden rounded-t-full
                    ${styles.mobile} sm:${styles.tablet} lg:${styles.desktop}
                    w-[60px] sm:w-[100px] md:w-[140px] lg:w-[180px]`}
                  style={{
                    boxShadow: '0 0 40px rgba(139, 92, 246, 0.4), 0 0 80px rgba(139, 92, 246, 0.2)',
                  }}
                >
                  <img
                    src={image}
                    alt={`Fabric ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {/* Animated shimmer overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      delay: index * 0.2,
                    }}
                  />
                  {/* Gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10" />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Reflection below images - Hidden on mobile */}
      <div className="hidden sm:block absolute bottom-0 left-0 right-0 h-16 md:h-24 overflow-hidden opacity-20">
        <div className="flex items-start justify-center gap-2 md:gap-4 px-4 transform scale-y-[-1] blur-[2px]">
          {currentFabric.images.map((image, index) => {
            const heights = ['h-[50px]', 'h-[70px]', 'h-[90px]', 'h-[70px]', 'h-[50px]'];
            return (
              <div
                key={index}
                className={`${heights[index]} w-[80px] md:w-[140px] rounded-t-full overflow-hidden`}
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

      {/* Navigation Arrows - Larger touch targets on mobile */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all z-20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all z-20"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-24 sm:bottom-32 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroFabrics.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentSlide(index);
              setTimeout(() => setIsAutoPlaying(true), 10000);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                ? 'w-8 bg-white'
                : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* CTA Buttons - Responsive positioning */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 sm:left-auto sm:right-8 -translate-x-1/2 sm:translate-x-0 flex flex-col sm:flex-row gap-2 sm:gap-3 z-20 w-[90%] sm:w-auto">
        <Button
          asChild
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base"
        >
          <Link to="/gallery">
            New Collection
          </Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          asChild
          className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-sm sm:text-base"
        >
          <Link to="/gallery">
            Discover Lookbook
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Title Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
          className="absolute bottom-32 sm:bottom-40 left-1/2 -translate-x-1/2 text-center z-10 w-full px-4"
        >
          <motion.h2
            className="font-display text-white text-base sm:text-lg md:text-xl tracking-widest uppercase mb-1"
            animate={{ letterSpacing: ['0.1em', '0.2em', '0.1em'] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {currentFabric.title}
          </motion.h2>
          <p className="text-white/70 text-xs sm:text-sm">
            {currentFabric.subtitle}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Logo/Brand - Responsive sizing */}
      <motion.div
        className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 z-20 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.h1
          className="font-display text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-wider"
          animate={{
            textShadow: [
              '0 0 20px rgba(139, 92, 246, 0.5)',
              '0 0 40px rgba(139, 92, 246, 0.8)',
              '0 0 20px rgba(139, 92, 246, 0.5)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          IKSO AFRIFABS
        </motion.h1>
        <p className="text-white/60 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] mt-1">
          THE FABRIC OF US
        </p>
      </motion.div>
    </section>
  );
};

export default HeroSection;
