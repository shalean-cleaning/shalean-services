# Mid-Flow Authentication Test Plan

## Overview
This test plan verifies that mid-flow authentication preserves booking context and redirects users back to the correct step after login.

## Test Scenarios

### Scenario 1: User on Step 4 (Location & Time) needs to login
**Objective**: Verify user returns to Step 4 after authentication

**Steps**:
1. Navigate to `/booking/service/standard-cleaning`
2. Complete steps 1-3 (Service, Rooms, Extras)
3. On Step 4 (Location & Time), try to access a protected route (e.g., `/booking/review`)
4. Verify redirect to `/auth/login?returnTo=/booking/review`
5. Complete login process
6. **Expected Result**: User is redirected back to `/booking/service/standard-cleaning?step=4`

**Test Data**:
- Service: Standard Cleaning
- Step: 4 (Location & Time)
- Stored Context: `{ currentStep: 4, serviceSlug: "standard-cleaning", returnPath: "/booking/review" }`

### Scenario 2: User on Step 5 (Cleaner Selection) needs to login
**Objective**: Verify user proceeds to Review & Pay after authentication

**Steps**:
1. Navigate to `/booking/service/deep-cleaning`
2. Complete steps 1-4 (Service, Rooms, Extras, Location & Time)
3. On Step 5 (Cleaner Selection), click "Continue to Booking"
4. Verify redirect to `/auth/login?returnTo=/booking/review`
5. Complete login process
6. **Expected Result**: User is redirected to `/booking/review`

**Test Data**:
- Service: Deep Cleaning
- Step: 5 (Cleaner Selection)
- Stored Context: `{ currentStep: 5, serviceSlug: "deep-cleaning", returnPath: "/booking/review" }`

### Scenario 3: User with existing draft booking
**Objective**: Verify user is redirected to View & Pay page

**Steps**:
1. Start a booking flow and create a draft booking
2. Note the booking ID
3. Log out and try to access `/booking/review`
4. Complete login process
5. **Expected Result**: User is redirected to `/booking/view-pay/[bookingId]`

**Test Data**:
- Booking ID: `booking_123456`
- Stored Context: `{ bookingId: "booking_123456", returnPath: "/booking/review" }`

### Scenario 4: Context expiration (1 hour)
**Objective**: Verify booking context expires after 1 hour

**Steps**:
1. Start a booking flow and trigger auth redirect
2. Wait 1 hour and 1 minute
3. Complete login process
4. **Expected Result**: User is redirected to `/dashboard` (fallback)

### Scenario 5: Magic link authentication
**Objective**: Verify magic link preserves booking context

**Steps**:
1. Start a booking flow and trigger auth redirect
2. Use magic link authentication instead of password
3. Complete authentication via email link
4. **Expected Result**: User is redirected to appropriate booking step

### Scenario 6: Signup flow preserves context
**Objective**: Verify new user signup preserves booking context

**Steps**:
1. Start a booking flow as a new user
2. Trigger auth redirect
3. Click "Sign up" instead of "Sign in"
4. Complete signup process
5. **Expected Result**: User is redirected to appropriate booking step

## Test Environment Setup

### Prerequisites
- Clean browser session (no existing auth)
- Access to email for magic link testing
- Test services available in database

### Test Data Requirements
- Service: `standard-cleaning` (Step 4 test)
- Service: `deep-cleaning` (Step 5 test)
- Valid test user credentials
- Test email for magic link

## Validation Points

### 1. Context Storage
- [ ] Booking context is stored in sessionStorage before redirect
- [ ] Context includes correct `currentStep`, `serviceSlug`, and `returnPath`
- [ ] Context has valid timestamp

### 2. Auth Redirect
- [ ] Login URL includes correct `returnTo` parameter
- [ ] `returnTo` parameter is properly encoded
- [ ] No open redirect vulnerabilities

### 3. Context Retrieval
- [ ] Booking context is retrieved after successful auth
- [ ] Context is cleared after retrieval
- [ ] Expired contexts are handled gracefully

### 4. Redirect Logic
- [ ] Users on steps 1-4 return to correct step
- [ ] Users on step 5 proceed to review
- [ ] Users with booking ID go to view-pay
- [ ] Fallback to dashboard works

### 5. Security
- [ ] No open redirect vulnerabilities
- [ ] Context expires after 1 hour
- [ ] Context is cleared after use
- [ ] Server-side validation of returnTo

## Edge Cases

### 1. Invalid Context
- [ ] Malformed context data
- [ ] Missing required fields
- [ ] Corrupted sessionStorage

### 2. Network Issues
- [ ] Auth callback fails
- [ ] SessionStorage unavailable
- [ ] JavaScript disabled

### 3. Concurrent Sessions
- [ ] Multiple tabs with different contexts
- [ ] Context overwritten by another tab

## Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Mobile Testing
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Mobile viewport handling

## Performance Testing
- [ ] Context storage/retrieval performance
- [ ] Redirect speed
- [ ] Memory usage

## Security Testing
- [ ] XSS prevention in context data
- [ ] CSRF protection
- [ ] Session hijacking prevention

## Rollback Plan
If issues are found:
1. Disable booking context features
2. Fall back to simple returnTo redirects
3. Clear all stored contexts
4. Monitor for regressions

## Success Criteria
- [ ] All test scenarios pass
- [ ] No security vulnerabilities
- [ ] Performance within acceptable limits
- [ ] User experience is smooth and intuitive
- [ ] No data loss during auth flow
