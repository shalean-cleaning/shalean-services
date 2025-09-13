import { cache } from "react";

import { createClient } from "@/lib/supabase-server";

export type HomePageData = {
  hero: { title: string; subtitle?: string | null; ctaLabel?: string | null };
  blocks: Array<{ id: string; title: string; body: string }>;
  testimonials: Array<{
    id: string;
    author_name: string;
    author_image?: string | null;
    content: string;
    rating?: number | null;
  }>;
};

export const getHomepageData = cache(async (): Promise<HomePageData> => {
  const supabase = createClient();

  // Replace the following with the real queries; example shown:
  const { data: testimonialsRaw } = await supabase
    .from("testimonials")
    .select("id, author_name, author_image, quote, rating");

  const testimonials =
    (testimonialsRaw ?? []).map((r: {
      id: string;
      author_name: string;
      author_image?: string | null;
      quote: string;
      rating?: number | null;
    }) => ({
      id: r.id,
      author_name: r.author_name,
      author_image: r.author_image ?? null,
      content: r.quote,
      rating: r.rating ?? null,
    }));

  const { data: heroRaw } = await supabase
    .from("content_blocks")
    .select("title, description")
    .eq("section_key", "hero")
    .single();

  const hero = {
    title: heroRaw?.title ?? "",
    subtitle: heroRaw?.description ?? null,
    ctaLabel: null,
  };

  const { data: blocksRaw } = await supabase
    .from("content_blocks")
    .select("id, title, description")
    .eq("section_key", "how-it-works");

  const blocks =
    (blocksRaw ?? []).map((b: { id: string; title: string; description: string }) => ({
      id: b.id,
      title: b.title,
      body: b.description,
    }));

  return { hero, blocks, testimonials };
});

// Homepage data fetching utilities
export async function getContentBlocks(sectionKey: string) {
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

export async function getHeroContent() {
  const blocks = await getContentBlocks('hero')
  return blocks[0] || null
}

export async function getHowItWorksContent() {
  return getContentBlocks('how-it-works')
}

export async function getWhyChooseUsContent() {
  return getContentBlocks('why-choose-us')
}

export async function getRecentBlogPosts(limit: number = 3) {
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

export async function getFeaturedTestimonials(limit: number = 4) {
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

export async function getTeamMembers() {
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
  const iconMap: Record<string, () => Promise<React.ComponentType>> = {
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