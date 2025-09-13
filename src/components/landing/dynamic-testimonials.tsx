"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

import { useFeaturedTestimonials } from "@/hooks/useHomepageData";

type Testimonial = {
  id: string
  author_name?: string | null
  author_image?: string | null
  quote: string
  role?: string | null
}

function formatAlt(name?: string | null) {
  const trimmed = (name ?? '').trim()
  return trimmed ? `Avatar of ${trimmed}` : 'Customer avatar'
}

function normalizeTestimonial(t: unknown): Testimonial {
  const obj = t as Record<string, unknown>;
  return {
    id: String(obj?.id ?? Math.random().toString(36).slice(2)),
    author_name: typeof obj?.name === 'string' ? obj.name : (typeof obj?.author_name === 'string' ? obj.author_name : null),
    author_image: typeof obj?.avatar === 'string' ? obj.avatar : (typeof obj?.author_image === 'string' ? obj.author_image : null),
    quote: String(obj?.quote ?? ''),
    role: typeof obj?.role === 'string' ? obj.role : null,
  }
}

export default function DynamicTestimonials() {
  const { data: testimonials, isLoading, isError, error } = useFeaturedTestimonials();

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 max-w-md mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse max-w-2xl mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="h-4 w-4 bg-gray-200 rounded animate-pulse mr-1"></div>
                  ))}
                </div>
                <div className="h-20 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse mr-4"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    console.error('Testimonials error:', error)
    return (
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="py-8 text-destructive">
              We&apos;re having trouble loading this section.
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials) return null

  // Fallback testimonial data
  const fallbackTestimonials = [
    {
      id: '1',
      quote: 'Shalean Services transformed our home! The cleaners are professional, thorough, and trustworthy. I can finally relax knowing our home is in good hands.',
      author_name: 'Jennifer Martinez',
      author_role: 'Homeowner',
      author_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      rating: 5,
      is_featured: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: '2',
      quote: 'Outstanding service! The team arrived on time, worked efficiently, and left our apartment spotless. Highly recommend for anyone looking for reliable cleaning services.',
      author_name: 'Robert Thompson',
      author_role: 'Apartment Owner',
      author_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      rating: 5,
      is_featured: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: '3',
      quote: 'As a busy professional, Shalean Services has been a lifesaver. They handle everything professionally and I never have to worry about the quality of their work.',
      author_name: 'Lisa Anderson',
      author_role: 'Business Owner',
      author_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      rating: 5,
      is_featured: true,
      created_at: '',
      updated_at: ''
    },
    {
      id: '4',
      quote: 'The eco-friendly products they use give me peace of mind, especially with young children at home. Great service and environmentally conscious!',
      author_name: 'Mark Rodriguez',
      author_role: 'Father of Two',
      author_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
      rating: 5,
      is_featured: true,
      created_at: '',
      updated_at: ''
    }
  ];

  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : fallbackTestimonials;

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            What Our Customers Say
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Don&apos;t just take our word for it. Here&apos;s what our satisfied customers have to say about our services.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {(displayTestimonials ?? []).map((raw, i) => {
            const testimonial = normalizeTestimonial(raw)
            const imgSrc = testimonial.author_image || '/placeholder-avatar.jpg'
            const alt = formatAlt(testimonial.author_name)

            return (
              <motion.div
                key={testimonial.id}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.1 }}
              >
                {/* Rating Stars */}
                {raw.rating && (
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className={`h-4 w-4 ${
                          starIndex < raw.rating!
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Quote */}
                <blockquote className="text-gray-700 mb-4 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center">
                  <div className="relative w-12 h-12 mr-4">
                    <Image
                      src={imgSrc}
                      alt={alt}
                      fill
                      sizes="48px"
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.author_name ?? 'Anonymous'}
                    </p>
                    {testimonial.role ? (
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
}