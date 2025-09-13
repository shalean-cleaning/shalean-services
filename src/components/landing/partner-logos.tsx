  "use client";

import { motion } from 'framer-motion'

const partners = [
  'Airbnb',
  'Booking.com',
  'Property24',
  'Private Property',
  'Gumtree',
  'OLX',
  'Facebook',
]

export default function PartnerLogos() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Trusted by leading platforms
          </h2>
          <p className="text-gray-600">
            We partner with South Africa&apos;s most trusted property and service platforms
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 items-center"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center justify-center"
            >
              <div className="h-16 w-32 bg-white rounded-lg shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
                <span className="text-sm font-medium text-gray-600 grayscale hover:grayscale-0 transition-all">
                  {partner}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}