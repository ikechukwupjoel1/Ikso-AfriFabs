-- =====================================================
-- MIGRATION: Hero Collections for Homepage
-- Run this in Supabase SQL Editor
-- =====================================================

-- ============================================
-- SECTION 1: Create hero_collections table
-- ============================================

CREATE TABLE IF NOT EXISTS hero_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tag TEXT, -- e.g., "New Collection", "Limited Edition"
  fabric_ids TEXT[] NOT NULL, -- Array of 5 fabric IDs for rollup display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SECTION 2: Seed initial hero collections
-- ============================================

-- We'll add sample data using existing fabric IDs
-- Note: Replace these with actual fabric IDs from your database
INSERT INTO hero_collections (title, description, tag, fabric_ids, display_order) VALUES
  (
    'The Fabric of Royalty',
    'Discover premium textiles that define elegance and heritage.',
    'New Collection',
    ARRAY[]::TEXT[], -- Will be populated via admin panel
    1
  ),
  (
    'Woven Narratives',
    'Every pattern tells a story. Every thread holds a memory.',
    'Heritage Series',
    ARRAY[]::TEXT[],
    2
  ),
  (
    'Vibrant Expressions',
    'Celebrate culture with bold prints and timeless craftsmanship.',
    'Limited Edition',
    ARRAY[]::TEXT[],
    3
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- SECTION 3: RLS Policies for hero_collections
-- ============================================

-- Enable RLS
ALTER TABLE hero_collections ENABLE ROW LEVEL SECURITY;

-- Anyone can view active hero collections
CREATE POLICY "Anyone can view active hero collections"
ON hero_collections FOR SELECT
TO public
USING (is_active = true);

-- Admins can view all hero collections
CREATE POLICY "Admins can view all hero collections"
ON hero_collections FOR SELECT
TO authenticated
USING (is_admin_by_email());

-- Admins can manage hero collections
CREATE POLICY "Admins can insert hero collections"
ON hero_collections FOR INSERT
TO authenticated
WITH CHECK (is_admin_by_email());

CREATE POLICY "Admins can update hero collections"
ON hero_collections FOR UPDATE
TO authenticated
USING (is_admin_by_email());

CREATE POLICY "Admins can delete hero collections"
ON hero_collections FOR DELETE
TO authenticated
USING (is_admin_by_email());

-- ============================================
-- SECTION 4: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_hero_collections_active ON hero_collections(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_hero_collections_order ON hero_collections(display_order);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check hero collections
-- SELECT * FROM hero_collections ORDER BY display_order;

-- Check fabric IDs for a collection
-- SELECT title, array_length(fabric_ids, 1) as fabric_count
-- FROM hero_collections;
