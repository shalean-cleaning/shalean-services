"use client";

import { motion } from 'framer-motion'
import { Shield, Users, Award, FileCheck } from 'lucide-react'

const trustFeatures = [
  {
    icon: Shield,
    title: 'Background Checks',
    description: 'All cleaners undergo comprehensive background verification',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Users,
    title: 'References',
    description: 'Verified references from previous clients and employers',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Award,
    title: 'Years Experience',
    description: 'Minimum 2+ years of professional cleaning experience',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: FileCheck,
    title: 'Insurance Coverage',
    description: 'Fully insured and bonded for your peace of mind',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
]

export default function SafetyTrust() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Your safety and trust matter
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We take security seriously. Every cleaner in our network is thoroughly vetted and verified.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className={`mx-auto w-20 h-20 ${feature.bgColor} rounded-full flex items-center justify-center mb-6`}>
                <feature.icon className={`h-10 w-10 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}