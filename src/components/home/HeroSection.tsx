import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

// Featured fabric images for the unique Ikso AfriFabs experience
const heroCollections = [
  {
    id: 1,
    images: [
      '/Cloth Gallery/Supreme VIP Satin (1).webp',
      '/Cloth Gallery/Kente Gold (1).webp',
      '/Cloth Gallery/Super Gandaho (1).webp',
      '/Cloth Gallery/AK Gold (1).webp',
      '/Cloth Gallery/Cihgany (1).webp',
    ],
    title: 'The Fabric of Royalty',
    description: 'Discover premium textiles that define elegance and heritage.',
    tag: 'New Collection',
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
    title: 'Woven Narratives',
    description: 'Every pattern tells a story. Every thread holds a memory.',
    tag: 'Heritage Series',
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
    title: 'Vibrant Expressions',
    description: 'Celebrate culture with bold prints and timeless craftsmanship.',
    tag: 'Limited Edition',
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroCollections.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % heroCollections.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + heroCollections.length) % heroCollections.length);
  };

  const current = heroCollections[currentSlide];

  return (
    <section className="relative h-[80vh] md:h-[90vh] min-h-[600px] mt-20 md:mt-24 overflow-hidden bg-[#0A0A0A]">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0">
        {/* Layer 1: Subtle Texture */}
        <div
          className="absolute inset-0 opacity-20 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${current.images[2]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(100px) saturate(1.5)',
          }}
        />
        {/* Layer 2: Warm Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/40" />
      </div>

      <div className="container mx-auto px-4 h-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between h-full gap-12 py-12">

          {/* Left Side: Content Box (Glassmorphic for visibility) */}
          <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-xl"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6"
                >
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/90">
                    {current.tag}
                  </span>
                </motion.div>

                <h2 className="font-display text-4xl md:text-6xl xl:text-8xl text-white leading-[1.1] mb-8 tracking-tight">
                  {current.title.split(' ').map((word, i) => (
                    <span key={i} className="inline-block mr-3 last:mr-0">
                      {word === 'Royalty' || word === 'Narratives' || word === 'Expressions' ? (
                        <span className="text-primary italic">{word}</span>
                      ) : word}
                    </span>
                  ))}
                </h2>

                <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-12 max-w-md font-medium">
                  {current.description}
                </p>

                <div className="flex flex-wrap gap-5">
                  <Button asChild size="xl" className="group rounded-none bg-primary text-white hover:bg-white hover:text-black transition-all duration-500 px-10">
                    <Link to="/gallery">
                      Explore Gallery
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="xl" asChild className="rounded-none border-white/40 text-white hover:bg-white hover:text-black transition-all duration-500 px-10">
                    <Link to="/gallery">
                      Lookbook
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Pagination Controls */}
            <div className="flex items-center gap-6 mt-16">
              <div className="flex gap-2">
                {heroCollections.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentSlide(i);
                    }}
                    className={`h-1 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-12 bg-primary' : 'w-4 bg-white/20 hover:bg-white/40'
                      }`}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={prevSlide}
                  className="p-2 border border-white/10 rounded-full text-white/40 hover:text-white hover:border-white/30 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-2 border border-white/10 rounded-full text-white/40 hover:text-white hover:border-white/30 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Fabric "Rolls" (Unfurling Animation) */}
          <div className="w-full lg:w-1/2 relative h-[400px] md:h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="flex items-start justify-center gap-2 md:gap-4 h-full pt-12"
              >
                {current.images.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    exit={{ scaleY: 0, opacity: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: idx * 0.1,
                      ease: [0.16, 1, 0.3, 1] // Custom quint ease
                    }}
                    style={{ originY: 0 }}
                    className={`relative w-[60px] md:w-[90px] xl:w-[110px] overflow-hidden rounded-b-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                      ${idx === 0 || idx === 4 ? 'hidden sm:block h-[250px] md:h-[350px] mt-12' :
                        idx === 1 || idx === 3 ? 'h-[300px] md:h-[450px] mt-6' :
                          'h-[350px] md:h-[550px]'}`}
                  >
                    <img
                      src={img}
                      alt="Fabric Detail"
                      className="w-full h-full object-cover"
                    />
                    {/* Fabric shine/weave depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40" />

                    {/* Subtle mouse parallax hint */}
                    <motion.div
                      className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ opacity: 1 }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Dynamic Shadow floor */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
          </div>

        </div>
      </div>

      {/* Side Brand Text (Rotated) */}
      <div className="absolute left-6 bottom-12 hidden xl:block pointer-events-none">
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[1em] transform -rotate-90 origin-left">
          Authentic African Heritage
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
