#!/usr/bin/env node

/**
 * Fix Local Environment Configuration
 * 
 * This script helps fix the .env.local file for local development
 * by updating the APP_URL and BASE_URL to use localhost:3002
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Update the URLs to use localhost:3002 for local development
envContent = envContent.replace(
  /NEXT_PUBLIC_APP_URL="https:\/\/shalean-services\.vercel\.app\/"/,
  'NEXT_PUBLIC_APP_URL="http://localhost:3002"'
);

envContent = envContent.replace(
  /NEXT_PUBLIC_BASE_URL="https:\/\/shalean-services\.vercel\.app\/"/,
  'NEXT_PUBLIC_BASE_URL="http://localhost:3002"'
);

fs.writeFileSync(envPath, envContent);

console.log('✅ Updated .env.local for local development');
console.log('   - NEXT_PUBLIC_APP_URL: http://localhost:3002');
console.log('   - NEXT_PUBLIC_BASE_URL: http://localhost:3002');
console.log('');
console.log('🔄 Please restart your development server for changes to take effect');
