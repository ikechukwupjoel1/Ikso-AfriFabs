-- =====================================================
-- STEP 013: Fix RLS Policy for Orders (CRITICAL FIX)
-- Run this in Supabase SQL Editor
-- This fixes the "row violates row-level security policy" error
-- =====================================================

-- Drop the restrictive policy that requires user_id
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;

-- Create a new policy that allows anyone (including anonymous users) to insert orders
CREATE POLICY "Anyone can insert orders" 
ON orders 
FOR INSERT 
WITH CHECK (true);

-- Also ensure the order_items table allows inserts
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;

CREATE POLICY "Anyone can insert order items" 
ON order_items 
FOR INSERT 
WITH CHECK (true);

-- Verify the policies are in place
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items');
