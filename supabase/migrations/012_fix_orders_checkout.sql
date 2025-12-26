-- =====================================================
-- STEP 012: Fix Orders Table for Checkout
-- Run this in Supabase SQL Editor to fix order placement
-- =====================================================

-- First, run 008 if not already done (shipping fields)
DO $$
BEGIN
    -- Add address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'address') THEN
        ALTER TABLE orders ADD COLUMN address TEXT;
    END IF;

    -- Add city column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'city') THEN
        ALTER TABLE orders ADD COLUMN city TEXT;
    END IF;

    -- Add state column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'state') THEN
        ALTER TABLE orders ADD COLUMN state TEXT;
    END IF;

    -- Add country column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'country') THEN
        ALTER TABLE orders ADD COLUMN country TEXT DEFAULT 'Nigeria';
    END IF;

    -- Add delivery_method column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_method') THEN
        ALTER TABLE orders ADD COLUMN delivery_method TEXT DEFAULT 'shipping';
    END IF;

    -- Add total_ngn column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_ngn') THEN
        ALTER TABLE orders ADD COLUMN total_ngn DECIMAL(12,2) DEFAULT 0;
    END IF;

    -- Add total_cfa column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_cfa') THEN
        ALTER TABLE orders ADD COLUMN total_cfa DECIMAL(12,2) DEFAULT 0;
    END IF;
END $$;

-- Create order_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    fabric_id UUID REFERENCES fabrics(id) ON DELETE SET NULL,
    yardage DECIMAL(10,2) NOT NULL DEFAULT 6,
    price_per_unit DECIMAL(12,2) NOT NULL DEFAULT 0,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;

-- Create policies for order_items
CREATE POLICY "Anyone can insert order items" ON order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage order items" ON order_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Verify the fix by showing orders table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
