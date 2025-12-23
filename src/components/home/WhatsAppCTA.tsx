import { motion } from 'framer-motion';
import { MessageCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  'Instant price quotes',
  'Custom yardage orders',
  'Direct from the source',
  'Pay on delivery available',
];

const WhatsAppCTA = () => {
  const whatsappNumber = '2348165715235';
  const message = encodeURIComponent('Hello! I\'m interested in ordering fabrics from IksoTech AfriFabs.');

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
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='2' fill='%23fff'/%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-primary-foreground mb-4">
                Ready to Order?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-6">
                Skip the checkout hassle. Send your order directly to our
                WhatsApp for personalized service and the best deals.
              </p>

              {/* Benefits */}
              <ul className="space-y-2 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-center gap-3 text-primary-foreground/90"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                    {benefit}
                  </motion.li>
                ))}
              </ul>

              <Button
                variant="whatsapp"
                size="xl"
                onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')}
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </Button>
            </div>

            {/* Right - Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative">
                <div className="w-64 h-64 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <MessageCircle className="w-16 h-16 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute top-0 right-0 bg-primary-foreground text-primary px-3 py-1 rounded-full text-sm font-medium"
                >
                  Online now
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatsAppCTA;
