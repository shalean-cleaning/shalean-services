import { NextResponse } from 'next/server'

export async function GET() {
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
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
        bio: 'Founder and CEO of Shalean Services with over 10 years of experience in home services.',
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
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
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
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
        bio: 'Customer Success Manager dedicated to ensuring every client has an exceptional experience.',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]
    
    return NextResponse.json(teamMembers, { status: 200 })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
