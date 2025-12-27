import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Sparkles } from 'lucide-react';
import { useState } from 'react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrency } from '@/hooks/useCurrency';

const Studio = () => {
  const { currency, toggleCurrency, country } = useCurrency();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In production, this would send to your backend
      console.log('Notify email:', email);
      setSubscribed(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currency={currency} onToggleCurrency={toggleCurrency} country={country} />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="max-w-2xl mx-auto text-center py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Icon */}
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>

              {/* Title */}
              <h1 className="font-display text-4xl md:text-5xl mb-4">
                3D Studio
              </h1>
              <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                Coming Soon
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Experience our fabrics in stunning 3D. Visualize how each pattern drapes
                on different garment styles before you buy.
              </p>

              {/* Features Preview */}
              <div className="grid md:grid-cols-3 gap-4 mb-12">
                <div className="bg-card rounded-xl p-4 text-left">
                  <div className="text-2xl mb-2">👗</div>
                  <h3 className="font-semibold mb-1">Virtual Try-On</h3>
                  <p className="text-sm text-muted-foreground">
                    See fabrics on Agbada, Kaftan, and more
                  </p>
                </div>
                <div className="bg-card rounded-xl p-4 text-left">
                  <div className="text-2xl mb-2">🎨</div>
                  <h3 className="font-semibold mb-1">Pattern Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    Adjust scale and positioning
                  </p>
                </div>
                <div className="bg-card rounded-xl p-4 text-left">
                  <div className="text-2xl mb-2">📸</div>
                  <h3 className="font-semibold mb-1">Save & Share</h3>
                  <p className="text-sm text-muted-foreground">
                    Download your custom designs
                  </p>
                </div>
              </div>

              {/* Notify Form */}
              {!subscribed ? (
                <form onSubmit={handleNotify} className="max-w-sm mx-auto">
                  <p className="text-sm text-muted-foreground mb-3">
                    Get notified when 3D Studio launches:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                      required
                    />
                    <Button type="submit">
                      <Bell className="w-4 h-4 mr-2" />
                      Notify Me
                    </Button>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/10 text-green-600 px-6 py-4 rounded-xl"
                >
                  <p className="font-medium">🎉 You're on the list!</p>
                  <p className="text-sm">We'll notify you when 3D Studio is ready.</p>
                </motion.div>
              )}

              {/* Browse fabrics CTA */}
              <div className="mt-12">
                <p className="text-muted-foreground mb-4">
                  In the meantime, explore our collection:
                </p>
                <Button asChild size="lg" variant="outline">
                  <Link to="/gallery">Browse Fabrics</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Studio;
