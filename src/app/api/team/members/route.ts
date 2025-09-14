import { NextResponse } from 'next/server'
import { withApiSafe } from '../../../../lib/api-safe'

export const GET = withApiSafe(async () => {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // TODO: replace with real DB data
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
    
    return NextResponse.json(teamMembers, { status: 200 })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}, { routeName: '/api/team/members' })


