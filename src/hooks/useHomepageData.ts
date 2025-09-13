import { useQuery } from '@tanstack/react-query'

import { ContentBlock, BlogPost, Testimonial, Profile } from '@/lib/database.types'
import { fetchJson, normalizeError } from '@/lib/http'

// React Query hooks for homepage data
export function useContentBlocks(sectionKey: string) {
  return useQuery({
    queryKey: ['content-blocks', sectionKey],
    queryFn: async (): Promise<ContentBlock[]> => {
      try {
        const data = await fetchJson<ContentBlock[]>(`/api/content/blocks?section=${sectionKey}`)
        return data
      } catch (e) {
        console.error('Error fetching content blocks:', normalizeError(e))
        return []
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useHeroContent() {
  return useQuery({
    queryKey: ['hero-content'],
    queryFn: async (): Promise<ContentBlock | null> => {
      try {
        const data = await fetchJson<ContentBlock>('/api/content/hero')
        return data
      } catch (e) {
        console.error('Error fetching hero content:', normalizeError(e))
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useHowItWorksContent() {
  return useContentBlocks('how-it-works')
}

export function useWhyChooseUsContent() {
  return useContentBlocks('why-choose-us')
}

export function useRecentBlogPosts(limit: number = 3) {
  return useQuery({
    queryKey: ['blog-posts', 'recent', limit],
    queryFn: async (): Promise<BlogPost[]> => {
      try {
        const data = await fetchJson<BlogPost[]>(`/api/blog/recent?limit=${limit}`)
        return data
      } catch (e) {
        console.error('Error fetching blog posts:', normalizeError(e))
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useFeaturedTestimonials(limit: number = 4) {
  return useQuery({
    queryKey: ['testimonials', 'featured', limit],
    queryFn: async (): Promise<Testimonial[]> => {
      try {
        const data = await fetchJson<Testimonial[]>(`/api/testimonials/featured?limit=${limit}`)
        return data
      } catch (e) {
        console.error('Error fetching testimonials:', normalizeError(e))
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async (): Promise<Profile[]> => {
      try {
        const data = await fetchJson<Profile[]>('/api/team/members')
        return data
      } catch (e) {
        console.error('Error fetching team members:', normalizeError(e))
        return []
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - team members change less frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}
