# Draft Creation Reliability - Manual Test Plan

## Overview
This document outlines the manual testing scenarios to validate the reliable draft creation functionality.

## Test Environment Setup
1. Ensure the database migration `008_make_draft_reliable.sql` has been applied
2. Clear browser cookies and local storage before each test
3. Use browser developer tools to monitor network requests and responses

## Test Scenarios

### Scenario 1: Guest User - Initial Draft Creation
**Objective**: Verify that a guest user can create a draft with minimal data

**Steps**:
1. Open browser in incognito/private mode
2. Navigate to the booking page
3. Click "Book" button without selecting any service or location
4. Verify that a draft is created with only `session_id` populated
5. Check browser cookies for `booking-session-id`
6. Verify the draft has `status = 'DRAFT'` and other fields are `null`

**Expected Results**:
- ✅ Draft created successfully with minimal data
- ✅ `session_id` is populated with a 64-character hex string
- ✅ `customer_id` is `null`
- ✅ Other fields (`service_id`, `area_id`, etc.) are `null`
- ✅ Cookie `booking-session-id` is set

**API Call**:
```bash
POST /api/bookings/draft
Content-Type: application/json

{}
```

**Expected Response**:
```json
{
  "booking": {
    "id": "uuid",
    "customer_id": null,
    "session_id": "64-char-hex-string",
    "status": "DRAFT",
    "service_id": null,
    "area_id": null,
    "total_price": null,
    "booking_date": null,
    "start_time": null,
    "end_time": null,
    "auto_assign": true,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "isNew": true
}
```

### Scenario 2: Guest User - Draft Retrieval
**Objective**: Verify that a guest user can retrieve their existing draft

**Steps**:
1. Complete Scenario 1 first
2. Refresh the page
3. Verify that the same draft is returned
4. Check that no new draft is created

**Expected Results**:
- ✅ Same draft ID is returned
- ✅ No new draft is created
- ✅ `isNew: false` in response

**API Call**:
```bash
GET /api/bookings/draft
```

**Expected Response**:
```json
{
  "booking": {
    "id": "same-uuid-as-before",
    "customer_id": null,
    "session_id": "same-session-id",
    "status": "DRAFT",
    "service_id": null,
    "area_id": null,
    "total_price": null,
    "booking_date": null,
    "start_time": null,
    "end_time": null,
    "auto_assign": true,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### Scenario 3: Guest User - Draft Updates
**Objective**: Verify that a guest user can update their draft with additional data

**Steps**:
1. Complete Scenario 1 first
2. Select a service and suburb
3. Verify that the draft is updated with the new data
4. Check that the same draft ID is maintained

**Expected Results**:
- ✅ Same draft ID is maintained
- ✅ New fields are populated
- ✅ `isNew: false` in response

**API Call**:
```bash
POST /api/bookings/draft
Content-Type: application/json

{
  "serviceId": "service-uuid",
  "suburbId": "area-uuid",
  "totalPrice": 150.00
}
```

**Expected Response**:
```json
{
  "booking": {
    "id": "same-uuid-as-before",
    "customer_id": null,
    "session_id": "same-session-id",
    "status": "DRAFT",
    "service_id": "service-uuid",
    "area_id": "area-uuid",
    "total_price": 150.00,
    "booking_date": null,
    "start_time": null,
    "end_time": null,
    "auto_assign": true,
    "created_at": "timestamp",
    "updated_at": "newer-timestamp"
  },
  "isNew": false
}
```

### Scenario 4: Authenticated User - Draft Creation
**Objective**: Verify that an authenticated user can create a draft

**Steps**:
1. Log in to the application
2. Navigate to the booking page
3. Click "Book" button without selecting any service or location
4. Verify that a draft is created with `customer_id` populated
5. Check that `session_id` is `null`

**Expected Results**:
- ✅ Draft created successfully with minimal data
- ✅ `customer_id` is populated with user's ID
- ✅ `session_id` is `null`
- ✅ Other fields are `null`

**API Call**:
```bash
POST /api/bookings/draft
Authorization: Bearer <user-token>
Content-Type: application/json

{}
```

**Expected Response**:
```json
{
  "booking": {
    "id": "uuid",
    "customer_id": "user-uuid",
    "session_id": null,
    "status": "DRAFT",
    "service_id": null,
    "area_id": null,
    "total_price": null,
    "booking_date": null,
    "start_time": null,
    "end_time": null,
    "auto_assign": true,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "isNew": true
}
```

### Scenario 5: Authenticated User - Draft Retrieval
**Objective**: Verify that an authenticated user can retrieve their existing draft

**Steps**:
1. Complete Scenario 4 first
2. Refresh the page
3. Verify that the same draft is returned
4. Check that no new draft is created

**Expected Results**:
- ✅ Same draft ID is returned
- ✅ No new draft is created
- ✅ `isNew: false` in response

### Scenario 6: Guest to Authenticated User Transition
**Objective**: Verify that a guest user's draft is properly handled when they log in

**Steps**:
1. Complete Scenario 1 (create guest draft)
2. Log in to the application
3. Navigate to the booking page
4. Verify that the guest draft is now associated with the user
5. Check that `customer_id` is populated and `session_id` is cleared

**Expected Results**:
- ✅ Draft is transferred to the authenticated user
- ✅ `customer_id` is populated with user's ID
- ✅ `session_id` is cleared (set to `null`)
- ✅ All other data is preserved

### Scenario 7: Duplicate Draft Prevention
**Objective**: Verify that duplicate drafts are prevented

**Steps**:
1. Complete Scenario 4 (create authenticated user draft)
2. Try to create another draft by calling the API again
3. Verify that the same draft is returned instead of creating a new one

**Expected Results**:
- ✅ No new draft is created
- ✅ Same draft ID is returned
- ✅ `isNew: false` in response

### Scenario 8: Database Constraint Validation
**Objective**: Verify that database constraints are properly enforced

**Steps**:
1. Try to create a draft with both `customer_id` and `session_id` as `null`
2. Verify that the request is rejected
3. Try to create a draft with invalid data
4. Verify that appropriate error messages are returned

**Expected Results**:
- ✅ Request with no `customer_id` or `session_id` is rejected
- ✅ Appropriate error message is returned
- ✅ No draft is created

### Scenario 9: RLS Policy Validation
**Objective**: Verify that Row Level Security policies work correctly

**Steps**:
1. Create a draft as User A
2. Try to access the draft as User B
3. Verify that User B cannot access User A's draft
4. Try to access a guest draft with a different session
5. Verify that the guest draft is not accessible

**Expected Results**:
- ✅ Users cannot access other users' drafts
- ✅ Guest users cannot access other guests' drafts
- ✅ Appropriate error messages are returned

### Scenario 10: Draft Status Transition Validation
**Objective**: Verify that drafts cannot be transitioned to non-DRAFT status without required fields

**Steps**:
1. Create a minimal draft (only `customer_id` or `session_id`)
2. Try to update the status to `PENDING` or `CONFIRMED`
3. Verify that the transition is rejected
4. Add all required fields
5. Try to transition the status again
6. Verify that the transition succeeds

**Expected Results**:
- ✅ Transition is rejected when required fields are missing
- ✅ Transition succeeds when all required fields are present
- ✅ Appropriate error messages are returned

## Error Scenarios

### Error 1: Invalid JSON
**Request**: `POST /api/bookings/draft` with invalid JSON
**Expected Response**: `400 Bad Request` with error message

### Error 2: Missing Authentication
**Request**: `POST /api/bookings/draft` without authentication or session
**Expected Response**: `401 Unauthorized` with error message

### Error 3: Database Connection Issues
**Request**: `POST /api/bookings/draft` when database is unavailable
**Expected Response**: `503 Service Unavailable` with error message

### Error 4: RLS Policy Violation
**Request**: `GET /api/bookings/draft` for another user's draft
**Expected Response**: `404 Not Found` or `403 Forbidden`

## Performance Tests

### Test 1: Concurrent Draft Creation
**Objective**: Verify that concurrent draft creation requests don't create duplicates

**Steps**:
1. Open multiple browser tabs
2. Simultaneously click "Book" in each tab
3. Verify that only one draft is created
4. Check that all tabs receive the same draft ID

### Test 2: Large Number of Drafts
**Objective**: Verify that the system can handle a large number of drafts

**Steps**:
1. Create 100+ guest drafts
2. Verify that all drafts are created successfully
3. Check that the unique constraints prevent duplicates

## Validation Checklist

- [ ] Guest users can create drafts with minimal data
- [ ] Authenticated users can create drafts with minimal data
- [ ] Drafts are properly retrieved and updated
- [ ] Duplicate drafts are prevented
- [ ] Guest to authenticated user transition works
- [ ] Database constraints are enforced
- [ ] RLS policies work correctly
- [ ] Error handling is appropriate
- [ ] Performance is acceptable
- [ ] All API endpoints work as expected

## Notes

1. **Session ID Format**: Session IDs should be 64-character hexadecimal strings
2. **Cookie Expiration**: Session cookies should expire after 7 days
3. **Database Constraints**: All constraints should be enforced at the database level
4. **Error Messages**: Error messages should be user-friendly and informative
5. **Performance**: Draft creation should be fast (< 500ms for typical requests)

## Troubleshooting

### Common Issues

1. **Migration Not Applied**: Ensure `008_make_draft_reliable.sql` has been applied
2. **RLS Policies**: Check that RLS policies are properly configured
3. **Cookie Issues**: Verify that cookies are being set and read correctly
4. **Database Constraints**: Check that all constraints are properly defined
5. **API Errors**: Check browser console and network tab for error details

### Debug Commands

```sql
-- Check if migration was applied
SELECT * FROM pg_migrations WHERE name = '008_make_draft_reliable';

-- Check draft constraints
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'bookings'::regclass;

-- Check unique indexes
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'bookings';

-- Check RLS policies
SELECT policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'bookings';
```
