#!/usr/bin/env node

/**
 * Simple script to reproduce the database error
 * Run this after starting the Next.js server with: npm run dev
 */

// Use built-in fetch for Node.js 18+ or fallback to node-fetch
let fetch;
try {
  fetch = globalThis.fetch;
  if (!fetch) {
    throw new Error('No built-in fetch');
  }
} catch {
  try {
    fetch = require('node-fetch');
  } catch {
    console.error('❌ No fetch implementation available. Please install node-fetch or use Node.js 18+');
    process.exit(1);
  }
}

const BASE_URL = 'http://localhost:3000';

async function reproduceError() {
  console.log('🔍 Attempting to reproduce database error...');
  console.log('📡 Make sure the Next.js server is running with: npm run dev');
  console.log('=' .repeat(60));

  // Test 1: Try with complete booking data (most likely to cause database error)
  const testPayload = {
    serviceId: "550e8400-e29b-41d4-a716-446655440000",
    suburbId: "550e8400-e29b-41d4-a716-446655440000", 
    totalPrice: 150.00,
    address: "123 Test Street",
    postcode: "8001",
    bookingDate: "2024-02-15",
    startTime: "10:00",
    bedrooms: 2,
    bathrooms: 1,
    extras: [],
    specialInstructions: "Test booking",
    frequency: "one-time",
    timezone: "Africa/Johannesburg",
    selectedCleanerId: null,
    autoAssign: true
  };

  console.log('📤 Sending request with complete booking data...');
  console.log('📋 Payload:', JSON.stringify(testPayload, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/api/bookings/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📥 Response Body:`, JSON.stringify(responseData, null, 2));

    if (response.status === 500) {
      console.log('\n❌ 500 DATABASE ERROR REPRODUCED!');
      console.log('🔍 Check the server logs for detailed error information.');
      console.log('💡 The error details should show the specific database constraint issue.');
    } else if (response.status === 401) {
      console.log('\n✅ Got 401 (expected without auth) - no database error');
      console.log('💡 To test database errors, you need to be authenticated.');
    } else {
      console.log(`\n📊 Got status ${response.status} - check if this is the error you're seeing`);
    }

  } catch (error) {
    console.log('💥 Network Error:', error.message);
    console.log('🔧 Make sure the Next.js server is running on http://localhost:3000');
  }
}

// Run the test
reproduceError().catch(console.error);
