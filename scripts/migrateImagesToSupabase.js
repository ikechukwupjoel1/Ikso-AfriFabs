/**
 * Script to migrate all fabric images from local storage to Supabase Storage
 * 
 * Prerequisites:
 * 1. Install dependencies: npm install @supabase/supabase-js dotenv
 * 2. Create .env file with SUPABASE_URL and SUPABASE_SERVICE_KEY
 * 3. Run: node scripts/migrateImagesToSupabase.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client with service key (has admin privileges)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables!');
    console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'fabric-images';
const LOCAL_IMAGE_DIR = path.join(__dirname, '..', 'public', 'Cloth Gallery');

/**
 * Upload a single image to Supabase Storage
 */
async function uploadImage(localPath, remotePath) {
    try {
        // Read the file
        const fileBuffer = fs.readFileSync(localPath);

        // Get file extension
        const ext = path.extname(localPath).toLowerCase();
        const contentType = ext === '.webp' ? 'image/webp' :
            ext === '.png' ? 'image/png' :
                ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                    'image/webp';

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(remotePath, fileBuffer, {
                contentType,
                cacheControl: '3600',
                upsert: true, // Overwrite if exists
            });

        if (error) {
            console.error(`❌ Failed to upload ${remotePath}:`, error.message);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(remotePath);

        console.log(`✅ Uploaded: ${remotePath}`);
        return urlData.publicUrl;
    } catch (err) {
        console.error(`❌ Error uploading ${localPath}:`, err.message);
        return null;
    }
}

/**
 * Update fabric image URL in database
 */
async function updateFabricImageUrl(oldPath, newUrl) {
    try {
        const { data, error } = await supabase
            .from('fabrics')
            .update({ image_url: newUrl, updated_at: new Date().toISOString() })
            .eq('image_url', oldPath);

        if (error) {
            console.error(`❌ Failed to update database for ${oldPath}:`, error.message);
            return false;
        }

        return true;
    } catch (err) {
        console.error(`❌ Error updating database:`, err.message);
        return false;
    }
}

/**
 * Main migration function
 */
async function migrateImages() {
    console.log('🚀 Starting image migration to Supabase Storage...\n');

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
        console.error(`❌ Bucket "${BUCKET_NAME}" does not exist!`);
        console.error('Please run the 004_fabric_categories.sql migration first.');
        process.exit(1);
    }

    // Check if local directory exists
    if (!fs.existsSync(LOCAL_IMAGE_DIR)) {
        console.error(`❌ Local image directory not found: ${LOCAL_IMAGE_DIR}`);
        process.exit(1);
    }

    // Get all image files
    const files = fs.readdirSync(LOCAL_IMAGE_DIR)
        .filter(file => /\.(webp|png|jpg|jpeg)$/i.test(file));

    console.log(`📁 Found ${files.length} images to migrate\n`);

    let successCount = 0;
    let failCount = 0;
    const migrations = [];

    // Upload each image
    for (const file of files) {
        const localPath = path.join(LOCAL_IMAGE_DIR, file);
        const remotePath = `fabrics/${file}`; // Store in 'fabrics' folder
        const oldDbPath = `/Cloth Gallery/${file}`;

        console.log(`📤 Processing: ${file}`);

        // Upload to Supabase
        const publicUrl = await uploadImage(localPath, remotePath);

        if (publicUrl) {
            // Update database
            const updated = await updateFabricImageUrl(oldDbPath, publicUrl);

            if (updated) {
                successCount++;
                migrations.push({ file, oldPath: oldDbPath, newUrl: publicUrl });
            } else {
                failCount++;
            }
        } else {
            failCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} images`);
    console.log(`❌ Failed: ${failCount} images`);
    console.log(`📁 Total processed: ${files.length} images`);
    console.log('='.repeat(60));

    // Save migration log
    const logPath = path.join(__dirname, 'image-migration-log.json');
    fs.writeFileSync(logPath, JSON.stringify(migrations, null, 2));
    console.log(`\n📝 Migration log saved to: ${logPath}`);

    // Verification query
    console.log('\n🔍 Run this query in Supabase SQL Editor to verify:');
    console.log('SELECT image_url FROM fabrics LIMIT 5;');
    console.log('\nYou should see URLs starting with your Supabase URL.');
}

// Run migration
migrateImages().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
