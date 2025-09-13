"use client";

import { motion } from 'framer-motion'
import { Home, Calendar, Users, Settings } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function MyHomeHub() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Illustration placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Home className="h-24 w-24 text-purple-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Bookings</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Services</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Settings className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Settings</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Home className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Home</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Your home management hub
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Manage all your home services, bookings, and preferences in one convenient place. 
              Track your cleaners, schedule services, and keep your home running smoothly.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                <span className="text-gray-700">Centralized booking management</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                <span className="text-gray-700">Service history and reviews</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                <span className="text-gray-700">Personalized recommendations</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                <span className="text-gray-700">Easy communication with cleaners</span>
              </div>
            </div>
            <Button size="lg" asChild className="text-lg px-8 py-3">
              <Link href="/hub">
                Explore MyHome Hub
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}