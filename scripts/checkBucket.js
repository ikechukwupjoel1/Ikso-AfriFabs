// Quick script to check if bucket exists and create it if needed
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateBucket() {
    console.log('🔍 Checking for fabric-images bucket...\n');

    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('❌ Error listing buckets:', listError);
        return;
    }

    console.log('📦 Existing buckets:', buckets.map(b => b.name).join(', '));

    const bucketExists = buckets?.some(b => b.name === 'fabric-images');

    if (bucketExists) {
        console.log('\n✅ Bucket "fabric-images" already exists!');
    } else {
        console.log('\n❌ Bucket "fabric-images" does NOT exist. Creating it...');

        // Create the bucket
        const { data, error } = await supabase.storage.createBucket('fabric-images', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
        });

        if (error) {
            console.error('❌ Error creating bucket:', error);
        } else {
            console.log('✅ Bucket created successfully!');
        }
    }
}

checkAndCreateBucket();
