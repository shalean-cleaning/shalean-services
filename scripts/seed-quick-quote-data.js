#!/usr/bin/env node

/**
 * Seed Quick Quote Data
 * 
 * This script seeds minimal data for Quick Quote functionality:
 * - Services
 * - Extras
 * - Regions
 * - Suburbs
 * - Frequency discounts
 * 
 * It's idempotent - safe to run multiple times.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedServices() {
  console.log('🌱 Seeding services...');
  
  const services = [
    {
      name: 'Standard Cleaning - Small Home',
      slug: 'standard-cleaning-small',
      description: 'Up to 2 bedrooms, 1 bathroom',
      base_fee: 80.00,
      active: true
    },
    {
      name: 'Standard Cleaning - Medium Home',
      slug: 'standard-cleaning-medium',
      description: '3 bedrooms, 2 bathrooms',
      base_fee: 120.00,
      active: true
    },
    {
      name: 'Standard Cleaning - Large Home',
      slug: 'standard-cleaning-large',
      description: '4+ bedrooms, 2+ bathrooms',
      base_fee: 160.00,
      active: true
    },
    {
      name: 'Deep Cleaning - Apartment',
      slug: 'deep-cleaning-apartment',
      description: 'Full deep clean for apartments',
      base_fee: 180.00,
      active: true
    },
    {
      name: 'Deep Cleaning - House',
      slug: 'deep-cleaning-house',
      description: 'Full deep clean for houses',
      base_fee: 240.00,
      active: true
    },
    {
      name: 'Move-In/Out - Apartment',
      slug: 'move-in-out-apartment',
      description: 'Pre/post move deep clean (apartment)',
      base_fee: 220.00,
      active: true
    },
    {
      name: 'Move-In/Out - House',
      slug: 'move-in-out-house',
      description: 'Pre/post move deep clean (house)',
      base_fee: 280.00,
      active: true
    },
    {
      name: 'Post-Construction - Small',
      slug: 'post-construction-small',
      description: 'Dust & residue removal - small',
      base_fee: 260.00,
      active: true
    },
    {
      name: 'Post-Construction - Large',
      slug: 'post-construction-large',
      description: 'Dust & residue removal - large',
      base_fee: 320.00,
      active: true
    },
    {
      name: 'Airbnb Turnover',
      slug: 'airbnb-turnover',
      description: 'Between-stay cleaning & reset',
      base_fee: 140.00,
      active: true
    }
  ];

  for (const service of services) {
    const { data, error } = await supabase
      .from('services')
      .upsert(service, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error(`❌ Error seeding service ${service.name}:`, error.message);
    } else {
      console.log(`✅ Seeded service: ${service.name}`);
    }
  }
}

async function seedExtras() {
  console.log('🌱 Seeding extras...');
  
  const extras = [
    {
      name: 'Inside Fridge',
      slug: 'inside-fridge',
      description: 'Clean and sanitize fridge interior',
      price_cents: 2000, // $20.00
      active: true
    },
    {
      name: 'Inside Oven',
      slug: 'inside-oven',
      description: 'Clean oven interior',
      price_cents: 2500, // $25.00
      active: true
    },
    {
      name: 'Interior Windows',
      slug: 'interior-windows',
      description: 'Clean reachable interior windows',
      price_cents: 3000, // $30.00
      active: true
    },
    {
      name: 'Cabinets (Inside)',
      slug: 'cabinets-inside',
      description: 'Empty & wipe inside cabinets',
      price_cents: 3000, // $30.00
      active: true
    },
    {
      name: 'Laundry & Ironing',
      slug: 'laundry-ironing',
      description: 'Wash, dry, fold, iron (limited load)',
      price_cents: 2000, // $20.00
      active: true
    }
  ];

  for (const extra of extras) {
    const { data, error } = await supabase
      .from('extras')
      .upsert(extra, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error(`❌ Error seeding extra ${extra.name}:`, error.message);
    } else {
      console.log(`✅ Seeded extra: ${extra.name}`);
    }
  }
}

async function seedRegions() {
  console.log('🌱 Seeding regions...');
  
  const regions = [
    {
      name: 'Cape Town CBD',
      slug: 'cape-town-cbd',
      state: 'Western Cape'
    },
    {
      name: 'Atlantic Seaboard',
      slug: 'atlantic-seaboard',
      state: 'Western Cape'
    },
    {
      name: 'Southern Suburbs',
      slug: 'southern-suburbs',
      state: 'Western Cape'
    },
    {
      name: 'Northern Suburbs',
      slug: 'northern-suburbs',
      state: 'Western Cape'
    }
  ];

  for (const region of regions) {
    const { data, error } = await supabase
      .from('regions')
      .upsert(region, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error(`❌ Error seeding region ${region.name}:`, error.message);
    } else {
      console.log(`✅ Seeded region: ${region.name}`);
    }
  }
}

async function seedSuburbs() {
  console.log('🌱 Seeding suburbs...');
  
  // First get region IDs
  const { data: regions } = await supabase
    .from('regions')
    .select('id, slug');

  if (!regions) {
    console.error('❌ No regions found. Please seed regions first.');
    return;
  }

  const regionMap = {};
  regions.forEach(region => {
    regionMap[region.slug] = region.id;
  });

  const suburbs = [
    {
      name: 'City Centre',
      slug: 'city-centre',
      postcode: '8001',
      region_id: regionMap['cape-town-cbd'],
      delivery_fee: 0,
      price_adjustment_pct: 0,
      active: true
    },
    {
      name: 'Sea Point',
      slug: 'sea-point',
      postcode: '8005',
      region_id: regionMap['atlantic-seaboard'],
      delivery_fee: 0,
      price_adjustment_pct: 5, // 5% premium
      active: true
    },
    {
      name: 'Green Point',
      slug: 'green-point',
      postcode: '8005',
      region_id: regionMap['atlantic-seaboard'],
      delivery_fee: 0,
      price_adjustment_pct: 5, // 5% premium
      active: true
    },
    {
      name: 'Claremont',
      slug: 'claremont',
      postcode: '7708',
      region_id: regionMap['southern-suburbs'],
      delivery_fee: 0,
      price_adjustment_pct: 0,
      active: true
    },
    {
      name: 'Rondebosch',
      slug: 'rondebosch',
      postcode: '7700',
      region_id: regionMap['southern-suburbs'],
      delivery_fee: 0,
      price_adjustment_pct: 0,
      active: true
    },
    {
      name: 'Bellville',
      slug: 'bellville',
      postcode: '7530',
      region_id: regionMap['northern-suburbs'],
      delivery_fee: 0,
      price_adjustment_pct: 0,
      active: true
    },
    {
      name: 'Durbanville',
      slug: 'durbanville',
      postcode: '7550',
      region_id: regionMap['northern-suburbs'],
      delivery_fee: 0,
      price_adjustment_pct: 0,
      active: true
    }
  ];

  for (const suburb of suburbs) {
    if (!suburb.region_id) {
      console.error(`❌ Region not found for suburb ${suburb.name}`);
      continue;
    }

    const { data, error } = await supabase
      .from('suburbs')
      .upsert(suburb, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error(`❌ Error seeding suburb ${suburb.name}:`, error.message);
    } else {
      console.log(`✅ Seeded suburb: ${suburb.name}`);
    }
  }
}

async function seedFrequencyDiscounts() {
  console.log('🌱 Seeding frequency discounts...');
  
  const discounts = [
    {
      frequency: 'weekly',
      discount_pct: 10.00,
      active_from: new Date().toISOString()
    },
    {
      frequency: 'bi-weekly',
      discount_pct: 15.00,
      active_from: new Date().toISOString()
    },
    {
      frequency: 'monthly',
      discount_pct: 20.00,
      active_from: new Date().toISOString()
    }
  ];

  for (const discount of discounts) {
    const { data, error } = await supabase
      .from('frequency_discounts')
      .upsert(discount, { onConflict: 'frequency' })
      .select();

    if (error) {
      console.error(`❌ Error seeding frequency discount ${discount.frequency}:`, error.message);
    } else {
      console.log(`✅ Seeded frequency discount: ${discount.frequency} (${discount.discount_pct}%)`);
    }
  }
}

async function main() {
  console.log('🚀 Starting Quick Quote data seeding...');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  
  try {
    await seedServices();
    await seedExtras();
    await seedRegions();
    await seedSuburbs();
    await seedFrequencyDiscounts();
    
    console.log('✅ Quick Quote data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  seedServices,
  seedExtras,
  seedRegions,
  seedSuburbs,
  seedFrequencyDiscounts
};
