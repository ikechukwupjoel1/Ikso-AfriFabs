import { Fabric } from '@/types/fabric';

import ankaraOrangeTeal from '@/assets/fabrics/ankara-orange-teal.jpg';
import ankaraBurgundyGold from '@/assets/fabrics/ankara-burgundy-gold.jpg';
import ankaraBlueYellow from '@/assets/fabrics/ankara-blue-yellow.jpg';
import ankaraGreenPurple from '@/assets/fabrics/ankara-green-purple.jpg';

export const fabrics: Fabric[] = [
  {
    id: 'fab-001',
    name: 'Super Ruvuma Geometric',
    brand: 'Super Ruvuma',
    description: 'Premium wax print with intricate geometric patterns in vibrant orange and teal. Perfect for statement pieces and traditional Agbada.',
    priceNGN: 8500,
    priceCFA: 7500,
    image: ankaraOrangeTeal,
    category: 'ankara',
    inStock: true,
    yardage: 6,
    tags: ['geometric', 'bold', 'traditional', 'wedding'],
  },
  {
    id: 'fab-002',
    name: 'Mwunva Royal Swirl',
    brand: 'Super Mwunva',
    description: 'Luxurious burgundy and gold swirl pattern with premium wax finish. A timeless choice for royalty and special occasions.',
    priceNGN: 12000,
    priceCFA: 10500,
    image: ankaraBurgundyGold,
    category: 'ankara',
    inStock: true,
    yardage: 6,
    tags: ['luxury', 'wedding', 'celebration', 'gold'],
  },
  {
    id: 'fab-003',
    name: 'Soleil Medallion',
    brand: 'Vlisco',
    description: 'Royal blue fabric featuring stunning golden sunburst medallions. A contemporary classic that commands attention.',
    priceNGN: 15000,
    priceCFA: 13000,
    image: ankaraBlueYellow,
    category: 'ankara',
    inStock: true,
    yardage: 6,
    tags: ['contemporary', 'bold', 'celebration', 'luxury'],
  },
  {
    id: 'fab-004',
    name: 'Forest Botanical',
    brand: 'Woodin',
    description: 'Fresh emerald green with purple botanical accents. Perfect for modern interpretations of traditional styles.',
    priceNGN: 9500,
    priceCFA: 8300,
    image: ankaraGreenPurple,
    category: 'ankara',
    inStock: true,
    yardage: 6,
    tags: ['nature', 'modern', 'casual', 'everyday'],
  },
];

export const modelTypes = [
  {
    id: 'dress',
    name: 'Dress Form',
    icon: '👗',
    description: 'Classic dress mannequin',
  },
  {
    id: 'shirt',
    name: 'Shirt',
    icon: '👔',
    description: 'Men\'s shirt form',
  },
  {
    id: 'cushion',
    name: 'Cushion',
    icon: '🛋️',
    description: 'Home decor pillow',
  },
  {
    id: 'tote',
    name: 'Tote Bag',
    icon: '👜',
    description: 'Fashion tote bag',
  },
];

export const formatPrice = (amount: number, currency: 'NGN' | 'CFA'): string => {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString()}`;
  }
  return `${amount.toLocaleString()} CFA`;
};
