#!/usr/bin/env node

/**
 * Test email system setup and configuration
 */

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testEmailSetup() {
  console.log('🧪 Testing Email System Setup\n');

  try {
    // Check environment variables
    console.log('1. Checking environment variables...');
    
    const requiredVars = {
      'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'RESEND_API_KEY': process.env.RESEND_API_KEY,
    };

    let allVarsPresent = true;
    
    for (const [key, value] of Object.entries(requiredVars)) {
      if (value) {
        console.log(`   ✅ ${key}: Set`);
      } else {
        console.log(`   ❌ ${key}: Missing`);
        allVarsPresent = false;
      }
    }

    if (!allVarsPresent) {
      console.log('\n⚠️  Some environment variables are missing.');
      console.log('   Add them to .env.local to enable full functionality.');
    }

    // Check if Resend is configured
    console.log('\n2. Testing Resend configuration...');
    
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        // Test API connection
        const { data, error } = await resend.domains.list();
        
        if (error) {
          console.log('   ❌ Resend API error:', error.message);
        } else {
          console.log('   ✅ Resend API connection successful!');
          console.log(`   📧 Found ${data?.data?.length || 0} domains`);
        }
      } catch (apiError) {
        console.log('   ❌ Resend API test failed:', apiError.message);
      }
    } else {
      console.log('   ⚠️  RESEND_API_KEY not set - email sending will not work');
    }

    // Check if email files exist
    console.log('\n3. Checking email system files...');
    
    const fs = await import('fs');
    const path = await import('path');
    
    const emailFiles = [
      'src/emails/BookingConfirmation.tsx',
      'src/app/actions/send-booking-confirmation.ts',
      'src/app/api/bookings/confirm/route.ts'
    ];

    for (const file of emailFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file}: Exists`);
      } else {
        console.log(`   ❌ ${file}: Missing`);
      }
    }

    // Check package.json for required dependencies
    console.log('\n4. Checking dependencies...');
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['resend', 'react-email', '@react-email/components', '@react-email/render'];
    
    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep]) {
        console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
      } else {
        console.log(`   ❌ ${dep}: Missing`);
      }
    }

    console.log('\n🎉 Email system setup check completed!');
    
    if (allVarsPresent && process.env.RESEND_API_KEY) {
      console.log('\n✅ Email system is ready to use!');
      console.log('   You can now test booking confirmations through the web interface.');
    } else {
      console.log('\n⚠️  Email system needs configuration:');
      if (!process.env.RESEND_API_KEY) {
        console.log('   1. Set up a Resend account at https://resend.com');
        console.log('   2. Add RESEND_API_KEY to .env.local');
      }
      console.log('   3. Test the email functionality');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEmailSetup();
