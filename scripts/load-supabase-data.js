#!/usr/bin/env node

/**
 * Script to load and display data from Supabase
 * This script connects to your Supabase instance and displays the current data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to display table data
async function displayTableData(tableName, columns = '*', orderBy = 'created_at') {
  console.log(`\n📊 ${tableName.toUpperCase()}`);
  console.log('='.repeat(50));
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(columns)
      .order(orderBy);
    
    if (error) {
      console.error(`❌ Error fetching ${tableName}:`, error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log(`📭 No data found in ${tableName}`);
      return;
    }
    
    console.log(`📈 Found ${data.length} records:`);
    console.log(JSON.stringify(data, null, 2));
    
    } catch (_err) {
      console.error(`❌ Exception fetching ${tableName}:`, _err.message);
    }
}

// Main function to load and display all data
async function loadSupabaseData() {
  console.log('🚀 Loading data from Supabase...');
  console.log(`🔗 URL: ${supabaseUrl}`);
  console.log(`🔑 Using: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role Key' : 'Anon Key'}`);
  
  // Test connection first
  try {
    const { error } = await supabase.from('service_categories').select('count').limit(1);
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return;
    }
    console.log('✅ Connection successful!');
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    return;
  }
  
  // Load data from all tables
  const tables = [
    { name: 'service_categories', columns: 'id, name, slug, description, icon, sort_order, created_at' },
    { name: 'services', columns: 'id, category_id, name, slug, description, base_price, base_price_cents, duration_minutes, sort_order, created_at' },
    { name: 'service_items', columns: 'id, service_id, name, description, price, sort_order, created_at' },
    { name: 'extras', columns: 'id, name, slug, description, price, price_cents, sort_order, created_at' },
    { name: 'regions', columns: 'id, name, slug, description, sort_order, created_at' },
    { name: 'suburbs', columns: 'id, region_id, name, slug, postcode, sort_order, created_at' },
    { name: 'areas', columns: 'id, suburb_id, name, description, sort_order, created_at' },
    { name: 'cleaners', columns: 'id, user_id, first_name, last_name, email, phone, bio, experience_years, hourly_rate, is_available, rating, total_reviews, profile_image_url, created_at' },
    { name: 'bookings', columns: 'id, customer_id, session_id, cleaner_id, area_id, service_id, service_slug, region_id, booking_date, start_time, end_time, status, total_price, notes, special_instructions, auto_assign, address, postcode, bedrooms, bathrooms, paystack_ref, paystack_status, created_at' },
    { name: 'booking_extras', columns: 'id, booking_id, extra_id, quantity, price, created_at' },
    { name: 'testimonials', columns: 'id, customer_name, customer_email, rating, review_text, service_type, is_featured, is_approved, created_at' },
    { name: 'blog_posts', columns: 'id, title, slug, excerpt, content, featured_image_url, author_name, author_email, is_published, published_at, created_at' },
    { name: 'frequency_discounts', columns: 'id, name, frequency_weeks, discount_percentage, is_active, created_at' },
    { name: 'profiles', columns: 'id, first_name, last_name, phone, avatar_url, created_at' }
  ];
  
  for (const table of tables) {
    await displayTableData(table.name, table.columns);
  }
  
  // Display summary statistics
  console.log('\n📊 SUMMARY STATISTICS');
  console.log('='.repeat(50));
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`${table.name}: ${count || 0} records`);
      }
    } catch {
      console.log(`${table.name}: Error getting count`);
    }
  }
  
  console.log('\n✅ Data loading complete!');
}

// Run the script
if (require.main === module) {
  loadSupabaseData().catch(console.error);
}

module.exports = { loadSupabaseData, displayTableData };
