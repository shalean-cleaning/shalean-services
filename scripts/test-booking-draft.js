#!/usr/bin/env node

/**
 * Test script for Booking Draft API Authentication
 * 
 * This script tests the booking draft creation flow:
 * 1. User signup and login
 * 2. Create a booking draft via API
 * 3. Verify the draft was created successfully
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testBookingDraft() {
  console.log('🧪 Testing Booking Draft API Authentication...\n')

  // Test 1: User Signup and Login
  console.log('1️⃣ Setting up test user...')
  const testEmail = `test-booking-${Date.now()}@example.com`
  const testPassword = 'testpassword123'
  
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        first_name: 'Test',
        last_name: 'User',
      },
    },
  })

  if (signupError) {
    console.error('❌ Signup failed:', signupError.message)
    return
  }

  console.log('✅ Signup successful')
  console.log('   User ID:', signupData.user?.id)

  // Wait for profile creation
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Login to get session
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  if (loginError) {
    console.error('❌ Login failed:', loginError.message)
    return
  }

  console.log('✅ Login successful')
  console.log('   Session token:', loginData.session?.access_token ? 'Present' : 'Missing')

  // Test 2: Create Booking Draft via API
  console.log('\n2️⃣ Testing booking draft creation...')
  
  // Get session cookies for the API request
  const session = loginData.session
  if (!session) {
    console.error('❌ No session available')
    return
  }

  // Create a test booking payload
  const bookingPayload = {
    serviceId: 'test-service-id', // This would normally be a real UUID
    suburbId: 'test-suburb-id',   // This would normally be a real UUID
    totalPrice: 150.00,
    bookingDate: '2024-02-15',
    startTime: '10:00',
    address: '123 Test Street',
    postcode: '8001',
    bedrooms: 2,
    bathrooms: 1,
    extras: [],
    specialInstructions: 'Test booking',
    frequency: 'one-time',
    timezone: 'Africa/Johannesburg',
    selectedCleanerId: null,
    autoAssign: true
  }

  try {
    // Make API request with session cookies
    const response = await fetch('http://localhost:3000/api/bookings/draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'Cookie': `sb-access-token=${session.access_token}; sb-refresh-token=${session.refresh_token}`
      },
      body: JSON.stringify(bookingPayload)
    })

    const result = await response.json()
    
    console.log('📡 API Response Status:', response.status)
    console.log('📡 API Response:', JSON.stringify(result, null, 2))

    if (response.ok) {
      console.log('✅ Booking draft created successfully!')
      console.log('   Booking ID:', result.id)
    } else {
      console.log('❌ Booking draft creation failed')
      console.log('   Error:', result.error || result.message)
    }

  } catch (error) {
    console.error('❌ API request failed:', error.message)
  }

  // Test 3: Cleanup
  console.log('\n3️⃣ Cleaning up test data...')
  
  // Delete the test user
  const { error: deleteError } = await supabase.auth.admin.deleteUser(
    signupData.user?.id || ''
  )

  if (deleteError) {
    console.log('⚠️  Could not delete test user:', deleteError.message)
    console.log('   You may need to delete manually:', testEmail)
  } else {
    console.log('✅ Test user deleted successfully')
  }

  console.log('\n🎉 Booking draft tests completed!')
}

// Run the tests
testBookingDraft().catch(console.error)
