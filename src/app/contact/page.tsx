import { ChevronRight, Mail, Phone, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Shalean Cleaning Services. We\'re here to help with all your home care needs.',
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span>Contact</span>
      </nav>

      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
        
        <div className="text-xl text-gray-600 mb-12">
          We&apos;re here to help with all your home care needs. Get in touch with us today.
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Phone</h3>
                  <p className="text-gray-600 mb-2">+27 12 345 6789</p>
                  <p className="text-sm text-gray-500">Mon-Fri: 8AM-6PM, Sat: 9AM-4PM</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600 mb-2">hello@shalean.co.za</p>
                  <p className="text-sm text-gray-500">We&apos;ll respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Office</h3>
                  <p className="text-gray-600 mb-2">
                    123 Business Street<br />
                    Johannesburg, 2000<br />
                    South Africa
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Business Hours</h3>
                  <div className="text-gray-600 text-sm space-y-1">
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Placeholder */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="text-gray-500 mb-4">
                <Mail className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Contact Form Coming Soon</p>
                <p className="text-sm">
                  We&apos;re working on a contact form. In the meantime, please reach out to us via phone or email.
                </p>
              </div>
              <div className="space-y-3">
                <Link 
                  href="tel:+27123456789"
                  className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Call Us Now
                </Link>
                <Link 
                  href="mailto:hello@shalean.co.za"
                  className="block w-full px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Send Email
                </Link>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I book a service?</h3>
              <p className="text-gray-600">
                You can book a service by calling us at +27 12 345 6789 or by getting a free quote online. 
                Our team will help you choose the right service and schedule it at your convenience.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What areas do you serve?</h3>
              <p className="text-gray-600">
                We currently serve Johannesburg and surrounding areas. Contact us to confirm if we cover your location.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Are your service providers insured?</h3>
              <p className="text-gray-600">
                Yes, all our service providers are fully insured and bonded. We also conduct thorough background 
                checks and reference verification for your peace of mind.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}