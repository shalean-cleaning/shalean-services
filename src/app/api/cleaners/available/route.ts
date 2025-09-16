import { NextRequest, NextResponse } from 'next/server';
import { fetchAvailableCleaners } from '@/server/cleaners';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { suburb_id, date, time, service_id } = body;

    if (!suburb_id || !date || !time) {
      return NextResponse.json(
        { error: 'suburb_id, date, and time are required' },
        { status: 400 }
      );
    }

    // Convert date and time to ISO timestamps for the RPC
    const startISO = new Date(`${date}T${time}:00`).toISOString();
    const endISO = new Date(`${date}T${time}:00`).toISOString();
    
    // For now, use a default area - you can enhance this to map suburb_id to area names
    const area = "CBD"; // This should be mapped from suburb_id to actual area names

    // Use the new RPC function
    const cleaners = await fetchAvailableCleaners({
      area,
      serviceSlug: service_id || "standard-cleaning",
      startISO,
      endISO,
      limit: 20
    });

    // Transform the data to match the expected format
    const transformedCleaners = cleaners.map(cleaner => ({
      id: cleaner.id,
      name: cleaner.full_name,
      rating: cleaner.rating || 0,
      area: cleaner.area_label || "Cape Town"
    }));

    return NextResponse.json({ cleaners: transformedCleaners });

  } catch (error) {
    console.error('Error in available cleaners API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
