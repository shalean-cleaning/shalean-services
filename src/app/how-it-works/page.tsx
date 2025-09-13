import { ChevronRight, CheckCircle, Clock, Users } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'How It Works',
  description: 'Learn how easy it is to get the home care services you need with Shalean Cleaning Services.',
}

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span>How It Works</span>
      </nav>

      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">How It Works</h1>
        
        <div className="text-xl text-gray-600 mb-12">
          Getting your home in order has never been easier. Here&apos;s how our simple process works:
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose</h3>
            <p className="text-gray-600">
              Select the services you need from our comprehensive range of home care solutions.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Book</h3>
            <p className="text-gray-600">
              Schedule your service at a time that works for you through our easy booking system.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage</h3>
            <p className="text-gray-600">
              Track your bookings, communicate with your service provider, and manage everything from one place.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            ▶ Watch how it works
          </button>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Why Choose Our Process?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Simple & Fast</h3>
              <p className="text-gray-600">
                Our streamlined booking process gets you connected with the right service provider in minutes, not hours.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trusted Professionals</h3>
              <p className="text-gray-600">
                All our service providers are vetted, background-checked, and trained to deliver exceptional results.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600">
                Book one-time services or set up recurring appointments that fit your schedule perfectly.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">
                We stand behind every service with our satisfaction guarantee and ongoing support.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}