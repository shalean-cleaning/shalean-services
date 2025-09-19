#!/usr/bin/env node

/**
 * Apply Database Fix Script
 * 
 * This script applies the profiles table and signup trigger fix
 * to the remote Supabase database using the service role key.
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
  console.log('🔧 Applying database fix...\n')

  try {
    // SQL statements to fix the database
    const sqlStatements = [
      // Create user_role enum
      `DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('CUSTOMER', 'CLEANER', 'ADMIN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,

      // Create profiles table
      `CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT UNIQUE NOT NULL,
        first_name TEXT,
        last_name TEXT,
        full_name TEXT NOT NULL,
        phone TEXT,
        role user_role NOT NULL DEFAULT 'CUSTOMER',
        avatar_url TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // Enable RLS
      `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`,

      // Create RLS policies
      `DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
       CREATE POLICY "Users can read own profile" ON profiles
         FOR SELECT USING (auth.uid() = id);`,

      `DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
       CREATE POLICY "Users can update own profile" ON profiles
         FOR UPDATE USING (auth.uid() = id);`,

      `DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
       CREATE POLICY "Users can insert own profile" ON profiles
         FOR INSERT WITH CHECK (auth.uid() = id);`,

      // Create function
      `CREATE OR REPLACE FUNCTION public.handle_new_user()
       RETURNS TRIGGER AS $$
       BEGIN
         INSERT INTO public.profiles (
           id,
           email,
           first_name,
           last_name,
           full_name,
           role
         )
         VALUES (
           NEW.id,
           NEW.email,
           COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
           COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
           COALESCE(
             TRIM(CONCAT(
               COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
               ' ',
               COALESCE(NEW.raw_user_meta_data->>'last_name', '')
             )),
             NEW.email
           ),
           'CUSTOMER'
         );
         RETURN NEW;
       END;
       $$ LANGUAGE plpgsql SECURITY DEFINER;`,

      // Create trigger
      `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
       CREATE TRIGGER on_auth_user_created
         AFTER INSERT ON auth.users
         FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`
    ]

    console.log(`📝 Executing ${sqlStatements.length} SQL statements...`)

    // Execute each statement
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i]
      console.log(`\n${i + 1}. Executing statement...`)
      
      const { error } = await supabase.rpc('exec', { 
        sql: statement 
      })
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message)
        // Continue with other statements
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`)
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
applyDatabaseFix()
