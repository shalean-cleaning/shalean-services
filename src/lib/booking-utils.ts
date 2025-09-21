import { createClient } from '@/lib/supabase-client'
import { BookingInsert, BookingUpdate, BookingStatus } from './database.types'

const supabase = createClient()

/**
 * Create a new booking with DRAFT status
 */
export async function createDraftBooking(bookingData: Omit<BookingInsert, 'status'>) {
  const { data, error } = await (supabase as any)
    .from('bookings')
    .insert({
      ...bookingData,
      status: 'DRAFT' as BookingStatus
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create draft booking: ${error.message}`)
  }

  return data as any as any
}

/**
 * Update a booking (only if it's in DRAFT or READY_FOR_PAYMENT status)
 */
export async function updateDraftBooking(bookingId: string, updates: BookingUpdate) {
  const { data, error } = await (supabase as any)
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .eq('status', 'DRAFT')
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update draft booking: ${error.message}`)
  }

  return data as any as any
}

/**
 * Move a booking from DRAFT to READY_FOR_PAYMENT
 */
export async function finalizeBooking(bookingId: string, customerDetails: {
  address: string
  postcode: string
  bedrooms: number
  bathrooms: number
}) {
  const { data, error } = await (supabase as any)
    .from('bookings')
    .update({
      ...customerDetails,
      status: 'READY_FOR_PAYMENT' as BookingStatus
    })
    .eq('id', bookingId)
    .eq('status', 'DRAFT')
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to finalize booking: ${error.message}`)
  }

  return data as any as any
}

/**
 * Auto-assign a cleaner to a booking
 */
export async function autoAssignCleaner(bookingId: string) {
  const { data, error } = await (supabase as any)
    .rpc('auto_assign_cleaner_simple', { booking_id_val: bookingId })

  if (error) {
    throw new Error(`Failed to auto-assign cleaner: ${error.message}`)
  }

  return data as any
}

/**
 * Get available cleaners for a booking
 */
export async function getAvailableCleaners(
  bookingDate: string,
  startTime: string,
  endTime: string,
  suburbId: string
) {
  const { data, error } = await (supabase as any)
    .rpc('get_available_cleaners', {
      booking_date_val: bookingDate,
      start_time_val: startTime,
      end_time_val: endTime,
      suburb_id_val: suburbId
    })

  if (error) {
    throw new Error(`Failed to get available cleaners: ${error.message}`)
  }

  return data as any
}

/**
 * Get booking details with all related information
 */
export async function getBookingDetails(bookingId: string) {
  const { data, error } = await supabase
    .from('booking_details_view')
    .select('*')
    .eq('id', bookingId)
    .single()

  if (error) {
    throw new Error(`Failed to get booking details: ${error.message}`)
  }

  return data as any
}

/**
 * Get booking items with service information
 */
export async function getBookingItems(bookingId: string) {
  const { data, error } = await supabase
    .from('booking_items_view')
    .select('*')
    .eq('booking_id', bookingId)

  if (error) {
    throw new Error(`Failed to get booking items: ${error.message}`)
  }

  return data as any
}

/**
 * Check if a booking is editable by the current user
 */
export async function isBookingEditable(bookingId: string) {
  const { data, error } = await (supabase as any)
    .rpc('is_booking_editable_by_customer', { booking_id: bookingId })

  if (error) {
    throw new Error(`Failed to check booking editability: ${error.message}`)
  }

  return data as any
}

/**
 * Get all bookings for the current user
 */
export async function getUserBookings(status?: BookingStatus) {
  let query = supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to get user bookings: ${error.message}`)
  }

  return data as any
}

/**
 * Update booking status
 */
export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const { data, error } = await (supabase as any)
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update booking status: ${error.message}`)
  }

  return data as any
}
