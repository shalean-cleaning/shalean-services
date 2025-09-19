#!/usr/bin/env node

/**
 * Fix Draft API by Testing with Confirmed User
 * 
 * This script creates a confirmed user to test the draft API functionality
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

// Use service role key to create confirmed users
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDraftAPIWithConfirmedUser() {
  console.log('🔍 Testing draft API with confirmed user...\n')

  try {
    // Step 1: Create a confirmed user
    console.log('1️⃣ Creating confirmed user...')
    const testEmail = `confirmeddraft${Date.now()}@gmail.com`
    const testPassword = 'testpassword123'

    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    })

    if (userError) {
      console.error('❌ User creation failed:', userError.message)
      return
    }

    console.log('✅ Confirmed user created:', testEmail)
    console.log('   User ID:', userData.user.id)

    // Step 2: Wait for profile creation
    console.log('\n2️⃣ Waiting for profile creation...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Step 3: Check if user has profile
    console.log('   Checking for profile...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single()

    if (profileError) {
      console.error('❌ Profile check failed:', profileError.message)
      console.log('   Error code:', profileError.code)
      return
    }

    console.log('✅ Profile found:', profile.role)

    // Step 4: Test draft API with authenticated user
    console.log('\n3️⃣ Testing draft API...')
    
    // Create a client with the user's session
    const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // Sign in the user
    const { data: signInData, error: signInError } = await userClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message)
      return
    }

    console.log('✅ User signed in successfully')

    // Test GET draft API
    console.log('\n4️⃣ Testing GET /api/bookings/draft...')
    const draftResponse = await fetch('http://localhost:3001/api/bookings/draft', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signInData.session.access_token}`
      }
    })

    console.log('   Draft GET response status:', draftResponse.status)
    
    if (draftResponse.ok) {
      const draftData = await draftResponse.json()
      console.log('✅ Draft GET API working:', draftData)
    } else {
      const errorData = await draftResponse.text()
      console.log('❌ Draft GET API error:', errorData)
    }

    // Test POST draft API
    console.log('\n5️⃣ Testing POST /api/bookings/draft...')
    
    const createDraftResponse = await fetch('http://localhost:3001/api/bookings/draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${signInData.session.access_token}`
      },
      body: JSON.stringify({
        serviceId: 'test-service-id',
        suburbId: 'test-suburb-id',
        totalPrice: 100
      })
    })

    console.log('   Draft POST response status:', createDraftResponse.status)
    
    if (createDraftResponse.ok) {
      const createData = await createDraftResponse.json()
      console.log('✅ Draft POST API working:', createData)
    } else {
      const errorData = await createDraftResponse.text()
      console.log('❌ Draft POST API error:', errorData)
    }

    console.log('\n🎉 Draft API test completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.error('   Stack:', error.stack)
  }
}

testDraftAPIWithConfirmedUser()
