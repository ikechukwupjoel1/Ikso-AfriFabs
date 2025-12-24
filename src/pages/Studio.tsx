import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PresentationControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Camera, RotateCcw, ShoppingCart, Share2, Sliders } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import * as THREE from 'three';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { modelTypes } from '@/data/fabrics';
import { calculatePrice, formatPrice } from '@/lib/currency';
import { useCurrency } from '@/hooks/useCurrency';
import { useFabrics } from '@/hooks/useFabrics';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { Fabric } from '@/types/fabric';
import { cn } from '@/lib/utils';

// 3D Mannequin Component with fabric texture
const Mannequin = ({ fabricImage, scale }: { fabricImage: string; scale: number }) => {
  const textureRef = useRef<THREE.Texture | null>(null);

  // Load texture
  const texture = new THREE.TextureLoader().load(fabricImage);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(scale, scale);
  textureRef.current = texture;

  return (
    <group>
      {/* Dress Form / Mannequin Body */}
      <mesh position={[0, 0.5, 0]}>
        {/* Torso */}
        <cylinderGeometry args={[0.4, 0.5, 1.2, 32]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Waist */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.4, 32]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Skirt */}
      <mesh position={[0, -0.8, 0]}>
        <coneGeometry args={[0.7, 1.2, 32]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.6}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.3, 16]} />
        <meshStandardMaterial color="#8B7355" roughness={0.8} />
      </mesh>

      {/* Stand */}
      <mesh position={[0, -1.6, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -1.9, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.1, 32]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

// Cushion 3D Component
const Cushion = ({ fabricImage, scale }: { fabricImage: string; scale: number }) => {
  const texture = new THREE.TextureLoader().load(fabricImage);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(scale * 0.5, scale * 0.5);

  return (
    <mesh position={[0, 0, 0]} rotation={[-0.2, 0.3, 0]}>
      <boxGeometry args={[1.2, 0.3, 1.2]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.7}
        bumpScale={0.02}
      />
    </mesh>
  );
};

// Loading component
const LoadingSpinner = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-card">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

const StudioPage = () => {
  const [searchParams] = useSearchParams();
  const fabricId = searchParams.get('fabric');

  const { currency, toggleCurrency } = useCurrency();
  const { data: fetchedFabrics = [], isLoading, error } = useFabrics();

  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [selectedModel, setSelectedModel] = useState(modelTypes[0].id);
  const [textureScale, setTextureScale] = useState(2);
  const [pieces, setPieces] = useState(1); // 1 piece = 6 yards
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize selected fabric when data loads
  useEffect(() => {
    if (fetchedFabrics.length > 0 && !selectedFabric) {
      const found = fetchedFabrics.find(f => f.id === fabricId) || fetchedFabrics[0];
      setSelectedFabric(found);
    }
  }, [fetchedFabrics, fabricId, selectedFabric]);

  const handleCapture = () => {
    // In a real app, this would capture the 3D view
    alert('Screenshot saved to My Designs!');
  };

  const handleWhatsAppOrder = () => {
    if (!selectedFabric) return;

    const { rate } = useExchangeRate();
    const price = calculatePrice(selectedFabric.priceCFA, currency, rate);
    const message = encodeURIComponent(
      `Hi! I'd like to order:\n\n` +
      `Fabric: ${selectedFabric.name}\n` +
      `Brand: ${selectedFabric.brand}\n` +
      `Quantity: ${pieces} piece${pieces > 1 ? 's' : ''} (${pieces * 6} yards)\n` +
      `Total: ${formatPrice(price * pieces, currency)}\n\n` +
      `Please confirm availability!`
    );
    window.open(`https://wa.me/2348165715235?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Loading Studio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Failed to load studio resources.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedFabric) return null; // Should settle quickly after loading

  return (
    <div className="min-h-screen bg-gradient-studio">
      <Header currency={currency} onToggleCurrency={toggleCurrency} />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl mb-2">The Studio</h1>
            <p className="text-muted-foreground">Visualize your fabric on different styles</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* 3D Viewer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-2"
            >
              <div className="relative aspect-square md:aspect-[4/3] rounded-3xl bg-card shadow-elevated overflow-hidden">
                <Suspense fallback={<LoadingSpinner />}>
                  <Canvas
                    ref={canvasRef}
                    camera={{ position: [0, 0, 4], fov: 45 }}
                    gl={{ preserveDrawingBuffer: true }}
                  >
                    <ambientLight intensity={0.5} />
                    <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={1} castShadow />
                    <spotLight position={[-5, 5, 5]} angle={0.3} penumbra={1} intensity={0.5} />

                    <PresentationControls
                      global
                      rotation={[0.13, 0.1, 0]}
                      polar={[-0.4, 0.2]}
                      azimuth={[-1, 0.75]}
                      config={{ mass: 2, tension: 400 }}
                      snap={{ mass: 4, tension: 400 }}
                    >
                      {selectedModel === 'cushion' ? (
                        <Cushion fabricImage={selectedFabric.image} scale={textureScale} />
                      ) : (
                        <Mannequin fabricImage={selectedFabric.image} scale={textureScale} />
                      )}
                    </PresentationControls>

                    <ContactShadows position={[0, -1.9, 0]} opacity={0.4} scale={5} blur={2.5} />
                    <Environment preset="studio" />
                    <OrbitControls
                      enableZoom={true}
                      enablePan={false}
                      minDistance={2}
                      maxDistance={8}
                      minPolarAngle={Math.PI / 4}
                      maxPolarAngle={Math.PI / 1.5}
                    />
                  </Canvas>
                </Suspense>

                {/* Control Overlay */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button variant="studio" size="icon" onClick={handleCapture}>
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button variant="studio" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Model Selector */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
                  {modelTypes.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all",
                        selectedModel === model.id
                          ? "bg-primary text-primary-foreground shadow-elevated"
                          : "bg-background/90 backdrop-blur-sm hover:bg-background shadow-soft"
                      )}
                      title={model.name}
                    >
                      {model.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scale Slider */}
              <div className="mt-4 p-4 bg-card rounded-2xl shadow-soft">
                <div className="flex items-center gap-4">
                  <Sliders className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Pattern Scale</span>
                  <Slider
                    value={[textureScale]}
                    onValueChange={(v) => setTextureScale(v[0])}
                    min={0.5}
                    max={5}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">{textureScale.toFixed(1)}x</span>
                </div>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Selected Fabric */}
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h2 className="font-display text-xl mb-4">Selected Fabric</h2>
                <div className="flex gap-4 mb-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shadow-soft">
                    <img
                      src={selectedFabric.image}
                      alt={selectedFabric.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{selectedFabric.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedFabric.brand}</p>
                    <p className="text-primary font-semibold mt-1">
                      {formatPrice(
                        calculatePrice(selectedFabric.priceCFA, currency, rate),
                        currency
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fabric Selection */}
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h2 className="font-display text-xl mb-4">Change Fabric</h2>
                <div className="grid grid-cols-4 gap-2">
                  {fetchedFabrics.map((fabric) => (
                    <button
                      key={fabric.id}
                      onClick={() => setSelectedFabric(fabric)}
                      className={cn(
                        "aspect-square rounded-xl overflow-hidden border-2 transition-all",
                        selectedFabric.id === fabric.id
                          ? "border-primary shadow-elevated"
                          : "border-transparent hover:border-primary/30"
                      )}
                    >
                      <img
                        src={fabric.image}
                        alt={fabric.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Section */}
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h2 className="font-display text-xl mb-4">Order</h2>

                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-2 block">Yardage</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPieces(Math.max(1, pieces - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-semibold text-lg w-16 text-center">{pieces} pc{pieces > 1 ? 's' : ''}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPieces(pieces + 1)}
                    >
                      +
                    </Button>
                    <span className="text-sm text-muted-foreground">yards</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-display text-2xl text-primary">
                      {formatPrice(
                        calculatePrice(selectedFabric.priceCFA, currency, rate) * pieces,
                        currency
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button variant="whatsapp" className="w-full" onClick={handleWhatsAppOrder}>
                    <ShoppingCart className="w-4 h-4" />
                    Order via WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full">
                    Add to Cart
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudioPage;
