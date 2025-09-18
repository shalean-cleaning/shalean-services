import Hero from '@/components/homepage/Hero';
import HowItWorks from '@/components/homepage/HowItWorks';
import WhyChooseUs from '@/components/homepage/WhyChooseUs';
import TeamGrid from '@/components/homepage/TeamGrid';
import Testimonials from '@/components/homepage/Testimonials';
import BlogPreview from '@/components/homepage/BlogPreview';
import { MotionSection, StaggerList, MotionItem } from '@/components/anim/MotionComponents';
import { fadeUp, popCard, slideInLeft, slideInRight } from '@/components/anim/motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AirbnbLogo, Property24Logo, PrivatePropertyLogo, GumtreeLogo, OLXLogo } from '@/components/ui/partner-logos';
import SafeImage from '@/components/ui/safe-image';
import { IMAGES } from '@/lib/images';
import LinkSafe from '@/components/LinkSafe';
import { 
  Home as HomeIcon, 
  Heart,
  Baby,
  ChevronRight,
  Shield,
  FileText,
  Headphones,
  Award
} from 'lucide-react';

export default function Home() {
  // Full-time help cards - this data should eventually come from database
  const fullTimeServices = [
    {
      title: "Live-out Housekeeper",
      description: "Daily upkeep and laundry.",
      icon: HomeIcon,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Nanny",
      description: "Caring support for busy families.",
      icon: Baby,
      color: "bg-pink-50 text-pink-600"
    },
    {
      title: "Carer",
      description: "Kind assistance for seniors.",
      icon: Heart,
      color: "bg-rose-50 text-rose-600"
    }
  ];

  // Safety & trust items - this data should eventually come from database
  const safetyItems = [
    {
      title: "ID & background checks",
      icon: Shield
    },
    {
      title: "Public liability cover",
      icon: FileText
    },
    {
      title: "In-app support",
      icon: Headphones
    },
    {
      title: "Quality guarantee",
      icon: Award
    }
  ];

  // Partners - this data should eventually come from database
  const partners = [
    { name: "Airbnb", logo: <AirbnbLogo /> },
    { name: "Property24", logo: <Property24Logo /> },
    { name: "Private Property", logo: <PrivatePropertyLogo /> },
    { name: "Gumtree", logo: <GumtreeLogo /> },
    { name: "OLX", logo: <OLXLogo /> }
  ];

  return (
    <main className="flex flex-col">
      {/* Hero Section - Now using dynamic component */}
      <Hero />

      {/* Why Choose Us Section - Now using dynamic component */}
      <WhyChooseUs />

      {/* How it Works Section - Now using dynamic component */}
      <HowItWorks />

      {/* Full-Time Help */}
      <section id="full-time">
        <MotionSection className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <MotionItem variants={fadeUp}>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Looking for full-time support?
              </h2>
            </MotionItem>
          </div>

          <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {fullTimeServices.map((service) => (
              <MotionItem key={service.title} variants={popCard}>
                <Card className="h-full hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className={`mx-auto w-16 h-16 ${service.color.split(' ')[0]} rounded-full flex items-center justify-center mb-4`}>
                      <service.icon className={`h-8 w-8 ${service.color.split(' ')[1]}`} />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </MotionItem>
            ))}
          </StaggerList>
        </div>
        </MotionSection>
      </section>

      {/* Manage Hub */}
      <MotionSection className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <MotionItem variants={slideInLeft}>
              <div className="relative w-full h-[220px] md:h-[280px] rounded-2xl overflow-hidden">
                <SafeImage
                  src={IMAGES.dashboard}
                  alt="Calm home interior with soft light"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            </MotionItem>
            
            <div>
              <MotionItem variants={fadeUp}>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  Your home, your dashboard
                </h2>
              </MotionItem>
              
              <MotionItem variants={fadeUp}>
                <p className="text-lg text-gray-600 mb-8">
                  Track bookings, reschedule, chat with your cleaner, and view invoices—all in one place.
                </p>
              </MotionItem>
              
              <MotionItem variants={popCard}>
                <Button size="lg" asChild className="group">
                  <LinkSafe href="/account">
                    Explore the Hub
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </LinkSafe>
                </Button>
              </MotionItem>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Team Grid Section - Now using dynamic component */}
      <TeamGrid />

      {/* Safety & Trust */}
      <MotionSection className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <MotionItem variants={fadeUp}>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Safety comes first
              </h2>
            </MotionItem>
          </div>

          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyItems.map((item) => (
              <MotionItem key={item.title} variants={popCard}>
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <item.icon className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.title}
                  </h3>
                </div>
              </MotionItem>
            ))}
          </StaggerList>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              All cleaners pass ID verification and in-person interviews.
            </p>
          </div>
        </div>
      </MotionSection>

      {/* Join Shalean */}
      <MotionSection className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <MotionItem variants={fadeUp}>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  Work as a cleaning professional
                </h2>
              </MotionItem>
              
              <MotionItem variants={fadeUp}>
                <ul className="text-lg text-gray-600 mb-8 space-y-2">
                  <li>• Set your schedule</li>
                  <li>• Grow your income</li>
                  <li>• Get paid on time</li>
                </ul>
              </MotionItem>
              
              <MotionItem variants={popCard}>
                <Button size="lg" asChild className="group">
                  <LinkSafe href="/apply">
                    Apply to Work
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </LinkSafe>
                </Button>
              </MotionItem>
            </div>
            
            <MotionItem variants={slideInRight}>
              <div className="relative">
                <SafeImage
                  src="https://images.unsplash.com/photo-1596464716121-8b45399f0f0e?w=1200&q=80&auto=format&fit=crop"
                  alt="Professional cleaner smiling with cleaning tools"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-xl"
                />
              </div>
            </MotionItem>
          </div>
        </div>
      </MotionSection>

      {/* Partners */}
      <MotionSection className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MotionItem variants={fadeUp}>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-12">
              Trusted by homeowners across Cape Town
            </h2>
          </MotionItem>
          
          <StaggerList className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {partners.map((partner, index) => (
              <MotionItem key={index} variants={fadeUp}>
                <div className="flex items-center gap-2">
                  {partner.logo}
                  <span className="sr-only">{partner.name}</span>
                </div>
              </MotionItem>
            ))}
          </StaggerList>
        </div>
      </MotionSection>

      {/* Blog Preview Section - Now using dynamic component */}
      <BlogPreview />

      {/* Testimonials Section - Now using dynamic component */}
      <Testimonials />
    </main>
  );
}