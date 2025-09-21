/**
 * Price Calculation Utilities
 * 
 * Handles total_price calculation and validation throughout the booking flow.
 * Ensures total_price is properly set based on booking status and data availability.
 */

import { Database } from '@/lib/database.types'
import { shouldCalculateTotalPrice } from './booking-validation'

type Booking = Database['public']['Tables']['bookings']['Row']
type BookingStatus = Booking['status']

export interface PriceCalculationInput {
  service_id: string
  area_id: string
  bedrooms: number
  bathrooms: number
  extras?: Array<{
    id: string
    quantity: number
    price: number
  }>
}

export interface PriceBreakdown {
  base_price: number
  room_price: number
  extras_total: number
  service_fee: number
  delivery_fee: number
  total: number
}

/**
 * Calculates total price for a booking
 */
export async function calculateBookingPrice(
  supabase: any,
  input: PriceCalculationInput
): Promise<{ total: number; breakdown: PriceBreakdown }> {
  const { service_id, area_id, bedrooms, bathrooms, extras = [] } = input

  // Get service pricing
  const { data: serviceData, error: serviceError } = await supabase
    .from('services')
    .select('base_price, name, service_fee_flat, service_fee_pct')
    .eq('id', service_id)
    .single()

  if (serviceError) {
    throw new Error(`Failed to fetch service data: ${serviceError.message}`)
  }

  // Get area pricing
  const { data: areaData, error: areaError } = await supabase
    .from('suburbs')
    .select('delivery_fee, name, price_adjustment_pct')
    .eq('id', area_id)
    .single()

  if (areaError) {
    throw new Error(`Failed to fetch area data: ${areaError.message}`)
  }

  // Calculate base price
  const basePrice = serviceData.base_price || 0

  // Calculate room pricing (assuming standard rates for now)
  const additionalBedroomPrice = 20 // $20 per additional bedroom
  const additionalBathroomPrice = 15 // $15 per additional bathroom
  
  const roomPrice = 
    (Math.max(0, bedrooms - 1) * additionalBedroomPrice) +
    (Math.max(0, bathrooms - 1) * additionalBathroomPrice)

  // Calculate extras total
  const extrasTotal = extras.reduce(
    (total, extra) => total + (extra.price * extra.quantity),
    0
  )

  // Calculate service fee
  const serviceFeeFlat = serviceData.service_fee_flat || 0
  const serviceFeePct = serviceData.service_fee_pct || 0
  const subtotal = basePrice + roomPrice + extrasTotal
  const serviceFee = serviceFeeFlat + (subtotal * serviceFeePct / 100)

  // Get delivery fee
  const deliveryFee = areaData.delivery_fee || 0

  // Calculate total
  const total = basePrice + roomPrice + extrasTotal + serviceFee + deliveryFee

  const breakdown: PriceBreakdown = {
    base_price: basePrice,
    room_price: roomPrice,
    extras_total: extrasTotal,
    service_fee: serviceFee,
    delivery_fee: deliveryFee,
    total: Math.max(0, total)
  }

  return {
    total: breakdown.total,
    breakdown
  }
}

/**
 * Updates total_price for a booking based on current data
 */
export async function updateBookingTotalPrice(
  supabase: any,
  booking: Partial<Booking>
): Promise<{ success: boolean; total_price?: number; error?: string }> {
  try {
    // Check if we have enough data to calculate price
    if (!shouldCalculateTotalPrice(booking)) {
      return {
        success: true,
        total_price: null // Keep as null until we have enough data
      }
    }

    // Prepare calculation input
    const input: PriceCalculationInput = {
      service_id: booking.service_id!,
      area_id: booking.area_id!,
      bedrooms: booking.bedrooms!,
      bathrooms: booking.bathrooms!,
      extras: [] // TODO: Get extras from booking_extras table
    }

    // Calculate price
    const { total } = await calculateBookingPrice(supabase, input)

    // Update the booking with calculated price
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        total_price: total,
        updated_at: new Date().toISOString()
      })
      .eq('id', booking.id)

    if (updateError) {
      return {
        success: false,
        error: `Failed to update total price: ${updateError.message}`
      }
    }

    return {
      success: true,
      total_price: total
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error calculating price'
    }
  }
}

/**
 * Validates that total_price is appropriate for the booking status
 */
export function validateTotalPriceForStatus(
  booking: Partial<Booking>,
  status: BookingStatus
): { isValid: boolean; error?: string } {
  // For DRAFT status, total_price can be null
  if (status === 'DRAFT') {
    return { isValid: true }
  }

  // For all other statuses, total_price must be set and > 0
  if (!booking.total_price || booking.total_price <= 0) {
    return {
      isValid: false,
      error: `Total price is required for ${status} status`
    }
  }

  return { isValid: true }
}

/**
 * Gets the appropriate total_price value for a booking based on its status
 */
export function getTotalPriceForStatus(
  booking: Partial<Booking>,
  status: BookingStatus
): number | null {
  // For DRAFT status, return null if not calculated yet
  if (status === 'DRAFT') {
    return booking.total_price || null
  }

  // For all other statuses, return the calculated price or 0
  return booking.total_price || 0
}

/**
 * Creates a price calculation summary for debugging
 */
export function createPriceCalculationSummary(
  booking: Partial<Booking>,
  breakdown?: PriceBreakdown
): string {
  const lines = [
    `Booking ID: ${booking.id}`,
    `Status: ${booking.status}`,
    `Service ID: ${booking.service_id || 'Not set'}`,
    `Area ID: ${booking.area_id || 'Not set'}`,
    `Bedrooms: ${booking.bedrooms || 'Not set'}`,
    `Bathrooms: ${booking.bathrooms || 'Not set'}`,
    `Total Price: ${booking.total_price || 'Not calculated'}`
  ]

  if (breakdown) {
    lines.push('', 'Price Breakdown:')
    lines.push(`  Base Price: $${breakdown.base_price}`)
    lines.push(`  Room Price: $${breakdown.room_price}`)
    lines.push(`  Extras Total: $${breakdown.extras_total}`)
    lines.push(`  Service Fee: $${breakdown.service_fee}`)
    lines.push(`  Delivery Fee: $${breakdown.delivery_fee}`)
    lines.push(`  Total: $${breakdown.total}`)
  }

  return lines.join('\n')
}
