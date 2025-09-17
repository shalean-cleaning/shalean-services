# Paystack Payment Integration Flow

This document describes the complete payment flow implementation using Paystack for the Shalean Services booking system.

## Overview

The payment flow follows a redirect-based approach where users are redirected to Paystack's hosted checkout page, complete payment there, and are then redirected back to our application for verification.

## Flow Sequence

### 1. Initiate Payment (`POST /api/payments/initiate`)

**Trigger**: User clicks "Complete Payment" button on `/booking/review`

**Process**:
1. Validate user authentication and booking ownership
2. Check if booking is already paid (guard against duplicate payments)
3. Generate unique payment reference
4. Call Paystack `/transaction/initialize` API with:
   - Customer email from session
   - Amount in minor units (cents) - ZAR currency
   - Unique reference
   - Callback URL: `${NEXT_PUBLIC_APP_URL}/booking/payment/callback`
   - Metadata: booking_id, customer_id, customer_email
5. Upsert payment record in database with status 'INITIALIZED'
6. Return authorization_url to client

**Response**:
```json
{
  "success": true,
  "authorization_url": "https://checkout.paystack.com/...",
  "reference": "PAY_12345678_1234567890_ABC123"
}
```

**Error Handling**:
- `404` - Booking not found (`booking_not_found`)
- `403` - Access denied, booking doesn't belong to user (`not_owner`)
- `409` - Booking already paid or invalid status (`already_paid`, `invalid_status`)
- `502` - Paystack service unavailable (`init_failed`)
- `500` - Internal server error (`init_failed`)

### 2. Paystack Checkout

**Process**:
1. User is redirected to Paystack's hosted checkout page
2. User enters payment details and completes payment
3. Paystack processes the payment
4. User is redirected back to our callback URL with reference parameter

### 3. Payment Callback (`/booking/payment/callback`)

**Process**:
1. Extract reference from URL query parameters
2. Immediately call `GET /api/payments/verify?reference=...`
3. Show loading state while verification is in progress
4. Display success/failure UI based on verification result

### 4. Verify Payment (`GET /api/payments/verify`)

**Process**:
1. Call Paystack `/transaction/verify/:reference` API
2. Validate payment status, amount, and currency

## Booking ID Flow

### Where bookingId Originates

The bookingId is derived through a two-step process:

1. **Draft Creation**: When `BookingReviewStep` component mounts, it calls `POST /api/bookings/draft` to create/retrieve a draft booking
2. **State Management**: The bookingId is stored in component state and used for payment initiation

### Booking Details API (`GET /api/bookings/[id]`)

**Purpose**: Fetch individual booking details with ownership validation

**Authentication**: Uses SSR Supabase server client (reads cookies)

**Ownership Filter**: `WHERE id = :id AND customer_id = auth.uid()`

**Response**: Returns full booking data including services, suburbs, and payment history

**Error Handling**:
- `400` - Missing booking ID
- `401` - Authentication required
- `404` - Booking not found or access denied
- `500` - Internal server error

### Client-Side Validation

The "Complete Payment" button is disabled until a valid bookingId is present:
- Shows "Preparing Booking..." when bookingId is null
- Shows "Complete Payment" when bookingId is available
- Prevents API calls with invalid bookingId

### Ownership + Status Rules

**API Validation Process**:
1. **Existence Check**: Verify booking exists in database
2. **Ownership Check**: Ensure `customer_id = auth.uid()`
3. **Status Check**: Verify booking status allows payment (not CANCELLED, COMPLETED, or already PAID)
4. **RLS Compliance**: Uses `supabaseAdmin` (bypasses RLS) but enforces same ownership logic

**RLS Policy**:
```sql
-- Customers can read their own bookings
CREATE POLICY "Customers can read own bookings" ON bookings
    FOR SELECT USING (auth.uid() = customer_id);
```

### Error Code Mapping

| Error Code | HTTP Status | Description | User Message |
|------------|-------------|-------------|--------------|
| `booking_not_found` | 404 | Booking doesn't exist | "Booking not found" |
| `not_owner` | 403 | User doesn't own booking | "Access denied - booking does not belong to you" |
| `already_paid` | 409 | Booking already has paid payment | "Booking is already paid" |
| `invalid_status` | 409 | Booking status doesn't allow payment | "Cannot pay for a cancelled/completed booking" |
| `init_failed` | 500/502 | Payment service or internal error | "Payment service temporarily unavailable" |

## Recent Fixes Applied

### Client-Side Improvements
- Added `bookingId` state management in `BookingReviewStep`
- Disabled payment button until valid bookingId is available
- Removed redundant draft API call in payment initiation
- Added user-friendly loading states

### API Improvements
- Enhanced error handling with specific error codes
- Improved ownership validation with separate existence and ownership checks
- Added status validation for cancelled/completed bookings
- Mapped error codes to appropriate HTTP status codes
- Better Paystack API error handling
- **NEW**: Added `GET /api/bookings/[id]` route for individual booking access
- **NEW**: Payment initiate uses direct DB queries (no HTTP calls to booking API)
3. If successful:
   - Update payment record: status='PAID', store gateway payload
   - Update booking record: status='PAID'
   - Return success response
4. If failed:
   - Update payment record: status='FAILED'
   - Return failure response

**Response**:
```json
{
  "success": true,
  "bookingId": "booking-uuid",
  "message": "Payment verified successfully"
}
```

## Environment Variables

### Required Environment Variables

```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_...  # Server-side secret key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...  # Client-side public key (for future use)

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com  # Used for callback URL
```

### Environment Setup

1. **Development**: Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`
2. **Production**: Set `NEXT_PUBLIC_APP_URL=https://your-production-domain.com`

## Database Schema Updates

### Payment Table Fields

```sql
-- Additional fields added to payments table
ALTER TABLE payments ADD COLUMN amount_minor INTEGER; -- Amount in cents
ALTER TABLE payments ADD COLUMN reference TEXT UNIQUE; -- Paystack reference
ALTER TABLE payments ADD COLUMN gateway TEXT DEFAULT 'paystack'; -- Payment gateway
ALTER TABLE payments ADD COLUMN gateway_payload JSONB; -- Store Paystack response data
```

### Payment Status Values

- `PENDING`: Initial state
- `INITIALIZED`: Payment initiated with Paystack
- `PAID`: Payment successfully completed
- `FAILED`: Payment failed or was declined
- `REFUNDED`: Payment was refunded

## Security Considerations

### 1. Server-Side Amount Validation
- Never trust client-side amounts
- Always compute amounts server-side from booking data
- Validate Paystack response amount matches stored amount

### 2. Authentication & Authorization
- All payment endpoints require valid user session
- Validate user owns the booking before processing payment
- Use server-side Supabase client for database operations

### 3. Idempotency
- Generate unique references for each payment attempt
- Handle duplicate payment attempts gracefully
- Reuse existing payment records when appropriate

### 4. Error Handling
- Never expose sensitive API keys or internal errors
- Log errors server-side for debugging
- Provide user-friendly error messages

## Error Handling

### Common Error Scenarios

1. **Authentication Required**
   - User not logged in
   - Response: 401 with "Authentication required"

2. **Booking Not Found**
   - Invalid booking ID or user doesn't own booking
   - Response: 400 with "Booking not found or access denied"

3. **Already Paid**
   - Booking already has a successful payment
   - Response: 400 with "Booking is already paid"

4. **Paystack API Errors**
   - Network issues or Paystack service problems
   - Response: 500 with generic error message

5. **Payment Verification Failed**
   - Amount mismatch, invalid currency, or payment not successful
   - Response: 400 with specific error details

### User Experience

- **Loading States**: Show loading indicators during payment processing
- **Error Recovery**: Provide "Try Again" options for failed payments
- **Success Confirmation**: Clear success messages with next steps
- **Idempotent Callbacks**: Safe to refresh callback page

## Testing

### Test Scenarios

1. **Happy Path**
   - Complete payment flow from review to success
   - Verify booking status updated to 'PAID'
   - Confirm payment record created with correct data

2. **Already Paid Guard**
   - Attempt to pay for already paid booking
   - Verify button shows "Already Paid" state
   - Confirm no duplicate payment processing

3. **Payment Failure**
   - Simulate failed payment on Paystack
   - Verify error handling and user feedback
   - Confirm booking status remains 'PENDING'

4. **Network Errors**
   - Test with Paystack API unavailable
   - Verify graceful error handling
   - Confirm user can retry payment

5. **Callback Idempotency**
   - Refresh callback page multiple times
   - Verify no duplicate processing
   - Confirm consistent UI state

### Test Data

Use Paystack test cards for development:
- **Success**: 4084084084084081
- **Decline**: 4084084084084085
- **Insufficient Funds**: 4084084084084086

## Monitoring & Logging

### Key Metrics to Monitor

1. **Payment Success Rate**: Percentage of successful payments
2. **Payment Failure Reasons**: Common failure causes
3. **Callback Processing Time**: Time from callback to verification
4. **Error Rates**: API error frequency and types

### Logging Strategy

- Log all payment initiation attempts
- Log Paystack API responses (without sensitive data)
- Log payment verification results
- Log any errors with sufficient context for debugging

## Future Enhancements

### Potential Improvements

1. **Webhook Support**: Implement Paystack webhooks for real-time payment updates
2. **Payment Methods**: Support additional payment methods beyond cards
3. **Partial Payments**: Support for deposit/full payment options
4. **Refund Processing**: Implement refund functionality
5. **Payment Analytics**: Dashboard for payment metrics and insights

### Security Enhancements

1. **Rate Limiting**: Implement rate limiting on payment endpoints
2. **Fraud Detection**: Integrate with Paystack's fraud detection
3. **PCI Compliance**: Ensure full PCI compliance for card data handling
4. **Audit Logging**: Comprehensive audit trail for all payment operations
