import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock the Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServer: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => ({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null
      }))
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          in: jest.fn(() => ({
            data: [
              {
                id: 'cleaner-1',
                profile_id: 'profile-1',
                bio: 'Professional cleaner',
                experience_years: 5,
                hourly_rate: 25,
                is_available: true,
                rating: 4.8,
                total_ratings: 100,
                profiles: {
                  first_name: 'John',
                  last_name: 'Doe',
                  avatar_url: 'https://example.com/avatar.jpg'
                }
              }
            ],
            error: null
          }))
        }))
      }))
    }))
  }))
}));

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

describe('/api/cleaners/available-enhanced', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return available cleaners with valid request', async () => {
    const request = new NextRequest('http://localhost:3000/api/cleaners/available-enhanced', {
      method: 'POST',
      body: JSON.stringify({
        startISO: '2024-01-15T10:00:00Z',
        endISO: '2024-01-15T12:00:00Z',
        suburbId: 'suburb-123'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.availableCleaners).toBeDefined();
    expect(Array.isArray(data.availableCleaners)).toBe(true);
    expect(data.totalCount).toBeDefined();
    expect(data.filters).toBeDefined();
  });

  it('should return 401 for unauthenticated requests', async () => {
    // Mock unauthenticated session
    const { createSupabaseServer } = require('@/lib/supabase/server');
    createSupabaseServer.mockReturnValue({
      auth: {
        getSession: jest.fn(() => ({
          data: { session: null },
          error: null
        }))
      }
    });

    const request = new NextRequest('http://localhost:3000/api/cleaners/available-enhanced', {
      method: 'POST',
      body: JSON.stringify({
        startISO: '2024-01-15T10:00:00Z',
        endISO: '2024-01-15T12:00:00Z'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('authentication_required');
  });

  it('should return 400 for invalid request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/cleaners/available-enhanced', {
      method: 'POST',
      body: JSON.stringify({
        // Missing required fields
        suburbId: 'suburb-123'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Bad Request');
  });

  it('should handle optional bookingId parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/cleaners/available-enhanced', {
      method: 'POST',
      body: JSON.stringify({
        bookingId: 'booking-123',
        startISO: '2024-01-15T10:00:00Z',
        endISO: '2024-01-15T12:00:00Z',
        suburbId: 'suburb-123'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.filters.bookingId).toBe('booking-123');
  });
});
