import { NextResponse } from 'next/server'

import { withApiSafe } from '../../../../lib/api-safe'

export const dynamic = "force-dynamic";

export const GET = withApiSafe(async () => {
  const blocks = [
    { id: 'how-it-works', title: 'How it works', body: 'Choose service, pick a time, relax.' },
    { id: 'why-choose-us', title: 'Why choose Shalean', body: 'Vetted cleaners, fair pricing, great support.' },
  ]
  return NextResponse.json(blocks)
})