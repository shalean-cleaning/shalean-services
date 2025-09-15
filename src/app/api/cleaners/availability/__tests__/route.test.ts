import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { POST } from '@/app/api/cleaners/availability/route';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabaseClient: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null,
        })),
        in: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  },
}));

describe('/api/cleaners/availability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when required parameters are missing', async () => {
    const request = new NextRequest('http://localhost/api/cleaners/availability', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Availability lookup failed');
  });

  it('returns empty array when no cleaners are available', async () => {
    const { supabaseClient } = await import('@/lib/supabase');
    
    // Mock empty results
    vi.mocked(supabaseClient.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null,
        })),
        in: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    } as any);

    const request = new NextRequest('http://localhost/api/cleaners/availability', {
      method: 'POST',
      body: JSON.stringify({
        regionId: 'region-1',
        suburbId: 'suburb-1',
        date: '2024-01-15',
        timeSlot: '10:00',
        bedrooms: 2,
        bathrooms: 1,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.cleaners).toEqual([]);
  });

  it('successfully returns available cleaners', async () => {
    const { supabaseClient } = await import('@/lib/supabase');
    
    const mockCleanerLocations = [
      { cleaner_id: 'cleaner-1' },
      { cleaner_id: 'cleaner-2' },
    ];

    const mockCleaners = [
      {
        id: 'cleaner-1',
        rating: 4.8,
        total_ratings: 127,
        experience_years: 5,
        bio: 'Professional cleaner',
        profiles: {
          first_name: 'John',
          last_name: 'Doe',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      },
    ];

    // Mock the chain of Supabase calls
    const mockChain = {
      select: vi.fn(() => mockChain),
      eq: vi.fn(() => mockChain),
      in: vi.fn(() => mockChain),
    };

    vi.mocked(supabaseClient.from)
      .mockReturnValueOnce({
        ...mockChain,
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: mockCleanerLocations,
            error: null,
          })),
        })),
      } as any)
      .mockReturnValueOnce({
        ...mockChain,
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      } as any)
      .mockReturnValueOnce({
        ...mockChain,
        select: vi.fn(() => ({
          in: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: mockCleaners,
              error: null,
            })),
          })),
        })),
      } as any);

    const request = new NextRequest('http://localhost/api/cleaners/availability', {
      method: 'POST',
      body: JSON.stringify({
        regionId: 'region-1',
        suburbId: 'suburb-1',
        date: '2024-01-15',
        timeSlot: '10:00',
        bedrooms: 2,
        bathrooms: 1,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.cleaners).toHaveLength(1);
    expect(data.cleaners[0]).toMatchObject({
      id: 'cleaner-1',
      name: 'John Doe',
      rating: 4.8,
      totalRatings: 127,
      experienceYears: 5,
      bio: 'Professional cleaner',
      avatarUrl: 'https://example.com/avatar.jpg',
      eta: '15-30 min',
      badges: ['Verified', 'Insured'],
    });
  });

  it('handles database errors gracefully', async () => {
    const { supabaseClient } = await import('@/lib/supabase');
    
    vi.mocked(supabaseClient.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: new Error('Database connection failed'),
        })),
      })),
    } as any);

    const request = new NextRequest('http://localhost/api/cleaners/availability', {
      method: 'POST',
      body: JSON.stringify({
        regionId: 'region-1',
        suburbId: 'suburb-1',
        date: '2024-01-15',
        timeSlot: '10:00',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Availability lookup failed');
    expect(data.details).toBe('Database connection failed');
  });
});
