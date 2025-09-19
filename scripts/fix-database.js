#!/usr/bin/env node

/**
 * Fix Database Script
 * 
 * This script applies the profiles table and signup trigger fix
 * to the remote Supabase database.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'

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

async function fixDatabase() {
  console.log('🔧 Fixing database schema...\n')

  try {
    // Read the SQL fix file
    const sqlFix = readFileSync('fix-profiles-table.sql', 'utf8')
    
    // Split the SQL into individual statements
    const statements = sqlFix
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`\n${i + 1}. Executing: ${statement.substring(0, 50)}...`)
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        })
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message)
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      }
    }

    console.log('\n🧪 Testing user signup...')
    
    // Test user signup
    const testEmail = `test-${Date.now()}@example.com`
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
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signupData.user?.id)
      .single()

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message)
      return
    }

    console.log('✅ Profile created successfully')
    console.log('   Role:', profile.role)
    console.log('   Name:', profile.first_name, profile.last_name)
    console.log('   Full Name:', profile.full_name)

    console.log('\n🎉 Database fix completed successfully!')

  } catch (error) {
    console.error('❌ Database fix failed:', error.message)
    process.exit(1)
  }
}

// Run the fix
fixDatabase()
