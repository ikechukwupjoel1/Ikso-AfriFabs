export interface Fabric {
  id: string;
  name: string;
  brand: string;
  description: string;
  priceCFA: number; // Base price in CFA per piece (6 yards)
  image: string;
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
