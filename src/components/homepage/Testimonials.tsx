import { getFeaturedTestimonials } from '@/lib/homepage-data';
import { MotionSection, StaggerList, MotionItem } from '@/components/anim/MotionComponents';
import { fadeUp, popCard } from '@/components/anim/motion';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import SafeImage from '@/components/ui/safe-image';
import { IMAGES } from '@/lib/images';

export default async function Testimonials() {
  const testimonials = await getFeaturedTestimonials(4);
  
  // If no data from database, use fallback
  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    {
      id: '1',
      author_name: 'Sarah Johnson',
      author_image: IMAGES.profile,
      content: 'Excellent service! The cleaner was professional and thorough.',
      rating: 5,
      customer_location: 'Cape Town'
    },
    {
      id: '2',
      author_name: 'Mike Chen',
      author_image: IMAGES.profile,
      content: 'Great value for money. Will definitely book again.',
      rating: 5,
      customer_location: 'Sea Point'
    },
    {
      id: '3',
      author_name: 'Lisa Williams',
      author_image: IMAGES.profile,
      content: 'Very satisfied with the cleaning quality.',
      rating: 4,
      customer_location: 'Claremont'
    },
    {
      id: '4',
      author_name: 'David Brown',
      author_image: IMAGES.profile,
      content: 'Reliable and trustworthy service. Highly recommended!',
      rating: 5,
      customer_location: 'Constantia'
    }
  ];

  return (
    <MotionSection className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <MotionItem variants={fadeUp}>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What our customers say
            </h2>
          </MotionItem>
          <MotionItem variants={fadeUp}>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our satisfied customers have to say about our cleaning services.
            </p>
          </MotionItem>
        </div>

        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayTestimonials.map((testimonial) => (
            <MotionItem key={testimonial.id} variants={popCard}>
              <Card className="h-full hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Quote className="w-8 h-8 text-blue-600 mr-2" />
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < (testimonial.rating || 5) 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center">
                    <div className="relative w-12 h-12 mr-4 overflow-hidden rounded-full">
                      <SafeImage
                        src={testimonial.author_image || IMAGES.profile}
                        alt={`${testimonial.author_name} profile`}
                        fill
                        className="object-cover"
                        fallbackSrc={IMAGES.profile}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.author_name}</p>
                      <p className="text-sm text-gray-600">{testimonial.customer_location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MotionItem>
          ))}
        </StaggerList>
      </div>
    </MotionSection>
  );
}
