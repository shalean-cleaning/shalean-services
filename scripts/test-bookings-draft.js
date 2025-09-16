#!/usr/bin/env node

/**
 * Test script for /api/bookings/draft endpoint
 * Tests various validation scenarios to ensure proper error handling
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test data - you'll need to replace these with actual UUIDs from your database
const TEST_DATA = {
  validCustomerId: '00000000-0000-0000-0000-000000000001', // Replace with real UUID
  validServiceId: '00000000-0000-0000-0000-000000000002',  // Replace with real UUID
  validSuburbId: '00000000-0000-0000-0000-000000000003',  // Replace with real UUID
  validRegionId: '00000000-0000-0000-0000-000000000004', // Replace with real UUID
  validExtraId: '00000000-0000-0000-0000-000000000005',  // Replace with real UUID
};

async function testEndpoint(data, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log('Data:', JSON.stringify(data, null, 2));
  
  try {
    const response = await fetch(`${BASE_URL}/api/bookings/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    return { status: response.status, result };
  } catch (error) {
    console.error('Request failed:', error);
    return { status: 0, result: { error: error.message } };
  }
}

async function runTests() {
  console.log('🚀 Starting /api/bookings/draft endpoint tests...\n');
  
  // Test 1: Valid request with ISO dates (customerId derived from session)
  await testEndpoint({
    serviceId: TEST_DATA.validServiceId,
    suburbId: TEST_DATA.validSuburbId,
    totalPrice: 150.00,
    startISO: '2024-02-15T10:00:00+02:00',
    endISO: '2024-02-15T12:00:00+02:00',
    address: '123 Test Street',
    postcode: '2000',
    bedrooms: 2,
    bathrooms: 1,
    extras: [{
      id: TEST_DATA.validExtraId,
      quantity: 1,
      price: 25.00
    }]
  }, 'Valid request with ISO dates (customerId derived from session)');
  
  // Test 2: Valid request with date + time
  await testEndpoint({
    serviceId: TEST_DATA.validServiceId,
    suburbId: TEST_DATA.validSuburbId,
    totalPrice: 120.00,
    bookingDate: '2024-02-15',
    startTime: '14:00',
    address: '456 Test Avenue',
    postcode: '2001',
    bedrooms: 1,
    bathrooms: 1
  }, 'Valid request with date + time');
  
  // Test 3: Invalid UUID format
  await testEndpoint({
    serviceId: 'invalid-uuid',
    suburbId: TEST_DATA.validSuburbId,
    totalPrice: 100.00,
    startISO: '2024-02-15T10:00:00+02:00',
    endISO: '2024-02-15T12:00:00+02:00',
    address: '789 Test Road',
    postcode: '2002'
  }, 'Invalid UUID format');
  
  // Test 4: Missing required fields
  await testEndpoint({
    serviceId: TEST_DATA.validServiceId,
    suburbId: TEST_DATA.validSuburbId,
    totalPrice: 100.00,
    address: '789 Test Road',
    postcode: '2002'
  }, 'Missing required fields');
  
  // Test 5: Invalid ISO date format
  await testEndpoint({
    serviceId: TEST_DATA.validServiceId,
    suburbId: TEST_DATA.validSuburbId,
    totalPrice: 100.00,
    startISO: '2024-02-15 10:00:00', // Invalid format
    endISO: '2024-02-15T12:00:00+02:00',
    address: '789 Test Road',
    postcode: '2002'
  }, 'Invalid ISO date format');
  
  // Test 6: Negative total price
  await testEndpoint({
    serviceId: TEST_DATA.validServiceId,
    suburbId: TEST_DATA.validSuburbId,
    totalPrice: -50.00,
    startISO: '2024-02-15T10:00:00+02:00',
    endISO: '2024-02-15T12:00:00+02:00',
    address: '789 Test Road',
    postcode: '2002'
  }, 'Negative total price');
  
  // Test 7: Invalid bedroom/bathroom count
  await testEndpoint({
    serviceId: TEST_DATA.validServiceId,
    suburbId: TEST_DATA.validSuburbId,
    totalPrice: 100.00,
    startISO: '2024-02-15T10:00:00+02:00',
    endISO: '2024-02-15T12:00:00+02:00',
    address: '789 Test Road',
    postcode: '2002',
    bedrooms: 0,
    bathrooms: -1
  }, 'Invalid bedroom/bathroom count');
  
  // Test 8: Non-existent UUIDs (will test database validation)
  await testEndpoint({
    serviceId: '00000000-0000-0000-0000-000000000998',
    suburbId: '00000000-0000-0000-0000-000000000997',
    totalPrice: 100.00,
    startISO: '2024-02-15T10:00:00+02:00',
    endISO: '2024-02-15T12:00:00+02:00',
    address: '789 Test Road',
    postcode: '2002'
  }, 'Non-existent UUIDs (database validation)');
  
  console.log('\n✅ All tests completed!');
  console.log('\n📝 Note: Replace the test UUIDs with actual UUIDs from your database for accurate testing.');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };
