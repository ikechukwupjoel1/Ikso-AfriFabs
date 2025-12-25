-- =====================================================
-- STEP 005: Seed All Fabrics from Local Data
-- Run this in Supabase SQL Editor AFTER 004_fabric_categories.sql
-- This populates the database with sample fabrics
-- =====================================================

DO $$
DECLARE
  ankara_id UUID;
  kente_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO ankara_id FROM fabric_categories WHERE slug = 'ankara';
  SELECT id INTO kente_id FROM fabric_categories WHERE slug = 'kente';

  -- Insert fabrics (using UUID generation)
  
  -- 1. Super Gandaho Premium
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity, featured)
  VALUES ('Super Gandaho Premium', 'Super Gandaho', ankara_id, 'Super Gandaho', 'Premium wax print with intricate patterns. Perfect for statement pieces and traditional occasions.', 22500, 15000, '/Cloth Gallery/Super Gandaho (1).webp', true, 6, ARRAY['premium', 'traditional', 'wedding', 'celebration'], 100, true);

  -- 2. Kente Gold Royal
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity, featured)
  VALUES ('Kente Gold Royal', 'Kente Gold', kente_id, 'Kente Gold', 'Authentic Ghanaian Kente with gold threading. Symbol of royalty and prestige.', 56250, 37500, '/Cloth Gallery/Kente Gold (1).webp', true, 6, ARRAY['royal', 'premium', 'kente', 'gold'], 50, true);

  -- 3. Supreme VIP Satin Luxe
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity, featured)
  VALUES ('Supreme VIP Satin Luxe', 'Supreme VIP Satin', ankara_id, 'Supreme VIP Satin', 'Luxurious satin finish with vibrant African prints. Premium quality for special occasions.', 39750, 26500, '/Cloth Gallery/Supreme VIP Satin (1).webp', true, 6, ARRAY['luxury', 'satin', 'vip', 'premium'], 75, true);

  -- 4. AK Gold Premium
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity, featured)
  VALUES ('AK Gold Premium', 'AK Gold', ankara_id, 'AK Gold', 'Premium Ankara with gold embellishments. Represents prosperity and success.', 33000, 22000, '/Cloth Gallery/AK Gold (1).webp', true, 6, ARRAY['gold', 'premium', 'luxury'], 80, true);

  -- 5. Cihgany Classic
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity, featured)
  VALUES ('Cihgany Classic', 'Cihgany', ankara_id, 'Cihgany', 'Traditional wax print with bold geometric patterns. Perfect for everyday elegance.', 18000, 12000, '/Cloth Gallery/Cihgany (1).webp', true, 6, ARRAY['traditional', 'classic', 'everyday'], 120, true);

  -- 6. Super Gandaho (2)
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity, featured)
  VALUES ('Super Gandaho Elegant', 'Super Gandaho', ankara_id, 'Super Gandaho', 'Elegant wax print with traditional motifs.', 22500, 15000, '/Cloth Gallery/Super Gandaho (2).webp', true, 6, ARRAY['traditional', 'elegant'], 100, false);

  -- 7. Kente Gold (2)
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity, featured)
  VALUES ('Kente Gold Heritage', 'Kente Gold', kente_id, 'Kente Gold', 'Heritage Kente patterns with gold accents.', 56250, 37500, '/Cloth Gallery/Kente Gold (2).webp', true, 6, ARRAY['heritage', 'gold', 'kente'], 50, false);

  -- 8. Supreme VIP Satin (2)
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity, featured)
  VALUES ('Supreme VIP Satin Elite', 'Supreme VIP Satin', ankara_id, 'Supreme VIP Satin', 'Elite satin finish with vibrant colors.', 39750, 26500, '/Cloth Gallery/Supreme VIP Satin (2).webp', true, 6, ARRAY['elite', 'satin', 'vibrant'], 75, false);

  -- 9. AK Gold (2)
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity, featured)
  VALUES ('AK Gold Prestige', 'AK Gold', ankara_id, 'AK Gold', 'Prestige collection with gold threading.', 33000, 22000, '/Cloth Gallery/AK Gold (2).webp', true, 6, ARRAY['prestige', 'gold'], 80, false);

  -- 10. Cihgany (2)
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity, featured)
  VALUES ('Cihgany Traditional', 'Cihgany', ankara_id, 'Cihgany', 'Traditional patterns for everyday wear.', 18000, 12000, '/Cloth Gallery/Cihgany (2).webp', true, 6, ARRAY['traditional', 'everyday'], 120, false);

  RAISE NOTICE 'Successfully inserted 10 sample fabrics';

END $$;

-- Verify the data
SELECT 
  fc.name as category,
  COUNT(*) as count,
  AVG(f.price_cfa) as avg_price
FROM fabrics f
JOIN fabric_categories fc ON f.category_id = fc.id
GROUP BY fc.name;

SELECT COUNT(*) as total_fabrics FROM fabrics;
