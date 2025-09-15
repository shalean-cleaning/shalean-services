import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { suburb_id, date } = body;

    if (!suburb_id || !date) {
      return NextResponse.json(
        { error: 'suburb_id and date are required' },
        { status: 400 }
      );
    }

    // For now, return mock available time slots
    // TODO: Implement actual availability checking with Supabase Edge Function
    const mockAvailableSlots = [
      { time: '08:00', available: true },
      { time: '10:00', available: true },
      { time: '12:00', available: true },
      { time: '14:00', available: true },
      { time: '16:00', available: true },
      { time: '18:00', available: true },
    ];

    return NextResponse.json({
      available_slots: mockAvailableSlots,
      date,
      suburb_id,
    });

    // Original Supabase Edge Function call (commented out until function is deployed)
    /*
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/get-available-slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        suburb_id,
        date,
        service_duration: service_duration || 120, // Default 2 hours
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Edge function error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch available slots' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    */

  } catch (error) {
    console.error('Error in availability API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
