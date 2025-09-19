#!/usr/bin/env node

/**
 * Check Profiles Script
 * 
 * This script checks if profiles exist and tests the trigger
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

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProfiles() {
  console.log('🔍 Checking profiles...\n')

  try {
    // Check if we can query the profiles table
    console.log('1. Checking if profiles table is accessible...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)

    if (profilesError) {
      console.error('❌ Error querying profiles:', profilesError.message)
      return
    }

    console.log('✅ Profiles table is accessible')
    console.log(`   Found ${profiles.length} profiles`)

    if (profiles.length > 0) {
      console.log('   Sample profile:', profiles[0])
    }

    // Try to sign up a new user and immediately check for profile
    console.log('\n2. Testing signup and immediate profile check...')
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

    // Wait a bit longer for the trigger
    console.log('\n3. Waiting for trigger to execute...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Check for the profile
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signupData.user?.id)

    if (profileError) {
      console.error('❌ Error checking for new profile:', profileError.message)
    } else if (newProfile && newProfile.length > 0) {
      console.log('✅ Profile created by trigger!')
      console.log('   Profile data:', newProfile[0])
    } else {
      console.log('❌ No profile found - trigger may not be working')
      
      // Let's try to manually call the trigger function
      console.log('\n4. Testing manual trigger function call...')
      const { data: manualResult, error: manualError } = await supabase
        .rpc('handle_new_user')
      
      if (manualError) {
        console.error('❌ Manual function call failed:', manualError.message)
      } else {
        console.log('✅ Manual function call result:', manualResult)
      }
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message)
  }
}

// Run the check
checkProfiles()
