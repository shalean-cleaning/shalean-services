# Total Price Validation Test Plan

## Overview
This test plan validates that `total_price` is properly handled throughout the booking flow without NOT NULL constraint errors. The system should allow `total_price` to be null during DRAFT status and ensure it's calculated and set before transitioning to READY_FOR_PAYMENT.

## Test Environment Setup
1. Next.js development server running (`npm run dev`)
2. Supabase environment variables configured
3. Database tables exist with proper constraints
4. Test data seeded (services, extras, regions, suburbs)

## Validation Checkpoints

### 1. DRAFT Status - total_price can be null
**When:** While status='DRAFT'
**Expected:** total_price can be null without constraint errors
**Validation:** Database allows null values for DRAFT bookings

### 2. Service Selection - Step 1
**Required Fields:** service_id
**Optional Fields:** service_slug
**total_price:** Can be null
**Validation:** No constraint errors when creating/updating draft

### 3. Room Configuration - Step 2
**Required Fields:** bedrooms, bathrooms
**total_price:** Can be null (not enough data to calculate yet)
**Validation:** No constraint errors when updating bedrooms/bathrooms

### 4. Extras Selection - Step 3
**Required Fields:** None (extras are optional)
**total_price:** Can be null
**Validation:** No constraint errors when adding/removing extras

### 5. Location & Scheduling - Step 4
**Required Fields:** area_id, booking_date, start_time, end_time, address, postcode
**total_price:** Should be calculated after this step (has all required data)
**Validation:** total_price gets calculated and set automatically

### 6. Cleaner Selection - Step 5
**Required Fields:** None (cleaner selection is optional)
**total_price:** Should be set from previous step
**Validation:** total_price remains calculated

### 7. Review & Payment - Step 6
**Required Fields:** total_price
**Status Transition:** DRAFT → READY_FOR_PAYMENT
**Validation:** All required fields must be present, total_price must be > 0

### 8. Payment Confirmation
**Status Transition:** READY_FOR_PAYMENT → CONFIRMED
**Required Fields:** paystack_ref, paystack_status
**Validation:** Payment reference is persisted, total_price is locked

## Manual Test Scenarios

### Scenario 1: Complete Happy Path
**Objective:** Test the complete flow from draft creation to payment confirmation

**Steps:**
1. **Create Draft Booking**
   ```bash
   curl -X POST http://localhost:3000/api/bookings/draft \
     -H "Content-Type: application/json" \
     -d '{
       "serviceId": "service-uuid-here",
       "bedrooms": 2,
       "bathrooms": 1
     }'
   ```
   **Expected:** 
   - Status: DRAFT
   - total_price: null (not enough data yet)
   - No constraint errors

2. **Update with Location & Scheduling**
   ```bash
   curl -X POST http://localhost:3000/api/bookings/draft \
     -H "Content-Type: application/json" \
     -d '{
       "areaId": "area-uuid-here",
       "bookingDate": "2024-01-15",
       "startTime": "09:00",
       "endTime": "11:00",
       "address": "123 Test Street",
       "postcode": "12345"
     }'
   ```
   **Expected:**
   - total_price: calculated and set (e.g., 150.00)
   - currentStep: 4 or higher
   - priceCalculated: true

3. **Proceed to Review & Pay**
   ```bash
   curl -X POST http://localhost:3000/api/bookings/confirm \
     -H "Content-Type: application/json" \
     -d '{
       "bookingId": "booking-uuid-here"
     }'
   ```
   **Expected:**
   - Status: READY_FOR_PAYMENT
   - total_price: set and > 0
   - All required fields validated

4. **Initiate Payment**
   ```bash
   curl -X POST http://localhost:3000/api/payments/initiate \
     -H "Content-Type: application/json" \
     -d '{
       "bookingId": "booking-uuid-here",
       "customerName": "Test User",
       "customerEmail": "test@example.com",
       "customerPhone": "1234567890"
     }'
   ```
   **Expected:**
   - Payment reference generated
   - Authorization URL returned
   - No constraint errors

5. **Confirm Payment** (Simulate Paystack callback)
   ```bash
   curl -X POST http://localhost:3000/api/payments/confirm \
     -H "Content-Type: application/json" \
     -d '{
       "bookingId": "booking-uuid-here",
       "paystackReference": "PAY_1234567890",
       "paystackStatus": "success"
     }'
   ```
   **Expected:**
   - Status: CONFIRMED
   - paystack_ref: persisted
   - paystack_status: persisted
   - total_price: locked (cannot be changed)

### Scenario 2: Partial Data - total_price remains null
**Objective:** Test that total_price can remain null when insufficient data is provided

**Steps:**
1. **Create Draft with Minimal Data**
   ```bash
   curl -X POST http://localhost:3000/api/bookings/draft \
     -H "Content-Type: application/json" \
     -d '{
       "serviceId": "service-uuid-here"
     }'
   ```
   **Expected:**
   - Status: DRAFT
   - total_price: null
   - No constraint errors

2. **Update with Room Configuration Only**
   ```bash
   curl -X POST http://localhost:3000/api/bookings/draft \
     -H "Content-Type: application/json" \
     -d '{
       "bedrooms": 3,
       "bathrooms": 2
     }'
   ```
   **Expected:**
   - total_price: null (still missing area_id)
   - No constraint errors

3. **Try to Confirm (Should Fail)**
   ```bash
   curl -X POST http://localhost:3000/api/bookings/confirm \
     -H "Content-Type: application/json" \
     -d '{
       "bookingId": "booking-uuid-here"
     }'
   ```
   **Expected:**
   - Status: 422 (Validation Failed)
   - Error: "Please complete the following: Area Id, Booking Date, Start Time, End Time, Address, Postcode"
   - total_price: null (not calculated yet)

### Scenario 3: Price Calculation Trigger
**Objective:** Test that total_price gets calculated automatically when enough data is provided

**Steps:**
1. **Create Draft with Service Only**
   ```bash
   curl -X POST http://localhost:3000/api/bookings/draft \
     -H "Content-Type: application/json" \
     -d '{
       "serviceId": "service-uuid-here"
     }'
   ```
   **Expected:** total_price: null

2. **Add Room Configuration**
   ```bash
   curl -X POST http://localhost:3000/api/bookings/draft \
     -H "Content-Type: application/json" \
     -d '{
       "bedrooms": 2,
       "bathrooms": 1
     }'
   ```
   **Expected:** total_price: null (still missing area_id)

3. **Add Location (This should trigger price calculation)**
   ```bash
   curl -X POST http://localhost:3000/api/bookings/draft \
     -H "Content-Type: application/json" \
     -d '{
       "areaId": "area-uuid-here"
     }'
   ```
   **Expected:**
   - total_price: calculated (e.g., 120.00)
   - priceCalculated: true
   - No constraint errors

### Scenario 4: Status Transition Validation
**Objective:** Test that status transitions are properly validated

**Steps:**
1. **Create Complete Draft**
   ```bash
   curl -X POST http://localhost:3000/api/bookings/draft \
     -H "Content-Type: application/json" \
     -d '{
       "serviceId": "service-uuid-here",
       "areaId": "area-uuid-here",
       "bedrooms": 2,
       "bathrooms": 1,
       "bookingDate": "2024-01-15",
       "startTime": "09:00",
       "endTime": "11:00",
       "address": "123 Test Street",
       "postcode": "12345"
     }'
   ```
   **Expected:** total_price: calculated

2. **Try to Confirm with Missing total_price (Simulate Error)**
   ```bash
   # Manually set total_price to null in database
   # Then try to confirm
   curl -X POST http://localhost:3000/api/bookings/confirm \
     -H "Content-Type: application/json" \
     -d '{
       "bookingId": "booking-uuid-here"
     }'
   ```
   **Expected:**
   - Status: 422 (Validation Failed)
   - Error: "Total price must be calculated before proceeding to payment"
   - System should attempt to recalculate price

### Scenario 5: Payment Reference Persistence
**Objective:** Test that payment references are properly persisted on CONFIRMED status

**Steps:**
1. **Complete Booking to READY_FOR_PAYMENT**
   - Follow Scenario 1 steps 1-3

2. **Initiate Payment**
   - Follow Scenario 1 step 4

3. **Confirm Payment**
   - Follow Scenario 1 step 5

4. **Verify Payment Reference Persistence**
   ```bash
   curl -X GET http://localhost:3000/api/bookings/draft
   ```
   **Expected:**
   - Status: CONFIRMED
   - paystack_ref: "PAY_1234567890"
   - paystack_status: "success"
   - total_price: locked value

## Error Scenarios

### Error 1: NOT NULL Constraint Violation
**Test:** Try to create booking with total_price as required field
**Expected:** Should not occur with new validation system

### Error 2: Invalid Status Transition
**Test:** Try to transition from CONFIRMED back to DRAFT
**Expected:** Should be prevented by validation

### Error 3: Missing Payment Reference
**Test:** Try to confirm payment without paystack_ref
**Expected:** Should fail with validation error

## Success Criteria

### ✅ DRAFT Status
- [ ] total_price can be null without constraint errors
- [ ] Draft bookings can be created with minimal data
- [ ] No NOT NULL violations during draft creation/updates

### ✅ Price Calculation
- [ ] total_price is calculated automatically when enough data is provided
- [ ] Price calculation happens on each step update
- [ ] Calculated price is persisted to database

### ✅ Status Transitions
- [ ] DRAFT → READY_FOR_PAYMENT validates all required fields
- [ ] READY_FOR_PAYMENT → CONFIRMED requires payment reference
- [ ] Invalid transitions are prevented

### ✅ Payment Flow
- [ ] Payment initiation validates total_price > 0
- [ ] Payment confirmation persists paystack_ref and paystack_status
- [ ] total_price is locked after CONFIRMED status

### ✅ Error Handling
- [ ] Clear error messages for missing fields
- [ ] Graceful handling of calculation failures
- [ ] Proper HTTP status codes for different error types

## Test Results Template

```
Date: ___________
Tester: ___________

Scenario 1 - Complete Happy Path:
- [ ] Draft creation: PASS/FAIL
- [ ] Price calculation: PASS/FAIL
- [ ] Status transition: PASS/FAIL
- [ ] Payment initiation: PASS/FAIL
- [ ] Payment confirmation: PASS/FAIL

Scenario 2 - Partial Data:
- [ ] Draft with minimal data: PASS/FAIL
- [ ] total_price remains null: PASS/FAIL
- [ ] Confirmation fails appropriately: PASS/FAIL

Scenario 3 - Price Calculation Trigger:
- [ ] Service only: PASS/FAIL
- [ ] Add rooms: PASS/FAIL
- [ ] Add location triggers calculation: PASS/FAIL

Scenario 4 - Status Transition Validation:
- [ ] Complete draft: PASS/FAIL
- [ ] Missing total_price validation: PASS/FAIL

Scenario 5 - Payment Reference Persistence:
- [ ] Payment reference saved: PASS/FAIL
- [ ] Status updated to CONFIRMED: PASS/FAIL

Overall Result: PASS/FAIL
Notes: ___________
```

## Troubleshooting

### Common Issues

#### 1. NOT NULL Constraint Errors
- **Cause:** Database constraints not properly updated
- **Solution:** Run migration 008_make_draft_reliable.sql
- **Check:** Verify total_price column allows NULL for DRAFT status

#### 2. Price Calculation Not Triggering
- **Cause:** Missing required fields for calculation
- **Solution:** Ensure service_id, area_id, bedrooms, bathrooms are set
- **Check:** Verify shouldCalculateTotalPrice() logic

#### 3. Status Transition Failures
- **Cause:** Validation rules not met
- **Solution:** Check validateStatusTransition() function
- **Check:** Ensure all required fields are present

#### 4. Payment Reference Not Persisted
- **Cause:** confirmPaymentAction not called or failing
- **Solution:** Check payment confirmation flow
- **Check:** Verify paystack_ref and paystack_status are provided
