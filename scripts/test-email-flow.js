#!/usr/bin/env node

/**
 * Test script for booking confirmation email flow
 * This script tests the email functionality by creating a test booking and triggering the confirmation
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

if (!resendApiKey) {
  console.warn('⚠️  RESEND_API_KEY not found - email sending will be tested but may fail');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testEmailFlow() {
  console.log('🧪 Testing Booking Confirmation Email Flow\n');

  try {
    // Step 1: Check if we have test data
    console.log('1. Checking for existing test data...');
    
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, name')
      .limit(1);

    if (servicesError || !services?.length) {
      console.error('❌ No services found. Please ensure the database is seeded.');
      return;
    }

    const { data: suburbs, error: suburbsError } = await supabase
      .from('suburbs')
      .select('id, name')
      .limit(1);

    if (suburbsError || !suburbs?.length) {
      console.error('❌ No suburbs found. Please ensure the database is seeded.');
      return;
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, full_name')
      .eq('role', 'CUSTOMER')
      .limit(1);

    if (profilesError || !profiles?.length) {
      console.error('❌ No customer profiles found. Please create a test customer.');
      return;
    }

    console.log('✅ Test data found:');
    console.log(`   Service: ${services[0].name}`);
    console.log(`   Suburb: ${suburbs[0].name}`);
    console.log(`   Customer: ${profiles[0].full_name} (${profiles[0].email})`);

    // Step 2: Create a test booking
    console.log('\n2. Creating test booking...');
    
    const testBooking = {
      customer_id: profiles[0].id,
      service_id: services[0].id,
      scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      start_time: '10:00:00',
      status: 'PENDING',
      total_price: 150.00,
      bedrooms: 3,
      bathrooms: 2
    };

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(testBooking)
      .select(`
        *,
        services (name)
      `)
      .single();

    if (bookingError) {
      console.error('❌ Failed to create test booking:', bookingError);
      return;
    }

    console.log(`✅ Test booking created: ${booking.id}`);

    // Step 3: Test the email sending action directly
    console.log('\n3. Testing email sending action...');
    
    try {
      // Import the email action (we'll need to use dynamic import for ES modules)
      const { sendBookingConfirmation } = await import('../src/app/actions/send-booking-confirmation.ts');
      
      // Get customer profile separately
      const { data: customerProfile, error: profileError } = await supabase
        .from('profiles')
        .select('email, first_name, last_name, full_name')
        .eq('id', booking.customer_id)
        .single();

      if (profileError) {
        console.error('❌ Failed to fetch customer profile:', profileError);
        return;
      }

      const emailData = {
        customerName: customerProfile.full_name || `${customerProfile.first_name} ${customerProfile.last_name}`,
        customerEmail: customerProfile.email,
        bookingId: booking.id,
        serviceName: booking.services.name,
        bookingDate: booking.scheduled_date || new Date().toISOString().split('T')[0],
        bookingTime: booking.start_time,
        address: '123 Test Street', // Default test address since column may not exist
        postcode: '2000', // Default test postcode
        bedrooms: booking.bedrooms || 3,
        bathrooms: booking.bathrooms || 2,
        totalPrice: booking.total_price,
        specialInstructions: 'Test booking for email functionality',
      };

      const result = await sendBookingConfirmation(emailData);
      
      if (result.success) {
        console.log('✅ Email sent successfully!');
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`   Check ${customerProfile.email} for the confirmation email`);
      } else {
        console.error('❌ Email sending failed:', result);
      }
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError.message);
      if (emailError.message.includes('API key')) {
        console.log('💡 Make sure to set RESEND_API_KEY in your .env.local file');
      }
    }

    // Step 4: Test the full API flow
    console.log('\n4. Testing full API confirmation flow...');
    
    try {
      // First, update the booking to CONFIRMED status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'CONFIRMED' })
        .eq('id', booking.id);

      if (updateError) {
        console.error('❌ Failed to update booking status:', updateError);
        return;
      }

      // Now test the confirmation API
      const response = await fetch('http://localhost:3000/api/bookings/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ API confirmation successful!');
        console.log(`   Status: ${result.data.status}`);
        console.log(`   Ready for payment: ${result.data.isReadyForPayment}`);
      } else {
        const error = await response.json();
        console.error('❌ API confirmation failed:', error);
      }
    } catch (apiError) {
      console.error('❌ API test error:', apiError.message);
      console.log('💡 Make sure the development server is running (npm run dev)');
    }

    // Step 5: Cleanup
    console.log('\n5. Cleaning up test data...');
    
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', booking.id);

    if (deleteError) {
      console.error('❌ Failed to cleanup test booking:', deleteError);
    } else {
      console.log('✅ Test booking cleaned up');
    }

    console.log('\n🎉 Email flow test completed!');
    console.log('\nNext steps:');
    console.log('1. Set up a Resend account and add RESEND_API_KEY to .env.local');
    console.log('2. Test with a real booking through the web interface');
    console.log('3. Check the email template in src/emails/BookingConfirmation.tsx');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testEmailFlow();
