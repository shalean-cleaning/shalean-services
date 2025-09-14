"use client";
import SafeImage from "@/components/ui/safe-image";
import { IMAGES } from "@/lib/images";
import Link from "next/link";
import { 
  Calendar,
  Shield,
  Home as HomeIcon, 
  Star,
  Users,
  Clock,
  Play,
  ChevronRight,
  Sparkles,
  Heart,
  Baby,
  Truck,
  Leaf,
  Shirt,
  UserCheck,
  FileText,
  Headphones,
  Award
} from 'lucide-react';

import { MotionSection, StaggerList, MotionItem } from '@/components/anim/MotionComponents';
import { fadeUp, popCard, slideInLeft, slideInRight } from '@/components/anim/motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useParallax } from '@/hooks/useParallax';

export default function Home() {
  const heroParallax = useParallax();

  // Service icons data
  const services = [
    { icon: Sparkles, label: "Cleaning" },
    { icon: Sparkles, label: "Deep Clean" },
    { icon: Leaf, label: "Outdoor" },
    { icon: Shirt, label: "Laundry" },
    { icon: Baby, label: "Nanny" },
    { icon: Heart, label: "Elder Care" },
    { icon: Truck, label: "Move-In/Out" },
    { icon: HomeIcon, label: "Airbnb" },
    { icon: Users, label: "Housekeeper" },
    { icon: Clock, label: "Maintenance" },
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
      description: "Select the rooms and add-ons you need.",
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
      image: IMAGES.profile
    },
    {
      name: "Sarah K.",
      cleans: "150+ cleans", 
      description: "Detail-oriented and reliable.",
      image: IMAGES.profile
    },
    {
      name: "Thabo N.",
      cleans: "180+ cleans",
      description: "Professional and efficient.",
      image: IMAGES.profile
    },
    {
      name: "Lisa P.",
      cleans: "220+ cleans",
      description: "Experienced and trustworthy.",
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
      title: "Quality guarantees",
      icon: Award
    }
  ];

  // Partners
  const partners = [
    "Airbnb", "Booking.com", "Property24", "Private Property", "Gumtree", "OLX"
  ];

  // Blog posts
  const blogPosts = [
    {
      title: "The ultimate deep-clean checklist",
      image: IMAGES.blog1,
      excerpt: "Everything you need for a thorough home deep clean."
    },
    {
      title: "Pet-friendly cleaning: what to know",
      image: IMAGES.blog2,
      excerpt: "Safe cleaning products and methods for pet owners."
    },
    {
      title: "Move-out day: a spotless plan",
      image: IMAGES.blog3,
      excerpt: "How to leave your rental in perfect condition."
    }
  ];

  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <MotionSection className="relative bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <MotionItem variants={fadeUp}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Reliable home cleaning, on your schedule.
                </h1>
              </MotionItem>
              
              <MotionItem variants={fadeUp}>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                  Book trusted local cleaners in minutes and manage every visit from one place.
                </p>
              </MotionItem>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <MotionItem variants={popCard}>
                  <Button size="lg" asChild className="text-lg px-8 py-3">
                    <Link href="/booking">Book a Service</Link>
                  </Button>
                </MotionItem>
                <MotionItem variants={popCard}>
                  <Button size="lg" asChild variant="outline" className="text-lg px-8 py-3">
                    <Link href="/apply">Find Full-Time Help</Link>
                  </Button>
                </MotionItem>
              </div>

              {/* Service Icons */}
              <StaggerList className="flex flex-wrap justify-center lg:justify-start gap-4">
                {services.map((service) => (
                  <MotionItem key={service.label} variants={popCard}>
                    <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                      <service.icon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">{service.label}</span>
                    </div>
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
                <SafeImage
                  src={IMAGES.hero}
                  alt="Professional cleaning service"
                  width={800}
                  height={600}
                  className="rounded-2xl shadow-2xl"
                  priority
                />
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
                <Link href="/how-it-works">
                  <Play className="w-5 h-5 mr-2" />
                  See How It Works
                </Link>
              </Button>
            </MotionItem>
          </div>
        </div>
      </MotionSection>

      {/* Full-Time Help */}
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

      {/* Manage Hub */}
      <MotionSection className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <MotionItem variants={slideInLeft}>
              <SafeImage
                src={IMAGES.dashboard}
                alt="Dashboard interface"
                width={600}
                height={400}
                className="rounded-2xl shadow-xl"
              />
            </MotionItem>
            
            <div>
              <MotionItem variants={fadeUp}>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  Your home, your dashboard
                </h2>
              </MotionItem>
              
              <MotionItem variants={fadeUp}>
                <p className="text-lg text-gray-600 mb-8">
                  Track bookings, reschedule, chat with your cleaner, and view invoices in one place.
                </p>
              </MotionItem>
              
              <MotionItem variants={popCard}>
                <Button size="lg" asChild className="group">
                  <Link href="/account">
                    Explore the Hub
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
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
                <Button variant="outline" className="relative group">
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
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        fallbackSrc={IMAGES.profile}
                      />
                    </div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{member.cleans}</p>
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
                <p className="text-lg text-gray-600 mb-8">
                  Set your schedule, grow your income, and get paid on time.
                </p>
              </MotionItem>
              
              <MotionItem variants={popCard}>
                <Button size="lg" asChild className="group">
                  <Link href="/apply">
                    Apply to Work
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </MotionItem>
            </div>
            
            <MotionItem variants={slideInRight}>
              <div className="relative">
                <SafeImage
                  src={IMAGES.cleaner}
                  alt="Professional cleaner"
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
                <span className="text-gray-500 text-2xl font-semibold grayscale hover:grayscale-0 transition-all">
                  {partner}
                </span>
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
                <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group">
                  <div className="relative h-48 w-full overflow-hidden">
                    <SafeImage
                      src={post.image}
                      alt={post.title}
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
              </MotionItem>
            ))}
          </StaggerList>
        </div>
      </MotionSection>
    </main>
  );
}