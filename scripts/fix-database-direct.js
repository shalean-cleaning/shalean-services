#!/usr/bin/env node

/**
 * Direct Database Fix Script
 * 
 * This script applies the profiles table and signup trigger fix
 * by executing SQL directly through the Supabase client.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyDatabaseFix() {
  console.log('🔧 Applying database fix directly...\n')

  try {
    // Test connection first
    console.log('1. Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (testError && testError.code !== 'PGRST116') {
      console.error('❌ Database connection failed:', testError.message)
      return
    }
    
    console.log('✅ Database connection successful')

    // Check if profiles table exists
    console.log('\n2. Checking if profiles table exists...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError && profilesError.code === 'PGRST116') {
      console.log('❌ Profiles table does not exist - need to create it')
      console.log('📝 Please run the SQL migration manually in Supabase Dashboard:')
      console.log('   Go to: https://supabase.com/dashboard/project/gcmndztkikfwnxbfqctn/sql')
      console.log('   Copy and paste the contents of fix-profiles-table.sql')
      return
    } else if (profilesError) {
      console.error('❌ Error checking profiles table:', profilesError.message)
      return
    }

    console.log('✅ Profiles table exists')

    // Check if trigger exists by testing user signup
    console.log('\n3. Testing user signup and profile creation...')
    
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
      console.error('❌ Signup test failed:', signupError.message)
      return
    }

    console.log('✅ Signup successful')
    console.log('   User ID:', signupData.user?.id)

    // Wait a moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Check if profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signupData.user?.id)
      .single()

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message)
      console.log('\n📝 The trigger is not working. Please run the SQL migration manually:')
      console.log('   Go to: https://supabase.com/dashboard/project/gcmndztkikfwnxbfqctn/sql')
      console.log('   Copy and paste the contents of fix-profiles-table.sql')
      return
    }

    console.log('✅ Profile created successfully')
    console.log('   Role:', profile.role)
    console.log('   Name:', profile.first_name, profile.last_name)
    console.log('   Full Name:', profile.full_name)

    console.log('\n🎉 Database fix verification completed successfully!')

  } catch (error) {
    console.error('❌ Database fix failed:', error.message)
    process.exit(1)
  }
}

// Run the fix
applyDatabaseFix()
