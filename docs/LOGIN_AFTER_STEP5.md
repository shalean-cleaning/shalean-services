# Login-After-Step-5 Flow

This document describes the authentication flow implemented for the booking process where users must log in after Step 5 (Cleaner Selection) before proceeding to Review & Pay.

## Overview

The booking flow allows users to freely navigate through Steps 1-4 (Service, Rooms, Extras, Location & Time) without authentication. Authentication is required only when they attempt to proceed from Step 5 (Cleaner Selection) to the Review & Pay step.

## Flow Details

### Steps 1-4: No Authentication Required
- Users can select service, rooms, extras, and location/time without logging in
- All data is stored in the client-side booking store (Zustand with persistence)
- No server calls are made during these steps

### Step 5: Authentication Gate
- When user clicks "Continue to Booking" on Step 5, the system makes the first server call to `/api/bookings/draft`
- The API endpoint requires authentication and derives `customerId` from the Supabase session
- If user is not authenticated, the API returns a 401 response with `error: "NEED_AUTH"`
- Client redirects to `/auth/login?returnTo=/booking/review`

### Review & Pay: Server-Side Guard
- The `/booking/review` page has a server-side authentication guard
- Unauthenticated users are redirected to `/auth/login?returnTo=/booking/review`
- On successful login, users are redirected back to `/booking/review`
- The review page automatically creates/updates the booking draft using the session-derived `customerId`

## API Contract

### `/api/bookings/draft` Endpoint

**Authentication Required**: Yes - derives `customerId` from Supabase session

**Request Body**: 
```typescript
{
  serviceId: string;
  regionId?: string;
  suburbId: string;
  totalPrice: number;
  address: string;
  postcode: string;
  bedrooms: number;
  bathrooms: number;
  extras: Array<{id: string; quantity: number; price: number}>;
  specialInstructions?: string;
  frequency: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
  timezone: string;
  bookingDate: string;
  startTime: string;
  selectedCleanerId?: string;
  autoAssign: boolean;
}
```

**Success Response (200)**:
```typescript
{
  success: true;
  id: string;
  totalPrice: number;
  breakdown: object;
  message: string;
}
```

**Authentication Error (401)**:
```typescript
{
  success: false;
  error: "NEED_AUTH";
  message: "Please sign in to create your booking draft.";
}
```

**Validation Error (400)**:
```typescript
{
  success: false;
  error: "Validation failed";
  details: Array<{field: string; message: string}>;
}
```

## Security Notes

- The API **never accepts** `customerId` from the client
- `customerId` is always derived from the authenticated Supabase session
- Server-side pricing computation ensures price integrity
- All UUIDs are validated server-side
- ISO dates are normalized to UTC for storage

## Implementation Files

- **API Route**: `src/app/api/bookings/draft/route.ts`
- **Review Page**: `src/app/booking/review/page.tsx`
- **Review Component**: `src/components/booking/steps/booking-review-step.tsx`
- **Cleaner Step**: `src/components/booking/steps/cleaner-selection-step.tsx`
- **Booking Stepper**: `src/components/booking/booking-stepper.tsx`
- **Database Types**: `src/lib/database.types.ts`
