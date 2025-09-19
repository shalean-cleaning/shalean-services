#!/usr/bin/env node

/**
 * Debug Trigger Script
 * 
 * This script helps debug why the profile trigger isn't working
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

async function debugTrigger() {
  console.log('🔍 Debugging trigger issue...\n')

  try {
    // Check if the trigger exists
    console.log('1. Checking if trigger exists...')
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('*')
      .eq('trigger_name', 'on_auth_user_created')

    if (triggerError) {
      console.error('❌ Error checking triggers:', triggerError.message)
    } else {
      console.log('✅ Trigger check result:', triggers)
    }

    // Check if the function exists
    console.log('\n2. Checking if function exists...')
    const { data: functions, error: functionError } = await supabase
      .from('information_schema.routines')
      .select('*')
      .eq('routine_name', 'handle_new_user')

    if (functionError) {
      console.error('❌ Error checking functions:', functionError.message)
    } else {
      console.log('✅ Function check result:', functions)
    }

    // Check profiles table structure
    console.log('\n3. Checking profiles table structure...')
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('*')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public')

    if (columnError) {
      console.error('❌ Error checking table structure:', columnError.message)
    } else {
      console.log('✅ Profiles table columns:', columns.map(c => c.column_name))
    }

    // Try to manually insert a profile to test the table
    console.log('\n4. Testing manual profile insertion...')
    const testUserId = '00000000-0000-0000-0000-000000000000'
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        full_name: 'Test User',
        role: 'CUSTOMER'
      })
      .select()

    if (insertError) {
      console.error('❌ Manual insert failed:', insertError.message)
    } else {
      console.log('✅ Manual insert successful:', insertData)
      
      // Clean up test data
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testUserId)
      console.log('✅ Test data cleaned up')
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message)
  }
}

// Run the debug
debugTrigger()
