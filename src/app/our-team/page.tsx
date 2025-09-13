import { ChevronRight, Users, Award, Heart } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Our Team',
  description: 'Meet the dedicated team behind Shalean Cleaning Services and learn about our commitment to excellence.',
}

export default function OurTeamPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span>Our Team</span>
      </nav>

      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Our Team</h1>
        
        <div className="text-xl text-gray-600 mb-12">
          Meet the dedicated professionals who make Shalean Cleaning Services the trusted choice for home care.
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Leadership Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">Image</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Sarah Johnson</h3>
              <p className="text-primary font-medium mb-2">Founder & CEO</p>
              <p className="text-sm text-gray-600">
                With over 10 years in the home services industry, Sarah founded Shalean to bring 
                reliable, professional care to every home.
              </p>
            </div>
            <div className="text-center">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">Image</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Michael Chen</h3>
              <p className="text-primary font-medium mb-2">Operations Director</p>
              <p className="text-sm text-gray-600">
                Michael ensures every service meets our high standards through rigorous training 
                and quality control processes.
              </p>
            </div>
            <div className="text-center">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">Image</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Lisa Williams</h3>
              <p className="text-primary font-medium mb-2">Customer Success Manager</p>
              <p className="text-sm text-gray-600">
                Lisa leads our customer support team, ensuring every client receives exceptional 
                service and support.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trust</h3>
              <p className="text-gray-600">
                We build lasting relationships through transparency, reliability, and consistent quality.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">
                We strive for the highest standards in everything we do, from service delivery to customer care.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Care</h3>
              <p className="text-gray-600">
                We treat every home and family with the same care and respect we would want for our own.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join Our Team</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            We&apos;re always looking for dedicated professionals who share our commitment to excellence. 
            If you&apos;re passionate about providing exceptional home care services, we&apos;d love to hear from you.
          </p>
          <Link 
            href="/apply" 
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Apply Now
          </Link>
        </section>
      </div>
    </div>
  )
}