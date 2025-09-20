#!/usr/bin/env node

/**
 * Simple email test that creates a basic HTML email for testing
 */

import { render } from '@react-email/render';
import { Html, Head, Body, Container, Heading, Text, Section } from '@react-email/components';

// Simple email template for testing
function TestBookingConfirmation({ customerName, bookingId, serviceName, totalPrice }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f6f9fc' }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px', maxWidth: '600px' }}>
          <Heading style={{ color: '#1f2937', fontSize: '24px' }}>Shalean Services</Heading>
          <Text style={{ color: '#374151', fontSize: '16px' }}>
            Hi {customerName},
          </Text>
          <Text style={{ color: '#374151', fontSize: '16px' }}>
            Your booking has been confirmed! Here are the details:
          </Text>
          <Section style={{ backgroundColor: '#f9fafb', padding: '20px', margin: '20px 0', borderRadius: '8px' }}>
            <Text style={{ margin: '0 0 10px' }}><strong>Booking ID:</strong> {bookingId}</Text>
            <Text style={{ margin: '0 0 10px' }}><strong>Service:</strong> {serviceName}</Text>
            <Text style={{ margin: '0 0 10px' }}><strong>Total Price:</strong> ${totalPrice}</Text>
          </Section>
          <Text style={{ color: '#374151', fontSize: '16px' }}>
            Thank you for choosing Shalean Services!
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

async function testEmailTemplate() {
  console.log('🧪 Testing Email Template Rendering\n');

  try {
    // Test data
    const testData = {
      customerName: 'John Doe',
      bookingId: 'TEST-123',
      serviceName: 'Standard Cleaning',
      totalPrice: 150.00,
    };

    console.log('1. Rendering email template...');
    
    // Render the email template to HTML
    const emailHtml = render(TestBookingConfirmation(testData));
    
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
