import { NextResponse } from 'next/server'

import { withApiSafe } from '@/lib/api-safe'
import { createClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export const POST = withApiSafe(async (request: Request) => {
  const supabase = await createClient()
  const body = await request.json()
  
  const { service_id, suburb_id, extras = [], _bedrooms = 0, _bathrooms = 0, _frequency = 'one-time' } = body

  if (!service_id || !suburb_id) {
    return NextResponse.json({ error: 'Service ID and Suburb ID are required' }, { status: 400 })
  }

  // Convert extras to the format expected by the database function
  const extrasJson = extras.map((extra: { id: string; quantity?: number; price: number }) => ({
    extra_id: extra.id,
    quantity: extra.quantity || 1,
    price: extra.price
  }))

  // Call the database function to calculate price
  const { data, error } = await supabase.rpc('calculate_booking_price', {
    p_service_id: service_id,
    p_suburb_id: suburb_id,
    p_extras: extrasJson
  })

  if (error) {
    throw new Error(`Failed to calculate price: ${error.message}`)
  }

  // Get additional pricing details for breakdown
  const { data: serviceData, error: serviceError } = await supabase
    .from('services')
    .select('base_price, name')
    .eq('id', service_id)
    .single()

  const { data: suburbData, error: suburbError } = await supabase
    .from('suburbs')
    .select('delivery_fee, name')
    .eq('id', suburb_id)
    .single()

  if (serviceError || suburbError) {
    throw new Error('Failed to fetch pricing details')
  }

  // Calculate service fee (10% of base price)
  const serviceFee = serviceData.base_price * 0.10
  
  // Calculate extras total
  const extrasTotal = extras.reduce((sum: number, extra: { price: number; quantity?: number }) => {
    return sum + (extra.price * (extra.quantity || 1))
  }, 0)

  const breakdown = {
    base_price: serviceData.base_price,
    service_fee: serviceFee,
    delivery_fee: suburbData.delivery_fee,
    extras_total: extrasTotal,
    total: data
  }

  return NextResponse.json({
    total: data,
    breakdown,
    service_name: serviceData.name,
    suburb_name: suburbData.name
  }, { status: 200 })
}, { routeName: '/api/quote/calculate' })
