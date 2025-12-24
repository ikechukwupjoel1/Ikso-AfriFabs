-- =====================================================
-- STEP 004: Fabric Categories & Enhanced Management
-- Run this in Supabase SQL Editor
-- =====================================================

-- ============================================
-- SECTION 1: Create fabric_categories table
-- ============================================

CREATE TABLE IF NOT EXISTS fabric_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SECTION 2: Seed initial categories
-- ============================================

INSERT INTO fabric_categories (name, slug, description, display_order) VALUES
  ('Ankara', 'ankara', 'Vibrant African wax prints with bold patterns', 1),
  ('Kente', 'kente', 'Traditional Ghanaian woven cloth with symbolic patterns', 2),
  ('Adire', 'adire', 'Nigerian tie-dye indigo fabric', 3),
  ('Aso-Oke', 'aso-oke', 'Hand-woven cloth from Yoruba people', 4),
  ('Dashiki', 'dashiki', 'Colorful garment fabric with ornate embroidery', 5),
  ('Mudcloth', 'mudcloth', 'Malian cotton fabric dyed with fermented mud', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SECTION 3: Update fabrics table structure
-- ============================================

-- Add new columns to fabrics table
ALTER TABLE fabrics 
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES fabric_categories(id),
  ADD COLUMN IF NOT EXISTS collection TEXT,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- Migrate existing category data to category_id
-- Map old category enum values to new category_id
UPDATE fabrics f
SET category_id = fc.id
FROM fabric_categories fc
WHERE f.category = fc.slug;

-- Drop old category column constraint (if it exists)
ALTER TABLE fabrics DROP CONSTRAINT IF EXISTS fabrics_category_check;

-- Make category_id required for new entries
-- (Don't add NOT NULL yet to allow existing data)

-- ============================================
-- SECTION 4: Create Supabase Storage bucket
-- ============================================

-- Create public bucket for fabric images
INSERT INTO storage.buckets (id, name, public)
VALUES ('fabric-images', 'fabric-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SECTION 5: Storage RLS Policies
-- ============================================

-- Allow admins to upload images
CREATE POLICY "Admins can upload fabric images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fabric-images' AND
  is_admin_by_email()
);

-- Allow admins to update images
CREATE POLICY "Admins can update fabric images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'fabric-images' AND is_admin_by_email());

-- Allow admins to delete images
CREATE POLICY "Admins can delete fabric images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'fabric-images' AND is_admin_by_email());

-- Allow anyone to view images (public bucket)
CREATE POLICY "Anyone can view fabric images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'fabric-images');

-- ============================================
-- SECTION 6: RLS Policies for fabric_categories
-- ============================================

-- Enable RLS
ALTER TABLE fabric_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
ON fabric_categories FOR SELECT
TO public
USING (is_active = true);

-- Admins can view all categories
CREATE POLICY "Admins can view all categories"
ON fabric_categories FOR SELECT
TO authenticated
USING (is_admin_by_email());

-- Super admins and product managers can manage categories
CREATE POLICY "Admins can insert categories"
ON fabric_categories FOR INSERT
TO authenticated
WITH CHECK (is_admin_by_email());

CREATE POLICY "Admins can update categories"
ON fabric_categories FOR UPDATE
TO authenticated
USING (is_admin_by_email());

CREATE POLICY "Admins can delete categories"
ON fabric_categories FOR DELETE
TO authenticated
USING (is_admin_by_email());

-- ============================================
-- SECTION 7: Update fabrics RLS policies
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view fabrics" ON fabrics;
DROP POLICY IF EXISTS "Admins can insert fabrics" ON fabrics;
DROP POLICY IF EXISTS "Admins can update fabrics" ON fabrics;
DROP POLICY IF EXISTS "Admins can delete fabrics" ON fabrics;

-- Enable RLS on fabrics
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;

-- Anyone can view in-stock fabrics
CREATE POLICY "Anyone can view in-stock fabrics"
ON fabrics FOR SELECT
TO public
USING (in_stock = true);

-- Admins can view all fabrics
CREATE POLICY "Admins can view all fabrics"
ON fabrics FOR SELECT
TO authenticated
USING (is_admin_by_email());

-- Admins can insert fabrics
CREATE POLICY "Admins can insert fabrics"
ON fabrics FOR INSERT
TO authenticated
WITH CHECK (is_admin_by_email());

-- Admins can update fabrics
CREATE POLICY "Admins can update fabrics"
ON fabrics FOR UPDATE
TO authenticated
USING (is_admin_by_email());

-- Admins can delete fabrics
CREATE POLICY "Admins can delete fabrics"
ON fabrics FOR DELETE
TO authenticated
USING (is_admin_by_email());

-- ============================================
-- SECTION 8: Helper function for SKU generation
-- ============================================

CREATE OR REPLACE FUNCTION generate_fabric_sku()
RETURNS TEXT AS $$
DECLARE
  new_sku TEXT;
  sku_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate SKU: FAB-YYYYMMDD-XXXX (random 4 digits)
    new_sku := 'FAB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if SKU already exists
    SELECT EXISTS(SELECT 1 FROM fabrics WHERE sku = new_sku) INTO sku_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT sku_exists;
  END LOOP;
  
  RETURN new_sku;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SECTION 9: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_fabrics_category_id ON fabrics(category_id);
CREATE INDEX IF NOT EXISTS idx_fabrics_featured ON fabrics(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_fabrics_in_stock ON fabrics(in_stock) WHERE in_stock = true;
CREATE INDEX IF NOT EXISTS idx_fabric_categories_slug ON fabric_categories(slug);
CREATE INDEX IF NOT EXISTS idx_fabric_images_fabric_id ON fabric_images(fabric_id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check categories
-- SELECT * FROM fabric_categories ORDER BY display_order;

-- Check fabrics with categories
-- SELECT f.name, f.sku, fc.name as category, f.price_cfa, f.in_stock
-- FROM fabrics f
-- LEFT JOIN fabric_categories fc ON f.category_id = fc.id;

-- Check storage bucket
-- SELECT * FROM storage.buckets WHERE id = 'fabric-images';
