import { NextResponse } from 'next/server'

import { withApiSafe } from '@/lib/api-safe'
import { createClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

export const POST = withApiSafe(async (request: Request) => {
  const supabase = createClient()
  const body = await request.json()
  
  const { 
    email, 
    service_id, 
    suburb_id, 
    bedrooms, 
    bathrooms, 
    frequency, 
    extras, 
    total_price 
  } = body

  if (!email || !service_id || !suburb_id || !total_price) {
    return NextResponse.json({ 
      error: 'Email, service_id, suburb_id, and total_price are required' 
    }, { status: 400 })
  }

  // Store the quote in the database
  const { data, error } = await supabase
    .from('quotes')
    .insert({
      email,
      service_id,
      suburb_id,
      bedrooms: bedrooms || 0,
      bathrooms: bathrooms || 0,
      frequency: frequency || 'one-time',
      extras: extras || [],
      total_price,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save quote: ${error.message}`)
  }

  // TODO: Send email notification to customer
  // TODO: Send notification to admin team

  return NextResponse.json({ 
    success: true, 
    quote_id: data.id,
    message: 'Quote saved successfully' 
  }, { status: 201 })
}, { routeName: '/api/quotes' })
