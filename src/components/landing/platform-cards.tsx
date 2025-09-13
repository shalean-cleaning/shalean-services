"use client";

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Home } from 'lucide-react'

const platforms = [
  {
    icon: Calendar,
    title: 'Bookings',
    description: 'Schedule one-time or recurring cleaning services with trusted professionals.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Users,
    title: 'Placements',
    description: 'Find full-time housekeepers, nannies, and caregivers for your home.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Home,
    title: 'MyHome Hub',
    description: 'Manage all your home services and bookings in one convenient place.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
]

export default function PlatformCards() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className={`mx-auto w-16 h-16 ${platform.bgColor} rounded-full flex items-center justify-center mb-4`}>
                    <platform.icon className={`h-8 w-8 ${platform.color}`} />
                  </div>
                  <CardTitle className="text-xl">{platform.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base">
                    {platform.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}