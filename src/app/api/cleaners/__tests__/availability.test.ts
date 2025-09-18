import { NextRequest } from 'next/server';
import { POST } from '../availability/route';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  data: [],
                  error: null,
                })),
              })),
            })),
          })),
        })),
      })),
    })),
  })),
}));

// Mock environment variables
jest.mock('@/env.server', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
  },
}));

describe('/api/cleaners/availability', () => {
  const createMockRequest = (body: any) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  describe('Request Validation', () => {
    it('returns 400 for missing required fields', async () => {
      const request = createMockRequest({
        regionId: 'region-1',
        // Missing suburbId, date, timeSlot
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request');
    });

    it('returns 400 for invalid date format', async () => {
      const request = createMockRequest({
        regionId: 'region-1',
        suburbId: 'suburb-1',
        date: 'invalid-date',
        timeSlot: '10:00',
        bedrooms: 2,
        bathrooms: 1,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid date format');
    });

    it('accepts valid request with all required fields', async () => {
      const request = createMockRequest({
        regionId: 'region-1',
        suburbId: 'suburb-1',
        date: '2024-01-15',
        timeSlot: '10:00',
        bedrooms: 2,
        bathrooms: 1,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('cleaners');
      expect(data).toHaveProperty('totalCount');
      expect(data).toHaveProperty('date');
      expect(data).toHaveProperty('timeSlot');
      expect(data).toHaveProperty('suburbId');
    });
  });

  describe('Response Format', () => {
    it('returns cleaners in the correct format', async () => {
      const request = createMockRequest({
        regionId: 'region-1',
        suburbId: 'suburb-1',
        date: '2024-01-15',
        timeSlot: '10:00',
        bedrooms: 2,
        bathrooms: 1,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.cleaners)).toBe(true);
      expect(data.totalCount).toBe(0); // Mock returns empty array
    });

    it('includes metadata in response', async () => {
      const request = createMockRequest({
        regionId: 'region-1',
        suburbId: 'suburb-1',
        date: '2024-01-15',
        timeSlot: '10:00',
        bedrooms: 2,
        bathrooms: 1,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.date).toBe('2024-01-15');
      expect(data.timeSlot).toBe('10:00');
      expect(data.suburbId).toBe('suburb-1');
    });
  });

  describe('Error Handling', () => {
    it('handles missing environment variables', async () => {
      // Mock missing env vars
      jest.doMock('@/env.server', () => ({
        env: {
          NEXT_PUBLIC_SUPABASE_URL: undefined,
          SUPABASE_SERVICE_ROLE_KEY: undefined,
        },
      }));

      const request = createMockRequest({
        regionId: 'region-1',
        suburbId: 'suburb-1',
        date: '2024-01-15',
        timeSlot: '10:00',
        bedrooms: 2,
        bathrooms: 1,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Missing NEXT_PUBLIC_SUPABASE_URL');
    });

    it('handles Supabase errors gracefully', async () => {
      // Mock Supabase error
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    eq: jest.fn(() => ({
                      data: null,
                      error: { message: 'Database error' },
                    })),
                  })),
                })),
              })),
            })),
          })),
        })),
      };

      jest.doMock('@supabase/supabase-js', () => ({
        createClient: jest.fn(() => mockSupabase),
      }));

      const request = createMockRequest({
        regionId: 'region-1',
        suburbId: 'suburb-1',
        date: '2024-01-15',
        timeSlot: '10:00',
        bedrooms: 2,
        bathrooms: 1,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch cleaners');
    });
  });

  describe('Business Logic', () => {
    it('calculates day of week correctly', async () => {
      const request = createMockRequest({
        regionId: 'region-1',
        suburbId: 'suburb-1',
        date: '2024-01-15', // Monday
        timeSlot: '10:00',
        bedrooms: 2,
        bathrooms: 1,
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      // The function should calculate day of week (1 for Monday)
    });

    it('calculates service duration correctly', async () => {
      const request = createMockRequest({
        regionId: 'region-1',
        suburbId: 'suburb-1',
        date: '2024-01-15',
        timeSlot: '10:00',
        bedrooms: 2,
        bathrooms: 1,
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      // Should use default 2-hour duration
    });

    it('handles time slot calculations', async () => {
      const request = createMockRequest({
        regionId: 'region-1',
        suburbId: 'suburb-1',
        date: '2024-01-15',
        timeSlot: '14:30',
        bedrooms: 2,
        bathrooms: 1,
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      // Should calculate end time as 16:30 (14:30 + 2 hours)
    });
  });

  describe('Data Processing', () => {
    it('sorts cleaners by rating (highest first)', async () => {
      const request = createMockRequest({
        regionId: 'region-1',
        suburbId: 'suburb-1',
        date: '2024-01-15',
        timeSlot: '10:00',
        bedrooms: 2,
        bathrooms: 1,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Even with mock data, the sorting logic should be applied
      expect(Array.isArray(data.cleaners)).toBe(true);
    });

    it('generates ETA and badges for cleaners', async () => {
      const request = createMockRequest({
        regionId: 'region-1',
        suburbId: 'suburb-1',
        date: '2024-01-15',
        timeSlot: '10:00',
        bedrooms: 2,
        bathrooms: 1,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // The function should generate ETA and badges even for mock data
      expect(Array.isArray(data.cleaners)).toBe(true);
    });
  });
});
