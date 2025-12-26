-- =====================================================
-- STEP 015: Add fabric details to order_items for admin viewing
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add missing columns to order_items table
DO $$
BEGIN
    -- fabric_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'fabric_name') THEN
        ALTER TABLE order_items ADD COLUMN fabric_name TEXT;
    END IF;

    -- fabric_image column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'fabric_image') THEN
        ALTER TABLE order_items ADD COLUMN fabric_image TEXT;
    END IF;

    -- quantity column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'quantity') THEN
        ALTER TABLE order_items ADD COLUMN quantity INTEGER DEFAULT 1;
    END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_items';
