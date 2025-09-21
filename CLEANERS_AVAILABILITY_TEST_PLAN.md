# Cleaners Availability API Reliability Test Plan

## Overview
This test plan verifies the reliability and robustness of the `/api/cleaners/availability` endpoint, ensuring it handles various scenarios gracefully and provides consistent responses.

## Test Environment Setup

### Prerequisites
- Clean browser session
- Access to booking flow
- Test data in database (cleaners, regions, suburbs)
- Network throttling tools (optional)

### Test Data Requirements
- **Regions**: At least 2 regions with different suburbs
- **Cleaners**: At least 5 active cleaners with different ratings
- **Bookings**: Some existing bookings for conflict testing
- **Time Slots**: Various time slots throughout the day

## Test Scenarios

### 1. Input Validation Tests

#### 1.1 Valid Input
**Objective**: Verify API accepts valid input and returns expected response

**Test Steps**:
1. Navigate to booking flow
2. Select valid region and suburb
3. Choose future date and time slot
4. Submit request

**Expected Result**:
- Status: 200
- Response shape: `{ success: true, cleaners: [...], totalCount: number, ... }`
- Cleaners array contains valid cleaner objects

#### 1.2 Invalid Date Format
**Test Data**: `{ date: "invalid-date", timeSlot: "10:00", regionId: "valid", suburbId: "valid" }`

**Expected Result**:
- Status: 400
- Response: `{ success: false, error: "Validation failed", details: [...] }`
- Error details specify date validation issue

#### 1.3 Past Date
**Test Data**: `{ date: "2023-01-01", timeSlot: "10:00", regionId: "valid", suburbId: "valid" }`

**Expected Result**:
- Status: 400
- Response: `{ success: false, error: "Validation failed", details: [...] }`
- Error details specify date must not be in past

#### 1.4 Invalid Time Format
**Test Data**: `{ date: "2024-12-25", timeSlot: "25:00", regionId: "valid", suburbId: "valid" }`

**Expected Result**:
- Status: 400
- Response: `{ success: false, error: "Validation failed", details: [...] }`
- Error details specify time format issue

#### 1.5 Missing Required Fields
**Test Data**: `{ date: "2024-12-25", timeSlot: "10:00" }` (missing regionId, suburbId)

**Expected Result**:
- Status: 400
- Response: `{ success: false, error: "Validation failed", details: [...] }`
- Error details list all missing fields

### 2. Database Query Tests

#### 2.1 Normal Operation
**Objective**: Verify single optimized query returns correct results

**Test Steps**:
1. Use valid input with known available cleaners
2. Check response time (should be < 2 seconds)
3. Verify cleaner data completeness

**Expected Result**:
- Fast response time
- Complete cleaner objects with all required fields
- Proper sorting by rating (highest first)

#### 2.2 No Available Cleaners
**Test Steps**:
1. Use time slot with all cleaners booked
2. Submit request

**Expected Result**:
- Status: 200
- Response: `{ success: true, cleaners: [], totalCount: 0, message: "No cleaners available..." }`
- UI shows informative empty state

#### 2.3 Database Connection Error
**Test Steps**:
1. Simulate database connection failure
2. Submit request

**Expected Result**:
- Status: 503
- Response: `{ success: false, error: "Service temporarily unavailable", ... }`
- UI shows error state with retry option

### 3. Response Format Tests

#### 3.1 Successful Response Structure
**Expected Response Format**:
```json
{
  "success": true,
  "cleaners": [
    {
      "id": "string",
      "name": "string",
      "rating": number,
      "totalRatings": number,
      "experienceYears": number,
      "bio": "string",
      "avatarUrl": "string|null",
      "eta": "string",
      "badges": ["string"]
    }
  ],
  "totalCount": number,
  "date": "string",
  "timeSlot": "string",
  "suburbId": "string",
  "regionId": "string",
  "message": "string|null"
}
```

#### 3.2 Error Response Structure
**Expected Error Format**:
```json
{
  "success": false,
  "error": "string",
  "details": [
    {
      "field": "string",
      "message": "string"
    }
  ],
  "cleaners": [],
  "totalCount": 0
}
```

### 4. UI Integration Tests

#### 4.1 Loading State
**Test Steps**:
1. Start booking flow
2. Select date/time
3. Observe loading state

**Expected Result**:
- Skeleton cards appear immediately
- Loading state persists until response received
- No flickering or layout shifts

#### 4.2 Success State
**Test Steps**:
1. Use valid input with available cleaners
2. Wait for response

**Expected Result**:
- Cleaner cards render properly
- All cleaner information displayed correctly
- Selection functionality works
- Auto-assign option available

#### 4.3 Empty State
**Test Steps**:
1. Use time slot with no available cleaners
2. Wait for response

**Expected Result**:
- Informative empty state message
- Auto-assign option still available
- No error messages
- User can continue with booking

#### 4.4 Error State
**Test Steps**:
1. Simulate network error or invalid input
2. Observe error handling

**Expected Result**:
- Clear error message displayed
- Retry button available
- Auto-assign option still available
- User can continue with booking

### 5. Performance Tests

#### 5.1 Response Time
**Test Steps**:
1. Measure API response time for various scenarios
2. Test with different data volumes

**Expected Results**:
- Normal queries: < 2 seconds
- Complex queries: < 5 seconds
- No timeouts under normal conditions

#### 5.2 Concurrent Requests
**Test Steps**:
1. Send multiple simultaneous requests
2. Monitor response times and success rates

**Expected Results**:
- All requests complete successfully
- Response times remain reasonable
- No database connection issues

### 6. Edge Cases

#### 6.1 Very Early/Late Time Slots
**Test Data**: `{ timeSlot: "06:00" }` or `{ timeSlot: "22:00" }`

**Expected Result**:
- API accepts valid time slots
- Appropriate response based on cleaner availability

#### 6.2 Weekend vs Weekday
**Test Steps**:
1. Test with weekend dates
2. Test with weekday dates
3. Compare availability

**Expected Result**:
- Different availability patterns if applicable
- Consistent response format

#### 6.3 Large Bedroom/Bathroom Counts
**Test Data**: `{ bedrooms: 10, bathrooms: 10 }`

**Expected Result**:
- API accepts valid counts
- Response reflects any capacity limitations

### 7. Security Tests

#### 7.1 SQL Injection Prevention
**Test Data**: `{ regionId: "'; DROP TABLE cleaners; --" }`

**Expected Result**:
- Request rejected with validation error
- No database damage
- Proper error response

#### 7.2 XSS Prevention
**Test Data**: `{ timeSlot: "<script>alert('xss')</script>" }`

**Expected Result**:
- Request rejected with validation error
- No script execution
- Proper error response

### 8. Integration Tests

#### 8.1 End-to-End Booking Flow
**Test Steps**:
1. Complete entire booking flow
2. Verify cleaner selection works
3. Check booking creation

**Expected Result**:
- Smooth user experience
- No errors in booking creation
- Selected cleaner properly assigned

#### 8.2 Auto-Assign Functionality
**Test Steps**:
1. Use auto-assign option
2. Complete booking
3. Verify cleaner assignment

**Expected Result**:
- Auto-assign works correctly
- Highest-rated available cleaner selected
- Booking created successfully

## Test Execution Checklist

### Pre-Test Setup
- [ ] Database has test data
- [ ] All required environment variables set
- [ ] Network connectivity verified
- [ ] Browser developer tools open

### Test Execution
- [ ] All validation tests pass
- [ ] Database query tests pass
- [ ] Response format tests pass
- [ ] UI integration tests pass
- [ ] Performance tests pass
- [ ] Edge cases handled properly
- [ ] Security tests pass
- [ ] Integration tests pass

### Post-Test Verification
- [ ] No console errors
- [ ] No database corruption
- [ ] All test data cleaned up
- [ ] Performance metrics recorded

## Success Criteria

### Functional Requirements
- [ ] API validates all inputs correctly
- [ ] Single optimized query used
- [ ] Predictable JSON response shape
- [ ] UI handles all states gracefully
- [ ] No mock data fallbacks in production

### Performance Requirements
- [ ] Response time < 2 seconds for normal queries
- [ ] Response time < 5 seconds for complex queries
- [ ] No timeouts under normal conditions
- [ ] Handles concurrent requests properly

### Reliability Requirements
- [ ] Graceful error handling
- [ ] No crashes or unhandled exceptions
- [ ] Consistent response format
- [ ] Proper HTTP status codes

### User Experience Requirements
- [ ] Clear loading states
- [ ] Informative error messages
- [ ] Helpful empty states
- [ ] Smooth booking flow

## Rollback Plan

If issues are found:
1. Revert to previous API version
2. Disable new validation temporarily
3. Restore mock data fallback if needed
4. Monitor for regressions

## Monitoring

### Key Metrics to Track
- API response times
- Error rates by type
- Empty result frequency
- User completion rates
- Database query performance

### Alerts to Set Up
- Response time > 5 seconds
- Error rate > 5%
- Database connection failures
- High empty result rates

## Conclusion

This test plan ensures the cleaners availability API is reliable, performant, and provides a good user experience. All tests should pass before deploying to production.
