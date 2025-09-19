#!/usr/bin/env node

/**
 * Test script for Supabase Authentication
 * 
 * This script tests the authentication flow:
 * 1. User signup
 * 2. Profile creation via trigger
 * 3. User login
 * 4. Role-based access
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Environment variables loaded:')
console.log('SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing')
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Found' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuthentication() {
  console.log('🧪 Testing Supabase Authentication...\n')

  // Test 1: User Signup
  console.log('1️⃣ Testing user signup...')
  const testEmail = `testuser${Date.now()}@gmail.com`
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
  console.log('   Email:', signupData.user?.email)

  // Test 2: User Login
  console.log('\n2️⃣ Testing user login...')
  
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  if (loginError) {
    console.error('❌ Login failed:', loginError.message)
    return
  }

  console.log('✅ Login successful')
  console.log('   User ID:', loginData.user?.id)

  // Test 3: Check Profile Creation (after authentication)
  console.log('\n3️⃣ Testing profile creation...')
  
  // Wait a moment for the trigger to execute
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signupData.user?.id)

  if (profileError) {
    console.error('❌ Profile creation failed:', profileError.message)
    return
  }

  if (!profile || profile.length === 0) {
    console.error('❌ No profile found for user')
    return
  }

  const userProfile = profile[0]
  console.log('✅ Profile created successfully')
  console.log('   Role:', userProfile.role)
  console.log('   Name:', userProfile.first_name, userProfile.last_name)

  // Test 4: Test RLS Policies
  console.log('\n4️⃣ Testing RLS policies...')
  
  // Test reading own profile
  const { data: _ownProfile, error: ownProfileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', loginData.user?.id)
    .single()

  if (ownProfileError) {
    console.error('❌ Reading own profile failed:', ownProfileError.message)
  } else {
    console.log('✅ Can read own profile')
  }

  // Test reading other profiles (should fail for customer)
  const { data: _otherProfiles, error: otherProfilesError } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', loginData.user?.id)
    .limit(1)

  if (otherProfilesError) {
    console.log('✅ RLS correctly blocks reading other profiles')
  } else {
    console.log('⚠️  RLS may not be working correctly - could read other profiles')
  }

  // Test 5: Cleanup
  console.log('\n5️⃣ Cleaning up test data...')
  
  // Delete the test user (this will cascade to profile due to foreign key)
  const { error: deleteError } = await supabase.auth.admin.deleteUser(
    signupData.user?.id || ''
  )

  if (deleteError) {
    console.log('⚠️  Could not delete test user:', deleteError.message)
    console.log('   You may need to delete manually:', testEmail)
  } else {
    console.log('✅ Test user deleted successfully')
  }

  console.log('\n🎉 Authentication tests completed!')
}

// Run the tests
testAuthentication().catch(console.error)
