import HeroSection from '@/components/home/HeroSection';
import PromoSection from '@/components/home/PromoSection';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import FeaturedFabrics from '@/components/home/FeaturedFabrics';
import StudioPreview from '@/components/home/StudioPreview';
import WhatsAppCTA from '@/components/home/WhatsAppCTA';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCurrency } from '@/hooks/useCurrency';

const Index = () => {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <div className="min-h-screen bg-background">
      <Header currency={currency} onToggleCurrency={toggleCurrency} />
      <main>
        <HeroSection />
        <PromoSection />
        <CategoryShowcase />
        <FeaturedFabrics currency={currency} />
        <WhatsAppCTA />
        <StudioPreview />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
