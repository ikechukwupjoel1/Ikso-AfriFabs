-- =====================================================
-- STEP 1: Create Tables
-- Run this FIRST in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Fabrics table (core product catalog)
CREATE TABLE IF NOT EXISTS fabrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  description TEXT,
  price_ngn NUMERIC NOT NULL,
  price_cfa NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT CHECK (category IN ('ankara', 'kente', 'adire', 'aso-oke')),
  in_stock BOOLEAN DEFAULT true,
  yardage NUMERIC DEFAULT 6,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Fabric images (multiple images per fabric)
CREATE TABLE IF NOT EXISTS fabric_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fabric_id UUID REFERENCES fabrics(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  preferred_currency TEXT DEFAULT 'NGN',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Saved designs (user's 3D studio creations)
CREATE TABLE IF NOT EXISTS saved_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fabric_id UUID REFERENCES fabrics(id) ON DELETE SET NULL,
  model_type TEXT CHECK (model_type IN ('dress', 'shirt', 'cushion', 'tote')),
  texture_scale NUMERIC DEFAULT 2,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Cart items (shopping cart)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  fabric_id UUID REFERENCES fabrics(id) ON DELETE CASCADE,
  yardage NUMERIC NOT NULL,
  design_id UUID REFERENCES saved_designs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  total_ngn NUMERIC,
  total_cfa NUMERIC,
  currency TEXT CHECK (currency IN ('NGN', 'CFA')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  fabric_id UUID REFERENCES fabrics(id) ON DELETE SET NULL,
  yardage NUMERIC NOT NULL,
  price_per_unit NUMERIC NOT NULL,
  design_id UUID REFERENCES saved_designs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Favorites/Wishlist
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fabric_id UUID REFERENCES fabrics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, fabric_id)
);
