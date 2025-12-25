-- =====================================================
-- STEP 007: Add 24 More Fabrics (Final Batch)
-- Run this in Supabase SQL Editor AFTER 006_add_30_more_fabrics.sql
-- This will bring your total to 63+ fabrics
-- =====================================================

DO $$
DECLARE
  ankara_id UUID;
  kente_id UUID;
  adire_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO ankara_id FROM fabric_categories WHERE slug = 'ankara';
  SELECT id INTO kente_id FROM fabric_categories WHERE slug = 'kente';
  SELECT id INTO adire_id FROM fabric_categories WHERE slug = 'adire';

  -- Egnonhou Chigan Collection
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Egnonhou Chigan Premium', 'Egnonhou Chigan', ankara_id, 'Egnonhou Chigan', 'Premium Beninese fabric with traditional guild patterns.', 24000, 16000, '/Cloth Gallery/Egnonhou Chigan (1).webp', true, 6, ARRAY['premium', 'benin', 'traditional'], 80);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Egnonhou Chigan Royal', 'Egnonhou Chigan', ankara_id, 'Egnonhou Chigan', 'Royal patterns from Benin heritage.', 24000, 16000, '/Cloth Gallery/Egnonhou Chigan (2).webp', true, 6, ARRAY['royal', 'heritage'], 80);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Egnonhou Chigan Heritage', 'Egnonhou Chigan', ankara_id, 'Egnonhou Chigan', 'Heritage collection celebrating Beninese artistry.', 24000, 16000, '/Cloth Gallery/Egnonhou Chigan (3).webp', true, 6, ARRAY['heritage', 'artistry'], 80);

  -- FABULOUS DYNASTY Collection
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Fabulous Dynasty Royal', 'FABULOUS DYNASTY', ankara_id, 'FABULOUS DYNASTY', 'Royal patterns inspired by African kingdoms.', 21000, 14000, '/Cloth Gallery/FABULOUS DYNASTY (1).webp', true, 6, ARRAY['royal', 'kingdom', 'dynasty'], 95);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Fabulous Dynasty Imperial', 'FABULOUS DYNASTY', ankara_id, 'FABULOUS DYNASTY', 'Imperial designs from ancient African empires.', 21000, 14000, '/Cloth Gallery/FABULOUS DYNASTY (2).webp', true, 6, ARRAY['imperial', 'empire'], 95);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Fabulous Dynasty Regal', 'FABULOUS DYNASTY', ankara_id, 'FABULOUS DYNASTY', 'Regal collection for leadership celebrations.', 21000, 14000, '/Cloth Gallery/FABULOUS DYNASTY (3).webp', true, 6, ARRAY['regal', 'leadership'], 95);

  -- Antiquity Wax Collection
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Antiquity Wax Classic', 'Antiquity Wax', ankara_id, 'Antiquity Wax', 'Classic wax print with timeless appeal.', 15000, 10000, '/Cloth Gallery/Antiquity Wax (1).webp', true, 6, ARRAY['classic', 'timeless'], 110);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Antiquity Wax Traditional', 'Antiquity Wax', ankara_id, 'Antiquity Wax', 'Traditional patterns for everyday elegance.', 15000, 10000, '/Cloth Gallery/Antiquity Wax (2).webp', true, 6, ARRAY['traditional', 'everyday'], 110);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Antiquity Wax Heritage', 'Antiquity Wax', ankara_id, 'Antiquity Wax', 'Heritage designs celebrating African culture.', 15000, 10000, '/Cloth Gallery/Antiquity Wax (3).webp', true, 6, ARRAY['heritage', 'cultural'], 110);

  -- Artist Wax Collection
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Artist Wax Creative', 'Artist Wax', ankara_id, 'Artist Wax', 'Creative patterns for artistic expression.', 16500, 11000, '/Cloth Gallery/Artist Wax (1).webp', true, 6, ARRAY['creative', 'artistic'], 105);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Artist Wax Expressive', 'Artist Wax', ankara_id, 'Artist Wax', 'Expressive designs with bold colors.', 16500, 11000, '/Cloth Gallery/Artist Wax (2).webp', true, 6, ARRAY['expressive', 'bold'], 105);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Artist Wax Vibrant', 'Artist Wax', ankara_id, 'Artist Wax', 'Vibrant artistic patterns.', 16500, 11000, '/Cloth Gallery/Artist Wax (3).webp', true, 6, ARRAY['vibrant', 'artistic'], 105);

  -- Super Wax Collection
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Super Wax Premium', 'Super Wax', ankara_id, 'Super Wax', 'Premium wax print for all occasions.', 15000, 10000, '/Cloth Gallery/Super Wax (1).webp', true, 6, ARRAY['premium', 'versatile'], 115);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Super Wax Classic', 'Super Wax', ankara_id, 'Super Wax', 'Classic super wax designs.', 15000, 10000, '/Cloth Gallery/Super Wax (2).webp', true, 6, ARRAY['classic', 'traditional'], 115);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Super Wax Elegant', 'Super Wax', ankara_id, 'Super Wax', 'Elegant patterns for special events.', 15000, 10000, '/Cloth Gallery/Super Wax (3).webp', true, 6, ARRAY['elegant', 'special'], 115);

  -- Hitarget Collection
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Hitarget Modern', 'Hitarget', ankara_id, 'Hitarget', 'Modern geometric patterns for urban style.', 12000, 8000, '/Cloth Gallery/Hitarget (1).webp', true, 6, ARRAY['modern', 'urban', 'geometric'], 125);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Hitarget Contemporary', 'Hitarget', ankara_id, 'Hitarget', 'Contemporary designs for young professionals.', 12000, 8000, '/Cloth Gallery/Hitarget (2).webp', true, 6, ARRAY['contemporary', 'professional'], 125);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Hitarget Urban', 'Hitarget', ankara_id, 'Hitarget', 'Urban patterns with clean lines.', 12000, 8000, '/Cloth Gallery/Hitarget (3).webp', true, 6, ARRAY['urban', 'modern'], 125);

  -- U & JB Collection
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('U & JB Unity', 'U & JB', ankara_id, 'U & JB', 'Unity patterns celebrating collaboration.', 13500, 9000, '/Cloth Gallery/U & JB (1).webp', true, 6, ARRAY['unity', 'collaboration'], 120);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('U & JB Partnership', 'U & JB', ankara_id, 'U & JB', 'Partnership designs for team events.', 13500, 9000, '/Cloth Gallery/U & JB (2).webp', true, 6, ARRAY['partnership', 'team'], 120);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('U & JB Harmony', 'U & JB', ankara_id, 'U & JB', 'Harmonious patterns representing togetherness.', 13500, 9000, '/Cloth Gallery/U & JB (3).webp', true, 6, ARRAY['harmony', 'togetherness'], 120);

  -- Velldam Collection
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Velldam Minimalist', 'Velldam', ankara_id, 'Velldam', 'Minimalist elegance with refined patterns.', 14250, 9500, '/Cloth Gallery/Velldam (1).webp', true, 6, ARRAY['minimalist', 'elegant', 'refined'], 118);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Velldam Sophisticated', 'Velldam', ankara_id, 'Velldam', 'Sophisticated designs for professional settings.', 14250, 9500, '/Cloth Gallery/Velldam (2).webp', true, 6, ARRAY['sophisticated', 'professional'], 118);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Velldam Refined', 'Velldam', ankara_id, 'Velldam', 'Refined patterns with understated beauty.', 14250, 9500, '/Cloth Gallery/Velldam (3).webp', true, 6, ARRAY['refined', 'understated'], 118);

  RAISE NOTICE 'Successfully inserted 24 additional fabrics';

END $$;

-- Final verification
SELECT COUNT(*) as total_fabrics FROM fabrics;

-- Show complete breakdown by collection
SELECT 
  collection,
  COUNT(*) as count,
  MIN(price_cfa) as min_price,
  MAX(price_cfa) as max_price,
  AVG(price_cfa) as avg_price
FROM fabrics
WHERE collection IS NOT NULL
GROUP BY collection
ORDER BY avg_price DESC;

-- Show featured fabrics
SELECT name, collection, price_cfa, featured 
FROM fabrics 
WHERE featured = true 
ORDER BY price_cfa DESC;
