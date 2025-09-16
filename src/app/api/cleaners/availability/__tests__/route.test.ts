import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { POST } from '@/app/api/cleaners/availability/route';

// Mock the server helper function
vi.mock('@/server/cleaners', () => ({
  fetchAvailableCleaners: vi.fn(),
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
    const { fetchAvailableCleaners } = await import('@/server/cleaners');
    
    // Mock empty results
    vi.mocked(fetchAvailableCleaners).mockResolvedValue([]);

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
    expect(fetchAvailableCleaners).toHaveBeenCalledWith({
      area: 'CBD',
      serviceSlug: 'standard-cleaning',
      startISO: '2024-01-15T10:00:00.000Z',
      endISO: '2024-01-15T10:00:00.000Z',
      limit: 20
    });
  });

  it('successfully returns available cleaners', async () => {
    const { fetchAvailableCleaners } = await import('@/server/cleaners');
    
    const mockCleaners = [
      {
        id: 'cleaner-1',
        full_name: 'John Doe',
        rating: 4.8,
        area_label: 'CBD, Sea Point',
      },
      {
        id: 'cleaner-2',
        full_name: 'Jane Smith',
        rating: 4.9,
        area_label: 'Claremont',
      },
    ];

    vi.mocked(fetchAvailableCleaners).mockResolvedValue(mockCleaners);

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
    expect(data.cleaners).toHaveLength(2);
    expect(data.cleaners[0]).toMatchObject({
      id: 'cleaner-1',
      name: 'John Doe',
      rating: 4.8,
      totalRatings: 50,
      experienceYears: 3,
      bio: 'Professional cleaner with 4.8 star rating',
      avatarUrl: null,
      eta: '15-30 min',
      badges: ['Verified', 'Insured'],
      areaLabel: 'CBD, Sea Point',
    });
  });

  it('handles server errors gracefully', async () => {
    const { fetchAvailableCleaners } = await import('@/server/cleaners');
    
    vi.mocked(fetchAvailableCleaners).mockRejectedValue(new Error('Database connection failed'));

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
