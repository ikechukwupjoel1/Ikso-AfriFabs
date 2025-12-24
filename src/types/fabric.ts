export interface FabricStory {
  origin: string;       // "Benin", "Ghana", "Nigeria"
  heritage: string;     // Cultural background
  symbolism: string;    // Pattern meanings
  occasions: string[];  // When to wear
}

export interface Fabric {
  id: string;
  name: string;
  brand: string;
  collection: string;   // Collection name for grouping similar products
  description: string;
  story?: FabricStory;  // Cultural story
  priceCFA: number;     // Base price in CFA per piece (6 yards)
  image: string;        // Primary image
  gallery?: string[];   // Additional images
  category: 'ankara' | 'kente' | 'adire' | 'aso-oke';
  inStock: boolean;
  tags: string[];
}

export interface ModelType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface SavedDesign {
  id: string;
  fabricId: string;
  modelType: string;
  scale: number;
  createdAt: Date;
  thumbnail?: string;
}

export type Currency = 'NGN' | 'CFA';

export interface CartItem {
  fabricId: string;
  yardage: number;
  designId?: string;
}
