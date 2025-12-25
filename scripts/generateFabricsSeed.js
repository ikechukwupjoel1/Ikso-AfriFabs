// Script to generate SQL migration from local fabrics data
// Run with: node scripts/generateFabricsSeed.js

import { fabrics } from '../src/data/fabrics.js';
import fs from 'fs';
import path from 'path';

// Category mapping from old to new
const categoryMap = {
    'ankara': 'Ankara',
    'kente': 'Kente',
    'adire': 'Adire',
    'aso-oke': 'Aso-Oke',
};

// Escape single quotes for SQL
function escapeSql(str) {
    if (!str) return null;
    return str.replace(/'/g, "''");
}

// Generate SQL INSERT statements
let sql = `-- =====================================================
-- STEP 005: Seed Fabrics from Local Data
-- Run this in Supabase SQL Editor AFTER running 004_fabric_categories.sql
-- This will populate your database with all ${fabrics.length} fabrics
-- =====================================================

-- First, get category IDs
DO $$
DECLARE
  ankara_id UUID;
  kente_id UUID;
  adire_id UUID;
  asooke_id UUID;
  dashiki_id UUID;
  mudcloth_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO ankara_id FROM fabric_categories WHERE slug = 'ankara';
  SELECT id INTO kente_id FROM fabric_categories WHERE slug = 'kente';
  SELECT id INTO adire_id FROM fabric_categories WHERE slug = 'adire';
  SELECT id INTO asooke_id FROM fabric_categories WHERE slug = 'aso-oke';
  SELECT id INTO dashiki_id FROM fabric_categories WHERE slug = 'dashiki';
  SELECT id INTO mudcloth_id FROM fabric_categories WHERE slug = 'mudcloth';

  -- Insert fabrics
`;

fabrics.forEach((fabric, index) => {
    const name = escapeSql(fabric.name);
    const brand = escapeSql(fabric.brand || fabric.collection || 'IKSO AfriFabs');
    const description = escapeSql(fabric.description);
    const collection = escapeSql(fabric.collection);
    const imageUrl = escapeSql(fabric.image);
    const priceCFA = fabric.priceCFA || 10000;
    const priceNGN = Math.round(priceCFA * 1.5); // Approximate conversion
    const tags = fabric.tags ? `ARRAY['${fabric.tags.map(escapeSql).join("','")}']` : 'NULL';
    const inStock = fabric.inStock ? 'true' : 'false';

    // Map category
    let categoryVar = 'ankara_id'; // default
    if (fabric.category === 'kente') categoryVar = 'kente_id';
    else if (fabric.category === 'adire') categoryVar = 'adire_id';
    else if (fabric.category === 'aso-oke') categoryVar = 'asooke_id';

    sql += `
  -- ${index + 1}. ${fabric.name}
  INSERT INTO fabrics (
    id, name, brand, category_id, collection, description,
    price_ngn, price_cfa, image_url, in_stock, yardage, tags,
    stock_quantity, featured, created_at, updated_at
  ) VALUES (
    '${fabric.id}',
    '${name}',
    '${brand}',
    ${categoryVar},
    ${collection ? `'${collection}'` : 'NULL'},
    ${description ? `'${description}'` : 'NULL'},
    ${priceNGN},
    ${priceCFA},
    '${imageUrl}',
    ${inStock},
    6,
    ${tags},
    100,
    ${index < 10 ? 'true' : 'false'}, -- Feature first 10
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price_cfa = EXCLUDED.price_cfa,
    price_ngn = EXCLUDED.price_ngn,
    updated_at = NOW();
`;
});

sql += `
END $$;

-- Verify insertion
SELECT 
  fc.name as category,
  COUNT(*) as fabric_count,
  AVG(f.price_cfa) as avg_price
FROM fabrics f
JOIN fabric_categories fc ON f.category_id = fc.id
GROUP BY fc.name
ORDER BY fc.name;

-- Show total count
SELECT COUNT(*) as total_fabrics FROM fabrics;
`;

// Write to file
const outputPath = path.join(process.cwd(), 'supabase', 'migrations', '005_seed_fabrics.sql');
fs.writeFileSync(outputPath, sql);

console.log(`✅ Generated SQL migration with ${fabrics.length} fabrics`);
console.log(`📄 File: ${outputPath}`);
console.log(`\n🚀 Next steps:`);
console.log(`1. Open Supabase SQL Editor`);
console.log(`2. Run the migration: supabase/migrations/005_seed_fabrics.sql`);
console.log(`3. Verify in admin dashboard at /admin`);
