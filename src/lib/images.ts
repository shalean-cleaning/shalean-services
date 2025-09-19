export const IMAGES = {
  // Local placeholder images
  hero: "/images/placeholder-hero.svg",
  valueCard: "/images/placeholder-card.svg",
  profile: "/images/placeholder-avatar.svg",
  blog1: "/images/placeholder-card.svg",
  blog2: "/images/placeholder-card.svg",
  blog3: "/images/placeholder-card.svg",
  dashboard: "/images/placeholder-card.svg",
  cleaner: "/images/placeholder-avatar.svg",
  
  // Blog specific images - use placeholders for missing ones
  blogCleanHomeTips: "/images/blog/clean-home-tips.jpg",
  blogEcoFriendly: "/images/placeholder-card.svg", // Fallback for missing eco-friendly.jpg
  blogProfessionalCleaning: "/images/placeholder-card.svg", // Fallback for missing professional-cleaning.jpg
  
  // Fallback to working Unsplash URLs if needed
  heroFallback: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1600&q=80&auto=format&fit=crop",
  valueCardFallback: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&q=80&auto=format&fit=crop",
  profileFallback: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&q=80&auto=format&fit=crop",
};

// Helper function to get a safe blog image
export function getSafeBlogImage(imageUrl?: string | null): string {
  if (!imageUrl) return IMAGES.blog1;
  
  // If it's a placeholder, use it
  if (imageUrl.includes('placeholder')) return imageUrl;
  
  // If it's a blog image that exists, use it
  if (imageUrl === '/images/blog/clean-home-tips.jpg') return imageUrl;
  
  // For any other blog images that might not exist, use placeholder
  if (imageUrl.includes('/images/blog/')) return IMAGES.blog1;
  
  // For any other URL, return as-is (might be external)
  return imageUrl;
}
