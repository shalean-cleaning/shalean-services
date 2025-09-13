import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  suburb_id: string;
  date: string;
  service_duration?: number; // in minutes, defaults to 120
}

interface AvailableSlot {
  time: string;
  available_cleaners: number;
  cleaner_ids: string[];
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
    const { suburb_id, date, service_duration = 120 }: RequestBody = await req.json()

    if (!suburb_id || !date) {
      return new Response(
        JSON.stringify({ error: 'suburb_id and date are required' }),
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

    // Generate time slots (every 2 hours from 8 AM to 6 PM)
    const timeSlots = []
    for (let hour = 8; hour <= 18; hour += 2) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    }

    // Get available cleaners for this suburb
    const { data: cleanerLocations, error: locationError } = await supabaseClient
      .from('cleaner_locations')
      .select(`
        cleaner_id,
        cleaners!inner (
          id,
          is_available,
          availability_slots!inner (
            day_of_week,
            start_time,
            end_time,
            is_active
          )
        )
      `)
      .eq('suburb_id', suburb_id)
      .eq('cleaners.is_available', true)
      .eq('cleaners.availability_slots.day_of_week', dayOfWeek)
      .eq('cleaners.availability_slots.is_active', true)

    if (locationError) {
      console.error('Error fetching cleaner locations:', locationError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch cleaner availability' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get existing bookings for this date and suburb
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

    // Process availability
    const availableSlots: AvailableSlot[] = []

    for (const timeSlot of timeSlots) {
      const slotStartTime = timeSlot
      const slotEndTime = `${(parseInt(timeSlot.split(':')[0]) + Math.ceil(service_duration / 60)).toString().padStart(2, '0')}:00`

      const availableCleaners = []

      // Check each cleaner's availability for this time slot
      for (const location of cleanerLocations || []) {
        const cleaner = location.cleaners
        const availabilitySlot = cleaner.availability_slots[0] // Should only be one per day

        // Check if cleaner is available during this time slot
        if (availabilitySlot && 
            slotStartTime >= availabilitySlot.start_time && 
            slotEndTime <= availabilitySlot.end_time) {
          
          // Check if cleaner has any conflicting bookings
          const hasConflict = existingBookings?.some(booking => {
            if (booking.cleaner_id !== cleaner.id) return false
            
            const bookingStart = booking.start_time
            const bookingEnd = booking.end_time
            
            // Check for time overlap
            return (slotStartTime < bookingEnd && slotEndTime > bookingStart)
          })

          if (!hasConflict) {
            availableCleaners.push(cleaner.id)
          }
        }
      }

      // Only include slots with at least one available cleaner
      if (availableCleaners.length > 0) {
        availableSlots.push({
          time: timeSlot,
          available_cleaners: availableCleaners.length,
          cleaner_ids: availableCleaners
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        date,
        suburb_id,
        available_slots: availableSlots,
        total_slots: timeSlots.length,
        available_count: availableSlots.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in get-available-slots function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
