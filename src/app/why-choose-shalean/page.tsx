import { Metadata } from 'next';
import { CheckCircle, Shield, Clock, Star, Users, Award } from 'lucide-react';
import SafeImage from '@/components/ui/safe-image';
import { IMAGES } from '@/lib/images';

export const metadata: Metadata = {
  title: 'Why Choose Shalean Cleaning Services',
  description: 'Discover why Shalean Cleaning Services is the trusted choice for professional home cleaning in South Africa. Quality, reliability, and satisfaction guaranteed.',
  keywords: ['cleaning services', 'professional cleaners', 'home cleaning', 'reliable service', 'quality cleaning'],
};

const features = [
  {
    icon: Shield,
    title: 'Licensed & Insured',
    description: 'All our cleaners are fully licensed, insured, and background-checked for your peace of mind.'
  },
  {
    icon: Star,
    title: '5-Star Rated Service',
    description: 'Consistently rated 5 stars by our customers with over 1000+ satisfied clients across South Africa.'
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Book cleaning services that fit your schedule - same day, weekly, bi-weekly, or monthly options available.'
  },
  {
    icon: Users,
    title: 'Experienced Team',
    description: 'Our professional cleaners have years of experience and are trained in the latest cleaning techniques.'
  },
  {
    icon: Award,
    title: '100% Satisfaction Guarantee',
    description: 'Not happy with our service? We\'ll return within 24 hours to make it right, or your money back.'
  },
  {
    icon: CheckCircle,
    title: 'Eco-Friendly Products',
    description: 'We use environmentally safe, pet-friendly cleaning products that are safe for your family and pets.'
  }
];

const stats = [
  { number: '1000+', label: 'Happy Customers' },
  { number: '5.0', label: 'Average Rating' },
  { number: '50+', label: 'Professional Cleaners' },
  { number: '99%', label: 'Customer Satisfaction' }
];

export default function WhyChooseShaleanPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why Choose <span className="text-blue-600">Shalean</span>?
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                We're not just another cleaning service. We're your trusted partner in maintaining a clean, healthy home with professional standards you can count on.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Book a Service
                </button>
                <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Get Free Quote
                </button>
              </div>
            </div>
            <div className="relative">
              <SafeImage
                src={IMAGES.hero}
                alt="Professional cleaning service"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Sets Us Apart
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built our reputation on quality, reliability, and exceptional customer service. Here's what makes us the preferred choice for home cleaning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Shalean has been cleaning our home for over a year. They're reliable, thorough, and always leave our house spotless. Highly recommended!"
              </p>
              <div className="font-semibold text-gray-900">Sarah M.</div>
              <div className="text-sm text-gray-500">Cape Town</div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Professional, trustworthy, and they use eco-friendly products. Perfect for our family with young children and pets."
              </p>
              <div className="font-semibold text-gray-900">Michael T.</div>
              <div className="text-sm text-gray-500">Johannesburg</div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Excellent service! They're flexible with scheduling and the quality is consistently high. Worth every penny."
              </p>
              <div className="font-semibold text-gray-900">Lisa K.</div>
              <div className="text-sm text-gray-500">Durban</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience the Shalean Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who trust Shalean for their home cleaning needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Book Your First Clean
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Get Free Quote
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
