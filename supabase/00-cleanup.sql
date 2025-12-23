-- =====================================================
-- CLEANUP: Drop All Tables
-- ⚠️ WARNING: This will DELETE ALL DATA in these tables!
-- Only run this if you want to start completely fresh
-- =====================================================

-- Drop tables in reverse order (to respect foreign key constraints)
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS saved_designs CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS fabric_images CASCADE;
DROP TABLE IF EXISTS fabrics CASCADE;

-- Verify all tables are dropped
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('fabrics', 'fabric_images', 'saved_designs', 'cart_items', 
                     'orders', 'order_items', 'favorites', 'user_profiles');

-- Should return 0 rows if successful
