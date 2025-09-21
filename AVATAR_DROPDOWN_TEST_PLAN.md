# Avatar Dropdown Test Plan

## Overview
This test plan verifies that logged-in users see an avatar dropdown with Name, Dashboard, and Sign Out options, and that the sign out functionality preserves booking flow context.

## Test Environment Setup
- Ensure you have test accounts for each user role:
  - Customer account (role: CUSTOMER)
  - Cleaner account (role: CLEANER) 
  - Admin account (role: ADMIN)

## Test Cases

### 1. Avatar Display and Visibility
**Objective**: Verify avatar appears for authenticated users and login/signup buttons for unauthenticated users.

**Steps**:
1. Navigate to homepage while logged out
2. Verify "Log In" and "Sign Up" buttons are visible in header
3. Log in with a test account
4. Verify avatar (with initials) appears in header
5. Verify login/signup buttons are no longer visible

**Expected Results**:
- ✅ Unauthenticated users see login/signup buttons
- ✅ Authenticated users see avatar with user initials
- ✅ Avatar has blue background with white text for initials

### 2. Dropdown Menu Content
**Objective**: Verify dropdown shows correct user information and menu items.

**Steps**:
1. While logged in, click on the avatar
2. Verify dropdown menu opens
3. Check dropdown content:
   - User's full name at top
   - User's email below name
   - "Dashboard" menu item with user icon
   - "Sign Out" menu item with logout icon

**Expected Results**:
- ✅ Dropdown shows user's full name and email
- ✅ "Dashboard" option is present with user icon
- ✅ "Sign Out" option is present with logout icon
- ✅ Dropdown is properly aligned and styled

### 3. Role-Based Dashboard Routing
**Objective**: Verify dashboard link routes to correct page based on user role.

**Test Case 3a - Customer User**:
1. Log in with customer account
2. Click avatar dropdown
3. Click "Dashboard"
4. Verify redirects to `/account` page

**Test Case 3b - Cleaner User**:
1. Log in with cleaner account
2. Click avatar dropdown  
3. Click "Dashboard"
4. Verify redirects to `/dashboard/cleaner` page

**Test Case 3c - Admin User**:
1. Log in with admin account
2. Click avatar dropdown
3. Click "Dashboard" 
4. Verify redirects to `/admin` page

**Expected Results**:
- ✅ Customer users go to `/account`
- ✅ Cleaner users go to `/dashboard/cleaner`
- ✅ Admin users go to `/admin`

### 4. Sign Out Functionality - General Pages
**Objective**: Verify sign out works correctly on non-booking pages.

**Steps**:
1. Log in with any test account
2. Navigate to a non-booking page (e.g., homepage, services, about)
3. Click avatar dropdown
4. Click "Sign Out"
5. Verify user is logged out and redirected to homepage
6. Verify login/signup buttons appear in header

**Expected Results**:
- ✅ User is successfully logged out
- ✅ Redirected to homepage (`/`)
- ✅ Login/signup buttons are visible
- ✅ Avatar is no longer visible

### 5. Sign Out Functionality - Booking Flow Preservation
**Objective**: Verify sign out preserves booking flow context and doesn't break user experience.

**Test Case 5a - Booking Review Page**:
1. Start a booking flow and reach `/booking/review` page
2. Log in if prompted
3. Click avatar dropdown
4. Click "Sign Out"
5. Verify user stays on `/booking/review` page
6. Verify login/signup buttons appear (replacing avatar)
7. Verify booking data is preserved

**Test Case 5b - Other Booking Pages**:
1. Navigate to any booking page (e.g., `/booking/service/regular-cleaning`)
2. Log in if prompted
3. Click avatar dropdown
4. Click "Sign Out"
5. Verify user stays on current booking page
6. Verify login/signup buttons appear
7. Verify booking progress is preserved

**Expected Results**:
- ✅ User stays on current booking page (no redirect to homepage)
- ✅ Login/signup buttons replace avatar
- ✅ Booking flow data and progress is preserved
- ✅ User can continue booking process after signing out

### 6. Mobile Responsiveness
**Objective**: Verify avatar dropdown works correctly on mobile devices.

**Steps**:
1. Open site on mobile device or resize browser to mobile width
2. Log in with test account
3. Verify avatar is visible in mobile header
4. Tap avatar to open dropdown
5. Verify dropdown opens and is properly positioned
6. Test "Dashboard" and "Sign Out" functionality

**Expected Results**:
- ✅ Avatar is visible and properly sized on mobile
- ✅ Dropdown opens correctly on tap
- ✅ Dropdown is properly positioned and readable
- ✅ All menu items work correctly on mobile

### 7. Error Handling
**Objective**: Verify graceful handling of edge cases.

**Test Case 7a - Network Issues**:
1. Log in with test account
2. Disconnect network or simulate slow connection
3. Click "Sign Out"
4. Verify appropriate error handling (no infinite loading)

**Test Case 7b - Invalid Session**:
1. Log in with test account
2. Manually clear browser cookies/session
3. Click avatar dropdown
4. Verify graceful handling of invalid session

**Expected Results**:
- ✅ Network issues don't cause infinite loading states
- ✅ Invalid sessions are handled gracefully
- ✅ User is redirected appropriately on session expiry

## Test Data Requirements

### Test Accounts Needed:
```
Customer Account:
- Email: customer@test.com
- Role: CUSTOMER
- Name: John Customer

Cleaner Account:  
- Email: cleaner@test.com
- Role: CLEANER
- Name: Jane Cleaner

Admin Account:
- Email: admin@test.com  
- Role: ADMIN
- Name: Admin User
```

## Success Criteria
- ✅ All test cases pass
- ✅ No console errors during testing
- ✅ Smooth user experience across all scenarios
- ✅ Booking flow is never broken by sign out
- ✅ Role-based routing works correctly
- ✅ Mobile experience is functional

## Notes
- Test with different browsers (Chrome, Firefox, Safari)
- Test with different screen sizes (desktop, tablet, mobile)
- Verify accessibility (keyboard navigation, screen readers)
- Check for any console errors during testing
