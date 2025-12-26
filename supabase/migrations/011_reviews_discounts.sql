-- =====================================================
-- STEP 011: Reviews & Ratings + Discount Codes
-- Run this in Supabase SQL Editor
-- =====================================================

-- ============================================
-- SECTION 1: Fabric Reviews Table
-- ============================================
CREATE TABLE IF NOT EXISTS fabric_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fabric_id UUID NOT NULL REFERENCES fabrics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Review Details
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    review_text TEXT,
    reviewer_name TEXT NOT NULL,
    
    -- Verification
    verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE fabric_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for fabric_reviews
CREATE POLICY "Anyone can view approved reviews" ON fabric_reviews
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can insert reviews" ON fabric_reviews
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own reviews" ON fabric_reviews
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage reviews" ON fabric_reviews
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_reviews_fabric_id ON fabric_reviews(fabric_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON fabric_reviews(rating);

-- ============================================
-- SECTION 2: Discount Codes Table
-- ============================================
CREATE TABLE IF NOT EXISTS discount_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Discount Details
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL,
    
    -- Constraints
    min_order_amount NUMERIC(10,2) DEFAULT 0,
    max_discount_amount NUMERIC(10,2), -- For percentage discounts
    
    -- Validity
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    usage_limit INTEGER, -- NULL = unlimited
    times_used INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Policies for discount_codes
CREATE POLICY "Anyone can validate codes" ON discount_codes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage codes" ON discount_codes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    );

-- ============================================
-- SECTION 3: Function to calculate average rating
-- ============================================
CREATE OR REPLACE FUNCTION get_fabric_average_rating(fabric_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    avg_rating NUMERIC;
BEGIN
    SELECT COALESCE(AVG(rating)::NUMERIC(2,1), 0)
    INTO avg_rating
    FROM fabric_reviews
    WHERE fabric_id = fabric_uuid AND is_approved = true;
    
    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SECTION 4: Function to validate discount code
-- ============================================
CREATE OR REPLACE FUNCTION validate_discount_code(
    code_text TEXT,
    order_amount NUMERIC
)
RETURNS TABLE (
    valid BOOLEAN,
    discount_type TEXT,
    discount_value NUMERIC,
    final_discount NUMERIC,
    message TEXT
) AS $$
DECLARE
    code_record RECORD;
BEGIN
    -- Find the code
    SELECT * INTO code_record
    FROM discount_codes
    WHERE code = UPPER(code_text) AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 0::NUMERIC, 'Invalid discount code';
        RETURN;
    END IF;
    
    -- Check validity date
    IF code_record.valid_until IS NOT NULL AND code_record.valid_until < NOW() THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 0::NUMERIC, 'This code has expired';
        RETURN;
    END IF;
    
    -- Check usage limit
    IF code_record.usage_limit IS NOT NULL AND code_record.times_used >= code_record.usage_limit THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 0::NUMERIC, 'This code has reached its usage limit';
        RETURN;
    END IF;
    
    -- Check minimum order
    IF order_amount < code_record.min_order_amount THEN
        RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 0::NUMERIC, 
            'Minimum order of ' || code_record.min_order_amount || ' required';
        RETURN;
    END IF;
    
    -- Calculate discount
    DECLARE
        calculated_discount NUMERIC;
    BEGIN
        IF code_record.discount_type = 'percentage' THEN
            calculated_discount := order_amount * (code_record.discount_value / 100);
            IF code_record.max_discount_amount IS NOT NULL THEN
                calculated_discount := LEAST(calculated_discount, code_record.max_discount_amount);
            END IF;
        ELSE
            calculated_discount := code_record.discount_value;
        END IF;
        
        RETURN QUERY SELECT 
            true, 
            code_record.discount_type, 
            code_record.discount_value, 
            calculated_discount,
            'Discount applied successfully!';
    END;
END;
$$ LANGUAGE plpgsql;
