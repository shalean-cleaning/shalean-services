# Cleaner Selection Feature

This feature implements a comprehensive cleaner selection step for the booking flow, allowing users to choose from available cleaners or use auto-assignment.

## Features

### 🎯 Core Functionality
- **Location-based filtering**: Shows only cleaners who service the selected area
- **Availability checking**: Filters cleaners based on their schedule and existing bookings
- **Service compatibility**: Considers service requirements when matching cleaners
- **Rating-based sorting**: Displays cleaners sorted by rating and experience

### 🎨 User Interface
- **Cleaner cards**: Beautiful cards showing avatar, rating, experience, and badges
- **Auto-assign option**: One-click assignment of the best available cleaner
- **Skeleton loading**: Smooth loading states while fetching data
- **Error handling**: Graceful error states with retry options
- **Empty states**: Clear messaging when no cleaners are available

### 🤖 Auto-Assignment Logic
- **Deterministic selection**: Always picks the same cleaner for the same conditions
- **Rating priority**: Selects cleaner with highest rating first
- **Experience tiebreaker**: Uses experience years when ratings are equal
- **Consistent results**: Same input always produces same output

## Components

### `CleanerCard`
Displays individual cleaner information in a selectable card format.

**Props:**
- `cleaner`: Cleaner data object
- `isSelected`: Whether this cleaner is currently selected
- `onSelect`: Callback when cleaner is selected

**Features:**
- Star rating display
- Experience and ETA information
- Badge system for achievements
- Fallback avatar handling
- Selection state styling

### `CleanerSelectionStep`
Main component for the cleaner selection step in the booking flow.

**Features:**
- Fetches available cleaners based on location and time
- Auto-assign functionality
- Loading and error states
- Empty state handling
- Integration with booking store

## API Endpoints

### `POST /api/cleaners/available`
Fetches available cleaners for a specific location and time slot.

**Request Body:**
```json
{
  "suburb_id": "uuid",
  "date": "2024-01-15",
  "time": "10:00",
  "service_id": "uuid" // optional
}
```

**Response:**
```json
{
  "date": "2024-01-15",
  "time": "10:00",
  "suburb_id": "uuid",
  "service_id": "uuid",
  "available_cleaners": [
    {
      "id": "uuid",
      "name": "John Doe",
      "rating": 4.8,
      "total_ratings": 127,
      "experience_years": 5,
      "bio": "Professional cleaner...",
      "avatar_url": "https://...",
      "eta": "25 min",
      "badges": ["Top Rated", "Experienced"]
    }
  ],
  "total_count": 1
}
```

## Supabase Edge Function

### `get-available-cleaners`
Serverless function that queries the database for available cleaners.

**Logic:**
1. Validates input parameters
2. Calculates service duration
3. Queries cleaners by location and availability
4. Checks for booking conflicts
5. Generates ETA and badges
6. Returns sorted results

## Database Schema

The feature relies on these key tables:
- `cleaners`: Cleaner profiles and ratings
- `cleaner_locations`: Areas each cleaner services
- `availability_slots`: Cleaner schedules
- `bookings`: Existing appointments to avoid conflicts
- `profiles`: User information and avatars

## State Management

The cleaner selection integrates with the booking store:

```typescript
interface BookingState {
  selectedCleanerId: string | null;
  availableCleaners: Cleaner[];
  setSelectedCleanerId: (id: string | null) => void;
  setAvailableCleaners: (cleaners: Cleaner[]) => void;
  autoAssignCleaner: () => void;
}
```

## Testing

### Unit Tests
- Component rendering and interaction
- Auto-assignment logic
- Error handling
- Loading states

### Integration Tests
- API endpoint functionality
- Database query logic
- State management integration

### Test Files
- `src/components/booking/__tests__/cleaner-selection.test.tsx`
- `src/app/api/cleaners/available/__tests__/route.test.ts`

## Usage

The cleaner selection step is automatically integrated into the booking flow:

1. User completes location and time selection
2. System fetches available cleaners
3. User can manually select or use auto-assign
4. Selection is stored in booking state
5. User proceeds to booking confirmation

## Future Enhancements

- **Real-time availability**: WebSocket updates for live availability
- **Advanced filtering**: Filter by price, rating, or specific services
- **Cleaner preferences**: Remember user's preferred cleaners
- **Batch assignment**: Assign multiple cleaners for large jobs
- **Performance optimization**: Caching and pagination for large datasets
