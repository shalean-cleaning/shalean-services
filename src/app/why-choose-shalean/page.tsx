import { ChevronRight, Shield, Star, Clock, Users } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Why Choose Shalean',
  description: 'Discover why Shalean Cleaning Services is the trusted choice for professional home care solutions.',
}

export default function WhyChooseShaleanPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span>Why Choose Shalean</span>
      </nav>

      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Shalean?</h1>
        
        <div className="text-xl text-gray-600 mb-12">
          We&apos;re more than just a cleaning service. We&apos;re your trusted partner in creating a comfortable, 
          well-maintained home that you can be proud of.
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">What Sets Us Apart</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Background Checks</h3>
                <p className="text-gray-600">
                  Every team member undergoes comprehensive background checks and reference verification 
                  to ensure your home and family are safe.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Years of Experience</h3>
                <p className="text-gray-600">
                  Our team brings decades of combined experience in home care, ensuring professional 
                  service delivery every time.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reliable References</h3>
                <p className="text-gray-600">
                  All our service providers come with verified references from previous clients, 
                  giving you confidence in their abilities.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Insurance Coverage</h3>
                <p className="text-gray-600">
                  We&apos;re fully insured and bonded, providing you with complete peace of mind 
                  and protection for your property.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Service Promise</h2>
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <p className="text-gray-600">Satisfaction Guarantee</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <p className="text-gray-600">Customer Support</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">5★</div>
                <p className="text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Comprehensive Services</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            From one-time deep cleans to ongoing maintenance, from childcare to elder care, 
            we offer a complete range of home services designed to meet all your needs.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Regular and deep cleaning services</li>
              <li>Outdoor maintenance and cleaning</li>
              <li>Laundry and ironing</li>
              <li>Nanny and childcare services</li>
            </ul>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Elder care and assistance</li>
              <li>Move-in and move-out cleaning</li>
              <li>Airbnb preparation</li>
              <li>Custom service packages</li>
            </ul>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Experience the Difference?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of satisfied customers who trust Shalean for their home care needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/quote" 
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get a Free Quote
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}