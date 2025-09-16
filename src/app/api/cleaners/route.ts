import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

// Type definition for cleaner data from database
type CleanerRow = {
  id: string;
  full_name: string | null;
  rating: number | null;
  // add more fields if you use them later
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Get suburbId from query params (prefixed to avoid unused-var error if not used)
    const _suburbId = searchParams.get('suburbId') ?? null;
    
    const supabase = createSupabaseServer();
    
    // Fetch cleaners from database
    const { data: cleaners, error } = await supabase
      .from('cleaners')
      .select('id, full_name, rating');

    if (error) {
      console.error('Error fetching cleaners:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cleaners' },
        { status: 500 }
      );
    }

    // Ensure cleaners is an array
    const list = Array.isArray(cleaners) ? (cleaners as CleanerRow[]) : [];

    // Transform the data to match expected format
    const transformedCleaners = list.map((cleaner: CleanerRow) => ({
      id: cleaner.id,
      name: cleaner.full_name ?? 'Unnamed Cleaner',
      rating: cleaner.rating ?? 0,
    }));

    return NextResponse.json({ cleaners: transformedCleaners });

  } catch (error) {
    console.error('Error in cleaners API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
