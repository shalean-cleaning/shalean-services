const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAdminUser() {
  try {
    // Get all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@shalean.com')

    if (error) {
      console.error('Error fetching profiles:', error)
      return
    }

    if (profiles.length === 0) {
      console.log('No admin user found')
      return
    }

    const adminUser = profiles[0]
    console.log('Admin user found:')
    console.log('Email:', adminUser.email)
    console.log('Role:', adminUser.role)
    console.log('Active:', adminUser.is_active)
    
    if (adminUser.role !== 'ADMIN') {
      console.log('Updating role to ADMIN...')
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'ADMIN' })
        .eq('id', adminUser.id)
      
      if (updateError) {
        console.error('Error updating role:', updateError)
      } else {
        console.log('Role updated to ADMIN successfully!')
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkAdminUser()

