import { NextRequest, NextResponse } from 'next/server';

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

    // Call Supabase Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/get-available-cleaners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        suburb_id,
        date,
        time,
        service_id: service_id || null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Edge function error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch available cleaners' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in available cleaners API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
