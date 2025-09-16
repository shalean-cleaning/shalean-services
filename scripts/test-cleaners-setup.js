#!/usr/bin/env node

/**
 * Test script to verify the cleaners setup migration
 * Run this after applying the migration to ensure everything works
 */

const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

async function testCleanersSetup() {
  console.log('🧪 Testing cleaners setup...\n');

  try {
    // Test 1: Check if cleaners table exists and has data
    console.log('1️⃣ Testing cleaners table...');
    const { data: cleaners, error: cleanersError } = await supabase
      .from('cleaners')
      .select('id, full_name, rating, is_active')
      .limit(5);

    if (cleanersError) {
      console.error('❌ Error fetching cleaners:', cleanersError.message);
      return false;
    }

    if (!cleaners || cleaners.length === 0) {
      console.error('❌ No cleaners found in database');
      return false;
    }

    console.log(`✅ Found ${cleaners.length} cleaners:`);
    cleaners.forEach(cleaner => {
      console.log(`   - ${cleaner.full_name} (${cleaner.rating}⭐) - ${cleaner.is_active ? 'Active' : 'Inactive'}`);
    });

    // Test 2: Check service areas
    console.log('\n2️⃣ Testing service areas...');
    const { data: areas, error: areasError } = await supabase
      .from('cleaner_service_areas')
      .select('cleaner_id, area')
      .limit(10);

    if (areasError) {
      console.error('❌ Error fetching service areas:', areasError.message);
      return false;
    }

    console.log(`✅ Found ${areas.length} service area mappings`);

    // Test 3: Check services
    console.log('\n3️⃣ Testing cleaner services...');
    const { data: services, error: servicesError } = await supabase
      .from('cleaner_services')
      .select('cleaner_id, service_slug')
      .limit(10);

    if (servicesError) {
      console.error('❌ Error fetching cleaner services:', servicesError.message);
      return false;
    }

    console.log(`✅ Found ${services.length} service mappings`);

    // Test 4: Check availability
    console.log('\n4️⃣ Testing cleaner availability...');
    const { data: availability, error: availabilityError } = await supabase
      .from('cleaner_availability')
      .select('cleaner_id, weekday, start_time, end_time')
      .limit(10);

    if (availabilityError) {
      console.error('❌ Error fetching availability:', availabilityError.message);
      return false;
    }

    console.log(`✅ Found ${availability.length} availability slots`);

    // Test 5: Test the RPC function
    console.log('\n5️⃣ Testing available_cleaners RPC...');
    const { data: availableCleaners, error: rpcError } = await supabase
      .rpc('available_cleaners', {
        p_area: 'CBD',
        p_service_slug: 'standard-cleaning',
        p_start: new Date('2024-01-15T10:00:00Z').toISOString(),
        p_end: new Date('2024-01-15T11:00:00Z').toISOString(),
        p_limit: 5
      });

    if (rpcError) {
      console.error('❌ Error calling available_cleaners RPC:', rpcError.message);
      return false;
    }

    console.log(`✅ RPC returned ${availableCleaners.length} available cleaners:`);
    availableCleaners.forEach(cleaner => {
      console.log(`   - ${cleaner.full_name} (${cleaner.rating}⭐) - ${cleaner.area_label}`);
    });

    console.log('\n🎉 All tests passed! The cleaners setup is working correctly.');
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the test
testCleanersSetup().then(success => {
  process.exit(success ? 0 : 1);
});
