#!/usr/bin/env node

/**
 * Test script for Paystack payment flow
 * 
 * This script tests the payment initiation and verification endpoints
 * to ensure they work correctly with the Paystack integration.
 * 
 * Usage: node scripts/test-payment-flow.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testPaymentFlow() {
  console.log('🧪 Testing Paystack Payment Flow...\n');

  try {
    // Test 1: Check if payment initiate endpoint exists
    console.log('1. Testing payment initiate endpoint...');
    const initiateResponse = await fetch(`${BASE_URL}/api/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId: 'test-booking-id'
      }),
    });

    console.log(`   Status: ${initiateResponse.status}`);
    
    if (initiateResponse.status === 401) {
      console.log('   ✅ Endpoint exists and requires authentication (expected)');
    } else if (initiateResponse.status === 400) {
      const data = await initiateResponse.json();
      console.log('   ✅ Endpoint exists and validates input (expected)');
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    } else {
      console.log('   ⚠️  Unexpected response status');
    }

    // Test 2: Check if payment verify endpoint exists
    console.log('\n2. Testing payment verify endpoint...');
    const verifyResponse = await fetch(`${BASE_URL}/api/payments/verify?reference=test-reference`);
    
    console.log(`   Status: ${verifyResponse.status}`);
    
    if (verifyResponse.status === 400) {
      const data = await verifyResponse.json();
      console.log('   ✅ Endpoint exists and validates input (expected)');
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    } else {
      console.log('   ⚠️  Unexpected response status');
    }

    // Test 3: Check if callback page exists
    console.log('\n3. Testing payment callback page...');
    const callbackResponse = await fetch(`${BASE_URL}/booking/payment/callback`);
    
    console.log(`   Status: ${callbackResponse.status}`);
    
    if (callbackResponse.status === 200) {
      console.log('   ✅ Callback page exists and is accessible');
    } else {
      console.log('   ⚠️  Callback page may not be accessible');
    }

    // Test 4: Check environment variables
    console.log('\n4. Checking environment variables...');
    const envCheck = {
      'PAYSTACK_SECRET_KEY': process.env.PAYSTACK_SECRET_KEY ? '✅ Set' : '❌ Missing',
      'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY': process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ? '✅ Set' : '❌ Missing',
      'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL ? '✅ Set' : '❌ Missing',
    };

    Object.entries(envCheck).forEach(([key, status]) => {
      console.log(`   ${key}: ${status}`);
    });

    console.log('\n🎉 Payment flow test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Set up your Paystack test account and get API keys');
    console.log('2. Add the required environment variables to your .env file');
    console.log('3. Test the complete flow with a real booking');
    console.log('4. Use Paystack test cards for development testing');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your Next.js development server is running');
    console.log('2. Check that all API routes are properly deployed');
    console.log('3. Verify your environment variables are set correctly');
  }
}

// Run the test
testPaymentFlow();
