import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface BookingConfirmationProps {
  customerName: string;
  bookingId: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  address: string;
  postcode: string;
  bedrooms: number;
  bathrooms: number;
  totalPrice: number;
  cleanerName?: string;
  specialInstructions?: string;
}

export const BookingConfirmation = ({
  customerName,
  bookingId,
  serviceName,
  bookingDate,
  bookingTime,
  address,
  postcode,
  bedrooms,
  bathrooms,
  totalPrice,
  cleanerName,
  specialInstructions,
}: BookingConfirmationProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Html>
      <Head />
      <Preview>Your booking with Shalean Services has been confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Shalean Services</Heading>
            <Text style={subtitle}>Professional Cleaning Services</Text>
          </Section>

          <Section style={content}>
            <Heading style={h2}>Booking Confirmation</Heading>
            <Text style={text}>
              Hi {customerName},
            </Text>
            <Text style={text}>
              Great news! Your booking has been confirmed. Here are the details:
            </Text>

            <Section style={bookingDetails}>
              <Text style={detailLabel}>Booking ID:</Text>
              <Text style={detailValue}>{bookingId}</Text>
              
              <Text style={detailLabel}>Service:</Text>
              <Text style={detailValue}>{serviceName}</Text>
              
              <Text style={detailLabel}>Date:</Text>
              <Text style={detailValue}>{formatDate(bookingDate)}</Text>
              
              <Text style={detailLabel}>Time:</Text>
              <Text style={detailValue}>{bookingTime}</Text>
              
              <Text style={detailLabel}>Address:</Text>
              <Text style={detailValue}>
                {address}<br />
                {postcode}
              </Text>
              
              <Text style={detailLabel}>Property Details:</Text>
              <Text style={detailValue}>
                {bedrooms} bedroom{bedrooms !== 1 ? 's' : ''}, {bathrooms} bathroom{bathrooms !== 1 ? 's' : ''}
              </Text>
              
              <Text style={detailLabel}>Total Price:</Text>
              <Text style={detailValue}>{formatPrice(totalPrice)}</Text>
              
              {cleanerName && (
                <>
                  <Text style={detailLabel}>Assigned Cleaner:</Text>
                  <Text style={detailValue}>{cleanerName}</Text>
                </>
              )}
              
              {specialInstructions && (
                <>
                  <Text style={detailLabel}>Special Instructions:</Text>
                  <Text style={detailValue}>{specialInstructions}</Text>
                </>
              )}
            </Section>

            <Hr style={hr} />

            <Text style={text}>
              We're excited to provide you with exceptional cleaning services. 
              If you have any questions or need to make changes to your booking, 
              please don't hesitate to contact us.
            </Text>

            <Text style={text}>
              Thank you for choosing Shalean Services!
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Shalean Services - Professional Cleaning Solutions
            </Text>
            <Text style={footerText}>
              Need help? Contact us at{' '}
              <Link href="mailto:support@shaleanservices.com" style={link}>
                support@shaleanservices.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px 0',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  padding: '0',
};

const subtitle = {
  color: '#6b7280',
  fontSize: '16px',
  margin: '0 0 32px',
};

const content = {
  padding: '0 24px',
};

const h2 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  padding: '0',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const bookingDetails = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const detailLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const detailValue = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '0 0 16px',
  fontWeight: '500',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  padding: '0 24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

export default BookingConfirmation;
