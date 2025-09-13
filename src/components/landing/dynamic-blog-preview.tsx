"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { useRecentBlogPosts } from "@/hooks/useHomepageData";
import { format } from "date-fns";

export default function DynamicBlogPreview() {
  const { data: blogPosts, isLoading } = useRecentBlogPosts(3);

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 max-w-md mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse max-w-2xl mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Fallback blog data
  const fallbackBlogPosts = [
    {
      id: '1',
      title: '10 Tips for Maintaining a Clean Home Between Professional Cleanings',
      slug: 'maintaining-clean-home-tips',
      excerpt: 'Keep your home spotless between professional cleaning visits with these expert tips and tricks.',
      content: 'Professional cleaning services are wonderful, but maintaining a clean home between visits is equally important...',
      featured_image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop',
      is_published: true,
      published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: '',
      updated_at: ''
    },
    {
      id: '2',
      title: 'The Benefits of Eco-Friendly Cleaning Products',
      slug: 'eco-friendly-cleaning-benefits',
      excerpt: 'Discover why eco-friendly cleaning products are better for your health, home, and the environment.',
      content: 'Traditional cleaning products often contain harsh chemicals that can be harmful to your family and pets...',
      featured_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
      is_published: true,
      published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: '',
      updated_at: ''
    },
    {
      id: '3',
      title: 'How to Choose the Right Cleaning Service for Your Home',
      slug: 'choosing-right-cleaning-service',
      excerpt: 'Learn what to look for when selecting a professional cleaning service that meets your specific needs.',
      content: 'With so many cleaning services available, it can be overwhelming to choose the right one for your home...',
      featured_image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
      is_published: true,
      published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: '',
      updated_at: ''
    }
  ];

  const displayBlogPosts = blogPosts && blogPosts.length > 0 ? blogPosts : fallbackBlogPosts;

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            Latest from Our Blog
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Stay updated with cleaning tips, industry insights, and home maintenance advice from our experts.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Link
              href="/blog"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Posts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayBlogPosts.map((post, i) => (
            <motion.article
              key={post.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
            >
              {/* Featured Image */}
              <div className="relative h-48 w-full">
                <Image
                  src={post.featured_image || '/placeholder-blog.jpg'}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {post.published_at && format(new Date(post.published_at), 'MMM d, yyyy')}
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}