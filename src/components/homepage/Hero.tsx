import { getHeroContent } from '@/lib/homepage-data';
import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/ui/service-card';
import { MotionSection, StaggerList, MotionItem } from '@/components/anim/MotionComponents';
import { fadeUp, popCard, slideInRight } from '@/components/anim/motion';
import { Sparkles, Shield, Truck, Calendar, Users, Star } from 'lucide-react';
import LinkSafe from '@/components/LinkSafe';
import SafeImage from '@/components/ui/safe-image';
import { IMAGES } from '@/lib/images';
// Removed useParallax hook as this is now a server component

// Primary service cards data - this should eventually come from database
const primaryServices = [
  { 
    name: "Standard Cleaning", 
    slug: "standard-cleaning-small", 
    description: "Regular home cleaning service",
    icon: <Sparkles className="w-5 h-5 text-blue-600" />,
    price: "From R150"
  },
  { 
    name: "Deep Cleaning", 
    slug: "deep-cleaning-apartment", 
    description: "Thorough deep clean service",
    icon: <Shield className="w-5 h-5 text-green-600" />,
    price: "From R300"
  },
  { 
    name: "Move-In/Out", 
    slug: "move-in-out-apartment", 
    description: "Complete move cleaning",
    icon: <Truck className="w-5 h-5 text-orange-600" />,
    price: "From R400"
  }
];

export default async function Hero() {
  const heroContent = await getHeroContent();
  
  // Use dynamic content from database or fallback
  const title = heroContent?.title || "Reliable home cleaning, on your schedule";
  const subtitle = heroContent?.description || "Book trusted local cleaners in minutes. 100% satisfaction guaranteed.";
  
  return (
    <MotionSection className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
      {/* Background decoration */}
      <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-40'></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <MotionItem variants={fadeUp}>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-6">
                <Shield className="w-4 h-4 mr-2" />
                Trusted by families across South Africa
              </div>
            </MotionItem>
            
            <MotionItem variants={fadeUp}>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                {title}
              </h1>
            </MotionItem>
            
            <MotionItem variants={fadeUp}>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {subtitle}
              </p>
            </MotionItem>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <MotionItem variants={popCard}>
                <Button size="lg" asChild className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
                  <LinkSafe href="/booking" className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book a Cleaning
                  </LinkSafe>
                </Button>
              </MotionItem>
              <MotionItem variants={popCard}>
                <Button size="lg" asChild variant="outline" className="text-lg px-8 py-4 border-2 hover:bg-gray-50 transition-all duration-300">
                  <LinkSafe href="/quote" className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Get a Free Quote
                  </LinkSafe>
                </Button>
              </MotionItem>
            </div>

            {/* Service Cards */}
            <StaggerList className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {primaryServices.map((service) => (
                <MotionItem key={service.slug} variants={popCard}>
                  <ServiceCard {...service} />
                </MotionItem>
              ))}
            </StaggerList>
          </div>

          {/* Right Content - Hero Image */}
          <MotionItem variants={slideInRight}>
            <div className="relative">
              <SafeImage
                src={IMAGES.hero}
                alt="Bright, clean living room after a professional home cleaning"
                width={800}
                height={600}
                className="rounded-3xl shadow-2xl border-4 border-white/20"
                priority
                sizes="(min-width:1024px) 50vw, 100vw"
              />
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-800">Live Booking</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold text-gray-800">4.9/5 Rating</span>
                </div>
              </div>
            </div>
          </MotionItem>
        </div>
      </div>
    </MotionSection>
  );
}
