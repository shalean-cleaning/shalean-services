import { NextResponse } from 'next/server';

import { withApiSafe } from '../../../../lib/api-safe';

export const dynamic = "force-dynamic";

export const GET = withApiSafe(async () => {
  const teamMembers = [
    {
      id: '1',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah@shalean.com',
      role: 'ADMIN',
      is_active: true,
      avatar_url: '/images/placeholder.png',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      first_name: 'Mike',
      last_name: 'Chen',
      email: 'mike@shalean.com',
      role: 'ADMIN',
      is_active: true,
      avatar_url: '/images/placeholder.png',
      bio: 'Operations Director ensuring quality service delivery across all our locations.',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      first_name: 'Emma',
      last_name: 'Rodriguez',
      email: 'emma@shalean.com',
      role: 'ADMIN',
      is_active: true,
      avatar_url: '/images/placeholder.png',
      bio: 'Customer Success Manager dedicated to ensuring every client has an exceptional experience.',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ]
  
  return NextResponse.json(teamMembers)
})


