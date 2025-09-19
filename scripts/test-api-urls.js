#!/usr/bin/env node

/**
 * Test API URL Construction
 * 
 * This script tests the API URL construction to ensure it works correctly
 */

console.log('🧪 Testing API URL construction...\n')

// Simulate the getApiBaseUrl function
function getApiBaseUrl() {
  // In production, use the configured base URL
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // In development or when NEXT_PUBLIC_BASE_URL is not set
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // Fallback for other environments
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

// Simulate the getApiUrl function
function getApiUrl(endpoint) {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

// Test getApiBaseUrl
console.log('1. Testing getApiBaseUrl():')
console.log('   Result:', getApiBaseUrl())

// Test getApiUrl with different endpoints
console.log('\n2. Testing getApiUrl() with different endpoints:')
const endpoints = [
  '/api/services',
  '/api/regions',
  '/api/suburbs',
  'api/bookings' // Test without leading slash
]

endpoints.forEach(endpoint => {
  const url = getApiUrl(endpoint)
  console.log(`   ${endpoint} -> ${url}`)
})

console.log('\n✅ API URL construction test completed!')
