# Supabase Database Setup Instructions

## 📋 Run SQL Scripts in Order

Navigate to your [Supabase SQL Editor](https://supabase.com/dashboard/project/majjawvqcceuekfcqfrm/sql/new)

### Step 1: Create Tables ⚠️ RUN FIRST
**File:** `supabase/01-create-tables.sql`

1. Open the SQL Editor
2. Copy/paste the entire contents of `01-create-tables.sql`
3. Click "Run" - Creates all 8 tables

### Step 2: Enable RLS & Policies
**File:** `supabase/02-create-policies.sql`

1. Copy/paste contents of `02-create-policies.sql`
2. Click "Run" - Sets up security policies

### Step 3: Create Indexes
**File:** `supabase/03-create-indexes.sql`

1. Copy/paste contents of `03-create-indexes.sql`
2. Click "Run" - Optimizes query performance

---

## ✅ Verify Setup

After running all scripts, check:

1. **Table Editor** - Should see 8 tables
2. **Authentication** - Enabled (default)
3. **Storage** - Need to create buckets manually (see below)

---

## 🗄️ Create Storage Buckets

Go to [Storage](https://supabase.com/dashboard/project/majjawvqcceuekfcqfrm/storage/buckets)

### 1. fabric-images (Public)
- Name: `fabric-images`
- Public: ✅ Yes
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg,image/png,image/webp`

### 2. design-thumbnails (Private)
- Name: `design-thumbnails`
- Public: ❌ No (users can only access their own)
- File size limit: 2 MB
- Allowed MIME types: `image/png,image/jpeg`

### 3. user-avatars (Public)
- Name: `user-avatars`
- Public: ✅ Yes
- File size limit: 1 MB
- Allowed MIME types: `image/jpeg,image/png,image/webp`

---

## 🔧 Next: Seed Sample Data

After tables are created, you can insert your existing fabrics:

```sql
-- Insert sample fabrics
INSERT INTO fabrics (name, brand, description, price_ngn, price_cfa, image_url, category, tags)
VALUES
  ('Super Ruvuma Geometric', 'Super Ruvuma', 'Premium wax print with intricate geometric patterns', 8500, 7500, 'https://your-storage-url/ankara-orange-teal.jpg', 'ankara', ARRAY['geometric', 'bold', 'traditional', 'wedding']),
  ('Mwunva Royal Swirl', 'Super Mwunva', 'Luxurious burgundy and gold swirl pattern', 12000, 10500, 'https://your-storage-url/ankara-burgundy-gold.jpg', 'ankara', ARRAY['luxury', 'wedding', 'celebration', 'gold']);
-- ... add more fabrics
```

---

## 🚨 Common Errors

### "relation does not exist"
❌ You tried to run Step 2 or 3 before Step 1
✅ Run `01-create-tables.sql` first

### "permission denied"
❌ RLS is blocking queries
✅ Check policies in Step 2 are created

### "column does not exist"
❌ Typo in column name or wrong table
✅ Double-check table structure
