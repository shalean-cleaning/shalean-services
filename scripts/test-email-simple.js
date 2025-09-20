#!/usr/bin/env node

/**
 * Simple email test that tests the email template rendering without importing TypeScript files
 */

import { render } from '@react-email/render';
import { BookingConfirmation } from '../src/emails/BookingConfirmation.tsx';

async function testEmailTemplate() {
  console.log('🧪 Testing Email Template Rendering\n');

  try {
    // Test data
    const testData = {
      customerName: 'John Doe',
      bookingId: 'TEST-123',
      serviceName: 'Standard Cleaning',
      bookingDate: '2025-09-27',
      bookingTime: '10:00:00',
      address: '123 Test Street',
      postcode: '2000',
      bedrooms: 3,
      bathrooms: 2,
      totalPrice: 150.00,
      cleanerName: 'Jane Smith',
      specialInstructions: 'Please use eco-friendly products',
    };

    console.log('1. Rendering email template...');
    
    // Render the email template to HTML
    const emailHtml = render(BookingConfirmation(testData));
    
    console.log('✅ Email template rendered successfully!');
    console.log(`   HTML length: ${emailHtml.length} characters`);
    
    // Save the rendered HTML to a file for inspection
    const fs = await import('fs');
    const path = await import('path');
    
    const outputPath = path.join(process.cwd(), 'test-email-output.html');
    fs.writeFileSync(outputPath, emailHtml);
    
    console.log(`   HTML saved to: ${outputPath}`);
    console.log('   You can open this file in a browser to preview the email');
    
    // Check if Resend API key is available
    const dotenv = await import('dotenv');
    dotenv.config({ path: '.env.local' });
    
    if (process.env.RESEND_API_KEY) {
      console.log('\n2. Testing Resend API connection...');
      
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      try {
        // Test API connection by getting domains (this doesn't send an email)
        const { data, error } = await resend.domains.list();
        
        if (error) {
          console.log('❌ Resend API error:', error.message);
        } else {
          console.log('✅ Resend API connection successful!');
          console.log(`   Found ${data?.data?.length || 0} domains`);
        }
      } catch (apiError) {
        console.log('❌ Resend API test failed:', apiError.message);
      }
    } else {
      console.log('\n2. Resend API key not found - skipping API test');
      console.log('   Add RESEND_API_KEY to .env.local to test API connection');
    }
    
    console.log('\n🎉 Email template test completed!');
    console.log('\nNext steps:');
    console.log('1. Open test-email-output.html in a browser to preview the email');
    console.log('2. Set up a Resend account and add RESEND_API_KEY to .env.local');
    console.log('3. Test with a real booking through the web interface');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEmailTemplate();
