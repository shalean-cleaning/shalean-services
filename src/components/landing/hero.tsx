'use client'

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

export default function Hero() {
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
              All the help your home needs.
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Professional cleaning services, trusted housekeepers, and reliable home care solutions. 
              From one-time cleans to full-time help, we&apos;ve got you covered.
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
              <Link href="/quote">
                Get a Free Quote
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-lg px-8 py-3">
              <Link href="/apply">
                Find Full-Time Help
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}