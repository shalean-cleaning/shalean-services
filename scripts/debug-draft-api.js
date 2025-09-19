#!/usr/bin/env node

/**
 * Debug Draft API Script
 * 
 * This script tests the draft booking API to identify issues
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugDraftAPI() {
  console.log('🔍 Debugging draft API functionality...\n')

  try {
    // Step 1: Create a test user
    console.log('1️⃣ Creating test user...')
    const testEmail = `drafttest${Date.now()}@gmail.com`
    const testPassword = 'testpassword123'

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    if (signupError) {
      console.error('❌ Signup failed:', signupError.message)
      return
    }

    console.log('✅ Test user created:', testEmail)
    console.log('   User ID:', signupData.user?.id)

    // Step 2: Wait for profile creation
    console.log('\n2️⃣ Waiting for profile creation...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Step 3: Check if user has profile
    console.log('   Checking for profile...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signupData.user?.id)
      .single()

    if (profileError) {
      console.error('❌ Profile check failed:', profileError.message)
      console.log('   Error code:', profileError.code)
      console.log('   This might be the cause of the draft API failure')
      return
    }

    console.log('✅ Profile found:', profile.role)

    // Step 4: Get session for API calls
    console.log('\n3️⃣ Getting user session...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !sessionData.session) {
      console.error('❌ Session error:', sessionError?.message || 'No session')
      return
    }

    console.log('✅ Session obtained')

    // Step 5: Test draft API with authenticated user
    console.log('\n4️⃣ Testing draft API...')
    
    // First, try to get existing draft
    console.log('   Testing GET /api/bookings/draft...')
    const draftResponse = await fetch('http://localhost:3001/api/bookings/draft', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session.access_token}`
      }
    })

    console.log('   Draft GET response status:', draftResponse.status)
    
    if (draftResponse.ok) {
      const draftData = await draftResponse.json()
      console.log('✅ Draft API working:', draftData)
    } else {
      const errorData = await draftResponse.text()
      console.log('❌ Draft API error:', errorData)
    }

    // Step 6: Test creating a draft
    console.log('\n5️⃣ Testing draft creation...')
    
    const createDraftResponse = await fetch('http://localhost:3001/api/bookings/draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session.access_token}`
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
      console.log('✅ Draft creation working:', createData)
    } else {
      const errorData = await createDraftResponse.text()
      console.log('❌ Draft creation error:', errorData)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.error('   Stack:', error.stack)
  }
}

debugDraftAPI()
