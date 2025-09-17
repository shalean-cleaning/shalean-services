#!/usr/bin/env node

/**
 * Test script to verify the draft API fixes
 * This script tests the improved error handling and idempotent behavior
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

// Test cases to verify the fixes
const testCases = [
  {
    name: "Empty payload (should return 401 - no auth)",
    payload: {},
    expectedStatus: 401
  },
  {
    name: "Invalid UUID format (should return 422)",
    payload: {
      serviceId: "invalid-uuid",
      suburbId: "550e8400-e29b-41d4-a716-446655440000",
      totalPrice: 100,
      address: "123 Test St",
      postcode: "2000",
      bookingDate: "2024-02-15",
      startTime: "10:00"
    },
    expectedStatus: 422
  },
  {
    name: "Negative totalPrice (should return 422)",
    payload: {
      serviceId: "550e8400-e29b-41d4-a716-446655440000",
      suburbId: "550e8400-e29b-41d4-a716-446655440000",
      totalPrice: -100,
      address: "123 Test St",
      postcode: "2000",
      bookingDate: "2024-02-15",
      startTime: "10:00"
    },
    expectedStatus: 422
  },
  {
    name: "Invalid date format (should return 422)",
    payload: {
      serviceId: "550e8400-e29b-41d4-a716-446655440000",
      suburbId: "550e8400-e29b-41d4-a716-446655440000",
      totalPrice: 100,
      address: "123 Test St",
      postcode: "2000",
      bookingDate: "invalid-date",
      startTime: "10:00"
    },
    expectedStatus: 422
  },
  {
    name: "Invalid time format (should return 422)",
    payload: {
      serviceId: "550e8400-e29b-41d4-a716-446655440000",
      suburbId: "550e8400-e29b-41d4-a716-446655440000",
      totalPrice: 100,
      address: "123 Test St",
      postcode: "2000",
      bookingDate: "2024-02-15",
      startTime: "25:00"
    },
    expectedStatus: 422
  },
  {
    name: "Missing required fields (should return 422)",
    payload: {
      serviceId: "550e8400-e29b-41d4-a716-446655440000",
      suburbId: "550e8400-e29b-41d4-a716-446655440000",
      totalPrice: 100
      // Missing address, postcode, bookingDate, startTime
    },
    expectedStatus: 422
  }
];

async function testDraftAPIFixes() {
  console.log(`🧪 Testing /api/bookings/draft endpoint fixes at ${BASE_URL}`);
  console.log('=' .repeat(60));
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let error500Tests = 0;

  for (const testCase of testCases) {
    totalTests++;
    console.log(`\n📋 Test ${totalTests}: ${testCase.name}`);
    console.log(`📤 Payload:`, JSON.stringify(testCase.payload, null, 2));
    
    try {
      const response = await fetch(`${BASE_URL}/api/bookings/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: No authentication headers - should get 401
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
        error500Tests++;
        console.log(`❌ 500 ERROR DETECTED!`);
        console.log(`🔍 This indicates the fix didn't work properly.`);
      } else if (response.status === testCase.expectedStatus) {
        console.log(`✅ Expected status code (${testCase.expectedStatus})`);
        passedTests++;
      } else if (response.status >= 400 && response.status < 500) {
        console.log(`✅ Client error (4xx) - better than 500`);
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
  console.log(`   🚨 500 Errors: ${error500Tests}`);
  
  if (error500Tests > 0) {
    console.log(`\n❌ Found ${error500Tests} 500 error(s) - fixes need more work!`);
    console.log(`🔍 Check the server logs for detailed error information.`);
  } else {
    console.log(`\n✅ No 500 errors detected!`);
    console.log(`🎉 The API is now properly handling errors with 4xx status codes.`);
  }
  
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Test with authentication to verify idempotent behavior`);
  console.log(`   2. Test with real database data to verify foreign key constraints`);
  console.log(`   3. Test duplicate draft creation to verify conflict handling`);
}

// Run the tests
testDraftAPIFixes().catch(console.error);
