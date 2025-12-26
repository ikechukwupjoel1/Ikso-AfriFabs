-- =====================================================
-- COMPREHENSIVE FIX: All Missing Orders Table Columns
-- Run this ENTIRE script in Supabase SQL Editor
-- =====================================================

-- Add ALL potentially missing columns
DO $$
BEGIN
    -- total_amount column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
        ALTER TABLE orders ADD COLUMN total_amount DECIMAL(12,2) DEFAULT 0;
        RAISE NOTICE 'Added total_amount column';
    END IF;

    -- items column (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'items') THEN
        ALTER TABLE orders ADD COLUMN items JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added items column';
    END IF;

    -- address column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'address') THEN
        ALTER TABLE orders ADD COLUMN address TEXT;
        RAISE NOTICE 'Added address column';
    END IF;

    -- city column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'city') THEN
        ALTER TABLE orders ADD COLUMN city TEXT;
        RAISE NOTICE 'Added city column';
    END IF;

    -- state column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'state') THEN
        ALTER TABLE orders ADD COLUMN state TEXT;
        RAISE NOTICE 'Added state column';
    END IF;

    -- country column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'country') THEN
        ALTER TABLE orders ADD COLUMN country TEXT DEFAULT 'Nigeria';
        RAISE NOTICE 'Added country column';
    END IF;

    -- delivery_method column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_method') THEN
        ALTER TABLE orders ADD COLUMN delivery_method TEXT DEFAULT 'shipping';
        RAISE NOTICE 'Added delivery_method column';
    END IF;

    -- notes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'notes') THEN
        ALTER TABLE orders ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column';
    END IF;

    -- customer_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_name') THEN
        ALTER TABLE orders ADD COLUMN customer_name TEXT;
        RAISE NOTICE 'Added customer_name column';
    END IF;

    -- customer_phone column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
        ALTER TABLE orders ADD COLUMN customer_phone TEXT;
        RAISE NOTICE 'Added customer_phone column';
    END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;
