import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { Profile } from '@/lib/database.types';

// Type for cleaner with profile data
type CleanerWithProfile = {
  id: string;
  profile_id: string;
  bio?: string;
  experience_years: number;
  hourly_rate?: number;
  is_available: boolean;
  rating: number;
  total_ratings: number;
  profiles: Profile | null;
};

const Body = z.object({
  bookingId: z.string().uuid().optional(),
  startISO: z.string().min(1),
  endISO: z.string().min(1),
  suburbId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { bookingId, startISO, endISO, suburbId, regionId } = Body.parse(json);

    const supabase = await createSupabaseServer();

    // Get the current user session for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({
        error: "authentication_required",
        message: "Please sign in to access cleaner availability"
      }, { status: 401 });
    }

    // Build the query based on available parameters
    let query = supabase
      .from('cleaners')
      .select(`
        id,
        profile_id,
        bio,
        experience_years,
        hourly_rate,
        is_available,
        rating,
        total_ratings,
        profiles (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('is_available', true);

    // If we have a suburbId, filter by cleaner locations
    if (suburbId) {
      // First get cleaner IDs for this suburb
      const { data: cleanerLocations, error: locationError } = await supabase
        .from('cleaner_locations')
        .select('cleaner_id')
        .eq('suburb_id', suburbId);

      if (locationError) {
        logger.error('Error fetching cleaner locations:', locationError);
        return NextResponse.json({ 
          error: 'Failed to fetch cleaner locations', 
          details: locationError.message 
        }, { status: 500 });
      }

      if (cleanerLocations && cleanerLocations.length > 0) {
        const cleanerIds = cleanerLocations.map(loc => loc.cleaner_id);
        query = query.in('id', cleanerIds);
      } else {
        // No cleaners in this suburb
        return NextResponse.json({ 
          availableCleaners: [],
          totalCount: 0,
          filters: { startISO, endISO, suburbId, regionId, bookingId }
        }, { status: 200 });
      }
    }

    const { data: cleaners, error: cleanersErr } = await query as { data: CleanerWithProfile[] | null, error: any };

    if (cleanersErr) {
      logger.error('Error fetching cleaners:', cleanersErr);
      return NextResponse.json({ 
        error: 'Failed to load cleaners', 
        details: cleanersErr.message 
      }, { status: 500 });
    }

    // Filter out cleaners with overlapping bookings
    const availableCleaners = [];
    
    for (const cleaner of cleaners || []) {
      // Check for overlapping bookings
      const { data: overlappingBookings, error: bookingError } = await supabase
        .from('bookings')
        .select('id')
        .eq('cleaner_id', cleaner.id)
        .in('status', ['PENDING', 'CONFIRMED', 'IN_PROGRESS'])
        .or(`and(start_time.lt.${endISO},end_time.gt.${startISO})`);

      if (bookingError) {
        logger.error('Error checking overlapping bookings:', bookingError);
        continue; // Skip this cleaner if we can't check bookings
      }

      // If no overlapping bookings, include this cleaner
      if (!overlappingBookings || overlappingBookings.length === 0) {
        const profile = cleaner.profiles;
        if (profile) {
          availableCleaners.push({
            id: cleaner.id,
            name: `${profile.first_name} ${profile.last_name}`,
            rating: cleaner.rating || 0,
            totalRatings: cleaner.total_ratings || 0,
            experienceYears: cleaner.experience_years || 0,
            bio: cleaner.bio || null,
            avatarUrl: profile.avatar_url || null,
            hourlyRate: cleaner.hourly_rate || null,
            eta: "15-30 min", // Default ETA - could be calculated based on location
            badges: [
              ...(cleaner.rating >= 4.5 ? ["Top Rated"] : []),
              ...(cleaner.experience_years >= 5 ? ["Experienced"] : []),
              ...(cleaner.total_ratings >= 50 ? ["Popular"] : []),
              "Verified"
            ]
          });
        }
      }
    }

    // Sort by rating (highest first), then by experience
    availableCleaners.sort((a, b) => {
      if (a.rating !== b.rating) return b.rating - a.rating;
      return b.experienceYears - a.experienceYears;
    });

    return NextResponse.json({ 
      availableCleaners,
      totalCount: availableCleaners.length,
      filters: {
        startISO,
        endISO,
        suburbId,
        regionId,
        bookingId
      }
    }, { status: 200 });

  } catch (err: any) {
    const msg = err?.message || 'Invalid request';
    logger.error("Error in enhanced cleaner availability API:", err);
    return NextResponse.json({ 
      error: 'Bad Request', 
      details: msg 
    }, { status: 400 });
  }
}
