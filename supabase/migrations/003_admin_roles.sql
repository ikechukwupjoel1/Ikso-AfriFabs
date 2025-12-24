-- Admin Roles & Permissions Schema for Ikso AfriFabs
-- Run this SECTION BY SECTION in your Supabase SQL Editor

-- ============================================
-- SECTION 1: Create admin_role type
-- ============================================
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('super_admin', 'product_manager', 'order_manager', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- SECTION 2: Create admin_users table
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    role admin_role NOT NULL DEFAULT 'viewer',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SECTION 3: Create user_profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    preferred_currency TEXT DEFAULT 'NGN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SECTION 4: Create orders table
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'NGN',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SECTION 5: Enable RLS
-- ============================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 6: Create helper functions
-- ============================================

-- Check if current user email is in admin_users
CREATE OR REPLACE FUNCTION is_admin_by_email()
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    RETURN EXISTS (SELECT 1 FROM admin_users WHERE email = user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is super admin by email
CREATE OR REPLACE FUNCTION is_super_admin_by_email()
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    RETURN EXISTS (SELECT 1 FROM admin_users WHERE email = user_email AND role = 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get admin role by email
CREATE OR REPLACE FUNCTION get_admin_role_by_email()
RETURNS TEXT AS $$
DECLARE
    user_email TEXT;
    user_role TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    SELECT role::TEXT INTO user_role FROM admin_users WHERE email = user_email;
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SECTION 7: RLS Policies for admin_users
-- ============================================

-- Allow authenticated users to see if they are an admin (by email)
CREATE POLICY "Users can view own admin record by email"
    ON admin_users FOR SELECT
    USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Super admins can view all admins
CREATE POLICY "Super admins can view all"
    ON admin_users FOR SELECT
    USING (is_super_admin_by_email());

-- Super admins can insert
CREATE POLICY "Super admins can insert"
    ON admin_users FOR INSERT
    WITH CHECK (is_super_admin_by_email());

-- Super admins can update
CREATE POLICY "Super admins can update"
    ON admin_users FOR UPDATE
    USING (is_super_admin_by_email());

-- Super admins can delete
CREATE POLICY "Super admins can delete"
    ON admin_users FOR DELETE
    USING (is_super_admin_by_email());

-- ============================================
-- SECTION 8: RLS Policies for user_profiles
-- ============================================

CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
    ON user_profiles FOR SELECT
    USING (is_admin_by_email());

-- ============================================
-- SECTION 9: RLS Policies for orders
-- ============================================

CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert orders"
    ON orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (is_admin_by_email());

CREATE POLICY "Admins can update orders"
    ON orders FOR UPDATE
    USING (is_admin_by_email());

-- ============================================
-- SECTION 10: Insert Super Admin
-- RUN THIS NOW to set iksotech@gmail.com as super admin
-- ============================================
INSERT INTO admin_users (email, role) 
VALUES ('iksotech@gmail.com', 'super_admin')
ON CONFLICT (email) DO UPDATE SET role = 'super_admin';
