#!/usr/bin/env node

/**
 * Test Login with Confirmed User Script
 * 
 * This script creates a confirmed user for testing login functionality
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

// Use service role key to bypass RLS and create confirmed users
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testLoginWithConfirmedUser() {
  console.log('🔍 Testing login with confirmed user...\n')

  const testEmail = `confirmeduser${Date.now()}@gmail.com`
  const testPassword = 'testpassword123'

  try {
    // Step 1: Create user with service role (bypasses email confirmation)
    console.log('1️⃣ Creating confirmed user...')
    
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // This confirms the email automatically
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
      }
    })

    if (userError) {
      console.error('❌ User creation failed:', userError.message)
      return
    }

    console.log('✅ Confirmed user created successfully')
    console.log('   User ID:', userData.user?.id)
    console.log('   Email:', userData.user?.email)
    console.log('   Email confirmed:', userData.user?.email_confirmed_at ? 'Yes' : 'No')

    // Step 2: Test login with the confirmed user
    console.log('\n2️⃣ Testing login with confirmed user...')
    
    // Create a new client with anonymous key for login test
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (loginError) {
      console.error('❌ Login failed:', loginError.message)
      return
    }

    console.log('✅ Login successful!')
    console.log('   User ID:', loginData.user?.id)
    console.log('   Session exists:', !!loginData.session)

    // Step 3: Test session and profile access
    console.log('\n3️⃣ Testing session and profile access...')
    
    const { data: { user }, error: userError2 } = await anonClient.auth.getUser()
    
    if (userError2) {
      console.error('❌ Session check failed:', userError2.message)
      return
    }

    if (user) {
      console.log('✅ Session is valid')
      
      // Check profile
      const { data: profile, error: profileError } = await anonClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('❌ Profile access failed:', profileError.message)
        return
      }

      console.log('✅ Profile access successful')
      console.log('   Role:', profile.role)
      console.log('   Name:', profile.first_name, profile.last_name)
    }

    console.log('\n🎉 Login functionality is working correctly!')
    console.log('\n📝 Summary:')
    console.log('   - Email confirmation is enabled in production')
    console.log('   - Users must confirm their email before logging in')
    console.log('   - Login functionality works when email is confirmed')
    console.log('\n💡 Solutions:')
    console.log('   1. Disable email confirmation in Supabase Dashboard')
    console.log('   2. Implement email confirmation flow in the app')
    console.log('   3. Use admin API to create confirmed users for testing')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the test
testLoginWithConfirmedUser()
