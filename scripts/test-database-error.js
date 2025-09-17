#!/usr/bin/env node

/**
 * Test script to reproduce and diagnose the specific database error
 * This will help identify the exact issue causing the database error
 */

// Use built-in fetch for Node.js 18+ or fallback to node-fetch
let fetch;
try {
  fetch = globalThis.fetch;
  if (!fetch) {
    throw new Error('No built-in fetch');
  }
} catch (error) {
  try {
    fetch = require('node-fetch');
  } catch (requireError) {
    console.error('❌ No fetch implementation available. Please install node-fetch or use Node.js 18+');
    process.exit(1);
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Test cases that might cause database errors
const testCases = [
  {
    name: "Complete valid booking data",
    payload: {
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
    }
  },
  {
    name: "Booking with non-existent serviceId",
    payload: {
      serviceId: "00000000-0000-0000-0000-000000000000",
      suburbId: "550e8400-e29b-41d4-a716-446655440000",
      totalPrice: 150.00,
      address: "123 Test Street",
      postcode: "8001",
      bookingDate: "2024-02-15",
      startTime: "10:00",
      bedrooms: 2,
      bathrooms: 1
    }
  },
  {
    name: "Booking with non-existent suburbId",
    payload: {
      serviceId: "550e8400-e29b-41d4-a716-446655440000",
      suburbId: "00000000-0000-0000-0000-000000000000",
      totalPrice: 150.00,
      address: "123 Test Street",
      postcode: "8001",
      bookingDate: "2024-02-15",
      startTime: "10:00",
      bedrooms: 2,
      bathrooms: 1
    }
  },
  {
    name: "Booking with invalid cleanerId",
    payload: {
      serviceId: "550e8400-e29b-41d4-a716-446655440000",
      suburbId: "550e8400-e29b-41d4-a716-446655440000",
      totalPrice: 150.00,
      address: "123 Test Street",
      postcode: "8001",
      bookingDate: "2024-02-15",
      startTime: "10:00",
      bedrooms: 2,
      bathrooms: 1,
      selectedCleanerId: "00000000-0000-0000-0000-000000000000"
    }
  }
];

async function testDatabaseErrors() {
  console.log(`🧪 Testing database errors on /api/bookings/draft at ${BASE_URL}`);
  console.log('=' .repeat(60));
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let databaseErrors = 0;

  for (const testCase of testCases) {
    totalTests++;
    console.log(`\n📋 Test ${totalTests}: ${testCase.name}`);
    console.log(`📤 Payload:`, JSON.stringify(testCase.payload, null, 2));
    
    try {
      const response = await fetch(`${BASE_URL}/api/bookings/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: No authentication - should get 401, but we want to see if any database errors occur
        },
        body: JSON.stringify(testCase.payload)
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        responseData = { raw: responseText };
      }

      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      console.log(`📥 Response:`, JSON.stringify(responseData, null, 2));

      if (response.status === 500) {
        databaseErrors++;
        console.log(`❌ 500 DATABASE ERROR DETECTED!`);
        console.log(`🔍 This is the specific error we need to fix.`);
        
        // Check if it's a database-related error
        if (responseData.error === "Database error" || 
            responseData.details?.includes("database") ||
            responseData.details?.includes("constraint") ||
            responseData.details?.includes("foreign key")) {
          console.log(`🗄️  Confirmed: This is a database constraint/error issue`);
        }
      } else if (response.status === 401) {
        console.log(`✅ Expected 401 (no auth) - no database error`);
        passedTests++;
      } else if (response.status >= 400 && response.status < 500) {
        console.log(`✅ Expected client error (4xx)`);
        passedTests++;
      } else if (response.status >= 200 && response.status < 300) {
        console.log(`✅ Success response`);
        passedTests++;
      } else {
        console.log(`⚠️  Unexpected status code`);
        failedTests++;
      }

    } catch (error) {
      failedTests++;
      console.log(`💥 Network/Request Error:`, error.message);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log(`📊 Test Summary:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${failedTests}`);
  console.log(`   🗄️  Database Errors: ${databaseErrors}`);
  
  if (databaseErrors > 0) {
    console.log(`\n❌ Found ${databaseErrors} database error(s)!`);
    console.log(`🔍 Check the server logs for detailed database error information.`);
    console.log(`💡 The error is likely related to:`);
    console.log(`   - Foreign key constraints (non-existent serviceId/suburbId/cleanerId)`);
    console.log(`   - Missing required fields in database insert`);
    console.log(`   - Unique constraint violations`);
    console.log(`   - Data type mismatches`);
  } else {
    console.log(`\n✅ No database errors detected in these test cases.`);
    console.log(`💡 The database error might occur with authentication or specific data.`);
  }
}

// Run the tests
testDatabaseErrors().catch(console.error);
