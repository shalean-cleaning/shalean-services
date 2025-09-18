#!/usr/bin/env node

/**
 * Script to run the homepage migration
 * This script applies the database migration to add missing tables for the homepage
 * 
 * Usage:
 * 1. For local development: node scripts/run-homepage-migration.js --local
 * 2. For remote database: node scripts/run-homepage-migration.js --remote
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config();

// Check command line arguments
const isLocal = process.argv.includes('--local');
const isRemote = process.argv.includes('--remote');

if (!isLocal && !isRemote) {
  console.log('🔧 Homepage Migration Script');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/run-homepage-migration.js --local   # For local Supabase');
  console.log('  node scripts/run-homepage-migration.js --remote  # For remote Supabase');
  console.log('');
  console.log('For local development:');
  console.log('  1. Run: supabase start');
  console.log('  2. Run: node scripts/run-homepage-migration.js --local');
  console.log('');
  console.log('For remote database:');
  console.log('  1. Set environment variables in .env file');
  console.log('  2. Run: node scripts/run-homepage-migration.js --remote');
  process.exit(0);
}

let supabase;
let supabaseUrl;
let supabaseServiceKey;

if (isLocal) {
  // For local development, get the values from Supabase CLI
  try {
    console.log('🔍 Getting local Supabase configuration...');
    const output = execSync('supabase status', { encoding: 'utf8' });
    
    // Parse the output to get the URL and keys
    const urlMatch = output.match(/API URL:\s*(.+)/);
    const anonKeyMatch = output.match(/anon key:\s*(.+)/);
    const serviceKeyMatch = output.match(/service_role key:\s*(.+)/);
    
    if (!urlMatch || !anonKeyMatch || !serviceKeyMatch) {
      console.error('❌ Could not parse Supabase status output');
      console.error('Make sure Supabase is running: supabase start');
      process.exit(1);
    }
    
    supabaseUrl = urlMatch[1].trim();
    supabaseServiceKey = serviceKeyMatch[1].trim();
    
    console.log('✅ Found local Supabase configuration');
    console.log(`   URL: ${supabaseUrl}`);
    
  } catch (error) {
    console.error('❌ Error getting Supabase status:', error.message);
    console.error('Make sure Supabase CLI is installed and running:');
    console.error('  1. Install: npm install -g supabase');
    console.error('  2. Start: supabase start');
    process.exit(1);
  }
} else {
  // For remote database
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL');
    console.error('   SUPABASE_SERVICE_ROLE_KEY');
    console.error('');
    console.error('Create a .env file with these values from your Supabase project dashboard');
    process.exit(1);
  }
}

supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting homepage migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '004_add_missing_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Running migration: 004_add_missing_tables.sql');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Added tables:');
    console.log('   - blog_posts (for blog preview)');
    console.log('   - content_blocks (fixed structure for homepage content)');
    console.log('   - Sample data for development');
    
    // Verify tables exist
    console.log('\n🔍 Verifying tables...');
    
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['blog_posts', 'content_blocks', 'team_members', 'testimonials']);
    
    if (tableError) {
      console.error('❌ Error verifying tables:', tableError);
    } else {
      console.log('✅ Tables verified:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }
    
    // Check sample data
    console.log('\n📊 Checking sample data...');
    
    const { data: contentBlocks, error: cbError } = await supabase
      .from('content_blocks')
      .select('count')
      .eq('is_active', true);
    
    const { data: blogPosts, error: bpError } = await supabase
      .from('blog_posts')
      .select('count')
      .eq('is_published', true);
    
    if (!cbError && !bpError) {
      console.log(`✅ Content blocks: ${contentBlocks?.length || 0} active`);
      console.log(`✅ Blog posts: ${blogPosts?.length || 0} published`);
    }
    
    console.log('\n🎉 Homepage migration completed successfully!');
    console.log('💡 The homepage should now load dynamic content from the database.');
    
  } catch (error) {
    console.error('❌ Migration failed with error:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
