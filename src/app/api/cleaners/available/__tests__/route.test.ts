import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/cleaners/available/route';
import { NextRequest } from 'next/server';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('/api/cleaners/available', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when required parameters are missing', async () => {
    const request = new NextRequest('http://localhost/api/cleaners/available', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('suburb_id, date, and time are required');
  });

  it('returns error when Supabase configuration is missing', async () => {
    // Mock missing environment variables
    vi.mocked(process.env).NEXT_PUBLIC_SUPABASE_URL = undefined;
    vi.mocked(process.env).NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined;

    const request = new NextRequest('http://localhost/api/cleaners/available', {
      method: 'POST',
      body: JSON.stringify({
        suburb_id: 'suburb-1',
        date: '2024-01-15',
        time: '10:00',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Missing Supabase configuration');
  });

  it('successfully fetches available cleaners', async () => {
    const mockCleaners = [
      {
        id: 'cleaner-1',
        name: 'John Doe',
        rating: 4.8,
        total_ratings: 127,
        experience_years: 5,
        bio: 'Professional cleaner',
        avatar_url: 'https://example.com/avatar.jpg',
        eta: '25 min',
        badges: ['Top Rated'],
      },
    ];

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        available_cleaners: mockCleaners,
        total_count: 1,
      }),
    });

    const request = new NextRequest('http://localhost/api/cleaners/available', {
      method: 'POST',
      body: JSON.stringify({
        suburb_id: 'suburb-1',
        date: '2024-01-15',
        time: '10:00',
        service_id: 'service-1',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.available_cleaners).toEqual(mockCleaners);
    expect(data.total_count).toBe(1);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://test.supabase.co/functions/v1/get-available-cleaners',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-anon-key',
        },
        body: JSON.stringify({
          suburb_id: 'suburb-1',
          date: '2024-01-15',
          time: '10:00',
          service_id: 'service-1',
        }),
      }
    );
  });

  it('handles edge function errors', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({
        error: 'Database connection failed',
      }),
    });

    const request = new NextRequest('http://localhost/api/cleaners/available', {
      method: 'POST',
      body: JSON.stringify({
        suburb_id: 'suburb-1',
        date: '2024-01-15',
        time: '10:00',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch available cleaners');
  });

  it('handles network errors', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));

    const request = new NextRequest('http://localhost/api/cleaners/available', {
      method: 'POST',
      body: JSON.stringify({
        suburb_id: 'suburb-1',
        date: '2024-01-15',
        time: '10:00',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
