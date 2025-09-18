# Booking Flow Implementation Notes

This document outlines the booking flow implementation, required fields by step, and API endpoint behavior.

## Booking Flow Steps

### Step 1: Service Selection
**Required Fields:**
- `selectedService` (Service object with id, name, base_price)

**API Endpoints:**
- `GET /api/services/[slug]` - Fetch service details
- No draft creation at this step

### Step 2: Room Configuration
**Required Fields:**
- `bedroomCount` (number, min 1)
- `bathroomCount` (number, min 1)

**API Endpoints:**
- No draft creation at this step
- Price calculation happens client-side

### Step 3: Extras Selection
**Required Fields:**
- `selectedExtras` (array of extra objects with id, quantity, price)

**API Endpoints:**
- No draft creation at this step
- Extras are optional

### Step 4: Location & Scheduling
**Required Fields:**
- `selectedRegion` (string/UUID)
- `selectedSuburb` (string/UUID)
- `selectedDate` (string, YYYY-MM-DD format)
- `selectedTime` (string, HH:mm format)
- `address` (string, min 1 char)
- `postcode` (string, min 1 char)
- `specialInstructions` (optional string)

**API Endpoints:**
- No draft creation at this step
- Location validation happens client-side

### Step 5: Cleaner Selection
**Required Fields:**
- `selectedCleanerId` (UUID, optional)
- `autoAssign` (boolean, default false)

**API Endpoints:**
- `POST /api/bookings/select-cleaner` - Update cleaner selection
- Creates/updates draft booking with cleaner info

### Step 6: Review & Payment
**Required Fields:**
- All previous step fields must be complete
- `totalPrice` (computed server-side)

**API Endpoints:**
- `GET /api/bookings/draft` - Check for existing draft
- `POST /api/bookings/draft` - Create/update draft
- `POST /api/payments/initiate` - Start payment process

## API Endpoint Behavior

### GET /api/bookings/draft
**Purpose:** Check for existing draft booking
**Authentication:** Required (session-based)
**Response:**
- `200` - Existing draft found with bookingId
- `404` - No draft found
- `401` - Authentication required

### POST /api/bookings/draft
**Purpose:** Create new draft or update existing draft
**Authentication:** Required (session-based)

**Idempotent Behavior:**
1. **Check for existing draft** - If found, update with new data
2. **Return existing draft** - If no new data provided
3. **Create new draft** - Only if no existing draft and all required fields present

**Validation Levels:**
- **Flexible Schema** - Accepts partial data for updates
- **Complete Schema** - Validates all required fields for new bookings

**Response Codes:**
- `200` - Existing draft returned or updated
- `201` - New draft created
- `422` - Validation failed (missing required fields)
- `401` - Authentication required
- `500` - Server error

**Required Fields for New Booking:**
- `serviceId` (UUID)
- `suburbId` (UUID)
- `totalPrice` (positive number)
- `address` (min 1 char)
- `postcode` (min 1 char)
- `bedrooms` (min 1)
- `bathrooms` (min 1)
- `bookingDate` + `startTime` OR `startISO`

**Optional Fields:**
- `regionId` (UUID)
- `selectedCleanerId` (UUID)
- `autoAssign` (boolean)
- `specialInstructions` (string)
- `extras` (array)

### POST /api/payments/initiate
**Purpose:** Initialize payment with Paystack
**Authentication:** Required (session-based)
**Required Fields:**
- `bookingId` (UUID)

**Validation:**
- Booking must exist and belong to user
- Booking must not be already paid
- Booking status must allow payment

## Error Handling

### Client-Side Error Handling
**Review Step Behavior:**
1. **Try GET first** - Check for existing draft
2. **Handle 404 gracefully** - No existing draft, proceed to create
3. **Handle 422 with guidance** - Show specific missing fields
4. **Handle composeDraftPayload errors** - Guide user to complete steps

**Error Messages:**
- Missing fields: "Please complete the following: [fields]. Use the back button to return to the previous steps."
- Validation errors: Show specific field errors with guidance
- Network errors: Generic retry message

### Server-Side Error Mapping
**422 - Validation Failed:**
- Missing required fields for new booking
- Invalid field formats
- Database reference validation failures

**401 - Authentication Required:**
- No valid session
- User not logged in

**500 - Server Error:**
- Database connection issues
- Internal processing errors

## Database Schema

### Bookings Table (Required Fields)
- `customer_id` (UUID, NOT NULL) - From session
- `service_id` (UUID, NOT NULL) - From serviceId
- `suburb_id` (UUID, NOT NULL) - From suburbId
- `booking_date` (DATE, NOT NULL) - From selectedDate
- `start_time` (TIME, NOT NULL) - From selectedTime
- `end_time` (TIME, NOT NULL) - Computed from start_time + duration
- `total_price` (DECIMAL, NOT NULL) - Server-computed
- `status` (TEXT, NOT NULL) - Default 'PENDING'

### Optional Fields
- `cleaner_id` (UUID) - From selectedCleanerId
- `auto_assign` (BOOLEAN) - Default false
- `special_instructions` (TEXT)
- `notes` (TEXT)

## Price Computation

**Server-Side Calculation:**
1. Base service price
2. Service fee (10% of base price)
3. Delivery fee (from suburb)
4. Extras total (quantity × price)
5. Final total = base + service_fee + delivery_fee + extras

**Client-Side Validation:**
- Server price must match client price (within 0.01 tolerance)
- Server price takes precedence for security

## RLS Policies

**Bookings Table:**
- Customers can read their own bookings: `auth.uid() = customer_id`
- Customers can create their own bookings: `auth.uid() = customer_id`
- Customers can update pending bookings: `auth.uid() = customer_id AND status IN ('PENDING', 'CONFIRMED')`

## Testing Scenarios

### Happy Path
1. Complete all steps with valid data
2. Review step finds existing draft or creates new one
3. Payment initiation succeeds
4. Booking status updates to 'PAID'

### Partial Data Scenarios
1. **Missing service** - 422 with "serviceId required"
2. **Missing location** - 422 with "suburbId, address, postcode required"
3. **Missing scheduling** - 422 with "bookingDate, startTime required"
4. **Missing rooms** - 422 with "bedrooms, bathrooms required"

### Idempotent Behavior
1. **Re-visit Review** - Returns existing draft (200)
2. **Update existing draft** - Updates with new data (200)
3. **Create new draft** - Creates with complete data (201)

### Error Recovery
1. **422 errors** - Show specific field guidance
2. **Network errors** - Allow retry
3. **Authentication errors** - Redirect to login
