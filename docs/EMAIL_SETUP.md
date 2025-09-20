# Email Service Setup Guide

This guide explains how to set up and use the email notification system for booking confirmations.

## Overview

The email system uses:
- **Resend** for email delivery
- **React Email** for email templating
- **Server Actions** for email sending logic

## Setup Instructions

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com) and create an account
2. Verify your domain or use the default domain for testing
3. Generate an API key from the dashboard

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Email Configuration
RESEND_API_KEY=your_resend_api_key_here
```

### 3. Email Template

The booking confirmation email template is located at:
- **File**: `src/emails/BookingConfirmation.tsx`
- **Components**: Uses React Email components for styling
- **Data**: Accepts booking and customer information

### 4. Email Sending Logic

The email sending is handled by:
- **Server Action**: `src/app/actions/send-booking-confirmation.ts`
- **Integration**: Automatically triggered in `src/app/api/bookings/confirm/route.ts`

## Testing

### Run the Email Test

```bash
npm run test:email
```

This will:
1. Create a test booking
2. Test the email sending action
3. Test the full API confirmation flow
4. Clean up test data

### Manual Testing

1. Complete a booking through the web interface
2. Check the customer's email for the confirmation
3. Verify all booking details are correctly populated

## Email Template Customization

### Modifying the Template

Edit `src/emails/BookingConfirmation.tsx` to customize:
- Layout and styling
- Content and messaging
- Additional fields or sections

### Adding New Email Types

1. Create a new React Email component in `src/emails/`
2. Create a corresponding server action in `src/app/actions/`
3. Integrate the action into the appropriate API route

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check `RESEND_API_KEY` is set correctly
   - Verify Resend account has sufficient credits
   - Check server logs for error messages

2. **Template rendering issues**
   - Ensure React Email components are imported correctly
   - Check for TypeScript errors in the template
   - Verify all required props are provided

3. **Missing customer data**
   - Ensure customer profile has email address
   - Check database relationships are properly configured
   - Verify booking data includes all required fields

### Debugging

Enable detailed logging by checking the server console for:
- Email sending success/failure messages
- Template rendering errors
- API integration issues

## Production Considerations

### Domain Verification

For production use:
1. Verify your domain with Resend
2. Update the `from` address in the email action
3. Configure SPF and DKIM records

### Rate Limiting

Resend has rate limits:
- Free tier: 3,000 emails/month
- Paid tiers: Higher limits available

### Error Handling

The system is designed to:
- Log email errors without failing the booking
- Continue booking confirmation even if email fails
- Provide detailed error messages for debugging

## API Reference

### sendBookingConfirmation

```typescript
interface BookingConfirmationData {
  customerName: string;
  customerEmail: string;
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
```

### Email Template Props

The `BookingConfirmation` component accepts the same interface as `BookingConfirmationData`.
