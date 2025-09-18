"use client";
import SafeImage from "@/components/ui/safe-image";
import { IMAGES } from "@/lib/images";
import LinkSafe from "@/components/LinkSafe";
import { 
  Calendar,
  Shield,
  Home as HomeIcon, 
  Star,
  Users,
  Play,
  ChevronRight,
  Sparkles,
  Heart,
  Baby,
  Truck,
  UserCheck,
  FileText,
  Headphones,
  Award
} from 'lucide-react';

import { MotionSection, StaggerList, MotionItem } from '@/components/anim/MotionComponents';
import { fadeUp, popCard, slideInLeft, slideInRight } from '@/components/anim/motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceCard } from '@/components/ui/service-card';
import { AirbnbLogo, Property24Logo, PrivatePropertyLogo, GumtreeLogo, OLXLogo } from '@/components/ui/partner-logos';
import { useParallax } from '@/hooks/useParallax';

export default function Home() {
  const heroParallax = useParallax();

  // Primary service cards data
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

  // Value strip data
  const valueCards = [
    {
      title: "Easy scheduling",
      description: "Pick a time that works. We'll handle the rest.",
      icon: Calendar
    },
    {
      title: "Transparent pricing", 
      description: "Clear rates. No surprises.",
      icon: FileText
    },
    {
      title: "Vetted professionals",
      description: "Background-checked, well-reviewed cleaners.",
      icon: UserCheck
    }
  ];

  // How it works steps
  const steps = [
    {
      title: "Choose your service",
      description: "Select rooms & add-ons as you need.",
      step: "1"
    },
    {
      title: "Pick date & time", 
      description: "We'll match you with an available pro.",
      step: "2"
    },
    {
      title: "Relax & track",
      description: "Get updates and manage bookings online.",
      step: "3"
    }
  ];

  // Full-time help cards
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

  // Team members
  const teamMembers = [
    {
      name: "Ayanda M.",
      cleans: "200+ cleans",
      description: "Friendly, punctual, and thorough.",
      location: "CBD, Sea Point",
      image: IMAGES.profile
    },
    {
      name: "Sarah K.",
      cleans: "150+ cleans", 
      description: "Detail-oriented and reliable.",
      location: "Claremont, Rondebosch",
      image: IMAGES.profile
    },
    {
      name: "Thabo N.",
      cleans: "180+ cleans",
      description: "Professional and efficient.",
      location: "Table View, Milnerton",
      image: IMAGES.profile
    },
    {
      name: "Lisa P.",
      cleans: "220+ cleans",
      description: "Experienced and trustworthy.",
      location: "Constantia, Tokai",
      image: IMAGES.profile
    }
  ];

  // Safety & trust items
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

  // Partners
  const partners = [
    { name: "Airbnb", logo: <AirbnbLogo /> },
    { name: "Property24", logo: <Property24Logo /> },
    { name: "Private Property", logo: <PrivatePropertyLogo /> },
    { name: "Gumtree", logo: <GumtreeLogo /> },
    { name: "OLX", logo: <OLXLogo /> }
  ];

  // Blog posts
  const blogPosts = [
    {
      title: "The ultimate deep-clean checklist",
      image: IMAGES.blog1,
      excerpt: "Everything you need for a thorough home deep clean.",
      slug: "deep-clean-checklist"
    },
    {
      title: "Pet-friendly cleaning: what to know",
      image: IMAGES.blog2,
      excerpt: "Safe cleaning products and methods for pet owners.",
      slug: "pet-friendly-cleaning"
    },
    {
      title: "Move-out day: a spotless plan",
      image: IMAGES.blog3,
      excerpt: "How to leave your rental in perfect condition.",
      slug: "move-out-cleaning-guide"
    }
  ];

  return (
    <main className="flex flex-col">
      {/* Hero Section */}
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
                  Trusted by 1000+ families
                </div>
              </MotionItem>
              
              <MotionItem variants={fadeUp}>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  Reliable home cleaning,{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    on your schedule
                  </span>
                </h1>
              </MotionItem>
              
              <MotionItem variants={fadeUp}>
                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Book trusted local cleaners in minutes. 
                  <span className="font-semibold text-gray-800"> 100% satisfaction guaranteed.</span>
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
              <div 
                ref={heroParallax.ref}
                style={heroParallax.style}
                className="relative"
              >
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
              </div>
            </MotionItem>
          </div>
        </div>
      </MotionSection>

      {/* Value Strip */}
      <MotionSection className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valueCards.map((card) => (
              <MotionItem key={card.title} variants={popCard}>
                <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <card.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      {card.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </MotionItem>
            ))}
          </StaggerList>
        </div>
      </MotionSection>

      {/* How it Works */}
      <MotionSection className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <MotionItem variants={fadeUp}>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                A spotless home in three steps
              </h2>
            </MotionItem>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 transform -translate-y-1/2"></div>
            
            <StaggerList className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {steps.map((step) => (
                <MotionItem key={step.step} variants={fadeUp}>
                  <div className="text-center relative">
                    <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 relative z-10">
                      <span className="text-2xl font-bold text-white">{step.step}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </MotionItem>
              ))}
            </StaggerList>
          </div>

          <div className="text-center mt-12">
            <MotionItem variants={popCard}>
              <Button variant="outline" size="lg" asChild>
                <LinkSafe href="#how-it-works">
                  <Play className="w-5 h-5 mr-2" />
                  See How It Works
                </LinkSafe>
              </Button>
            </MotionItem>
          </div>
        </div>
      </MotionSection>

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

      {/* Meet the Pros */}
      <MotionSection className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <MotionItem variants={fadeUp}>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Meet some of our pros
              </h2>
            </MotionItem>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {["All", "Top Rated", "Nearby", "Available this week"].map((filter) => (
              <MotionItem key={filter} variants={popCard}>
                <Button variant="outline" className="relative group" aria-label={`Filter by ${filter}`}>
                  {filter}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                </Button>
              </MotionItem>
            ))}
          </div>

          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <MotionItem key={member.name} variants={popCard}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full">
                      <SafeImage
                        src={member.image}
                        alt={`${member.name}, professional cleaner`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        fallbackSrc={IMAGES.profile}
                      />
                    </div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <div className="flex items-center justify-center space-x-1 mb-2" aria-label="5 star rating">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{member.cleans}</p>
                    <p className="text-xs text-gray-500">{member.location}</p>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {member.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </MotionItem>
            ))}
          </StaggerList>
        </div>
      </MotionSection>

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

      {/* Blog / Explore */}
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
            {blogPosts.map((post, index) => (
              <MotionItem key={index} variants={fadeUp}>
                <LinkSafe href={`/blog/${post.slug}`} className="block">
                  <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group">
                    <div className="relative h-48 w-full overflow-hidden">
                      <SafeImage
                        src={post.image}
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
    </main>
  );
}