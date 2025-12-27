import HeroSection from '@/components/home/HeroSection';
import PromoSection from '@/components/home/PromoSection';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import FeaturedFabrics from '@/components/home/FeaturedFabrics';
import StudioPreview from '@/components/home/StudioPreview';
import WhatsAppCTA from '@/components/home/WhatsAppCTA';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WelcomeModal from '@/components/layout/WelcomeModal';
import { useCurrency } from '@/hooks/useCurrency';

const Index = () => {
  const { currency, toggleCurrency, country, setCurrency } = useCurrency();

  return (
    <div className="min-h-screen bg-background">
      <Header currency={currency} onToggleCurrency={toggleCurrency} country={country} />

      {/* Welcome popup for first-time visitors */}
      <WelcomeModal
        onSelectCurrency={setCurrency}
        detectedCountry={country}
        detectedCurrency={currency}
      />

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
