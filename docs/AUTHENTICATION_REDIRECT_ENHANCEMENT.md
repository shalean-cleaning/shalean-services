# Authentication Redirect Enhancement for Booking Flow

## Overview

This enhancement fixes the authentication redirect issue during the booking process, ensuring users are properly redirected back to their current booking step or the View & Pay page after logging in.

## Problem Solved

**Before**: When users logged in during the booking process, they were redirected to the default `/login` success redirect instead of returning to their current booking step.

**After**: Users are now redirected to the appropriate location based on their booking context:
- If they were on an earlier step (1-4), they're redirected back to that step
- If they were on step 5 (cleaner selection), they're redirected to `/booking/review`
- If a draft booking was created, they're redirected to `/booking/view-pay/[bookingId]`
- Fallback to `/dashboard` if no context is found

## Implementation Details

### 1. Enhanced Utility Functions (`src/lib/utils.ts`)

#### New Interface: `BookingContext`
```typescript
interface BookingContext {
  currentStep?: number;
  serviceSlug?: string;
  bookingId?: string;
  returnPath: string;
  timestamp: number;
}
```

#### New Functions:
- `storeBookingContext()`: Stores booking context in sessionStorage
- `getAndClearBookingContext()`: Retrieves and clears booking context (with 1-hour expiration)
- `buildBookingReturnToUrl()`: Builds returnTo URL with booking context storage

### 2. Updated Cleaner Selection Step (`src/components/booking/steps/cleaner-selection-step.tsx`)

**Key Changes:**
- Uses `buildBookingReturnToUrl()` instead of `buildReturnToUrl()`
- Stores current step and service slug in booking context before redirect
- Preserves user's progress through the booking flow

```typescript
const { selectedService, currentStep } = useBookingStore.getState();
const returnTo = buildBookingReturnToUrl('/booking/review', {
  currentStep: currentStep,
  serviceSlug: selectedService?.slug,
});
```

### 3. Enhanced Auth Callback (`src/app/auth/callback/route.ts`)

**Key Changes:**
- Added `X-Booking-Context-Check` header to indicate client-side context checking is needed
- Maintains existing security validation for returnTo URLs

### 4. Updated Login Page (`src/app/auth/login/page.tsx`)

**Key Changes:**
- Checks for stored booking context after successful login
- Prioritizes booking context over returnTo parameter
- Handles both password login and magic link flows

```typescript
const bookingContext = getAndClearBookingContext();
if (bookingContext) {
  router.push(bookingContext.returnPath);
} else {
  const validatedReturnTo = validateReturnTo(returnTo);
  router.push(validatedReturnTo);
}
```

### 5. New Booking Context Restorer (`src/components/auth/BookingContextRestorer.tsx`)

**Purpose:** Client-side component that handles booking context restoration after authentication.

**Features:**
- Detects if user is coming from auth callback
- Redirects to appropriate booking step based on stored context
- Handles edge cases and fallbacks

### 6. Enhanced Booking Review Page (`src/app/booking/review/page.tsx`)

**Key Changes:**
- Wrapped with `BookingContextRestorer` component
- Handles cases where users might need to be redirected back to booking flow

### 7. Updated Booking Review Step (`src/components/booking/steps/booking-review-step.tsx`)

**Key Changes:**
- Added logic to redirect users back to booking flow if they have no booking data
- Handles cases where users might have been on earlier steps
- Provides better user experience for incomplete booking flows

## Flow Examples

### Scenario 1: User on Step 3 (Extras) needs to login
1. User selects extras and tries to continue
2. System detects authentication is needed
3. Booking context is stored: `{ currentStep: 3, serviceSlug: "standard-cleaning", returnPath: "/booking/review" }`
4. User is redirected to `/auth/login?returnTo=/booking/review`
5. After login, user is redirected back to `/booking/service/standard-cleaning?step=3`

### Scenario 2: User on Step 5 (Cleaner Selection) needs to login
1. User selects cleaner and clicks "Continue to Booking"
2. API returns 401 NEED_AUTH
3. Booking context is stored: `{ currentStep: 5, serviceSlug: "deep-cleaning", returnPath: "/booking/review" }`
4. User is redirected to `/auth/login?returnTo=/booking/review`
5. After login, user is redirected to `/booking/review` (current behavior)

### Scenario 3: User with existing draft booking
1. User has a draft booking created
2. Booking context includes `bookingId`
3. After login, user is redirected to `/booking/view-pay/[bookingId]`

## Security Considerations

- **Open Redirect Prevention**: All returnTo URLs are validated using `validateReturnTo()`
- **Context Expiration**: Booking context expires after 1 hour to prevent stale redirects
- **Session Storage**: Uses sessionStorage (not localStorage) so context is cleared when browser session ends
- **Server-Side Validation**: Auth callback maintains existing security checks

## Testing Checklist

- [ ] User can login from any booking step and return to the correct step
- [ ] Booking context expires after 1 hour
- [ ] Context is cleared after successful redirect
- [ ] Fallback to dashboard works when no context exists
- [ ] Magic link authentication preserves booking context
- [ ] Signup flow preserves booking context
- [ ] Admin routes are not affected by booking context logic

## Files Modified

1. `src/lib/utils.ts` - Added booking context utilities
2. `src/components/booking/steps/cleaner-selection-step.tsx` - Updated redirect logic
3. `src/app/auth/callback/route.ts` - Enhanced callback handling
4. `src/app/auth/login/page.tsx` - Updated login redirect logic
5. `src/components/auth/BookingContextRestorer.tsx` - New component
6. `src/app/booking/review/page.tsx` - Added context restorer
7. `src/components/booking/steps/booking-review-step.tsx` - Added redirect logic
8. `middleware.ts` - Updated imports

## Backward Compatibility

This enhancement is fully backward compatible:
- Existing returnTo URLs continue to work
- Users without booking context follow the original flow
- No breaking changes to existing authentication flows
- Graceful fallbacks ensure users are never stuck
