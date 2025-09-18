import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from '@supabase/supabase-js';
import { env } from '@/env.server';
import { Database } from '@/lib/database.types';

const bodySchema = z.object({
  regionId: z.string().min(1),
  suburbId: z.string().min(1),
  date: z.string().min(1), // ISO date string
  timeSlot: z.string().min(1), // "HH:mm" format
  bedrooms: z.number().min(1).default(1),
  bathrooms: z.number().min(1).default(1),
});

interface AvailableCleaner {
  id: string;
  name: string;
  rating: number;
  totalRatings: number;
  experienceYears: number;
  bio?: string;
  avatarUrl?: string;
  eta?: string;
  badges?: string[];
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { suburbId, date, timeSlot } = bodySchema.parse(json);

    if (!env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 });
    }
    if (!env.SUPABASE_SERVICE_ROLE_KEY && !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Missing Supabase key (service or anon)' }, { status: 500 });
    }

    // Create admin client for server-side operations
    const supabaseAdmin = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Validate date format
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = selectedDate.getDay();

    // Calculate service duration (default 2 hours)
    const serviceDuration = 120; // 2 hours in minutes
    const startTime = timeSlot;
    const startHour = parseInt(startTime.split(':')[0]);
    const startMinute = parseInt(startTime.split(':')[1]);
    const endHour = startHour + Math.floor(serviceDuration / 60);
    const endMinute = startMinute + (serviceDuration % 60);
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

    // Get available cleaners for this suburb and time slot
    // Using PRD-compliant schema with cleaners table having name field directly
    const { data: cleanerData, error: cleanerError } = await supabaseAdmin
      .from('cleaners')
      .select(`
        id,
        name,
        bio,
        rating,
        is_active,
        is_available,
        cleaner_areas!inner (
          area_id
        ),
        cleaner_availability!inner (
          day_of_week,
          start_time,
          end_time,
          is_available
        )
      `)
      .eq('is_active', true)
      .eq('is_available', true)
      .eq('cleaner_areas.area_id', suburbId)
      .eq('cleaner_availability.day_of_week', dayOfWeek)
      .eq('cleaner_availability.is_available', true);

    if (cleanerError) {
      console.error('Error fetching cleaners:', cleanerError);
      return NextResponse.json({ error: 'Failed to fetch cleaners' }, { status: 500 });
    }

    // Get existing bookings for this date and time slot to check conflicts
    const { data: existingBookings, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('start_time, end_time, cleaner_id')
      .eq('suburb_id', suburbId)
      .eq('booking_date', date)
      .in('status', ['PENDING', 'CONFIRMED', 'IN_PROGRESS']);

    if (bookingError) {
      console.error('Error fetching existing bookings:', bookingError);
      return NextResponse.json({ error: 'Failed to fetch existing bookings' }, { status: 500 });
    }

    // Filter available cleaners
    const availableCleaners: AvailableCleaner[] = [];

    for (const cleaner of cleanerData || []) {
      const availabilitySlot = cleaner.cleaner_availability[0]; // Should only be one per day

      // Check if cleaner is available during this time slot
      if (availabilitySlot && 
          startTime >= availabilitySlot.start_time && 
          endTime <= availabilitySlot.end_time) {
        
        // Check if cleaner has any conflicting bookings
        const hasConflict = existingBookings?.some(booking => {
          if (booking.cleaner_id !== cleaner.id) return false;
          
          const bookingStart = booking.start_time;
          const bookingEnd = booking.end_time;
          
          // Check for time overlap
          return (startTime < bookingEnd && endTime > bookingStart);
        });

        if (!hasConflict) {
          // Generate ETA (simulate based on distance/availability)
          const etaMinutes = Math.floor(Math.random() * 30) + 15; // 15-45 minutes
          const eta = `${etaMinutes} min`;

          // Generate badges based on cleaner attributes
          const badges: string[] = [];
          if (cleaner.rating >= 4.5) badges.push('Top Rated');
          if (cleaner.rating >= 4.0) badges.push('Highly Rated');
          if (cleaner.rating >= 3.5) badges.push('Reliable');

          availableCleaners.push({
            id: cleaner.id,
            name: cleaner.name || 'Unknown Cleaner',
            rating: cleaner.rating || 0,
            totalRatings: Math.floor(Math.random() * 100) + 10, // Simulate total ratings
            experienceYears: Math.floor(Math.random() * 10) + 1, // Simulate experience
            bio: cleaner.bio,
            avatarUrl: undefined, // No avatar in current schema
            eta,
            badges
          });
        }
      }
    }

    // Sort cleaners by rating (highest first)
    availableCleaners.sort((a, b) => b.rating - a.rating);

    return NextResponse.json({ 
      cleaners: availableCleaners,
      totalCount: availableCleaners.length,
      date,
      timeSlot,
      suburbId
    }, { status: 200 });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[cleaners/availability] error:", errorMessage);
    
    return NextResponse.json({ 
      error: "Invalid request", 
      details: errorMessage 
    }, { status: 400 });
  }
}
