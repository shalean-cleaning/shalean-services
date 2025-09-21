#!/usr/bin/env node

/**
 * Test Quick Quote APIs
 * 
 * This script tests all Quick Quote related API endpoints to ensure they work correctly.
 */

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testEndpoint(url, name) {
  try {
    console.log(`🧪 Testing ${name}...`);
    const response = await fetch(`${baseUrl}${url}`);
    
    if (!response.ok) {
      console.error(`❌ ${name} failed: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(`   Response: ${text}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`✅ ${name} succeeded`);
    console.log(`   Response type: ${Array.isArray(data) ? 'array' : 'object'}`);
    console.log(`   Data length: ${Array.isArray(data) ? data.length : Object.keys(data).length}`);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log(`   Sample item: ${JSON.stringify(data[0], null, 2).substring(0, 100)}...`);
    } else if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      console.log(`   Keys: ${keys.join(', ')}`);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const firstValue = data[firstKey];
        if (Array.isArray(firstValue)) {
          console.log(`   ${firstKey} length: ${firstValue.length}`);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ ${name} error:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing Quick Quote APIs...');
  console.log(`📍 Base URL: ${baseUrl}`);
  console.log('');
  
  const endpoints = [
    { url: '/api/services', name: 'Services API' },
    { url: '/api/service-categories', name: 'Service Categories API' },
    { url: '/api/extras', name: 'Extras API' },
    { url: '/api/regions', name: 'Regions API' },
    { url: '/api/suburbs', name: 'Suburbs API' },
    { url: '/api/frequency-discounts', name: 'Frequency Discounts API' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint.url, endpoint.name);
    if (success) {
      passed++;
    } else {
      failed++;
    }
    console.log('');
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed > 0) {
    console.log('');
    console.log('💡 Troubleshooting Tips:');
    console.log('1. Make sure the Next.js development server is running (npm run dev)');
    console.log('2. Check that Supabase environment variables are set correctly');
    console.log('3. Verify that the database tables exist and have data');
    console.log('4. Run the seeding script: node scripts/seed-quick-quote-data.js');
    process.exit(1);
  } else {
    console.log('');
    console.log('🎉 All Quick Quote APIs are working correctly!');
  }
}

if (require.main === module) {
  main();
}
