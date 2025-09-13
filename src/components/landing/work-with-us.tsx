"use client";

import { motion } from 'framer-motion'
import { Users, DollarSign, Clock, Heart } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function WorkWithUs() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-r from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Join our team of professionals
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Become part of South Africa&apos;s leading home services platform. 
              We offer flexible work opportunities, competitive rates, and a supportive community.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Competitive Pay</h3>
                  <p className="text-sm text-gray-600">Earn what you deserve</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Flexible Hours</h3>
                  <p className="text-sm text-gray-600">Work when you want</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Supportive Community</h3>
                  <p className="text-sm text-gray-600">Join a caring team</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Make a Difference</h3>
                  <p className="text-sm text-gray-600">Help families thrive</p>
                </div>
              </div>
            </div>
            
            <Button size="lg" asChild className="text-lg px-8 py-3">
              <Link href="/apply">
                Apply Now
              </Link>
            </Button>
          </motion.div>

          {/* Right side - Photo placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="aspect-[4/5] bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-24 w-24 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700">Join Our Team</p>
                  <p className="text-sm text-gray-500">Professional cleaners wanted</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}