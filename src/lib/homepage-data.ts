import { createClient } from '@/lib/supabase-server'
import { ContentBlock, BlogPost, Testimonial, Profile } from '@/lib/database.types'

// Homepage data fetching utilities
export async function getContentBlocks(sectionKey: string): Promise<ContentBlock[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('section_key', sectionKey)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching content blocks:', error)
    return []
  }

  return data || []
}

export async function getHeroContent(): Promise<ContentBlock | null> {
  const blocks = await getContentBlocks('hero')
  return blocks[0] || null
}

export async function getHowItWorksContent(): Promise<ContentBlock[]> {
  return getContentBlocks('how-it-works')
}

export async function getWhyChooseUsContent(): Promise<ContentBlock[]> {
  return getContentBlocks('why-choose-us')
}

export async function getRecentBlogPosts(limit: number = 3): Promise<BlogPost[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }

  return data || []
}

export async function getFeaturedTestimonials(limit: number = 4): Promise<Testimonial[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }

  return data || []
}

export async function getTeamMembers(): Promise<Profile[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'ADMIN')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching team members:', error)
    return []
  }

  return data || []
}

// Icon mapping utility
export function getIconComponent(iconName: string) {
  const iconMap: Record<string, any> = {
    'check-circle': () => import('lucide-react').then(m => m.CheckCircle),
    'calendar': () => import('lucide-react').then(m => m.Calendar),
    'settings': () => import('lucide-react').then(m => m.Settings),
    'shield-check': () => import('lucide-react').then(m => m.ShieldCheck),
    'heart': () => import('lucide-react').then(m => m.Heart),
    'leaf': () => import('lucide-react').then(m => m.Leaf),
    'dollar-sign': () => import('lucide-react').then(m => m.DollarSign),
    'phone': () => import('lucide-react').then(m => m.Phone),
  }
  
  return iconMap[iconName] || null
}
