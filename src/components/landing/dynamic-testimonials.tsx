"use client";

import { Star } from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
import { IMAGES } from "@/lib/images";

import { Card, CardContent } from "@/components/ui/card";
import { useFeaturedTestimonials } from "@/hooks/useHomepageData";

type Testimonial = {
  id: string;
  author_name: string;
  author_image?: string | null;
  role?: string | null;
  company?: string | null;
  rating?: number | null;
  content: string;
};

// type Props = { testimonials: Testimonial[] };

function formatAlt(name?: string | null) {
  const trimmed = (name ?? '').trim()
  return trimmed ? `Avatar of ${trimmed}` : 'Customer avatar'
}

function normalizeTestimonial(t: unknown): Testimonial {
  const obj = t as Record<string, unknown>;
  return {
    id: String(obj?.id ?? Math.random().toString(36).slice(2)),
    author_name: typeof obj?.name === 'string' ? obj.name : (typeof obj?.author_name === 'string' ? obj.author_name : 'Anonymous'),
    author_image: typeof obj?.avatar === 'string' ? obj.avatar : (typeof obj?.author_image === 'string' ? obj.author_image : null),
    content: String(obj?.quote ?? obj?.content ?? ''),
    role: typeof obj?.role === 'string' ? obj.role : null,
    company: typeof obj?.company === 'string' ? obj.company : null,
    rating: typeof obj?.rating === 'number' ? obj.rating : null,
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

  if (!testimonials || testimonials.length === 0) return null

  const displayTestimonials = testimonials;

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what our satisfied customers have to say about our services.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {(displayTestimonials ?? []).map((raw) => {
            const testimonial = normalizeTestimonial(raw)
            const imgSrc = testimonial.author_image || '/placeholder-avatar.jpg'
            const alt = formatAlt(testimonial.author_name)

            return (
              <Card key={testimonial.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                {/* Rating Stars */}
                {testimonial.rating && (
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className={`h-4 w-4 ${
                          starIndex < testimonial.rating!
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Quote */}
                <CardContent className="p-0">
                  <blockquote className="text-gray-700 mb-4 italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center">
                    <div className="relative w-12 h-12 mr-4">
                      <SafeImage
                        src={imgSrc}
                        alt={alt}
                        fill
                        sizes="48px"
                        className="rounded-full object-cover"
                        fallbackSrc={IMAGES.profile}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {testimonial.author_name}
                      </p>
                      {testimonial.role ? (
                        <p className="text-sm text-gray-600">
                          {testimonial.role}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  );
}