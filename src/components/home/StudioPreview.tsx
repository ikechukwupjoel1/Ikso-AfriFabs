import { motion } from 'framer-motion';
import { ArrowRight, Rotate3D, ZoomIn, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Rotate3D,
    title: '360° View',
    description: 'Rotate and inspect fabric from every angle',
  },
  {
    icon: ZoomIn,
    title: 'Texture Detail',
    description: 'Zoom in to see weave and wax finish',
  },
  {
    icon: Palette,
    title: 'Style Preview',
    description: 'Apply fabric to different garment styles',
  },
];

const StudioPreview = () => {
  return (
    <section className="py-20 bg-gradient-studio">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Preview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-square rounded-3xl bg-card shadow-elevated overflow-hidden">
              {/* Simulated 3D Studio UI */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary via-card to-muted">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-hero opacity-20 animate-pulse" />
                  <div className="font-display text-xl text-muted-foreground">3D Studio</div>
                  <div className="text-sm text-muted-foreground">Interactive Preview</div>
                </div>
              </div>

              {/* Control Hints */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
                {['👗', '👔', '🛋️', '👜'].map((emoji, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="w-12 h-12 rounded-xl bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-soft text-xl"
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Decorative */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full bg-primary/5 blur-3xl" />
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary font-medium mb-2">The Studio</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-6">
              See It Before
              <span className="block text-gradient-primary">You Buy It</span>
            </h2>

            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Our Advanced Drapery Engine lets you visualize exactly how your fabric 
              will look as a finished garment. No more guessing, no more returns.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button variant="hero" size="lg" asChild>
              <Link to="/studio">
                Enter the Studio
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StudioPreview;
