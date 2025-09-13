"use client";

import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Home, 
  Shirt, 
  Baby, 
  Heart, 
  Truck, 
  Calendar,
  Shield
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { useHeroContent } from '@/hooks/useHomepageData'

const services = [
  { icon: Home, label: 'Cleaning', color: 'text-blue-600' },
  { icon: Sparkles, label: 'Deep Clean', color: 'text-purple-600' },
  { icon: Shield, label: 'Outdoor', color: 'text-green-600' },
  { icon: Shirt, label: 'Laundry/Ironing', color: 'text-orange-600' },
  { icon: Baby, label: 'Nanny', color: 'text-pink-600' },
  { icon: Heart, label: 'Elder Care', color: 'text-red-600' },
  { icon: Truck, label: 'Move-In/Out', color: 'text-indigo-600' },
  { icon: Calendar, label: 'Airbnb', color: 'text-teal-600' },
]

export default function DynamicHero() {
  const { data: heroContent, isLoading, isError, error } = useHeroContent()
  
  if (isLoading) {
    return (
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="h-16 bg-gray-200 rounded animate-pulse mb-6 max-w-4xl mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-12 max-w-3xl mx-auto"></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 mb-12">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="h-12 bg-gray-200 rounded animate-pulse w-48"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse w-48"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (isError) {
    console.error('Hero error:', error)
    return (
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="py-8 text-destructive">
              We&apos;re having trouble loading this section.
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!heroContent) return null
  
  // Fallback content if database is not available
  const title = heroContent?.title || 'All the help your home needs.'
  const description = heroContent?.description || 'Professional cleaning services, trusted housekeepers, and reliable home care solutions. From one-time cleans to full-time help, we\'ve got you covered.'
  
  const ctaData = heroContent?.metadata as { 
    cta_primary?: string
    cta_secondary?: string
    cta_primary_link?: string
    cta_secondary_link?: string
  } || {}
  
  const primaryCta = ctaData.cta_primary || 'Get a Free Quote'
  const secondaryCta = ctaData.cta_secondary || 'Apply to Work'
  const primaryLink = ctaData.cta_primary_link || '/quote'
  const secondaryLink = ctaData.cta_secondary_link || '/apply'

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {title}
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              {description}
            </p>
          </motion.div>

          {/* Service Icons Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 mb-12"
          >
            {services.map((service, index) => (
              <motion.div
                key={service.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <service.icon className={`h-8 w-8 ${service.color} mb-2`} />
                <span className="text-sm font-medium text-gray-700 text-center">
                  {service.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" asChild className="text-lg px-8 py-3">
              <Link href={primaryLink}>
                {primaryCta}
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-lg px-8 py-3">
              <Link href={secondaryLink}>
                {secondaryCta}
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
