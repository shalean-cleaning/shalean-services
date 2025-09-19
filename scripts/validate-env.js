#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * This script validates that all required environment variables are present.
 * It distinguishes between client-side variables (required) and server-side 
 * variables (warnings only for local development).
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Required client-side environment variables
const REQUIRED_CLIENT_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_BASE_URL'
];

// Server-side environment variables (warnings only)
const SERVER_VARS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'PAYSTACK_SECRET_KEY',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'RESEND_FROM_NAME'
];

function validateEnvironment() {
  const missingRequired = [];
  const missingServer = [];
  
  // Check required client-side variables
  for (const varName of REQUIRED_CLIENT_VARS) {
    if (!process.env[varName]) {
      missingRequired.push(varName);
    }
  }
  
  // Check server-side variables (warnings only)
  for (const varName of SERVER_VARS) {
    if (!process.env[varName]) {
      missingServer.push(varName);
    }
  }
  
  // Report results
  if (missingRequired.length === 0 && missingServer.length === 0) {
    console.log('✅ env ok');
    process.exit(0);
  }
  
  // Report missing required variables
  if (missingRequired.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingRequired.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease set these variables in your .env.local file');
  }
  
  // Report missing server variables (warnings)
  if (missingServer.length > 0) {
    console.warn('\n⚠️  Missing server-side environment variables (warnings only):');
    missingServer.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
    console.warn('These are optional for local development but may be needed for production');
  }
  
  // Exit with error code if required variables are missing
  if (missingRequired.length > 0) {
    process.exit(1);
  }
  
  process.exit(0);
}

// Run validation
validateEnvironment();
