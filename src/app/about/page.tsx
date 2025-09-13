import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'About Us',
  description: 'Learn about Shalean Cleaning Services and our commitment to providing exceptional home care solutions.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span>About</span>
      </nav>

      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Shalean Cleaning Services</h1>
        
        <div className="text-xl text-gray-600 mb-8">
          We&apos;re dedicated to providing exceptional home care solutions that make your life easier.
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            At Shalean Cleaning Services, we believe that everyone deserves a clean, comfortable home. 
            Our mission is to provide reliable, professional home care services that give you peace of mind 
            and more time to focus on what matters most to you.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We offer a comprehensive range of home services including:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Professional cleaning services</li>
            <li>Deep cleaning and maintenance</li>
            <li>Outdoor cleaning and maintenance</li>
            <li>Laundry and ironing services</li>
            <li>Nanny and childcare services</li>
            <li>Elder care and assistance</li>
            <li>Move-in and move-out cleaning</li>
            <li>Airbnb preparation services</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
          <p className="text-gray-700 leading-relaxed">
            Every member of our team undergoes thorough background checks and training to ensure 
            the highest standards of service. We&apos;re committed to building long-term relationships 
            with our clients based on trust, reliability, and exceptional service quality.
          </p>
        </section>
      </div>
    </div>
  )
}