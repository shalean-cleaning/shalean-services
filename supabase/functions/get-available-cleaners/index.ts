import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  suburb_id: string;
  date: string;
  time: string;
  service_id?: string;
}

interface AvailableCleaner {
  id: string;
  name: string;
  rating: number;
  total_ratings: number;
  experience_years: number;
  bio?: string;
  avatar_url?: string;
  eta?: string;
  badges?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Parse request body
    const { suburb_id, date, time, service_id }: RequestBody = await req.json()

    if (!suburb_id || !date || !time) {
      return new Response(
        JSON.stringify({ error: 'suburb_id, date, and time are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate date format
    const selectedDate = new Date(date)
    if (isNaN(selectedDate.getTime())) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = selectedDate.getDay()

    // Calculate service duration (default 2 hours if no service specified)
    let serviceDuration = 120 // Default 2 hours
    if (service_id) {
      const { data: service, error: serviceError } = await supabaseClient
        .from('services')
        .select('duration_minutes')
        .eq('id', service_id)
        .single()

      if (!serviceError && service) {
        serviceDuration = service.duration_minutes
      }
    }

    // Calculate end time
    const startTime = time
    const startHour = parseInt(startTime.split(':')[0])
    const startMinute = parseInt(startTime.split(':')[1])
    const endHour = startHour + Math.floor(serviceDuration / 60)
    const endMinute = startMinute + (serviceDuration % 60)
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`

    // Get available cleaners for this suburb and time slot
    // Note: Using current schema with suburbs table and cleaner_availability table
    const { data: cleanerData, error: cleanerError } = await supabaseClient
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
        profiles!inner (
          first_name,
          last_name,
          avatar_url
        ),
        cleaner_availability!inner (
          day_of_week,
          start_time,
          end_time,
          is_available
        )
      `)
      .eq('is_available', true)
      .eq('cleaner_availability.day_of_week', dayOfWeek)
      .eq('cleaner_availability.is_available', true)

    if (cleanerError) {
      console.error('Error fetching cleaners:', cleanerError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch cleaners' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get existing bookings for this date and time slot
    const { data: existingBookings, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('start_time, end_time, cleaner_id')
      .eq('suburb_id', suburb_id)
      .eq('booking_date', date)
      .in('status', ['PENDING', 'CONFIRMED', 'IN_PROGRESS'])

    if (bookingError) {
      console.error('Error fetching existing bookings:', bookingError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch existing bookings' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Filter available cleaners
    const availableCleaners: AvailableCleaner[] = []

    for (const cleaner of cleanerData || []) {
      const profile = cleaner.profiles
      const availabilitySlot = cleaner.cleaner_availability[0] // Should only be one per day

      // Check if cleaner is available during this time slot
      if (availabilitySlot && 
          startTime >= availabilitySlot.start_time && 
          endTime <= availabilitySlot.end_time) {
        
        // Check if cleaner has any conflicting bookings
        const hasConflict = existingBookings?.some(booking => {
          if (booking.cleaner_id !== cleaner.id) return false
          
          const bookingStart = booking.start_time
          const bookingEnd = booking.end_time
          
          // Check for time overlap
          return (startTime < bookingEnd && endTime > bookingStart)
        })

        if (!hasConflict) {
          // Generate ETA (simulate based on distance/availability)
          const etaMinutes = Math.floor(Math.random() * 30) + 15 // 15-45 minutes
          const eta = `${etaMinutes} min`

          // Generate badges based on cleaner attributes
          const badges: string[] = []
          if (cleaner.rating >= 4.5) badges.push('Top Rated')
          if (cleaner.experience_years >= 5) badges.push('Experienced')
          if (cleaner.total_ratings >= 50) badges.push('Popular')
          if (cleaner.hourly_rate && cleaner.hourly_rate <= 30) badges.push('Great Value')

          availableCleaners.push({
            id: cleaner.id,
            name: `${profile.first_name} ${profile.last_name}`,
            rating: cleaner.rating,
            total_ratings: cleaner.total_ratings,
            experience_years: cleaner.experience_years,
            bio: cleaner.bio,
            avatar_url: profile.avatar_url,
            eta,
            badges
          })
        }
      }
    }

    // Sort cleaners by rating (highest first), then by experience
    availableCleaners.sort((a, b) => {
      if (a.rating !== b.rating) return b.rating - a.rating
      return b.experience_years - a.experience_years
    })

    return new Response(
      JSON.stringify({ 
        date,
        time,
        suburb_id,
        service_id,
        available_cleaners: availableCleaners,
        total_count: availableCleaners.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in get-available-cleaners function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
