-- =====================================================
-- STEP 4: Seed Sample Data (OPTIONAL)
-- Run this after Steps 1-3 to populate with initial fabrics
-- =====================================================

-- Note: Replace image URLs with your actual Supabase Storage URLs
-- after uploading images to the fabric-images bucket

INSERT INTO fabrics (name, brand, description, price_ngn, price_cfa, image_url, category, in_stock, yardage, tags)
VALUES
  (
    'Super Ruvuma Geometric',
    'Super Ruvuma',
    'Premium wax print with intricate geometric patterns in vibrant orange and teal. Perfect for statement pieces and traditional Agbada.',
    8500,
    7500,
    'https://majjawvqcceuekfcqfrm.supabase.co/storage/v1/object/public/fabric-images/ankara/ankara-orange-teal.jpg',
    'ankara',
    true,
    6,
    ARRAY['geometric', 'bold', 'traditional', 'wedding']
  ),
  (
    'Mwunva Royal Swirl',
    'Super Mwunva',
    'Luxurious burgundy and gold swirl pattern with premium wax finish. A timeless choice for royalty and special occasions.',
    12000,
    10500,
    'https://majjawvqcceuekfcqfrm.supabase.co/storage/v1/object/public/fabric-images/ankara/ankara-burgundy-gold.jpg',
    'ankara',
    true,
    6,
    ARRAY['luxury', 'wedding', 'celebration', 'gold']
  ),
  (
    'Soleil Medallion',
    'Vlisco',
    'Royal blue fabric featuring stunning golden sunburst medallions. A contemporary classic that commands attention.',
    15000,
    13000,
    'https://majjawvqcceuekfcqfrm.supabase.co/storage/v1/object/public/fabric-images/ankara/ankara-blue-yellow.jpg',
    'ankara',
    true,
    6,
    ARRAY['contemporary', 'bold', 'celebration', 'luxury']
  ),
  (
    'Forest Botanical',
    'Woodin',
    'Fresh emerald green with purple botanical accents. Perfect for modern interpretations of traditional styles.',
    9500,
    8300,
    'https://majjawvqcceuekfcqfrm.supabase.co/storage/v1/object/public/fabric-images/ankara/ankara-green-purple.jpg',
    'ankara',
    true,
    6,
    ARRAY['nature', 'modern', 'casual', 'everyday']
  );

-- Verify inserted data
SELECT id, name, brand, category, price_ngn 
FROM fabrics 
ORDER BY created_at;
