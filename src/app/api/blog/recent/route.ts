import { NextResponse } from 'next/server';

import { withApiSafe } from '../../../../lib/api-safe';

export const dynamic = "force-dynamic";

export const GET = withApiSafe(async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '3')
  
  const blogPosts = [
    {
      id: '1',
      title: 'How to Keep Your Home Clean During Busy Seasons',
      excerpt: 'Simple tips and tricks to maintain a clean home even when life gets hectic.',
      slug: 'keep-home-clean-busy-seasons',
      published_at: '2024-01-15T10:00:00Z',
      is_published: true,
      author_name: 'Sarah Johnson',
      featured_image: '/images/placeholder.png',
    },
    {
      id: '2',
      title: 'The Benefits of Professional Cleaning Services',
      excerpt: 'Discover why hiring professional cleaners can save you time and improve your quality of life.',
      slug: 'benefits-professional-cleaning',
      published_at: '2024-01-10T14:30:00Z',
      is_published: true,
      author_name: 'Mike Chen',
      featured_image: '/images/placeholder.png',
    },
    {
      id: '3',
      title: 'Eco-Friendly Cleaning Products Guide',
      excerpt: 'Learn about safe, environmentally friendly cleaning products for your home.',
      slug: 'eco-friendly-cleaning-guide',
      published_at: '2024-01-05T09:15:00Z',
      is_published: true,
      author_name: 'Emma Rodriguez',
      featured_image: '/images/placeholder.png',
    },
  ]
  
  return NextResponse.json(blogPosts.slice(0, limit))
})


