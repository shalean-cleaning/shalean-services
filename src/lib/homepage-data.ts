import 'server-only';
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
  const supabase = await createClient();

  // Initialize with default values
  let testimonials: Array<{
    id: string;
    author_name: string;
    author_image?: string | null;
    content: string;
    rating?: number | null;
  }> = [];

  let hero = {
    title: "Welcome to Shalean Cleaning Services",
    subtitle: "Professional cleaning services for your home and office",
    ctaLabel: "Get Started",
  };

  let blocks: Array<{ id: string; title: string; body: string }> = [];

  // Try to fetch testimonials
  try {
    const { data: testimonialsRaw, error: testimonialsError } = await supabase
      .from("testimonials")
      .select("id, author_name, author_image, quote, rating");

    if (!testimonialsError && testimonialsRaw) {
      testimonials = testimonialsRaw.map((r: {
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
    }
  } catch (error) {
    console.warn('Testimonials table not available:', error);
  }

  // Try to fetch hero content
  try {
    const { data: heroRaw, error: heroError } = await supabase
      .from("content_blocks")
      .select("title, description")
      .eq("content_type", "hero")
      .single();

    if (!heroError && heroRaw) {
      hero = {
        title: heroRaw.title ?? "Welcome to Shalean Cleaning Services",
        subtitle: heroRaw.description ?? "Professional cleaning services for your home and office",
        ctaLabel: "Get Started",
      };
    }
  } catch (error) {
    console.warn('Content blocks table not available:', error);
  }

  // Try to fetch content blocks
  try {
    const { data: blocksRaw, error: blocksError } = await supabase
      .from("content_blocks")
      .select("id, title, description")
      .eq("content_type", "how-it-works");

    if (!blocksError && blocksRaw) {
      blocks = blocksRaw.map((b: { id: string; title: string; description: string }) => ({
        id: b.id,
        title: b.title,
        body: b.description,
      }));
    }
  } catch (error) {
    console.warn('Content blocks table not available:', error);
  }

  return { hero, blocks, testimonials };
});

// Homepage data fetching utilities
export async function getContentBlocks(sectionKey: string) {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('content_type', sectionKey)
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.warn('Content blocks table not available:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.warn('Content blocks table not available:', error)
    return []
  }
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
  
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('Blog posts table not available:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.warn('Blog posts table not available:', error)
    return []
  }
}

export async function getFeaturedTestimonials(limit: number = 4) {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('Testimonials table not available:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.warn('Testimonials table not available:', error)
    return []
  }
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