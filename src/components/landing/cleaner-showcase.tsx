"use client";

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const cleaners = [
  {
    name: 'Sarah Johnson',
    role: 'Senior Cleaner',
    rating: 4.9,
    review: 'Absolutely amazing service! My home has never been cleaner.',
    badge: 'Top Rated',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    image: 'SJ',
  },
  {
    name: 'Maria Santos',
    role: 'Housekeeper',
    rating: 4.8,
    review: 'Professional, reliable, and thorough. Highly recommended!',
    badge: 'Most Booked',
    badgeColor: 'bg-blue-100 text-blue-800',
    image: 'MS',
  },
  {
    name: 'Grace Mthembu',
    role: 'Deep Clean Specialist',
    rating: 5.0,
    review: 'Attention to detail is incredible. Worth every penny.',
    badge: 'Expert',
    badgeColor: 'bg-purple-100 text-purple-800',
    image: 'GM',
  },
  {
    name: 'Lisa Chen',
    role: 'Nanny & Cleaner',
    rating: 4.9,
    review: 'Perfect combination of childcare and cleaning expertise.',
    badge: 'Family Favorite',
    badgeColor: 'bg-pink-100 text-pink-800',
    image: 'LC',
  },
]

export default function CleanerShowcase() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Meet some of your Shalean Stars
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our carefully vetted professionals are ready to make your home sparkle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cleaners.map((cleaner, index) => (
            <motion.div
              key={cleaner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-gray-700">{cleaner.image}</span>
                  </div>
                  <div className="flex items-center justify-center mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cleaner.badgeColor}`}>
                      {cleaner.badge}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{cleaner.name}</CardTitle>
                  <CardDescription>{cleaner.role}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(cleaner.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{cleaner.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600 italic">&quot;{cleaner.review}&quot;</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="cleaning">Regular Cleaning</SelectItem>
              <SelectItem value="deep-clean">Deep Cleaning</SelectItem>
              <SelectItem value="nanny">Nanny Services</SelectItem>
              <SelectItem value="elder-care">Elder Care</SelectItem>
            </SelectContent>
          </Select>
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href="/quote">
              Book a Service
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
            <Link href="/apply">
              Apply for Work
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}