import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from '@supabase/supabase-js';
import { env } from '@/env.server';
import { Database } from '@/lib/database.types';

// Enhanced validation schema
const bodySchema = z.object({
  regionId: z.string().min(1, "Region ID is required"),
  suburbId: z.string().min(1, "Suburb ID is required"),
  date: z.string().min(1, "Date is required").refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate >= new Date();
  }, "Date must be valid and not in the past"),
  timeSlot: z.string().min(1, "Time slot is required").refine((time) => {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }, "Time slot must be in HH:mm format"),
  bedrooms: z.number().min(1).max(10).default(1),
  bathrooms: z.number().min(1).max(10).default(1),
});

// Standardized response interface (for future use)
// interface AvailabilityResponse {
//   success: boolean;
//   cleaners: AvailableCleaner[];
//   totalCount: number;
//   date: string;
//   timeSlot: string;
//   suburbId: string;
//   regionId: string;
//   message?: string;
//   error?: string;
// }

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
    
    // Validate input with enhanced schema
    const validationResult = bodySchema.safeParse(json);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: errors
      }, { status: 400 });
    }

    const { regionId, suburbId, date, timeSlot } = validationResult.data;
    // Note: bedrooms and bathrooms are validated but not currently used in the query
    // They can be used for future capacity-based filtering

    // Calculate service duration and end time
    const serviceDuration = 120; // 2 hours in minutes
    const [startHour, startMinute] = timeSlot.split(':').map(Number);
    const endHour = startHour + Math.floor(serviceDuration / 60);
    const endMinute = startMinute + (serviceDuration % 60);
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

    // Check if Supabase is configured
    if (!env.NEXT_PUBLIC_SUPABASE_URL || (!env.SUPABASE_SERVICE_ROLE_KEY && !env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      console.warn('Supabase not configured, returning empty results');
      return NextResponse.json({
        success: true,
        cleaners: [],
        totalCount: 0,
        date,
        timeSlot,
        suburbId,
        regionId,
        message: 'Service temporarily unavailable - please try again later'
      }, { status: 200 });
    }

    // Create admin client for server-side operations
    const supabaseAdmin = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Single optimized query with proper joins and filters
    try {
      const { data: availableCleaners, error: queryError } = await supabaseAdmin
        .from('cleaners')
        .select(`
          id,
          profile_id,
          bio,
          rating,
          is_active,
          is_available,
          profiles!inner (
            first_name,
            last_name
          ),
          bookings!left (
            id,
            start_time,
            end_time,
            status
          )
        `)
        .eq('is_active', true)
        .eq('is_available', true)
        .not('bookings.status', 'in', '(PENDING,CONFIRMED,IN_PROGRESS)')
        .or(`bookings.id.is.null,and(bookings.booking_date.neq.${date},or(bookings.start_time.gt.${endTime},bookings.end_time.lt.${timeSlot}))`);

      if (queryError) {
        console.error('Error fetching available cleaners:', queryError);
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch available cleaners',
          cleaners: [],
          totalCount: 0,
          date,
          timeSlot,
          suburbId,
          regionId
        }, { status: 500 });
      }

      // Transform and filter results
      const cleaners: AvailableCleaner[] = (availableCleaners || [])
        .filter(cleaner => {
          // Additional client-side filtering for time conflicts
          const hasConflict = cleaner.bookings?.some(booking => {
            if (!booking.start_time || !booking.end_time) return false;
            return (timeSlot < booking.end_time && endTime > booking.start_time);
          });
          return !hasConflict;
        })
        .map(cleaner => {
          // Generate ETA based on cleaner attributes
          const baseEta = 20; // Base 20 minutes
          const rating = cleaner.rating || 0;
          const ratingBonus = rating >= 4.5 ? -5 : rating >= 4.0 ? -2 : 0;
          const etaMinutes = Math.max(10, baseEta + ratingBonus + Math.floor(Math.random() * 10));
          const eta = `${etaMinutes} min`;

          // Generate badges based on cleaner attributes
          const badges: string[] = [];
          if (cleaner.rating && cleaner.rating >= 4.5) badges.push('Top Rated');
          if (cleaner.rating && cleaner.rating >= 4.0) badges.push('Highly Rated');
          if (cleaner.rating && cleaner.rating >= 3.5) badges.push('Reliable');
          if (cleaner.bio && cleaner.bio.length > 50) badges.push('Experienced');

          // Get cleaner name from profiles table
          const profile = cleaner.profiles;
          const cleanerName = profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown Cleaner';

          return {
            id: cleaner.id,
            name: cleanerName,
            rating: cleaner.rating || 0,
            totalRatings: Math.floor(Math.random() * 100) + 10, // TODO: Get from actual data
            experienceYears: Math.floor(Math.random() * 10) + 1, // TODO: Get from actual data
            bio: cleaner.bio || undefined,
            avatarUrl: undefined, // TODO: Add avatar support
            eta,
            badges
          };
        })
        .sort((a, b) => b.rating - a.rating); // Sort by rating (highest first)

      // Return standardized response
      return NextResponse.json({
        success: true,
        cleaners,
        totalCount: cleaners.length,
        date,
        timeSlot,
        suburbId,
        regionId,
        message: cleaners.length === 0 ? 'No cleaners available for the selected time slot. Please try a different time or date.' : undefined
      }, { status: 200 });

    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Service temporarily unavailable',
        cleaners: [],
        totalCount: 0,
        date,
        timeSlot,
        suburbId,
        regionId,
        message: 'Please try again in a few moments'
      }, { status: 503 });
    }

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[cleaners/availability] error:", errorMessage);
    
    return NextResponse.json({
      success: false,
      error: "Invalid request",
      details: errorMessage,
      cleaners: [],
      totalCount: 0
    }, { status: 400 });
  }
}
