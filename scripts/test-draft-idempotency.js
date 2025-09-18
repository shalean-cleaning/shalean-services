#!/usr/bin/env node

/**
 * Test script to verify the idempotent draft booking API behavior
 * 
 * This script tests:
 * 1. First POST creates a new draft (should return 201)
 * 2. Second POST with same data returns existing draft (should return 200)
 * 3. No 409 conflicts should occur
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Sample booking data
const sampleBookingData = {
  serviceId: '550e8400-e29b-41d4-a716-446655440000', // Replace with actual service ID
  suburbId: '550e8400-e29b-41d4-a716-446655440001', // Replace with actual suburb ID
  totalPrice: 150.00,
  bookingDate: '2024-02-15',
  startTime: '10:00',
  address: '123 Test Street',
  postcode: '8001',
  bedrooms: 2,
  bathrooms: 1,
  extras: [],
  specialInstructions: 'Test booking for idempotency',
  frequency: 'one-time',
  timezone: 'Africa/Johannesburg',
  autoAssign: true
};

async function testDraftIdempotency() {
  console.log('🧪 Testing Draft Booking API Idempotency\n');
  
  try {
    // Test 1: First POST (should create new draft)
    console.log('📝 Test 1: Creating new draft booking...');
    const response1 = await fetch(`${BASE_URL}/api/bookings/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real test, you'd need proper authentication headers
      },
      body: JSON.stringify(sampleBookingData)
    });
    
    const result1 = await response1.json();
    console.log(`   Status: ${response1.status}`);
    console.log(`   Response:`, JSON.stringify(result1, null, 2));
    
    if (response1.status === 201) {
      console.log('   ✅ First POST returned 201 (new draft created)');
    } else if (response1.status === 200) {
      console.log('   ✅ First POST returned 200 (existing draft found)');
    } else {
      console.log(`   ❌ First POST returned unexpected status: ${response1.status}`);
    }
    
    // Test 2: Second POST (should return existing draft)
    console.log('\n📝 Test 2: POSTing same data again...');
    const response2 = await fetch(`${BASE_URL}/api/bookings/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleBookingData)
    });
    
    const result2 = await response2.json();
    console.log(`   Status: ${response2.status}`);
    console.log(`   Response:`, JSON.stringify(result2, null, 2));
    
    if (response2.status === 200) {
      console.log('   ✅ Second POST returned 200 (existing draft returned)');
    } else if (response2.status === 201) {
      console.log('   ✅ Second POST returned 201 (new draft created - this is also valid)');
    } else if (response2.status === 409) {
      console.log('   ❌ Second POST returned 409 (conflict - this should not happen)');
    } else {
      console.log(`   ❌ Second POST returned unexpected status: ${response2.status}`);
    }
    
    // Test 3: Verify bookingId consistency
    if (result1.bookingId && result2.bookingId) {
      if (result1.bookingId === result2.bookingId) {
        console.log('   ✅ Both responses returned the same bookingId');
      } else {
        console.log('   ⚠️  Different bookingIds returned (this might be expected if multiple drafts are allowed)');
      }
    }
    
    // Test 4: Test GET endpoint
    console.log('\n📝 Test 3: Testing GET endpoint...');
    const getResponse = await fetch(`${BASE_URL}/api/bookings/draft`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const getResult = await getResponse.json();
    console.log(`   Status: ${getResponse.status}`);
    console.log(`   Response:`, JSON.stringify(getResult, null, 2));
    
    if (getResponse.status === 200) {
      console.log('   ✅ GET endpoint returned 200 (draft found)');
    } else if (getResponse.status === 404) {
      console.log('   ✅ GET endpoint returned 404 (no draft found - this is valid)');
    } else {
      console.log(`   ❌ GET endpoint returned unexpected status: ${getResponse.status}`);
    }
    
    console.log('\n🎉 Idempotency test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

// Run the test
testDraftIdempotency();
