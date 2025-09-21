# Quick Quote API Repair - Manual Test Plan

## Overview
This document outlines the manual testing steps to verify that the Quick Quote APIs and UI are working correctly after the repair.

## Prerequisites
1. Next.js development server running (`npm run dev`)
2. Supabase environment variables configured
3. Database tables exist (services, extras, regions, suburbs, frequency_discounts)

## Test Steps

### 1. API Endpoint Testing

#### 1.1 Test Services API
```bash
# Test the services endpoint
curl http://localhost:3000/api/services

# Expected: JSON response with services array and extras array
# Should not return 500 errors
```

#### 1.2 Test Service Categories API
```bash
# Test the service categories endpoint
curl http://localhost:3000/api/service-categories

# Expected: JSON response with categories array and services array
# Should not return 500 errors
```

#### 1.3 Test Extras API
```bash
# Test the extras endpoint
curl http://localhost:3000/api/extras

# Expected: JSON response with extras array
# Should not return 500 errors
```

#### 1.4 Test Regions API
```bash
# Test the regions endpoint
curl http://localhost:3000/api/regions

# Expected: JSON response with regions array
# Should not return 500 errors
```

#### 1.5 Test Suburbs API
```bash
# Test the suburbs endpoint
curl http://localhost:3000/api/suburbs

# Expected: JSON response with suburbs array
# Should not return 500 errors
```

#### 1.6 Test Frequency Discounts API
```bash
# Test the frequency discounts endpoint
curl http://localhost:3000/api/frequency-discounts

# Expected: JSON response with frequency discounts array
# Should not return 500 errors
```

### 2. UI Testing

#### 2.1 Homepage Quick Quote
1. Navigate to `http://localhost:3000`
2. Scroll to the Quick Quote section
3. **Expected Results:**
   - No 500 errors in browser console
   - Service dropdown is populated with options
   - Region dropdown is populated with options
   - Form loads without errors

#### 2.2 Quick Quote Modal/Component
1. Click on "Get Quote" or similar button to open Quick Quote
2. **Expected Results:**
   - Modal/component opens without errors
   - All dropdowns are populated:
     - Services dropdown has options
     - Extras dropdown has options (if applicable)
     - Regions dropdown has options
     - Suburbs dropdown has options (when region is selected)
   - No console errors
   - Form validation works

#### 2.3 Empty State Handling
1. If tables are empty, the lazy seeding should trigger
2. **Expected Results:**
   - Minimal data is automatically seeded
   - Dropdowns are populated with seeded data
   - No 500 errors

### 3. Database Verification

#### 3.1 Check Tables Exist
```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('services', 'extras', 'regions', 'suburbs', 'frequency_discounts');
```

#### 3.2 Check Data Exists
```sql
-- Check if tables have data
SELECT 'services' as table_name, COUNT(*) as count FROM services
UNION ALL
SELECT 'extras', COUNT(*) FROM extras
UNION ALL
SELECT 'regions', COUNT(*) FROM regions
UNION ALL
SELECT 'suburbs', COUNT(*) FROM suburbs
UNION ALL
SELECT 'frequency_discounts', COUNT(*) FROM frequency_discounts;
```

### 4. Seeding Verification

#### 4.1 Manual Seeding
```bash
# Run the seeding script
node scripts/seed-quick-quote-data.js

# Expected: Success messages for each table seeded
```

#### 4.2 Lazy Seeding Test
1. Clear all data from services and extras tables
2. Navigate to homepage and open Quick Quote
3. **Expected Results:**
   - Minimal data is automatically seeded
   - Dropdowns are populated
   - No errors

### 5. Error Scenarios

#### 5.1 Network Errors
1. Disconnect from internet
2. Try to load Quick Quote
3. **Expected Results:**
   - Graceful error handling
   - User-friendly error message
   - No crashes

#### 5.2 Database Connection Issues
1. Temporarily break Supabase connection
2. Try to load Quick Quote
3. **Expected Results:**
   - Graceful fallback
   - Error message displayed
   - No 500 errors

## Success Criteria

### ✅ API Endpoints
- [ ] All 6 API endpoints return 200 status
- [ ] No 500 errors in any endpoint
- [ ] JSON responses are properly formatted
- [ ] Data is returned (either seeded or lazy-seeded)

### ✅ UI Components
- [ ] Quick Quote loads without errors
- [ ] All dropdowns are populated
- [ ] No console errors
- [ ] Form validation works
- [ ] Empty states are handled gracefully

### ✅ Database
- [ ] All required tables exist
- [ ] Tables have data (either pre-seeded or lazy-seeded)
- [ ] Column names match API expectations
- [ ] RLS policies allow public read access

### ✅ Seeding
- [ ] Manual seeding script works
- [ ] Lazy seeding triggers when tables are empty
- [ ] Seeded data appears in UI
- [ ] No duplicate data created

## Troubleshooting

### Common Issues

#### 1. 500 Errors
- Check Supabase environment variables
- Verify database tables exist
- Check RLS policies
- Review API endpoint logs

#### 2. Empty Dropdowns
- Run seeding script: `node scripts/seed-quick-quote-data.js`
- Check if lazy seeding is working
- Verify table data exists

#### 3. Console Errors
- Check browser developer tools
- Look for CORS issues
- Verify API endpoint URLs
- Check for missing dependencies

#### 4. Database Connection Issues
- Verify Supabase URL and keys
- Check network connectivity
- Review Supabase project status

## Test Results Template

```
Date: ___________
Tester: ___________

API Endpoints:
- [ ] Services API: PASS/FAIL
- [ ] Service Categories API: PASS/FAIL  
- [ ] Extras API: PASS/FAIL
- [ ] Regions API: PASS/FAIL
- [ ] Suburbs API: PASS/FAIL
- [ ] Frequency Discounts API: PASS/FAIL

UI Testing:
- [ ] Homepage Quick Quote: PASS/FAIL
- [ ] Quick Quote Modal: PASS/FAIL
- [ ] Empty State Handling: PASS/FAIL

Database:
- [ ] Tables Exist: PASS/FAIL
- [ ] Data Present: PASS/FAIL

Seeding:
- [ ] Manual Seeding: PASS/FAIL
- [ ] Lazy Seeding: PASS/FAIL

Overall Result: PASS/FAIL
Notes: ___________
```
