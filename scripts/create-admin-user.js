const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  const email = 'admin@shalean.com'
  const password = 'admin123'
  
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return
    }

    console.log('Auth user created:', authData.user.id)

    // Create profile with ADMIN role
    const { data: _profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: 'Admin User',
        role: 'ADMIN',
        is_active: true
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return
    }

    console.log('Admin profile created successfully!')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('Role: ADMIN')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createAdminUser()
