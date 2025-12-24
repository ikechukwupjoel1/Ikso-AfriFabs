-- Admin Roles & Permissions Schema for Ikso AfriFabs
-- Run this in your Supabase SQL Editor

-- 1. Create admin_roles enum type
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('super_admin', 'product_manager', 'order_manager', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role admin_role NOT NULL DEFAULT 'viewer',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create user_profiles table for all users
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    preferred_currency TEXT DEFAULT 'NGN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create orders table (if not exists)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for admin_users
-- Only super_admin can view and manage admin_users
CREATE POLICY "Super admins can view all admins"
    ON admin_users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
        )
        OR user_id = auth.uid()
    );

CREATE POLICY "Super admins can insert admins"
    ON admin_users FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can update admins"
    ON admin_users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can delete admins"
    ON admin_users FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
        )
    );

-- 7. RLS Policies for user_profiles
-- Users can view and edit their own profile
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON user_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid()
        )
    );

-- 8. RLS Policies for orders
-- Users can view their own orders
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own orders"
    ON orders FOR INSERT
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.role IN ('super_admin', 'order_manager')
        )
    );

-- Admins can update order status
CREATE POLICY "Admins can update orders"
    ON orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.role IN ('super_admin', 'order_manager')
        )
    );

-- 9. Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = check_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Function to get user's admin role
CREATE OR REPLACE FUNCTION get_admin_role(check_user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role::TEXT INTO user_role 
    FROM admin_users 
    WHERE user_id = check_user_id;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Insert the super admin (iksotech@gmail.com)
-- Note: You'll need to run this AFTER the user signs up
-- Replace 'USER_ID_HERE' with the actual UUID from auth.users
-- Or use this query after signup:
/*
INSERT INTO admin_users (user_id, email, role)
SELECT id, email, 'super_admin'::admin_role
FROM auth.users
WHERE email = 'iksotech@gmail.com'
ON CONFLICT (email) DO UPDATE SET role = 'super_admin';
*/
