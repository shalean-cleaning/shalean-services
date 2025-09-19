#!/usr/bin/env node

/**
 * Debug Login Issues Script
 * 
 * This script tests the login functionality to identify issues
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

async function debugLogin() {
  console.log('🔍 Debugging login functionality...\n')

  // Test with a known user (from our previous tests)
  const testEmail = 'testuser1758322407540@gmail.com'
  const testPassword = 'testpassword123'

  console.log('1️⃣ Testing login with existing user...')
  console.log('   Email:', testEmail)

  try {
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (loginError) {
      console.error('❌ Login failed:', loginError.message)
      console.error('   Code:', loginError.status)
      
      // Check if it's an email confirmation issue
      if (loginError.message.includes('Email not confirmed')) {
        console.log('\n💡 Solution: Email confirmation is enabled in production')
        console.log('   - Users need to confirm their email before logging in')
        console.log('   - Check Supabase Dashboard → Authentication → Settings')
        console.log('   - Or disable email confirmation for development')
      }
      
      return
    }

    console.log('✅ Login successful!')
    console.log('   User ID:', loginData.user?.id)
    console.log('   Email:', loginData.user?.email)
    console.log('   Session exists:', !!loginData.session)

    // Test session persistence
    console.log('\n2️⃣ Testing session persistence...')
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Session check failed:', userError.message)
      return
    }

    if (user) {
      console.log('✅ Session is valid')
      console.log('   User ID:', user.id)
    } else {
      console.error('❌ No user session found')
    }

    // Test profile access
    console.log('\n3️⃣ Testing profile access...')
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single()

    if (profileError) {
      console.error('❌ Profile access failed:', profileError.message)
      return
    }

    console.log('✅ Profile access successful')
    console.log('   Role:', profile.role)
    console.log('   Name:', profile.first_name, profile.last_name)

    console.log('\n🎉 Login functionality is working correctly!')
    console.log('   The issue might be in the frontend implementation.')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the debug
debugLogin()
