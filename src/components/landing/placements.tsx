"use client";

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Baby, Heart } from 'lucide-react'

const placements = [
  {
    icon: Home,
    title: 'Full-time Housekeeper',
    description: 'Professional housekeeping services for your home maintenance needs.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    icon: Baby,
    title: 'Full-time Nanny',
    description: 'Experienced childcare professionals for your family.',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    buttonColor: 'bg-pink-600 hover:bg-pink-700',
  },
  {
    icon: Heart,
    title: 'Full-time Carer',
    description: 'Compassionate caregivers for elderly family members.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    buttonColor: 'bg-red-600 hover:bg-red-700',
  },
]

export default function Placements() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {placements.map((placement, index) => (
            <motion.div
              key={placement.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className={`mx-auto w-16 h-16 ${placement.bgColor} rounded-full flex items-center justify-center mb-4`}>
                    <placement.icon className={`h-8 w-8 ${placement.color}`} />
                  </div>
                  <CardTitle className="text-xl">{placement.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base mb-6">
                    {placement.description}
                  </CardDescription>
                  <Button 
                    className={`w-full ${placement.buttonColor} text-white`}
                    size="lg"
                  >
                    Learn more
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}