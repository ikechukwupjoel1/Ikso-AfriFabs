-- =====================================================
-- STEP 3: Create Indexes for Performance
-- Run this AFTER Steps 1 and 2
-- =====================================================

-- Fabrics indexes
CREATE INDEX IF NOT EXISTS idx_fabrics_category ON fabrics(category);
CREATE INDEX IF NOT EXISTS idx_fabrics_brand ON fabrics(brand);
CREATE INDEX IF NOT EXISTS idx_fabrics_in_stock ON fabrics(in_stock);
CREATE INDEX IF NOT EXISTS idx_fabrics_tags ON fabrics USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_fabrics_created_at ON fabrics(created_at DESC);

-- Fabric images indexes
CREATE INDEX IF NOT EXISTS idx_fabric_images_fabric_id ON fabric_images(fabric_id);
CREATE INDEX IF NOT EXISTS idx_fabric_images_display_order ON fabric_images(fabric_id, display_order);

-- Saved designs indexes
CREATE INDEX IF NOT EXISTS idx_saved_designs_user_id ON saved_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_designs_fabric_id ON saved_designs(fabric_id);
CREATE INDEX IF NOT EXISTS idx_saved_designs_created_at ON saved_designs(created_at DESC);

-- Cart items indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_fabric_id ON cart_items(fabric_id);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_fabric_id ON order_items(fabric_id);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_fabric_id ON favorites(fabric_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);
