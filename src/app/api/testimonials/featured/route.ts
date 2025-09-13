import { NextResponse } from 'next/server'
import { withApiSafe } from '@/lib/api-safe'
export const runtime = 'nodejs'

export const GET = withApiSafe(async () => {
  const testimonials = [
    {
      id: 't1',
      name: 'Alex',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      quote: 'Brilliant service, quick booking, spotless result.',
    },
  ]
  return NextResponse.json(testimonials, { status: 200 })
}, { routeName: '/api/testimonials/featured' })