# Image Migration to Supabase Storage

This guide explains how to migrate all fabric images from local storage to Supabase Storage.

## Prerequisites

1. **Get Supabase Service Key**:
   - Go to: https://supabase.com/dashboard/project/majjawvqcceukfrm/settings/api
   - Copy the `service_role` key (NOT the `anon` key)
   - ⚠️ **Keep this secret!** It has admin privileges

2. **Install Dependencies**:
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

## Setup

1. **Create `.env` file** in the project root:
   ```env
   VITE_SUPABASE_URL=https://majjawvqcceukfrm.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   ```

2. **Ensure the storage bucket exists**:
   - Run the `004_fabric_categories.sql` migration first
   - This creates the `fabric-images` bucket

## Running the Migration

```bash
node scripts/migrateImagesToSupabase.js
```

## What It Does

1. ✅ Reads all images from `/public/Cloth Gallery/`
2. ✅ Uploads each image to Supabase Storage bucket `fabric-images/fabrics/`
3. ✅ Updates database `image_url` from local paths to Supabase URLs
4. ✅ Creates a migration log file
5. ✅ Shows summary of success/failures

## Expected Output

```
🚀 Starting image migration to Supabase Storage...

📁 Found 63 images to migrate

📤 Processing: Super Gandaho (1).webp
✅ Uploaded: fabrics/Super Gandaho (1).webp
...

============================================================
📊 Migration Summary:
============================================================
✅ Successfully migrated: 63 images
❌ Failed: 0 images
📁 Total processed: 63 images
============================================================

📝 Migration log saved to: scripts/image-migration-log.json
```

## Verification

After migration, run this in Supabase SQL Editor:

```sql
-- Check updated URLs
SELECT name, image_url FROM fabrics LIMIT 5;

-- Count migrated images
SELECT COUNT(*) as migrated_count 
FROM fabrics 
WHERE image_url LIKE '%supabase.co%';
```

## Troubleshooting

**Error: "Bucket does not exist"**
- Run `004_fabric_categories.sql` migration first

**Error: "Missing environment variables"**
- Check your `.env` file has both `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

**Error: "Local image directory not found"**
- Ensure `/public/Cloth Gallery/` exists with images

## After Migration

1. ✅ All images now in Supabase Storage
2. ✅ Database URLs updated
3. ✅ Admin can upload new images via dashboard
4. ✅ Local images can be kept as backup or deleted

## New Image Uploads

Going forward, when admins add fabrics via `/admin`:
- Images upload directly to Supabase Storage
- Database stores Supabase URLs automatically
- No manual migration needed
