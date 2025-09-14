import { NextResponse } from 'next/server'

import { withApiSafe } from '../../../../lib/api-safe'

export const dynamic = "force-dynamic";

export const GET = withApiSafe(async () => {
  const testimonials = [
    {
      id: 't1',
      name: 'Alex',
      avatar: '/images/placeholder.png',
      quote: 'Brilliant service, quick booking, spotless result.',
    },
  ]
  return NextResponse.json(testimonials)
})
