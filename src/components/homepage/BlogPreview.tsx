import { getRecentBlogPosts } from '@/lib/homepage-data';
import { MotionSection, StaggerList, MotionItem } from '@/components/anim/MotionComponents';
import { fadeUp } from '@/components/anim/motion';
import { ChevronRight } from 'lucide-react';
import LinkSafe from '@/components/LinkSafe';
import SafeImage from '@/components/ui/safe-image';
import { IMAGES } from '@/lib/images';

export default async function BlogPreview() {
  const blogPosts = await getRecentBlogPosts(3);
  
  // If no data from database, use fallback
  const displayPosts = blogPosts.length > 0 ? blogPosts : [
    {
      id: '1',
      title: 'The ultimate deep-clean checklist',
      slug: 'deep-clean-checklist',
      excerpt: 'Everything you need for a thorough home deep clean.',
      featured_image_url: IMAGES.blog1
    },
    {
      id: '2',
      title: 'Pet-friendly cleaning: what to know',
      slug: 'pet-friendly-cleaning',
      excerpt: 'Safe cleaning products and methods for pet owners.',
      featured_image_url: IMAGES.blog2
    },
    {
      id: '3',
      title: 'Move-out day: a spotless plan',
      slug: 'move-out-cleaning-guide',
      excerpt: 'How to leave your rental in perfect condition.',
      featured_image_url: IMAGES.blog3
    }
  ];

  return (
    <MotionSection className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <MotionItem variants={fadeUp}>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tips & inspiration
            </h2>
          </MotionItem>
        </div>

        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPosts.map((post) => (
            <MotionItem key={post.id} variants={fadeUp}>
              <LinkSafe href={`/blog/${post.slug}`} className="block">
                <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group">
                  <div className="relative h-48 w-full overflow-hidden">
                    <SafeImage
                      src={post.featured_image_url || IMAGES.blog1}
                      alt={`${post.title} - cleaning tips article`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      fallbackSrc={IMAGES.blog1}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <ChevronRight className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </article>
              </LinkSafe>
            </MotionItem>
          ))}
        </StaggerList>
      </div>
    </MotionSection>
  );
}
