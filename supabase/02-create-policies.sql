-- =====================================================
-- STEP 2: Enable RLS and Create Policies
-- Run this AFTER Step 1 (tables must exist first)
-- =====================================================

-- Enable Row Level Security on tables
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabric_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FABRICS - Public Read Access
-- =====================================================

CREATE POLICY "Anyone can view fabrics"
  ON fabrics
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can insert fabrics"
  ON fabrics
  FOR INSERT
  TO authenticated
  WITH CHECK (false); -- Change to admin role check when you implement admin

CREATE POLICY "Only admins can update fabrics"
  ON fabrics
  FOR UPDATE
  TO authenticated
  USING (false); -- Change to admin role check

CREATE POLICY "Only admins can delete fabrics"
  ON fabrics
  FOR DELETE
  TO authenticated
  USING (false); -- Change to admin role check

-- =====================================================
-- FABRIC IMAGES - Public Read Access
-- =====================================================

CREATE POLICY "Anyone can view fabric images"
  ON fabric_images
  FOR SELECT
  TO public
  USING (true);

-- =====================================================
-- SAVED DESIGNS - Users manage their own
-- =====================================================

CREATE POLICY "Users can view their own designs"
  ON saved_designs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own designs"
  ON saved_designs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
  ON saved_designs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
  ON saved_designs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- CART ITEMS - Session or User access
-- =====================================================

CREATE POLICY "Users can view their own cart"
  ON cart_items
  FOR SELECT
  TO public
  USING (
    auth.uid() = user_id 
    OR session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "Users can add to their cart"
  ON cart_items
  FOR INSERT
  TO public
  WITH CHECK (
    auth.uid() = user_id 
    OR session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "Users can update their cart items"
  ON cart_items
  FOR UPDATE
  TO public
  USING (
    auth.uid() = user_id 
    OR session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "Users can delete from their cart"
  ON cart_items
  FOR DELETE
  TO public
  USING (
    auth.uid() = user_id 
    OR session_id = current_setting('app.session_id', true)
  );

-- =====================================================
-- FAVORITES - Users manage their own
-- =====================================================

CREATE POLICY "Users can view their own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- USER PROFILES - Users manage their own
-- =====================================================

CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
