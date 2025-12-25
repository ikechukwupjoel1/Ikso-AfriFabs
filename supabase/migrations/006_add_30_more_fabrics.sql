-- =====================================================
-- STEP 006: Add 30 More Fabrics
-- Run this in Supabase SQL Editor AFTER 005_seed_fabrics_sample.sql
-- =====================================================

DO $$
DECLARE
  ankara_id UUID;
  kente_id UUID;
  adire_id UUID;
  asooke_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO ankara_id FROM fabric_categories WHERE slug = 'ankara';
  SELECT id INTO kente_id FROM fabric_categories WHERE slug = 'kente';
  SELECT id INTO adire_id FROM fabric_categories WHERE slug = 'adire';
  SELECT id INTO asooke_id FROM fabric_categories WHERE slug = 'aso-oke';

  -- Super Gandaho Collection (3-6)
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Super Gandaho Royal', 'Super Gandaho', ankara_id, 'Super Gandaho', 'Royal wax print with bold patterns.', 22500, 15000, '/Cloth Gallery/Super Gandaho (3).webp', true, 6, ARRAY['royal', 'traditional'], 100);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Super Gandaho Majestic', 'Super Gandaho', ankara_id, 'Super Gandaho', 'Majestic patterns for special occasions.', 22500, 15000, '/Cloth Gallery/Super Gandaho (4).webp', true, 6, ARRAY['majestic', 'celebration'], 100);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Super Gandaho Vibrant', 'Super Gandaho', ankara_id, 'Super Gandaho', 'Vibrant colors and intricate designs.', 22500, 15000, '/Cloth Gallery/Super Gandaho (5).webp', true, 6, ARRAY['vibrant', 'colorful'], 100);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Super Gandaho Classic', 'Super Gandaho', ankara_id, 'Super Gandaho', 'Classic traditional patterns.', 22500, 15000, '/Cloth Gallery/Super Gandaho (6).webp', true, 6, ARRAY['classic', 'traditional'], 100);

  -- Kente Gold Collection (3-6)
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Kente Gold Prestige', 'Kente Gold', kente_id, 'Kente Gold', 'Prestige Kente with golden threads.', 56250, 37500, '/Cloth Gallery/Kente Gold (3).webp', true, 6, ARRAY['prestige', 'gold', 'kente'], 50);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Kente Gold Imperial', 'Kente Gold', kente_id, 'Kente Gold', 'Imperial Kente for royalty.', 56250, 37500, '/Cloth Gallery/Kente Gold (4).webp', true, 6, ARRAY['imperial', 'royal', 'kente'], 50);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Kente Gold Regal', 'Kente Gold', kente_id, 'Kente Gold', 'Regal patterns with gold accents.', 56250, 37500, '/Cloth Gallery/Kente Gold (5).webp', true, 6, ARRAY['regal', 'gold'], 50);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Kente Gold Sovereign', 'Kente Gold', kente_id, 'Kente Gold', 'Sovereign collection with intricate weaving.', 56250, 37500, '/Cloth Gallery/Kente Gold (6).webp', true, 6, ARRAY['sovereign', 'premium'], 50);

  -- Supreme VIP Satin (3-6)
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Supreme VIP Satin Deluxe', 'Supreme VIP Satin', ankara_id, 'Supreme VIP Satin', 'Deluxe satin with premium finish.', 39750, 26500, '/Cloth Gallery/Supreme VIP Satin (3).webp', true, 6, ARRAY['deluxe', 'satin'], 75);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Supreme VIP Satin Opulent', 'Supreme VIP Satin', ankara_id, 'Supreme VIP Satin', 'Opulent designs for VIP occasions.', 39750, 26500, '/Cloth Gallery/Supreme VIP Satin (4).webp', true, 6, ARRAY['opulent', 'vip'], 75);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Supreme VIP Satin Grand', 'Supreme VIP Satin', ankara_id, 'Supreme VIP Satin', 'Grand satin with luxurious feel.', 39750, 26500, '/Cloth Gallery/Supreme VIP Satin (5).webp', true, 6, ARRAY['grand', 'luxury'], 75);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Supreme VIP Satin Exquisite', 'Supreme VIP Satin', ankara_id, 'Supreme VIP Satin', 'Exquisite patterns and colors.', 39750, 26500, '/Cloth Gallery/Supreme VIP Satin (6).webp', true, 6, ARRAY['exquisite', 'premium'], 75);

  -- AK Gold Collection (3-6)
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('AK Gold Elite', 'AK Gold', ankara_id, 'AK Gold', 'Elite collection with gold threading.', 33000, 22000, '/Cloth Gallery/AK Gold (3).webp', true, 6, ARRAY['elite', 'gold'], 80);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('AK Gold Supreme', 'AK Gold', ankara_id, 'AK Gold', 'Supreme quality with golden accents.', 33000, 22000, '/Cloth Gallery/AK Gold (4).webp', true, 6, ARRAY['supreme', 'gold'], 80);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('AK Gold Luxe', 'AK Gold', ankara_id, 'AK Gold', 'Luxe patterns with gold embellishments.', 33000, 22000, '/Cloth Gallery/AK Gold (5).webp', true, 6, ARRAY['luxe', 'premium'], 80);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('AK Gold Magnificent', 'AK Gold', ankara_id, 'AK Gold', 'Magnificent designs for special events.', 33000, 22000, '/Cloth Gallery/AK Gold (6).webp', true, 6, ARRAY['magnificent', 'celebration'], 80);

  -- Cihgany Collection (3-6)
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Cihgany Heritage', 'Cihgany', ankara_id, 'Cihgany', 'Heritage patterns with cultural significance.', 18000, 12000, '/Cloth Gallery/Cihgany (3).webp', true, 6, ARRAY['heritage', 'cultural'], 120);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Cihgany Authentic', 'Cihgany', ankara_id, 'Cihgany', 'Authentic traditional wax prints.', 18000, 12000, '/Cloth Gallery/Cihgany (4).webp', true, 6, ARRAY['authentic', 'traditional'], 120);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Cihgany Timeless', 'Cihgany', ankara_id, 'Cihgany', 'Timeless designs for all occasions.', 18000, 12000, '/Cloth Gallery/Cihgany (5).webp', true, 6, ARRAY['timeless', 'versatile'], 120);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Cihgany Cultural', 'Cihgany', ankara_id, 'Cihgany', 'Cultural patterns celebrating African heritage.', 18000, 12000, '/Cloth Gallery/Cihgany (6).webp', true, 6, ARRAY['cultural', 'heritage'], 120);

  -- Super Mwunva Collection
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Super Mwunva Premium', 'Super Mwunva', ankara_id, 'Super Mwunva', 'Premium Mwunva with mountain-inspired patterns.', 27000, 18000, '/Cloth Gallery/Super Mwunva (1).webp', true, 6, ARRAY['premium', 'mountain', 'nature'], 90);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Super Mwunva Majestic', 'Super Mwunva', ankara_id, 'Super Mwunva', 'Majestic patterns inspired by nature.', 27000, 18000, '/Cloth Gallery/Super Mwunva (2).webp', true, 6, ARRAY['majestic', 'nature'], 90);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Super Mwunva Elegant', 'Super Mwunva', ankara_id, 'Super Mwunva', 'Elegant designs with cultural depth.', 27000, 18000, '/Cloth Gallery/Super Mwunva (3).webp', true, 6, ARRAY['elegant', 'cultural'], 90);

  -- Top Hollandais Collection
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Top Hollandais Premium', 'Top Hollandais', ankara_id, 'Top Hollandais', 'Premium Dutch-African heritage fabric.', 36000, 24000, '/Cloth Gallery/Top Hollandais (1).webp', true, 6, ARRAY['premium', 'heritage', 'formal'], 70);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Top Hollandais Elite', 'Top Hollandais', ankara_id, 'Top Hollandais', 'Elite collection for formal occasions.', 36000, 24000, '/Cloth Gallery/Top Hollandais (2).webp', true, 6, ARRAY['elite', 'formal'], 70);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Top Hollandais Classic', 'Top Hollandais', ankara_id, 'Top Hollandais', 'Classic patterns with European influence.', 36000, 24000, '/Cloth Gallery/Top Hollandais (3).webp', true, 6, ARRAY['classic', 'heritage'], 70);

  -- Super Ruvuma Collection
  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Super Ruvuma Flow', 'Super Ruvuma', ankara_id, 'Super Ruvuma', 'Flowing patterns inspired by the Ruvuma River.', 30000, 20000, '/Cloth Gallery/Super Ruvuma (1).webp', true, 6, ARRAY['flow', 'river', 'coastal'], 85);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Super Ruvuma Coastal', 'Super Ruvuma', ankara_id, 'Super Ruvuma', 'Coastal designs celebrating East African culture.', 30000, 20000, '/Cloth Gallery/Super Ruvuma (2).webp', true, 6, ARRAY['coastal', 'cultural'], 85);

  INSERT INTO fabrics (name, brand, category_id, collection, description, price_ngn, price_cfa, image_url, in_stock, yardage, tags, stock_quantity)
  VALUES ('Super Ruvuma Heritage', 'Super Ruvuma', ankara_id, 'Super Ruvuma', 'Heritage patterns from East Africa.', 30000, 20000, '/Cloth Gallery/Super Ruvuma (3).webp', true, 6, ARRAY['heritage', 'east-africa'], 85);

  RAISE NOTICE 'Successfully inserted 30 additional fabrics';

END $$;

-- Verify the new total
SELECT COUNT(*) as total_fabrics FROM fabrics;

-- Show breakdown by collection
SELECT 
  collection,
  COUNT(*) as count,
  AVG(price_cfa) as avg_price
FROM fabrics
WHERE collection IS NOT NULL
GROUP BY collection
ORDER BY avg_price DESC;
